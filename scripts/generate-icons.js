const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;
const path = require('path');
const fs = require('fs');

const sizes = [32, 192, 512];
const ogSize = { width: 1200, height: 630 };
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

  // Generate apple-icon.png (180x180)
  const appleIconPath = path.join(outputDir, 'apple-icon.png');
  await sharp(inputPng)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(appleIconPath);
  console.log('Generated: apple-icon.png');

  // Copy 32x32 to light and dark variants (same icon for both)
  const icon32Path = path.join(outputDir, 'icon-32x32.png');
  await sharp(inputPng)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(icon32Path);

  fs.copyFileSync(icon32Path, path.join(outputDir, 'icon-light-32x32.png'));
  fs.copyFileSync(icon32Path, path.join(outputDir, 'icon-dark-32x32.png'));
  console.log('Generated: icon-light-32x32.png, icon-dark-32x32.png');

  // Generate favicon.ico from multiple sizes
  const favicon16Path = path.join(outputDir, 'favicon-16x16.png');
  await sharp(inputPng)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(favicon16Path);

  const icoBuffer = await pngToIco([favicon16Path, icon32Path]);
  const faviconPath = path.join(__dirname, '../app/favicon.ico');
  fs.writeFileSync(faviconPath, icoBuffer);
  console.log('Generated: app/favicon.ico');

  // Clean up temp favicon PNGs
  fs.unlinkSync(favicon16Path);
  fs.unlinkSync(icon32Path);

  console.log('Done! PWA icons generated.');
}

async function generateOGImage() {
  const usePng = fs.existsSync(inputPng);
  const outputPath = path.join(outputDir, 'og-image.png');

  // Create OG image with neutral background and centered icon
  const iconSize = 180;

  // Colors matching the app theme
  const bgColor = '#f8f9fc'; // App background color
  const textColor = '#0f172a'; // Slate 900 for title
  const subtextColor = '#64748b'; // Slate 500 for subtitle

  // Create background SVG with neutral colors and sans-serif font
  const bgSvg = `
    <svg width="${ogSize.width}" height="${ogSize.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="420" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="64" font-weight="600" fill="${textColor}">Mindshift</text>
      <text x="50%" y="480" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="400" fill="${subtextColor}">Quit Negative Thinking</text>
    </svg>
  `;

  // Create background
  const background = await sharp(Buffer.from(bgSvg))
    .png()
    .toBuffer();

  // Prepare icon
  let iconBuffer;
  if (usePng) {
    iconBuffer = await sharp(inputPng)
      .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  } else {
    let svgContent = fs.readFileSync(inputSvg, 'utf8');
    svgContent = svgContent
      .replace(/<style>[\s\S]*?<\/style>/, '')
      .replace('class="background"', 'fill="#7c3aed"')
      .replace(/class="foreground"/g, 'fill="white"');

    iconBuffer = await sharp(Buffer.from(svgContent))
      .resize(iconSize, iconSize)
      .png()
      .toBuffer();
  }

  // Composite icon onto background
  await sharp(background)
    .composite([{
      input: iconBuffer,
      top: Math.floor((ogSize.height - iconSize) / 2) - 80,
      left: Math.floor((ogSize.width - iconSize) / 2),
    }])
    .png()
    .toFile(outputPath);

  console.log('Generated: og-image.png');
}

async function main() {
  await generateIcons();
  await generateOGImage();
}

main().catch(console.error);
