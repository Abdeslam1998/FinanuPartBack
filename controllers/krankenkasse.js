var express = require("express");
var mysql = require('mysql');
var util = require('util');
const nodemailer = require('nodemailer');
const path = require('path');
const router = express.Router();
require("dotenv").config();

var connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const query = util.promisify(connection.query).bind(connection);

var krankenkasse = {

    getInsurance: async (req, res) => {
        try {
            let plz = req.params.plz;
            let ort = req.params.ort;
            let commune = req.params.commune;
            const regionsResponse = await query("SELECT kanton,region FROM regions WHERE plz = ? AND ort = ? AND commune = ?", [plz, ort, commune]);
            if (regionsResponse.length === 0) {
                return res.status(404).json({ message: 'No regions found' });
            }
            let kanton = regionsResponse[0]['kanton'];
            let region = regionsResponse[0]['region'];
            const pramienResponse = await query("SELECT Versicherer FROM pramien WHERE Kanton = ? AND Region = ? GROUP BY Versicherer", [kanton, 'PR-REG CH' + region]);
            var data = [];
            pramienResponse.forEach(element => {
                data.push(element['Versicherer']);
            });
            const insuranceResponse = await query("SELECT * FROM insurance WHERE number IN(?)", [data]);
            res.status(200).json(insuranceResponse);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getRegions: async (req, res) => {
        try {
            const regionsResponse = await query("SELECT * FROM regions");
            res.status(200).json(regionsResponse);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getActualModel: async (req, res) => {
        let id = req.params.id;
        let kanton = req.params.kanton;
        let region = req.params.region;
        try {
            const actualModelResponse = await query("SELECT id, Tarifbezeichnung,Tariftyp FROM pramien WHERE Versicherer = ? AND Kanton = ? AND Region = ? GROUP BY Tarifbezeichnung", [id, kanton, 'PR-REG CH' + region]);
            res.status(200).json(actualModelResponse);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    SaveinsurancePhoto: async (req, res) => {
        const data = req.body;
        const insurance_id = data.insurance_id;
        const user_id = data.user_id;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const filePath = req.file.path;
        try {
            const checkResult = await query('SELECT * FROM insurance_image WHERE insurance_id = ? AND user_id = ?', [insurance_id, user_id]);
            if (checkResult.length > 0) {
                await query('UPDATE insurance_image SET image = ? WHERE insurance_id = ? AND user_id = ?', [filePath, insurance_id, user_id]);
                res.status(200).json({ message: 'File updated successfully', filePath });
            } else {
                await query('INSERT INTO insurance_image (insurance_id, user_id, image) VALUES (?, ?, ?)', [insurance_id, user_id, filePath]);
                res.status(200).json({ message: 'File saved successfully', filePath });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getInsurancePhoto: async (req, res) => {
        const data = req.params;
        const insurance_id = data.insurance_id;
        const user_id = data.user_id;
        try {
            if (!insurance_id || !user_id) {
                return res.status(400).json({ message: 'Missing fields' });
            }
            const results = await query('SELECT insurance_image.image, insurance.name FROM insurance_image JOIN insurance ON insurance_image.insurance_id = insurance.id_ WHERE insurance_image.insurance_id = ? AND insurance_image.user_id = ?', [insurance_id, user_id]);
            if (results.length > 0) {
                const insuranceImage = results[0].image;
                const insuranceName = results[0].name;
                return res.status(200).json({ insuranceImage, insuranceName });
            } else {
                return res.status(404).json({ message: 'Record not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getImagePath: async (req, res) => {
        const UPLOADS_FOLDER = path.join(__dirname, '..', 'uploads');
        const filename = req.params.filename;
        const filePath = path.join(UPLOADS_FOLDER, filename);

        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ message: 'Error sending file' });
            } else {
                console.log('File sent successfully');
            }
        });
    }
};

module.exports = krankenkasse;
