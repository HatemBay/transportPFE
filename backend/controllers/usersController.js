const express = require("express");
var crypto = require("crypto");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { User, validate } = require("../models/users");

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
    user.save((err, doc) => {
      // If Passport throws/catches an error
      if (err) {
        res.status(404).json(err);
        return;
      }

      if (user) {
        res.status(200);
        res.json({
          message: "user registered successfully",
        });
      }
      // If user is not found
      else res.status(401).json(info);
    });
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
      res.status(200);
      res.json({
        message: "user deleted successfully",
      });
      console.log("success");
    } else console.log(err);
  });
});

module.exports = router;
