const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/'));
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

const { processAndDownloadVideo } = require('../services/videoDownloaderService');
const { compressAndOptimizeVideo } = require('../services/videoCompressorService');

// POST /api/upload/fetch-video - Descarga y optimiza cualquier video de link web
router.post('/fetch-video', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, message: 'URL requerida' });
    }

    console.log(' [UploadRoutes] Recibida solicitud para procesar video:', url);
    const result = await processAndDownloadVideo(url);
    
    res.json({
      success: true,
      message: 'Video procesado y almacenado correctamente en el servidor',
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

// POST /api/upload - Upload an image or video with automatic compression
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo.' });
    }
    
    const isVideo = req.file.mimetype.startsWith('video/') || /mp4|webm|ogg|mov|avi|mkv|wmv|flv|m4v/.test(path.extname(req.file.originalname).toLowerCase());
    
    if (isVideo) {
      // Comprimir y optimizar video automáticamente con H.264 FastStart
      const compResult = await compressAndOptimizeVideo(req.file.path);
      const fileUrl = `/uploads/${compResult.optimizedFilename}`;
      
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

    const fileUrl = `/uploads/${req.file.filename}`;
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
    let fileName = path.basename(rawUrl.split('?')[0]);
    let filePath = path.join(__dirname, '../../public/uploads/', fileName);
    
    const fs = require('fs');
    
    // Si el archivo no existe localmente pero es un enlace externo (YouTube, etc.), procesarlo al vuelo
    if (!fs.existsSync(filePath) && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      try {
        console.log(' [UploadRoutes/Download] Descargando video al vuelo:', rawUrl);
        const result = await processAndDownloadVideo(rawUrl);
        if (result && result.url && result.url.startsWith('/uploads/')) {
          fileName = path.basename(result.url);
          filePath = path.join(__dirname, '../../public/uploads/', fileName);
        }
      } catch (dlErr) {
        console.error(' [UploadRoutes/Download] Error descargando al vuelo:', dlErr.message);
      }
    }

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
router.delete('/', (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL de archivo no proporcionada.' });
    }
    const fileName = path.basename(url);
    const filePath = path.join(__dirname, '../../public/uploads/', fileName);
    
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: 'Archivo eliminado correctamente' });
    } else {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado en el servidor' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar el archivo', error: error.message });
  }
});

module.exports = router;
