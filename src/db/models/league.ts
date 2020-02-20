import { Model, model, Schema } from 'mongoose';
import { League } from '../../interfaces/league';
const leagueSchema = new Schema(
  {
    name: { type: String, minLength: 3, required: true },

    collectionName: { type: String, unique: true },

    description: { type: String },

    kind: { type: Number, required: true },

    leadersNumber: { type: Number, default: 0, required: true },

    reward: { type: Number, default: 0, required: true },

    loyaltyGiven: { type: Number, default: 0 },

    loyaltyReward: { type: Number, default: 0 },

    rewarded: { type: Boolean, default: false },

    defaultOpportunity: { type: Number, required: true },

    maxOpportunity: { type: Number },

    startTime: { type: Date, required: true },

    endTime: { type: Date, required: true },

    game: { type: String },

    available: { type: Boolean, default: false }, // available to users

    images: [{ type: String }],

    mainImage: { type: String, required: true },

    html: { type: String, default: '/index.html' },

    gameZip: { type: String },

    color: { type: String }
  },
  { versionKey: false }
);

const leagueModel: Model<League> = model<League>('league', leagueSchema);
export default leagueModel;
