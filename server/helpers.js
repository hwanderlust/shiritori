"use strict";
exports.__esModule = true;
exports.selectWord = exports.logger = exports.formatToEntry = exports.findAndSendMatch = exports.filterByChar = void 0;
var katakanaToHiragana = {
    "ア": "あ", "イ": "い", "ウ": "う", "エ": "え", "オ": "お",
    "カ": "か", "キ": "き", "ク": "く", "ケ": "け", "コ": "こ",
    "ガ": "が", "ギ": "ぎ", "グ": "ぐ", "ゲ": "げ", "ゴ": "ご",
    "サ": "さ", "シ": "し", "ス": "す", "セ": "せ", "ソ": "そ",
    "ザ": "ざ", "ジ": "じ", "ズ": "ず", "ゼ": "ぜ", "ゾ": "ぞ",
    "タ": "た", "チ": "ち", "ツ": "つ", "テ": "て", "ト": "と",
    "ダ": "だ", "ヂ": "ぢ", "デ": "で", "ド": "ど",
    "ナ": "な", "ニ": "に", "ヌ": "ぬ", "ネ": "ね", "ノ": "の",
    "ハ": "は", "ヒ": "ひ", "フ": "ふ", "ヘ": "へ", "ホ": "ほ",
    "バ": "ば", "ビ": "び", "ブ": "ぶ", "ベ": "べ", "ボ": "ぼ",
    "パ": "ぱ", "ピ": "ぴ", "プ": "ぷ", "ペ": "ぺ", "ポ": "ぽ",
    "マ": "ま", "ミ": "み", "ム": "む", "メ": "め", "モ": "も",
    "ラ": "ら", "リ": "り", "ル": "る", "レ": "れ", "ロ": "ろ",
    "ヤ": "や", "ユ": "ゆ", "ヨ": "よ", "ワ": "わ", "ヲ": "を",
    "ッ": "っ", "ャ": "ゃ", "ュ": "ゅ", "ョ": "ょ", "ン": "ん",
    "ァ": "ぁ", "ィ": "ぃ", "ゥ": "ぅ", "ェ": "ぇ", "ォ": "ぉ"
};
function findAndSendMatch(query, receivedResp, res) {
    for (var i in receivedResp.data) {
        var searchResult = findWord(query, receivedResp.data[i]);
        console.log("searchResult: ", searchResult);
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
    return potentialResult.japanese.find(function (el) { return matchReading(query, el === null || el === void 0 ? void 0 : el.reading) || matchWord(query, el === null || el === void 0 ? void 0 : el.word); });
}
function createFoundResponse(element, searchResult) {
    var index = element.japanese.findIndex(function (el) { var _a, _b; return ((_a = el === null || el === void 0 ? void 0 : el.reading) === null || _a === void 0 ? void 0 : _a.localeCompare(searchResult === null || searchResult === void 0 ? void 0 : searchResult.reading)) === 0 || ((_b = el === null || el === void 0 ? void 0 : el.word) === null || _b === void 0 ? void 0 : _b.localeCompare(searchResult === null || searchResult === void 0 ? void 0 : searchResult.word)) === 0; });
    var japanese = element.japanese[index];
    var english = element.senses[0].english_definitions;
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
function selectWord(results) {
    var _a, _b;
    var n = calcRandomNum(results);
    for (var index = n; index < results.length; index++) {
        var word = results[index];
        if (word.japanese.length
            && ((_a = word.japanese[0]) === null || _a === void 0 ? void 0 : _a.reading)
            && isValid(word.japanese[0].reading.substr(-1))) {
            return word;
        }
    }
    for (var index = 0; index < n; index++) {
        var word = results[index];
        if (word.japanese.length
            && ((_b = word.japanese[0]) === null || _b === void 0 ? void 0 : _b.reading)
            && isValid(word.japanese[0].reading.substr(-1))) {
            return word;
        }
    }
    return null;
}
exports.selectWord = selectWord;
function calcRandomNum(arr) {
    var result = Math.floor(arr.length * Math.random());
    return result;
}
function isValid(char) {
    var firstCheck = char.localeCompare("ー") !== 0;
    var secondCheck = char.localeCompare("～") !== 0;
    var thirdCheck = char.localeCompare("ん") !== 0;
    var fourthCheck = char.localeCompare("ン") !== 0;
    return firstCheck && secondCheck && thirdCheck && fourthCheck;
}
function formatToEntry(element) {
    var japanese = element.japanese[0];
    var english = element.senses[0].english_definitions;
    var entry = {
        slug: element.slug,
        japanese: japanese,
        english: english
    };
    return entry;
}
exports.formatToEntry = formatToEntry;
function filterByChar(char, results) {
    return results.filter(function (el) {
        var _a, _b;
        var elFirstChar = (_b = (_a = el.japanese[0]) === null || _a === void 0 ? void 0 : _a.reading) === null || _b === void 0 ? void 0 : _b.substr(0, 1);
        if (!elFirstChar)
            return false;
        var firstCharKana = katakanaToHiragana[elFirstChar];
        var charKana = katakanaToHiragana[char];
        if (!firstCharKana) {
            return elFirstChar.localeCompare(charKana || char) === 0;
        }
        return firstCharKana.localeCompare(charKana || char) === 0;
    });
}
exports.filterByChar = filterByChar;
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
