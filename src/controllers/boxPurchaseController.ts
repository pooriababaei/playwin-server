import Debug from 'debug';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import ZarinpalCheckout from 'zarinpal-checkout';
import {PLAYWIN_API_URL} from '../utils/globals';
//const merchantId = fs.readFileSync(path.join(__dirname, '../keys/merchant_key')).toString();
const zarinpal = ZarinpalCheckout.create(process.env.MERCHANT_ID, false);
const Box = mongoose.model('box');
const BoxPurchase = mongoose.model('boxPurchase');
const debug = Debug('BoxPurchase Controller:');

export function purchaseBox(req, res) {
    Box.findById(req.params.boxId, (err, box) => {
        if (err) { return res.sendStatus(500); }
        if (!box) { return res.sendStatus(400); } else {
            const price = box.offPrice ? box.offPrice : box.price;
            zarinpal.PaymentRequest({
                Amount: price, // In Tomans
                CallbackURL: PLAYWIN_API_URL + '/user/validatePurchase',
                Description: 'خرید کوپن فرصت',
                Mobile: req.phoneNumber,
            }).then((response) => {
                if (response.status === 100) {  return res.status(200).send({goTo: `https://www.zarinpal.com/pg/StartPay/${response.url}/MobileGate`}); } else { return res.sendStatus(500); }

            }).catch(() => {
                return res.sendStatus(500);
            });
        }
    });
}

export function validatePurchase(req, res) {
    const authority = req.query.authority;
    const status = req.query.status;
    if (status === 'OK') {
        zarinpal.PaymentVerification({
            Amount: '1000', // In Tomans
            Authority: '000000000000000000000000000000000000',
        }).then((response) => {
            if (response.status === -21) {
                console.log('Empty!');
            } else {
                console.log(`Verified! Ref ID: ${response.RefID}`);
            }
        }).catch((err) => {
            console.error(err);
        });
    }
}  // must be completed !!!

export function totalPurchases(req, res) {
    BoxPurchase.aggregate([{
        $group: {
            _id: null,
            sum: {
                $sum: '$amount',
            },
        },
    }], (err, result) => {
        if (err) { return res.sendStatus(500); }
        if (!result || result.length === 0) {
           return res.status(200).send({sum: 0});
        }
        return res.status(200).send({sum: result[0].sum});
    });
} // mush add $match to get just paid purchases