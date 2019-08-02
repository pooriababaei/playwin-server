const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Admin = mongoose.model('admin');
const {adminUpload} = require('../dependencies/fileUpload');
const async = require("async");
const nodemailer = require("nodemailer");
const {isSuperAdmin}= require('../dependencies/middleware');
const {replaceIdWith_IdInArray, replaceIdWith_Id} = require('../dependencies/functions');
const _ = require('underscore');



router.post('/',adminUpload, function (req, res) {
    console.log(req.body);
    const info = _.pick(req.body, 'name', 'username', 'phone', 'password', 'email','role');
    const admin = new Admin(info);
    admin.save((err, admin) => {
        if (err)
            return res.status(400).send(err);
        res.status(200).send(admin);
    })
});  // this should be for superUser
router.put('/:adminId',adminUpload, function (req, res) {
    if(!req.params.adminId) return res.sendStatus(400);

    const info = _.pick(req.body, 'name', 'username', 'phone', 'password', 'email','role');
    Admin.findOneAndUpdate({_id:req.params.adminId},info,{new:true},(err, admin) => {
        if (err)
            return res.status(400).send(err);
        res.status(200).send(admin);
    })
});  // this should be for superUser
router.delete('/:adminId', function (req, res) {
    if(!req.params.adminId) return res.sendStatus(400);
    Admin.findOneAndRemove({_id:req.params.adminId},(err, admin) => {
        if (err)
            return res.status(500).send(err);
        res.status(200).send(admin);
    })
});
router.get('/', (req, res) => {
    Admin.find((err, result) => {
        if (err) return res.sendStatus(500);
        return res.set({
            'Access-Control-Expose-Headers': 'x-total-count',
            'x-total-count': result.length
        }).status(200).send(replaceIdWith_IdInArray(result));
    })
});
router.get('/:id', (req, res) => {
    Admin.findById(req.params.id,(err, result) => {
        if (err) return res.sendStatus(500);
        return res.status(200).send(replaceIdWith_Id(result));
    })
});

module.exports=router;