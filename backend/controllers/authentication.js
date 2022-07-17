var passport = require("passport");
var mongoose = require("mongoose");
var sendEmail = require("../utils/email");
var Token = require("../models/token");
var { validate, validateLogin } = require("../models/users");
var crypto = require("crypto");
var jwt = require("express-jwt");
const { Fournisseur } = require("../models/fournisseur");
const { User } = require("../models/users");

const register = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  var user = new User();

  var encrypted = user.setPassword(req.body.password, res);
  if (!encrypted) return;

  (user.email = req.body.email),
    (user.nom = req.body.nom),
    (user.role = req.body.role),
    (user.ville = req.body.ville),
    (user.delegation = req.body.delegation),
    (user.adresse = req.body.adresse),
    (user.codePostale = req.body.codePostale),
    (user.tel = req.body.tel),
    (user.tel2 = req.body.tel2),
    (user.salt = encrypted[0]),
    (user.hash = encrypted[1]),
    user.save(async (err, doc) => {
      // If Passport throws/catches an error
      if (err) {
        res.status(404).json(err);
        return;
      }

      if (user) {
        var token;
        token = user.generateJWT();
        // mail verification token
        var verifToken = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();

        const message = `${process.env.BASE_URL}/user/verify/${user.id}/${verifToken.token}`;
        await sendEmail(user.email, "Verify Email", message);

        res.status(200);
        res.json({
          token: token,
          message: "user registered successfully",
          // verification: "An Email sent to your account please verify",
        });
      }
      // If user is not found
      else res.status(401).json(info);
    });
};

const loginUser = (req, res) => {
  passport.authenticate("user-local", function (err, user, info) {
    var token;

    // If Passport throws/catches an error
    if (err) {
      console.log(err);
      res.status(404).json(err);
      console.log(err);
      return;
    }

    // If a user is found
    if (user) {
      token = user.generateJWT();
      // console.log("username:" + user.nom);
      res.status(200);
      res.json({
        token: token,
        message: "login successful",
      });
    } else {
      // If user is not found
      const { error } = validateLogin(req.body);
      if (error) return res.status(400).send(error.details[0].message);
      res.status(401).json(info);
    }
  })(req, res);
};

const loginProvider = (req, res) => {
  passport.authenticate("provider-local", function (err, user, info) {
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      console.log(err);
      return;
    }

    // If a user is found
    if (user) {
      token = user.generateJWT();
      // console.log("username:" + user.nom);
      res.status(200);
      console.log("login successful");
      res.json({
        token: token,
        message: "login successful",
      });
    } else {
      // If user is not found
      const { error } = validateLogin(req.body);
      if (error) {
        console.log("erreur: " + error.details[0].message);
        return res.status(400).send(error.details[0].message);
      }
      res.status(401).json(info);
    }
  })(req, res);
};

const forgotPasswordFourn = async (req, res) => {
  const email = req.body.email;
  var fournisseur = new Fournisseur();

  fournisseur = await Fournisseur.findOne({ email: email }).then((doc) => {
    if (doc && doc !== null) {
      return doc;
    } else {
      console.log("Cet Email n'est pas enregistré");
      return res.status(400).send("Cet Email n'est pas enregistré");
    }
  });
  var generatedPassword = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  const generatedPasswordLength = 12;
  for (var i = 0; i < generatedPasswordLength; i++) {
    generatedPassword += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  const encrypted = fournisseur.setPassword(generatedPassword, res);
  fournisseur.salt = encrypted[0];
  fournisseur.hash = encrypted[1];
  Fournisseur.findOneAndUpdate(
    { email: email },
    {
      salt: fournisseur.salt,
      hash: fournisseur.hash,
    }
  ).then((doc) => console.log(doc));
  await sendEmail(
    "llaattiinno6@gmail.com",
    "Votre mot de passe à été réinitialisé",
    "Voici votre nouveau mot de passe: " + generatedPassword
  ).then((doc, err) => {
    if (!err) {
      return res.status(200).send("Mot de passe réinitialisé avec succès: ");
    }
    console.log(
      "erreur lors de la réinitialisation du mot de passe: " + err.message
    );
    return res
      .status(400)
      .send("erreur lors de la réinitialisation du mot de passe: " + err);
  });
};

const forgotPasswordUser = async (req, res) => {
  const email = req.body.email;
  var user = new User();

  var generatedPassword = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  const generatedPasswordLength = 12;
  const userVerify = await User.findOne({ email: email }).then((doc) => {
    return doc;
  });
  if (userVerify === null) {
    console.log("Cet Email n'est pas enregistré");
    return res.status(400).send("Cet Email n'est pas enregistré");
  }

  for (var i = 0; i < generatedPasswordLength; i++) {
    generatedPassword += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  const encrypted = user.setPassword(generatedPassword, res);
  user.salt = encrypted[0];
  user.hash = encrypted[1];
  User.findOneAndUpdate(
    { email: email },
    {
      salt: user.salt,
      hash: user.hash,
    }
  ).then((doc) => console.log("password updated"));
  return await sendEmail(
    "llaattiinno6@gmail.com",
    "Votre mot de passe à été réinitialisé",
    "Voici votre nouveau mot de passe: " + generatedPassword
  ).then(
    () => {
      console.log(res.text);
      res.append("message", "slm");
      res.append("error", "slm");
      return res.status(200).send("Mot de passe réinitialisé avec succès");
    },
    (err) => {
      console.log(
        "erreur lors de la réinitialisation du mot de passe: " + err.message
      );
      return res
        .status(400)
        .send("erreur lors de la réinitialisation du mot de passe: " + err);
    }
  );
};

// email verification
const verify = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link");

    await User.updateOne({ _id: user._id, verified: true });
    await Token.findByIdAndRemove(token._id);

    console.log(token);

    res.send("email verified sucessfully");
  } catch (error) {
    res.status(400).send("An error occured");
  }
};

const authRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      res.status(401);
      return res.send("Not allowed!");
    }

    next();
  };
};

var auth = jwt({
  secret: process.env.SECRET,
  userProperty: "payload", // instance of module User
  algorithms: ["HS256"],
});

const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {
      const permission = roles.can(req.user.role)[action](resource);
      if (!permission.granted) {
        console.log("You don't have enough permission to perform this action");
        return res.status(401).json({
          error: "You don't have enough permission to perform this action",
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

const allowIfLoggedin = async (req, res, next) => {
  try {
    const user = res.locals.loggedInUser;
    if (!user)
      return res.status(401).json({
        error: "You need to be logged in to access this route",
      });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  loginUser,
  loginProvider,
  verify,
  authRole,
  auth,
  grantAccess,
  allowIfLoggedin,
  forgotPasswordFourn,
  forgotPasswordUser,
};
