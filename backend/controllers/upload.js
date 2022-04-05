const express = require("express");
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

var router = express.Router();

router.post("/", (req, res) => {
  const file = req["files"].thumbnail;
  // console.log(file);
  var sampleFile;
  var exceltojson;
  sampleFile = file;

  sampleFile.mv("uploads/" + file.name, function (err) {
    if (err) {
      console.log("eror saving");
    } else {
      console.log("saved");
      if (
        file.name.split(".")[
          file.name.split(".").length - 1
        ] === "xlsx"
      ) {
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
          function (err, result) {
            if (err) {
              return res.json({ error_code: 1, err_desc: err, data: null });
            }
            console.log(result);
            res.json({ error_code: 0, err_desc: null, data: result });
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
        res.json({ error_code: 1, err_desc: "Corupted excel file" });
      }
    }
  });
});

module.exports = router;
