const csv = require('csvtojson');
const fs = require("fs");

csv()
  .fromFile("xxx.csv")
  .then(convertJsonArrayToObject)
  .then(output => {
    fs.writeFile("xxx.json", JSON.stringify(output), err => {
      if (err) {
        throw err;
      }
      console.log("JSON is saved.");
    })
  })

function convertJsonArrayToObject(arr) {
  const convertedJsonObject = {};

  arr.forEach(element => {
    const elCopy = { ...element };
    delete elCopy.Category;

    if (Object.keys(convertedJsonObject).includes(element.Category)) {
      convertedJsonObject[element.Category].push(elCopy);
      return;
    }

    convertedJsonObject[element.Category] = [elCopy];
  });

  return convertedJsonObject;
}