import Debug from "debug";
import fs from "fs";
import path from "path";
import ZarinpalCheckout from "zarinpal-checkout";
import { PLAYWIN_API_URL } from "../utils/globals";
//const merchantId = fs.readFileSync(path.join(__dirname, '../keys/merchant_key')).toString();
import Box from "../db/models/box";
import User from "../db/models/user";
import BoxPurchase from "../db/models/boxPurchase";
const zarinpal = ZarinpalCheckout.create(process.env.MERCHANT_ID, false);
const debug = Debug("BoxPurchase Controller:");

///////// helper functions
function saveBoxTransaction(userId, transactionId, boxId) {
  const p = {
    user: userId,
    transactionId,
    box: boxId
  };
  const transaction = new BoxPurchase(p);
  return new Promise((resolve, reject) => {
    transaction.save((err, transaction) => {
      if (err) {
        reject(err);
      } else if (transaction) {
        resolve(transaction);
      }
    });
  });
} // used inside of buyBox
async function buyBox(userId, transactionId, boxId) {
  const box = await Box.findById(boxId);
  const [user, bt]: any = Promise.all([
    User.findOneAndUpdate(
      { _id: userId },
      { $inc: { coupon: box.coupon } },
      { new: true }
    ),
    saveBoxTransaction(userId, transactionId, boxId)
  ]);
  return { user, transaction: bt };
} // not sure how the usage will be. from client or an payment api.
///////// end of helper function

export function purchaseBox(req, res) {
  Box.findById(req.params.boxId, (err, box) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!box) {
      return res.sendStatus(400);
    } else {
      const price = box.offPrice ? box.offPrice : box.price;
      zarinpal
        .PaymentRequest({
          Amount: price, // In Tomans
          CallbackURL: PLAYWIN_API_URL + "/user/validatePurchase",
          Description: "خرید کوپن فرصت",
          Mobile: req.phoneNumber
        })
        .then(response => {
          if (response.status === 100) {
            return res.status(200).send({
              goTo: `https://www.zarinpal.com/pg/StartPay/${response.url}/MobileGate`
            });
          } else {
            return res.sendStatus(500);
          }
        })
        .catch(() => {
          return res.sendStatus(500);
        });
    }
  });
}

export function validatePurchase(req, res) {
  const authority = req.query.authority;
  const status = req.query.status;
  if (status === "OK") {
    zarinpal
      .PaymentVerification({
        Amount: "1000", // In Tomans
        Authority: "000000000000000000000000000000000000"
      })
      .then(response => {
        if (response.status === -21) {
          console.log("Empty!");
        } else {
          console.log(`Verified! Ref ID: ${response.RefID}`);
        }
      })
      .catch(err => {
        console.error(err);
      });
  }
} // must be completed !!!

export function totalPurchases(req, res) {
  BoxPurchase.aggregate(
    [
      {
        $group: {
          _id: null,
          sum: {
            $sum: "$amount"
          }
        }
      }
    ],
    (err, result) => {
      if (err) {
        return res.sendStatus(500);
      }
      if (!result || result.length === 0) {
        return res.status(200).send({ sum: 0 });
      }
      return res.status(200).send({ sum: result[0].sum });
    }
  );
} // mush add $match to get just paid purchases
