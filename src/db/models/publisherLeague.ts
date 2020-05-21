import { Model, model, Schema } from 'mongoose';
import { PublisherLeague } from '../../interfaces/publisherLeague';
const leagueSchema = new Schema(
  {
    game: { type: Schema.Types.ObjectId, ref: 'publisherGame' },

    collectionName: { type: String, unique: true },

    description: { type: String },

    leadersNumber: { type: Number },

    reward: { type: Number },

    rewarded: { type: Boolean },

    defaultOpportunity: { type: Number },

    maxOpportunity: { type: Number },

    startTime: { type: Date, required: true }, // should check later on controllers

    endTime: { type: Date, required: true },

    available: { type: Boolean, default: false }, // available to users
  },
  { versionKey: false }
);

const publisherLeagueModel: Model<PublisherLeague> = model<PublisherLeague>(
  'publisherLeague',
  leagueSchema
);
export default publisherLeagueModel;
