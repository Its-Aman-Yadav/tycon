const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

console.log('--- DEBUG INFO ---');
console.log('require("ffmpeg-static") returns:', ffmpegPath);
console.log('Type:', typeof ffmpegPath);
if (ffmpegPath) {
    console.log('fs.existsSync(ffmpegPath) returns:', fs.existsSync(ffmpegPath));
    try {
        const stats = fs.statSync(ffmpegPath);
        console.log('File stats:', stats);
        console.log('Is valid file:', stats.isFile());
    } catch (e) {
        console.log('fs.statSync failed:', e.message);
    }
} else {
    console.log('ffmpegPath is null/undefined');
}
console.log('Current working directory:', process.cwd());
console.log('--- END DEBUG INFO ---');
