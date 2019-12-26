"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var kavenegar_1 = __importDefault(require("kavenegar"));
function sendSMS(phone, code) {
    var api = kavenegar_1.default.KavenegarApi({
        apikey: "724658576A51787A35486A4C7546714A534F376A4A433856495372384A5A3673"
    });
    api.Send({
        message: "\u06A9\u062F \u0641\u0639\u0627\u0644 \u0633\u0627\u0632\u06CC \u0634\u0645\u0627 \u062F\u0631 \u067E\u0644\u06CC \u0648\u06CC\u0646: " + code,
        receptor: phone
    });
}
exports.sendSMS = sendSMS;
//# sourceMappingURL=sms.js.map