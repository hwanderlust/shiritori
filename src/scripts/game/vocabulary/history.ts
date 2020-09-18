import { DebugMode, debug } from "../../helpers";
import { Entry, Vocabulary } from "./helper_atoms";

/**
 * Tracks successful user guesses to prevent duplicates
 */
export default function History(mode?: DebugMode) {
  let cache = {};

  return {
    /**
     * Verifies if user's guess is in the cache or not - T meaning the guess is valid
     */
    check: function (entry: Entry | Vocabulary): boolean {
      debug(mode, [`history check`]);

      if (entry["slug"]) {
        const idCheck = !cache[entry["slug"]];
        const kanjiCheck = entry["japanese"]["word"] ? !Object.values(cache).find((el: Entry | Vocabulary) => {
          if (el["slug"] && el["japanese"] && !!el["japanese"]["word"]) {
            return el["japanese"]["word"].localeCompare(entry["japanese"]["word"]) === 0;
          }
          if (el["Kanji"] && !!entry["japanese"]["word"]) {
            return el["Kanji"].localeCompare(entry["japanese"]["word"]) === 0;
          }
          return false;
        }) : true;

        console.log(`history check Entry`, idCheck);
        console.log(`history check Entry`, kanjiCheck);
        return idCheck && kanjiCheck;
      }

      const idCheck = !cache[entry["ID"]];
      const kanjiCheck = !!entry["Kanji"] ? !Object.values(cache).find((el: Entry | Vocabulary) => {
        if (!!el["Kanji"]) {
          return entry["Kanji"].localeCompare(el["Kanji"]) === 0;
        }
        if (el["japanese"] && !!el["japanese"]["word"]) {
          return entry["Kanji"].localeCompare(el["japanese"]["word"]) === 0;
        }
        return false;
      }) : true;

      console.log(`history check Vocab`, idCheck);
      console.log(`history check Vocab`, kanjiCheck);
      return idCheck && kanjiCheck;
    },
    add: function (entry: Entry | Vocabulary): void {
      if (entry["slug"]) {
        cache[entry["slug"]] = entry;
        console.log(`history adding Entry`, entry);
      } else {
        cache[entry["ID"]] = entry;
        console.log(`history adding Vocab`, entry);
      }

      debug(mode, [`history after add`, cache]);
    },
    clear: function (): void {
      cache = {};
      debug(mode, [`history cleared`, cache]);
    },
  };
}