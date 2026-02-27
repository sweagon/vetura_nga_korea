// scripts/generate-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 57, 60, 72, 76, 96, 114, 120, 128, 144, 152, 180, 192, 384, 512];
const inputImage = path.join(__dirname, '../public/favicon.webp');
const outputDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating favicon icons...\n');

// Generate all icon sizes
Promise.all(sizes.map(size =>
    sharp(inputImage)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
        .then(() => console.log(`✅ Generated ${size}x${size} icon`))
        .catch(err => console.error(`❌ Error generating ${size}x${size}:`, err))
)).then(() => {
    console.log('\n📊 Summary:');
    console.log(`   Generated ${sizes.length} icons`);
    console.log(`   Location: ${outputDir}`);
}).catch(err => console.error('Error:', err));

// Generate favicon.ico (multi-size)
sharp(inputImage)
    .resize(32, 32)
    .toFile(path.join(__dirname, '../public/favicon.ico'))
    .then(() => console.log('\n✅ Generated favicon.ico'))
    .catch(err => console.error('❌ Error generating favicon:', err));

// Generate apple-touch-icon (180x180 is standard)
sharp(inputImage)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'))
    .then(() => console.log('✅ Generated apple-touch-icon.png'))
    .catch(err => console.error('❌ Error generating apple touch icon:', err));