const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var PackageSchema = new Schema(
  {
    CAB: {
      type: Number,
      minlength: 10,
      maxlength: 10,
      unique: true,
      index: true,
    },
    service: {
      type: String,
      default: "livraison",
      enum: ["livraison", "collection", "echange"],
      reqiured: false,
    },
    libelle: {
      type: String,
      required: true,
    },
    c_remboursement: {
      type: Number,
      required: true,
    },
    volume: {
      type: String,
      default: "petit",
      enum: ["petit", "moyen", "grand"],
    },
    poids: {
      type: Number,
    },
    pieces: {
      type: Number,
    },
    etat: {
      type: String,
      enum: [
        "nouveau",
        "pret",
        "ramassé par livreur",
        "collecté",
        "en cours",
        "livré (espèce)",
        "livré (chèque)",
        "annulé",
        "reporté",
      ],
      reqiured: true,
      default: "nouveau",
    },
    remarque: {
      type: String,
    },
    fournisseurId: {
      type: Schema.Types.ObjectId,
      ref: "Fournisseur",
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    historique: [
      {
        type: Schema.Types.ObjectId,
        ref: "Historique",
      },
    ],
  },
  {
    timestamps: true,
    
  }
);

// generate unique CAB
PackageSchema.methods.generateCAB = () => {
  var number = Math.floor(Math.random * 10000000000);
  this.CAB = number;
  // PackageT.findOne({ CAB: number }, function (err, result) {
  //   if (err) throw(err);
  //   if (result.length == 0) {
  //     this.CAB = number
  //   }
  //   else return generateCAB()
  // });
};

const Package = mongoose.model("Package", PackageSchema);

module.exports = { Package };
