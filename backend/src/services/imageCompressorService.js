const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Servicio de Compresión y Optimización de Imágenes sin Pérdida Visual (Visually Lossless)
 * para la Cartelera Digital de Pollo Fiesta S.A.
 * 
 * - Mantiene resolución máxima Full HD / 2K (1920x1920 px) para pantallas de TV.
 * - Comprime a calidad visual óptima (84-85%), eliminando metadatos innecesarios (EXIF).
 * - Conserva transparencia en archivos PNG.
 */
async function compressAndOptimizeImage(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`El archivo de imagen no existe: ${filePath}`);
  }

  const statBefore = fs.statSync(filePath);
  const sizeBefore = statBefore.size;

  // Archivos muy pequeños (< 40 KB) no requieren recompresión
  if (sizeBefore < 40 * 1024) {
    return {
      filePath,
      sizeBefore,
      sizeAfter: sizeBefore,
      savedPercent: '0%',
      skipped: true
    };
  }

  const ext = path.extname(filePath).toLowerCase();
  const tempPath = `${filePath}.opt.tmp`;

  try {
    const image = sharp(filePath, { failOnError: false });
    const metadata = await image.metadata();

    // Redimensionar solo si excede 1920px en ancho o alto (máxima resolución requerida en TV)
    let pipeline = image.rotate(); // Auto-rotación según orientación EXIF
    if ((metadata.width && metadata.width > 1920) || (metadata.height && metadata.height > 1920)) {
      pipeline = pipeline.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (ext === '.png') {
      pipeline = pipeline.png({
        quality: 85,
        compressionLevel: 8,
        effort: 7,
        adaptiveFiltering: true
      });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({
        quality: 84,
        effort: 5
      });
    } else {
      // JPEG / JPG y cualquier otro formato común
      pipeline = pipeline.jpeg({
        quality: 84,
        mozjpeg: true,
        progressive: true
      });
    }

    await pipeline.toFile(tempPath);

    const statAfter = fs.statSync(tempPath);
    const sizeAfter = statAfter.size;

    // Solo reemplazar el archivo original si la compresión realmente redujo el peso
    if (sizeAfter < sizeBefore) {
      fs.copyFileSync(tempPath, filePath);
      try { fs.unlinkSync(tempPath); } catch (_) {}

      const savedBytes = sizeBefore - sizeAfter;
      const savedPercent = `${Math.round((savedBytes / sizeBefore) * 100)}%`;

      console.log(` [ImageCompressor] Optimizado: ${path.basename(filePath)} | ${(sizeBefore / 1024).toFixed(1)}KB -> ${(sizeAfter / 1024).toFixed(1)}KB (-${savedPercent})`);

      return {
        filePath,
        sizeBefore,
        sizeAfter,
        savedPercent,
        dimensions: {
          width: metadata.width,
          height: metadata.height
        }
      };
    } else {
      // Si el archivo ya estaba más comprimido, mantener el original
      try { fs.unlinkSync(tempPath); } catch (_) {}
      return {
        filePath,
        sizeBefore,
        sizeAfter: sizeBefore,
        savedPercent: '0%',
        keptOriginal: true
      };
    }
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    console.warn(` [ImageCompressor] Advertencia al optimizar imagen: ${error.message}. Se mantiene original.`);
    return {
      filePath,
      sizeBefore,
      sizeAfter: sizeBefore,
      savedPercent: '0%',
      error: error.message
    };
  }
}

module.exports = {
  compressAndOptimizeImage
};
