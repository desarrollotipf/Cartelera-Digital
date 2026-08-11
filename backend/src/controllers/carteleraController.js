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
  try {
    const newData = req.body;
    if (!newData) {
      return res.status(400).json({ success: false, message: 'No se recibieron datos para actualizar.' });
    }
    const updated = await carteleraModel.updateData(newData);
    res.json({ success: true, message: 'Cartelera actualizada correctamente', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar datos de la cartelera', error: error.message });
  }
};


module.exports = {
  getCarteleraData,
  updateCarteleraData
};
