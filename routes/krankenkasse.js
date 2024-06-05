var express = require("express");
var krankenkasse = require('../controllers/krankenkasse.js');
const upload = require('../middleware/Multer');
const router = express.Router();

router.get('/insurances/:plz/:ort/:commune', krankenkasse.getInsurance);
router.get('/regions', krankenkasse.getRegions);


router.post('/uploadinurance', upload.single('file'), krankenkasse.SaveinsurancePhoto);
router.get('/getInsurancePhoto/:insurance_id/:user_id', krankenkasse.getInsurancePhoto);
router.get('/photo/:filename', krankenkasse.getImagePath);

router.get('/actualmodel/:id/:kanton/:region', krankenkasse.getActualModel);


module.exports = router;
