import * as wanakana from "wanakana";

export default function Vocab() {
  const cache = Cache();
  let vocab;
  let currentWord: string;
  let nextFirst: string = null;

  function reject(error: Error) {
    nextFirst = null;
    return Promise.reject(error);
  }

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

    searchUsersGuess: async function (query: string): Promise<string> {
      console.log(`guess`, query);

      if (!wanakana.isJapanese(query)) {
        return reject(Error("Not Japanese"));
      }

      // before http request for hiragana and katakana guesses
      if (!isValid(query)) {
        return reject(Error("Last character is unacceptable"));
      }
      if (!startsWithLastChar(currentWord, query)) {
        console.log(`prevWord`, currentWord);
        console.log(`guess`, query);
        return reject(Error("User input's first character doesn't match given word's last character"));
      }

      return fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      })
        .then(r => r.json())
        .then((r: Response) => {
          console.log(r);

          if (!r.found) {
            return reject(Error("No exact matches in the Joshi dictionary"));
          }

          // after http-request-check bc now we have the entered kanji's furigana / reading in hiragana
          if (!isValid(r.entry?.reading.substr(-1))) {
            return reject(Error("User's kanji input ends with unacceptable character"));
          }
          if (!startsWithLastChar(currentWord, r.entry?.reading)) {
            return reject(Error("User's kanji input's first character doesn't match given word's last character"));
          }

          nextFirst = convertSmallChars(r.entry?.reading) || "";
          return Promise.resolve("Accepted");
        });
    },

    nextWord: function (): Vocab {
      console.log(`nextWord start`);

      if (!nextFirst) {
        nextFirst = getRandomChar();
      }

      console.log(`nextFirst`, nextFirst);
      nextFirst = ensureHiragana(nextFirst);

      if (nextFirst.localeCompare("る") === 0) {
        alert(`There are no words starting with ${nextFirst} at this time. Another word will be supplied.`);
        nextFirst = getRandomChar();
      }

      let selection = vocab[nextFirst];
      console.log(`selection`, selection);

      if (selection === undefined || (Array.isArray(selection) && !selection.length)) {
        console.log(`no selection to choose from`);
        nextFirst = getRandomChar();
        selection = vocab[nextFirst];
        console.log(`selection 2x`, selection);
      }

      // const index = Math.floor(selection.length * Math.random());
      // const selectedObj = selection[index];
      const selectedObj = selectWord(selection);
      console.log(`selectedObj`, selectedObj);

      if (!selectedObj) {
        console.log(`falsey`);
        alert(`There are no words starting with ${nextFirst} at this time. Another word will be supplied.`);
        nextFirst = getRandomChar();
        return this.nextWord();
      }

      // if (!isValid(selectedObj.Kana)) {
      // console.log(`nextWord isValid false`);
      // console.log(`next/prev in selection`, selection[index + 1 === selection.length ? Math.abs(index - 1) : index + 1])
      // console.log(`again!`, selection[Math.abs(Math.floor(selection.length * (Math.random()) - 1))]);

      // if (cache.add(nextFirst, selectedObj.Kana)) {

      //   if (selection.length === cache.get(nextFirst)?.length) {
      //     // already went through all possible options, need to move forward
      //     cache.clear(nextFirst);
      //     alert(`There are no words starting with '${nextFirst}' at this time. Another word will be supplied.`);
      //     nextFirst = getRandomChar();
      //     return this.nextWord();
      //   }

      //   return this.nextWord();
      // }
      // }

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
  "ヤ": "や", "ユ": "ゆ", "ヨ": "よ", "ワ": "わ", "ヲ": "を", "ン": "ん"
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

/**
 * Goes through the Japanese hiragana alphabet and returns a single character
 */
function getRandomChar(): string {
  const nextCandidate = kanaGroups[Math.floor(kanaGroups.length * Math.random())];
  return nextCandidate;
}

// function calcRandomNum(numOfUnits: number): number {
//   const result = Math.floor(numOfUnits * Math.random());
//   console.log(`random num`, result);
//   return result;
// }

function isValid(word: string): boolean {
  console.log(`valid word check`, word);

  let lastChar = word.substr(-1);
  console.log(`lastChar`, lastChar);

  const firstCheck = lastChar.localeCompare("ー") !== 0;
  const secondCheck = lastChar.localeCompare("～") !== 0;
  lastChar = ensureHiragana(lastChar) || lastChar;
  console.log(`lastChar hiragana`, lastChar);
  const thirdCheck = lastChar.localeCompare("ん") !== 0;

  const result = firstCheck && secondCheck && thirdCheck;
  console.log(`firstCheck`, firstCheck);
  console.log(`secondCheck`, secondCheck);
  console.log(`thirdCheck`, thirdCheck);
  console.log(`isValid`, result);
  return result;
}

/**
 * Confirms if the user input starts with the last character of the previous or given word used as a reference during the game
 * @param prevWord hiragana or katakana (converts)
 * @param guessWord hiragana or katakana (converts), ignores kanji
 */
function startsWithLastChar(prevWord: string, guessWord: string): boolean {
  // console.log(`startsWithLastChar`, prevWord, guessWord);

  // Grab first character because API doesn't consider "色々" as kanji
  if (wanakana.isKanji(guessWord.substr(0, 1)) || wanakana.isKanji(wanakana.stripOkurigana(guessWord).substr(0, 1))) {
    // console.log(`startsWithLastChar isKanji`);
    return true;
  }

  let lastChar = ensureHiragana(convertSmallChars(prevWord));
  let beginningChar = ensureHiragana(guessWord.substr(0, 1));
  console.log(`beg Char`, beginningChar);
  console.log(`last Char`, lastChar);

  return beginningChar.localeCompare(lastChar) === 0;
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

  // console.log(`convertSmallChars end`, lastChar);
  return lastChar;
}

function Cache() {
  const cacheObj = {};

  return {
    /**
     * Returns true if added to the cache, otherwise false (exists)
     * @param key the letter used to find potential words
     * @param val the most recent candidate
     */
    add: function (key: string, val: string): boolean {
      console.log(`add ${key}-${val}`);

      if (!cacheObj[key]) {
        cacheObj[key] = [val];
        console.log(`cache`, cacheObj[key]);
        return true;
      }
      if (!cacheObj[key].find(el => el.localeCompare(val) === 0)) {
        cacheObj[key] = [...cacheObj[key], val];
        console.log(`cache`, cacheObj[key]);
        return true;
      }

      return false;
    },
    get: function (key: string): Array<string> | undefined {
      return cacheObj[key];
    },
    clear: function (key: string): void {
      delete cacheObj[key];
      console.log(`cleared`, cacheObj);

    }
  }
}

function selectWord(choices: Array<Vocab>): Vocab {
  const index = Math.floor(choices.length * Math.random());
  const selectedObj = choices[index];
  console.log(`original word`, selectedObj);

  if (choices.length === 1) {
    return null;
  }

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

    if (selectedObj.Kana.localeCompare(s.Kana)) {
      return null;
    }
    return s;
  }

  return selectedObj;
}