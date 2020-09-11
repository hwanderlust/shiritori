const csv = require('csvtojson');
const fs = require("fs");

csv()
  .fromFile("xxx.csv")
  .then(output => {
    fs.writeFile("xxx.json", JSON.stringify(output), err => {
      if (err) {
        throw err;
      }
      console.log("JSON is saved.");
    })
  })