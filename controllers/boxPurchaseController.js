const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const merchantId = fs.readFileSync(path.join(__dirname, '../keys/merchant_key')).toString();
const ZarinpalCheckout = require('zarinpal-checkout');
const zarinpal = ZarinpalCheckout.create(merchantId, false);
const Box = mongoose.model('box');
const debug = require('debug')('BoxPurchase Controller:');

function purchaseBox (req,res) {
    Box.findById(req.params.boxId,(err,box)=>{
        if(err) return res.sendStatus(500);
        if(!box) return res.sendStatus(400);
        else {
            let price = box.offPrice ? box.offPrice : box.price;
            zarinpal.PaymentRequest({
                Amount: price, // In Tomans
                CallbackURL: PLAYWIN_API_URL + '/user/validatePurchase',
                Description: 'خرید کوپن فرصت',
                Mobile: req.phoneNumber
            }).then(response => {
                if (response.status === 100)  return res.status(200).send({goTo:`https://www.zarinpal.com/pg/StartPay/${response.url}/MobileGate`});
                else return res.sendStatus(500);

            }).catch(err => {
                return res.sendStatus(500);
            });
        }
    })

}

function validatePurchase (req, res) {
    const authority = req.query.authority;
    const status = req.query.status;
    if(status ==='OK') {
        zarinpal.PaymentVerification({
            Amount: '1000', // In Tomans
            Authority: '000000000000000000000000000000000000',
        }).then(response => {
            if (response.status === -21) {
                console.log('Empty!');
            } else {
                console.log(`Verified! Ref ID: ${response.RefID}`);
            }
        }).catch(err => {
            console.error(err);
        });
    }
}  // must be completed !!!

module.exports = {
    purchaseBox, validatePurchase
};