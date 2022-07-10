const express = require("express");
var _ = require("underscore");

var router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

const { Package } = require("../models/package");
const { Historique } = require("../models/historique");
const { User } = require("../models/users");
const { Client } = require("../models/client");
const { Fournisseur } = require("../models/fournisseur");
const { Ville } = require("../models/ville");
const { default: mongoose } = require("mongoose");
const { Pickup } = require("../models/pickup");

// Read all
router.get("/by-daily-pickup/:pickupId", (req, res) => {
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
  if (!ObjectId.isValid(req.params.fid)) {
    console.log(`no record with given id: ${req.params.id}`);
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  } else {
    var id = mongoose.Types.ObjectId(req.params.fid);
  }
  var sort = {};
  var limit = parseInt(req.query.limit) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = limit * page - limit;
  var n = -1;
  var sortBy = req.query.sortBy || "createdAt";
  if (req.query.sort == "asc") n = 1;
  sort[sortBy] = n;

  data = [
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
        from: "delegations",
        localField: "clients.delegationId",
        foreignField: "_id",
        as: "delegationsClient",
      },
    },
    {
      $unwind: { path: "$delegationsClient", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsClient.villeId",
        foreignField: "_id",
        as: "villesClient",
      },
    },
    { $unwind: { path: "$villesClient", preserveNullAndEmptyArrays: true } },
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
        villec: "$villesClient.nom",
        delegationc: "$delegationsClient.nom",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        villef: "$villes.nom",
        delegationf: "$delegations.nom",
        createdAt: 1,
        updatedAt: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$updatedAt" },
        },
        createdAtSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$createdAt" },
        },
      },
    },
    {
      $match: { fournisseurId: id },
    },
  ];
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
    else console.log("Erreur lors de la récupération des colis: " + err);
  });
});

//read one by CAB
router.get("/cab/:cab", (req, res) => {
  // if (req.params.cab.length !== 10 || isNaN(req.params.cab))
  //   return res.status(400).send(`Format CAB invalide: ${req.params.cab}`);
  Package.find({ CAB: req.params.cab }, (err, doc) => {
    if (!err) res.send(doc);
    else console.log("Erreur lors de la récupération des colis: " + err);
  });
});

// Read all with all client and provider data (provider restricted)
router.get("/all-info/:fid", async (req, res) => {
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
  if (!ObjectId.isValid(req.params.fid)) {
    console.log(`no record with given id: ${req.params.id}`);
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  } else {
    var id = mongoose.Types.ObjectId(req.params.fid);
  }
  var sort = {};
  var limit = parseInt(req.query.limit) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = limit * page - limit;
  var n = -1;
  var sortBy = req.query.sortBy || "createdAt";
  if (req.query.sort == "asc") n = 1;
  sort[sortBy] = n;

  data = [
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
        from: "delegations",
        localField: "clients.delegationId",
        foreignField: "_id",
        as: "delegationsClient",
      },
    },
    {
      $unwind: { path: "$delegationsClient", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsClient.villeId",
        foreignField: "_id",
        as: "villesClient",
      },
    },
    { $unwind: { path: "$villesClient", preserveNullAndEmptyArrays: true } },
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
        villeId: "$villesClient._id",
        villec: "$villesClient.nom",
        delegationId: "$delegationsClient._id",
        delegationc: "$delegationsClient.nom",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        villef: "$villes.nom",
        delegationf: "$delegations.nom",
        createdAt: 1,
        updatedAt: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$updatedAt" },
        },
        createdAtSearch: {
          $dateToString: { format: "%d-%m-%Y, %H:%M", date: "$createdAt" },
        },
      },
    },
    {
      $match: { fournisseurId: id },
    },
  ];
  console.log(state);
  if (state) {
    data.push({
      $match: {
        etat: state,
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

  if (req.query.type == "feuille-de-retour") {
    data.push({
      $match: {
        etat: "annulé",
      },
    });
  }

  if (req.query.type == "pickup") {
    data.push({
      $match: {
        etat: "nouveau",
      },
    });
  }

  if (req.query.type == "finance-client") {
    data.push({
      $match: {
        etat: { $in: ["livré (espèce)", "livré (chèque)", "retourné"] },
      },
    });
  }

  data.push({
    $sort: sort,
  });

  Package.aggregate(data).exec((err, doc) => {
    if (!err) {
      var slm;
      if (startDate && endDate) {
        doc = doc.filter(
          (item) =>
            item.createdAt >= new Date(startYear, startMonth, startDay) &&
            item.createdAt <= new Date(endYear, endMonth, endDay + 1)
        );
      }
      if (state) {
        doc = doc.filter((item) =>
          item.etat.toLowerCase().includes(state.toLowerCase())
        );
      }
      if (req.query.search && req.query.search.length > 2) {
        //* Searching criterias differ between client and admin side,
        //* since we're using the 'type' query parameter only in admin we're putting different search criterias in this condition
        if (req.query.type && req.query.type != "") {
          doc = doc.filter(
            (item) =>
              item.CAB.toString().includes(req.query.search) ||
              item.createdAtSearch.toString().includes(req.query.search) ||
              item.nomf
                .toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.villef
                .toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.delegationf
                .toLowerCase()
                .includes(req.query.search.toLowerCase())
          );
        } else {
          //* Client side filtering
          doc = doc.filter(
            (item) =>
              item.CAB.toString().includes(req.query.search) ||
              item.telc.toString().includes(req.query.search) ||
              item.tel2c?.toString().includes(req.query.search) ||
              item.c_remboursement.toString().includes(req.query.search) ||
              item.codePostalec?.toString().includes(req.query.search) ||
              item.createdAtSearch.toString().includes(req.query.search) ||
              item.nomc
                .toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.villec
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.delegationc
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase()) ||
              item.adressec
                ?.toLowerCase()
                .includes(req.query.search.toLowerCase())
          );
        }
      }
      return res.send({
        length: doc.length,
        data: doc.slice(skip).slice(0, limit),
      });
    } else console.log("Erreur lors de la récupération des colis: " + err);
  });
});

// Read all with all client and provider data (per day)
router.get("/all-info-daily/admin", (req, res) => {
  var date = new Date();
  if (req.query.date) {
    date = new Date(req.query.date);
  }
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();

  // adapting request id to aggregate options
  var sort = {};
  var limit = parseInt(req.query.limit) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = limit * page - limit;
  var n = 1;
  var sortBy = req.query.sortBy || "createdAt";
  if (req.query.sort == "desc") n = -1;
  sort[sortBy] = n;

  data = [
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
      $lookup: {
        from: "delegations",
        localField: "clients.delegationId",
        foreignField: "_id",
        as: "delegationsClient",
      },
    },
    {
      $unwind: { path: "$delegationsClient", preserveNullAndEmptyArrays: true },
    },

    {
      $lookup: {
        from: "villes",
        localField: "delegationsClient.villeId",
        foreignField: "_id",
        as: "villesClient",
      },
    },
    { $unwind: { path: "$villesClient", preserveNullAndEmptyArrays: true } },

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
        pickupId: 1,
        clientId: "$clients._id",
        nomc: "$clients.nom",
        villec: "$villesClient.nom",
        delegationc: "$delegationsClient.nom",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        telf: "$fournisseurs.tel",
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
    {
      $match: {
        updatedAt: {
          $gte: new Date(year, month, day, 0, 0, 0, 0),
          $lte: new Date(year, month, day, 23, 59, 59, 999),
        },
        etat: "pret",
      },
    },
  ];

  data.push({
    $sort: sort,
  });

  Package.aggregate(data).exec((err, doc) => {
    if (!err) {
      if (req.query.search && req.query.search.length > 2) {
        doc = doc.filter(
          (item) =>
            item.CAB.toString().includes(req.query.search) ||
            item.telc.toString().includes(req.query.search) ||
            item.tel2c?.toString().includes(req.query.search) ||
            item.telf.toString().includes(req.query.search) ||
            item.c_remboursement.toString().includes(req.query.search) ||
            item.createdAtSearch.toString().includes(req.query.search) ||
            item.nomc.toLowerCase().includes(req.query.search.toLowerCase()) ||
            item.nomf.toLowerCase().includes(req.query.search.toLowerCase()) ||
            item.villec
              ?.toLowerCase()
              .includes(req.query.search.toLowerCase()) ||
            item.delegationc
              ?.toLowerCase()
              .includes(req.query.search.toLowerCase()) ||
            item.adressec.toLowerCase().includes(req.query.search.toLowerCase())
        );
      }
      return res.send({
        length: doc.length,
        data: doc.slice(skip).slice(0, limit),
      });
    } else console.log("Erreur lors de la récupération des colis: " + err);
  });
});

// Read all with all client and provider data (provider restricted)
router.get("/all-info-period/admin", async (req, res) => {
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

  var sort = {};
  var limit = parseInt(req.query.limit) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = limit * page - limit;
  var n = -1;
  var sortBy = req.query.sortBy || "createdAt";
  if (req.query.sort == "asc") n = 1;
  sort[sortBy] = n;

  data = [
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
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "filieres",
        localField: "users.filiereId",
        foreignField: "_id",
        as: "filieres",
      },
    },
    { $unwind: { path: "$filieres", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "delegations",
        localField: "clients.delegationId",
        foreignField: "_id",
        as: "delegationsClient",
      },
    },
    {
      $unwind: { path: "$delegationsClient", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsClient.villeId",
        foreignField: "_id",
        as: "villesClient",
      },
    },
    { $unwind: { path: "$villesClient", preserveNullAndEmptyArrays: true } },
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
        pickupId: 1,
        clientId: "$clients._id",
        nomc: "$clients.nom",
        villec: "$villesClient.nom",
        delegationc: "$delegationsClient.nom",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        telf: "$fournisseurs.tel",
        userId: "$users._id",
        nomu: "$users.nom",
        filiere: "$filieres.nom",
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
  ];

  if (req.query.pickupId) {
    const pickupId = mongoose.Types.ObjectId(req.query.pickupId);
    data.push({
      $match: {
        pickupId: pickupId,
      },
    });
  }

  if (req.query.reference && req.query.reference != null) {
    if (Array.isArray(req.query.reference)) {
      const references = req.query.reference;
      const referencesNumber = references.map((ref) => parseInt(ref));
      data.push({
        $match: {
          CAB: { $in: referencesNumber },
        },
      });
    } else {
      data.push({
        $match: {
          CAB: parseInt(req.query.reference),
        },
      });
    }
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

  data.push({
    $sort: sort,
  });

  Package.aggregate(data).exec((err, doc) => {
    if (!err) {
      if (req.query.search && req.query.search.length > 2) {
        doc = doc.filter(
          (item) =>
            item.CAB.toString().includes(req.query.search) ||
            item.telc.toString().includes(req.query.search) ||
            item.tel2c?.toString().includes(req.query.search) ||
            item.telf.toString().includes(req.query.search) ||
            item.c_remboursement.toString().includes(req.query.search) ||
            item.etat?.toString().includes(req.query.search) ||
            item.createdAtSearch.toString().includes(req.query.search) ||
            item.nomc.toLowerCase().includes(req.query.search.toLowerCase()) ||
            item.nomf.toLowerCase().includes(req.query.search.toLowerCase()) ||
            item.villec
              ?.toLowerCase()
              .includes(req.query.search.toLowerCase()) ||
            item.delegationc
              ?.toLowerCase()
              .includes(req.query.search.toLowerCase()) ||
            item.adressec.toLowerCase().includes(req.query.search.toLowerCase())
        );
      }
      return res.send({
        length: doc.length,
        data: doc.slice(skip).slice(0, limit),
      });
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
        from: "delegations",
        localField: "clients.delegationId",
        foreignField: "_id",
        as: "delegationsClient",
      },
    },
    {
      $unwind: { path: "$delegationsClient", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsClient.villeId",
        foreignField: "_id",
        as: "villesClient",
      },
    },
    { $unwind: { path: "$villesClient", preserveNullAndEmptyArrays: true } },
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
        from: "delegations",
        localField: "fournisseurs.delegationId",
        foreignField: "_id",
        as: "delegationsFournisseurs",
      },
    },
    {
      $unwind: {
        path: "$delegationsFournisseurs",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsFournisseurs.villeId",
        foreignField: "_id",
        as: "villesFournisseurs",
      },
    },
    {
      $unwind: {
        path: "$villesFournisseurs",
        preserveNullAndEmptyArrays: true,
      },
    },
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
        villeId: "$villesClient._id",
        villec: "$villesClient.nom",
        delegationId: "$delegationsClient._id",
        delegationc: "$delegationsClient.nom",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        villef: "$villesFournisseurs.nom",
        delegationf: "$delegationsFournisseurs.nom",
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

// Read one with all client and provider data
router.get("/all-info-admin/:id", (req, res) => {
  // adapting request id to aggregate options
  var id = mongoose.Types.ObjectId(req.params.id);

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
        from: "delegations",
        localField: "clients.delegationId",
        foreignField: "_id",
        as: "delegationsClient",
      },
    },
    {
      $unwind: { path: "$delegationsClient", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsClient.villeId",
        foreignField: "_id",
        as: "villesClient",
      },
    },
    { $unwind: { path: "$villesClient", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "filieres",
        localField: "users.filiereId",
        foreignField: "_id",
        as: "filieres",
      },
    },
    { $unwind: { path: "$filieres", preserveNullAndEmptyArrays: true } },
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
        from: "delegations",
        localField: "fournisseurs.delegationId",
        foreignField: "_id",
        as: "delegationsFournisseurs",
      },
    },
    {
      $unwind: {
        path: "$delegationsFournisseurs",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsFournisseurs.villeId",
        foreignField: "_id",
        as: "villesFournisseurs",
      },
    },
    {
      $unwind: {
        path: "$villesFournisseurs",
        preserveNullAndEmptyArrays: true,
      },
    },
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
        villeId: "$villesClient._id",
        villec: "$villesClient.nom",
        delegationId: "$delegationsClient._id",
        delegationc: "$delegationsClient.nom",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        villef: "$villesFournisseurs.nom",
        delegationf: "$delegationsFournisseurs.nom",
        telf: "$fournisseurs.tel",
        adressef: "$fournisseurs.adresse",
        userId: "$users._id",
        nomu: "$users.nom",
        filiere: "$filieres.nom",
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $match: { _id: id },
    },
  ]).exec((err, doc) => {
    if (!err) res.send(doc);
    else console.log("Erreur lors de la récupération du colis: " + err);
  });
});

// Read one with all client and provider data (cab)
router.get("/all-info-admin-cab/:cab", (req, res) => {
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
        from: "delegations",
        localField: "clients.delegationId",
        foreignField: "_id",
        as: "delegationsClient",
      },
    },
    {
      $unwind: { path: "$delegationsClient", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsClient.villeId",
        foreignField: "_id",
        as: "villesClient",
      },
    },
    { $unwind: { path: "$villesClient", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "filieres",
        localField: "users.filiereId",
        foreignField: "_id",
        as: "filieres",
      },
    },
    { $unwind: { path: "$filieres", preserveNullAndEmptyArrays: true } },
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
        from: "delegations",
        localField: "fournisseurs.delegationId",
        foreignField: "_id",
        as: "delegationsFournisseur",
      },
    },
    {
      $unwind: {
        path: "$delegationsFournisseur",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsFournisseur.villeId",
        foreignField: "_id",
        as: "villesFournisseur",
      },
    },
    {
      $unwind: { path: "$villesFournisseur", preserveNullAndEmptyArrays: true },
    },
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
        remarque: 1,
        clientId: "$clients._id",
        nomc: "$clients.nom",
        villeId: "$villesClient._id",
        villec: "$villesClient.nom",
        delegationId: "$delegationsClient._id",
        delegationc: "$delegationsClient.nom",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        villef: "$villesFournisseur.nom",
        delegationf: "$delegationsFournisseur.nom",
        telf: "$fournisseurs.tel",
        adressef: "$fournisseurs.adresse",
        userId: "$users._id",
        nomu: "$users.nom",
        filiere: "$filieres.nom",
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $match: { CAB: parseInt(req.params.cab) },
    },
  ]).exec((err, doc) => {
    if (!err) res.send(doc);
    else console.log("Erreur lors de la récupération du colis: " + err);
  });
});

// Read all with all client and provider data (for admin)
router.get("/all-info-search/admin", (req, res) => {
  var CAB = parseInt(req.query.CAB) || null;
  var tel = parseInt(req.query.tel) || null;
  var nom = req.query.nom;
  var adresse = req.query.adresse;
  var delegation = req.query.delegation;

  var data = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "users",
      },
    },
    { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "filieres",
        localField: "users.filiereId",
        foreignField: "_id",
        as: "filieres",
      },
    },
    { $unwind: { path: "$filieres", preserveNullAndEmptyArrays: true } },
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
        from: "delegations",
        localField: "clients.delegationId",
        foreignField: "_id",
        as: "delegationsClient",
      },
    },
    {
      $unwind: { path: "$delegationsClient", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsClient.villeId",
        foreignField: "_id",
        as: "villesClient",
      },
    },
    { $unwind: { path: "$villesClient", preserveNullAndEmptyArrays: true } },
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
        from: "villes",
        localField: "fournisseurs.villeId",
        foreignField: "_id",
        as: "villes",
      },
    },
    { $unwind: "$villes" },
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
        from: "historiques",
        localField: "historique",
        foreignField: "_id",
        pipeline: [
          {
            $addFields: {
              dateFormatted: {
                $dateToString: {
                  format: "%d-%m-%Y à %H:%M",
                  date: "$date",
                },
              },
            },
          },
        ],
        as: "historiques",
      },
    },
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
        userId: "$users._id",
        nomu: "$users.nom",
        filiere: "$filieres.nom",
        clientId: "$clients._id",
        nomc: "$clients.nom",
        villec: "$villesClient.nom",
        delegationc: "$delegationsClient.nom",
        adressec: "$clients.adresse",
        codePostalec: "$clients.codePostale",
        telc: "$clients.tel",
        tel2c: "$clients.tel2",
        fournisseurId: "$fournisseurs._id",
        nomf: "$fournisseurs.nom",
        telf: "$fournisseurs.tel",
        villef: "$villes.nom",
        delegationf: "$delegations.nom",
        adressef: "$fournisseurs.adresse",
        historique: "$historiques",
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  // var regex = /[0-9]*2391203218[0-9]*/;
  // var regex = new RegExp(`[0-9]*${CAB}[0-9]*`, "g");
  // regex = regex.replace(/\D/g, "");

  if (nom) {
    data.push({
      $match: {
        nomc: new RegExp(`.*${nom}.*`, "gi"),
      },
    });
  }

  if (adresse) {
    data.push({
      $match: {
        adressec: new RegExp(`.*${adresse}.*`, "gi"),
      },
    });
  }

  if (delegation) {
    data.push({
      $match: {
        delegationc: new RegExp(`.*${delegation}.*`, "gi"),
      },
    });
  }

  Package.aggregate(data).exec((err, doc) => {
    if (!err) {
      if (CAB) {
        doc = doc.filter((item) => item.CAB.toString().includes(CAB));
      } else if (tel) {
        doc = doc.filter((item) => item.telc.toString().includes(tel));
      }
      return res.send(doc);
    } else console.log("Erreur lors de la récupération du colis: " + err);
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
  return package
    .save()
    .then((doc) => {
      return Client.findByIdAndUpdate(
        package.clientId,
        { $push: { packages: doc._id } },
        { new: true, useFindAndModify: false }
      ).then(
        () => {
          return Fournisseur.findByIdAndUpdate(
            package.fournisseurId,
            { $push: { packages: doc._id } },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              const historique = new Historique();
              historique.packageId = doc._id;
              return historique.save().then(
                (historique) => {
                  Package.findByIdAndUpdate(
                    doc._id,
                    {
                      $push: { historique: historique._id },
                    },
                    { new: true, useFindAndModify: false }
                  ).then(
                    () => {
                      res.send(doc);
                    },
                    (err) => {
                      console.log(
                        "Erreur lors de la création du colis (historique): " +
                          err
                      );
                      res.status(400).send(err.message);
                    }
                  );
                },
                (err) => {
                  console.log(
                    "Erreur lors de la création de l'historique: " + err
                  );
                  res.status(400).send(err.message);
                }
              );
            },
            (err) => {
              console.log(
                "Erreur lors de la mise à jour du fournisseur: " + err
              );
              res.status(400).send(err.message);
            }
          );
        },
        (err) => {
          console.log("Erreur lors du mis a jour du client: " + err);
          res.status(400).send(err.message);
        }
      );
    })
    .catch((err) => {
      console.log("Erreur lors de l'enregistrement du colis: " + err);
      res.status(400).send(err.message);
    });
});

// update package
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    console.log(`no record with given id: ${req.params.id}`);
    return res.status(400).send(`no record with given id: ${req.params.id}`);
  }

  Package.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  ).then(
    (doc) => {
      const historique = new Historique();
      if (req.query.adminModification && req.query.adminModification != null) {
        historique.action = "modifié par admin";
      }
      historique.packageId = doc._id;
      return historique.save().then(
        (historique) => {
          Package.findByIdAndUpdate(
            doc._id,
            {
              $push: { historique: historique._id },
            },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              if (req.body.userId) {
                User.findByIdAndUpdate(
                  doc.userId,
                  { $push: { packages: doc._id } },
                  { new: true, useFindAndModify: false }
                ).then(
                  () => {
                    return res.send(doc);
                  },
                  (err) => {
                    console.log(
                      `Erreur lors de la mise à jour de l'utilisateur: ${err}`
                    );
                    return res.status(400).send(err.message);
                  }
                );
              } else return res.send(doc);
            },
            (err) => {
              console.log(
                "Erreur lors de la mise à jour du colis (historique): " + err
              );
              res.status(400).send(err.message);
            }
          );
        },
        (err) => {
          console.log("Erreur lors de la création de l'historique: " + err);
          res.status(400).send(err.message);
        }
      );
    },
    (err) => {
      console.log("Erreur lors de la mise à jour du colis: " + err);
      res.status(400).send(err.message);
    }
  );
});

// update package
router.put("/cab/:CAB", (req, res) => {
  if (req.params.CAB.length != 10) {
    console.log(`Code barre n'existe pas: ${req.params.CAB}`);
    return res.status(400).send(`Code barre n'existe pas: ${req.params.CAB}`);
  }

  Package.findOneAndUpdate(
    { CAB: req.params.CAB },
    {
      $set: req.body,
    },
    { new: true }
  ).then(
    (doc) => {
      const historique = new Historique();
      historique.action = doc.etat;
      historique.packageId = doc._id;
      return historique.save().then(
        (historique) => {
          Package.findByIdAndUpdate(
            doc._id,
            {
              $push: { historique: historique._id },
            },
            { new: true, useFindAndModify: false }
          ).then(
            () => {
              if (req.body.userId) {
                User.findByIdAndUpdate(
                  doc.userId,
                  { $push: { packages: doc._id } },
                  { new: true, useFindAndModify: false }
                ).then(
                  () => {
                    return res.send(doc);
                  },
                  (err) => {
                    console.log(
                      `Erreur lors de la mise à jour de l'utilisateur: ${err}`
                    );
                    return res.status(400).send(err.message);
                  }
                );
              } else return res.send(doc);
            },
            (err) => {
              console.log(
                "Erreur lors de la mise à jour du colis (historique): " + err
              );
              res.status(400).send(err.message);
            }
          );
        },
        (err) => {
          console.log("Erreur lors de la création de l'historique: " + err);
          res.status(400).send(err.message);
        }
      );
    },
    (err) => {
      console.log("Erreur lors de la mise à jour du colis: " + err);
      res.status(400).send(err.message);
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
                  User.findByIdAndUpdate(
                    doc.userId,
                    { $pull: { packages: doc._id } },
                    (err4) => {
                      if (!err4) {
                        Historique.findOneAndDelete(
                          { packageId: doc._id },
                          (err5) => {
                            if (!err5) {
                              res.status(200);
                              res.json({
                                message: "Colis supprimé",
                              });
                            } else {
                              console.log(
                                "Erreur lors de la suppression de l'historique: " +
                                  err5
                              );
                              return res.status(400).send(err5.message);
                            }
                          }
                        );
                      } else {
                        console.log(
                          "Erreur lors de l'enregistrement du colis: " + err4
                        );
                        return res.status(400).send(err4.message);
                      }
                    }
                  );
                } else {
                  console.log(err3);
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
// count all packages and/or depending on state and/or time periods
// router.get("/count/all/:fid", access(["admin"]) , (req, res) => {
router.get("/count-for-provider/:fid", (req, res) => {
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
          $lte: new Date(endYear, endMonth, endDay + 1),
        },
      });
    } else {
      query = Package.find({
        fournisseurId: req.params.fid,
        createdAt: {
          $gte: new Date(startYear, startMonth, startDay),
          $lte: new Date(endYear, endMonth, endDay + 1),
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
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

//count packages that a client has
router.get("/count-for-client/:id", (req, res) => {
  var query = Package.find({ clientId: req.params.id });
  query.count((err, count) => {
    if (!err) {
      res.send({ count: count });
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

//count all packages in a given day
router.get("/count/all-daily", (req, res) => {
  if (req.query.date) {
    var date = new Date(req.query.date) || Date.now();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();

    var query = Package.find({
      createdAt: {
        $gt: new Date(year, month, day),
        $lt: new Date(year, month, day + 1),
      },
    });
  } else {
    var query = Package.find();
  }
  query.count((err, count) => {
    if (!err) {
      res.send({ count: count });
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

//count all packages
router.get("/count/all-period", (req, res) => {
  var state = req.query.etat || null;
  var query;
  const startDate = req.query.startDate || null;
  const endDate = req.query.endDate || null;

  var startYear = null;
  var startMonth = null;
  var startDay = null;

  var endYear = null;
  var endMonth = null;
  var endDay = null;

  const queryObj = {};
  if (state === "nouveau") {
    queryObj["etat"] = state;
  } else if (state && state !== null) {
    queryObj["etat"] = state;
  } else {
    queryObj["etat"] = { $nin: ["nouveau"] };
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

    queryObj["updatedAt"] = {
      $gte: new Date(startYear, startMonth, startDay),
      $lte: new Date(endYear, endMonth, endDay + 1),
    };
  }

  query = Package.find(queryObj);

  query.count((err, count) => {
    if (!err) {
      res.send({ count: count });
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

router.get("/count/today", (req, res) => {
  const queryObj = {};

  const dateS = new Date();
  console.log(dateS);

  startYear = dateS.getFullYear();
  startMonth = dateS.getMonth();
  startDay = dateS.getDate();

  queryObj["updatedAt"] = {
    $gte: new Date(startYear, startMonth, startDay, 0, 0, 0, 0),
    $lte: new Date(startYear, startMonth, startDay, 23, 59, 59, 999),
  };
  queryObj["etat"] = "pret";
  var query = Package.find(queryObj);
  query.count((err, count) => {
    if (!err) {
      res.send({ count: count });
    } else {
      console.log(err);
      res.status(400).send(err.message);
    }
  });
});

router.get("/count/over-week", async (req, res) => {
  var queryObj = {};
  var count = [];
  const dateS = new Date();

  startYear = dateS.getFullYear();
  startMonth = dateS.getMonth();
  startDay = dateS.getDate();

  for (var i = 0; i < 7; i++) {
    queryObj["createdAt"] = {
      $gte: new Date(startYear, startMonth, startDay, 0, 0, 0, 0),
      $lte: new Date(startYear, startMonth, startDay, 23, 59, 59, 999),
    };
    queryObj["action"] = "pret";
    startDay--;
    count.push(await Historique.count(queryObj));
  }
  res.status(200).send(count.reverse());
});

router.get("/count/over-year", async (req, res) => {
  const queryObj = {};
  var count = [];

  const dateS = new Date();

  startYear = dateS.getFullYear();
  startMonth = dateS.getMonth();

  for (var i = 0; i < 12; i++) {
    queryObj["createdAt"] = {
      $gte: new Date(startYear, startMonth, 1, 0, 0, 0, 0),
      $lte: new Date(startYear, startMonth + 1, 0, 23, 59, 59, 999),
    };
    queryObj["action"] = "pret";
    startMonth--;
    count.push(await Historique.count(queryObj));
  }
  res.status(200).send(count.reverse());
});

router.get("/count/delivery-rate", async (req, res) => {
  const number = req.query.number || 5;
  const villes = await Ville.find().then((data) => {
    return data.map((item) => item.nom);
  });

  var stats = [];
  data = [
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
        from: "delegations",
        localField: "clients.delegationId",
        foreignField: "_id",
        as: "delegationsClient",
      },
    },
    {
      $unwind: { path: "$delegationsClient", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "villes",
        localField: "delegationsClient.villeId",
        foreignField: "_id",
        as: "villesClient",
      },
    },
    { $unwind: { path: "$villesClient", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        etat: 1,
        villec: "$villesClient.nom",
      },
    },
    {
      $match: {
        etat: {
          $in: [
            "retourné à l'expediteur",
            "livré - payé - espèce",
            "livré - payé - chèque",
          ],
        },
      },
    },
  ];

  const totalDeliveries = await Package.count({
    etat: {
      $in: [
        "retourné à l'expediteur",
        "livré - payé - espèce",
        "livré - payé - chèque",
      ],
    },
  });
  for (let ville of villes) {
    var sample = {};

    data.push({
      $match: {
        villec: ville,
      },
    });
    const deliveries = await Package.aggregate(data).then(
      (data) => data.length
    );
    if (deliveries !== 0)
      sample.rate = ((deliveries / totalDeliveries) * 100).toFixed(2);
    else sample.rate = 0;
    sample.ville = ville;
    stats.push(sample);
    data.pop({
      $match: {
        villec: ville,
      },
    });
  }

  stats = stats.sort((a, b) => b.rate - a.rate).slice(0, number);
  return res.send(stats);
});

router.get("/count/top-providers", async (req, res) => {
  const number = req.query.number || 5;
  var providers = new Array();
  await Fournisseur.find().then((data) => {
    providers = data.map((item) => {
      return { nom: item.nom, id: item._id };
    });
  });

  var stats = [];

  const totalDemands = await Package.count({
    etat: {
      $nin: ["nouveau"],
    },
  });

  for (let provider of providers) {
    var sample = {};

    const demands = await Package.count({
      etat: {
        $nin: ["nouveau"],
      },
      fournisseurId: provider.id,
    });
    sample.demands = demands;
    if (demands !== 0)
      sample.rate = ((demands / totalDemands) * 100).toFixed(2);
    else sample.count = 0;
    sample.provider = provider.nom;
    stats.push(sample);
  }

  stats = stats.sort((a, b) => b.rate - a.rate).slice(0, number);
  return res.send(stats);
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

module.exports = router;
