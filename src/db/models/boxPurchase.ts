import { Model, model, Schema } from "mongoose";
import { BoxPurchase } from "../../interfaces/boxPurchase";

const boxPurchaseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", index: true },

    authority: { type: String },

    amount: { type: Number, required: true },

    refId: { type: String }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    },
    versionKey: false
  }
);

const boxPurchaseModel: Model<BoxPurchase> = model<BoxPurchase>(
  "boxPurchase",
  boxPurchaseSchema
);
export default boxPurchaseModel;
