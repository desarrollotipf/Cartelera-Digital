const carteleraModel = require('../models/carteleraData');

const getCarteleraData = async (req, res) => {
  try {
    const data = await carteleraModel.getData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener datos de la cartelera', error: error.message });
  }
};

const updateCarteleraData = async (req, res) => {
  console.log('[carteleraController] Recibida solicitud POST /api/cartelera');
  try {
    const newData = req.body;
    const userScope = req.headers['x-user-scope'] || req.body?.userScope || null;
    console.log('[carteleraController] userScope:', userScope, 'newData keys:', Object.keys(newData || {}));
    if (!newData) {
      return res.status(400).json({ success: false, message: 'No se recibieron datos para actualizar.' });
    }
    console.log('[carteleraController] Llamando a carteleraModel.updateData...');
    const updated = await carteleraModel.updateData(newData, userScope);
    console.log('[carteleraController] Actualización exitosa en base de datos');
    res.json({ success: true, message: 'Cartelera actualizada correctamente', data: updated });
  } catch (error) {
    console.error('[carteleraController] ERROR en updateCarteleraData:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar datos de la cartelera', error: error.message });
  }
};


module.exports = {
  getCarteleraData,
  updateCarteleraData
};
