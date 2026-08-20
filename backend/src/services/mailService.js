const nodemailer = require("nodemailer");
const { getEmailSubject, generateBirthdayEmailHtml } = require('../templates/birthdayEmailTemplate');

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(" [MailService] Credenciales SMTP no configuradas completamente en .env.");
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (error) {
    console.error(" [MailService] Error creando Transporter SMTP:", error.message);
    return null;
  }
};

/**
 * Servicio para enviar felicitaciones de cumpleaños al correo de la tabla `persona`.
 * IMPORTANTE: Según instrucción explícita del usuario, NO se realizarán envíos de correos
 * hasta que se habilite explícitamente mediante la variable ENABLE_BIRTHDAY_EMAILS=true.
 */
async function sendBirthdayEmail(colaborador) {
  const isEnabled = String(process.env.ENABLE_BIRTHDAY_EMAILS).trim().toLowerCase() === 'true';
  const emailDestino = colaborador.email || colaborador.correo;
  const nombreColaborador = colaborador.name || colaborador.nombre_completo || "Colaborador(a)";
  const fecha = colaborador.date || "Hoy";

  if (!emailDestino) {
    console.log(`ℹ [MailService] No se puede felicitar a ${nombreColaborador} porque no tiene correo electrónico registrado.`);
    return { success: false, message: 'Sin correo de destino' };
  }

  // Verificar si está habilitado el envío real de correos de cumpleaños
  if (!isEnabled) {
    console.log(` [MailService - PAUSADO POR INSTRUCCIÓN] Felicitaciones preparadas para: "${nombreColaborador}" (${emailDestino}). EL ENVÍO REAL ESTÁ DESACTIVADO. Para reactivarlo, pon ENABLE_BIRTHDAY_EMAILS=true en el archivo .env`);
    return { success: true, simulated: true, message: 'Envío simulado (PAUSADO por configuración)' };
  }

  // RESTRICCIÓN DE SEGURIDAD: Solo enviar a MIGUEL ESTEBAN TELLEZ MORENO
  const targetName = "MIGUEL ESTEBAN TELLEZ MORENO";
  if (nombreColaborador.trim().toUpperCase() !== targetName) {
    console.log(` [MailService - RESTRINGIDO] Se omitió el envío a "${nombreColaborador}" porque el envío de correos está temporalmente restringido a ${targetName}.`);
    return { success: true, simulated: true, message: 'Envío simulado (Restringido a usuario específico)' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { success: false, message: 'Servicio de correo SMTP no disponible/no configurado' };
  }

  try {
    const { generateBirthdayCardImage } = require('./cardGeneratorService');

    // Selección aleatoria entre los 4 diseños oficiales de tarjetas postales
    const cardIndex = Math.floor(Math.random() * 4) + 1; // 1, 2, 3 o 4
    
    // Generar la tarjeta personalizada con el nombre y mensaje integrado
    const cardBuffer = await generateBirthdayCardImage(nombreColaborador, cardIndex);
    
    const attachments = [{
      filename: `tarjeta_cumpleanos_${nombreColaborador.replace(/\s+/g, '_')}.jpg`,
      content: cardBuffer,
      cid: 'birthday_card_final'
    }];

    const senderAddress = process.env.SMTP_FROM || 'informacion@pollo-fiesta.com';
    const subject = getEmailSubject(nombreColaborador);
    const htmlContent = generateBirthdayEmailHtml(nombreColaborador);

    const mailOptions = {
      from: `"Gestión Humana" <${senderAddress}>`,
      to: emailDestino,
      subject: subject,
      html: htmlContent,
      attachments: attachments
    };

    console.log(` [MailService] Enviando correo a ${nombreColaborador} (${emailDestino}) usando SMTP...`);
    
    const result = await transporter.sendMail(mailOptions);

    console.log(` [MailService] ¡Correo de cumpleaños ENVIADO con éxito a ${nombreColaborador} (${emailDestino})! Message ID: ${result.messageId}`);
    return { success: true, messageId: result.messageId, status: 'sent' };
  } catch (error) {
    console.error(` [MailService] Error al enviar correo de cumpleaños a ${emailDestino}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendBirthdayEmail,
  createTransporter
};
