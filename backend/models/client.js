const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Joi = require("joi");

var ClientSchema = new Schema(
  {
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
      required: false,
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
    packages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
      },
    ],
    fournisseurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fournisseur",
    },
    delegationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delegation",
    },
  },
  {
    timestamps: true,
  }
);

var Client = mongoose.model("Client", ClientSchema);

const validate = (client) => {
  const schema = Joi.object({
    nom: Joi.string().min(3).max(255).required(),
    ville: Joi.string().required(),
    delegation: Joi.string().required(),
    adresse: Joi.string().required(),
    tel: Joi.number().min(8).required(),
  });

  return schema.validate(client);
};

module.exports = {
  Client,
  validate,
};
// module.exports = Client;
