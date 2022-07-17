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

  fournisseur.email = req.body.email;
  fournisseur.nom = req.body.nom;
  fournisseur.delegationId = req.body.delegationId;
  fournisseur.fraisLivraison = req.body.fraisLivraison;
  fournisseur.fraisRetour = req.body.fraisRetour;
  fournisseur.adresse = req.body.adresse;
  fournisseur.codePostale = req.body.codePostale;
  fournisseur.tel = req.body.tel;
  fournisseur.salt = encrypted[0];
  fournisseur.hash = encrypted[1];

  // if err add return
  fournisseur.save().then(
    (fournisseur) => {
      Delegation.findByIdAndUpdate(
        { _id: fournisseur.delegationId },
        { $push: { fournisseurs: fournisseur._id } },
        { new: true, useFindAndModify: false }
      ).then(
        () => {
          return res.status(200).send(fournisseur);
        },
        (err2) => {
          console.log(
            "Erreur lors de la mise à jour de la délegation: " + err2
          );
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
  var limit = parseInt(req.query.limit) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = limit * page - limit;
  var sort = {};
  var n = -1;
  var sortBy = req.query.sortBy || "createdAt";
  if (req.query.sort == "asc") n = 1;
  sort[sortBy] = n;
  data = [
    {
      $lookup: {
        from: "delegations",
        localField: "delegationId",
        foreignField: "_id",
        as: "delegations",
      },
    },
    { $unwind: "$delegations" },
    {
      $lookup: {
        from: "villes",
        localField: "delegations.villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: "$villes" },
    {
      $project: {
        _id: 1,
        email: 1,
        nom: 1,
        fraisLivraison: 1,
        fraisRetour: 1,
        villeId: "$villes._id",
        ville: "$villes.nom",
        delegationId: "$delegations._id",
        delegation: "$delegations.nom",
        adresse: 1,
        codePostale: 1,
        tel: 1,
        password: 1,
        createdAt: 1,
        updatedAt: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$updatedAt" },
        },
        createdAtSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$createdAt" },
        },
      },
    },
    {
      $sort: sort,
    },
  ];
  Fournisseur.aggregate(data).exec((err, fournisseurs) => {
    if (!err) {
      if (req.query.search && req.query.search.length > 2) {
        fournisseurs = fournisseurs.filter(
          (item) =>
            item.codePostale?.toString().includes(req.query.search) ||
            item.tel?.toString().includes(req.query.search) ||
            item.createdAtSearch.toString().includes(req.query.search) ||
            item.nom.toLowerCase().includes(req.query.search.toLowerCase()) ||
            item.ville
              ?.toLowerCase()
              .includes(req.query.search.toLowerCase()) ||
            item.delegation
              ?.toLowerCase()
              .includes(req.query.search.toLowerCase()) ||
            item.adresse?.toLowerCase().includes(req.query.search.toLowerCase())
        );
      }
      return res.send({
        length: fournisseurs.length,
        data: fournisseurs.slice(skip).slice(0, limit),
      });
    } else {
      console.log("Erreur lors de la récupération des fournisseurs: " + err);
      res
        .status(400)
        .send("Erreur lors de la récupération des fournisseurs: " + err);
    }
  });
});

router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  data = [
    {
      $lookup: {
        from: "delegations",
        localField: "delegationId",
        foreignField: "_id",
        as: "delegations",
      },
    },
    { $unwind: "$delegations" },
    {
      $lookup: {
        from: "villes",
        localField: "delegations.villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: "$villes" },
    {
      $project: {
        _id: 1,
        email: 1,
        nom: 1,
        fraisLivraison: 1,
        fraisRetour: 1,
        villeId: "$villes._id",
        ville: "$villes.nom",
        delegationId: "$delegations._id",
        delegation: "$delegations.nom",
        adresse: 1,
        codePostale: 1,
        tel: 1,
        password: 1,
        createdAt: 1,
        updatedAt: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$updatedAt" },
        },
        createdAtSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$createdAt" },
        },
      },
    },
    {
      $match: { _id: ObjectId(req.params.id) },
    },
  ];
  Fournisseur.aggregate(data).exec((err, fournisseurs) => {
    if (!err) return res.send(fournisseurs);
    console.log("Erreur lors de la récupération du fournisseur: " + err);
    return res
      .status(400)
      .send("Erreur lors de la récupération du fournisseur: " + err);
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
  Fournisseur.findById(req.params.id, (err, doc) => {
    if (!err) {
      oldDelegation = doc.delegationId;
    } else {
      console.log("Erreur " + err);
    }
  });

  console.log(oldDelegation);
  console.log(req.body.delegationId);

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
              $pull: { fournisseurs: doc._id },
            },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              Delegation.findByIdAndUpdate(
                req.body.delegationId,
                {
                  $push: { fournisseurs: doc._id },
                },
                { new: true, useFindAndModify: false }
              ).exec((err3) => {
                if (!err3) {
                  console.log("succes");
                  res.status(200).send(doc);
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
                "Erreur lors de mise à jour de la délégation: " + err2
              );
              res
                .status(400)
                .send(
                  "Erreur lors de la mise à jour de la délégation: " + err2
                );
            }
          );
        } else {
          res.status(200).send(doc);
        }
      } else {
        console.log("Erreur lors de mise à jour du fournisseur: " + err);
        res
          .status(400)
          .send("Erreur lors de mise à jour du fournisseur: " + err);
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
        { $pull: { fournisseurs: doc._id } },
        (err2) => {
          if (!err2) {
            res.status(200);
            res.json({
              message: "Fournisseur supprimé",
            });
          } else {
            console.log(
              "Erreur lors de la mise à jour de la délegation: " + err2
            );
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

/********************** STATISTICS **********************/
router.get("/count/all", (req, res) => {
  const query = Fournisseur.find();
  query.count((err, count) => {
    if (!err) {
      res.send({ count: count });
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});
/********************** STATISTICS **********************/

module.exports = router;
