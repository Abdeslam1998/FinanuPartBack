const express = require('express');
const user = require('../controllers/users.js');
const contract = require('../controllers/sign_contract.js');

const auth = require('../middleware/Auth');

const router = express.Router();

router.post("/register", user.Register);
router.post("/login", user.Login);
router.post("/verifyCode",user.verifyCode);
router.delete('/delete', auth, user.DeleteAccount);
router.post("/generateVerifyCode",user.generateVerifyCode);
router.post("/sign_contract",contract.saveSignContractPhoto);
router.post('/saveinsurance',SaveInsurance);
router.get('/getinsurance/:user_id', getInsuranceById)

router.get("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

module.exports = router;