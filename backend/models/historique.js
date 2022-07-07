const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var HistoriqueSchema = new Schema(
  {
    action: {
      type: String,
      enum: [
        "nouveau",
        "pret",
        "en cours de ramassage",
        "ramassé par livreur",
        "collecté",
        "en cours",
        "livré (espèce)",
        "livré (chèque)",
        "annulé",
        "retourné",
        "reporté",
        "retourné à l'expediteur",
        "livré - payé - espèce",
        "livré - payé - chèque",
      ],
      required: true,
      default: "nouveau",
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
    },
  },
  {
    timestamps: true,
  }
);

const Historique = mongoose.model("Historique", HistoriqueSchema);

module.exports = {
  Historique,
};
