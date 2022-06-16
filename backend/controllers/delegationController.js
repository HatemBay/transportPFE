const express = require("express");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Ville } = require("../models/ville");
var { Delegation } = require("../models/delegation");

// get all delegations with pagination and their villes
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
        from: "villes",
        localField: "villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: "$villes" },
    {
      $project: {
        _id: 1,
        nom: 1,
        villeId: "$villes._id",
        ville: "$villes.nom",
        etat: "$villes.etat",
        createdAt: 1,
        updatedAt: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$updatedAt" },
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
  Delegation.aggregate(data).exec((err, delegations) => {
    if (!err) {
      if (req.query.search && req.query.search.length > 2) {
        delegations = delegations.filter(
          (item) =>
            item.nom.toLowerCase().includes(req.query.search.toLowerCase()) ||
            item.ville?.toLowerCase().includes(req.query.search.toLowerCase())
        );
      }
      return res.send(delegations.slice(skip).slice(0, limit));
    } else {
      console.log("Erreur lors de la récupération des delegations: " + err);
      res
        .status(400)
        .send("Erreur lors de la récupération des delegations: " + err);
    }
  });
});

// get delegations by ville id
router.get("/:villeId", (req, res) => {
  Delegation.find({ villeId: req.params.villeId }, (err, delegations) => {
    if (!err) return res.send(delegations);
    console.log("Erreur lors de la récupération des delegations: " + err);
    return res.status(400).send(err);
  });
});

// add delegation
router.post("/", (req, res) => {
  // console.log(req.body);
  const delegation = new Delegation();

  delegation.nom = req.body.nom;
  delegation.villeId = req.body.villeId;

  return delegation.save().then(
    (doc) => {
      return Ville.findByIdAndUpdate(
        delegation.villeId,
        { $push: { delegations: doc._id } },
        { new: true, useFindAndModify: false }
      ).then(
        () => {
          res.status(200).send(doc);
        },
        (err) => {
          console.log("Erreur lors du mis à jour de la ville: " + err);
          res.status(400).send(err.message);
        }
      );
    },
    (err) => {
      console.log("Erreur lors de l'enregistrement de la delegation: " + err);
      res.status(400).send(err.message);
    }
  );
});

// modify delegation
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  Delegation.findByIdAndUpdate(
    req.params.id,
    {
      $set: { nom: req.body.nom },
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.status(200).send(doc);
      } else {
        console.log("Erreur lors de mis à jour de la delegation: " + err);
        res
          .status(400)
          .send("Erreur lors de mis à jour de la delegation: " + err);
      }
    }
  );
});

// delete delegation
router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Delegation.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      Ville.findByIdAndUpdate(
        doc.villeId,
        { $pull: { delegations: doc._id } },
        (err2) => {
          if (!err2) {
            res.status(200);
            res.json({
              message: "delegation supprimée",
            });
          } else {
            console.log(err2);
            res.status(400).send(err2.message);
          }
        }
      );
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

/********************** STATISTICS **********************/
router.get("/count/all", (req, res) => {
  const query = Delegation.find();
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
