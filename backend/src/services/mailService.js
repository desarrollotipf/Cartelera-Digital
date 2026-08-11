const nodemailer = require('nodemailer');
const { getEmailSubject, generateBirthdayEmailHtml } = require('../templates/birthdayEmailTemplate');

// Configuración de transporte SMTP desde variables de entorno
const createTransporter = () => {
  if (!process.env.SMTP_HOST) {
    console.warn("⚠️ [MailService] Servidor SMTP no configurado en .env (SMTP_HOST faltante).");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS || '',
    } : undefined,
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Servicio para enviar felicitaciones de cumpleaños al correo de la tabla `persona`.
 * IMPORTANTE: Según instrucción explícita del usuario, NO se realizarán envíos de correos
 * hasta que se habilite explícitamente mediante la variable ENABLE_BIRTHDAY_EMAILS=true.
 */
async function sendBirthdayEmail(colaborador) {
  const isEnabled = process.env.ENABLE_BIRTHDAY_EMAILS === 'true';
  const emailDestino = colaborador.email || colaborador.correo;
  const nombreColaborador = colaborador.name || colaborador.nombre_completo || "Colaborador(a)";
  const fecha = colaborador.date || "Hoy";

  if (!emailDestino) {
    console.log(`ℹ️ [MailService] No se puede felicitar a ${nombreColaborador} porque no tiene correo electrónico registrado.`);
    return { success: false, message: 'Sin correo de destino' };
  }

  // Verificar si está habilitado el envío real de correos de cumpleaños
  if (!isEnabled) {
    console.log(`🔒 [MailService - PAUSADO POR INSTRUCCIÓN] Felicitaciones preparadas para: "${nombreColaborador}" (${emailDestino}). EL ENVÍO REAL ESTÁ DESACTIVADO. Para reactivarlo, pon ENABLE_BIRTHDAY_EMAILS=true en el archivo .env`);
    return { success: true, simulated: true, message: 'Envío simulado (PAUSADO por configuración)' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { success: false, message: 'Servicio de correo SMTP no disponible/no configurado' };
  }

  try {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'gestionhumana@pollofiesta.com';
    const subject = getEmailSubject(nombreColaborador);
    const htmlContent = generateBirthdayEmailHtml(nombreColaborador, fecha);

    const info = await transporter.sendMail({
      from: `"Gestión Humana - Pollo Fiesta S.A." <${fromAddress}>`,
      to: emailDestino,
      subject: subject,
      html: htmlContent
    });

    console.log(`📧 [MailService] ¡Correo de cumpleaños ENVIADO con éxito a ${nombreColaborador} (${emailDestino})! Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [MailService] Error al enviar correo de cumpleaños a ${emailDestino}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendBirthdayEmail,
  createTransporter
};
