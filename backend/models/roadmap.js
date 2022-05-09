const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var RoadmapSchema = new Schema(
  {
    roadmapNb: {
      type: Number,
      required: true,
      default: 1,
      unique: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    packages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model("Roadmap", RoadmapSchema);

module.exports = {
  Roadmap,
};
