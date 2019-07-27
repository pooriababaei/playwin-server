const fs = require('fs');
const path= require('path');
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

module.exports = {replaceIdWith_IdInArray, replaceIdWith_Id,createDirectories};