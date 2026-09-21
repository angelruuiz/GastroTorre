/**
 * GASTROTORRE — CLIENT-SIDE HIGH PERFORMANCE IMAGE COMPRESSOR
 * Compresses raw high-res camera photos (5MB - 30MB) into ultra-optimized WebP (< 120KB)
 * directly in the browser before transmission to database/cloud.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  savingsPercentage: number;
  width: number;
  height: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeBytes = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al procesar la imagen seleccionada.'));
      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional dimensions
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
          reject(new Error('No se pudo inicializar el contexto de compresión.'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP first, fallback to JPEG
        let compressedDataUrl = canvas.toDataURL('image/webp', quality);
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calculate size from Base64 string
        const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
        const compressedSizeBytes = Math.round((base64Length * 3) / 4);

        const savings = Math.max(
          0,
          Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)
        );

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeBytes,
          compressedSizeBytes,
          originalSizeFormatted: formatBytes(originalSizeBytes),
          compressedSizeFormatted: formatBytes(compressedSizeBytes),
          savingsPercentage: savings,
          width,
          height,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
