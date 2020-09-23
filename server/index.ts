import { Request, Response } from 'express';
import fetch from "node-fetch";

const bodyParser = require('body-parser');
const express = require('express');
const fs = require("fs");

import {
  filterByChar,
  findAndSendMatch,
  formatToEntry,
  logger,
  selectWord,
} from "./helpers";

const app = express();
const PORT = process.env.PORT || 3000;
const baseURL = "https://jisho.org/api/v1/search";

app.use(bodyParser.json());
app.use(logger);

app.get("/api/", (_, res: Response) => {
  res.send("ようこそ！")
});

app.get("/api/vocabulary/:level", (req: Request, res: Response) => {
  try {
    fs.readFile(`./vocab-${req?.params?.level}.json`, 'utf8', (err, data) => {

      if (err) {
        console.log(`error:`, err);
        res.end();
        return;
      }

      console.log(`read json without a hitch!`);
      res.json(data);
    });

  } catch (error) {
    console.error(`error:`, error);
  }
});

app.get("/api/words-starting-with/:character", (req: Request, res: Response) => {
  const character = req.params?.character;
  const decodedChar = decodeURI(character);
  console.log(`character: ${decodedChar}`);

  fetch(`${baseURL}/words?keyword=${encodeURI(decodedChar)}*`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    }
  })
    .then(r => r.json())
    .then(r => {
      if (r.data.length === 0) {
        console.log(`no data`);
        res.send({ found: false, msg: "No data" });
        return;
      }

      const word = selectWord(
        filterByChar(decodedChar, r.data)
      );
      if (!word) {
        console.log(`no word`);
        res.send({ found: false, response: r });
        return;
      }

      console.log(`found word`, word);
      res.send({ found: true, entry: formatToEntry(word) });
    })
    .catch(error => {
      console.error(error);
      res.end();
    });
});

app.post("/api/search", (req: Request, res: Response) => {
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

      if (!findAndSendMatch(query, r, res)) {
        res.send({ found: false, response: r });
      }

      res.end();
    })
    .catch(error => {
      console.error(error);
    });
});

app.listen(PORT, () => {
  console.log(`We are live on port ${PORT}!`);
});
