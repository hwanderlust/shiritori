import * as wanakana from "wanakana";
import { DebugMode, debug, } from "../../helpers";

const kanaGroups = [
  "あ", "い", "う", "え", "お",
  "か", "き", "く", "け", "こ",
  "さ", "し", "す", "せ", "そ",
  "た", "ち", "つ", "て", "と",
  "な", "に", "ぬ", "ね", "の",
  "は", "ひ", "ふ", "へ", "ほ",
  "ま", "み", "む", "め", "も",
  "ら", "り", "る", "れ", "ろ",
  "や", "ゆ", "よ", "わ",
];

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

interface Response {
  found: boolean;
  entry: Entry;
}
interface Entry {
  slug: string;
  japanese: Japanese,
  english: Array<string>;
}
interface Japanese {
  reading: string;
  word: string;
}

interface Vocabulary {
  ID: string;
  Kana: string;
  Kanji: string;
  Definition: string;
}

function calcRandomNum(arr: Array<any>, mode?: DebugMode): number {
  const result = Math.floor(arr.length * Math.random());
  debug(mode, [`random num`, result])
  return result;
}


/**
 * Checks for Katakana and converts to Hiragana, otherwise returns input
 * "ー" registers as katakana
 * @param char a single (Japanese) character (hiragana / katakana)
 */
function ensureHiragana(char: string, mode?: DebugMode): string {
  debug(mode, [`ensureHiragana`, char]);

  if (wanakana.isKatakana(char) && char.localeCompare("ー") !== 0) {
    debug(mode, [`isKatakana`, katakanaToHiragana[char]])
    return katakanaToHiragana[char];
  }
  return char;
}


/**
 * Returns the full character if input is the small character, otherwise the input's original last character
 */
function convertSmallChars(word: string, mode: DebugMode = "normal"): string {
  debug(mode, [`convertSmallChars`, word]);

  const lastChar = word.substr(-1);
  debug(mode, [`convertSmallChars lastChar`, lastChar]);

  if (lastChar.localeCompare("ょ") === 0) {
    return "よ";
  }
  if (lastChar.localeCompare("ゃ") === 0) {
    return "や";
  }
  if (lastChar.localeCompare("ゅ") === 0) {
    return "ゆ";
  }
  if (lastChar.localeCompare("っ") === 0) {
    return "つ";
  }
  if (lastChar.localeCompare("ぁ") === 0) {
    return "あ";
  }
  if (lastChar.localeCompare("ぃ") === 0) {
    return "い";
  }
  if (lastChar.localeCompare("ぅ") === 0) {
    return "う";
  }
  if (lastChar.localeCompare("ぇ") === 0) {
    return "え";
  }
  if (lastChar.localeCompare("ぉ") === 0) {
    return "お";
  }

  debug(mode, [`convertSmallChars end`, lastChar]);
  return lastChar;
}

function compileVocabulary(res: JSON, vocab: null | JSON): JSON {
  if (!vocab) {
    vocab = res;
    return vocab;
  }

  Object.keys(res).forEach(key => {
    if (Object.keys(vocab).includes(key)) {
      vocab[key] = vocab[key].concat(res[key]);
    } else {
      vocab[key] = res[key];
    }
  });
  return vocab;
}

function formatToVocab(entry: Entry): Vocabulary {
  return {
    ID: entry.slug,
    Kana: entry.japanese.reading, // backend enforces the availability of this
    Kanji: entry.japanese?.word,
    Definition: formatDefinition(entry),
  }
}
function formatDefinition(entry: Entry): string {
  if (!entry.english.length) {
    return "";
  }
  if (entry.english.length === 1) {
    return entry.english[0];
  }
  return entry.english.reduce((acc, def) => !!def ? acc.concat(` / ${def}`) : acc, "");
}

function hasPunctuation(word: string): boolean {
  return word.includes("！") ||
    word.includes("？") ||
    word.includes("。") ||
    word.includes("…") ||
    word.includes("．") ||
    word.includes("、") ||
    word.includes("・") ||
    word.includes("＝") ||
    word.includes("‘");
}

function hasSymbol(word: string): boolean {
  return word.includes("～") ||
    word.includes("「") ||
    word.includes("」") ||
    word.includes("＠") ||
    word.includes("＃") ||
    word.includes("％") ||
    word.includes("＊") ||
    word.includes("（") ||
    word.includes("）") ||
    word.includes("￥");
}

export {
  Entry,
  Response,
  Vocabulary,
  kanaGroups,
  calcRandomNum,
  compileVocabulary,
  convertSmallChars,
  ensureHiragana,
  formatToVocab,
  hasSymbol,
  hasPunctuation,
}