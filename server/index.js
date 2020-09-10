"use strict";
exports.__esModule = true;
var express = require('express');
var bodyParser = require('body-parser');
var node_fetch_1 = require("node-fetch");
var app = express();
var PORT = process.env.PORT || 3000;
var baseURL = "https://jisho.org/api/v1/search";
app.use(bodyParser.json());
app.use(logger);
app.get("/", function (req, res) {
    res.send("ようこそ！");
});
app.post("/search", function (req, res) {
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
    return potentialResult.japanese.find(function (el) { var _a, _b; return ((_a = el.reading) === null || _a === void 0 ? void 0 : _a.localeCompare(query)) === 0 || ((_b = el.word) === null || _b === void 0 ? void 0 : _b.localeCompare(query)) === 0; });
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
