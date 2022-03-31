const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var tokenSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const Token = mongoose.model("token", tokenSchema) ;

module.exports = Token;
