require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("./backend/db.js");
var usersController = require("./backend/controllers/usersController");
var packageController = require("./backend/controllers/packageController");
var fournisseurController = require("./backend/controllers/fournisseurController");
var clientController = require("./backend/controllers/clientController");
var filiereController = require("./backend/controllers/filiereController");
var vehiculeController = require("./backend/controllers/vehiculeController");
var villeController = require("./backend/controllers/villeController");
var delegationController = require("./backend/controllers/delegationController");
var pickupController = require("./backend/controllers/pickupController");
var historiqueController = require("./backend/controllers/historiqueController");
var roadmapController = require("./backend/controllers/roadmapController");
var {
  register,
  loginUser,
  loginProvider,
  verify,
  auth,
  authRole,
} = require("./backend/controllers/authentication");
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
app.use("/api/packages", auth, packageController);
app.use("/api/users", auth, usersController);
app.use("/api/fournisseurs", auth, fournisseurController);
app.use("/api/clients", auth, clientController);
app.use("/api/filieres", auth, filiereController);
app.use("/api/vehicules", auth, vehiculeController);
app.use("/api/villes", auth, villeController);
app.use("/api/delegations", auth, delegationController);
app.use("/api/pickups", auth, pickupController);
app.use("/api/historiques", auth, historiqueController);
app.use("/api/roadmaps", auth, roadmapController);
app.use("/api/register", auth, register);
app.use("/api/login-user", loginUser);
app.use("/api/login-provider", loginProvider);
app.use("/api/user/verify/:id/:token", auth, verify);
app.use("/api/excel-upload", auth, upload);

// app.use("/api/count", packageController);

// router.get('/profile', auth, ctrlp);
