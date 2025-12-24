
/**
 * Compresses an image file using HTML Canvas.
 * Resizes the image if it exceeds maxWidth/maxHeight and reduces quality.
 * 
 * @param file - The uploaded File object
 * @param maxWidth - Maximum width allowed (default 500px)
 * @param quality - JPEG quality between 0 and 1 (default 0.7)
 * @returns Promise<string> - The Data URL of the compressed image
 */
export const compressImage = (file: File, maxWidth = 500, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
  
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
  
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Export as compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
  
        img.onerror = (err) => reject(err);
      };
      
      reader.onerror = (err) => reject(err);
    });
  };
