const { log } = require("console");
const express = require("express");
const { User } = require("../models/users");
const { Vehicule } = require("../models/vehicule");
var fs = require("fs");

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
        assurance: 1,
        dateCirculation: {
          $dateToString: { format: "%d-%m-%Y", date: "$dateCirculation" },
        },
        imageCarteGrise: 1,
        dateVisite: {
          $dateToString: { format: "%d-%m-%Y", date: "$dateVisite" },
        },
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
    .exec((err, vehicules) => {
      if (!err) {
        if (req.query.search && req.query.search.length > 2) {
          vehicules = vehicules.filter(
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
              item.assurance
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.kilometrage
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase())
          );
        }
        return res.send(vehicules.slice(skip).slice(0, limit));
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
  const file = req["files"].CG;
  const data = JSON.parse(req.body.form);
  console.log(file);
  console.log(data);

  // console.log(file);

  const vehicule = new Vehicule();

  vehicule.serie = data.serie.replace(/ /g, "");
  vehicule.modele = data.modele;
  vehicule.assurance = data.assurance;
  vehicule.dateCirculation = data.dateCirculation;
  // vehicule.imageCarteGrise = data.imageCarteGrise;
  vehicule.dateVisite = data.dateVisite;
  vehicule.kilometrage = data.kilometrage;
  vehicule.chauffeurId = data.chauffeurId;

  // console.log(req);
  var sampleFile;
  sampleFile = file;

  var imgPath = "uploads/" + file.name;

  sampleFile.mv(imgPath, function (err) {
    if (err) {
      console.log("Error saving image" + err);
      return res.status(500).send("Error saving image" + err);
    }
    // console.log(vehicule.imageCarteGrise);
  });

  var extension = file.name.split(".")[file.name.split(".").length - 1];
  vehicule.imageCarteGrise.data = fs.readFileSync("uploads/" + file.name);
  vehicule.imageCarteGrise.contentType = "image/" + extension;

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

// update vehicle
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  const data = JSON.parse(req.body.form);
  console.log(data);

  const fieldsToUpdate = {
    serie: data.serie.replace(/ /g, ""),
    modele: data.modele,
    assurance: data.assurance,
    dateCirculation: data.dateCirculation,
    dateVisite: data.dateVisite,
    kilometrage: data.kilometrage,
    chauffeurId: data.chauffeurId,
  };

  if (req["files"]) {
    const file = req["files"].CG;
    console.log(file);
    // console.log(req);
    var sampleFile;
    sampleFile = file;

    var imgPath = "uploads/" + file.name;

    sampleFile.mv(imgPath, function (err) {
      if (err) {
        console.log("Error saving image" + err);
        return res.status(500).send("Error saving image" + err);
      }
      // console.log(vehicule.imageCarteGrise);
    });
    var imageCarteGrise = {};
    var extension = file.name.split(".")[file.name.split(".").length - 1];
    imageCarteGrise.data = fs.readFileSync("uploads/" + file.name);
    imageCarteGrise.contentType = "image/" + extension;
    fieldsToUpdate.imageCarteGrise = imageCarteGrise;
  }
  // getting old driver id to pull vehicule id from
  var oldDriver = null;
  Vehicule.findById(req.params.id, (err, doc) => {
    if (!err) {
      oldDriver = doc.chauffeurId;
    } else {
      console.log("Erreur " + err);
    }
  });
  Vehicule.findByIdAndUpdate(
    req.params.id,
    {
      $set: fieldsToUpdate,
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        //pulling vehicule id from old driver
        if (req.query.chauffeurId) {
          User.findByIdAndUpdate(
            oldDriver,
            { $unset: { vehiculeId: doc._id } },
            { new: true, useFindAndModify: false }
          ).then(
            (doc2) => {
              //pushing vehicule id to new driver
              User.findByIdAndUpdate(
                req.query.chauffeurId,
                { vehiculeId: doc._id },
                { new: true, useFindAndModify: false }
              ).exec((err3) => {
                if (!err3) res.status(200).send(doc);
                else {
                  console.log(
                    "Erreur lors du mis à jour du chauffeur: " + err3
                  );
                  res
                    .status(400)
                    .send("Erreur lors du mis à jour du chauffeur: " + err3);
                }
              });
            },
            (err2) => {
              console.log("Erreur lors du mis à jour du chauffeur: " + err2);
              res
                .status(400)
                .send("Erreur lors du mis à jour du chauffeur: " + err2);
            }
          );
        } else {
          res.status(200).send(doc);
        }
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
        { $unset: { vehiculeId: doc._id } },
        (err2) => {
          if (!err2) {
            res.status(200);
            res.json({
              message: "Véhicule supprimée avec succès",
            });
          } else {
            console.log("Erreur lors de mis à jour du chauffeur: " + err2);
          }
        }
      );
    } else {
      console.log("Erreur dans la suppression de la véhicule: " + err);
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
