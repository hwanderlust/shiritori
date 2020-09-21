"use strict";
exports.__esModule = true;
var node_fetch_1 = require("node-fetch");
var bodyParser = require('body-parser');
var express = require('express');
var fs = require("fs");
var helpers_1 = require("./helpers");
var app = express();
var PORT = process.env.PORT || 3000;
var baseURL = "https://jisho.org/api/v1/search";
app.use(bodyParser.json());
app.use(helpers_1.logger);
app.get("/api/", function (_, res) {
    res.send("ようこそ！");
});
app.get("/api/vocabulary/:level", function (req, res) {
    var _a;
    try {
        fs.readFile("./vocab-" + ((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.level) + ".json", 'utf8', function (err, data) {
            if (err) {
                console.log("error:", err);
                res.end();
                return;
            }
            console.log("read json without a hitch!");
            res.json(data);
        });
    }
    catch (error) {
        console.error("error:", error);
    }
});
app.get("/api/words-starting-with/:character", function (req, res) {
    var _a;
    var character = (_a = req.params) === null || _a === void 0 ? void 0 : _a.character;
    var decodedChar = decodeURI(character);
    console.log("character: " + decodedChar);
    node_fetch_1["default"](baseURL + "/words?keyword=" + encodeURI(decodedChar) + "*", {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    })
        .then(function (r) { return r.json(); })
        .then(function (r) {
        console.log(r);
        if (r.data.length === 0) {
            console.log("no data");
            res.send({ found: false, msg: "No data" });
            return;
        }
        var word = helpers_1.selectWord(r.data);
        if (!word) {
            console.log("no word");
            res.send({ found: false, response: r });
            return;
        }
        console.log("found word", word);
        res.send({ found: true, entry: helpers_1.formatToEntry(word) });
    });
});
app.post("/api/search", function (req, res) {
    var query = req.body.query || "";
    console.log("query: " + query);
    var encodedQuery = encodeURI(query);
    node_fetch_1["default"](baseURL + "/words?keyword=" + encodedQuery, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    })
        .then(function (r) { return r.json(); })
        .then(function (r) {
        if (r.data.length === 0) {
            res.send({ found: false, msg: "No data" });
            return;
        }
        if (!helpers_1.findAndSendMatch(query, r, res)) {
            res.send({ found: false, response: r });
        }
        res.end();
    });
});
app.listen(PORT, function () {
    console.log("We are live on port " + PORT + "!");
});
