const { ImageKit } = require("@imagekit/nodejs");

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    
});

async function uploadToImageKit(fileBase64) {
    const result = await imagekit.files.upload({
        // ImageKit expects base64 string without data-url prefix
        file: fileBase64,
        fileName: "music_" + Date.now(),
        folder: "/yt-complete-backend/music",
    });

    return result;
}


module.exports = { uploadToImageKit };