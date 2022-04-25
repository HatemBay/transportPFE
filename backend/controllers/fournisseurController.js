const express = require("express");
const { Delegation } = require("../models/delegation");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Fournisseur, validate } = require("../models/fournisseur");

router.post("/", (req, res) => {
  // console.log(req.body);
  const fournisseur = new Fournisseur();

  var encrypted = fournisseur.setPassword(req.body.password, res);
  if (!encrypted) return;

  (fournisseur.email = req.body.email),
    (fournisseur.nom = req.body.nom),
    (fournisseur.delegationId = req.body.delegationId),
    (fournisseur.adresse = req.body.adresse),
    (fournisseur.codePostale = req.body.codePostale),
    (fournisseur.tel = req.body.tel),
    (fournisseur.salt = encrypted[0]),
    (fournisseur.hash = encrypted[1]);

  // if err add return
  fournisseur.save().then(
    (fournisseur) => {
      Delegation.findByIdAndUpdate(
        { _id: doc.delegationId },
        { $push: { fournisseurs: doc._id } },
        { new: true, useFindAndModify: false }
      ).then(
        () => {
          return res.status(200).send(fournisseur);
        },
        (err2) => {
          console.log("Erreur lors du mis à jour de la délegation: " + err2);
          return res.status(400).send(err2.message);
        }
      );
    },
    (err) => {
      console.log("Erreur lors de l'enregistrement du fournisseur: " + err);
      return res.status(400).send(err.message);
    }
  );
});

router.get("/", (req, res) => {
  Fournisseur.find((err, docs) => {
    if (!err) res.send(docs);
    else {
      console.log("Erreur lors de la récupération des fournisseurs: " + err);
      res.status(400).send(err.message);
    }
  });
});

router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  Fournisseur.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else {
      console.log("Erreur lors de la récupération du fournisseur: " + err);
      res.status(400).send(err.message);
    }
  });
});

//get all packages belonging to fournisseur id
// router.get("/:id/packages", (req, res) => {
//   if (!ObjectId.isValid(req.params.id))
//     return res.status(400).send(`no record with given id: ${req.params.id}`);
//   Fournisseur.findById(req.params.id).populate("packages");
// });

router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  var oldDelegation = null;
  User.findById(req.params.id, (err, doc) => {
    if (!err) {
      oldDelegation = doc.delegationId;
    } else {
      console.log("Erreur " + err);
    }
  });

  Fournisseur.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        if (oldDelegation != req.body.delegationId) {
          Delegation.findByIdAndUpdate(
            oldDelegation,
            {
              $pull: { users: doc._id },
            },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              Delegation.findByIdAndUpdate(
                req.body.delegationId,
                {
                  $push: { users: doc._id },
                },
                { new: true, useFindAndModify: false }
              ).exec((err3) => {
                if (!err3) {
                  res.send(doc);
                } else {
                  console.log(
                    "Erreur lors de la mise à jour de la délégation: " + err3
                  );
                  res.status(400).send(err3.message);
                }
              });
            },
            (err2) => {
              console.log(
                "Erreur lors de mis à jour de la délégation: " + err2
              );
              res
                .status(400)
                .send("Erreur lors du mis à jour de la délégation: " + err2);
            }
          );
        } else {
          res.status(400).send(doc);
        }
      } else {
        console.log("Erreur lors de mis à jour du fournisseur: " + err);
        res
          .status(400)
          .send("Erreur lors de mis à jour du fournisseur: " + err);
      }
    }
  );
});

router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Fournisseur.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      Delegation.findByIdAndUpdate(
        doc.delegationId,
        { $pull: { users: doc._id } },
        (err2) => {
          if (!err2) {
            res.status(200);
            res.json({
              message: "Fournisseur supprimé",
            });
          } else {
            console.log("Erreur lors du mis à jour de la délegation: " + err2);
            res.status(400).send(err2.message);
          }
        }
      );
    } else {
      console.log("Erreur dans la suppression du fournisseur: " + err);
      res.status(400).send(err.message);
    }
  });
});

module.exports = router;
