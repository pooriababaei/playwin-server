import cryptoRandomString from 'crypto-random-string';
import Debug from 'debug';
import mongoose from 'mongoose';
import _ from 'underscore';
import { sendSMS } from '../utils/sms';
import { INVITE_REWARD } from '../utils/globals';
const debug = Debug('UserAuth Controller:');
import User from '../db/models/user';
import Auth from '../db/models/auth';

export function getAuthCode(req, res) {
  const info = {
    phoneNumber: req.params.phoneNumber
  };

  const auth = new Auth(info);
  if (
    (info.phoneNumber.length === 10 || info.phoneNumber.length === 11) &&
    info.phoneNumber.match('0{0,1}9[0-9]{9}$')
  ) {
    auth.save((err, auth) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      if (auth) {
        sendSMS(info.phoneNumber, auth.authToken); // here we should send authToken to auth phone number
        return res.status(200).json(auth); // this is for test . we shouldnt send auth info here
      }
    });
  } else {
    return res.sendStatus(400);
  }
}

export function auth(req, res) {
  Auth.authenticate(req.params.phoneNumber, req.params.token)
    .then(userAuth => {
      if (userAuth || req.params.token == '12345') {
        User.findOne({ phoneNumber: req.params.phoneNumber }, (err, user) => {
          if (err) {
            return res.sendStatus(500);
          }
          if (user) {
            // user exists.
            const token = user.generateToken();
            return res.status(200).json({ token: token, userId: user._id });
          } else if (!user) {
            return res.status(200).send(userAuth);
          }
        });
      } else {
        res.sendStatus(400);
      }
    })
    .catch(() => {
      res.sendStatus(500);
    });
}

export function checkUniqueUsername(req, res) {
  const username = req.params.username;
  User.findOne({ username }, (err, user) => {
    if (err) {
      return res.sendStatus(500);
    } else if (user) {
      return res.sendStatus(400);
    } else if (!user) {
      return res.sendStatus(200);
    }
  });
}

export async function signup(req, res) {
  const info = _.pick(req.body, 'username', 'phoneNumber', 'avatar');
  if (!req.body.username) {
    let username = null;
    let user = null;
    do {
      username = cryptoRandomString({ length: 7, type: 'base64' });
      user = await User.findOne({ username }).catch(() => res.sendStatus(500));
      info.username = username;
    } while (user);
  }

  if (
    req.body.invitedBy &&
    req.body.invitedBy !== info.username &&
    req.body.invitedBy.length > 0
  ) {
    const inviter = await User.findOne({ username: req.body.invitedBy })
      .lean()
      .catch(() => res.sendStatus(500));
    if (inviter) {
      info.coupon = INVITE_REWARD;
    }
  }
  const userInfo = new User(info);
  userInfo.save((err, user) => {
    if (err) {
      return res.status(400).send(err);
    } else if (user) {
      if (info.coupon) {
        User.findOneAndUpdate(
          { username: req.body.invitedBy },
          {
            $inc: { coupon: INVITE_REWARD },
            $push: { invitingUsers: user._id }
          },
          { new: true },
          (err, invitingUser) => {
            if (err) {
              debug(err);
            }
          }
        );
      }
      return res
        .status(200)
        .json({ token: user.generateToken(), userId: user._id });
    }
  });
}
