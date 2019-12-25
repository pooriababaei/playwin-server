import { Model, model, Schema } from "mongoose";
import { Job } from "../../interfaces/job";

const jobSchema = new Schema(
  {
    property: { type: String, required: true },

    type: {
      type: String,
      enum: ["reward", "startLeague-announcment"],
      required: true
    },

    fireTime: { type: Date, required: true },

    processOwner: { type: Number }
  },
  { versionKey: false }
);
jobSchema.index({ property: 1, type: 1 }, { unique: true });

const jobModel: Model<Job> = model<Job>("job", jobSchema);
export default jobModel;
