/**
 * ============================================================================
 * PLANTILLA DE CORREO ELECTRÓNICO DE FELICITACIONES POR CUMPLEAÑOS 
 * ============================================================================
 * 
 * INSTRUCCIONES PARA EDITAR EL CORREO:
 * Puedes modificar los textos, asunto y colores directamente en las variables de abajo.
 * Cuando se decida habilitar el envío, este será el formato exacto que recibirán
 * en el correo electrónico de la tabla `persona`.
 */

// 1. ASUNTO DEL CORREO (Puedes cambiar el título que sale en la bandeja de entrada)
function getEmailSubject(nombre) {
  return `🎉 ¡Feliz Cumpleaños ${nombre}! - De parte de toda la familia Pollo Fiesta S.A.`;
}

// 2. TEXTOS Y SALUDOS (Modifica el mensaje institucional que verá el colaborador)
const TITULO_PRINCIPAL = "¡Hoy celebramos tu cumpleaños!";
const MENSAJE_SUBTITULO = "En este día tan especial, toda la familia de Pollo Fiesta S.A. te desea un maravilloso cumpleaños.";
const MENSAJE_AGRADECIMIENTO = "Te agradecemos sinceramente por tu compromiso, esfuerzo diario y por aportar día a día al crecimiento de nuestro gran equipo. ¡Esperamos que disfrutes este nuevo año de vida rodeado de paz, salud y de tus seres queridos!";
const FIRMA_INSTITUCIONAL = "Con cariño,<br><strong>Gestión Humana & Equipo Pollo Fiesta S.A.</strong>";
const COLOR_BRAND = "#0b4274"; // Azul Corporativo Oficial Pollo Fiesta

/**
 * Genera el cuerpo en código HTML del correo de felicitaciones.
 * @param {string} nombre - Nombre completo o corto del colaborador
 * @param {string} fecha - Fecha string reformateada de su cumpleaños (ej. "17 de Julio")
 */
function generateBirthdayEmailHtml(nombre, fecha = "") {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Feliz Cumpleaños!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- TARJETA PRINCIPAL -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 35px rgba(11, 66, 116, 0.15); border: 1px solid #e2e8f0;">
          
          <!-- ENCABEZADO CON AZUL CORPORATIVO -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, ${COLOR_BRAND} 0%, #1e3a8a 100%); padding: 45px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                ${TITULO_PRINCIPAL}
              </h1>
            </td>
          </tr>

          <!-- CUERPO DEL CORREO -->
          <tr>
            <td style="padding: 40px 35px; text-align: center;">
              <h2 style="color: ${COLOR_BRAND}; font-size: 24px; margin: 0 0 15px 0; font-weight: 700;">
                ¡Hola, ${nombre}!
              </h2>
              <p style="font-size: 17px; line-height: 1.6; color: #475569; margin: 0 0 25px 0;">
                ${MENSAJE_SUBTITULO}
              </p>
              
              <!-- CAJA DE DECORACIÓN -->
              <div style="background-color: #f8fafc; border-left: 5px solid ${COLOR_BRAND}; padding: 22px; border-radius: 8px; margin-bottom: 30px; text-align: left; border-right: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0;">
                  "${MENSAJE_AGRADECIMIENTO}"
                </p>
              </div>

              <!-- FIRMA -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 25px;">
                <p style="font-size: 16px; color: ${COLOR_BRAND}; margin: 0; line-height: 1.5;">
                  ${FIRMA_INSTITUCIONAL}
                </p>
              </div>
            </td>
          </tr>

          <!-- PIE DE PÁGINA -->
          <tr>
            <td align="center" style="background-color: #f1f5f9; padding: 20px; font-size: 12px; color: #64748b;">
              <p style="margin: 0;">
                Este es un mensaje institucional automático del Sistema de Gestión Humana de Pollo Fiesta S.A.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

module.exports = {
  getEmailSubject,
  generateBirthdayEmailHtml,
  COLOR_BRAND
};
