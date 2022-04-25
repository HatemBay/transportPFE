const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var DelegationSchema = new Schema(
  {
    nom: {
      type: String,
      required: true,
      unique: true,
    },
    villeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ville",
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    clients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
    fournisseurs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fournisseur",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Delegation = mongoose.model("Delegation", DelegationSchema);

module.exports = {
  Delegation,
};
