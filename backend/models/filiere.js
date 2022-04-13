const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var FiliereSchema = new Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    adresse: {
      type: String,
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Filiere = mongoose.model("Filiere", FiliereSchema);


module.exports = {
    Filiere
}