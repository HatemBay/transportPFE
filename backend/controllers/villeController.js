const express = require("express");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Ville } = require("../models/ville");

// get villes
router.get("/", (req, res) => {
  var limit = parseInt(req.query.limit) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = limit * page - limit;
  var sort = {};
  var n = -1;
  var sortBy = req.query.sortBy || "createdAt";
  if (req.query.sort == "asc") n = 1;
  sort[sortBy] = n;
  Ville.find()
    .sort(sort)
    .exec((err, villes) => {
      if (!err) {
        if (req.query.search) {
          villes = villes.filter(
            (item) =>
              item.nom.toLowerCase().includes(req.query.search.toLowerCase()) ||
              item.etat.toLowerCase().includes(req.query.search.toLowerCase())
          );
        }
        return res.send(villes.slice(skip).slice(0, limit));
      } else {
        res
          .status(400)
          .send("Erreur lors de la récupération des villes: " + err);
      }
    });
});

// get ville
router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  Ville.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else console.log("Erreur lors de la récupération de la ville: " + err);
  });
});

// create ville
router.post("/", (req, res) => {
  const ville = new Ville();

  ville.nom = req.body.nom;
  ville.etat = req.body.etat;

  return ville.save((err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      console.log("Erreur lors de la création de la ville: " + err);
      res.status(400).send(err.message);
    }
  });
});

// modify ville
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  Ville.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.status(200).send(doc);
      } else {
        console.log("Erreur lors de mis à jour de la ville: " + err);
        res.status(400).send("Erreur lors de mis à jour de la ville: " + err);
      }
    }
  );
});

// change ville state
router.get("/change-state/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  Ville.findById(req.params.id).then(
    (doc) => {
      var state;
      if (doc.etat == "ouverte") state = "fermée";
      else state = "ouverte";
      Ville.findByIdAndUpdate(
        req.params.id,
        {
          $set: { etat: state },
        },
        { new: true },
        (err, doc) => {
          if (!err) {
            res.status(200).send(doc);
          } else {
            console.log("Erreur lors de mis à jour de la ville: " + err);
            res
              .status(400)
              .send("Erreur lors de mis à jour de la ville: " + err);
          }
        }
      );
    },
    (err) => {
      console.log("Erreur lors de la récupération de la ville: " + err);
      res
        .status(400)
        .send("Erreur lors de la récupération de la ville: " + err);
    }
  );
});

// delete ville
router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Ville.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.status(200);
      res.json({
        message: "ville supprimée avec succès",
      });
    } else {
      console.log("Erreur dans la suppression de la ville: " + err);
      res.status(400).send(err.message);
    }
  });
});

/********************** STATISTICS **********************/
router.get("/count/all", (req, res) => {
  const query = Ville.find();
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
