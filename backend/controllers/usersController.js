const express = require("express");
var crypto = require("crypto");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { User, validate } = require("../models/users");
var { Filiere } = require("../models/filiere");

router.get("/", (req, res) => {
  User.find((err, docs) => {
    if (!err) res.send(docs);
    else
      console.log(
        "Erreur lors de la récupération des utilisateurs: " +
          JSON.stringify(err, undefined, 2)
      );
  });
});

router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  User.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else
      console.log(
        "Erreur lors de la récupération des utilisateurs: " +
          JSON.stringify(err, undefined, 2)
      );
  });
});

router.post("/", (req, res) => {
  // console.log(req.body);
  const user = new User();

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
    (user.filiereId = req.body.filiereId);
  return user.save(user).then(
    (doc) => {
      return Filiere.findByIdAndUpdate(
        user.filiereId,
        { $push: { users: doc._id } },
        { new: true, useFindAndModify: false }
      ).then(
        () => {
          res.status(200).send(doc);
        },
        (err) => {
          res.json("Erreur lors de l'enregistrement de la filiere: " + err);
        }
      );
    },
    (err) => {
      res.json(
        "Erreur lors de l'enregistrement de l'utilisateur: " + err.message
      );
    }
  );
});

router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  const user = new User();

  user.setPassword(req.body.password);

  (user.email = req.body.email),
    (user.nom = req.body.nom),
    (user.role = req.body.role),
    (user.ville = req.body.ville),
    (user.delegation = req.body.delegation),
    (user.adresse = req.body.adresse),
    (user.codePostale = req.body.codePostale),
    (user.tel = req.body.tel),
    (user.tel2 = req.body.tel2),
    User.findByIdAndUpdate(
      req.params.id,
      { $set: user },
      { new: true },
      (err, doc) => {
        if (!err) {
          res.status(200);
          res.json({
            message: "user updated successfully",
          });
        } else
          console.log(
            "Error in user update: " + JSON.stringify(err, undefined, 2)
          );
      }
    );
});

router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  User.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      Filiere.findByIdAndUpdate(
        doc.filiereId,
        { $pull: { users: doc._id } },
        (err2) => {
          if (!err2) {
            res.status(200);
            res.json({
              message: "user deleted successfully",
            });
          } else console.log(err2);
        }
      );
    } else console.log(err);
  });
});

module.exports = router;
