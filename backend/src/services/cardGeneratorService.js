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
 * Genera la tarjeta de cumpleaños como una imagen estática única de alta definición
 * utilizando la plantilla institucional oficial de Pollo Fiesta S.A.
 * 
 * @param {string} nombre - Nombre del colaborador
 * @returns {Promise<Buffer>} - Buffer de la imagen en formato JPEG
 */
async function generateBirthdayCardImage(nombre) {
  const cardPath = path.join(__dirname, '../templates/assets/birthday_card_template.jpg');

  const bgImage = await loadImage(cardPath);
  const canvas = createCanvas(723, 1024);
  const ctx = canvas.getContext('2d');

  // 1. Dibujar el fondo institucional base oficial
  ctx.drawImage(bgImage, 0, 0, 723, 1024);

  const centerX = 723 / 2; // 361.5
  const maxWidth = 500;

  // 2. Nombre del colaborador
  const cleanName = (nombre || 'COLABORADOR').trim().toUpperCase();
  
  let nameFontSize = 22;
  if (cleanName.length > 32) nameFontSize = 15;
  else if (cleanName.length > 25) nameFontSize = 17;
  else if (cleanName.length > 18) nameFontSize = 19;

  ctx.font = `bold ${nameFontSize}px Arial, Helvetica, sans-serif`;
  const nameWidth = ctx.measureText(cleanName).width;
  const pillWidth = Math.min(540, Math.max(340, nameWidth + 56));
  const pillHeight = 44;
  const pillY = 296;

  // Sombra suave bajo la pastilla
  ctx.save();
  ctx.shadowColor = 'rgba(217, 119, 6, 0.28)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // Fondo de pastilla con degradado cálido
  const grad = ctx.createLinearGradient(centerX - pillWidth / 2, pillY, centerX + pillWidth / 2, pillY + pillHeight);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.5, '#d97706');
  grad.addColorStop(1, '#b45309');
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(centerX - pillWidth / 2, pillY, pillWidth, pillHeight, 22);
  ctx.fill();
  ctx.restore();

  // Borde dorado fino
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(centerX - pillWidth / 2, pillY, pillWidth, pillHeight, 22);
  ctx.stroke();

  // Texto del nombre
  ctx.save();
  ctx.font = `bold ${nameFontSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.fillText(cleanName, centerX, pillY + pillHeight / 2 + 1);
  ctx.restore();

  // 3. Mensaje institucional
  let currentY = 368;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Párrafo 1 (Destacado)
  ctx.font = 'bold 17.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#1e293b';
  const p1Lines = wrapText(ctx, '¡Hoy es un día muy especial para celebrar tu vida, tus logros y la gran alegría que aportas a nuestra compañía!', maxWidth);
  p1Lines.forEach(line => {
    ctx.fillText(line, centerX, currentY);
    currentY += 26;
  });

  currentY += 14;

  // Párrafo 2 (Agradecimiento institucional)
  ctx.font = '15.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#334155';
  const p2Lines = wrapText(ctx, 'En nombre de toda la familia Pollo Fiesta S.A., queremos agradecerte de corazón por tu compromiso, dedicación y valioso esfuerzo diario.', maxWidth);
  p2Lines.forEach(line => {
    ctx.fillText(line, centerX, currentY);
    currentY += 24;
  });

  currentY += 14;

  // Párrafo 3 (Buenos deseos)
  ctx.font = '15.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#334155';
  const p3Lines = wrapText(ctx, 'Deseamos que este nuevo año de vida llegue lleno de salud, bendiciones, metas cumplidas y momentos memorables junto a tu familia.', maxWidth);
  p3Lines.forEach(line => {
    ctx.fillText(line, centerX, currentY);
    currentY += 24;
  });

  currentY += 18;

  // Línea divisoria elegante
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(centerX - 160, currentY);
  ctx.lineTo(centerX + 160, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  currentY += 14;

  // Cierre y Firma Institucional
  ctx.font = 'bold 20px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#b45309';
  ctx.fillText('¡Feliz Cumpleaños!', centerX, currentY);

  currentY += 26;

  ctx.font = 'bold 12.5px Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('GESTIÓN HUMANA & EQUIPO POLLO FIESTA S.A.', centerX, currentY);

  // 4. Retornar Buffer JPEG de alta calidad
  return canvas.toBuffer('image/jpeg', 95);
}

module.exports = {
  generateBirthdayCardImage
};

