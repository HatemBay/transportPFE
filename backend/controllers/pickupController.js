const express = require("express");
const { Fournisseur } = require("../models/fournisseur");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

const { Pickup } = require("../models/pickup");
const { Package } = require("../models/package");
const { User } = require("../models/users");

// get pickups
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
    { $unwind: "$fournisseurs" },
    {
      $lookup: {
        from: "users",
        localField: "driverId",
        foreignField: "_id",
        as: "drivers",
      },
    },
    { $unwind: { path: "$drivers", preserveNullAndEmptyArrays: true } },
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
        from: "delegations",
        localField: "fournisseurs.delegationId",
        foreignField: "_id",
        as: "delegations",
      },
    },
    { $unwind: "$delegations" },
    {
      $lookup: {
        from: "villes",
        localField: "delegations.villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: "$villes" },
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
        pickupNb: 1,
        isAllocated: "$isAllocated",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        telf: "$fournisseurs.tel",
        tel2f: "$fournisseurs.tel2",
        delegationf: "$delegations.nom",
        villef: "$villes.nom",
        driverId: 1,
        nomd: "$drivers.nom",
        nomv: "$vehicules.serie",
        packages: "$packages",
        nbPackages: { $size: "$packages" },
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
  data.push({
    $sort: sort,
  });

  if (req.query.isAllocated) {
    var isAllocated = req.query.isAllocated === "true";
    data.push({
      $match: {
        isAllocated: isAllocated,
      },
    });
  }
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
  Pickup.aggregate(data).exec((err, pickups) => {
    if (!err) {
      if (req.query.search) {
        pickups = pickups.filter(
          (item) =>
            item.nbPackages.toString().includes(req.query.search) ||
            item.nomf?.toLowerCase().includes(req.query.search.toLowerCase()) ||
            item.villef
              ?.toLowerCase()
              .includes(req.query.search.toLowerCase()) ||
            item.delegationf
              ?.toLowerCase()
              .includes(req.query.search.toLowerCase())
        );
      }
      return res.send({
        length: pickups.length,
        data: pickups.slice(skip).slice(0, limit),
      });
    } else {
      res
        .status(400)
        .send("Erreur lors de la récupération des pickups: " + err);
    }
  });
});

// get pickup
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
    { $unwind: "$fournisseurs" },
    {
      $lookup: {
        from: "drivers",
        localField: "driverId",
        foreignField: "_id",
        as: "drivers",
      },
    },
    { $unwind: { path: "$drivers", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "delegations",
        localField: "fournisseurs.delegationId",
        foreignField: "_id",
        as: "delegations",
      },
    },
    { $unwind: "$delegations" },
    {
      $lookup: {
        from: "villes",
        localField: "delegations.villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: "$villes" },
    {
      $project: {
        _id: 1,
        pickupNb: 1,
        isAllocated: "$isAllocated",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        telf: "$fournisseurs.tel",
        tel2f: "$fournisseurs.tel2",
        delegationf: "$delegations.nom",
        villef: "$villes.nom",
        nomd: "$drivers.nom",
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
  Pickup.aggregate(data).exec((err, pickup) => {
    if (!err) res.send(pickup);
    else console.log("Erreur lors de la récupération du pickup: " + err);
  });
});

// create pickup
router.post("/", (req, res) => {
  const pickup = new Pickup();
  Pickup.find()
    .sort({ pickupNb: -1 })
    .limit(1)
    .exec((err, pickups) => {
      if (err) {
        console.log("Erreur dans la récupération du nombre de pickup");
        return res
          .status(404)
          .send("Erreur dans la récupération du nombre de pickup");
      }
      pickup.pickupNb = pickups[0].pickupNb + 1 || 1;
      pickup.fournisseurId = req.body.fournisseurId;
      pickup.packages = req.body.packages;

      pickup.save().then(
        (pickup) => {
          Fournisseur.findByIdAndUpdate(
            req.body.fournisseurId,
            { $push: { pickups: pickup._id } },
            { new: true, useFindAndModify: false }
          ).then(
            async () => {
              var count = 0;
              const date = new Date();
              const day = date.getDate();
              const month = date.getMonth();
              const year = date.getFullYear();

              pickup.packages.forEach((element) => {
                console.log(element);
                Package.findByIdAndUpdate(element, {
                  pickupId: pickup._id,
                }).exec((err) => {
                  if (err) {
                    "Erreur lors de la mise à jour des colis: " + err;
                    return res.status(400).send(err);
                  }
                });
              });

              const todaysPickups = await Pickup.find({
                createdAt: {
                  $gte: new Date(year, month, day, 0, 0, 0, 0),
                  $lte: new Date(year, month, day, 23, 59, 59, 999),
                },
              }).then((res) => {
                return res;
              });

              todaysPickups.forEach((element) => {
                count += element.packages.length;
              });
              const notify = { count: count };
              socket.emit("notification", notify); // Updates Live Notification
              return res.status(201).send(notify);
            },
            (err2) => {
              console.log(
                "Erreur lors de la mise à jour du fournisseur: " + err2
              );
              return res.status(400).send(err2);
            }
          );
        },
        (err) => {
          console.log("Erreur lors de la création du pickup: " + err);
          return res.status(400).send(err.message);
        }
      );
    });
  // pickup.pickupNb = pickupNb;
});

// get notification for daily packages
router.get("/daily-package/notification", async (req, res) => {
  var count = 0;
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  const todaysPickups = await Pickup.find({
    createdAt: {
      $gte: new Date(year, month, day, 0, 0, 0, 0),
      $lte: new Date(year, month, day, 23, 59, 59, 999),
    },
  }).then((res) => {
    return res;
  });

  todaysPickups.forEach((element) => {
    count += element.packages.length;
  });
  const notify = { count: count };
  socket.emit("notification", notify); // Updates Live Notification
  return res.status(201).send(notify);
});

// modify pickup
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  var query;

  if (req.body.driverId) {
    query = Pickup.findByIdAndUpdate(
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
          { $push: { pickups: req.params.id } },
          { new: true, useFindAndModify: false }
        );
      },
      (err) => {
        console.log("Erreur lors de la mise à jour du pickup: " + err);
        return res.status(400).send(err.message);
      }
    );
  } else if (req.body.isAllocated == 0) {
    query = Pickup.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          packages: req.body.packages,
        },
      },
      { new: true }
    );
  }

  query.then(
    (pickup) => {
      return res.status(200).send(pickup);
    },
    (err) => {
      console.log("Erreur lors du mis à jour du pickup: " + err);
      return res
        .status(400)
        .send("Erreur lors du mis à jour du pickup: " + err);
    }
  );
});

// delete pickup
// *** technically pickup can't be deleted ***
// router.delete("/:id", (req, res) => {
//   if (!ObjectId.isValid(req.params.id))
//     return res.status(400).send(`no record with given id ${req.params.id}`);
//   Pickup.findByIdAndRemove(req.params.id, (err, doc) => {
//     if (!err) {
//       res.status(200);
//       res.json({
//         message: "pickup supprimée avec succès",
//       });
//     } else {
//       console.log("Erreur dans la suppression du pickup: " + err);
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
  var query = Pickup.find(queryObj);
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
  Pickup.find({ _id: req.params.id }).then(
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
