import CryptoJS from 'crypto-js';
import Debug from 'debug';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import League from '../db/models/league';

const debug = Debug('Middleware:');

export const isUser = (req, res, next) => {
  if (req.headers.authorization == null) {
    return res.sendStatus(401);
  }
  const authArray = req.headers.authorization.toString().split(' ');
  if (authArray.length !== 2) {
    return res.sendStatus(401);
  }
  const bearer = authArray[0];
  const token = authArray[1];

  if (bearer === 'Bearer' && token) {
    jwt.verify(token, process.env.USER_KEY, (err, decoded) => {
      if (err) {
        return res.sendStatus(401);
      }
      if (decoded && decoded.role && decoded.role === 'user') {
        req.userId = decoded._id;
        req.username = decoded.username;
        req.phoneNumber = decoded.phoneNumber;
        next();
      } else {
        return res.sendStatus(401);
      }
    });
  } else {
    return res.sendStatus(401);
  }
};

export const isAdmin = (req, res, next) => {
  if (req.headers.authorization == null) {
    return res.sendStatus(401);
  }
  const authArray = req.headers.authorization.toString().split(' ');
  if (authArray.length !== 2) {
    return res.sendStatus(401);
  }
  const bearer = authArray[0];
  const token = authArray[1];

  if (bearer === 'Bearer' && token) {
    jwt.verify(token, process.env.ADMIN_KEY, function (err, decoded) {
      if (err) {
        return res.sendStatus(401);
      }
      if (decoded && decoded.role && (decoded.role === 'admin' || decoded.role === 'superadmin')) {
        req.adminId = decoded._id;
        req.email = decoded.email;
        req.username = decoded.username;
        next();
      } else {
        return res.sendtatus(401);
      }
    });
  } else {
    return res.sendStatus(401);
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.headers.authorization == null) {
    return res.sendStatus(401);
  }
  const authArray = req.headers.authorization.toString().split(' ');
  if (authArray.length !== 2) {
    return res.sendStatus(401);
  }
  const bearer = authArray[0];
  const token = authArray[1];

  if (bearer === 'Bearer' && token) {
    jwt.verify(token, process.env.ADMIN_KEY, (err, decoded) => {
      if (err) {
        return res.send(401).send();
      }
      if (decoded && decoded.role && decoded.role === 'superadmin') {
        req.adminId = decoded._id;
        req.email = decoded.email;
        req.username = decoded.username;
        next();
      } else {
        return res.status(401).send();
      }
    });
  } else {
    return res.status(401).send();
  }
};

export const isUserOrAdmin = (req, res, next) => {
  if (req.headers.authorization == null) {
    return res.sendStatus(401);
  }
  const authArray = req.headers.authorization.toString().split(' ');
  if (authArray.length !== 2) {
    return res.sendStatus(401);
  }
  const bearer = authArray[0];
  const token = authArray[1];

  if (bearer === 'Bearer' && token) {
    jwt.verify(token, process.env.USER_KEY, (err, decoded) => {
      if (decoded && decoded.role && decoded.role === 'user') {
        req.userId = decoded._id;
        req.phoneNumber = decoded.phoneNumber;
        next();
      } else {
        jwt.verify(token, process.env.ADMIN_KEY, (err, decoded) => {
          if (
            decoded &&
            decoded.role &&
            (decoded.role === 'admin' || decoded.role === 'superadmin')
          ) {
            req.adminId = decoded._id;
            req.email = decoded.email;
            next();
          } else {
            return res.sendStatus(401);
          }
        });
      }
    });
  }
};

export const isPublisherOrAdmin = (req, res, next) => {
  if (req.headers.authorization == null) {
    return res.sendStatus(401);
  }
  const authArray = req.headers.authorization.toString().split(' ');
  if (authArray.length !== 2) {
    return res.sendStatus(401);
  }
  const bearer = authArray[0];
  const token = authArray[1];

  if (bearer === 'Bearer' && token) {
    jwt.verify(token, process.env.PUBLISHER_KEY, (err, decoded) => {
      if (decoded && decoded.role && decoded.role === 'user') {
        req.publisherId = decoded._id;
        req.email = decoded.email;
        next();
      } else {
        jwt.verify(token, process.env.ADMIN_KEY, (err, decoded) => {
          if (
            decoded &&
            decoded.role &&
            (decoded.role === 'admin' || decoded.role === 'superadmin')
          ) {
            req.adminId = decoded._id;
            req.email = decoded.email;
            next();
          } else {
            return res.sendStatus(401);
          }
        });
      }
    });
  }
};

export const isApp = (req, res, next) => {
  try {
    if (req.headers['content-size'] == null) {
      return res.sendStatus(401);
    }
    let phone = null;
    if (req.phoneNumber) {
      phone = req.phoneNumber;
    } else if (req.params.phoneNumber) {
      phone = req.params.phoneNumber;
    } else {
      return res.sendStatus(401);
    }
    const bytes = CryptoJS.AES.decrypt(req.headers['content-size'], process.env.APP_KEY + phone);
    if (bytes.toString() !== '') {
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      if (decryptedData.score) {
        req.score = decryptedData.score;
      }
      next();
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    return res.sendStatus(401);
  }
};

export const isPublisher = (req, res, next) => {
  if (req.headers.authorization == null) {
    return res.sendStatus(401);
  }
  const authArray = req.headers.authorization.toString().split(' ');
  if (authArray.length !== 2) {
    return res.sendStatus(401);
  }
  const bearer = authArray[0];
  const token = authArray[1];

  if (bearer === 'Bearer' && token) {
    jwt.verify(token, process.env.PUBLISHER_KEY, function (err, decoded) {
      if (err) {
        return res.sendStatus(401);
      }
      if (decoded && decoded.role) {
        req.publisherId = decoded._id;
        req.email = decoded.email;
        req.username = decoded.username;
        req.gameId = decoded.gameId;
        next();
      } else {
        return res.sendtatus(401);
      }
    });
  } else {
    return res.sendStatus(401);
  }
};

export const isLeagueUp = (req, res, next) => {
  let league;
  if (req.params.collectionName) {
    league = req.params.collectionName;
  } else if (req.body.collectionName) {
    league = req.body.collectionName;
  } else if (req.query.collectionName) {
    league = req.query.collectionName;
  }
  if (mongoose.modelNames().indexOf(league) > -1) {
    League.findOne(
      {
        collectionName: league,
      },
      (err, league) => {
        if (err) {
          return res.sendStatus(500);
        } else if (!league) {
          return res.sendStatus(404);
        } else if (
          league &&
          (league.available === false ||
            league.endTime.getTime() < Date.now() ||
            league.startTime.getTime() > Date.now())
        ) {
          // league is not up
          return res.sendStatus(404);
        } else {
          req.league = league;
          next();
        }
      }
    );
  } else {
    return res.sendStatus(404);
  }
};
