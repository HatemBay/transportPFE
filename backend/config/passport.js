var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
const { isNumeric } = require("tslint");
var User = mongoose.model("User");
var Fournisseur = mongoose.model("Fournisseur");

//user login
passport.use(
  "user-local",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    function (username, password, done) {
      const queryObj = {};
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
          return done(null, false, { message: "Vous n'etes pas enregistré" });
        }
        // If credentials are correct, return the user object
        if (!user.validPassword(user.salt, user.hash, password)) {
          return done(null, false, { message: "Mot de passe incorrecte" });
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
    },
    function (username, password, done) {
      const queryObj = {};
      if (!isNaN(username)) {
        queryObj["tel"] = parseInt(username);
      } else {
        queryObj["email"] = username;
      }
      // console.log("uname: " + password);
      Fournisseur.findOne(
        { queryObj },
        function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, { message: "Vous n'etes pas enregistré" });
          }
          // If credentials are correct, return the user object
          if (!user.validPassword(user.salt, user.hash, password))
            return done(null, false, { message: "Mot de passe incorrecte" });
          return done(null, user);
        }
      );
    }
  )
);
