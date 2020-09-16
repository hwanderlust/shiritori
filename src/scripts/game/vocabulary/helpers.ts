import * as wanakana from "wanakana";
import {
  Response,
  Vocabulary,
  kanaGroups,
  calcRandomNum,
  convertSmallChars,
  ensureHiragana,
} from "./helper_atoms";
import { apiRequest } from "../../helpers";

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

function selectWord(choices: Array<Vocabulary>): Vocabulary | null {
  if (!choices.length) {
    return null;
  }

  const index = calcRandomNum(choices);
  const selectedObj = choices[index];

  if (!isValid(selectedObj.Kana)) {
    console.log(`original word`, selectedObj);
    // loop starting from index to end of array to find valid word
    let s;
    for (let i = index; i < choices.length; i++) {
      const word = choices[i];
      if (isValid(word.Kana)) {
        s = word;
        // console.log(`end word`, s);
        return word;
      }
    }
    // if not, start from the beginning
    if (index !== 0) {
      for (let i = 0; i < index; i++) {
        const word = choices[i];
        if (isValid(word.Kana)) {
          s = word;
          // console.log(`end word`, s);
          return word;
        }
      }
    }

    return null;
  }

  return selectedObj;
}

/**
 * Chooses a viable character to be used to find a word to be used in the game's next round
 */
function selectChar(vocab, char: string): string {
  char = ensureHiragana(char);

  if (vocab && (!vocab[char] || !vocab[char].length)) {
    const nextChar = getRandomChar();
    console.log(`no selection to choose from. trying ${nextChar}`);
    return selectChar(vocab, nextChar);
  }

  return char;
}

function getVocabulary(level: number): Promise<JSON> {
  return apiRequest(`/vocabulary/n${level}`, { method: "GET" })
    .then(JSON.parse);
}

function compileVocabulary(res: JSON, vocab: null | JSON) {
  if (!vocab) {
    vocab = res;
    return vocab;
  }
  vocab = { ...vocab, ...res };
  return vocab;
}


export {
  Vocabulary,
  getRandomChar,
  getVocabulary,
  searchUsersGuess,
  selectChar,
  selectWord,
  compileVocabulary
}

export const Test = {
  isValid,
  startsWithLastChar,
  validateQuery,
  validateResponse,
}