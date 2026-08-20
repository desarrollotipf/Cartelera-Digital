require('dotenv').config();
const { getCumpleanos } = require('./src/controllers/cumpleanosController');

process.env.USE_LOCAL_CSV = 'true';

const req = {};
const res = {
  json: (data) => {
    console.log("Response:", JSON.stringify(data, null, 2));
  },
  status: (code) => {
    console.log("Status:", code);
    return res;
  }
};

getCumpleanos(req, res);
