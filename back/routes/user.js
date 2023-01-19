const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/user');

router.post('/signup', sauceCtrl.signup);
router.post('/login', sauceCtrl.login);

module.exports = router;