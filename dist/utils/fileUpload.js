"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
var fileFilter = function (req, file, callback) {
    if (file.fieldname === 'game' && file.mimetype.indexOf('zip') === -1) {
        callback(null, false);
    }
    else if (file.fieldname === 'gif' && file.mimetype.indexOf('gif') === -1) {
        callback(null, false);
    }
    else if ((file.fieldname === 'images' || file.fieldname === 'mainImage' || file.fieldname === 'image') &&
        file.mimetype.indexOf('image') === -1) {
        callback(null, false);
    }
    callback(null, true);
};
var gameStorage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        var dir = path_1.default.join(__dirname, '../../public/games', req.body.name);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
        if (!fs_1.default.existsSync(dir + '/images')) {
            fs_1.default.mkdirSync(dir + '/images');
        }
        if (file.fieldname === 'images') {
            callback(null, path_1.default.join(__dirname, '../../public/games', req.body.name, 'images'));
        }
        else {
            callback(null, path_1.default.join(__dirname, '../../public/games', req.body.name));
        }
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
exports.gameUpload = multer_1.default({
    storage: gameStorage,
    fileFilter: fileFilter
}).fields([{
        name: 'images',
        maxCount: 5
    }, {
        name: 'mainImage',
        maxCount: 1
    }, {
        name: 'game',
        maxCount: 1
    }, {
        name: 'gif',
        maxCount: 1
    }]);
var leagueStorage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        var dir = path_1.default.join(__dirname, '../../public/leagues', req.body.collectionName);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
        if (!fs_1.default.existsSync(dir + '/images')) {
            fs_1.default.mkdirSync(dir + '/images');
        }
        if (file.fieldname === 'images') {
            callback(null, path_1.default.join(__dirname, '../../public/leagues', req.body.collectionName, 'images'));
        }
        else {
            callback(null, path_1.default.join(__dirname, '../../public/leagues', req.body.collectionName));
        }
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
exports.leagueUpload = multer_1.default({
    storage: leagueStorage,
    fileFilter: fileFilter
}).fields([{
        name: 'images',
        maxCount: 5
    }, {
        name: 'mainImage',
        maxCount: 1
    }, {
        name: 'game',
        maxCount: 1
    }, {
        name: 'gif',
        maxCount: 1
    }]);
var boxStorage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        var dir = path_1.default.join(__dirname, '../../public/boxes');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
        callback(null, path_1.default.join(__dirname, '../../public/boxes'));
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
exports.boxUpload = multer_1.default({
    storage: boxStorage,
    fileFilter: fileFilter
}).fields([{
        name: 'image',
        maxCount: 1
    }]);
//# sourceMappingURL=fileUpload.js.map