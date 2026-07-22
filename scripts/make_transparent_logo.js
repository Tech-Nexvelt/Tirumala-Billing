const fs = require('fs');
const path = require('path');
const PNG = require(path.join(__dirname, '../node_modules/pngjs')).PNG;

const inputPath = path.join(__dirname, '../public/nexvelt-logo.png');
const outputPath = path.join(__dirname, '../public/nexvelt-logo.png');
const faviconPath = path.join(__dirname, '../public/favicon.png');
const appIconPath = path.join(__dirname, '../src/app/icon.png');
const appAppleIconPath = path.join(__dirname, '../src/app/apple-icon.png');

console.log('Reading logo from:', inputPath);

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function () {
    let minX = this.width, maxX = 0, minY = this.height, maxY = 0;
    let foundLogoPixel = false;

    // 1. Remove white background (make r>230, g>230, b>230 transparent)
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let idx = (this.width * y + x) << 2;
        let r = this.data[idx];
        let g = this.data[idx + 1];
        let b = this.data[idx + 2];
        let a = this.data[idx + 3];

        // If it's white background, make it 100% transparent
        if (r > 230 && g > 230 && b > 230) {
          this.data[idx + 3] = 0; // Alpha = 0
        } else if (a > 20) {
          // Track bounding box of non-white emblem
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          foundLogoPixel = true;
        }
      }
    }

    console.log(`Logo Bounding Box: X[${minX}..${maxX}], Y[${minY}..${maxY}]`);

    if (!foundLogoPixel) {
      console.log('No logo pixels found!');
      return;
    }

    // 2. Crop to tight bounding box with padding
    const padding = 4;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(this.width - 1, maxX + padding);
    maxY = Math.min(this.height - 1, maxY + padding);

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    // Create a new square cropped image
    const size = Math.max(cropWidth, cropHeight);
    const cropped = new PNG({ width: size, height: size });

    // Fill with transparent 0s
    cropped.data.fill(0);

    const offsetX = Math.floor((size - cropWidth) / 2);
    const offsetY = Math.floor((size - cropHeight) / 2);

    for (let y = 0; y < cropHeight; y++) {
      for (let x = 0; x < cropWidth; x++) {
        const srcIdx = ((minY + y) * this.width + (minX + x)) << 2;
        const destIdx = ((offsetY + y) * size + (offsetX + x)) << 2;

        cropped.data[destIdx] = this.data[srcIdx];
        cropped.data[destIdx + 1] = this.data[srcIdx + 1];
        cropped.data[destIdx + 2] = this.data[srcIdx + 2];
        cropped.data[destIdx + 3] = this.data[srcIdx + 3];
      }
    }

    // Save outputs
    const buffer = PNG.sync.write(cropped);
    fs.writeFileSync(outputPath, buffer);
    fs.writeFileSync(faviconPath, buffer);
    fs.writeFileSync(appIconPath, buffer);
    fs.writeFileSync(appAppleIconPath, buffer);

    console.log('SUCCESS: Generated transparent PNG logo and icons without white box!');
  });
