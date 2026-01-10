const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [192, 512];
const inputSvg = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

// Create a simple colored icon with the Mindshift "M" branding
async function generateIcons() {
  // Read the SVG and modify it to have a fixed purple background
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

  console.log('Done! PWA icons generated.');
}

generateIcons().catch(console.error);
