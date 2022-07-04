const express = require("express");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Historique } = require("../models/historique");
const { Package } = require("../models/package");

router.get("/", (req, res) => {
  data = [
    {
      $lookup: {
        from: "packages",
        localField: "packageId",
        foreignField: "_id",
        as: "packages",
      },
    },
    { $unwind: "$packages" },
    {
      $lookup: {
        from: "users",
        localField: "packages.userId",
        foreignField: "$_id",
        as: "users",
      },
    },
    { $unwind: "$users" },
    {
      $lookup: {
        from: "filieres",
        localField: "users.filiereId",
        foreignField: "$_id",
        as: "filieres",
      },
    },
    { $unwind: "$filieres" },
    {
      $lookup: {
        from: "fournisseurs",
        localField: "packages.fournisseurId",
        foreignField: "$_id",
        as: "fournisseurs",
      },
    },
    { $unwind: "$fournisseurs" },
    {
      $project: {
        _id: 1,
        action: 1,
        date: 1,
        packageId: "$packages._id",
        packageId: "$packages._id",
        filiere: "$filieres.nom",
        createdAt: 1,
        updatedAt: 1,
        dateSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$date" },
        },
      },
    },
    {
      $addFields: {
        createdAtSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$createdAt" },
        },
      },
    },
    {
      $sort: sort,
    },
  ];

  Historique.aggregate(data).exec((err, doc) => {
    if (!err) {
      return res.send({
        length: doc.length,
        data: doc.slice(skip).slice(0, limit),
      });
    } else console.log("Erreur lors de la récupération des historiques: " + err);
  });
});

router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  Historique.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else console.log("Erreur lors de la récupération de l'historique: " + err);
  });
});

router.post("/", (req, res) => {
  const historique = new Historique();

  historique.action = req.body.action;
  historique.date = req.body.date;
  historique.packageId = req.body.packageId;

  return historique.save((err, doc) => {
    if (!err) return res.send(doc);
    console.log("Erreur lors de la création de l'historique: " + err);
    return res.status(400).send(err.message);
  });
});

router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  Historique.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.status(200).send(doc);
      } else {
        console.log("Erreur lors de mise à jour de l'historique: " + err);
        res
          .status(400)
          .send("Erreur lors de mise à jour de l'historique: " + err);
      }
    }
  );
});

router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Historique.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      Package.findByIdAndUpdate(
        doc.packageId,
        {
          $pull: { packages: doc._id },
        },
        (err2) => {
          if (!err2) {
            res.status(200);
            return res.json({
              message: "Historique supprimée avec succès",
            });
          } else {
            console.log("Erreur lors de la mise à jour du colis: " + err2);
            return res.status(400).send(err.message);
          }
        }
      );
    } else {
      console.log("Erreur dans la suppression de l'historique: " + err);
      return res.status(400).send(err.message);
    }
  });
});

module.exports = router;
