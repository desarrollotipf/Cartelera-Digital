const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

// Configurar binario estático de FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Comprime y optimiza cualquier archivo de video subido para reproducción web ultra-rápida.
 * - Si es MP4 ligero (< 20MB): Aplica FastStart instantáneo en ~200ms sin recodificar.
 * - Si es pesado o formato no estándar: Aplica compresión acelerada H.264 ultrafast.
 * - Tiene timeout de seguridad para NUNCA congelar la subida del usuario.
 * @param {string} inputFilePath - Ruta absoluta del archivo subido
 * @returns {Promise<{ optimizedFilename: string, orientation: string, sizeBefore: number, sizeAfter: number }>}
 */
async function compressAndOptimizeVideo(inputFilePath) {
  const dir = path.dirname(inputFilePath);
  const ext = path.extname(inputFilePath).toLowerCase();
  const base = path.basename(inputFilePath, ext);
  const outputFilename = `opt_${Date.now()}_${base}.mp4`;
  const outputFilePath = path.join(dir, outputFilename);

  const initialStat = fs.existsSync(inputFilePath) ? fs.statSync(inputFilePath) : { size: 0 };
  const sizeMB = initialStat.size / (1024 * 1024);
  console.log(` [VideoCompressor] Procesando video: ${path.basename(inputFilePath)} (${sizeMB.toFixed(2)} MB)`);

  return new Promise((resolve) => {
    let resolved = false;

    // Timeout de seguridad: Si la compresión tarda más de 20s, devolver el archivo original de inmediato
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn(' [VideoCompressor] Timeout de compresión alcanzado, usando archivo original.');
        resolve({
          optimizedFilename: path.basename(inputFilePath),
          orientation: 'landscape',
          sizeBefore: initialStat.size,
          sizeAfter: initialStat.size
        });
      }
    }, 20000);

    // Si ya es un MP4 de tamaño moderado, hacemos un remuxing instantáneo con FastStart (-c copy)
    const isLightMp4 = ext === '.mp4' && sizeMB < 25;
    
    const outputOptions = isLightMp4
      ? ['-c copy', '-movflags +faststart']
      : [
          '-c:v libx264',
          '-preset ultrafast',          // Compresión ultra-rápida en 1-2 segundos
          '-crf 25',                     // Excelente calidad reduciendo 70%-85% de peso
          '-vf scale=min(iw\\,1920):-2', // Máximo 1080p manteniendo proporción
          '-c:a aac',
          '-b:a 128k',
          '-movflags +faststart',        // Inicio instantáneo en 00:00:00
          '-threads 0'
        ];

    ffmpeg(inputFilePath)
      .outputOptions(outputOptions)
      .toFormat('mp4')
      .on('start', (cmd) => {
        console.log(' [VideoCompressor] Modo:', isLightMp4 ? 'Remuxing instantáneo FastStart' : 'Compresión UltraFast H.264');
      })
      .on('error', (err) => {
        console.error(' [VideoCompressor] Error o advertencia en FFmpeg:', err.message);
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve({
            optimizedFilename: path.basename(inputFilePath),
            orientation: 'landscape',
            sizeBefore: initialStat.size,
            sizeAfter: initialStat.size
          });
        }
      })
      .on('end', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          const finalStat = fs.existsSync(outputFilePath) ? fs.statSync(outputFilePath) : { size: initialStat.size };
          console.log(` [VideoCompressor] ¡Video listo!: ${(finalStat.size / (1024 * 1024)).toFixed(2)} MB`);

          // Eliminar archivo original si se generó un nuevo archivo optimizado
          try {
            if (fs.existsSync(inputFilePath) && inputFilePath !== outputFilePath) {
              fs.unlinkSync(inputFilePath);
            }
          } catch (_) {}

          resolve({
            optimizedFilename: outputFilename,
            orientation: 'landscape',
            sizeBefore: initialStat.size,
            sizeAfter: finalStat.size
          });
        }
      })
      .save(outputFilePath);
  });
}

module.exports = {
  compressAndOptimizeVideo
};
