const express = require("express");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Filiere } = require("../models/filiere");

router.get("/", (req, res) => {
  var limit = parseInt(req.query.limit) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = limit * page - limit;
  var sort = {};
  var n = -1;
  var sortBy = req.query.sortBy || "createdAt";
  if (req.query.sort == "asc") n = 1;
  sort[sortBy] = n;
  Filiere.find()
    .sort(sort)
    .exec((err, filieres) => {
      if (!err) {
        if (req.query.search) {
          filieres = filieres.filter(
            (item) =>
              item.nom.toLowerCase().includes(req.query.search.toLowerCase()) ||
              item.adresse
                .toLowerCase()
                .includes(req.query.search.toLowerCase())
          );
        }
        return res.send({
          length: filieres.length,
          data: filieres.slice(skip).slice(0, limit),
        });
      } else {
        res
          .status(400)
          .send("Erreur lors de la récupération des filières: " + err);
      }
    });
});

router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  Filiere.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else console.log("Erreur lors de la récupération de la filière: " + err);
  });
});

// create branch
router.post("/", (req, res) => {
  const filiere = new Filiere();

  filiere.nom = req.body.nom;
  filiere.adresse = req.body.adresse;

  return filiere.save((err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      console.log("Erreur lors de la création de la filière: " + err);
      res.status(400).send(err.message);
    }
  });
});

router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  Filiere.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.status(200).send(doc);
      } else {
        console.log("Erreur lors de mis à jour de la filière: " + err);
        res.status(400).send("Erreur lors de mis à jour de la filière: " + err);
      }
    }
  );
});

router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Filiere.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.status(200);
      res.json({
        message: "filière supprimée avec succès",
      });
    } else {
      console.log("Erreur dans la suppression de la filière: " + err);
      res.status(400).send(err.message);
    }
  });
});

/********************** STATISTICS **********************/
router.get("/count/all", (req, res) => {
  const query = Filiere.find();
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
