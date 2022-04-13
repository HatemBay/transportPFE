const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var Joi = require("joi");

var UserSchema = new Schema(
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
    role: {
      type: String,
      default: "admin",
      enum: [
        "admin",
        "financier",
        "commercial",
        "chef bureau",
        "chauffeur",
      ],
      required: true,
    },
    ville: {
      type: String,
      required: true,
    },
    delegation: {
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
    tel2: {
      type: Number,
      minlength: 8,
      maxlength: 8,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    hash: String,
    salt: String,
    filiereId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Filiere",
    }
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.setPassword = (password, res) => {
  const user = this;
  // console.log(user.salt);
  user.salt = crypto.randomBytes(16).toString("hex");
  user.hash = crypto
    .pbkdf2Sync(password, user.salt, 1000, 64, "sha512")
    .toString("hex");
  // return JSON.stringify({ salt: user.salt, hash: user.hash });
  return [user.salt, user.hash];
};

// check password validity
UserSchema.methods.validPassword = (salt, userHash, password) => {
  // const user = this;
  console.log("tf:" + salt);
  var hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  console.log("hash:" + hash);
  console.log("user hash:" + userHash);
  return userHash === hash;
};

// generate token
UserSchema.methods.generateJWT = function () {
  const user = this;
  var expiry = new Date();
  //set expiry date
  expiry.setDate(expiry.getDate() + 1);

  return jwt.sign(
    {
      _id: user._id.toString(),
      email: user.email,
      nom: user.nom,
      role: user.role,
      ville: user.ville,
      delegation: user.delegation,
      adresse: user.adresse,
      codePostale: user.codePostale,
      tel: user.tel,
      tel2: user.tel2,
      exp: parseInt(expiry.getTime() / 1000),
    },
    process.env.SECRET
  );
};

var User = mongoose.model("User", UserSchema);

const validate = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    nom: Joi.string().min(3).max(255).required(),
    role: Joi.string().valid(
      "admin",
      "financier",
      "commercial",
      "chef bureau",
      "fournisseur",
      "chauffeur",
      "client"
    ),
    ville: Joi.string().required(),
    delegation: Joi.string().required(),
    adresse: Joi.string().required(),
    codePostale: Joi.number().required(),
    tel: Joi.number().min(8).required(),
    tel2: Joi.number().min(8),
    password: Joi.string().min(6).required(),
  }).unknown(true);

  return schema.validate(user);
};

const validateLogin = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).unknown(true);

  return schema.validate(user);
};

module.exports = {
  User,
  validate,
  validateLogin,
};
// module.exports = User;
