const express = require("express");
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
const { Client } = require("../models/client");
const { Package } = require("../models/package");
const { Ville } = require("../models/ville");
const { Delegation } = require("../models/delegation");
const { Fournisseur } = require("../models/fournisseur");

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
            var errors = 0;
            var resultHandler = {};
            // saving excel json data in database
            for (let el of result) {
              var index = result.indexOf(el) + 1;
              //if one line is empty all the next lines willbe ignored
              if (!el.tél) break;
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

              console.log(el.délegation);
              const delegation = await Delegation.find({
                nom: el.délegation.toLowerCase(),
              }).then(
                (doc) => {
                  if (doc.length !== 0) {
                    return doc[0]._id;
                  } else
                    resultHandler["ligne " + index + " (delegation)"] =
                      "Délegation non existante";
                },
                (err) => {
                  resultHandler["ligne " + index] = err.message;
                }
              );
              client.delegationId = delegation;

              // client.ville = await Ville.find({
              //   delegationId: delegation.villeId,
              // }).then((doc) => {
              //   return doc[0]._id;
              // });

              console.log(typeof el.tél);
              client.tel = el.tél;
              client.nom = el["nom & prénom"];

              client.adresse = el.adresse;
              client.fournisseurId = fournisseurId;

              package.CAB = check;
              package.etat = el.etat;
              package.c_remboursement = el.cod;
              package.libelle = el.libelle;
              package.fournisseurId = fournisseurId;

              console.log(typeof client.tel);

              if (el.tél.toString().length === 8 && !isNaN(el.tél)) {
                //*if client exists by phone number only the package data will be created, otherwise we'll get a new client and package
                const clientExists = await Client.findOne({
                  tel: client.tel,
                }).then((res) => {
                  return res;
                });
                if (!clientExists) {
                  const newClient = await client.save().then((res) => {
                    return res;
                  });
                  package.clientId = newClient._id;
                } else {
                  package.clientId = clientExists._id;
                }

                try {
                  await package.save().then(
                    async (doc2) => {
                      await Fournisseur.findByIdAndUpdate(
                        fournisseurId,
                        { $push: { clients: package.clientId } },
                        { new: true, useFindAndModify: false }
                      ).then(async () => {
                        await Fournisseur.findByIdAndUpdate(
                          fournisseurId,
                          { $push: { packages: doc2._id } },
                          { new: true, useFindAndModify: false }
                        ).then(
                          async () => {
                            await Client.findByIdAndUpdate(
                              package.clientId,
                              { $push: { packages: doc2._id } },
                              { new: true, useFindAndModify: false }
                            ).then(
                              () => {
                                resultHandler["ligne" + index] = "success";
                                return console.log("succès");
                              },
                              (err4) => {
                                resultHandler["ligne" + index] = err4.message;
                                errors++;
                                return console.log(
                                  "Erreur lors du mis à jour du client: " + err4
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
                } catch (err) {
                  if (err.message.indexOf("tel_1") !== -1) {
                    resultHandler["ligne" + index] = "téléphone existe déjà";
                  } else {
                    resultHandler["ligne" + index] = err.message;
                  }
                  console.log(resultHandler);
                  errors++;

                  return console.log(
                    "Erreur lors de l'enregistrement du client: " + err
                  );

                  // return res.status(400).send(err.message);
                }
              } else {
                console.log("slmn't");
                resultHandler["ligne" + index] =
                  "numéro de téléphone incorrect";
                errors++;
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
              console.log("err");
              return res.status(400).send(resultHandler);
            } else {
              console.log("errn't");
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
