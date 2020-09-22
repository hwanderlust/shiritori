import { DebugMode, debug } from "../../helpers";
import { Entry, Vocabulary } from "./helper_atoms";

export interface HistoryInstance {
  check: (entry: Entry | Vocabulary) => boolean;
  add: (entry: Entry | Vocabulary) => void;
  clear: () => void;
  Test: Test;
}
interface Test {
  getEntries: () => Array<[string, any]>;
  isEntry: (word: Entry | Vocabulary) => boolean;
  isVocabulary: (word: Entry | Vocabulary) => boolean;
  matchById: (word1: Entry | Vocabulary, word2: Entry | Vocabulary) => boolean;
  matchByKanji: (word1: Entry | Vocabulary, word2: Entry | Vocabulary) => boolean;
  matchByReading: (word1: Entry | Vocabulary, word2: Entry | Vocabulary) => boolean;
}

/**
 * Tracks all used words during each round to prevent duplicates by us or the user
 */
export default function History(mode?: DebugMode): HistoryInstance {
  let cache = {};

  return {
    /**
     * Verifies if word can be used, if not it's bc user already used it as a guess - T meaning word can be used and user hasn't used it yet
     */
    check: function (lookupWord: Entry | Vocabulary): boolean {
      console.debug(`history confirming`, lookupWord);
      const cacheValues = Object.values(cache) as Array<Entry | Vocabulary>;

      for (let index = 0; index < cacheValues.length; index++) {
        const cachedWord = cacheValues[index];

        if (
          matchById(lookupWord, cachedWord) ||
          matchByKanji(lookupWord, cachedWord) ||
          matchByReading(lookupWord, cachedWord)
        ) {
          return false;
        }
      }

      return true;
    },
    add: function (wordObj: Entry | Vocabulary): void {
      if (isEntry(wordObj)) {
        cache[wordObj["slug"]] = wordObj;
        debug(mode, [`history after add`, cache]);
        return;
      }

      cache[wordObj.ID] = wordObj;
      debug(mode, [`history after add`, cache]);
    },
    clear: function (): void {
      cache = {};
      debug(mode, [`history cleared`, cache]);
    },
    Test: {
      getEntries: function () {
        return Object.entries(cache);
      },
      isEntry,
      isVocabulary,
      matchById,
      matchByKanji,
      matchByReading
    }
  };
}

function isEntry(wordObj: Entry | Vocabulary): wordObj is Entry {
  return (wordObj as Entry).slug !== undefined && !!(wordObj as Entry).slug;
}
function isVocabulary(wordObj: Entry | Vocabulary): wordObj is Vocabulary {
  return (wordObj as Vocabulary).ID !== undefined && !!(wordObj as Vocabulary).ID;
}

function matchById(word1: Entry | Vocabulary, word2: Entry | Vocabulary): boolean {
  if (isVocabulary(word1) && isVocabulary(word2)) {
    return word1.ID.localeCompare(word2.ID) === 0;
  }
  if (isEntry(word1) && isEntry(word2)) {
    return word1.slug.localeCompare(word2.slug) === 0;
  }
  return false;
}
function matchByKanji(word1: Entry | Vocabulary, word2: Entry | Vocabulary): boolean {
  if (isEntry(word1) && isEntry(word2)) {
    return word1.japanese?.word?.localeCompare(word2.japanese?.word) === 0;
  }
  if (isVocabulary(word1) && isVocabulary(word2)) {
    return word1.Kanji.localeCompare(word2.Kanji) === 0;
  }
  if (isVocabulary(word1) && isEntry(word2)) {
    return word1.Kanji.localeCompare(word2.japanese?.word) === 0;
  }
  if (isVocabulary(word2) && isEntry(word1)) {
    return word2.Kanji.localeCompare(word1.japanese?.word) === 0;
  }
  return false;
}
function matchByReading(word1: Entry | Vocabulary, word2: Entry | Vocabulary): boolean {
  if (isEntry(word1) && isEntry(word2)) {
    return word1.japanese?.reading?.localeCompare(word2.japanese?.reading) === 0 && (!word1.japanese?.word && !word2.japanese?.word);
  }
  if (isVocabulary(word1) && isVocabulary(word2)) {
    return word1.Kana.localeCompare(word2.Kana) === 0 && (!word1.Kanji && !word2.Kanji);
  }
  if (isVocabulary(word1) && isEntry(word2)) {
    return word1.Kana.localeCompare(word2.japanese?.reading) === 0
      && (!word1.Kanji.length && !word2.japanese?.word);
  }
  if (isVocabulary(word2) && isEntry(word1)) {
    return word2.Kana.localeCompare(word1.japanese?.reading) === 0
      && (!word2.Kanji.length && !word1.japanese?.word);
  }
  return false;
}