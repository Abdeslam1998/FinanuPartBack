var express = require("express");

var util = require('util');
var mysql = require('mysql');
var multer = require('multer');

require("dotenv").config();
const router = express.Router();

var connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const query = util.promisify(connection.query).bind(connection);
contract = {
    saveSignContractPhoto: saveSignContractPhoto = async (req, res) => {
        try {


            var storage = multer.diskStorage({

                destination: function (req, file, callback) {
                    callback(null, './uploads');
                },
                filename: function (req, file, callback) {

                    var temp_file_arr = file.originalname.split(".");

                    var temp_file_name = temp_file_arr[0];
                    var temp_file_extension = temp_file_arr[1];
                    image_1 = temp_file_name + '-' + Date.now() + '.' + temp_file_extension

                    callback(null, temp_file_name + '-' + Date.now() + '.' + temp_file_extension);
                }

            });

            var upload = multer({ storage: storage }).fields([
                { name: 'image', maxCount: 1 },
            ]);


            upload(req, res, async function (error) {

                let image = req.files.image ? req.files.image[0].filename : ''
                let user_id = req.body.user_id;
                await query("INSERT INTO sign_contract_photo (user_id,image) VALUES (?,?)",
                    [user_id, image]);

            });

            res.status(200).json({ message: "Succesfully saved" });

        } catch (error) {
            res.status(404).json(error.message);
        }
    }
}
module.exports = contract