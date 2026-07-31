const sharp = require("sharp");

async function preprocessScheduleImage(inputBuffer) {
  // Your sample image is rotated and document-like,
  // so this pipeline tries to make text/table structure easier to read.
  const buffer = await sharp(inputBuffer)
    .rotate() // auto-orient using EXIF if present
    .resize({ width: 1800, withoutEnlargement: true })
    .grayscale()
    .normalize()
    .sharpen()
    .jpeg({ quality: 90 })
    .toBuffer();

  return {
    buffer,
    mimeType: "image/jpeg",
  };
}

module.exports = { preprocessScheduleImage };
