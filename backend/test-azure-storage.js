const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { isAzureStorageConfigured, uploadToBlob, deleteFromBlob, containerName } = require('./src/services/azureStorageService');

async function testAzureStorage() {
  console.log('====================================================');
  console.log('🧪 Iniciando prueba de conexión con Azure Blob Storage');
  console.log('====================================================');

  console.log('📋 Verificando variables de entorno:');
  console.log(' - AZURE_STORAGE_ACCOUNT:', process.env.AZURE_STORAGE_ACCOUNT || '(No configurado)');
  console.log(' - AZURE_STORAGE_CONTAINER:', process.env.AZURE_STORAGE_CONTAINER || containerName);
  console.log(' - AZURE_STORAGE_KEY:', process.env.AZURE_STORAGE_KEY ? `${process.env.AZURE_STORAGE_KEY.slice(0, 8)}...` : '(No configurado)');
  console.log(' - AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? '(Presente)' : '(No configurado)');

  if (!isAzureStorageConfigured()) {
    console.error('\n❌ ERROR: No se encontraron credenciales de Azure Blob Storage en el archivo .env.');
    console.log('Por favor agrega en backend/.env:');
    console.log('  AZURE_STORAGE_ACCOUNT=fiaarchivo');
    console.log('  AZURE_STORAGE_KEY=tu_llave_completa');
    console.log('  AZURE_STORAGE_CONTAINER=archivo-digital');
    console.log('  (o AZURE_STORAGE_CONNECTION_STRING=...)');
    process.exit(1);
  }

  // 1. Crear un archivo temporal de prueba
  const testFileName = `test-upload-${Date.now()}.txt`;
  const testFilePath = path.join(__dirname, testFileName);
  fs.writeFileSync(testFilePath, `Prueba de subida desde Pollo Fiesta - Fecha: ${new Date().toISOString()}`);

  try {
    console.log(`\n📤 1. Subiendo archivo de prueba: ${testFileName}...`);
    const blobUrl = await uploadToBlob(testFilePath, testFileName, 'text/plain');
    console.log('✅ ¡Subida exitosa!');
    console.log('🔗 URL pública generada:', blobUrl);

    console.log('\n🧹 2. Probando eliminación del archivo de prueba en Azure...');
    const deleted = await deleteFromBlob(blobUrl);
    if (deleted) {
      console.log('✅ Archivo de prueba eliminado correctamente de Azure Blob.');
    } else {
      console.warn('⚠️ No se pudo confirmar la eliminación (revisar permisos del contenedor).');
    }

    console.log('\n🎉 ¡PRUEBA COMPLETADA CON ÉXITO! Azure Blob Storage está 100% operativo.');
  } catch (error) {
    console.error('\n❌ Error durante la prueba de Azure Blob Storage:', error.message);
  } finally {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

testAzureStorage();
