const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var Joi = require("joi");

var FournisseurSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nom: {
      type: String,
      required: true,
    },
    adresse: {
      type: String,
      required: true,
    },
    codePostale: {
      type: Number,
      required: true,
    },
    tel: {
      type: Number,
      required: true,
      minlength: 8,
      maxlength: 8,
      unique: true,
    },
    fraisLivraison: {
      type: Number,
      default: 0,
    },
    fraisRetour: {
      type: Number,
      default: 0,
    },
    hash: String,
    salt: String,
    packages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Package",
      },
    ],
    clients: [
      {
        type: Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
    pickups: [
      {
        type: Schema.Types.ObjectId,
        ref: "Pickup",
      },
    ],
    finances: [
      {
        type: Schema.Types.ObjectId,
        ref: "Finance",
      },
    ],
    delegationId: {
      type: Schema.Types.ObjectId,
      ref: "Delegation",
    },
  },
  {
    timestamps: true,
  }
);

FournisseurSchema.methods.setPassword = (password, res) => {
  const fournisseur = this;
  // console.log(fournisseur.salt);
  fournisseur.salt = crypto.randomBytes(16).toString("hex");
  fournisseur.hash = crypto
    .pbkdf2Sync(password, fournisseur.salt, 1000, 64, "sha512")
    .toString("hex");
  // return JSON.stringify({ salt: fournisseur.salt, hash: fournisseur.hash });
  return [fournisseur.salt, fournisseur.hash];
};

// check password validity
FournisseurSchema.methods.validPassword = (salt, fournisseurHash, password) => {
  // const fournisseur = this;
  // console.log("tf:" + salt);
  console.log("slm 3asba");
  var hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  // console.log("hash:" + hash);
  // console.log("fournisseur hash:" + fournisseurHash);
  return fournisseurHash === hash;
};

// generate token
FournisseurSchema.methods.generateJWT = function () {
  const fournisseur = this;
  var expiry = new Date();
  //set expiry date
  expiry.setDate(expiry.getDate() + 1);

  return jwt.sign(
    {
      _id: fournisseur._id.toString(),
      email: fournisseur.email,
      nom: fournisseur.nom,
      delegation: fournisseur.delegation,
      adresse: fournisseur.adresse,
      codePostale: fournisseur.codePostale,
      tel: fournisseur.tel,
      exp: parseInt(expiry.getTime() / 1000),
    },
    process.env.SECRET
  );
};

var Fournisseur = mongoose.model("Fournisseur", FournisseurSchema);

const validate = (fournisseur) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    nom: Joi.string().min(3).max(255).required(),
    delegation: Joi.string().required(),
    adresse: Joi.string().required(),
    codePostale: Joi.number().required(),
    tel: Joi.number().min(8).required(),
    password: Joi.string().min(6).required(),
  }).unknown(true);

  return schema.validate(fournisseur);
};

const validateLogin = (fournisseur) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).unknown(true);

  return schema.validate(fournisseur);
};

module.exports = {
  Fournisseur,
  validateLogin,
};
// module.exports = Fournisseur;
