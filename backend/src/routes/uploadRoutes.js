const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isAzureStorageConfigured, uploadToBlob, deleteFromBlob } = require('../services/azureStorageService');
const { processAndDownloadVideo } = require('../services/videoDownloaderService');
const { compressAndOptimizeVideo } = require('../services/videoCompressorService');

// Configure multer storage temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB (videos)
  fileFilter: function (req, file, cb) {
    const isImage = /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase());
    const isVideo = file.mimetype.startsWith('video/') || /mp4|webm|ogg|mov|avi|mkv|wmv|flv|m4v/.test(path.extname(file.originalname).toLowerCase());
    
    if (isImage || isVideo) cb(null, true);
    else cb(new Error('Tipo de archivo no soportado. Sube una imagen o video.'));
  }
});

// POST /api/upload/fetch-video - Descarga y optimiza cualquier video de link web
router.post('/fetch-video', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, message: 'URL requerida' });
    }

    console.log(' [UploadRoutes] Recibida solicitud para procesar video:', url);
    const result = await processAndDownloadVideo(url);
    
    // Si Azure Blob Storage está activo, subir el video descargado
    if (isAzureStorageConfigured() && result.url && result.url.startsWith('/uploads/')) {
      const localFilename = path.basename(result.url);
      const localFilePath = path.join(__dirname, '../../public/uploads/', localFilename);
      if (fs.existsSync(localFilePath)) {
        try {
          const blobUrl = await uploadToBlob(localFilePath, localFilename, 'video/mp4');
          result.url = blobUrl;
          console.log(' [UploadRoutes] Video web subido a Azure Blob Storage:', blobUrl);
        } catch (blobErr) {
          console.warn(' [UploadRoutes] Fallo al subir a Azure Blob, usando ruta local:', blobErr.message);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Video procesado y almacenado correctamente',
      data: result
    });
  } catch (error) {
    console.error(' [UploadRoutes] Error procesando video:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'No se pudo descargar el video automáticamente', 
      error: error.message 
    });
  }
});

// POST /api/upload - Upload an image or video with automatic compression and Azure Storage support
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo.' });
    }
    
    const isVideo = req.file.mimetype.startsWith('video/') || /mp4|webm|ogg|mov|avi|mkv|wmv|flv|m4v/.test(path.extname(req.file.originalname).toLowerCase());
    
    if (isVideo) {
      // Comprimir y optimizar video automáticamente con H.264 FastStart
      const compResult = await compressAndOptimizeVideo(req.file.path);
      let fileUrl = `/uploads/${compResult.optimizedFilename}`;
      const optimizedFilePath = path.join(__dirname, '../../public/uploads/', compResult.optimizedFilename);
      
      // Subir a Azure Blob Storage si está configurado
      if (isAzureStorageConfigured() && fs.existsSync(optimizedFilePath)) {
        try {
          fileUrl = await uploadToBlob(optimizedFilePath, compResult.optimizedFilename, 'video/mp4');
          console.log(' [UploadRoutes] Video subido a Azure Blob Storage:', fileUrl);
        } catch (blobErr) {
          console.warn(' [UploadRoutes] Error subiendo video a Azure Blob:', blobErr.message);
        }
      }
      
      return res.status(201).json({
        success: true,
        message: 'Video subido y optimizado con éxito',
        data: { 
          url: fileUrl, 
          type: 'video', 
          orientation: compResult.orientation,
          sizeBefore: compResult.sizeBefore,
          sizeAfter: compResult.sizeAfter
        }
      });
    }

    // Imagen
    let fileUrl = `/uploads/${req.file.filename}`;
    
    // Subir a Azure Blob Storage si está configurado
    if (isAzureStorageConfigured()) {
      try {
        fileUrl = await uploadToBlob(req.file.path, req.file.filename, req.file.mimetype);
        console.log(' [UploadRoutes] Imagen subida a Azure Blob Storage:', fileUrl);
      } catch (blobErr) {
        console.warn(' [UploadRoutes] Error subiendo imagen a Azure Blob:', blobErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Archivo subido correctamente',
      data: { url: fileUrl, type: 'image' }
    });
  } catch (error) {
    console.error(' [UploadRoutes] Error al procesar archivo:', error);
    res.status(500).json({ success: false, message: 'Error al subir el archivo', error: error.message });
  }
});

// GET /api/upload/download - Force file download as attachment (local or external web link)
router.get('/download', async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) {
      return res.status(400).send('URL de archivo requerida');
    }
    
    // Si es una URL remota de Azure Blob u otro sitio web
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return res.redirect(rawUrl);
    }

    let fileName = path.basename(rawUrl.split('?')[0]);
    let filePath = path.join(__dirname, '../../public/uploads/', fileName);

    if (fs.existsSync(filePath)) {
      const cleanCustomName = req.query.name 
        ? `${req.query.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp4` 
        : fileName;
      return res.download(filePath, cleanCustomName);
    } else {
      return res.status(404).send('Archivo no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error en descarga: ' + error.message);
  }
});

// DELETE /api/upload - Delete an uploaded file
router.delete('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL de archivo no proporcionada.' });
    }

    // Si es URL de Azure Blob Storage
    if (isAzureStorageConfigured() && (url.startsWith('http://') || url.startsWith('https://'))) {
      await deleteFromBlob(url);
    }

    const fileName = path.basename(url.split('?')[0]);
    const filePath = path.join(__dirname, '../../public/uploads/', fileName);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.json({ success: true, message: 'Archivo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar el archivo', error: error.message });
  }
});

module.exports = router;
