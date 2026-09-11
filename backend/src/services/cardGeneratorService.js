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

  // La nueva plantilla institucional viene en resolución nativa de 1450x2048 px
  const canvas = createCanvas(bgImage.width, bgImage.height);
  const ctx = canvas.getContext('2d');

  // Suavizado e interpolación de alta calidad
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Dibujar el fondo institucional base oficial
  ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);

  // Centrado en el área izquierda despejada bajo "¡¡Feliz Cumpleaños!!"
  const textCenterX = 425;
  const maxWidth = 620;

  // 2. Nombre del colaborador
  const cleanName = (nombre || 'COLABORADOR').trim().toUpperCase();

  let nameFontSize = 50;
  if (cleanName.length > 35) nameFontSize = 40;
  else if (cleanName.length > 25) nameFontSize = 45;

  ctx.save();
  ctx.font = `bold ${nameFontSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  let currentY = 910;
  const nameLines = wrapText(ctx, cleanName, maxWidth);
  nameLines.forEach(line => {
    ctx.fillText(line, textCenterX, currentY);
    currentY += nameFontSize + 12;
  });
  ctx.restore();

  currentY += 35;

  // 3. Mensaje institucional serio y profesional
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '36px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 2;

  // Párrafo 1
  const p1 = 'Hoy en Pollo Fiesta S.A. celebramos contigo y te deseamos un ¡Feliz cumpleaños!';
  const p1Lines = wrapText(ctx, p1, maxWidth);
  p1Lines.forEach(line => {
    ctx.fillText(line, textCenterX, currentY);
    currentY += 50;
  });

  currentY += 28;

  // Párrafo 2
  const p2 = 'Que Dios bendiga tu vida, te conceda salud, alegría y muchos éxitos, y que este nuevo año esté lleno de momentos especiales junto a tus seres queridos.';
  const p2Lines = wrapText(ctx, p2, maxWidth);
  p2Lines.forEach(line => {
    ctx.fillText(line, textCenterX, currentY);
    currentY += 50;
  });

  currentY += 28;

  // Párrafo 3
  const p3 = '¡Gracias por ser parte de nuestro equipo!';
  const p3Lines = wrapText(ctx, p3, maxWidth);
  p3Lines.forEach(line => {
    ctx.fillText(line, textCenterX, currentY);
    currentY += 50;
  });

  currentY += 38;

  // Línea divisoria
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(textCenterX - 180, currentY);
  ctx.lineTo(textCenterX + 180, currentY);
  ctx.stroke();

  currentY += 30;

  // Firma institucional
  ctx.font = 'bold 30px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('GESTIÓN HUMANA', textCenterX, currentY);

  currentY += 40;

  ctx.font = '24px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('Pollo Fiesta S.A.', textCenterX, currentY);

  // 4. Retornar Buffer JPEG de ultra alta definición (calidad 98)
  return canvas.toBuffer('image/jpeg', 98);
}

module.exports = {
  generateBirthdayCardImage
};


