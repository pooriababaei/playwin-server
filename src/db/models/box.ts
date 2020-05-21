import { Model, model, Schema } from 'mongoose';
import { Box } from '../../interfaces/box';

const boxSchema = new Schema(
  {
    type: { type: Number },

    price: { type: Number, required: true },

    offPrice: { type: Number },

    coupon: { type: Number },

    endTime: { type: Date }
  },
  { versionKey: false }
);

const boxModel: Model<Box> = model<Box>('box', boxSchema);
export default boxModel;
