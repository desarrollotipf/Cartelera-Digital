const fs = require('fs');
const path = require('path');
const { compressAndOptimizeImage } = require('../src/services/imageCompressorService');

async function runOptimization() {
  console.log('--- Iniciando optimización de imágenes existentes ---');
  
  const targetDirs = [
    path.join(__dirname, '../public/uploads')
  ];

  let totalFiles = 0;
  let totalSavedBytes = 0;

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;

    console.log(`\nRevisando directorio: ${dir}`);
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isFile() && /\.(jpe?g|png|webp)$/i.test(file)) {
        totalFiles++;
        try {
          const res = await compressAndOptimizeImage(fullPath);
          if (res && res.sizeBefore > res.sizeAfter) {
            totalSavedBytes += (res.sizeBefore - res.sizeAfter);
          }
        } catch (err) {
          console.error(`Error procesando ${file}:`, err.message);
        }
      }
    }
  }

  console.log(`\n Proceso finalizado. Total analizado: ${totalFiles} imágenes.`);
  console.log(` Espacio total liberado: ${(totalSavedBytes / 1024).toFixed(1)} KB`);
}

runOptimization().catch(console.error);
