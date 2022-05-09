const express = require("express");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { User, validate } = require("../models/users");
var { Filiere } = require("../models/filiere");
const { Delegation } = require("../models/delegation");

// get all users with pagination and their branches
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
        from: "filieres",
        localField: "filiereId",
        foreignField: "_id",
        as: "filieres",
      },
    },
    { $unwind: { path: "$filieres", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        role: 1,
        email: 1,
        nom: 1,
        ville: 1,
        delegation: 1,
        adresse: 1,
        codePostale: 1,
        tel: 1,
        password: 1,
        filiereId: "$filieres._id",
        nomf: "$filieres.nom",
        adressef: "$filieres.adresse",
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
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $sort: sort,
    },
  ];
  User.aggregate(data).exec((err, users) => {
    if (!err) {
      if (req.query.search && req.query.search.length > 2) {
        res.send(
          users.filter(
            (item) =>
              item.codePostale?.toString().includes(req.query.search) ||
              item.tel?.toString().includes(req.query.search) ||
              item.createdAtSearch.toString().includes(req.query.search) ||
              item.nom.toLowerCase().includes(req.query.search.toLowerCase()) ||
              item.nomf
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.role
                .toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.ville
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.delegation
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.adresse
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.nomf
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.adressef
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase())
          )
        );
      } else res.send(users);
    } else {
      console.log("Erreur lors de la récupération des utilisateurs: " + err);
      res
        .status(400)
        .send("Erreur lors de la récupération des utilisateurs: " + err);
    }
  });
});

// get chauffeurs with no vehicules
// can get modified
router.get("/role/chauffeur", (req, res) => {
  User.find({ vehiculeId: { $eq: null }, role: "chauffeur" }, (err, doc) => {
    if (!err) res.send(doc);
    else {
      console.log("Erreur lors de la récupération de l'utilisateur: " + err);
      res.status(400).send(err.message);
    }
  });
});

// get chauffeurs
// can get modified
router.get("/role/chauffeur/all", (req, res) => {
  User.find({ role: "chauffeur" }, (err, doc) => {
    if (!err) res.send(doc);
    else {
      console.log("Erreur lors de la récupération de l'utilisateur: " + err);
      res.status(400).send(err.message);
    }
  });
});

// get user
router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  User.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else {
      console.log("Erreur lors de la récupération de l'utilisateur: " + err);
      res.status(400).send(err.message);
    }
  });
});

// add user
router.post("/", (req, res) => {
  // console.log(req.body);
  const user = new User();

  var encrypted = user.setPassword(req.body.password, res);
  if (!encrypted) return;

  (user.email = req.body.email),
    (user.nom = req.body.nom),
    (user.role = req.body.role),
    (user.delegationId = req.body.delegationId),
    (user.adresse = req.body.adresse),
    (user.codePostale = req.body.codePostale),
    (user.tel = req.body.tel),
    (user.salt = encrypted[0]),
    (user.hash = encrypted[1]),
    (user.filiereId = req.body.filiereId);
  return user.save(user).then(
    (doc) => {
      Filiere.findByIdAndUpdate(
        user.filiereId,
        { $push: { users: doc._id } },
        { new: true, useFindAndModify: false }
      ).then(
        () => {
          Delegation.findByIdAndUpdate(
            user.filiereId,
            { $push: { users: doc._id } },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              res.status(200).send(doc);
            },
            (err2) => {
              console.log(
                "Erreur lors du mis à jour de la délegation: " + err2
              );
              res.status(400).send(err2.message);
            }
          );
        },
        (err) => {
          console.log("Erreur lors du mis à jour de la filiere: " + err);
          res.status(400).send(err.message);
        }
      );
    },
    (err) => {
      console.log("Erreur lors de l'enregistrement de l'utilisateur: " + err);
      res.status(400).send(err.message);
    }
  );
});

// modify user
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

  const user = new User();
  var encrypted = user.setPassword(req.body.password, res);
  if (!encrypted) return;

  req.body.salt = encrypted[0];
  req.body.hash = encrypted[1];

  User.findByIdAndUpdate(
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
            (doc2) => {
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
        console.log("Erreur lors de mis à jour de l'utilisateur: " + err);
        res
          .status(400)
          .send("Erreur lors de mis à jour de l'utilisateur: " + err);
      }
    }
  );
});

// delete user
router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  User.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      Filiere.findByIdAndUpdate(
        doc.filiereId,
        { $pull: { users: doc._id } },
        (err2) => {
          if (!err2) {
            Delegation.findByIdAndUpdate(
              doc.delegationId,
              { $pull: { users: doc._id } },
              (err3) => {
                if (!err3) {
                  res.status(200);
                  res.json({
                    message: "Utilisateur supprimé",
                  });
                } else {
                  console.log(
                    "Erreur lors du mis à jour de la délegation: " + err3
                  );
                  res.status(400).send(err3.message);
                }
              }
            );
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
  const query = User.find();
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
