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

const validate = (client) => {
  const schema = Joi.object({
    nom: Joi.string()
      .required()
      .unique((a, b) => a.nom === b.nom),
    adresse: Joi.string().required(),
  });

  return schema.validate(client);
};

module.exports = {
  Filiere,
  validate,
};
