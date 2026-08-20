/**
 * ============================================================================
 * PLANTILLA DE CORREO ELECTRÓNICO DE FELICITACIONES POR CUMPLEAÑOS - POLLO FIESTA S.A.
 * ============================================================================
 */

function getEmailSubject(nombre) {
  return `🎉 ¡Feliz Cumpleaños ${nombre}! - De parte de toda la familia Pollo Fiesta S.A.`;
}

/**
 * Genera el contenedor HTML 100% responsive para la tarjeta de felicitaciones.
 * @param {string} nombre - Nombre del colaborador
 */
function generateBirthdayEmailHtml(nombre) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Feliz Cumpleaños ${nombre}!</title>
  <style>
    @media only screen and (max-width: 600px) {
      .card-container { width: 100% !important; border-radius: 16px !important; }
      .outer-table { padding: 15px 5px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <table class="outer-table" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        
        <!-- TARJETA POSTAL RESPONSIVE -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; width: 100%;">
          <tr>
            <td align="center">
              <div class="card-container" style="width: 100%; max-width: 560px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.16); background-color: #fef3c7;">
                <img 
                  src="cid:birthday_card_final" 
                  alt="¡Feliz Cumpleaños ${nombre}!" 
                  width="560"
                  style="width: 100%; max-width: 560px; height: auto; display: block; border: 0; outline: none;" 
                />
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 18px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              Mensaje institucional automático • Pollo Fiesta S.A. • Gestión Humana
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
  generateBirthdayEmailHtml
};
