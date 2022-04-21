const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var VilleSchema = new Schema(
  {
    nom: {
      type: String,
      required: true,
      unique: true,
    },
    etat: {
      type: String,
      default: "ouverte",
      enum: ["ouverte", "fermée"],
    },
    delegations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Delegation",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Ville = mongoose.model("Ville", VilleSchema);

module.exports = {
  Ville,
};
