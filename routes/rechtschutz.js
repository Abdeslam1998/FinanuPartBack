var express = require("express");

var rechtschutz = require('../controllers/rechtshcutz.js');

const router = express.Router();

router.post('/sendEmail', rechtschutz.sendRechtutzEmail);


module.exports = router