"use strict";
exports.__esModule = true;
exports.logger = exports.findAndSendMatch = void 0;
function findAndSendMatch(query, receivedResp, res) {
    for (var i in receivedResp.data) {
        var searchResult = findWord(query, receivedResp.data[i]);
        console.log("searchResult: ", receivedResp.data[i]);
        if (searchResult !== undefined) {
            var element = receivedResp.data[i];
            res.send(createFoundResponse(element, searchResult));
            return true;
        }
    }
    return false;
}
exports.findAndSendMatch = findAndSendMatch;
function findWord(query, potentialResult) {
    return potentialResult.japanese.find(function (el) { return matchReading(query, el.reading) || matchWord(query, el.word); });
}
function createFoundResponse(element, searchResult) {
    var index = element.japanese.findIndex(function (el) { return el.reading.localeCompare(searchResult.reading) === 0; });
    var japanese = element.japanese[index];
    var english = element.senses[index].english_definitions;
    var entry = {
        slug: element.slug,
        japanese: japanese,
        english: english
    };
    return { found: true, entry: entry };
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
exports.logger = logger;
