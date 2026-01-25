import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { motherImage, fatherImage, gender } = await req.json();

        if (!motherImage || !fatherImage) {
            return NextResponse.json({ error: "Missing images" }, { status: 400 });
        }

        // Step 1: Analyze parents using Gemini 2.0 Flash (Multimodal)
        // Using gemini-2.0-flash as it's the stable high-performance model available
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });

        const genderInstruction = gender === 'boy' ? "a baby boy" : gender === 'girl' ? "a baby girl" : "a baby";

        const prompt = `
      Analyze these two images: the first is the mother and the second is the father.
      Identify their key facial features (eye color, face shape, nose, hair, etc.).
      Then, create a very detailed, high-quality prompt for an image generation model to generate a photo of their baby.
      The prompt should describe ${genderInstruction} (around 1 year old) that is a perfect blend of both parents. 
      The style should be a professional, studio-quality, realistic portrait.
      Only return the prompt for the image generation model.
    `;

        // Function to extract base64 and mime type
        const parseImage = (dataUrl: string) => {
            const matches = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
            if (!matches) return { mimeType: "image/jpeg", data: dataUrl.split(",")[1] };
            return { mimeType: matches[1], data: matches[2] };
        };

        const mother = parseImage(motherImage);
        const father = parseImage(fatherImage);

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: mother.data,
                    mimeType: mother.mimeType,
                },
            },
            {
                inlineData: {
                    data: father.data,
                    mimeType: father.mimeType,
                },
            },
        ]);

        const babyDescriptionPrompt = result.response.text();
        console.log("Baby Description Prompt:", babyDescriptionPrompt);

        // Step 2: Generate the baby photo using the description
        // Use gemini-2.5-flash-image which is optimized for this task
        const imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        const imageResult = await imageModel.generateContent(babyDescriptionPrompt);
        const response = await imageResult.response;

        console.log("Image Generation Response:", JSON.stringify(response, null, 2));

        // Robust part checking
        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            throw new Error(`No candidates or parts returned from ${imageModel.model}`);
        }

        const imagePart = candidate.content.parts.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            return NextResponse.json({
                image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
                description: babyDescriptionPrompt
            });
        }

        // If no image but we have text, returning that might help debug
        const textPart = candidate.content.parts.find(part => part.text);
        if (textPart && textPart.text) {
            console.log("Model returned text instead of image:", textPart.text);
            throw new Error(`Model returned text description instead of an image: ${textPart.text.substring(0, 100)}...`);
        }

        throw new Error("No image data found in the AI response.");

    } catch (error: any) {
        console.error("CRITICAL API ERROR:", error);

        // Return the actual error message to the frontend so the user can see it
        return NextResponse.json({
            error: error.message || "An unknown error occurred",
            details: error.stack
        }, { status: 500 });
    }
}
