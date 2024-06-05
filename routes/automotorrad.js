var express = require("express");
var automotorrad = require('../controllers/automotorrad.js');

const router = express.Router();

router.get('/getMarke', automotorrad.getMarke);
router.get('/getModell/:actualMarke',automotorrad.getModell);
router.get('/getModellJahr/:actualMarke/:modell',automotorrad.getModellJahr);

module.exports = router