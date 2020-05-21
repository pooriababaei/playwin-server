import async from 'async';
import crypto from 'crypto-js';
import Debug from 'debug';
import nodemailer from 'nodemailer';
import Admin from '../db/models/admin';

const debug = Debug('AdminAuth Controller:');

export function login(req, res) {
  if (req.body.hasOwnProperty('password')) {
    const pass = req.body.password;
    if (req.body.hasOwnProperty('username')) {
      const usernameOrEmail = req.body.username;
      Admin.findByUsername(usernameOrEmail, pass)
        .then((admin) => {
          const token = admin.generateToken();
          return res.status(200).send({ token });
        })
        .catch(() => {
          Admin.findByEmail(usernameOrEmail, pass)
            .then((admin) => {
              const token = admin.generateToken();
              return res.status(200).send({ token });
            })
            .catch(() => {
              return res.sendStatus(401);
            });
        });
    } else {
      return res.status(400).send();
    }
  } else {
    return res.status(400).send();
  }
}
export function forgotPassword(req, res) {
  async.waterfall(
    [
      (done) => {
        const wordArray = crypto.lib.WordArray.random(32);
        const token = wordArray.toString();
        console.log(token);
        done(null, token);
      },
      (token, done) => {
        Admin.findOne({ email: req.params.email }, function (err, admin) {
          if (!admin) {
            return res.status(400).send('No account with that email address exists.');
          }

          admin.resetPasswordToken = token;
          admin.resetPasswordExpires = new Date(Date.now() + 3600000 / 2); // 1/2 hour

          admin.save(function (err) {
            done(err, token, admin);
          });
        });
      },
      (token, admin, done) => {
        let smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'pooriya.babaei.1997@gmail.com',
            pass: '', // fill with pass
          },
        });
        let mailOptions = {
          to: admin.email,
          from: 'passwordreset@demo.com',
          subject: 'Node.js Password Reset',
          text:
            'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' +
            req.headers.host +
            'admins/checkToken/' +
            token +
            '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n',
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          if (!err) {
            res.send('An e-mail has been sent to ' + admin.email + ' with further instructions.');
          }
          done(err, 'done');
        });
      },
    ],
    (err) => {
      if (err) {
        return res.status(500).send(err);
      }
    }
  );
}
export function checkToken(req, res) {
  if (req.params.token) {
    Admin.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: new Date() },
      },
      (err, admin) => {
        if (!admin) {
          return res.status(404).send('Password reset token is invalid or has expired.');
        }
        const response: any = { token: req.params.token };
        response.email = admin.email;
        res.status(200).send(response);
      }
    );
  }
}
export function resetPassword(req, res) {
  async.waterfall(
    [
      (done) => {
        Admin.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: new Date() },
          },
          (err, admin) => {
            if (!admin) {
              return res.status(400).send('Password reset token is invalid or has expired.');
            }
            console.log(admin);
            admin.password = req.body.password;
            admin.resetPasswordToken = undefined;
            admin.resetPasswordExpires = undefined;

            admin.save((err) => {
              done(err, admin);
            });
          }
        );
      },
      (admin, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'pooriya.babaei.1997@gmail.com',
            pass: 'pooriya861376',
          },
        });
        const mailOptions = {
          to: admin.email,
          from: 'passwordreset@demo.com',
          subject: 'Your password has been changed',
          text:
            'Hello,\n\n' +
            'This is a confirmation that the password for your account ' +
            admin.email +
            ' has just been changed.\n',
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          if (!err) {
            res.status(200).send('Success! Your password has been changed.');
          }
          done(err);
        });
      },
    ],
    (err) => {
      res.status(500).send(err);
    }
  );
}
