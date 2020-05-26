import fs from 'fs';
import multer from 'multer';
import path from 'path';

const fileFilter = (req, file, callback) => {
  if (file.fieldname === 'game' && file.mimetype.indexOf('zip') === -1) {
    callback(null, false);
  } else if (file.fieldname === 'gif' && file.mimetype.indexOf('gif') === -1) {
    callback(null, false);
  } else if (
    (file.fieldname === 'images' || file.fieldname === 'mainImage' || file.fieldname === 'image') &&
    file.mimetype.indexOf('image') === -1
  ) {
    callback(null, false);
  }
  callback(null, true);
};

const gameStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (req.body.name == null) callback(false, null);
    else {
      const dir = path.join(__dirname, '../../public/games', req.body.name);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      if (!fs.existsSync(dir + '/images')) {
        fs.mkdirSync(dir + '/images');
      }

      if (file.fieldname === 'images') {
        callback(null, path.join(__dirname, '../../public/games', req.body.name, 'images'));
      } else {
        callback(null, path.join(__dirname, '../../public/games', req.body.name));
      }
    }
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
export const gameUpload = multer({
  storage: gameStorage,
  fileFilter,
}).fields([
  {
    name: 'images',
    maxCount: 5,
  },
  {
    name: 'mainImage',
    maxCount: 1,
  },
  {
    name: 'game',
    maxCount: 1,
  },
  {
    name: 'gif',
    maxCount: 1,
  },
]);

const leagueStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (req.body.collectionName == null) callback(false, null);
    else {
      const dir = path.join(__dirname, '../../public/leagues', req.body.collectionName);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      if (!fs.existsSync(dir + '/images')) {
        fs.mkdirSync(dir + '/images');
      }
      if (file.fieldname === 'images') {
        callback(
          null,
          path.join(__dirname, '../../public/leagues', req.body.collectionName, 'images')
        );
      } else {
        callback(null, path.join(__dirname, '../../public/leagues', req.body.collectionName));
      }
    }
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
export const leagueUpload = multer({
  storage: leagueStorage,
  fileFilter,
}).fields([
  {
    name: 'images',
    maxCount: 5,
  },
  {
    name: 'mainImage',
    maxCount: 1,
  },
  {
    name: 'game',
    maxCount: 1,
  },
  {
    name: 'gif',
    maxCount: 1,
  },
]);

const boxStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    const dir = path.join(__dirname, '../../public/boxes');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    callback(null, path.join(__dirname, '../../public/boxes'));
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
export const boxUpload = multer({
  storage: boxStorage,
  fileFilter,
}).fields([
  {
    name: 'image',
    maxCount: 1,
  },
]);

const publisherGameStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    const dir = path.join(__dirname, '../../public/publisherGameImages', req.body.name);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    callback(null, path.join(__dirname, '../../public/publisherGameImages', req.body.name));
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
export const publisherGameUpload = multer({
  storage: publisherGameStorage,
  fileFilter,
}).fields([
  {
    name: 'image',
    maxCount: 1,
  },
]);
