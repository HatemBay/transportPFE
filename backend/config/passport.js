var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Fournisseur = mongoose.model("Fournisseur");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    function (username, password, done) {
      // console.log("uname: " + password);
      User.findOne({ email: username }, function (err, user) {
        // If credentials are correct, return the user object
        if (!err && user && user.validPassword(user.salt, user.hash, password))
          return done(null, user);

        Fournisseur.findOne({ email: username }, function (err, user2) {
          if (err) {
            return done(err);
          }
          // Return if user not found in database
          if (!user && !user2) {
            return done(null, false, "User not found");
          }
          // Return if password is wrong
          if (!user2.validPassword(user2.salt, user2.hash, password)) {
            return done(null, false, "Password is wrong");
          }
          // If credentials are correct, return the user object
          return done(null, user2);
        });
      });
    }
  )
);
