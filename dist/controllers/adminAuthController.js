"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var async_1 = __importDefault(require("async"));
var crypto_js_1 = __importDefault(require("crypto-js"));
var debug_1 = __importDefault(require("debug"));
var nodemailer_1 = __importDefault(require("nodemailer"));
var debug = debug_1.default("AdminAuth Controller:");
var admin_1 = __importDefault(require("../db/models/admin"));
function login(req, res) {
    if (req.body.hasOwnProperty("password")) {
        var pass_1 = req.body.password;
        if (req.body.hasOwnProperty("username")) {
            var usernameOrEmail_1 = req.body.username;
            admin_1.default.findByUsername(usernameOrEmail_1, pass_1)
                .then(function (admin) {
                var token = admin.generateToken();
                return res.status(200).send({ token: token });
            })
                .catch(function () {
                admin_1.default.findByEmail(usernameOrEmail_1, pass_1)
                    .then(function (admin) {
                    var token = admin.generateToken();
                    return res.status(200).send({ token: token });
                })
                    .catch(function () {
                    return res.sendStatus(401);
                });
            });
        }
        else {
            return res.status(400).send();
        }
    }
    else {
        return res.status(400).send();
    }
}
exports.login = login;
function forgotPassword(req, res) {
    async_1.default.waterfall([
        function (done) {
            var wordArray = crypto_js_1.default.lib.WordArray.random(32);
            var token = wordArray.toString();
            console.log(token);
            done(null, token);
        },
        function (token, done) {
            admin_1.default.findOne({ email: req.params.email }, function (err, admin) {
                if (!admin) {
                    return res
                        .status(400)
                        .send("No account with that email address exists.");
                }
                admin.resetPasswordToken = token;
                admin.resetPasswordExpires = new Date(Date.now() + 3600000 / 2); // 1/2 hour
                admin.save(function (err) {
                    done(err, token, admin);
                });
            });
        },
        function (token, admin, done) {
            var smtpTransport = nodemailer_1.default.createTransport({
                service: "Gmail",
                auth: {
                    user: "pooriya.babaei.1997@gmail.com",
                    pass: "" //fill with pass
                }
            });
            var mailOptions = {
                to: admin.email,
                from: "passwordreset@demo.com",
                subject: "Node.js Password Reset",
                text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                    "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                    "http://" +
                    req.headers.host +
                    "admins/checkToken/" +
                    token +
                    "\n\n" +
                    "If you did not request this, please ignore this email and your password will remain unchanged.\n"
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                if (!err) {
                    res.send("An e-mail has been sent to " +
                        admin.email +
                        " with further instructions.");
                }
                done(err, "done");
            });
        }
    ], function (err) {
        if (err) {
            return res.status(500).send(err);
        }
    });
}
exports.forgotPassword = forgotPassword;
function checkToken(req, res) {
    if (req.params.token) {
        admin_1.default.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        }, function (err, admin) {
            if (!admin) {
                return res
                    .status(404)
                    .send("Password reset token is invalid or has expired.");
            }
            var response = { token: req.params.token };
            response.email = admin.email;
            res.status(200).send(response);
        });
    }
}
exports.checkToken = checkToken;
function resetPassword(req, res) {
    async_1.default.waterfall([
        function (done) {
            admin_1.default.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() }
            }, function (err, admin) {
                if (!admin) {
                    return res
                        .status(400)
                        .send("Password reset token is invalid or has expired.");
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
            var smtpTransport = nodemailer_1.default.createTransport({
                service: "Gmail",
                auth: {
                    user: "pooriya.babaei.1997@gmail.com",
                    pass: "pooriya861376"
                }
            });
            var mailOptions = {
                to: admin.email,
                from: "passwordreset@demo.com",
                subject: "Your password has been changed",
                text: "Hello,\n\n" +
                    "This is a confirmation that the password for your account " +
                    admin.email +
                    " has just been changed.\n"
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                if (!err) {
                    res.status(200).send("Success! Your password has been changed.");
                }
                done(err);
            });
        }
    ], function (err) {
        res.status(500).send(err);
    });
}
exports.resetPassword = resetPassword;
//# sourceMappingURL=adminAuthController.js.map