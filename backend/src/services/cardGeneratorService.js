const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');

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
 * Genera la tarjeta de cumpleaños como una imagen estática única de alta definición
 * utilizando la plantilla institucional oficial de Pollo Fiesta S.A.
 * 
 * @param {string} nombre - Nombre del colaborador
 * @returns {Promise<Buffer>} - Buffer de la imagen en formato JPEG
 */
async function generateBirthdayCardImage(nombre) {
  const cardPath = path.join(__dirname, '../templates/assets/birthday_card_template.jpg');

  const bgImage = await loadImage(cardPath);

  // Escala 2x (Retina HD) para nitidez cristalina en todas las pantallas
  const SCALE = 2;
  const baseWidth = bgImage.width;
  const baseHeight = bgImage.height;

  const canvas = createCanvas(baseWidth * SCALE, baseHeight * SCALE);
  const ctx = canvas.getContext('2d');

  // Suavizado e interpolación de alta calidad
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Aplicar escala 2x para renderizar vectores, tipografía y sombras con el doble de densidad de píxeles
  ctx.scale(SCALE, SCALE);

  // 1. Dibujar el fondo institucional base oficial
  ctx.drawImage(bgImage, 0, 0, baseWidth, baseHeight);

  // Desplazado a la izquierda con líneas compactas y legibles
  const textCenterX = 220;
  const maxWidth = 310;

  // 2. Nombre del colaborador
  const cleanName = (nombre || 'COLABORADOR').trim().toUpperCase();

  let nameFontSize = 21;
  if (cleanName.length > 32) nameFontSize = 16;
  else if (cleanName.length > 25) nameFontSize = 18;

  ctx.save();
  ctx.font = `bold ${nameFontSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;

  let currentY = 460;
  const nameLines = wrapText(ctx, cleanName, maxWidth);
  nameLines.forEach(line => {
    ctx.fillText(line, textCenterX, currentY);
    currentY += nameFontSize + 6;
  });
  ctx.restore();

  currentY += 18;

  // 3. Mensaje institucional serio y profesional
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '15px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;

  // Párrafo 1
  const p1 = 'En este día tan especial, la Dirección y todo el equipo de Pollo Fiesta S.A. le extendemos un cordial saludo y nuestras más sinceras felicitaciones por su cumpleaños.';
  const p1Lines = wrapText(ctx, p1, maxWidth);
  p1Lines.forEach(line => {
    ctx.fillText(line, textCenterX, currentY);
    currentY += 23;
  });

  currentY += 15;

  // Párrafo 2
  const p2 = 'Agradecemos profundamente su valioso compromiso, dedicación y entrega diaria al desarrollo de nuestra organización.';
  const p2Lines = wrapText(ctx, p2, maxWidth);
  p2Lines.forEach(line => {
    ctx.fillText(line, textCenterX, currentY);
    currentY += 23;
  });

  currentY += 15;

  // Párrafo 3
  const p3 = 'Le deseamos bienestar, salud y muchos éxitos en sus metas personales y profesionales junto a sus seres queridos.';
  const p3Lines = wrapText(ctx, p3, maxWidth);
  p3Lines.forEach(line => {
    ctx.fillText(line, textCenterX, currentY);
    currentY += 23;
  });

  currentY += 18;

  // Línea divisoria
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(textCenterX - 100, currentY);
  ctx.lineTo(textCenterX + 100, currentY);
  ctx.stroke();

  currentY += 14;

  // Firma institucional
  ctx.font = 'bold 13.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('GESTIÓN HUMANA', textCenterX, currentY);

  currentY += 18;

  ctx.font = '11.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('Pollo Fiesta S.A.', textCenterX, currentY);

  // 4. Retornar Buffer JPEG de ultra alta definición (calidad 98)
  return canvas.toBuffer('image/jpeg', 98);
}

module.exports = {
  generateBirthdayCardImage
};


