var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
const { Fournisseur } = require("../models/fournisseur");
const { User } = require("../models/users");
var crypto = require("crypto");

//user login
passport.use(
  "user-local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    function (username, password, done) {
      let queryObj = {};
      if (!isNaN(username)) {
        queryObj["tel"] = parseInt(username);
      } else {
        queryObj["email"] = username;
      }

      // console.log("uname: " + password);
      User.findOne(queryObj, function (err, user) {
        if (err) {
          console.log(err);
          return done(err);
        }
        if (!user) {
          return done("Email ou mot de passe incorrecte(s)", false);
        }
        // If credentials are correct, return the user object
        if (!user.validPassword(user.salt, user.hash, password)) {
          return done("Email ou mot de passe incorrecte(s)", false);
        }
        return done(null, user);
      });
    }
  )
);

//provider login
passport.use(
  "provider-local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (username, password, done) {
      let queryObj = {};
      if (!isNaN(username)) {
        queryObj["tel"] = parseInt(username);
      } else {
        queryObj["email"] = username;
      }
      // console.log("uname: " + password);
      var fournisseur = new Fournisseur();
      fournisseur = await Fournisseur.findOne(queryObj).then((user) => {
        console.log(user.email);
        return user;
      });
      // if (fourn) {
      //   return done(err);
      // }
      if (!fournisseur) {
        return done("Vous n'etes pas enregistré", false);
      }
      const hash = crypto
        .pbkdf2Sync(password, fournisseur.salt, 1000, 64, "sha512")
        .toString("hex");

      if (fournisseur.hash !== hash) {
        return done("Mot de passe incorrecte", false);
      } else {
        return done(null, fournisseur);
      }
    }
  )
);
