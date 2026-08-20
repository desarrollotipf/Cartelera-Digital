const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let blobServiceClient = null;
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'archivo-digital';

function getAccountAndKey() {
  let account = process.env.AZURE_STORAGE_ACCOUNT;
  let key = process.env.AZURE_STORAGE_KEY;

  if (!account || !key) {
    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
    const matchAccount = connStr.match(/AccountName=([^;]+)/);
    const matchKey = connStr.match(/AccountKey=([^;]+)/);
    if (matchAccount) account = matchAccount[1];
    if (matchKey) key = matchKey[1];
  }

  return { account, key };
}

function getBlobServiceClient() {
  if (blobServiceClient) return blobServiceClient;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const { account, key } = getAccountAndKey();

  if (connectionString) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  } else if (account && key) {
    const credential = new StorageSharedKeyCredential(account, key);
    blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, credential);
  }

  return blobServiceClient;
}

function isAzureStorageConfigured() {
  const { account, key } = getAccountAndKey();
  return !!(process.env.AZURE_STORAGE_CONNECTION_STRING || (account && key));
}

/**
 * Genera una URL con firma SAS para permitir la visualización de imágenes/videos 
 * cuando la cuenta de almacenamiento tiene el acceso público anónimo deshabilitado.
 */
function generateSasUrl(blobName) {
  const { account, key } = getAccountAndKey();
  if (!account || !key) return null;

  try {
    const credential = new StorageSharedKeyCredential(account, key);
    const startsOn = new Date();
    startsOn.setMinutes(startsOn.getMinutes() - 5); // Tolerar diferencias de reloj

    const expiresOn = new Date();
    expiresOn.setFullYear(expiresOn.getFullYear() + 5); // 5 años de vigencia

    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse('r'), // Solo lectura
      startsOn,
      expiresOn
    }, credential).toString();

    return `https://${account}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
  } catch (err) {
    console.warn(' [AzureStorage] No se pudo generar token SAS, usando URL base:', err.message);
    return `https://${account}.blob.core.windows.net/${containerName}/${blobName}`;
  }
}

/**
 * Sube un archivo a Azure Blob Storage
 * @param {string} localFilePath Ruta local del archivo
 * @param {string} destinationFileName Nombre del archivo en el Blob
 * @param {string} mimeType Tipo MIME (image/png, video/mp4, etc.)
 * @returns {Promise<string>} URL accesible del blob subido
 */
async function uploadToBlob(localFilePath, destinationFileName, mimeType) {
  const client = getBlobServiceClient();
  if (!client) {
    throw new Error('Azure Blob Storage no está configurado');
  }

  const containerClient = client.getContainerClient(containerName);
  
  // Asegurar que el contenedor exista sin forzar acceso público anónimo a nivel de cuenta
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(destinationFileName);

  const fileStream = fs.createReadStream(localFilePath);

  await blockBlobClient.uploadStream(fileStream, 4 * 1024 * 1024, 5, {
    blobHTTPHeaders: {
      blobContentType: mimeType || 'application/octet-stream'
    }
  });

  // Generar URL con SAS token para visualización segura en navegadores
  const sasUrl = generateSasUrl(destinationFileName);
  return sasUrl || blockBlobClient.url;
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
    
    // Extraer el nombre limpio del blob (sin query params SAS)
    const cleanUrl = fileUrl.split('?')[0];
    const blobName = cleanUrl.includes('/') ? path.basename(new URL(cleanUrl).pathname) : cleanUrl;
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
