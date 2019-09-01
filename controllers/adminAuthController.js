const mongoose = require('mongoose');
const crypto = require('crypto-js');
const Admin = mongoose.model('admin');
const async = require("async");
const nodemailer = require("nodemailer");
const debug = require('debug')('AdminAuth Controller:');


function login (req, res) {
    if (req.body.hasOwnProperty('password')) {
        const pass = req.body.password;
        if (req.body.hasOwnProperty('username')) {
            const usernameOrEmail = req.body.username;
            Admin.findByUsername(usernameOrEmail, pass).then(admin => {
                const token = admin.generateToken();
                return res.status(200).send({token:token});
            }).catch(() => {
                Admin.findByEmail(usernameOrEmail, pass).then(admin => {
                    const token = admin.generateToken();
                    return res.status(200).send({token:token});
                }).catch(() => {
                    return res.sendStatus(401);
                });
            });
        }
        else return res.status(400).send();
    }
    else
        return res.status(400).send();
}

function forgotPassword (req, res) {
    async.waterfall([
        function (done) {
            const wordArray = crypto.lib.WordArray.random(32);
            const token = wordArray.toString();
            console.log(token);
            done(null, token);

        },
        function (token, done) {
            Admin.findOne({email: req.params.email}, function (err, admin) {
                if (!admin) {
                    return res.status(400).send('No account with that email address exists.');
                }

                admin.resetPasswordToken = token;
                admin.resetPasswordExpires = Date.now() + 3600000 / 2; // 1/2 hour

                admin.save(function (err) {
                    done(err, token, admin);
                });
            });
        },
        function (token, admin, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'pooriya.babaei.1997@gmail.com',
                    pass: '' //fill with pass
                }
            });
            var mailOptions = {
                to: admin.email,
                from: 'passwordreset@demo.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + 'admins/checkToken/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                if (!err)
                    res.send('An e-mail has been sent to ' + admin.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err)
            return res.status(500).send(err);
    });

}

function checkToken (req, res) {
    if (req.params.token) {
        Admin.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {$gt: Date.now()}
        }, function (err, admin) {
            if (!admin) {
                return res.status(404).send('Password reset token is invalid or has expired.')
            }
            let response = {token: req.params.token};
            response.email = admin.email;
            res.status(200).send(response);

        });
    }
}

function resetPassword (req, res) {
    async.waterfall([
        function (done) {
            Admin.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {$gt: Date.now()}
            }, function (err, admin) {
                if (!admin) {
                    return res.status(400).send('Password reset token is invalid or has expired.')
                }
                console.log(admin);
                admin.password = req.body.password;
                admin.resetPasswordToken = undefined;
                admin.resetPasswordExpires = undefined;

                admin.save(function (err) {
                    done(err, admin);

                });
            });
        },
        function (admin, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'pooriya.babaei.1997@gmail.com',
                    pass: 'pooriya861376'
                }
            });
            var mailOptions = {
                to: admin.email,
                from: 'passwordreset@demo.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + admin.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                if (!err)
                    res.status(200).send('Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.status(500).send(err);
    });
}

module.exports = {
    login, forgotPassword, checkToken, resetPassword
}