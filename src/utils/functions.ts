import fs from 'fs';
import path from 'path';
export function createDirectories() {
    const dir = path.join(__dirname, '../../public/');
    const dir1 = path.join(__dirname, '../../public/leagues');
    const dir2 = path.join(__dirname, '../../public/games');
    const dir3 = path.join(__dirname, '../../public/boxes');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    if (!fs.existsSync(dir1)) {
        fs.mkdirSync(dir1);
    }
    if (!fs.existsSync(dir2)) {
        fs.mkdirSync(dir2);
    }
    if (!fs.existsSync(dir3)) {
        fs.mkdirSync(dir3);
    }
}
export function sendSMS(phone, code) {
    let Kavenegar = require('kavenegar');
    let api = Kavenegar.KavenegarApi({apikey: '724658576A51787A35486A4C7546714A534F376A4A433856495372384A5A3673'});
    api.Send({ message: `کد فعال سازی شما در پلی وین: ${code}`, receptor: phone });
}
