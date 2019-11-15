/*const jwt = require('jsonwebtoken');
const token = jwt.sign({
    app:true
},require('./keys').app_key).toString();

jwt.verify(token,require('./keys').app_key,(err, decoded)=>{
    debug(decoded)
});
debug(token);*/

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnRydWUsImlhdCI6MTU1MTgxNDY2OX0.B6S4Zyk_5kfORnqczVML6jnNy2q9pQWKl51162yYiTc
// const debug = require('debug')('Test');
// const s = null ;
// console.log(s? 1: 5);

var CryptoJS = require("crypto-js");

var data = "52"

// Encrypt
var ciphertext = CryptoJS.AES.encrypt(data, 's');
console.log(ciphertext.toString())
// Decrypt
var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
console.log(bytes.toString() === "")
//var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

//console.log(decryptedData.sdf == null);