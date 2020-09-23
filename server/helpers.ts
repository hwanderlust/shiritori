import { Next, Request, Response } from 'express';

interface JoshiResponse {
  data: Array<JoshiElement>;
}
interface JoshiElement {
  slug: string;
  japanese: Array<JapaneseEntry>;
  senses: Array<Sense>;
}
interface JapaneseEntry {
  reading?: string;
  word?: string;
}
interface Sense {
  english_definitions: Array<string>;
  sentences?: Array<string>;
}

interface ApiResponse {
  found: boolean;
  entry: ApiEntry;
}
interface ApiEntry {
  slug: string;
  japanese: JapaneseEntry;
  english: Array<string>;
}

const katakanaToHiragana = {
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
  "ァ": "ぁ", "ィ": "ぃ", "ゥ": "ぅ", "ェ": "ぇ", "ォ": "ぉ",
}

function findAndSendMatch(query: string, receivedResp: JoshiResponse, res: Response): boolean {
  for (const i in receivedResp.data) {
    const searchResult = findWord(query, receivedResp.data[i]);
    console.log(`searchResult: `, searchResult);

    if (searchResult !== undefined) {
      const element = receivedResp.data[i];
      res.send(createFoundResponse(element, searchResult));
      return true;
    }
  }

  return false;
}

function findWord(query: string, potentialResult: JoshiElement): JapaneseEntry | undefined {
  return potentialResult.japanese.find(
    el => matchReading(query, el?.reading) || matchWord(query, el?.word)
  );
}

function createFoundResponse(element: JoshiElement, searchResult: JapaneseEntry): ApiResponse {
  const index = element.japanese.findIndex(
    el => el?.reading?.localeCompare(searchResult?.reading) === 0 || el?.word?.localeCompare(searchResult?.word) === 0
  );
  const japanese = element.japanese[index];
  const english = element.senses[0].english_definitions;
  const entry = {
    slug: element.slug,
    japanese,
    english,
  }
  return { found: true, entry };
}

function matchReading(query: string, reading: string | undefined): boolean {
  return reading?.localeCompare(query) === 0;
}
function matchWord(query: string, word: string | undefined): boolean {
  return word?.localeCompare(query) === 0;
}

function selectWord(results: Array<JoshiElement>): JoshiElement | null {
  const n = calcRandomNum(results);
  for (let index = n; index < results.length; index++) {
    const word = results[index];
    if (
      word.japanese.length
      && word.japanese[0]?.reading
      && isValid(word.japanese[0].reading.substr(-1))
    ) {
      return word;
    }
  }
  for (let index = 0; index < n; index++) {
    const word = results[index];
    if (
      word.japanese.length
      && word.japanese[0]?.reading
      && isValid(word.japanese[0].reading.substr(-1))
    ) {
      return word;
    }
  }
  return null;
}

function calcRandomNum(arr: Array<any>): number {
  const result = Math.floor(arr.length * Math.random());
  return result;
}

function isValid(char: string) {
  const firstCheck = char.localeCompare("ー") !== 0;
  const secondCheck = char.localeCompare("～") !== 0;
  const thirdCheck = char.localeCompare("ん") !== 0;
  const fourthCheck = char.localeCompare("ン") !== 0;
  return firstCheck && secondCheck && thirdCheck && fourthCheck;
}

function formatToEntry(element: JoshiElement): ApiEntry {
  const japanese = element.japanese[0];
  const english = element.senses[0].english_definitions;
  const entry = {
    slug: element.slug,
    japanese,
    english,
  }
  return entry;
}

function filterByChar(char: string, results: Array<JoshiElement>): Array<JoshiElement> {
  return results.filter(el => {
    const elFirstChar = el.japanese[0]?.reading?.substr(0, 1);
    if (!elFirstChar) return false;

    const firstCharKana = katakanaToHiragana[elFirstChar];
    const charKana = katakanaToHiragana[char];

    if (!firstCharKana) {
      return elFirstChar.localeCompare(charKana || char) === 0;
    }
    return firstCharKana.localeCompare(charKana || char) === 0;
  });
}

function logger(req: Request, _, next: Next) {
  if (req.method !== "POST" && req.url !== "/search") {
    console.log(req.method, req.url, req.body);
    next();
    return;
  }

  console.log(req.method, req.url, decodeURI(req.body.query));
  next();
}

export {
  filterByChar,
  findAndSendMatch,
  formatToEntry,
  logger,
  selectWord,
}