const mongoose = require("mongoose");

// connect to cloud mongodb
// const dbURI = 'mongodb+srv://userx:hatem98297674@transport.8er1t.mongodb.net/transport?retryWrites=true&w=majority';

mongoose.connect(process.env.DB, (err) => {
  if (!err) console.log("MongoDB connection succeeded...");
  else
    console.log(
      "Error in DB connection : " + JSON.stringify(err, undefined, 2)
    );
});

module.exports = mongoose;
