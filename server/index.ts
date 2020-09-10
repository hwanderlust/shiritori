const express = require('express');
const bodyParser = require('body-parser');
import fetch from "node-fetch"

const app = express();
const PORT = process.env.PORT || 3000;
const baseURL = "https://jisho.org/api/v1/search";

app.use(bodyParser.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("ようこそ！")
});

app.post("/search", (req, res) => {
  const query = req.body.query || "";
  console.log(`query: ${query}`);
  const encodedQuery = encodeURI(query);

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
        const searchResult = findWord(query, potentialResult);
        console.log(`searchResult: ${searchResult}`);
        if (searchResult !== undefined) {
          res.send({ found: true, entry: searchResult });
          return;
        }
      }

      res.send({ found: false, response: r });
    });
});

app.listen(PORT, () => {
  console.log(`We are live on port ${PORT}!`);
});

// <-- HELPERS -->

interface JoshiResult {
  japanese: Array<{
    reading: string;
    word: string;
  }>
}

function findWord(query: string, potentialResult: JoshiResult) {
  // console.log(`potentialResult.japanese:`, potentialResult.japanese[0].reading);
  // console.log(`query:`, query);
  // console.log(query.localeCompare(potentialResult.japanese[0].reading));
  return potentialResult.japanese.find(el => el.reading.localeCompare(query) === 0 || el.word?.localeCompare(query) === 0);
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