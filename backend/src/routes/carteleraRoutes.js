const express = require('express');
const router = express.Router();
const { getCarteleraData, updateCarteleraData } = require('../controllers/carteleraController');

// GET  /api/cartelera  - Obtener datos actuales de la cartelera
router.get('/', getCarteleraData);

// POST /api/cartelera  - Actualizar datos de la cartelera
router.post('/', updateCarteleraData);

module.exports = router;
