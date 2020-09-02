const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const baseURL = "https://jisho.org/api/v1/search";

app.use(bodyParser.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("ようこそ！")
});

app.post("/search", (req, res) => {
  const encodedQuery = req.body.query || "";

  fetch(`${baseURL}/words?keyword=${encodedQuery}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    }
  })
    .then(r => r.json())
    .then(r => {

      if (r.data.length === 0) {
        res.send({ found: false, msg: "No data" });
        return;
      }

      for (const potentialResult of r.data) {
        if (isValidWord(decodeURI(encodedQuery), potentialResult.slug)) {
          res.send({ found: true });
          return;
        }
      }

      res.send({ found: false });
    });
});

app.listen(PORT, () => {
  console.log(`We are live on port ${PORT}!`);
});

// <-- HELPERS -->

function isValidWord(query, potentialResult) {
  return potentialResult.localeCompare(query) === 0;
}

function logger(req, res, next) {
  if (req.method !== "POST" && req.url !== "/search") {
    console.log(req.method, req.url, req.body);
    next();
    return;
  }

  console.log(req.method, req.url, decodeURI(req.body.query));
  next();
}