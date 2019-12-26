import { Model, model, Schema } from 'mongoose';
import { Scoreboard } from '../../interfaces/scoreboard';
export function scoreboardModel(collectionName, opp?): Model<Scoreboard> {
  if (opp != null) {
    const scoreboardSchema = new Schema(
      {
        user: { type: Schema.Types.ObjectId, ref: 'user', index: true },

        score: { type: Number, default: 0, index: true },

        opportunity: { type: Number, default: opp },

        played: { type: Number, default: 1 },

        createdAt: { type: Date },

        updatedAt: { type: Date, index: true }
      },
      { collection: collectionName, versionKey: false }
    );
    scoreboardSchema.index({ score: -1, updatedAt: 1 });

    const scoreboardModel: Model<Scoreboard> = model<Scoreboard>(
      collectionName,
      scoreboardSchema
    );
    return scoreboardModel;
  } else {
    const scoreboardModel: Model<Scoreboard> = model<Scoreboard>(
      collectionName
    );
    return scoreboardModel;
  }
}
