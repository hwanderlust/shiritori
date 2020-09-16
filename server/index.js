"use strict";
exports.__esModule = true;
var bodyParser = require('body-parser');
var express = require('express');
var fs = require("fs");
var node_fetch_1 = require("node-fetch");
var app = express();
var PORT = process.env.PORT || 3000;
var baseURL = "https://jisho.org/api/v1/search";
app.use(bodyParser.json());
app.use(logger);
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
        for (var _i = 0, _a = r.data; _i < _a.length; _i++) {
            var potentialResult = _a[_i];
            var searchResult = findWord(query, potentialResult);
            console.log("searchResult: " + searchResult);
            if (searchResult !== undefined) {
                res.send({ found: true, entry: searchResult });
                return;
            }
        }
        res.send({ found: false, response: r });
    });
});
app.listen(PORT, function () {
    console.log("We are live on port " + PORT + "!");
});
function findWord(query, potentialResult) {
    return potentialResult.japanese.find(function (el) { return matchReading(query, el.reading) || matchWord(query, el.word); });
}
function matchReading(query, reading) {
    return (reading === null || reading === void 0 ? void 0 : reading.localeCompare(query)) === 0;
}
function matchWord(query, word) {
    return (word === null || word === void 0 ? void 0 : word.localeCompare(query)) === 0;
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
