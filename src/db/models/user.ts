import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Model, model, Schema } from 'mongoose';
import { User } from '../../interfaces/user';
const userSchema: any = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      set: toLower,
      index: true,
    },

    invitingUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],

    reward: { type: Number, default: 0, index: true },

    totalReward: { type: Number, default: 0, index: true },

    coupon: { type: Number, default: 100 },

    achievements: [{ type: Schema.Types.ObjectId, ref: 'achievement' }],

    participatedLeagues: [{ type: Schema.Types.ObjectId, ref: 'league' }],

    phoneNumber: { type: String, required: true, unique: true, index: true },

    account: { type: String },

    loyalty: { type: Number, default: 0, index: true },

    avatar: { type: String, default: '0' },

    appSource: { type: String }, // each number for an app source like :bazaar , playStore,directP
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    versionKey: false,
  }
);
userSchema.index({ createdAt: 1 });
function toLower(v) {
  return v.toLowerCase();
}

userSchema.methods.generateToken = function () {
  let user = this;
  return jwt
    .sign(
      {
        _id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        role: 'user',
      },
      process.env.USER_KEY
    )
    .toString();
};

userSchema.statics.findByUsername = function (username, password) {
  const User = this;
  return User.findOne({ username }).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject(err);
        }
      });
    });
  });
};

interface UserModel extends Model<User> {
  fundByUsername: (username: string, password: string) => any;
}
const userModel: UserModel = model<User, UserModel>('user', userSchema);
export default userModel;
