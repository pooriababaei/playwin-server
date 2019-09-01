const _ = require('underscore');
const mongoose = require('mongoose');
const Admin = mongoose.model('admin');
const debug = require('debug')('Admin Controller:');

function getAdmin (req, res) {
  Admin.findById(req.params.id,(err, result) => {
    if (err) return res.sendStatus(500);
    return res.status(200).send(result);
  })
}

function getAdmins (req, res) {
  Admin.find((err, result) => {
    if (err) return res.sendStatus(500);
    return res.set({
      'Access-Control-Expose-Headers': 'x-total-count',
      'x-total-count': result.length
    }).status(200).send(result);
  })

}

function createAdmin (req, res) {
  const info = _.pick(req.body, 'name', 'username', 'phone', 'password', 'email','role');
  const admin = new Admin(info);
  admin.save((err, admin) => {
    if (err)
      return res.status(400).send(err);
    res.status(200).send(admin);
  })
}

function updateAdmin (req, res) {
  const info = _.pick(req.body, 'name', 'username', 'phone', 'password', 'email','role');
  Admin.findOneAndUpdate({_id:req.params.id},info,{new:true},(err, admin) => {
    if (err)
      return res.status(400).send(err);
    res.status(200).send(admin);
  })
}

function deleteAdmin (req, res) {
  Admin.findOneAndRemove({_id:req.params.id},(err, admin) => {
    if (err)
      return res.status(500).send(err);
    res.status(200).send(admin);
  })
}

module.exports = {
  getAdmin, getAdmins, createAdmin, updateAdmin, deleteAdmin
};