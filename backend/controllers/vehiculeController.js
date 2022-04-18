const express = require("express");
const { User } = require("../models/users");
const { Vehicule } = require("../models/vehicule");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

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
        from: "users",
        localField: "chauffeurId",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: "$users" },
    {
      $project: {
        _id: 1,
        serie: 1,
        modele: 1,
        assurence: 1,
        dateCirculation: 1,
        imageCarteGrise: 1,
        dateVisite: 1,
        kilometrage: 1,
        chauffeurId: "$users._id",
        nomc: "$users.nom",
        villec: "$users.ville",
        delegationc: "$users.delegation",
        adressec: "$users.adresse",
        codePostalec: "$users.codePostale",
        telc: "$users.tel",
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $addFields: {
        createdAtSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$createdAt" },
        },
      },
    },
  ];
  Vehicule.aggregate(data)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .exec((err, vehicules) => {
      if (!err) {
        if (req.query.search && req.query.search.length > 2) {
          res.send(
            vehicules.filter(
              (item) =>
                item.createdAtSearch.toString().includes(req.query.search) ||
                item.dateCirculation.toString().includes(req.query.search) ||
                item.dateVisite.toString().includes(req.query.search) ||
                item.serie
                  ?.toLowerCase()
                  .includes(req.query.search.toLowerCase()) ||
                item.nomc
                  ?.toLowerCase()
                  .includes(req.query.search.toLowerCase()) ||
                item.modele
                  ?.toLowerCase()
                  .includes(req.query.search.toLowerCase()) ||
                item.assurence
                  ?.toLowerCase()
                  .includes(req.query.search.toLowerCase()) ||
                item.kilometrage
                  ?.toLowerCase()
                  .includes(req.query.search.toLowerCase())
            )
          );
        } else res.send(vehicules);
      } else {
        console.log("Erreur lors de la récupération des véhicules: " + err);
        res
          .status(400)
          .send("Erreur lors de la récupération des véhicules: " + err);
      }
    });
});

router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  Vehicule.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else console.log("Erreur lors de la récupération de la véhicule: " + err);
  });
});

// create vehicle
router.post("/", (req, res) => {
  const vehicule = new Vehicule();

  vehicule.serie = req.body.serie;
  vehicule.modele = req.body.modele;
  vehicule.assurence = req.body.assurence;
  vehicule.dateCirculation = req.body.dateCirculation;
  vehicule.imageCarteGrise = req.body.imageCarteGrise;
  vehicule.dateVisite = req.body.dateVisite;
  vehicule.kilometrage = req.body.kilometrage;
  vehicule.chauffeurId = req.body.chauffeurId;

  return vehicule.save().then(
    (doc) => {
      User.findByIdAndUpdate(
        vehicule.chauffeurId,
        { vehiculeId: doc._id },
        { new: true, useFindAndModify: false }
      ).exec((err, doc) => {
        if (!err) res.send(doc);
        else {
          console.log("Erreur lors du mis à jour du chauffeur: " + err);
          res
            .status(400)
            .send("Erreur lors du mis à jour du chauffeur: " + err);
        }
      });
    },
    (err) => {
      console.log("Erreur lors de la création de la véhicule: " + err);
      res.status(400).send("Erreur lors de la création de la véhicule: " + err);
    }
  );
});

router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  Vehicule.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.status(200).send(doc);
      } else {
        console.log("Erreur lors de mis à jour de la véhicule: " + err);
        res
          .status(400)
          .send("Erreur lors de mis à jour de la véhicule: " + err);
      }
    }
  );
});

router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Vehicule.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      User.findByIdAndUpdate(
        doc.chauffeurId,
        { $pull: { vehiculeId: doc._id } },
        (err2) => {
          if (!err2) {
            res.status(200);
            res.json({
              message: "filière supprimée avec succès",
            });
          } else {
            console.log("Erreur lors de mis à jour du chauffeur: " + err2);
          }
        }
      );
    } else {
      console.log("Erreur dans la suppression de la filière: " + err);
      res.status(400).send(err.message);
    }
  });
});

/********************** STATISTICS **********************/
router.get("/count/all", (req, res) => {
  const query = Vehicule.find();
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
