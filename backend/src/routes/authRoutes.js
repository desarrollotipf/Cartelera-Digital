const express = require('express');
const router = express.Router();
const { login, redeemOtt } = require('../controllers/authController');

router.post('/login', login);
router.post('/ott/redeem', redeemOtt);

module.exports = router;
