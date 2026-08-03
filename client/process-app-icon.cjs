const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceImage = 'C:\\Users\\Subham Nayak\\.gemini\\antigravity-ide\\brain\\836cfb7b-261c-4646-a45e-aa575279d6d9\\media__1785748281594.jpg';
const publicDir = path.join(__dirname, 'public');

async function processIcons() {
  console.log('🖼️ Processing user-provided logo image:', sourceImage);

  // 1. Convert & save main app logo.png (1024x1024)
  await sharp(sourceImage)
    .resize(1024, 1024, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✅ Created public/logo.png');

  // 2. Create pwa-512x512.png
  await sharp(sourceImage)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✅ Created public/pwa-512x512.png');

  // 3. Create pwa-192x192.png
  await sharp(sourceImage)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✅ Created public/pwa-192x192.png');

  // 4. Create apple-touch-icon.png (180x180)
  await sharp(sourceImage)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Created public/apple-touch-icon.png');

  // 5. Create maskable-icon-512x512.png
  await sharp(sourceImage)
    .resize(512, 512, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));
  console.log('✅ Created public/maskable-icon-512x512.png');

  // 6. Create favicon PNG
  await sharp(sourceImage)
    .resize(64, 64, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✅ Created public/favicon.png');
}

processIcons().catch(err => {
  console.error('❌ Error processing icons:', err);
  process.exit(1);
});
