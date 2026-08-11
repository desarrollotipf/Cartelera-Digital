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
    const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|ogg|mov/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Tipo de archivo no soportado. Solo imágenes y videos.'));
  }
});

// POST /api/upload - Upload an image or video
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const isVideo = /mp4|webm|ogg|mov/.test(path.extname(req.file.originalname).toLowerCase());
    res.status(201).json({
      success: true,
      message: 'Archivo subido correctamente',
      data: { url: fileUrl, type: isVideo ? 'video' : 'image' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al subir el archivo', error: error.message });
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
