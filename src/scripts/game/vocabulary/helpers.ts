import * as wanakana from "wanakana";
import {
  Entry,
  Response,
  Vocabulary,
  kanaGroups,
  calcRandomNum,
  convertSmallChars,
  ensureHiragana,
  hasSymbol,
  hasPunctuation,
} from "./helper_atoms";
import { DebugMode, apiRequest, debug, } from "../../helpers";
import { HistoryInstance } from "./history";

function searchUsersGuess(currentWord: string, query: string, mode?: DebugMode): Promise<Entry> {
  debug(mode, [`guess`, query]);

  return validateQuery(currentWord, query)
    .then(_ => fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    })
      .then(r => r.json())
      .then((r: Response) => {
        console.debug(r);

        if (!r.found) {
          return Promise.reject(Error("No exact matches in the Joshi dictionary"));
        }

        return Promise.resolve(r.entry);
      })
      .then(entry => validateEntry(entry, currentWord))
    );
}

/**
 * Prior to HTTP-request validations
 */
function validateQuery(currentWord: string, query: string, mode?: DebugMode): Promise<string> {
  if (!wanakana.isJapanese(query)) {
    return Promise.reject(Error("Not Japanese"));
  }

  if (!isValid(query)) {
    return Promise.reject(Error("Last character is unacceptable, or word contains unacceptable characters"));
  }

  if (!startsWithLastChar(currentWord, query)) {
    debug(mode, [`prevWord`, currentWord, `guess`, query]);
    return Promise.reject(Error("User input's first character doesn't match given word's last character"));
  }

  return Promise.resolve("No issues");
}

function validateEntry(entry: Entry, currentWord: string): Promise<Entry> {
  if (!isValid(entry?.japanese?.reading)) {
    return Promise.reject(Error("User's kanji input ends with unacceptable character, or word contains unacceptable characters"));
  }

  if (!startsWithLastChar(currentWord, entry?.japanese?.reading)) {
    return Promise.reject(Error("User's kanji input's first character doesn't match given word's last character"));
  }

  return Promise.resolve(entry);
}

/**
 * Goes through the Japanese hiragana alphabet and returns a single character
 */
function getRandomChar(mode?: DebugMode): string {
  const nextCandidate = kanaGroups[calcRandomNum(kanaGroups)];
  debug(mode, [`randomChar`, nextCandidate]);
  return nextCandidate;
}

function isValid(word: string, mode?: DebugMode): boolean {
  debug(mode, [`valid word check`, word])

  // Grab first character because API doesn't consider "色々" as kanji
  if (wanakana.isKanji(word.substr(0, 1)) || wanakana.isKanji(wanakana.stripOkurigana(word).substr(0, 1))) {
    debug(mode, [`isValid isKanji`]);
    return true;
  }

  if (hasPunctuation(word) || hasSymbol(word)) {
    return false;
  }

  let lastChar = word.substr(-1);
  debug(mode, [`lastChar`, lastChar])

  const firstCheck = lastChar.localeCompare("ー") !== 0;
  lastChar = ensureHiragana(lastChar) || lastChar;
  const secondCheck = lastChar.localeCompare("～") !== 0;

  debug(mode, [`lastChar hiragana`, lastChar]);

  const thirdCheck = lastChar.localeCompare("ん") !== 0;
  const result = firstCheck && secondCheck && thirdCheck;

  debug(mode, [`firstCheck`, firstCheck, `secondCheck`, secondCheck, `thirdCheck`, thirdCheck, `isValid`, result]);
  return result;
}

/**
 * Confirms if the user input starts with the last character of the previous or given word used as a reference during the game
 * @param prevWord hiragana or katakana (converts)
 * @param guessWord hiragana or katakana (converts), ignores kanji
 */
function startsWithLastChar(prevWord: string, guessWord: string, mode?: DebugMode): boolean {
  debug(mode, [`startsWithLastChar`, prevWord, guessWord])

  // Grab first character because API doesn't consider "色々" as kanji
  if (wanakana.isKanji(guessWord.substr(0, 1)) || wanakana.isKanji(wanakana.stripOkurigana(guessWord).substr(0, 1))) {
    debug(mode, [`startsWithLastChar isKanji`])
    return true;
  }

  let lastChar = ensureHiragana(convertSmallChars(prevWord));
  let beginningChar = ensureHiragana(guessWord.substr(0, 1));
  debug(mode, [`beg Char`, beginningChar, `last Char`, lastChar])

  const result = beginningChar.localeCompare(lastChar) === 0;
  debug(mode, [`startsWithLastChar result`, result])

  return result
}

function selectWord(choices: Array<Vocabulary>, mode?: DebugMode): Vocabulary | null {
  if (!choices?.length) {
    return null;
  }

  const index = calcRandomNum(choices);
  const selectedObj = choices[index];

  if (!isValid(selectedObj.Kana)) {
    debug(mode, [`original word`, selectedObj]);

    // loop starting from index to end of array to find valid word
    let s;
    for (let i = index; i < choices.length; i++) {
      const word = choices[i];
      if (isValid(word.Kana)) {
        s = word;
        debug(mode, [`end word`, s]);
        return word;
      }
    }

    // if not, start from the beginning
    if (index !== 0) {
      for (let i = 0; i < index; i++) {
        const word = choices[i];
        if (isValid(word.Kana)) {
          s = word;
          debug(mode, [`end word`, s]);
          return word;
        }
      }
    }

    return null;
  }

  return selectedObj;
}

function getVocabulary(level: number): Promise<JSON> {
  return apiRequest(`/vocabulary/n${level}`, { method: "GET" })
    .then(JSON.parse);
}

function removeWordFromVocab(selectedWord: Vocabulary, vocab: JSON): JSON {
  const selectedInitial = ensureHiragana(selectedWord.Kana.substring(0, 1));
  const selectedIndex = (vocab[selectedInitial] as Array<Vocabulary>).findIndex(el => el.ID.localeCompare(selectedWord.ID) === 0);

  if (selectedIndex === -1) {
    console.warn(`Couldn't locate word`, selectedWord);
    console.warn(`Removal failed`);
    return vocab;
  }

  vocab[selectedInitial].splice(selectedIndex, 1);
  return vocab;
}

async function getNextWord(char: string, history: HistoryInstance): Promise<Entry> {
  const nextWord = await getWordStartingWith(char);

  if (!nextWord) {
    return null;
  }

  if (!history.check(nextWord)) {
    return await getNextWord(char, history);
  }

  return nextWord;
}

async function getWordStartingWith(char: string): Promise<Entry> {
  const response = await apiRequest(`/words-starting-with/${encodeURI(char)}`, { method: "GET" });

  if (!response.found) {
    console.warn(`There are no words starting with ${char} at this time. Another word will be supplied.`);
    return;
  }

  return response.entry;
}

export {
  Vocabulary,
  getNextWord,
  getRandomChar,
  getVocabulary,
  removeWordFromVocab,
  searchUsersGuess,
  selectWord,
}

export const Test = {
  getWordStartingWith,
  isValid,
  startsWithLastChar,
  validateEntry,
  validateQuery,
}