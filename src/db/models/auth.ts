import Debug from "debug";
import { Model, model, Schema } from "mongoose";
import { Auth } from "../../interfaces/auth";
const debug = Debug("Auth Model:");

const authSchema = new Schema(
  {
    phoneNumber: { type: String, required: true },

    authToken: { type: Number },

    createdAt: { type: Date, default: Date.now, expires: 90 } // 90 seconds
  },
  { collection: "auth", versionKey: false }
);

authSchema.statics.authenticate = function(phoneNumber, authToken) {
  let Auth = this;
  const user = {
    phoneNumber,
    authToken
  };

  return Auth.findOne({ ...user }, (err, res) => {
    if (err) {
      debug("err");
    }
    if (res) {
      return Promise.resolve(res);
    } else if (!res) {
      return Promise.resolve();
    }
  });
};
authSchema.pre<Auth>("save", function(next) {
  this.authToken = Math.floor(Math.random() * (99999 - 10000) + 10000);
  return next();
});

interface AuthModel extends Model<Auth> {
  authenticate: (phoneNumber: any, token: string) => any;
}
const authModel: AuthModel = model<Auth, AuthModel>("auth", authSchema);
export default authModel;
