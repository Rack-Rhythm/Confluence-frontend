/**
 * Utility for client-side image compression before uploading.
 * Drastically reduces bandwidth usage (often by 80-95%) and speeds up uploads on mobile/rural connections.
 */

export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Compresses an image File using HTML5 Canvas.
 * @param {File} file - Original file from device
 * @param {Object} options - Configuration options
 * @param {number} options.maxWidth - Max width in pixels (default 1280)
 * @param {number} options.maxHeight - Max height in pixels (default 1280)
 * @param {number} options.quality - JPEG compression quality 0.1 to 1.0 (default 0.78)
 * @param {string} options.outputType - MIME type, default 'image/jpeg'
 * @returns {Promise<{ file: File, previewUrl: string, originalSize: number, compressedSize: number, originalFormatted: string, compressedFormatted: string, savingsPercent: number }>}
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    // If it's an SVG or GIF, don't recompress (SVGs are vector, GIFs are animated)
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const previewUrl = URL.createObjectURL(file);
      return resolve({
        file,
        previewUrl,
        originalSize: file.size,
        compressedSize: file.size,
        originalFormatted: formatBytes(file.size),
        compressedFormatted: formatBytes(file.size),
        savingsPercent: 0,
      });
    }

    const {
      maxWidth = 1280,
      maxHeight = 1280,
      quality = 0.78,
      outputType = 'image/jpeg',
    } = options;

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context could not be created.'));
        }

        // Apply smooth rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Image compression failed.'));
            }

            // Create a new File object with updated extension if converted to JPEG
            let newFileName = file.name;
            if (outputType === 'image/jpeg' && !file.name.toLowerCase().endsWith('.jpg') && !file.name.toLowerCase().endsWith('.jpeg')) {
              newFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            }

            const compressedFile = new File([blob], newFileName, {
              type: outputType,
              lastModified: Date.now(),
            });

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const savingsPercent = originalSize > compressedSize
              ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
              : 0;

            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: compressedFile,
              previewUrl,
              originalSize,
              compressedSize,
              originalFormatted: formatBytes(originalSize),
              compressedFormatted: formatBytes(compressedSize),
              savingsPercent,
              width,
              height,
            });
          },
          outputType,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.src = readerEvent.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};
