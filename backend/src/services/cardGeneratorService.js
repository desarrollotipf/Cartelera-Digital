const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

/**
 * Divide el texto de forma equilibrada para evitar palabras huérfanas en los saltos de línea.
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Genera la tarjeta de cumpleaños como una imagen estática única de alta definición.
 * @param {string} nombre - Nombre del colaborador
 * @param {number} cardThemeIndex - Índice del diseño (1 a 4)
 * @returns {Promise<Buffer>} - Buffer de la imagen en formato JPEG
 */
async function generateBirthdayCardImage(nombre, cardThemeIndex = 1) {
  const cardFilename = `birthday_card_${cardThemeIndex}.jpg`;
  const cardPath = path.join(__dirname, '../templates/assets', cardFilename);

  const bgImage = await loadImage(cardPath);
  const canvas = createCanvas(570, 1024);
  const ctx = canvas.getContext('2d');

  // 1. Dibujar el fondo institucional base (todas las tarjetas ya tienen el arte limpio y nativo)
  ctx.drawImage(bgImage, 0, 0, 570, 1024);

  // Paleta de colores para textos y firma según el diseño
  const themeConfigs = {
    1: { pillText: '#ffffff', highlight: '#92400e', signature: '#78350f' }, // Dorado
    2: { pillText: '#ffffff', highlight: '#9a3412', signature: '#7c2d12' }, // Terracota
    3: { pillText: '#ffffff', highlight: '#9d174d', signature: '#831843' }, // Magenta
    4: { pillText: '#1e293b', highlight: '#1e40af', signature: '#1e3a8a' }, // Azul / Pastel
  };

  const theme = themeConfigs[cardThemeIndex] || themeConfigs[1];

  // 2. Dibujar el Nombre del cumpleañero directamente sobre la pastilla original (sin capas superpuestas)
  const cleanName = (nombre || 'COLABORADOR').trim().toUpperCase();
  
  let nameFontSize = 20;
  if (cleanName.length > 28) nameFontSize = 14.5;
  else if (cleanName.length > 22) nameFontSize = 16.5;
  else if (cleanName.length > 16) nameFontSize = 18.5;

  ctx.save();
  ctx.font = `bold ${nameFontSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.pillText;
  if (theme.pillText === '#ffffff') {
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
  }
  ctx.fillText(cleanName, 285, 423);
  ctx.restore();

  // 3. Dibujar el Mensaje de la Carta (Área beige central)
  const maxWidth = 390;
  let currentY = 495;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Párrafo 1 (Destacado)
  ctx.font = 'bold 15.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#2c1a0e';
  const p1Lines = wrapText(ctx, '¡Hoy es un día muy especial para celebrar tu vida, tus logros y la gran alegría que aportas a nuestra compañía!', maxWidth);
  p1Lines.forEach(line => {
    ctx.fillText(line, 285, currentY);
    currentY += 24;
  });

  currentY += 16;

  // Párrafo 2 (Agradecimiento institucional)
  ctx.font = '14.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#453225';
  const p2Lines = wrapText(ctx, 'En nombre de toda la familia Pollo Fiesta S.A., queremos agradecerte de corazón por tu compromiso diario, dedicación y valioso esfuerzo.', maxWidth);
  p2Lines.forEach(line => {
    ctx.fillText(line, 285, currentY);
    currentY += 23;
  });

  currentY += 16;

  // Párrafo 3 (Buenos deseos)
  ctx.font = '14.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#453225';
  const p3Lines = wrapText(ctx, 'Deseamos que este nuevo año de vida llegue cargado de salud, bendiciones, metas cumplidas y momentos memorables junto a tu familia.', maxWidth);
  p3Lines.forEach(line => {
    ctx.fillText(line, 285, currentY);
    currentY += 23;
  });

  currentY += 24;

  // Línea divisoria punteada elegante
  ctx.strokeStyle = 'rgba(180, 130, 70, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(145, currentY);
  ctx.lineTo(425, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  currentY += 18;

  // Cierre y Firma Institucional
  ctx.font = 'bold 19px Arial, Helvetica, sans-serif';
  ctx.fillStyle = theme.highlight;
  ctx.fillText('¡Feliz Cumpleaños!', 285, currentY);

  currentY += 26;

  ctx.font = 'bold 12.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = theme.signature;
  ctx.fillText('GESTIÓN HUMANA & EQUIPO POLLO FIESTA S.A.', 285, currentY);

  // 4. Retornar Buffer JPEG de alta calidad
  return canvas.toBuffer('image/jpeg', 94);
}

module.exports = {
  generateBirthdayCardImage
};
