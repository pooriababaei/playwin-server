"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var underscore_1 = __importDefault(require("underscore"));
var admin_1 = __importDefault(require("../db/models/admin"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default("Admin Controller:");
function getAdmin(req, res) {
    admin_1.default.findById(req.params.id, function (err, result) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).send(result);
    });
}
exports.getAdmin = getAdmin;
function getAdmins(req, res) {
    admin_1.default.find(function (err, result) {
        if (err) {
            return res.sendStatus(500);
        }
        return res
            .set({
            "Access-Control-Expose-Headers": "x-total-count",
            "x-total-count": result.length
        })
            .status(200)
            .send(result);
    });
}
exports.getAdmins = getAdmins;
function createAdmin(req, res) {
    var info = underscore_1.default.pick(req.body, "name", "username", "phone", "password", "email", "role");
    var admin = new admin_1.default(info);
    admin.save(function (err, admin) {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(200).send(admin);
    });
}
exports.createAdmin = createAdmin;
function updateAdmin(req, res) {
    var info = underscore_1.default.pick(req.body, "name", "username", "phone", "password", "email", "role");
    if (info.password) {
        var salt = bcryptjs_1.default.genSaltSync(10);
        var hash = bcryptjs_1.default.hashSync(info.password, salt);
        info.password = hash;
    }
    admin_1.default.findOneAndUpdate({ _id: req.params.id }, info, { new: true }, function (err, admin) {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(200).send(admin);
    });
}
exports.updateAdmin = updateAdmin;
function deleteAdmin(req, res) {
    admin_1.default.findOneAndRemove({ _id: req.params.id }, function (err, admin) {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send(admin);
    });
}
exports.deleteAdmin = deleteAdmin;
//# sourceMappingURL=adminController.js.map