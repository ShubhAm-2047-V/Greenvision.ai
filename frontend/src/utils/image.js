/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Resizes the image to fit within MAX_WIDTH/MAX_HEIGHT and reduces quality.
 * Useful to bypass Vercel serverless function payload limits (4.5 MB).
 * 
 * @param {File} file - The raw input file from the input[type=file]
 * @returns {Promise<File>} - Resolves to the compressed File object (JPEG format, 70% quality)
 */
export const compressImage = (file) => {
  return new Promise((resolve) => {
    // If the file is not an image, return it as-is
    if (!file.type || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Define standard bounding dimensions for high performance but low weight
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            // Keep the original filename but change extension to .jpg for maximum compression density
            const originalName = file.name;
            const dotIdx = originalName.lastIndexOf('.');
            const baseName = dotIdx !== -1 ? originalName.substring(0, dotIdx) : originalName;
            const newName = `${baseName}_compressed.jpg`;

            const compressedFile = new File([blob], newName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        }, 'image/jpeg', 0.7); // Compress to JPEG with 70% quality (ideal weight vs fidelity ratio)
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};
