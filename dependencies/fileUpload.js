const multer = require('multer');
const uuidv1 = require('uuid/v1');
const fs = require('fs');
const path = require('path');

const fileFilter = function (req, file, callback) {
    if (file.fieldname === 'game' && file.mimetype.indexOf('zip') === -1)
        callback(null, false);
    else if (file.fieldname === 'gif' && file.mimetype.indexOf('gif') === -1)
        callback(null, false);
    else if ((file.fieldname === 'images' || file.fieldname === 'mainImage' || file.fieldname === 'image') && file.mimetype.indexOf('image') === -1)
        callback(null, false);


    callback(null, true);
};

const gameStorage = multer.diskStorage({
    destination: function (req, file, callback) {

        const dir = path.join(__dirname, '../public/games', req.body.name);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        if (!fs.existsSync(dir + '/images'))
            fs.mkdirSync(dir + '/images');

        if (file.fieldname === 'images')
            callback(null, path.join(__dirname, '../public/games', req.body.name, 'images'));
        else
            callback(null, path.join(__dirname, '../public/games', req.body.name));

    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const gameUpload = multer({
    storage: gameStorage,
    fileFilter: fileFilter
}).fields([{name: 'images', maxCount: 5}, {name: 'mainImage', maxCount: 1}, {
    name: 'game',
    maxCount: 1
}, {name: 'gif', maxCount: 1}]);


const leagueStorage = multer.diskStorage({
    destination: function (req, file, callback) {

        const dir = path.join(__dirname, '../public/leagues', req.body.name);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        if (!fs.existsSync(dir + '/images'))
            fs.mkdirSync(dir + '/images');

        if (file.fieldname === 'images')
            callback(null, path.join(__dirname, '../public/leagues', req.body.name, 'images'));
        else
            callback(null, path.join(__dirname, '../public/leagues', req.body.name));

    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const leagueUpload = multer({
    storage: leagueStorage,
    fileFilter: fileFilter
}).fields([{name: 'images', maxCount: 5}, {name: 'mainImage', maxCount: 1}, {
    name: 'game',
    maxCount: 1
}, {name: 'gif', maxCount: 1}]);


const boxStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        const dir = path.join(__dirname, '../public/boxes');
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        callback(null, path.join(__dirname, '../public/boxes'));
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const boxUpload = multer({
    storage: boxStorage,
    fileFilter: fileFilter
}).fields([{name: 'image', maxCount: 1}]);

const adminStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        const dir = path.join(__dirname, '../public/admins');
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        callback(null, path.join(__dirname, '../public/admins'));
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const adminUpload = multer({
    storage: adminStorage,
    fileFilter: fileFilter
}).fields([{name: 'image', maxCount: 1}]);

module.exports = {
    gameUpload,
    leagueUpload,
    boxUpload,
    adminUpload
};