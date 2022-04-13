require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const cors = require("cors");
const fileUpload = require('express-fileupload');
require("./backend/db.js");
var usersController = require("./backend/controllers/usersController");
var packageController = require("./backend/controllers/packageController");
var fournisseurController = require("./backend/controllers/fournisseurController");
var clientController = require("./backend/controllers/clientController");
var filiereController = require("./backend/controllers/filiereController");
var { register, login, verify, auth, authRole } = require("./backend/controllers/authentication");
var upload = require("./backend/controllers/upload");
// const _ = require("lodash");


const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};



//passport
require("./backend/config/passport");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());
// app.use(express.urlencoded({ extended: true }));

// Listen for requests
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

// Middleware
app.use(logger("dev")); /* logging events */
app.use(passport.initialize());

// error handlers
// Unauthorized user access
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401);
    res.json({ message: err.name + ": " + err.message });
  }
});

app.use(cors(corsOptions));


// Routes
app.use("/api/packages", packageController);
app.use("/api/users", usersController);
app.use("/api/fournisseurs", fournisseurController);
app.use("/api/clients", clientController);
app.use("/api/filieres", filiereController);
app.use("/api/register", register);
app.use("/api/login", login);
app.use("/api/user/verify/:id/:token", verify);
app.use("/api/excel-upload", upload);

// app.use("/api/count", packageController);

// router.get('/profile', auth, ctrlp);
