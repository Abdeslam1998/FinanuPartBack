var express = require("express");
var mysql = require('mysql');
var util = require('util');
const nodemailer = require('nodemailer');
const router = express.Router();
require("dotenv").config();

var connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const query = util.promisify(connection.query).bind(connection);

var automotorrad = {

    getMarke: getMarke = async (req, res) => {

        await query("SELECT Marke FROM automotorrad GROUP BY Marke ", async (err, response) => {
            res.status(200).json(response);
        });

    },
    getModell: getModell = async (req, res) => {

        let marke = req.params.actualMarke;

        await query("SELECT MarkeTyp FROM `automotorrad` WHERE Marke = ? GROUP BY MarkeTyp", [marke], async (err, response) => {
            res.status(200).json(response);
        });
    },

    getModellJahr: getModellJahr = async (req, res) => {
        let marke = req.params.actualMarke;
        let modell = req.params.modell;
      

        await query("SELECT Erstellung FROM automotorrad WHERE Marke = ? AND MarkeTyp = ? GROUP BY Erstellung", [marke,modell], (err, response) => {
            res.status(200).json(response);
        })
    },


    sendMailAutoMotorrad: sendMailAutoMotorrad = async (req, res) => {
        const data = req.body;
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        })

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Fred Foo 👻" 123123', // sender address
            to: "bleronmexhuani1@gmail.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });

        console.log("Message sent: %s", info.messageId);

    }
}

module.exports = automotorrad