const { query } = require("express");
const express = require("express");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Client } = require("../models/client");
const { Delegation } = require("../models/delegation");
const { Fournisseur } = require("../models/fournisseur");

//TODO: remove fournisseurId and use fournisseurs (in all crud)

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
    { $unwind: { path: "$delegations", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "villes",
        localField: "delegations.villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: { path: "$villes", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        nom: 1,
        adresse: 1,
        codePostale: 1,
        tel: 1,
        tel2: 1,
        createdAt: 1,
        // fournisseurs: 1,
        fournisseurId: 1,
        delegationId: "$delegations._id",
        delegation: "$delegations.nom",
        villeId: "$villes._id",
        ville: "$villes.nom",
        villeEtat: "$villes.etat",
        nbPackages: { $size: "$packages" },
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
  ];

  // if (fid) {
  //   data.push({
  //     $match: { fournisseurs: fid },
  //   });
  // }
  if (fid) {
    data.push({
      $match: { fournisseurId: fid },
    });
  }

  if (!req.query.tels) {
    data.push({
      $sort: sort,
    });
  }

  Client.aggregate(data).exec((err, client) => {
    if (!err) {
      if (req.query.search && req.query.search.length > 2) {
        if (req.query.tels) {
          client = client.filter((item) =>
            item.tel.toString().includes(req.query.search)
          );
        } else {
          client = client.filter(
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
          );
        }
      }
      return res.send({
        length: client.length,
        data: client.slice(skip).slice(0, limit),
      });
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
  // adapting request id to aggregate options
  var fid = null;
  if (req.query.fid) {
    fid = ObjectId(req.query.fid);
  }

  var data = [
    {
      $lookup: {
        from: "delegations",
        localField: "delegationId",
        foreignField: "_id",
        as: "delegations",
      },
    },
    { $unwind: { path: "$delegations", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "villes",
        localField: "delegations.villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: { path: "$villes", preserveNullAndEmptyArrays: true } },
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
      $match: { _id: ObjectId(req.params.id) },
    },
  ];

  if (fid) {
    data.push({
      $match: { fournisseurId: fid },
    });
  }

  Client.aggregate(data).exec((err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      console.log("Erreur lors de la récupération du client: " + err);
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
  if (req.params.tel.length != 8)
    return res.status(400).send(`tel n'est pas valide: ${req.params.tel}`);

  var data = [
    {
      $lookup: {
        from: "delegations",
        localField: "delegationId",
        foreignField: "_id",
        as: "delegations",
      },
    },
    { $unwind: { path: "$delegations", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "villes",
        localField: "delegations.villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: { path: "$villes", preserveNullAndEmptyArrays: true } },
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
      $match: { tel: parseInt(req.params.tel) },
    },
  ];

  Client.aggregate(data).exec((err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      console.log("Erreur lors de la récupération du client: " + err);
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

  client.nom = req.body.nom;
  client.adresse = req.body.adresse;
  client.codePostale = req.body.codePostale;
  client.tel = req.body.tel;
  client.tel2 = req.body.tel2;
  client.fournisseurId = req.body.fournisseurId;
  // client.fournisseurs.push(req.body.fournisseurs);
  client.delegationId = req.body.delegationId;
  return client.save().then(
    (doc) => {
      return Fournisseur.findByIdAndUpdate(
        client.fournisseurId,
        // client.fournisseurs[0],
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
              console.log(
                "Erreur lors de la mise à jour de la délegation: " + err
              );
              res.status(400).send(err.message);
            }
          );
        },
        (err) => {
          console.log("Erreur lors de la mise à jour du fournisseur: " + err);
          res.status(400).send(err.message);
        }
      );
    },
    (err) => {
      console.log("Erreur lors de l'enregistrement du client: " + err);
      const error = err.message;
      res.status(400).send({ error: error, object: client });
    }
  );
});

// update client
router.put("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    console.log(err);
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  }

  var oldDelegation = null;
  Client.findById(req.params.id, (err, doc) => {
    if (!err) {
      oldDelegation = doc.delegationId;
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
        delegationId: req.body.delegationId,
        fournisseurId: req.body.fournisseurId,
      },
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        if (oldDelegation == req.body.delegationId)
          return res.status(200).send(doc);

        Delegation.findByIdAndUpdate(
          oldDelegation,
          {
            $pull: { clients: doc._id },
          },
          { new: true, useFindAndModify: false }
        ).then(
          () => {
            Delegation.findByIdAndUpdate(
              req.body.delegationId,
              {
                $push: { clients: doc._id },
              },
              { new: true, useFindAndModify: false }
            ).exec((err3) => {
              if (!err3) {
                return res.status(200).send(doc);
              } else {
                console.log(
                  "Erreur lors de la mise à jour de la délégation: " + err3
                );
                return res.status(400).send(err3.message);
              }
            });
          },
          (err2) => {
            console.log("Erreur lors de mise à jour de la délégation: " + err2);
            return res
              .status(400)
              .send("Erreur lors de la mise à jour de la délégation: " + err2);
          }
        );
      } else {
        console.log("Erreur lors de mise à jour du client: " + err);
        return res
          .status(400)
          .send("Erreur lors de mise à jour du client: " + err);
      }
    }
  );
});

// update client
router.put("/:tel", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    console.log(err);
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  }

  const oldDelegation = await Client.findById(req.params.id).then((res) => {
    return res.delegationId;
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
        delegationId: req.body.delegationId,
        fournisseurId: req.body.fournisseurId,
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
            () => {
              Delegation.findByIdAndUpdate(
                req.body.delegationId,
                {
                  $push: { clients: doc._id },
                },
                { new: true, useFindAndModify: false }
              ).exec((err3) => {
                if (!err3) {
                  return res.status(200).send(doc);
                } else {
                  console.log(
                    "Erreur lors de la mise à jour de la délégation: " + err3
                  );
                  return res.status(400).send(err3.message);
                }
              });
            },
            (err2) => {
              console.log(
                "Erreur lors de mise à jour de la délégation: " + err2
              );
              return res
                .status(400)
                .send(
                  "Erreur lors de la mise à jour de la délégation: " + err2
                );
            }
          );
        } else {
          return res.status(200).send(doc);
        }
      } else {
        console.log("Erreur lors de mise à jour du client: " + err);
        return res
          .status(400)
          .send("Erreur lors de mise à jour du client: " + err);
      }
    }
  );
});

// delete client
router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Client.findByIdAndRemove(req.params.id, (err, doc) => {
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

      // var msg = "";
      // var error = "";
      // doc.fournisseurs.forEach((element) => {
      //   Fournisseur.findByIdAndUpdate(
      //     element,
      //     { $pull: { clients: doc._id } },
      //     (err2) => {
      //       if (!err2) {
      //         msg = "client supprimé";
      //       } else {
      //         error = err2;
      //       }
      //     }
      //   );
      // });
      // if (msg != "") {
      //   res.status(200);
      //   res.json({
      //     message: "client supprimé",
      //   });
      // } else if (error != "") {
      //   console.log(error);
      //   res.status(400).send(error.message);
      // }
    } else {
      res.status(400).send(err.message);
      console.log(err);
    }
  });
});

// count clients by provider
router.get("/count/all/:fid", (req, res) => {
  var fid = req.params.fid;
  // Client.count({ fournisseurs: fid }, (err, count) => {
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
