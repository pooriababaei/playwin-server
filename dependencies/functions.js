const fs = require('fs');
const path= require('path');
const fetchUri = require('fetch').fetchUrl;
const replaceIdWith_IdInArray = (arr) => {
    return arr.map(item => {
        let temp = item._doc;
        temp.id = temp._id;
        delete temp._id;
        return temp;
    });
};
const replaceIdWith_Id = (item) => {
    let temp = item._doc;
    temp.id = temp._id;
    delete temp._id;
    return temp;
};
function createDirectories() {
    const dir = path.join(__dirname, '../public/');
    const dir1 = path.join(__dirname, '../public/leagues');
    const dir2 = path.join(__dirname, '../public/games');
    const dir3 = path.join(__dirname, '../public/boxes');
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    if (!fs.existsSync(dir1))
        fs.mkdirSync(dir1);
    if (!fs.existsSync(dir2))
        fs.mkdirSync(dir2);
    if (!fs.existsSync(dir3))
        fs.mkdirSync(dir3);
}
function sendSMS(phone,code) {
    var Kavenegar = require('kavenegar');
    var api = Kavenegar.KavenegarApi({apikey: '724658576A51787A35486A4C7546714A534F376A4A433856495372384A5A3673'});
    api.Send({ message: `کد فعال سازی شما در پلی وین: ${code}`, receptor: phone });
}

module.exports = {replaceIdWith_IdInArray, replaceIdWith_Id,createDirectories,sendSMS};
