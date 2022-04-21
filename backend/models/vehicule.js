const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var VehiculeSchema = new Schema(
  {
    serie: {
      type: String,
      required: true,
      unique: true,
    },
    modele: {
      type: String,
      required: true,
    },
    assurance: {
      type: String,
      required: true,
    },
    dateCirculation: {
      type: Date,
      required: true,
    },
    imageCarteGrise: {
      data: Buffer,
      contentType: String,
    },
    dateVisite: {
      type: Date,
      required: true,
    },
    kilometrage: {
      type: String,
      required: true,
    },
    chauffeurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Vehicule = mongoose.model("Vehicule", VehiculeSchema);

module.exports = {
  Vehicule,
};
