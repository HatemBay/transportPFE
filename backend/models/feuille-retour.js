const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var FeuilleRetourSchema = new Schema(
  {
    feuilleRetourNb: {
      type: Number,
      required: true,
      default: 1,
      unique: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // whManagerId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },
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

const FeuilleRetour = mongoose.model("FeuilleRetour", FeuilleRetourSchema);

module.exports = {
  FeuilleRetour,
};
