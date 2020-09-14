import * as wanakana from "wanakana";

export default function Vocab() {
  let vocab;
  let currentWord: string;
  let nextFirst: string = null;
  let initialWord = true;

  return {
    init: function (): void {
      fetch("/api/vocabulary", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then(r => r.json())
        .then(r => JSON.parse(r))
        .then(r => { vocab = r });
    },

    searchUsersGuess: function (query) {
      return searchUsersGuess(currentWord, query)
        .then(guessWord => {
          nextFirst = guessWord;
          return Promise.resolve();
        })
        .catch(err => {
          nextFirst = null;
          return Promise.reject(err);
        });
    },

    start: function () {
      initialWord = true;
      return this.nextWord();
    },

    nextWord: function (): Vocab {
      console.log(`nextWord start`);

      if (!nextFirst) {
        nextFirst = getRandomChar();
      }

      console.log(`nextFirst`, nextFirst);
      nextFirst = ensureHiragana(nextFirst);

      if (nextFirst.localeCompare("る") === 0) {
        console.log(`no selection to choose from る`);
        nextFirst = getRandomChar();
        console.log(`next try: ${nextFirst}`);

        if (!initialWord) {
          alert(`There are no words starting with ${nextFirst} at this time. Another word will be supplied.`);
        }
      }

      let selection = vocab[nextFirst];
      console.log(`selection`, selection);

      if (selection === undefined || (Array.isArray(selection) && !selection.length)) {
        console.log(`no selection to choose from`);
        if (!initialWord) {
          alert(`There are no words starting with ${nextFirst} at this time. Another word will be supplied.`);
        }

        nextFirst = getRandomChar();
        selection = vocab[nextFirst];
        console.log(`selection 2x`, selection);
      }

      const selectedObj = selectWord(selection);
      console.log(`selectedObj`, selectedObj);

      if (!selectedObj) {
        console.log(`falsey`);
        alert(`There are no words starting with ${nextFirst} at this time. Another word will be supplied.`);
        nextFirst = getRandomChar();
        return this.nextWord();
      }

      if (initialWord) {
        initialWord = false;
      }

      currentWord = selectedObj.Kana;
      console.log(`selected`, selectedObj);
      return selectedObj;
    }
  }
}

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

interface Vocab {
  Kana: string;
  Kanji: string;
  Definition: string;
}

async function searchUsersGuess(currentWord: string, query: string): Promise<string> {
  // console.log(`guess`, query);

  return validateQuery(currentWord, query)
    .then(_ => fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    })
      .then(r => r.json())
      .then((r: Response) => {
        console.log(r);
        return validateResponse(r, currentWord)
          .then(_ => Promise.resolve(convertSmallChars(r.entry?.reading) || ""));
      })
    );
}

/**
 * Prior to HTTP-request validations
 */
async function validateQuery(currentWord: string, query: string): Promise<string> {
  if (!wanakana.isJapanese(query)) {
    return Promise.reject(Error("Not Japanese"));
  }

  if (!isValid(query)) {
    return Promise.reject(Error("Last character is unacceptable"));
  }

  if (!startsWithLastChar(currentWord, query)) {
    // console.log(`prevWord`, currentWord);
    // console.log(`guess`, query);
    return Promise.reject(Error("User input's first character doesn't match given word's last character"));
  }

  return Promise.resolve("No issues");
}

/**
 * Post HTTP-request validations - bc we cannot validate kanji inputs
 */
async function validateResponse(response: Response, currentWord: string): Promise<string> {
  if (!response.found) {
    return Promise.reject(Error("No exact matches in the Joshi dictionary"));
  }

  if (!isValid(response.entry?.reading)) {
    return Promise.reject(Error("User's kanji input ends with unacceptable character"));
  }

  if (!startsWithLastChar(currentWord, response.entry?.reading)) {
    return Promise.reject(Error("User's kanji input's first character doesn't match given word's last character"));
  }

  return Promise.resolve("No issues");
}

/**
 * Goes through the Japanese hiragana alphabet and returns a single character
 */
function getRandomChar(): string {
  const nextCandidate = kanaGroups[calcRandomNum(kanaGroups)];
  return nextCandidate;
}

function calcRandomNum(arr: Array<any>): number {
  const result = Math.floor(arr.length * Math.random());
  // console.log(`random num`, result);
  return result;
}

function isValid(word: string): boolean {
  // console.log(`valid word check`, word);

  // Grab first character because API doesn't consider "色々" as kanji
  if (wanakana.isKanji(word.substr(0, 1)) || wanakana.isKanji(wanakana.stripOkurigana(word).substr(0, 1))) {
    // console.log(`isValid isKanji`);
    return true;
  }

  let lastChar = word.substr(-1);
  // console.log(`lastChar`, lastChar);

  const firstCheck = lastChar.localeCompare("ー") !== 0;
  lastChar = ensureHiragana(lastChar) || lastChar;
  const secondCheck = lastChar.localeCompare("～") !== 0;
  // console.log(`lastChar hiragana`, lastChar);
  const thirdCheck = lastChar.localeCompare("ん") !== 0;

  const result = firstCheck && secondCheck && thirdCheck;
  // console.log(`firstCheck`, firstCheck);
  // console.log(`secondCheck`, secondCheck);
  // console.log(`thirdCheck`, thirdCheck);
  // console.log(`isValid`, result);
  return result;
}

/**
 * Confirms if the user input starts with the last character of the previous or given word used as a reference during the game
 * @param prevWord hiragana or katakana (converts)
 * @param guessWord hiragana or katakana (converts), ignores kanji
 */
function startsWithLastChar(prevWord: string, guessWord: string): boolean {
  console.log(`startsWithLastChar`, prevWord, guessWord);

  // Grab first character because API doesn't consider "色々" as kanji
  if (wanakana.isKanji(guessWord.substr(0, 1)) || wanakana.isKanji(wanakana.stripOkurigana(guessWord).substr(0, 1))) {
    // console.log(`startsWithLastChar isKanji`);
    return true;
  }

  let lastChar = ensureHiragana(convertSmallChars(prevWord));
  let beginningChar = ensureHiragana(guessWord.substr(0, 1));
  // console.log(`beg Char`, beginningChar);
  // console.log(`last Char`, lastChar);

  const result = beginningChar.localeCompare(lastChar) === 0;
  // console.log(`startsWithLastChar result`, result);

  return result
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

function selectWord(choices: Array<Vocab>): Vocab | null {
  if (!choices.length) {
    return null;
  }

  // const index = Math.floor(choices.length * Math.random());
  const index = calcRandomNum(choices);
  const selectedObj = choices[index];
  // console.log(`original word`, selectedObj);

  if (!isValid(selectedObj.Kana)) {
    // loop starting from index to end of array to find valid word
    let s;
    for (let i = index; i < choices.length; i++) {
      const word = choices[i];
      if (isValid(word.Kana)) {
        s = word;
        console.log(`end word`, s);
        return word;
      }
    }
    // if not, start from the beginning
    if (index !== 0) {
      for (let i = 0; i < index; i++) {
        const word = choices[i];
        if (isValid(word.Kana)) {
          s = word;
          console.log(`end word`, s);
          return word;
        }
      }
    }

    return null;
  }

  return selectedObj;
}

export const Test = {
  calcRandomNum,
  convertSmallChars,
  ensureHiragana,
  isValid,
  selectWord,
  startsWithLastChar,
  validateQuery,
  validateResponse,
}