const _ = require('underscore');
const mongoose = require('mongoose');
const path = require('path');
const Box = mongoose.model('box');
const rimraf = require('rimraf');
const debug = require('debug')('Box Controller:');

function getBox (req, res) {
    Box.findById(req.params.id,(err, result) => {
        if (err) return res.sendStatus(500);
        return res.status(200).send(result);
    })
}

function getBoxes(req, res) {
    Box.find((err, result) => {
        if (err) return res.sendStatus(500);
        return res.set({
            'Access-Control-Expose-Headers': 'x-total-count',
            'x-total-count': result.length
        }).status(200).send(result);
    })
}

function createBox (req, res) {
    const info = _.pick(req.body, 'name', 'price', 'offPrice');
    if (req.files)
        info.image = '/public/boxes/' + req.files.image[0].filename;
    const box = new Box(info);
    box.save((err, box) => {
        debug(err)
        if (err) return res.sendStatus(500);
        if (box) return res.status(200).send(box);
        return res.sendStatus(400);
    });
}

function updateBox (req, res) {
    const info = _.pick(req.body, 'name', 'price', 'offPrice');
    if (req.files && req.files.image)
        info.image = '/public/boxes/' + req.files.image[0].filename;
    Box.findOneAndUpdate({_id: req.params.id}, info, {new: true}, (err, box) => {
        if (err) return res.sendStatus(500);
        if (box) return res.status(200).send(box);
        return res.sendStatus(400);
    });
}

function deleteBox (req, res) {
    Box.findOneAndRemove({_id: req.params.id}, (err, box) => {
        debug(req.body.id);
        if (err) {
            debug(err);
            return res.status(500).send(err);
        }
        else if (box) {
            rimraf.sync(path.join(__dirname, '../', req.body.image));
            return res.sendStatus(200);
        }
        else return res.sendStatus(404);
    });
}


module.exports = {
    getBox, getBoxes, createBox, updateBox, deleteBox
};