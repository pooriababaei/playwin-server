"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var mongoose_1 = require("mongoose");
var adminSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        set: toLower
    },
    name: { type: String, required: true },
    password: { type: String, required: true, minLength: 6 },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        set: toLower
    },
    phone: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" }
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt"
    },
    versionKey: false
});
function toLower(v) {
    return v.toLowerCase();
}
adminSchema.methods.generateToken = function () {
    var admin = this;
    return jsonwebtoken_1.default
        .sign({
        _id: admin._id,
        username: admin.username,
        phoneNumber: admin.phoneNumber,
        email: admin.email,
        role: admin.role
    }, process.env.ADMIN_KEY)
        .toString();
};
adminSchema.statics.findByUsername = function (username, password) {
    var Admin = this;
    return Admin.findOne({ username: username }).then(function (admin) {
        if (!admin) {
            return Promise.reject();
        }
        return new Promise(function (resolve, reject) {
            // Use bcrypt.compare to compare password and admin.password
            bcryptjs_1.default.compare(password, admin.password, function (err, res) {
                if (res) {
                    resolve(admin);
                }
                else {
                    reject(err);
                }
            });
        });
    });
};
adminSchema.statics.findByEmail = function (email, password) {
    var Admin = this;
    return Admin.findOne({ email: email }).then(function (admin) {
        if (!admin) {
            return Promise.reject();
        }
        return new Promise(function (resolve, reject) {
            // Use bcrypt.compare to compare password and user.password
            bcryptjs_1.default.compare(password, admin.password, function (err, res) {
                if (res) {
                    resolve(admin);
                }
                else {
                    reject();
                }
            });
        });
    });
};
adminSchema.pre("save", function (next) {
    var admin = this;
    if (admin.isModified("password")) {
        bcryptjs_1.default.genSalt(10, function (err, salt) {
            bcryptjs_1.default.hash(admin.password, salt, function (err, hash) {
                admin.password = hash;
                next();
            });
        });
    }
    else {
        next();
    }
});
adminSchema.virtual("id").get(function () {
    return this._id;
});
var adminModel = mongoose_1.model("admin", adminSchema);
exports.default = adminModel;
//# sourceMappingURL=admin.js.map