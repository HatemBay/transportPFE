const express = require("express");
const { parse } = require("path");
const { Fournisseur } = require("../models/fournisseur");
const { Package } = require("../models/package");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Finance } = require("../models/finance");

router.get("/", (req, res) => {
  const startDate = req.query.startDate || null;
  const endDate = req.query.endDate || null;

  var startYear = null;
  var startMonth = null;
  var startDay = null;

  var endYear = null;
  var endMonth = null;
  var endDay = null;

  if (startDate && endDate) {
    const dateS = new Date(req.query.startDate);
    const dateE = new Date(req.query.endDate);

    startYear = dateS.getFullYear();
    startMonth = dateS.getMonth();
    startDay = dateS.getDate();

    endYear = dateE.getFullYear();
    endMonth = dateE.getMonth();
    endDay = dateE.getDate();

    console.log(startDay);
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
        from: "fournisseurs",
        localField: "fournisseurId",
        foreignField: "_id",
        as: "fournisseurs",
      },
    },
    { $unwind: { path: "$fournisseurs", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "packages",
        localField: "packages",
        foreignField: "_id",
        as: "packages",
      },
    },
    {
      $project: {
        _id: 1,
        financeNb: 1,
        fournisseurId: 1,
        fraisLivraison: 1,
        fraisRetour: 1,
        totalCOD: 1,
        totalFraisLivraison: 1,
        totalHorsFrais: 1,
        nomf: "$fournisseurs.nom",
        packages: "$packages",
        nbPackages: { $size: "$packages" },
        createdAt: 1,
        updatedAt: 1,
        createdAtSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$createdAt" },
        },
      },
    },
  ];
  data.push({
    $sort: sort,
  });

  if (startDate && endDate) {
    data.push({
      $match: {
        createdAt: {
          $gte: new Date(startYear, startMonth, startDay, 0, 0, 0, 0),
          $lte: new Date(endYear, endMonth, endDay, 23, 59, 59, 999),
        },
      },
    });
  }

  if (req.query.fournisseurId) {
    const fid = ObjectId(req.query.fournisseurId);
    data.push({
      $match: {
        fournisseurId: fid,
      },
    });
  }
  Finance.aggregate(data).exec((err, finances) => {
    if (!err) {
      if (req.query.search) {
        finances = finances.filter(
          (item) =>
            item.financeNb.toString().includes(req.query.search) ||
            item.nbPackages.toString().includes(req.query.search) ||
            item.totalCOD.toString().includes(req.query.search) ||
            item.totalFraisLivraison.toString().includes(req.query.search) ||
            item.totalHorsFrais.toString().includes(req.query.search) ||
            item.createdAtSearch.toString().includes(req.query.search) ||
            item.nomf?.toLowerCase().includes(req.query.search.toLowerCase())
        );
      }
      return res.send({
        length: finances.length,
        data: finances.slice(skip).slice(0, limit),
      });
    } else {
      res
        .status(400)
        .send("Erreur lors de la récupération des finances: " + err);
    }
  });
});

router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  var data = [
    {
      $lookup: {
        from: "fournisseurs",
        localField: "fournisseurId",
        foreignField: "_id",
        as: "fournisseurs",
      },
    },
    { $unwind: { path: "$fournisseurs", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "packages",
        localField: "packages",
        foreignField: "_id",
        as: "packages",
      },
    },
    {
      $project: {
        _id: 1,
        financeNb: 1,
        fournisseurId: 1,
        fraisLivraison: 1,
        fraisRetour: 1,
        totalCOD: 1,
        totalFraisLivraison: 1,
        totalHorsFrais: 1,
        nomf: "$fournisseurs.nom",
        packages: "$packages",
        nbPackages: { $size: "$packages" },
        createdAt: 1,
        updatedAt: 1,
        createdAtSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$createdAt" },
        },
      },
    },
    {
      $match: { _id: ObjectId(req.params.id) },
    },
  ];
  Finance.aggregate(data).exec((err, finance) => {
    if (!err) res.send(finance);
    else console.log("Erreur lors de la récupération de la finance: " + err);
  });
});

router.get("/nb/last", (req, res) => {
  return Finance.find()
    .sort({ financeNb: -1 })
    .limit(1)
    .exec(async (err, finances) => {
      if (err) {
        console.log("Erreur dans la récupération du nombre de la finance");
        return res
          .status(400)
          .send("Erreur dans la récupération du nombre de la finance");
      } else {
        if (finances && finances.length === 0) {
          return res.status(200).send("0");
        } else {
          return res.send(finances[0].financeNb.toString());
        }
      }
    });
});

router.post("/", (req, res) => {
  Finance.find()
    .sort({ financeNb: -1 })
    .limit(1)
    .exec(async (err, finances) => {
      if (err) {
        console.log("Erreur dans la récupération du nombre de la finance");
        return res
          .status(404)
          .send("Erreur dans la récupération du nombre de la finance");
      }

      const finance = new Finance();
      if (finances.length > 0) {
        finance.financeNb = finances[0].financeNb + 1;
      }

      var packages = [];

      for (const package of req.body.packages) {
        packages.push(await Package.findOne({ CAB: package.CAB }));
      }
      var packageIds = [];
      packages.forEach((element) => {
        packageIds.push(element._id);
      });

      finance.fournisseurId = req.body.fournisseurId;
      finance.fraisLivraison = req.body.fraisLivraison;
      finance.fraisRetour = req.body.fraisRetour;
      finance.totalCOD = req.body.totalCOD;
      finance.totalFraisLivraison = req.body.totalFraisLivraison;
      finance.totalHorsFrais = req.body.totalHorsFrais;
      finance.packages = packageIds;

      finance.save().then(
        (finance) => {
          Fournisseur.findByIdAndUpdate(
            req.body.fournisseurId,
            { $push: { finances: finance._id } },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              () => {
                return res.status(201).send(finance);
              },
                (err3) => {
                  console.log(
                    "Erreur lors de la mise à jour du chef de depot: " + err3
                  );
                  return res.status(400).send(err3);
                };
            },
            (err2) => {
              console.log(
                "Erreur lors de la mise à jour du chauffeur: " + err2
              );
              return res.status(400).send(err2);
            }
          );
        },
        (err) => {
          console.log("Erreur lors de la création de la finance: " + err);
          return res.status(400).send(err.message);
        }
      );
    });
  // finance.financeNb = financeNb;
});

// modify finance
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    console.log(`no record with given id: ${req.params.id}`);
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  }

  Finance.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.status(200).send(doc);
      } else {
        console.log("Erreur lors de mise à jour de la finance: " + err);
        res
          .status(400)
          .send("Erreur lors de mise à jour de la finance: " + err);
      }
    }
  );
});

// delete return sheet
// *** technically return sheet can't be deleted ***
// router.delete("/:id", (req, res) => {
//   if (!ObjectId.isValid(req.params.id))
//     return res.status(400).send(`no record with given id ${req.params.id}`);
//   Finance.findByIdAndRemove(req.params.id, (err, doc) => {
//     if (!err) {
//       res.status(200);
//       res.json({
//         message: "finance supprimée avec succès",
//       });
//     } else {
//       console.log("Erreur dans la suppression de la finance: " + err);
//       res.status(400).send(err.message);
//     }
//   });
// });

/********************** STATISTICS **********************/
router.get("/count/all", (req, res) => {
  const startDate = req.query.startDate || null;
  const endDate = req.query.endDate || null;

  var startYear = null;
  var startMonth = null;
  var startDay = null;

  var endYear = null;
  var endMonth = null;
  var endDay = null;

  const queryObj = {};

  if (startDate && endDate) {
    const dateS = new Date(req.query.startDate);
    const dateE = new Date(req.query.endDate);

    startYear = dateS.getFullYear();
    startMonth = dateS.getMonth();
    startDay = dateS.getDate();

    endYear = dateE.getFullYear();
    endMonth = dateE.getMonth();
    endDay = dateE.getDate();

    queryObj["createdAt"] = {
      $gte: new Date(startYear, startMonth, startDay, 0, 0, 0, 0),
      $lte: new Date(endYear, endMonth, endDay, 23, 59, 59, 999),
    };
  }
  var query = Finance.find(queryObj);
  query.count((err, count) => {
    if (!err) {
      res.send({ count: count });
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

router.get("count-colis/:id", (req, res) => {
  Finance.find({ _id: req.params.id }).then(
    (res) => {
      res.send({ count: res.packages.length });
    },
    (err) => {
      console.log(err);
      res.status(400).send(err.message);
    }
  );
});
/********************** STATISTICS **********************/

module.exports = router;
