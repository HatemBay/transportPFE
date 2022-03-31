var excelToJson = require('convert-excel-to-json');
var fs = require('fs');
var {Package} = require('../models/package');

const importExcelData2MongoDB = filePath => {
  // -> Read Excel File to Json Data
  const excelData = excelToJson({
    sourceFile: filePath,
    sheets: [
      {
        // Excel Sheet Name
        name: "Packages",
        // Header Row -> be skipped and will not be present at our result object.
        header: {
          rows: 1,
        },
        // Mapping columns to keys
        columnToKey: {
          A: "CAB",
          B: "service",
          C: "poids",
          D: "pieces",
          E: "etat",
        },
      },
    ],
  });
  // -> Log Excel Data to Console
  console.log(excelData);

  // Insert Json-Object to MongoDB
  Package.insertMany(excelData, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
  fs.unlinkSync(filePath);
}

module.exports = importExcelData2MongoDB;
