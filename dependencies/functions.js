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

module.exports = {replaceIdWith_IdInArray, replaceIdWith_Id};