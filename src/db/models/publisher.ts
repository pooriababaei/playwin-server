import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Publisher } from '../../interfaces/publisher';
import { model, Model, Schema, Types } from 'mongoose';
const publisherSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      set: toLower,
    },

    name: { type: String, required: true },

    password: { type: String, required: true, minLength: 6 },

    publisherGame: {
      type: Schema.Types.ObjectId,
      ref: 'publisherGame',
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      set: toLower,
    },

    phone: { type: String, required: true },

    resetPasswordToken: { type: String },

    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    versionKey: false,
  }
);

function toLower(v) {
  return v.toLowerCase();
}

publisherSchema.methods.generateToken = function () {
  const publisher = this;
  return jwt
    .sign(
      {
        _id: publisher._id,
        username: publisher.username,
        phone: publisher.phone,
        email: publisher.email,
        gameId: publisher.game,
      },
      process.env.PUBLISHER_KEY
    )
    .toString();
};

publisherSchema.statics.findByUsername = function (username, password) {
  const Publisher = this;

  return Publisher.findOne({ username }).then((publisher) => {
    if (!publisher) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and publisher.password
      bcrypt.compare(password, publisher.password, (err, res) => {
        if (res) {
          resolve(publisher);
        } else {
          reject(err);
        }
      });
    });
  });
};
publisherSchema.statics.findByEmail = function (email, password) {
  const Publisher = this;
  return Publisher.findOne({ email }).then((publisher) => {
    if (!publisher) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and publisher.password
      bcrypt.compare(password, publisher.password, (err, res) => {
        if (res) {
          resolve(publisher);
        } else {
          reject();
        }
      });
    });
  });
};

publisherSchema.pre<Publisher>('save', function (next) {
  const publisher = this;
  if (publisher.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(publisher.password, salt, (err, hash) => {
        publisher.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

publisherSchema.virtual('id').get(function () {
  return this._id;
});

interface PublisherModel extends Model<Publisher> {
  findByUsername: (username: string, password: string) => any;
  findByEmail: (email: string, password: string) => any;
}
const publisherModel: PublisherModel = model<Publisher, PublisherModel>(
  'publisher',
  publisherSchema
);

export default publisherModel;
