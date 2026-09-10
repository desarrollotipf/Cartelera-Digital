const carteleraModel = require('../models/carteleraData');

// Lista de clientes conectados a la transmisión en vivo (pantallas de TV, navegadores, kioskos)
const sseClients = new Set();

const streamCartelera = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (res.flushHeaders) res.flushHeaders();

  sseClients.add(res);

  // Mensaje de bienvenida inicial
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

  // Heartbeat cada 25 segundos para mantener abierta la conexión a través de balanceadores
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (_) {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
};

const broadcastCarteleraUpdate = (data) => {
  const payload = `data: ${JSON.stringify({ type: 'CARTELERA_UPDATED', data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (err) {
      sseClients.delete(client);
    }
  }
};

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
    let newData = req.body;
    if (typeof newData === 'string') {
      try {
        newData = JSON.parse(newData);
      } catch (_) {}
    }

    const userScope = req.headers['x-user-scope'] || req.body?.userScope || newData?.userScope || null;
    console.log('[carteleraController] userScope:', userScope, 'newData keys:', Object.keys(newData || {}));

    if (!newData || (typeof newData === 'object' && Object.keys(newData).length === 0)) {
      return res.status(400).json({ success: false, message: 'No se recibieron datos para actualizar.' });
    }

    console.log('[carteleraController] Llamando a carteleraModel.updateData...');
    const updated = await carteleraModel.updateData(newData, userScope);
    console.log('[carteleraController] Actualización exitosa en base de datos');

    // Transmisión instantánea a todas las pantallas, TVs y usuarios conectados en tiempo real
    broadcastCarteleraUpdate(updated);

    res.json({ success: true, message: 'Cartelera actualizada correctamente', data: updated });
  } catch (error) {
    console.error('[carteleraController] ERROR en updateCarteleraData:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar datos de la cartelera', error: error.message });
  }
};

module.exports = {
  getCarteleraData,
  updateCarteleraData,
  streamCartelera
};
