import { DebugMode, debug } from "../../helpers";
import { Entry, Vocabulary } from "./helper_atoms";

export interface HistoryInstance {
  confirm: (word: Vocabulary) => boolean;
  check: (entry: Entry) => boolean;
  add: (entry: Entry | Vocabulary) => void;
  clear: () => void;
  test: Test;
}
interface Test {
  getEntries: () => Array<[string, any]>;
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
    confirm: function (lookupWord: Vocabulary): boolean {
      console.log(`history confirming`, lookupWord);
      const cacheValues = Object.values(cache) as Array<Entry | Vocabulary>;

      for (let index = 0; index < cacheValues.length; index++) {
        const cachedWord = cacheValues[index];

        if (isVocabulary(cachedWord)) {
          if (matchById(lookupWord, cachedWord)) {
            return false;
          }
        }

        if (isEntry(cachedWord)) {
          if (
            matchByKanji(lookupWord, cachedWord)
            || matchByReading(lookupWord, cachedWord)
          ) {
            return false;
          }
        }
      }

      return true;
    },
    /**
     * Verifies if user's guess is valid - T meaning valid and user hasn't used it yet
     */
    check: function (entry: Entry): boolean {
      debug(mode, [`history check`, !cache[entry.slug]]);
      return !cache[entry.slug];
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
    test: {
      getEntries: function () {
        return Object.entries(cache);
      }
    }
  };
}

function isEntry(wordObj: Entry | Vocabulary): wordObj is Entry {
  return (wordObj as Entry).slug !== undefined;
}
function isVocabulary(wordObj: Entry | Vocabulary): wordObj is Vocabulary {
  return (wordObj as Vocabulary).ID !== undefined;
}

function matchById(lookupWord: Vocabulary, cachedWord: Vocabulary): boolean {
  return lookupWord.ID.localeCompare(cachedWord.ID) === 0;
}
function matchByKanji(lookupWord: Vocabulary, cachedWord: Entry): boolean {
  return lookupWord.Kanji.localeCompare(cachedWord.japanese?.word) === 0;
}
function matchByReading(lookupWord: Vocabulary, cachedWord: Entry): boolean {
  return lookupWord.Kana.localeCompare(cachedWord.japanese?.reading) === 0
    && (!lookupWord.Kanji.length && !cachedWord.japanese?.word);
}