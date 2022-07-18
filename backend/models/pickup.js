const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var PickupSchema = new Schema(
  {
    pickupNb: {
      type: Number,
      required: true,
      default: 1,
      unique: true,
    },
    isAllocated: {
      type: Boolean,
      required: true,
      default: false,
    },
    isPicked: {
      type: Boolean,
      required: true,
      default: false,
    },
    isCollected: {
      type: Boolean,
      required: true,
      default: false,
    },
    fournisseurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delegation",
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

const Pickup = mongoose.model("Pickup", PickupSchema);

module.exports = {
  Pickup,
};
