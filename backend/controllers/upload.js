const express = require("express");
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var { Client } = require("../models/client");
var { Package } = require("../models/package");
var { Fournisseur } = require("../models/fournisseur");
var assert = require("assert");

var router = express.Router();

router.post("/:fid", (req, res) => {
  const fournisseurId = req.params.fid;
  const file = req["files"].excel;
  // console.log(file);
  var sampleFile;
  var exceltojson;
  sampleFile = file;

  sampleFile.mv("uploads/" + file.name, function (err) {
    if (err) {
      console.log("eror saving");
    } else {
      console.log("saved");
      if (file.name.split(".")[file.name.split(".").length - 1] === "xlsx") {
        exceltojson = xlsxtojson;
        console.log("xlxs");
      } else {
        exceltojson = xlstojson;
        console.log("xls");
      }
      try {
        exceltojson(
          {
            input: "uploads/" + file.name,
            output: null, //since we don't need output.json
            lowerCaseHeaders: true,
          },
          async function (err, result) {
            if (err) {
              return res.json({ error_code: 1, err_desc: err, data: null });
            }
            // console.log(result);
            // console.log(result[0]["nom & prénom"]);

            // res.json({ error_code: 0, err_desc: null, data: result });

            // saving excel json data in database
            for (el of result) {
              var client = new Client();
              var package = new Package();

              client.tel = el.tél;
              client.nom = el["nom & prénom"];
              client.ville = el.ville;
              client.adresse = el.adresse;
              client.delegation = el.délegation;
              client.fournisseurId = fournisseurId;

              package.CAB = el["code à barre"];
              package.etat = el.etat;
              package.c_remboursement = el.cod;
              package.libelle = el.libelle;
              package.fournisseurId = fournisseurId;

              // Package.findOne({ CAB: package.CAB }, (req, res) => {
              //   if (res.length == 0)
              //     return "code à barre existant";
              // });

              // to change once client duplication issue is solved
              // Client.findOne({ tel: client.tel }, (req, res) => {
              //   if (res != null) return "code à barre existant";
              // });

              if (package.CAB != "" && client.tel != "") {
                await client.save().then(
                  async (doc) => {
                    await package.save().then(
                      async (doc2) => {
                        await Fournisseur.findByIdAndUpdate(
                          fournisseurId,
                          { $push: { clients: doc._id } },
                          { new: true, useFindAndModify: false }
                        ).then(async () => {
                          await Fournisseur.findByIdAndUpdate(
                            fournisseurId,
                            { $push: { packages: doc2._id } },
                            { new: true, useFindAndModify: false }
                          ).then(
                            async () => {
                              await Client.findByIdAndUpdate(
                                doc._id,
                                { $push: { packages: doc2._id } },
                                { new: true, useFindAndModify: false }
                              ).then(
                                () => console.log("succès"),
                                (err4) => {
                                  console.log(
                                    "Erreur lors du mis à jour du client: " +
                                      err4
                                  );
                                }
                              );
                            },
                            (err3) =>
                              console.log(
                                "Erreur lors du mis à jour du fournisseur: " +
                                  err3
                              )
                          );
                        });
                      },
                      (err2) => {
                        Client.findByIdAndDelete(doc._id).exec();
                        console.log(
                          "Erreur lors de l'enregistrement du colis: " + err2
                        );
                      }
                    );
                  },
                  (err) => {
                    console.log(
                      "Erreur lors de l'enregistrement du client: " + err
                    );
                  }
                );
              }
            }

            var fs = require("fs");
            try {
              fs.unlinkSync("uploads/" + file.name);
            } catch (e) {
              //error deleting the file
            }
          }
        );
      } catch (e) {
        console.log("error");
        res.json({ error_code: 1, err_desc: "Corrupted excel file" });
      }
    }
  });
});

module.exports = router;
