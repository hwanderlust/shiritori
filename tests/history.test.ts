import History from "../src/scripts/game/vocabulary/history";

describe("History()", () => {

  describe("add()", () => {
    it("adds the already confirmed entry to the current round's cache", () => {
      const history = History();
      const beforeCache = history.test.getEntries();
      const confirmedEntry = {
        slug: "0",
        japanese: {
          reading: "ふくざつ",
          word: "複雑"
        },
        english: [],
      };
      history.add(confirmedEntry);
      const afterCache = history.test.getEntries();
      expect(afterCache.length).toBe(beforeCache.length + 1);
    });
  });

  describe("check()", () => {
    it("confirms the user's guess wasn't used in the current round", () => {
      const history = History();
      const addedEntry = {
        slug: "1",
        japanese: {
          reading: "にほん",
          word: "日本"
        },
        english: [],
      };
      const guess = {
        slug: "0",
        japanese: {
          reading: "ふくざつ",
          word: "複雑"
        },
        english: [],
      };
      history.add(addedEntry);
      expect(history.check(guess)).toBe(true);
    });

    it("confirms the user's guess was already used in the current round", () => {
      const history = History();
      const addedEntry = {
        slug: "1",
        japanese: {
          reading: "にほん",
          word: "日本"
        },
        english: [],
      };
      history.add(addedEntry);
      expect(history.check(addedEntry)).toBe(false);
    });
  });

  describe("clear()", () => {
    it("completely empties out the cache", () => {
      const history = History();
      const confirmedEntry = {
        slug: "0",
        japanese: {
          reading: "ふくざつ",
          word: "複雑"
        },
        english: [],
      };

      history.add(confirmedEntry);
      const beforeCache = history.test.getEntries();
      history.clear();
      const afterCache = history.test.getEntries();

      expect(beforeCache.length).toBe(1);
      expect(afterCache.length).toBe(0);
    });
  });
});