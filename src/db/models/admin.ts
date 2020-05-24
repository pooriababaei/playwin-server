import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../../interfaces/admin';
import { model, Model, Schema } from 'mongoose';
const adminSchema = new Schema(
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

    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
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

adminSchema.methods.generateToken = function () {
  let admin = this;
  return jwt
    .sign(
      {
        _id: admin._id,
        username: admin.username,
        phone: admin.phone,
        email: admin.email,
        role: admin.role,
      },
      process.env.ADMIN_KEY
    )
    .toString();
};

adminSchema.statics.findByUsername = function (username, password) {
  const Admin = this;

  return Admin.findOne({ username }).then((admin) => {
    if (!admin) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and admin.password
      bcrypt.compare(password, admin.password, (err, res) => {
        if (res) {
          resolve(admin);
        } else {
          reject(err);
        }
      });
    });
  });
};
adminSchema.statics.findByEmail = function (email, password) {
  const Admin = this;
  return Admin.findOne({ email }).then((admin) => {
    if (!admin) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, admin.password, (err, res) => {
        if (res) {
          resolve(admin);
        } else {
          reject();
        }
      });
    });
  });
};

adminSchema.pre<Admin>('save', function (next) {
  const admin = this;
  if (admin.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(admin.password, salt, (err, hash) => {
        admin.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

adminSchema.virtual('id').get(function () {
  return this._id;
});

interface AdminModel extends Model<Admin> {
  findByUsername: (username: string, password: string) => any;
  findByEmail: (email: string, password: string) => any;
}
const adminModel: AdminModel = model<Admin, AdminModel>('admin', adminSchema);

export default adminModel;
