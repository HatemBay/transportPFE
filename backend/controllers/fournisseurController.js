const express = require("express");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Fournisseur, validate } = require("../models/fournisseur");

router.get("/", (req, res) => {
  Fournisseur.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Erreur lors de la récupération des fournisseurs: " + err);
  });
});

router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  Fournisseur.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else console.log("Erreur lors de la récupération des fournisseurs: " + err);
  });
});

//get all packages belonging to fournisseur id
router.get("/:id/packages", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  Fournisseur.findById(req.params.id).populate("packages");
});

router.post("/", (req, res) => {
  // console.log(req.body);
  const fournisseur = new Fournisseur();

  var encrypted = fournisseur.setPassword(req.body.password, res);
  if (!encrypted) return;

  (fournisseur.email = req.body.email),
    (fournisseur.nom = req.body.nom),
    (fournisseur.ville = req.body.ville),
    (fournisseur.delegation = req.body.delegation),
    (fournisseur.adresse = req.body.adresse),
    (fournisseur.codePostale = req.body.codePostale),
    (fournisseur.tel = req.body.tel),
    (fournisseur.salt = encrypted[0]),
    (fournisseur.hash = encrypted[1]),
    fournisseur.save((err, doc) => {
      // If Passport throws/catches an error
      if (err) {
        res.status(404).json(err);
        return;
      }

      if (fournisseur) {
        res.status(200);
        res.json({
          message: "fournisseur registered successfully",
        });
      }
      // If fournisseur is not found
      else res.status(401).json(info);
    });
});

router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  const fournisseur = new Fournisseur();

  fournisseur.setPassword(req.body.password);

  (fournisseur.email = req.body.email),
    (fournisseur.nom = req.body.nom),
    (fournisseur.ville = req.body.ville),
    (fournisseur.delegation = req.body.delegation),
    (fournisseur.adresse = req.body.adresse),
    (fournisseur.codePostale = req.body.codePostale),
    (fournisseur.tel = req.body.tel),
    Fournisseur.findByIdAndUpdate(
      req.params.id,
      { $set: fournisseur },
      { new: true },
      (err, doc) => {
        if (!err) {
          res.status(200);
          res.json({
            message: "Fournisseur mis à jours avec succès",
          });
        } else console.log("Erreur dans la mis à jour du fournisseur: " + err);
      }
    );
});

router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Fournisseur.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.status(200);
      res.json({
        message: "Fournisseur supprimé avec succès",
      });
    } else {
      console.log("Erreur dans la suppression du fournisseur: " + err);
    }
  });
});

module.exports = router;
