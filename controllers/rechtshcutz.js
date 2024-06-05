var express = require("express");
require("dotenv").config();
const router = express.Router();
const nodemailer = require("nodemailer");

var reschtutz = {

    sendRechtutzEmail: sendRechtutzEmail = async (req, res) => {

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
            from: '', // sender address
            to: "", // list of receivers marketing@finanu.ch
            subject: "Finanu Landing Leads", // Subject line
            text: `Gender: ${data.gender} \n
            Name: ${data.vorname} \n
            Email: ${data.email} \n
            Geburstdatum: ${data.birthday} \n
            Tel: ${data.telefonnumer} \n
            PLZ: ${data.plz} \n
            Ort: ${data.ort} \n
            Strasse: ${data.strasse} \n
            Insurance for: ${data.reschtutz} \n
            What are you looking for: ${data.res2} \n
            `, // plain text body
            html: "", // html body
        });

        return res.status(200).json({ message: info});
    }
}


module.exports = reschtutz