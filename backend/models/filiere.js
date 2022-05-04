const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var FiliereSchema = new Schema(
  {
    nom: {
      type: String,
      required: true,
      unique: true,
    },
    adresse: {
      type: String,
      required: true,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
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
  Filiere,
};
