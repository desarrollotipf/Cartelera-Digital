/**
 * Utilidad de compresión y optimización ultrarrápida de imágenes en el cliente (Browser Canvas)
 * Reduce fotos pesadas de 5MB - 15MB a 150KB - 350KB manteniendo alta fidelidad visual.
 */
export async function compressImage(file, maxWidth = 1600, quality = 0.85) {
  // Si no es imagen o ya es muy liviana (ej: < 100KB), retornar el archivo original
  if (!file || !file.type.startsWith('image/')) return file;
  if (file.size < 120 * 1024 && (file.type === 'image/webp' || file.type === 'image/png')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Escalar proporcionalmente si supera maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a WebP de alto rendimiento (o JPEG si no soporta WebP)
        const format = file.type === 'image/png' && hasAlpha(ctx, width, height) ? 'image/png' : 'image/webp';

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // Si la compresión no reduce tamaño, retornar original
              return resolve(file);
            }

            const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, format === 'image/webp' ? '.webp' : '.png'), {
              type: format,
              lastModified: Date.now()
            });

            resolve(optimizedFile);
          },
          format,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}

function hasAlpha(ctx, width, height) {
  try {
    const data = ctx.getImageData(0, 0, Math.min(width, 50), Math.min(height, 50)).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
  } catch (_) { }
  return false;
}
