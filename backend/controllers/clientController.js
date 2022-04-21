const express = require("express");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Client } = require("../models/client");
const { Delegation } = require("../models/delegation");
const { Fournisseur } = require("../models/fournisseur");

// get all clients belonging to connected provider
router.get("/all", (req, res) => {
  // adapting request id to aggregate options
  var fid = null;
  if (req.query.fid) {
    fid = ObjectId(req.query.fid);
  }
  var limit = parseInt(req.query.limit) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = limit * page - limit;
  var sort = {};
  var n = -1;
  var sortBy = req.query.sortBy || "createdAt";
  if (req.query.sort == "asc") n = 1;
  sort[sortBy] = n;

  var data = [
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
        localField: "$delegations.villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: "$villes" },
    {
      $project: {
        _id: 1,
        nom: 1,
        adresse: 1,
        codePostale: 1,
        tel: 1,
        tel2: 1,
        createdAt: 1,
        fournisseurId: 1,
        delegationId: "$delegations._id",
        delegation: "$delegations.nom",
        villeId: "$villes._id",
        ville: "$villes.nom",
        villeEtat: "$villes.etat",
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
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $sort: sort,
    },
  ];
  if (fid) {
    data.push({
      $match: { fournisseurId: fid },
    });
  }

  Client.aggregate(data).exec((err, docs) => {
    if (!err) {
      if (req.query.search && req.query.search.length > 2) {
        res.send(
          docs.filter(
            (item) =>
              item.tel.toString().includes(req.query.search) ||
              item.tel2?.toString().includes(req.query.search) ||
              item.codePostale?.toString().includes(req.query.search) ||
              item.createdAtSearch.toString().includes(req.query.search) ||
              item.nom.toLowerCase().includes(req.query.search.toLowerCase()) ||
              item.ville
                .toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.delegation
                .toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.adresse
                .toLowerCase()
                .includes(req.query.search.toLowerCase())
          )
        );
      } else res.send(docs);
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

// get client by id
router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  Client.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else {
      console.log("Erreur lors de la récupération des clients: " + err);
      res.status(400).send(err.message);
    }
  });
});

//get all packages belonging to client id
// router.get("/:id/packages", (req, res) => {
//   if (!ObjectId.isValid(req.params.id))
//     return res.status(400).send(`no record with given id: ${req.params.id}`);
//   Client.findById(req.params.id).populate('packages');
// });

// get client by phone number
router.get("/tel/:tel", (req, res) => {
  Client.find({ tel: req.params.tel }, (err, docs) => {
    if (!err) res.send(docs);
    else {
      console.log("Error in retrieving Clients: " + err);
      res.status(400).send(err.message);
    }
  });
});

//get with all packages
// router.get("/packages/:id", (req, res) => {
//   if (!ObjectId.isValid(req.params.id))
//     return res.status(400).send(`no record with given id: ${req.params.id}`);
//   Client.findById(req.params.id)
//     .populate("packages")
//     .then((dbPackage) => {
//       res.json(dbPackage);
//     })
//     .catch(function (err) {
//       // If an error occurred, send it to the client
//       console.log(err);
//       res.status(400).send(err.message);
//     });
// });

// save client and its foreign keys
router.post("/", (req, res) => {
  // console.log(req.body);
  const client = new Client();

  (client.nom = req.body.nom),
    (client.adresse = req.body.adresse),
    (client.codePostale = req.body.codePostale),
    (client.tel = req.body.tel),
    (client.tel2 = req.body.tel2),
    (client.delegation = req.body.delegationId),
    (client.fournisseurId = req.body.fournisseurId);
  return client.save(client).then(
    (doc) => {
      return Fournisseur.findByIdAndUpdate(
        client.fournisseurId,
        { $push: { clients: doc._id } },
        { new: true, useFindAndModify: false }
      ).then(
        () => {
          return Delegation.findByIdAndUpdate(
            client.delegation,
            { $push: { clients: doc._id } },
            { new: true, useFindAndModify: false }
          ).then(
            () => res.send(doc),
            (err) => {
              console.log("Erreur lors du mis à jour de la délegation: " + err);
              res.status(400).send(err.message);
            }
          );
        },
        (err) => {
          console.log("Erreur lors du mis à jour du fournisseur: " + err);
          res.status(400).send(err.message);
        }
      );
    },
    (err) => {
      console.log("Erreur lors de l'enregistrement du client: " + err);
      res.status(400).send(err.message);
    }
  );
});

// update client
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  var oldDelegation = null;
  Client.findById(req.params.id, (err, doc) => {
    if (!err) {
      oldDelegation = doc.delegation;
    } else {
      console.log("Erreur " + err);
    }
  });

  Client.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        nom: req.body.nom,
        adresse: req.body.adresse,
        codePostale: req.body.codePostale,
        tel: req.body.tel,
        tel2: req.body.tel2,
        delegation: req.body.delegationId,
      },
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        if (oldDelegation != req.body.delegationId) {
          Delegation.findByIdAndUpdate(
            oldDelegation,
            {
              $pull: { clients: doc._id },
            },
            { new: true, useFindAndModify: false }
          ).then(
            (doc2) => {
              Delegation.findByIdAndUpdate(
                req.body.delegationId,
                {
                  $push: { clients: doc._id },
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
        console.log("Erreur lors de mis à jour du client: " + err);
        res.status(400).send("Erreur lors de mis à jour du client: " + err);
      }
    }
  );
});

// delete client
router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Client.findByIdAndRemove(req.params.id, (err, doc) => {
    console.log(doc);
    if (!err) {
      Fournisseur.findByIdAndUpdate(
        doc.fournisseurId,
        { $pull: { clients: doc._id } },
        (err2) => {
          if (!err2) {
            res.status(200);
            res.json({
              message: "client supprimé",
            });
          } else {
            console.log(err2);
            res.status(400).send(err2.message);
          }
        }
      );
    } else {
      res.status(400).send(err.message);
      console.log(err);
    }
  });
});

// count clients by provider
router.get("/count/all/:fid", (req, res) => {
  var fid = req.params.fid;
  Client.count({ fournisseurId: fid }, (err, count) => {
    if (!err) {
      res.send({ count: count });
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

// count all clients
router.get("/count/all", (req, res) => {
  Client.count((err, count) => {
    if (!err) {
      res.send({ count: count });
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

module.exports = router;
