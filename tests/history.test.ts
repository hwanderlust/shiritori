import History from "../src/scripts/game/vocabulary/history";

describe("History()", () => {
  describe("check()", () => {
    it("Checking an empty cache with a new word [Entry]", () => {
      const history = History();
      const entry = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "熱い",
        },
        english: []
      };
      expect(history.check(entry)).toBe(true);
    });

    it("Checking an empty cache with a new word [Vocab]", () => {
      const history = History();
      const entry = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "熱い",
        Definition: "hot"
      };
      expect(history.check(entry)).toBe(true);
    });

    it("Checking cache with the same exact word [Entry, Entry]", () => {
      const history = History();
      const entry = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "熱い",
        },
        english: []
      };
      history.add(entry);
      expect(history.check(entry)).toBe(false);
    });

    it("Checking cache with the same exact word [Vocab, Vocab]", () => {
      const history = History();
      const entry = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "熱い",
        Definition: "hot"
      };
      history.add(entry);
      expect(history.check(entry)).toBe(false);
    });

    it("Checking cache with the same exact word [Entry, Vocab]", () => {
      const history = History();
      const entry1 = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "熱い",
        },
        english: []
      };
      history.add(entry1);
      const entry2 = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "熱い",
        Definition: "hot"
      };
      expect(history.check(entry2)).toBe(false);
    });

    it("Checking cache with the same exact word [Vocab, Entry]", () => {
      const history = History();
      const entry1 = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "熱い",
        },
        english: []
      };
      const entry2 = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "熱い",
        Definition: "hot"
      };
      history.add(entry2);
      expect(history.check(entry1)).toBe(false);
    });

    it("Checking cache with a word with the same reading but not kanji [Entry, Vocab]", () => {
      const history = History();
      const entry1 = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "熱い",
        },
        english: []
      };
      const entry2 = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "暑い",
        Definition: "thick"
      };
      history.add(entry1);
      expect(history.check(entry2)).toBe(true);
    });

    it("Checking cache with a word with the same reading but not kanji [Vocab, Entry]", () => {
      const history = History();
      const entry1 = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "熱い",
        },
        english: []
      };
      const entry2 = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "暑い",
        Definition: "thick"
      };
      history.add(entry2);
      expect(history.check(entry1)).toBe(true);
    });

    it("Checking cache with a word with the same reading but one w/o kanji [Vocab, Entry]", () => {
      const history = History();
      const entry1 = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "熱い",
        },
        english: []
      };
      const entry2 = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "",
        Definition: "thick"
      };
      history.add(entry2);
      expect(history.check(entry1)).toBe(true);
    });

    it("Checking cache with a word the same reading but both w/o kanji [Vocab, Entry]", () => {
      const history = History();
      const entry1 = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "",
        },
        english: []
      };
      const entry2 = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "",
        Definition: "thick"
      };
      history.add(entry2);
      expect(history.check(entry1)).toBe(true);
    });

    it("Checking cache via slug [Entry, Entry]", () => {
      const history = History();
      const entry1 = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "",
        },
        english: []
      };
      history.add(entry1);
      expect(history.check(entry1)).toBe(false);
    });

    it("Checking cache via id [Vocab, Vocab]", () => {
      const history = History();
      const entry2 = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "",
        Definition: "thick"
      };
      history.add(entry2);
      expect(history.check(entry2)).toBe(false);
    });

    it("Checking cache via id [Entry, Vocab]", () => {
      const history = History();
      const entry1 = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "",
        },
        english: []
      };
      const entry2 = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "",
        Definition: "thick"
      };
      history.add(entry1);
      expect(history.check(entry2)).toBe(true);
    });

    it("Checking cache via id [Vocab, Entry]", () => {
      const history = History();
      const entry1 = {
        slug: "slug1",
        japanese: {
          reading: "あつい",
          word: "",
        },
        english: []
      };
      const entry2 = {
        ID: "id1",
        Kana: "あつい",
        Kanji: "",
        Definition: "thick"
      };
      history.add(entry2);
      expect(history.check(entry1)).toBe(true);
    });

  });
});