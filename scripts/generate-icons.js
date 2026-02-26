const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputImage = path.join(__dirname, '../public/logo.jpg');
const outputDir = path.join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons for each size
sizes.forEach(size => {
    sharp(inputImage)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
        .then(() => console.log(`Generated ${size}x${size} icon`))
        .catch(err => console.error(`Error generating ${size}x${size}:`, err));
});

// Generate favicon.ico (multiple sizes)
sharp(inputImage)
    .resize(32, 32)
    .toFile(path.join(__dirname, '../public/favicon.ico'))
    .then(() => console.log('Generated favicon.ico'))
    .catch(err => console.error('Error generating favicon:', err));

// Generate Apple touch icon
sharp(inputImage)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'))
    .then(() => console.log('Generated apple-touch-icon.png'))
    .catch(err => console.error('Error generating apple touch icon:', err));

// Generate og-image.jpg for social sharing
sharp(inputImage)
    .resize(1200, 630)
    .jpeg()
    .toFile(path.join(__dirname, '../public/og-image.jpg'))
    .then(() => console.log('Generated og-image.jpg'))
    .catch(err => console.error('Error generating og-image:', err));