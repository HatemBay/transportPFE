const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var FinanceSchema = new Schema(
  {
    financeNb: {
      type: Number,
      required: true,
      default: 1,
      unique: true,
    },
    totalCOD: {
      type: Number,
    },
    fraisLivraison: {
      type: Number,
    },
    fraisRetour: {
      type: Number,
    },
    totalFraisLivraison: {
      type: Number,
    },
    totalHorsFrais: {
      type: Number,
    },
    fournisseurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fournisseur",
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

const Finance = mongoose.model("Finance", FinanceSchema);

module.exports = {
  Finance,
};
