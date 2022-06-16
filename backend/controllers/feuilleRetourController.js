const express = require("express");
const { parse } = require("path");
const { Fournisseur } = require("../models/fournisseur");
const { Package } = require("../models/package");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { FeuilleRetour } = require("../models/feuille-retour");
const { User } = require("../models/users");

// get return sheets
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
        from: "users",
        localField: "driverId",
        foreignField: "_id",
        as: "drivers",
      },
    },
    { $unwind: { path: "$drivers", preserveNullAndEmptyArrays: true } },
    // {
    //   $lookup: {
    //     from: "users",
    //     localField: "warehouseManagers",
    //     foreignField: "_id",
    //     as: "warehouseManagers",
    //   },
    // },
    // {
    //   $unwind: { path: "$warehouseManagers", preserveNullAndEmptyArrays: true },
    // },
    {
      $lookup: {
        from: "vehicules",
        localField: "drivers.vehiculeId",
        foreignField: "_id",
        as: "vehicules",
      },
    },
    { $unwind: { path: "$vehicules", preserveNullAndEmptyArrays: true } },
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
        feuilleRetourNb: 1,
        driverId: 1,
        nomd: "$drivers.nom",
        nomv: "$vehicules.serie",
        // whManagerId: 1,
        // nomMan: "$warehouseManagers.nom",
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
  FeuilleRetour.aggregate(data).exec((err, feuilleRetours) => {
    if (!err) {
      if (req.query.search) {
        feuilleRetours = feuilleRetours.filter(
          (item) =>
            item.feuilleRetourNb.toString().includes(req.query.search) ||
            item.nbPackages.toString().includes(req.query.search) ||
            item.createdAtSearch.toString().includes(req.query.search) ||
            item.nomd?.toLowerCase().includes(req.query.search.toLowerCase())
        );
      }
      return res.send(feuilleRetours.slice(skip).slice(0, limit));
    } else {
      res
        .status(400)
        .send("Erreur lors de la récupération des feuilles de retour: " + err);
    }
  });
});

// get return sheet
router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  var data = [
    {
      $lookup: {
        from: "drivers",
        localField: "driverId",
        foreignField: "_id",
        as: "drivers",
      },
    },
    { $unwind: { path: "$drivers", preserveNullAndEmptyArrays: true } },
    // {
    //   $lookup: {
    //     from: "users",
    //     localField: "warehouseManagers",
    //     foreignField: "_id",
    //     as: "warehouseManagers",
    //   },
    // },
    // {
    //   $unwind: { path: "$warehouseManagers", preserveNullAndEmptyArrays: true },
    // },
    {
      $lookup: {
        from: "vehicules",
        localField: "drivers.vehiculeId",
        foreignField: "_id",
        as: "vehicules",
      },
    },
    { $unwind: { path: "$vehicules", preserveNullAndEmptyArrays: true } },
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
        feuilleRetourNb: 1,
        driverId: 1,
        nomd: "$drivers.nom",
        nomv: "$vehicules.serie",
        // whManagerId: 1,
        // nomMan: "$warehouseManagers.nom",
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
  FeuilleRetour.aggregate(data).exec((err, feuilleRetour) => {
    if (!err) res.send(feuilleRetour);
    else
      console.log(
        "Erreur lors de la récupération du feuille de retour: " + err
      );
  });
});

// create return sheet
router.post("/", (req, res) => {
  FeuilleRetour.find()
    .sort({ feuilleRetourNb: -1 })
    .limit(1)
    .exec(async (err, feuilleRetours) => {
      if (err) {
        console.log(
          "Erreur dans la récupération du nombre du feuille de retour"
        );
        return res
          .status(404)
          .send("Erreur dans la récupération du nombre du feuille de retour");
      }

      const feuilleRetour = new FeuilleRetour();
      if (feuilleRetours.length > 0) {
        feuilleRetour.feuilleRetourNb = feuilleRetours[0].feuilleRetourNb + 1;
      }

      var packages = [];

      for (const package of req.body.packages) {
        packages.push(await Package.findOne({ CAB: package.CAB }));
      }
      var packageIds = [];
      packages.forEach((element) => {
        packageIds.push(element._id);
      });

      feuilleRetour.driverId = req.body.driverId;
      // feuilleRetour.whManagerId = req.body.whManagerId;
      feuilleRetour.packages = packageIds;

      feuilleRetour.save().then(
        (feuilleRetour) => {
          User.findByIdAndUpdate(
            req.body.driverId,
            { $push: { feuilleRetours: feuilleRetour._id } },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              () => {
                return res.status(201).send(feuilleRetour);
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
          console.log(
            "Erreur lors de la création du feuille de retour: " + err
          );
          return res.status(400).send(err.message);
        }
      );
    });
  // feuilleRetour.feuilleRetourNb = feuilleRetourNb;
});

// modify feuilleRetour
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  var query;

  // return sheets can't be modified so just in case there's a need to change a driver we have this code
  query = FeuilleRetour.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        driverId: req.body.driverId,
        isAllocated: 1,
      },
    },
    { new: true }
  ).then(
    () => {
      User.findByIdAndUpdate(
        req.body.driverId,
        { $push: { feuilleRetours: req.params.id } },
        { new: true, useFindAndModify: false }
      );
    },
    (err) => {
      console.log("Erreur lors de la mise à jour du feuille de retour: " + err);
      return res.status(400).send(err.message);
    }
  );

  query.then(
    (feuilleRetour) => {
      return res.status(200).send(feuilleRetour);
    },
    (err) => {
      console.log("Erreur lors du mis à jour du feuille de retour: " + err);
      return res
        .status(400)
        .send("Erreur lors du mis à jour du feuille de retour: " + err);
    }
  );
});

router.get("/nb/last", (req, res) => {
  FeuilleRetour.find()
    .sort({ feuilleRetourNb: -1 })
    .limit(1)
    .exec(async (err, feuilles) => {
      if (err) {
        console.log(
          "Erreur dans la récupération du nombre du feuille de retour"
        );
        return res
          .status(404)
          .send("Erreur dans la récupération du nombre du feuille de retour");
      }

      return res.status(200).send(feuilles[0].feuilleRetourNb.toString());
    });
});

// delete return sheet
// *** technically return sheet can't be deleted ***
// router.delete("/:id", (req, res) => {
//   if (!ObjectId.isValid(req.params.id))
//     return res.status(400).send(`no record with given id ${req.params.id}`);
//   FeuilleRetour.findByIdAndRemove(req.params.id, (err, doc) => {
//     if (!err) {
//       res.status(200);
//       res.json({
//         message: "feuille retour supprimée avec succès",
//       });
//     } else {
//       console.log("Erreur dans la suppression du feuille de retour: " + err);
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
  if (req.query.isAllocated) {
    queryObj["isAllocated"] = req.query.isAllocated;
  }

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
  var query = FeuilleRetour.find(queryObj);
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
  FeuilleRetour.find({ _id: req.params.id }).then(
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
