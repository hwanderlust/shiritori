const express = require('express');
const bodyParser = require('body-parser');
import fetch from "node-fetch"

const app = express();
const PORT = process.env.PORT || 3000;
const baseURL = "https://jisho.org/api/v1/search";

app.use(bodyParser.json());
app.use(logger);

app.get("/", (_, res) => {
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
  japanese: Array<Entry>;
}
interface Entry {
  reading: string;
  word: string;
}

function findWord(query: string, potentialResult: JoshiResult): Entry | undefined {
  return potentialResult.japanese.find(
    el => matchReading(query, el.reading) || matchWord(query, el.word)
  );
}

function matchReading(query: string, reading: string | undefined): boolean {
  return reading?.localeCompare(query) === 0;
}
function matchWord(query: string, word: string | undefined): boolean {
  return word?.localeCompare(query) === 0;
}

function logger(req, _, next) {
  if (req.method !== "POST" && req.url !== "/search") {
    console.log(req.method, req.url, req.body);
    next();
    return;
  }

  console.log(req.method, req.url, decodeURI(req.body.query));
  next();
}