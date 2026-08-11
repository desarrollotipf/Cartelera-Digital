const express = require('express');
const router = express.Router();
const { getCumpleanos, sendBirthdayGreetings } = require('../controllers/cumpleanosController');

router.get('/', getCumpleanos);
router.post('/send-greetings', sendBirthdayGreetings);

module.exports = router;
