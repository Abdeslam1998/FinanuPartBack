var express = require('express');
var util = require('util');
var mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

require("dotenv").config();

var connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const query = util.promisify(connection.query).bind(connection);
var user = {
    Register: Register = async (req, res) => {
        try {
            const data = req.body;
            const check_if_email_exists = await query("SELECT * FROM users WHERE email = ?", [data.email]);

            if (check_if_email_exists.length) {
                res.status(201).json("The email already exists");
            } else {
                const saltRounds = await bcrypt.genSalt(10);
                data.password = await bcrypt.hash(data.password, saltRounds);

                var base64Data = req.body.base64file;

                // Remove data URL scheme if present (data:image/png;base64,)
                // This is important for correctly interpreting the base64 encoded data
                var dataPrefix = "/^data:image\/\w+;base64,/";
                if (base64Data.match(dataPrefix)) {
                    base64Data = base64Data.replace(dataPrefix, "");
                }
                var base64filename = Date.now() + '-' + Math.floor(Math.random() * (5000)) + 100;

                // Write the base64 data to an image file
                fs.writeFile("uploads/" + base64filename, base64Data, 'base64', function (err) {
                    if (err) {
                        console.log("Error writing file:", err);
                    } else {
                        console.log("File saved successfully.");
                    }
                });
                const user = await query("INSERT INTO users (username, email, password, age, address, street,postal_code,city,kanton,region,signature) VALUES (?, ?, ?, ?, ?, ? , ?, ? ,? ,?,?)",
                    [data.username, data.email, data.password, data.age, data.address, data.street, data.postal_code, data.city, data.kanton, data.region, base64filename]);

                const getUserResult = await query("SELECT id FROM users WHERE email = ?", [data.email]);
                const userId = getUserResult[0].id;
                const insurance_user = await query("INSERT INTO insurance_users (user_id, insurance_id) VALUES (?, ?)", [userId, data.insurance_id]);

                // Generate JWT token
                const token = jwt.sign({
                    userId
                },
                    process.env.TOKEN_KEY, {
                    expiresIn: "2h",
                }
                );

                data.token = token;
                data.user_id = userId;

                const { password, insurance_id, base64file, ...userWithoutPassword } = data; // Destructure to remove the password

                // Generate user verify code and send to email
                let random_number = Math.floor(100000 + Math.random() * 900000);
                sendVerifyEmail(random_number, data.email);
                await query("INSERT INTO verify_codes (user_id, code) VALUES (?, ?)", [userId, random_number]);

                res.status(200).json(userWithoutPassword);
            }
        } catch (error) {
            res.status(404).json(error.message);
        }
    },
    Login: Login = async (req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;

            const user = await query("SELECT * FROM users WHERE email = ?", [email]);

            if (user.length) {
                const hashed_pass = user[0].password;
                const password_validate = await bcrypt.compare(password, hashed_pass);

                if (password_validate) {
                    const token = jwt.sign({
                        user
                    },
                        process.env.TOKEN_KEY, {
                        expiresIn: "2h",
                    }
                    );

                    user[0].token = token;
                    const { password, ...userWithoutPassword } = user[0]; // Destructure to remove the password

                    res.status(200).json(userWithoutPassword);
                } else {
                    res.status(500).json("Invalid Credentials");
                }
            } else {
                res.status(500).json("Invalid Credentials");
            }
        } catch (error) {
            res.status(404).json(error.message);
        }
    },


    generateVerifyCode: generateVerifyCode = async (req, res) => {
        const data = req.body;

        let user_id = data.user_id;
        const user = await query("SELECT * FROM users WHERE id = ?", [user_id]);

        let random_number = Math.floor(100000 + Math.random() * 900000);

        await query("INSERT INTO verify_codes (user_id,code) VALUES(?,?)", [user_id, random_number]);
        sendVerifyEmail(random_number, user[0].email)
        res.status(200).json({
            message: "Successfully code is generated"
        });
    },
    verifyCode: verifyCode = async (req, res) => {
        const data = req.body;
        let user_id = data.user_id;
        let code_provided = data.code;

        const check_data = await query("SELECT * FROM verify_codes WHERE user_id = ? ORDER BY id DESC", [user_id]);

        if (check_data.length) {
            if (code_provided == check_data[0].code) {
                //Update user verify
                var created_at = new Date(check_data[0].created_at);
                var date_now = new Date();

                if ((created_at.getTime() + 15 * 60000) >= date_now.getTime()) {
                    await query("UPDATE users SET is_verified = 1 WHERE id = ? ", [user_id]);

                    res.status(200).json({
                        message: "The verify code is valid",
                        verified: true
                    })
                } else {
                    res.status(400).json({
                        message: "The verify code has expired",
                        verified: false
                    });
                }
            } else {
                res.status(400).json({
                    message: "The verify code is not valid",
                    verified: false
                })
            }
        } else {
            res.status(400).json({
                message: "The verify code is not valid",
                verified: false
            })
        }
    },
    sendVerifyEmail: sendVerifyEmail = async (code, email) => {

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
            to: email, // list of receivers marketing@finanu.ch
            subject: "Verify Code", // Subject line
            text: `Code: ${code} \n `, // plain text body
            html: "", // html body
        });

        // return res.status(200).json({ message: info});
    },
    DeleteAccount: DeleteAccount = async (req, res) => {
        const data = req.body;
        let user_id = data.user_id;
        try {
            const checkUser = await query('SELECT id FROM users WHERE id = ?', [user_id]);
            if (checkUser.length == 0) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            const check_id = await query('DELETE FROM users WHERE id = ?', [user_id]);
            res.json({
                message: 'Account deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting account:', error);
            res.status(500).json({
                error: 'Error deleting account'
            });
        }
    },
    SaveInsurance: SaveInsurance = async (req, res) => {
        const data = req.body;
        const user_id = data.user_id;
        const insurance_id = data.insurance_number;

        try {
            const insurance_user = await query("INSERT INTO insurance_users (user_id, insurance_id) VALUES (?, ?)", [user_id, insurance_id]);

            return res.status(200).json({ message: 'Successfully Stored' });
        } catch (error) {
            console.error("Error on saving insurance:", error);
            return res.status(500).json({ message: error.message });
        }
    },
    getInsuranceById: getInsuranceById = async (req, res) => {
        const data = req.params;
        let user_id = data.user_id;
        try {
            const insurance = await query("SELECT DISTINCT insurance_id FROM insurance_users WHERE user_id = ?", [user_id]);

            if (insurance.length === 0) {
                return res.status(404).json({ message: "Insurance not found" });
            }
            const insuranceIds = insurance.map(ins => ins.insurance_id);
            const insuranceIdArray = [...new Set(insuranceIds.join(',').split(','))];

            const result = await query("SELECT id_, name FROM insurance WHERE number IN (?)", [insuranceIdArray]);

            return res.status(200).json(result);

        } catch (error) {
            console.error("Error on getting insurance:", error);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = user