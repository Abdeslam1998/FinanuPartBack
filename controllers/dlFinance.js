var express = require("express");
require("dotenv").config();
const router = express.Router();
const nodemailer = require("nodemailer");

var dlFinance = {

    sendEmailAngebot: sendEmailAngebot = async (req, res) => {

        const data = req.body;
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "", // generated ethereal user
                pass: "", // generated ethereal password
            },
        })

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'marketing@finanu.ch', // sender address
            to: "marketing@finanu.ch", // list of receivers marketing@finanu.ch
            subject: "Dl Finance - Angebot einholen", // Subject line
            text: `
            Fullname: ${data.fullname} \n
            Email: ${data.email} \n
            Tel: ${data.telefonnumer} \n
            Nachricht: ${data.news} \n
            `, // plain text body
            html: "", // html body
        });

        return res.status(200).json({ message: info });
    },
    sendEmailKunden: sendEmailKunden = async (req, res) => {

        const data = req.body;
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "317.hostserv.eu",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "", // generated ethereal user
                pass: "", // generated ethereal password
            },
        })

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'marketing@finanu.ch', // sender address
            to: "marketing@finanu.ch", // list of receivers marketing@finanu.ch
            subject: "Dl Finance - Referrer", // Subject line
            text: `
            Name: ${data.vorname} ${data.nachname} \n
            Strasse: ${data.strasse} \n
            Plz: ${data.plz} \n
            Ort: ${data.ort} \n
            Land: ${data.land} \n
            Email: ${data.email} \n
            Kundennummer: ${data.num} \n
            `, // plain text body
            html: "", // html body
        });

        return res.status(200).json({ message: info });
    },
}


module.exports = dlFinance