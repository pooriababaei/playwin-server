"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var jobSchema = new mongoose_1.Schema({
    property: { type: String, required: true },
    type: {
        type: String,
        enum: ["reward", "startLeague-announcment"],
        required: true
    },
    fireTime: { type: Date, required: true },
    processOwner: { type: Number }
}, { versionKey: false });
jobSchema.index({ property: 1, type: 1 }, { unique: true });
var jobModel = mongoose_1.model("job", jobSchema);
exports.default = jobModel;
//# sourceMappingURL=job.js.map