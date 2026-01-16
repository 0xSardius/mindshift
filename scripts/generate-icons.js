const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [192, 512];
const inputPng = path.join(__dirname, '../public/icon-source.png');
const inputSvg = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  // Prefer PNG source if it exists, otherwise fall back to SVG
  const usePng = fs.existsSync(inputPng);

  if (usePng) {
    console.log('Using PNG source: icon-source.png');
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

      await sharp(inputPng)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(outputPath);

      console.log(`Generated: icon-${size}x${size}.png`);
    }
  } else {
    console.log('Using SVG source: icon.svg');
    let svgContent = fs.readFileSync(inputSvg, 'utf8');

    // Replace the dynamic color scheme with fixed purple theme
    svgContent = svgContent
      .replace(/<style>[\s\S]*?<\/style>/, '')
      .replace('class="background"', 'fill="#7c3aed"')
      .replace(/class="foreground"/g, 'fill="white"');

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`Generated: icon-${size}x${size}.png`);
    }
  }

  console.log('Done! PWA icons generated.');
}

generateIcons().catch(console.error);
