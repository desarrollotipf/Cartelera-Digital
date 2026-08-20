const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let blobServiceClient = null;
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'archivo-digital';

function getBlobServiceClient() {
  if (blobServiceClient) return blobServiceClient;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const account = process.env.AZURE_STORAGE_ACCOUNT;
  const key = process.env.AZURE_STORAGE_KEY;

  if (connectionString) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  } else if (account && key) {
    const credential = new StorageSharedKeyCredential(account, key);
    blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, credential);
  }

  return blobServiceClient;
}

function isAzureStorageConfigured() {
  return !!(process.env.AZURE_STORAGE_CONNECTION_STRING || (process.env.AZURE_STORAGE_ACCOUNT && process.env.AZURE_STORAGE_KEY));
}

/**
 * Sube un archivo a Azure Blob Storage
 * @param {string} localFilePath Ruta local del archivo
 * @param {string} destinationFileName Nombre del archivo en el Blob
 * @param {string} mimeType Tipo MIME (image/png, video/mp4, etc.)
 * @returns {Promise<string>} URL pública del blob subido
 */
async function uploadToBlob(localFilePath, destinationFileName, mimeType) {
  const client = getBlobServiceClient();
  if (!client) {
    throw new Error('Azure Blob Storage no está configurado');
  }

  const containerClient = client.getContainerClient(containerName);
  
  // Asegurar que el contenedor exista con acceso público a nivel de blob si es nuevo
  await containerClient.createIfNotExists({ access: 'blob' });

  const blockBlobClient = containerClient.getBlockBlobClient(destinationFileName);

  const fileStream = fs.createReadStream(localFilePath);
  const fileSize = fs.statSync(localFilePath).size;

  await blockBlobClient.uploadStream(fileStream, 4 * 1024 * 1024, 5, {
    blobHTTPHeaders: {
      blobContentType: mimeType || 'application/octet-stream'
    }
  });

  return blockBlobClient.url;
}

/**
 * Elimina un archivo de Azure Blob Storage por su URL o nombre
 * @param {string} fileUrl URL completa del blob o nombre del archivo
 */
async function deleteFromBlob(fileUrl) {
  if (!isAzureStorageConfigured() || !fileUrl) return false;

  try {
    const client = getBlobServiceClient();
    if (!client) return false;

    const containerClient = client.getContainerClient(containerName);
    
    // Extraer el nombre del blob si viene como URL
    const blobName = fileUrl.includes('/') ? path.basename(new URL(fileUrl).pathname) : fileUrl;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.deleteIfExists();
    return true;
  } catch (error) {
    console.error(' [AzureStorage] Error eliminando blob:', error.message);
    return false;
  }
}

module.exports = {
  isAzureStorageConfigured,
  uploadToBlob,
  deleteFromBlob,
  containerName
};
