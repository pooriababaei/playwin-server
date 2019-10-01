const _ = require('underscore');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const debug = require('debug')('User Controller:');


function checkNewVersion (req,res) {
    if (req.params.version < newestAppVersion)   //there is a new version
        return res.status(200).json({code: 1, path: ''});
    return res.status(200).json({code: 0});
}

function getUser (req,res) {
    if(req.userId && req.userId !== req.params.id)
        return res.sendStatus(400);
    User.findById(req.params.id,(err,user)=> {
        if(err)
            res.sendStatus(500);
        else if (user == null)
            res.sendStatus(404);
        else res.status(200).json(user);

    });

}

async function getUsers(req, res) {
    let sort = null;
    let filter = null;

    if (req.query.sort)
        sort = JSON.parse(req.query.sort);
    if (req.query.filter)
        filter = JSON.parse(req.query.filter);


    let query = User.find();
    if (filter && filter.username) query.find({username: { $regex: '.*' + filter.username + '.*' } });
    if (filter && filter.phoneNumber) query.find({phoneNumber: { $regex: '.*' + filter.phoneNumber + '.*' }});
    let count = await User.find().countDocuments();
    if (sort)
        query.sort([sort]);
    query.skip((req.query.page - 1) * req.query.perPage).limit(parseInt(req.query.perPage)).exec((err, users) => {
        if (err) {
            return res.sendStatus(500);
        }

        if (!users)
            return res.sendStatus(404);
        return res.set({
            'Access-Control-Expose-Headers': 'x-total-count',
            'x-total-count': count
        }).status(200).json(users);
    });

}

function updateUser (req,res) {  // need to be checked
    const extraCoupons = req.query.extraCoupons;
    const info = _.pick(req.body, 'avatar', 'account');
    User.findOneAndUpdate({_id:req.userId},{...info,$inc:{coupons:extraCoupons === 'true'? ADVERTISE_AWARD_COUPON : 0}},{new:true},(err,user)=>{
        if(err)
            res.sendStatus(500);
        else if (!user)
            res.sendStatus(404);
        else
            return res.status(200).send(user);
    });
}

async function usersCount (req, res) {
    try {
        let count = await User.find().countDocuments();
        return res.status(200).send({count: count});
    }catch (e) {
        debug(e);
        res.sendStatus(500);
    }

}

module.exports = {
    checkNewVersion, getUser, updateUser,getUsers, usersCount
};
