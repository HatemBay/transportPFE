const express = require("express");
var _ = require("underscore");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

const { access }= require("../middlewares");

//pdf
var multer = require("multer");
var upload = multer({
  dest: "uploads/",
  fileFilter: function (req, file, cb) {
    console.log("file is", file);
    cb(null, true);
  },
});
var importExcelData2MongoDB = require("../utils/excel");

const { Package } = require("../models/package");
var { Client } = require("../models/client");
var { Fournisseur } = require("../models/fournisseur");
const { default: mongoose } = require("mongoose");

// Read all
router.get("/", (req, res) => {
  Package.find((err, docs) => {
    if (!err) res.send(docs);
    else
      console.log(
        "Error in retrieving Packages: " + JSON.stringify(err, undefined, 2)
      );
  });
});

// Read one
router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  Package.findById(req.params.id, (err, doc) => {
    if (!err) res.send(doc);
    else
      console.log(
        "Erreur lors de la récupération des colis: " +
          JSON.stringify(err, undefined, 2)
      );
  });
});

// Read all with all client and provider data (fullpackage)
router.get("/all-info/:fid", (req, res) => {
  const startDate = req.query.startDate || null;
  const endDate = req.query.endDate || null;
  const state = req.query.etat || null;

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

  // adapting request id to aggregate options
  var id = mongoose.Types.ObjectId(req.params.fid);
  var sort = {};
  var limit = parseInt(req.query.limit) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = limit * page - limit;
  var n = 1;
  if (req.query.sort == "desc") n = -1;
  sort[req.query.sortBy] = n;

  Package.aggregate([
    {
      $lookup: {
        from: "clients",
        localField: "clientId",
        foreignField: "_id",
        as: "clients",
      },
    },
    { $unwind: "$clients" },
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
      $project: {
        _id: 1,
        CAB: 1,
        service: 1,
        libelle: 1,
        c_remboursement: 1,
        volume: 1,
        poids: 1,
        pieces: 1,
        etat: 1,
        clientId: "$clients._id",
        nomc: "$clients.nom",
        villec: "$clients.ville",
        delegationc: "$clients.delegation",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
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
      $match: { fournisseurId: id },
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
  ]).exec((err, doc) => {
    if (!err) {
      if (req.query.search && req.query.search.length > 2) {
        if (startDate && endDate) {
          if (state) {
            res.send(
              doc.filter(
                (item) =>
                  (item.CAB.toString().includes(req.query.search) ||
                    item.telc.toString().includes(req.query.search) ||
                    item.tel2c?.toString().includes(req.query.search) ||
                    item.c_remboursement
                      .toString()
                      .includes(req.query.search) ||
                    item.codePostalec.toString().includes(req.query.search) ||
                    item.createdAtSearch
                      .toString()
                      .includes(req.query.search) ||
                    item.nomc
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase()) ||
                    item.villec
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase()) ||
                    item.delegationc
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase()) ||
                    item.adressec
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase())) &&
                  item.etat.toLowerCase().includes(state.toLowerCase()) &&
                  item.createdAt >= new Date(startYear, startMonth, startDay) &&
                  item.createdAt < new Date(endYear, endMonth, endDay)
              )
            );
          } else if (!state) {
            res.send(
              doc.filter(
                (item) =>
                  (item.CAB.toString().includes(req.query.search) ||
                    item.telc.toString().includes(req.query.search) ||
                    item.tel2c?.toString().includes(req.query.search) ||
                    item.c_remboursement
                      .toString()
                      .includes(req.query.search) ||
                    item.codePostalec.toString().includes(req.query.search) ||
                    item.createdAtSearch
                      .toString()
                      .includes(req.query.search) ||
                    item.nomc
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase()) ||
                    item.villec
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase()) ||
                    item.delegationc
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase()) ||
                    item.adressec
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase())) &&
                  item.createdAt >= new Date(startYear, startMonth, startDay) &&
                  item.createdAt < new Date(endYear, endMonth, endDay)
              )
            );
          }
        } else if (!(startDate && endDate)) {
          if (state) {
            res.send(
              doc.filter(
                (item) =>
                  (item.CAB.toString().includes(req.query.search) ||
                    item.telc.toString().includes(req.query.search) ||
                    item.tel2c?.toString().includes(req.query.search) ||
                    item.c_remboursement
                      .toString()
                      .includes(req.query.search) ||
                    item.codePostalec.toString().includes(req.query.search) ||
                    item.createdAtSearch
                      .toString()
                      .includes(req.query.search) ||
                    item.nomc
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase()) ||
                    item.villec
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase()) ||
                    item.delegationc
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase()) ||
                    item.adressec
                      .toLowerCase()
                      .includes(req.query.search.toLowerCase())) &&
                  item.etat.toLowerCase().includes(state.toLowerCase())
              )
            );
          } else if (!state) {
            res.send(
              doc.filter(
                (item) =>
                  item.CAB.toString().includes(req.query.search) ||
                  item.telc.toString().includes(req.query.search) ||
                  item.tel2c?.toString().includes(req.query.search) ||
                  item.c_remboursement.toString().includes(req.query.search) ||
                  item.codePostalec.toString().includes(req.query.search) ||
                  item.createdAtSearch.toString().includes(req.query.search) ||
                  item.nomc
                    .toLowerCase()
                    .includes(req.query.search.toLowerCase()) ||
                  item.villec
                    .toLowerCase()
                    .includes(req.query.search.toLowerCase()) ||
                  item.delegationc
                    .toLowerCase()
                    .includes(req.query.search.toLowerCase()) ||
                  item.adressec
                    .toLowerCase()
                    .includes(req.query.search.toLowerCase())
              )
            );
          }
        }
      } else if (!(req.query.search && req.query.search.length > 2)) {
        if (startDate && endDate) {
          if (state) {
            res.send(
              doc.filter(
                (item) =>
                  item.etat.toLowerCase().includes(state.toLowerCase()) &&
                  item.createdAt >= new Date(startYear, startMonth, startDay) &&
                  item.createdAt < new Date(endYear, endMonth, endDay)
              )
            );
          } else if (!state) {
            res.send(
              doc.filter(
                (item) =>
                  item.createdAt >= new Date(startYear, startMonth, startDay) &&
                  item.createdAt < new Date(endYear, endMonth, endDay)
              )
            );
          }
        } else if (!(startDate && endDate)) {
          if (state) {
            res.send(
              doc.filter((item) =>
                item.etat.toLowerCase().includes(state.toLowerCase())
              )
            );
          } else if (!state) {
            res.send(doc);
          }
        }
      }
    } else console.log("Erreur lors de la récupération des colis: " + err);
  });
});

// Read one with all client and provider data
router.get("/all-info/:id/:fid", (req, res) => {
  // adapting request id to aggregate options
  var id = mongoose.Types.ObjectId(req.params.id);
  var fid = mongoose.Types.ObjectId(req.params.fid);

  Package.aggregate([
    {
      $lookup: {
        from: "clients",
        localField: "clientId",
        foreignField: "_id",
        as: "clients",
      },
    },
    { $unwind: "$clients" },
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
      $project: {
        _id: 1,
        CAB: 1,
        service: 1,
        libelle: 1,
        c_remboursement: 1,
        volume: 1,
        poids: 1,
        pieces: 1,
        etat: 1,
        clientId: "$clients._id",
        nomc: "$clients.nom",
        villec: "$clients.ville",
        delegationc: "$clients.delegation",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        villef: "$fournisseurs.ville",
        delegationf: "$fournisseurs.delegation",
        telf: "$fournisseurs.tel",
        adressef: "$fournisseurs.adresse",
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $match: { fournisseurId: fid, _id: id },
    },
  ]).exec((err, doc) => {
    if (!err) res.send(doc);
    else console.log("Erreur lors de la récupération du colis: " + err);
  });
});

// create package and save foreign keys
router.post("/", (req, res) => {
  const package = new Package();

  var CAB = () => {
    min = Math.ceil(1000000000);
    max = Math.floor(9999999999);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  var checkCAB = () => {
    var x = CAB();
    Package.find({ CAB: x }, (res, err) => {
      if (err) {
        console.log(err);
      }
      if (res != null) {
        checkCAB();
      }
      console.log("check");
    });
    return x;
  };

  var check = checkCAB();

  (package.CAB = check),
    (package.service = req.body.service),
    (package.libelle = req.body.libelle),
    (package.c_remboursement = req.body.c_remboursement),
    (package.volume = req.body.volume),
    (package.poids = req.body.poids),
    (package.pieces = req.body.pieces),
    (package.fournisseurId = req.body.fournisseurId),
    (package.clientId = req.body.clientId);
  return package.save(package).then(
    (doc) => {
      return Client.findByIdAndUpdate(
        package.clientId,
        { $push: { packages: doc._id } },
        { new: true, useFindAndModify: false }
      ).then(
        () => {
          console.log(package.fournisseurId);
          return Fournisseur.findByIdAndUpdate(
            package.fournisseurId,
            { $push: { packages: doc._id } },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              res.send(doc);
            },
            (err) => {
              console.log("Erreur lors de l'enregistrement du colis: " + err);
            }
          );
        },
        (err) => {
          console.log("Erreur lors du mis a jour du fournisseur: " + err);
        }
      );
    },
    (err) => {
      console.log("Erreur lors du mis a jour du client: " + err);
    }
  );
});

// update package
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id: ${req.params.id}`);

  Package.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.status(200);
        res.json({
          message: "package updated successfully",
        });
      } else console.log(err);
    }
  );
});

// delete package
router.delete("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`no record with given id ${req.params.id}`);
  Package.findByIdAndRemove(req.params.id, (err, doc) => {
    console.log(doc);
    if (!err) {
      Fournisseur.findByIdAndUpdate(
        doc.fournisseurId,
        { $pull: { packages: doc._id } },
        (err2) => {
          if (!err2) {
            Client.findByIdAndUpdate(
              doc.clientId,
              { $pull: { packages: doc._id } },
              (err3) => {
                if (!err3) {
                  res.status(200);
                  res.json({
                    message: "package deleted successfully",
                  });
                } else console.log(err3);
              }
            );
          } else console.log(err2);
        }
      );
    } else console.log(err);
  });
});

/********************** STATISTICS **********************/
// count all packages and/or depending on state and/or time periods
// router.get("/count/all/:fid", access(["admin"]) , (req, res) => {
router.get("/count/all/:fid", (req, res) => {
  var state = req.query.etat || null;
  var startYear = req.query.startYear || null;
  var startMonth = req.query.startMonth || null;
  var startDay = req.query.startDay || null;
  var endYear = req.query.endYear || null;
  var endMonth = req.query.endMonth || null;
  var endDay = req.query.endDay || null;
  var query;

  if (startYear && startMonth && startDay && endYear && endMonth && endDay) {
    if (state) {
      query = Package.find({
        etat: state,
        fournisseurId: req.params.fid,
        createdAt: {
          $gte: new Date(startYear, startMonth, startDay),
          $lt: new Date(endYear, endMonth, endDay),
        },
      });
    } else {
      query = Package.find({
        fournisseurId: req.params.fid,
        createdAt: {
          $gte: new Date(startYear, startMonth, startDay),
          $lt: new Date(endYear, endMonth, endDay),
        },
      });
    }
  } else {
    if (state) {
      console.log(state);
      query = Package.find({
        etat: state,
        fournisseurId: req.params.fid,
      });
    } else {
      query = Package.find({
        fournisseurId: req.params.fid,
      });
    }
  }

  query.count((err, count) => {
    if (!err) {
      res.send({ count: count });
    } else console.log(err);
  });
});

//count packages that a client has
router.get("/count/:id", (req, res) => {
  var query = Package.find({ clientId: req.params.id });
  query.count((err, count) => {
    if (!err) {
      res.send({ count: count });
    } else console.log(err);
  });
  /********************** STATISTICS **********************/

  // Package.aggregate([
  //   {
  //     $lookup: {
  //       from: "clients",
  //       localField: "clientId",
  //       foreignField: "_id",
  //       as: "clients",
  //     },
  //   },
  //   { $unwind: "$clients" },
  //   {
  //     $project: {
  //       clientId: "$clients._id",
  //       nomc: "$clients.nom",
  //       villec: "$clients.ville",
  //       delegationc: "$clients.delegation",
  //       adressec: "$clients.adresse",
  //       codePostalec: "$clients.codePostale",
  //       telc: "$clients.tel",
  //       tel2c: "$clients.tel2",
  //       fournisseurId: "$fournisseurs._id",
  //       createdAt: "$clients.createdAt",
  //       updatedAt: "$clients.updatedAt",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       count: {$count: {$cond: "$clients._id" }}
  //     }
  //   },
  //   {
  //     $match: { fournisseurId: fid, _id: id },
  //   },
  // ]).exec((err, doc) => {
  //   if (!err) res.send(doc);
  //   else console.log("Erreur lors de la récupération du colis: " + err);
  // });
});

router.post(
  "/uploadfile/pdf",
  upload.single("uploadfile"),
  (req, res, next) => {
    importExcelData2MongoDB("uploads/" + req.file.filename);
    // importExcelData2MongoDB();
    // console.log(req.body);
    // console.log(req.file);
    console.log(res);
  }
);

module.exports = router;
