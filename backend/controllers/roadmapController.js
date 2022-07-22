const express = require("express");
const { serializeUser } = require("passport");
const { Package } = require("../models/package");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

var { Roadmap } = require("../models/roadmap");
const { User } = require("../models/users");

// get roadmaps
router.get("/", (req, res) => {
  const noLimit = req.query.noLimit || null;
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
        roadmapNb: 1,
        driverId: 1,
        isFinished: 1,
        nomd: "$drivers.nom",
        nomv: "$vehicules.serie",
        // whManagerId: 1,
        // nomMan: "$warehouseManagers.nom",
        packages: "$packages",
        nbPackages: { $size: "$packages" },
        createdAt: 1,
        updatedAt: 1,
        // snomd: { $toLower: "$nomd" },
        // sroadmapNb: { $toString: "$roadmapNb" },
        // snbPackages: { $toString: "$nbPackages" },
        createdAtSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$createdAt" },
        },
        // screatedAtSearch: { $toString: "$createdAtSearch" },
      },
    },
  ];

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

  if (req.query.driver) {
    data.push({
      $match: {
        nomd: req.query.driver,
      },
    });
  }
  if (req.query.driverId) {
    data.push({
      $match: {
        driverId: ObjectId(req.query.driverId),
      },
    });
  }

  if (req.query.isFinished) {
    var isFinished = req.query.isFinished === "true";
    data.push({
      $match: {
        isFinished: isFinished,
      },
    });
  }

  data.push({
    $sort: sort,
  });

  // if (req.query.search) {
  //   data.push({
  //     $match: {
  //       $or: [
  //         {
  //           snomd: new RegExp(
  //             `.*${req.query.search.toLocaleLowerCase()}.*`,
  //             "gi"
  //           ),
  //         },
  //         {
  //           sroadmapNb: new RegExp(`.*${req.query.search}.*`, "gi"),
  //         },
  //         {
  //           snbPackages: new RegExp(`.*${req.query.search}.*`, "gi"),
  //         },
  //         {
  //           screatedAtSearch: new RegExp(`.*${req.query.search}.*`, "gi"),
  //         },
  //       ],
  //     },
  //   });
  // }

  Roadmap.aggregate(data).exec((err, roadmaps) => {
    if (!err) {
      if (req.query.search) {
        roadmaps = roadmaps.filter(
          (item) =>
            item.roadmapNb.toString().includes(req.query.search) ||
            item.nbPackages.toString().includes(req.query.search) ||
            item.createdAtSearch.toString().includes(req.query.search) ||
            item.nomd?.toLowerCase().includes(req.query.search.toLowerCase())
        );
      }
      if (noLimit && noLimit !== null) {
        return res.send({
          length: roadmaps.length,
          data: roadmaps,
        });
      } else {
        return res.send({
          length: roadmaps.length,
          data: roadmaps.slice(skip).slice(0, limit),
        });
      }
    } else {
      res
        .status(400)
        .send("Erreur lors de la récupération des feuilles de route: " + err);
    }
  });
});

// get roadmap
router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
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
        roadmapNb: 1,
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
          $dateToString: { format: "%d/%m/%Y", date: "$createdAt" },
        },
      },
    },
    {
      $match: { _id: ObjectId(req.params.id) },
    },
  ];
  Roadmap.aggregate(data).exec((err, roadmap) => {
    if (!err) res.send(roadmap);
    else
      console.log(
        "Erreur lors de la récupération de la feuille de route: " + err
      );
  });
});

// create roadmap
router.post("/", (req, res) => {
  Roadmap.find()
    .sort({ roadmapNb: -1 })
    .limit(1)
    .exec(async (err, roadmaps) => {
      if (err) {
        console.log(
          "Erreur dans la récupération du nombre de la feuille de route"
        );
        return res
          .status(404)
          .send("Erreur dans la récupération du nombre de la feuille de route");
      }

      const roadmap = new Roadmap();
      if (roadmaps.length > 0) {
        roadmap.roadmapNb = roadmaps[0].roadmapNb + 1;
      }

      var packages = [];

      for (const package of req.body.packages) {
        packages.push(await Package.findOne({ CAB: package }));
      }
      var packageIds = [];
      packages.forEach((element) => {
        packageIds.push(element._id);
      });

      roadmap.driverId = req.body.driverId;
      // roadmap.whManagerId = req.body.whManagerId;
      roadmap.packages = packageIds;

      roadmap.save().then(
        (roadmap) => {
          User.findByIdAndUpdate(
            req.body.driverId,
            { $push: { roadmaps: roadmap._id } },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              () => {
                return res.status(201).send(roadmap);
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
            "Erreur lors de la création de la feuille de route: " + err
          );
          return res.status(400).send(err.message);
        }
      );
    });
  // roadmap.roadmapNb = roadmapNb;
});

//* add field
// router.put("/", (req, res) => {
//   Roadmap.updateMany(
//     {},
//     {
//       $set: { isFinished: false },
//     }
//   ).then((doc) => {
//     return res.status(200).send(doc);
//   });
// });

// modify roadmap
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  var query;

  // roadmaps can't be modified so just in case there's a need to change a driver we have this code
  if (req.body.driverId) {
    query = Roadmap.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          driverId: req.body.driverId,
        },
      },
      { new: true }
    ).then(
      () => {
        User.findByIdAndUpdate(
          req.body.driverId,
          { $push: { roadmaps: req.params.id } },
          { new: true, useFindAndModify: false }
        );
      },
      (err) => {
        console.log(
          "Erreur lors de la mise à jour de la feuille de route: " + err
        );
        return res.status(400).send(err.message);
      }
    );
  } else if (req.body.isFinished) {
    query = Roadmap.findByIdAndUpdate(req.params.id, {
      $set: {
        isFinished: 1,
      },
    });
  }

  query.then(
    (roadmap) => {
      return res.status(200).send(roadmap);
    },
    (err) => {
      console.log(
        "Erreur lors de la mise à jour de la feuille de route: " + err
      );
      return res
        .status(400)
        .send("Erreur lors de la mise à jour de la feuille de route: " + err);
    }
  );
});

// delete roadmap
// *** technically roadmap can't be deleted ***
// router.delete("/:id", (req, res) => {
//   if (!ObjectId.isValid(req.params.id))
//     return res.status(400).send(`no record with given id ${req.params.id}`);
//   Roadmap.findByIdAndRemove(req.params.id, (err, doc) => {
//     if (!err) {
//       res.status(200);
//       res.json({
//         message: "roadmap supprimée avec succès",
//       });
//     } else {
//       console.log("Erreur dans la suppression de la feuille de route: " + err);
//       res.status(400).send(err.message);
//     }
//   });
// });

router.get("/nb/last", (req, res) => {
  Roadmap.find()
    .sort({ roadmapNb: -1 })
    .limit(1)
    .exec(async (err, roadmaps) => {
      if (err) {
        console.log(
          "Erreur dans la récupération du nombre de la feuille de route"
        );
        return res
          .status(404)
          .send("Erreur dans la récupération du nombre de la feuille de route");
      } else {
        if (roadmaps && roadmaps.length === 0) {
          return res.status(200).send("0");
        } else {
          return res.send(roadmaps[0].roadmapNb.toString());
        }
      }
    });
});

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
  if (req.query.driverId) {
    queryObj["driverId"] = req.query.driverId;
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
  var query = Roadmap.find(queryObj);
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
  Roadmap.find({ _id: req.params.id }).then(
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
