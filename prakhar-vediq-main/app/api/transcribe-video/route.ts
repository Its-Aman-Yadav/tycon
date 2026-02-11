import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";
import { pipeline } from "stream";
import { promisify } from "util";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { db } from "@/lib/firebase-admin"; // Import server-side db

// Configure ffmpeg path with fallback
// Configure ffmpeg path with fallback
const getFfmpegPath = () => {
    try {
        const possiblePaths: string[] = [];

        // 1. Try what the library gives us (if it's a valid local path)
        if (ffmpegPath && fs.existsSync(ffmpegPath)) {
            console.log("✅ Using ffmpeg from import:", ffmpegPath);
            return ffmpegPath;
        }

        // 2. Try looking in node_modules relative to CWD
        possiblePaths.push(path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg'));
        possiblePaths.push(path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'));

        // 3. Try require.resolve
        try {
            // @ts-ignore
            if (typeof require !== 'undefined' && require.resolve) {
                // @ts-ignore
                const pkg = require.resolve('ffmpeg-static');
                const dir = path.dirname(pkg);
                possiblePaths.push(path.join(dir, 'ffmpeg'));
                possiblePaths.push(path.join(dir, 'ffmpeg.exe'));
            }
        } catch (e) {
            // ignore
        }

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                console.log("✅ Found ffmpeg at:", p);
                return p;
            }
        }

        console.warn("⚠️ ffmpeg-static binary not found in standard locations - falling back to system 'ffmpeg'");
        return "ffmpeg";
    } catch (err) {
        console.error("❌ Error resolving ffmpeg path:", err);
        return "ffmpeg";
    }
};

const configuredFfmpegPath = getFfmpegPath();
if (configuredFfmpegPath) {
    ffmpeg.setFfmpegPath(configuredFfmpegPath);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const streamPipeline = promisify(pipeline);

export const maxDuration = 300; // Extend timeout for long videos if allowed by platform

export async function POST(req: NextRequest) {
    let tempInputPath: string | null = null;
    let tempOutputPath: string | null = null;
    let tempChunks: string[] = [];

    try {
        console.log("📥 Received transcription request");
        // Log ffmpeg path for debugging
        console.log("🛠️ Using ffmpeg binary at:", configuredFfmpegPath);

        const { videoUrl, courseId, moduleIndex, videoIndex } = await req.json();
        console.log("🔗 Video URL:", videoUrl);

        if (!videoUrl) {
            return NextResponse.json({ error: "Missing videoUrl" }, { status: 400 });
        }

        // 1. Stream download to temp file
        console.log("📡 Streaming video from URL to disk...");
        const videoRes = await fetch(videoUrl);
        if (!videoRes.ok) throw new Error("Failed to fetch video");
        if (!videoRes.body) throw new Error("No body in response");

        const tempDir = os.tmpdir();
        const uniqueId = Math.random().toString(36).substring(7);
        tempInputPath = path.join(tempDir, `input-${uniqueId}.mp4`);
        tempOutputPath = path.join(tempDir, `output-${uniqueId}.mp3`);

        // @ts-ignore
        await streamPipeline(videoRes.body, fs.createWriteStream(tempInputPath));
        console.log("✅ Video downloaded to:", tempInputPath);

        // 2. Extract and Compress Audio
        console.log("🎧 Extracting compressed audio...");
        await new Promise((resolve, reject) => {
            const command = ffmpeg(tempInputPath!);
            if (configuredFfmpegPath) command.setFfmpegPath(configuredFfmpegPath);

            command
                .toFormat("mp3")
                .audioBitrate("32k")
                .on("end", resolve)
                .on("error", (err) => {
                    console.error("FFmpeg error:", err);
                    reject(err);
                })
                .save(tempOutputPath!);
        });

        const stats = fs.statSync(tempOutputPath);
        const fileSizeMB = stats.size / (1024 * 1024);
        console.log(`✅ Audio extracted. Size: ${fileSizeMB.toFixed(2)} MB`);

        let transcriptionText = "";

        // 3. Check for chunking (OpenAI limit is 25MB)
        if (fileSizeMB > 24) {
            console.log("⚠️ File exceeds 25MB limit. Splitting into chunks...");
            const chunkDuration = 500; // ~ 8.3 minutes per chunk (safe size) - approx 2MB at 32k bitrate

            await new Promise((resolve, reject) => {
                const command = ffmpeg(tempOutputPath!);
                if (configuredFfmpegPath) command.setFfmpegPath(configuredFfmpegPath);

                command
                    .outputOptions([
                        `-f segment`,
                        `-segment_time ${chunkDuration}`,
                        `-c copy`
                    ])
                    .save(path.join(tempDir, `chunk-${uniqueId}-%03d.mp3`))
                    .on("end", resolve)
                    .on("error", reject);
            });

            // Find all chunk files
            const files = fs.readdirSync(tempDir).filter(f => f.startsWith(`chunk-${uniqueId}-`) && f.endsWith(".mp3"));
            tempChunks = files.map(f => path.join(tempDir, f)).sort();
            console.log(`🧩 Split into ${tempChunks.length} chunks.`);

            // Transcribe each chunk
            for (const [index, chunkPath] of tempChunks.entries()) {
                console.log(`🧠 Transcribing chunk ${index + 1}/${tempChunks.length}...`);
                const chunkResponse = await openai.audio.transcriptions.create({
                    file: fs.createReadStream(chunkPath),
                    model: "whisper-1",
                    response_format: "text",
                });
                transcriptionText += (chunkResponse as unknown as string) + " ";
            }
        } else {
            console.log("🧠 Sending to OpenAI Whisper API...");
            transcriptionText = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempOutputPath),
                model: "whisper-1",
                response_format: "text",
            }) as unknown as string;
        }

        const finalTranscription = transcriptionText.trim();
        console.log("✅ Transcription complete");

        // 4. Server-Side Persistence (Robust Save)
        if (courseId && typeof moduleIndex === 'number' && typeof videoIndex === 'number') {
            try {
                console.log(`💾 Persisting transcription to Firestore for Course ${courseId} (Module ${moduleIndex}, Video ${videoIndex})...`);
                const courseRef = db.collection("courses").doc(courseId);
                await db.runTransaction(async (t) => {
                    const docT = await t.get(courseRef);
                    if (!docT.exists) {
                        throw new Error(`Course ${courseId} not found`);
                    }

                    const data = docT.data() || {};
                    const modules = data.modules || [];

                    // Verify indices exist to be safe
                    if (modules[moduleIndex] && modules[moduleIndex].materials && modules[moduleIndex].materials[videoIndex]) {
                        // Update the transcription in memory
                        modules[moduleIndex].materials[videoIndex].transcription = finalTranscription;

                        // Write back to Firestore
                        t.update(courseRef, { modules });
                        console.log("✅ Saved to Firestore successfully (Server-side Transaction)");
                    } else {
                        console.warn("⚠️ Could not find target video in modules array structure");
                    }
                });
            } catch (dbError) {
                console.error("❌ Failed to save to Firestore on server:", dbError);
                // We do NOT throw here because we still want to return the transcription to the client if possible
            }
        }

        return NextResponse.json({ transcription: finalTranscription });

    } catch (error: any) {
        console.error("❌ Transcription failed:", error);
        return NextResponse.json(
            { error: error.message || "Unknown error" },
            { status: 500 }
        );
    } finally {
        // 5. Cleanup
        try {
            if (tempInputPath && fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
            if (tempOutputPath && fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
            tempChunks.forEach(chunk => {
                if (fs.existsSync(chunk)) fs.unlinkSync(chunk);
            });
        } catch (cleanupError) {
            console.error("Cleanup error:", cleanupError);
        }
    }
}
