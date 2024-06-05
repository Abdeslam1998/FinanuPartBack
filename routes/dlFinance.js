var express = require("express");

var dl = require('../controllers/dlFinance.js');

const router = express.Router();

router.post('/sendEmailK', dl.sendEmailKunden);

router.post('/sendEmailA', dl.sendEmailAngebot);


module.exports = router