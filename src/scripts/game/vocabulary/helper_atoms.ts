import * as wanakana from "wanakana";

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
  "ヤ": "や", "ユ": "ゆ", "ヨ": "よ", "ワ": "わ", "ヲ": "を", "ン": "ん",
  "ッ": "っ", "ャ": "ゃ", "ュ": "ゅ", "ョ": "ょ",
  "ァ": "ぁ", "ィ": "ぃ", "ゥ": "ぅ", "ェ": "ぇ", "ォ": "ぉ",
}

interface Response {
  found: boolean;
  entry: {
    reading: string;
    word: string;
  }
}

interface Vocabulary {
  Kana: string;
  Kanji: string;
  Definition: string;
}

function calcRandomNum(arr: Array<any>): number {
  const result = Math.floor(arr.length * Math.random());
  // console.log(`random num`, result);
  return result;
}


/**
 * Checks for Katakana and converts to Hiragana, otherwise returns input
 * "ー" registers as katakana
 * @param char a single (Japanese) character (hiragana / katakana)
 */
function ensureHiragana(char: string): string {
  // console.log(`ensureHiragana`, char);
  if (wanakana.isKatakana(char) && char.localeCompare("ー") !== 0) {
    // console.log(`isKatakana`, katakanaToHiragana[char]);
    return katakanaToHiragana[char];
  }
  return char;
}


/**
 * Returns the full character if input is the small character, otherwise the input's original last character
 */
function convertSmallChars(word: string): string {
  // console.log(`convertSmallChars`, word);

  const lastChar = word.substr(-1);
  // console.log(`convertSmallChars lastChar`, lastChar);

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

  // console.log(`convertSmallChars end`, lastChar);
  return lastChar;
}

export {
  Response,
  Vocabulary,
  kanaGroups,
  calcRandomNum,
  convertSmallChars,
  ensureHiragana,
}