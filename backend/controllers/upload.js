const express = require("express");
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var { Client } = require("../models/client");
var { Package } = require("../models/package");
var { Fournisseur } = require("../models/fournisseur");

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
            var resultHandler = {};
            // saving excel json data in database
            for (let el of result) {
              var index = result.indexOf(el) + 1;
              if (el.tél != "") {
                var client = new Client();
                var package = new Package();

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

                client.tel = el.tél;
                client.nom = el["nom & prénom"];
                client.ville = el.ville;
                client.adresse = el.adresse;
                client.delegation = el.délegation;
                client.fournisseurId = fournisseurId;

                package.CAB = check;
                package.etat = el.etat;
                package.c_remboursement = el.cod;
                package.libelle = el.libelle;
                package.fournisseurId = fournisseurId;

                console.log(client.tel);

                // Package.findOne({ CAB: package.CAB }, (req, res) => {
                //   if (res.length == 0)
                //     return "code à barre existant";
                // });

                // to change once client duplication issue is solved
                // Client.findOne({ tel: client.tel }, (req, res) => {
                //   if (res != null) return "code à barre existant";
                // });

                if (client.tel.toString().length == 8 && !(isNaN(client.tel))) {
                  var errors = 0;
                  await client.save().then(
                    async (doc) => {
                      package.clientId = doc._id;
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
                                  () => {
                                    resultHandler["ligne" + index] = "success";
                                    return console.log("succès");
                                  },
                                  (err4) => {
                                    resultHandler["ligne" + index] =
                                      err4.message;
                                    errors++;
                                    return console.log(
                                      "Erreur lors du mis à jour du client: " +
                                        err4
                                    );
                                    // return res.status(400).send(err4.message);
                                  }
                                );
                              },
                              (err3) => {
                                resultHandler["ligne" + index] = err3.message;
                                errors++;
                                return console.log(
                                  "Erreur lors du mis à jour du fournisseur: " +
                                    err3
                                );
                                // return res.status(400).send(err3.message);
                              }
                            );
                          });
                        },
                        (err2) => {
                          resultHandler["ligne" + index] = err2.message;
                          errors++;
                          Client.findByIdAndDelete(doc._id).exec();
                          return console.log(
                            "Erreur lors de l'enregistrement du colis: " + err2
                          );
                          // return res.status(400).send(err2.message);
                        }
                      );
                    },
                    (err) => {
                      resultHandler["ligne" + index] = err.message;
                      console.log(resultHandler);
                      errors++;
                      return console.log(
                        "Erreur lors de l'enregistrement du client: " + err
                      );
                      // return res.status(400).send(err.message);
                    }
                  );
                } else {
                  resultHandler["ligne" + index] = "numéro de téléphone incorrect";
                  errors++;
                }
              } else {
                break;
              }
            }

            var fs = require("fs");
            try {
              fs.unlinkSync("uploads/" + file.name);
            } catch (e) {
              //error deleting the file
              console.log("err");
            }
            // console.log(resultHandler);
            if (errors > 0) {
              return res.status(400).send(resultHandler);
            } else {
              return res.status(200).send(resultHandler);
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

router.post("/image/upload", (req, res) => {
  const file = req["files"].CG;
  const file2 = JSON.parse(req.body.form);
  console.log(file);
  console.log(file2);

  var sampleFile;
  var exceltojson;
  sampleFile = file;

  // sampleFile.mv("uploads/" + file.name, function (err) {
  //   if (err) {
  //     console.log("eror saving");
  //   } else {
  //     console.log("saved");
  //     console.log(file.name.split(".")[file.name.split(".").length - 1]);
  //   }
  // });
});

module.exports = router;
