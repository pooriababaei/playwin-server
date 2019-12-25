import mongoose from "mongoose";
import { Model, model, Schema } from "mongoose";
import { ToPay } from "../../interfaces/toPay";
import AutoIncrement from "mongoose-sequence";
const autoIncrement = AutoIncrement(mongoose);

const toPaySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user" },

    amount: { type: Number, required: true, index: true },

    paid: { type: Boolean, default: false, index: true },

    payTime: { type: Date },

    paymentNumber: { type: Number }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    },
    versionKey: false
  }
);
toPaySchema.index({ createdAt: 1 });
toPaySchema.plugin(autoIncrement, { inc_field: "paymentNumber" });

const toPayModel: Model<ToPay> = model<ToPay>("toPay", toPaySchema);
export default toPayModel;
