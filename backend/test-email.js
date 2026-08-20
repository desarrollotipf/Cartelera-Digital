require('dotenv').config();
const { sendBirthdayEmail } = require('./src/services/mailService');

(async () => {
  const result = await sendBirthdayEmail({
    name: 'MIGUEL ESTEBAN TELLEZ MORENO',
    email: 'miguelesteban0510@gmail.com',
    date: '5 de octubre'
  });
  console.log(result);
})();
