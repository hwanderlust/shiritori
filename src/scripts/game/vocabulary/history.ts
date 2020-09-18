import { DebugMode, debug } from "../../helpers";
import { Entry } from "./helper_atoms";

/**
 * Tracks successful user guesses to prevent duplicates
 */
export default function History(mode?: DebugMode) {
  let cache = {};

  return {
    /**
     * Verifies if user's guess is in the cache or not - T meaning the guess is valid
     */
    check: function (entry: Entry): boolean {
      debug(mode, [`history check`, !cache[entry.slug]]);
      return !cache[entry.slug];
    },
    add: function (entry: Entry): void {
      cache[entry.slug] = entry;
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