import History from "../src/scripts/game/vocabulary/history";

describe("History()", () => {

  describe("add()", () => {
    it("adds the already confirmed entry to the current round's cache", () => {
      const history = History();
      const beforeCache = history.Test.getEntries();
      const confirmedEntry = {
        slug: "0",
        japanese: {
          reading: "ふくざつ",
          word: "複雑"
        },
        english: [],
      };
      history.add(confirmedEntry);
      const afterCache = history.Test.getEntries();
      expect(afterCache.length).toBe(beforeCache.length + 1);
    });

    it("adds a Vocab to the cache", () => {
      const history = History();
      const beforeCache = history.Test.getEntries();
      const vocab = {
        ID: "1",
        Kana: "むずかしい",
        Kanji: "難しい",
        Definition: "difficult / hard",
      }
      history.add(vocab);
      const afterCache = history.Test.getEntries();
      expect(afterCache.length).toBe(beforeCache.length + 1);
    });
  });

  describe("check()", () => {
    let history;

    beforeAll(() => {
      history = History();
      history.add({
        slug: "0",
        japanese: {
          reading: "ふくざつ",
          word: "複雑"
        },
        english: ["complicated", "complex"],
      });
      history.add({
        ID: "1",
        Kana: "むずかしい",
        Kanji: "難しい",
        Definition: "difficult / hard",
      });
    });

    it("returns FALSE bc word has already been used [id]", () => {
      expect(history.check({ slug: "0" })).toBe(false);
    });

    it("returns FALSE bc word has already been used [id]", () => {
      expect(
        history.check({
          ID: "1",
          Kanji: "難しい",
          Kana: "むずかしい"
        })
      ).toBe(false);
    });

    it("returns TRUE bc word hasn't been used [id]", () => {
      expect(history.check({ slug: "1" })).toBe(true);
    });

    it("returns TRUE bc word hasn't been used [reading]", () => {
      expect(
        history.check({
          slug: "2",
          japanese: { reading: "ギリギリ", }
        })).toBe(true);
    });

    it("returns TRUE bc word hasn't been used [kanji]", () => {
      expect(
        history.check({
          slug: "2",
          japanese: { word: "山", }
        })).toBe(true);
    });

    it("returns FALSE bc word has been used [kanji]", () => {
      expect(
        history.check({
          ID: "2",
          Kanji: "難しい",
          Kana: ""
        })
      ).toBe(false);
    });

    it("returns TRUE bc cached word has kanji - can't determine equality otherwise", () => {
      expect(
        history.check({
          ID: "2",
          Kanji: "",
          Kana: "むずかしい"
        })
      ).toBe(true);
    });

    it("returns TRUE bc word hasn't been used [kanji]", () => {
      expect(
        history.check({
          ID: "2",
          Kanji: "学生",
          Kana: ""
        })
      ).toBe(true);
    });

    it("returns TRUE bc word hasn't been used [reading]", () => {
      expect(
        history.check({
          ID: "2",
          Kanji: "",
          Kana: "がくせい"
        })
      ).toBe(true);
    });

    it("returns TRUE bc word hasn't been used", () => {
      expect(
        history.check({
          ID: "2",
          Kanji: "学生",
          Kana: "がくせい"
        })
      ).toBe(true);
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
      const beforeCache = history.Test.getEntries();
      history.clear();
      const afterCache = history.Test.getEntries();

      expect(beforeCache.length).toBe(1);
      expect(afterCache.length).toBe(0);
    });
  });

  describe("helpers", () => {
    let history;
    let baseEntry;
    let baseVocab;

    beforeAll(() => {
      history = History();
      baseEntry = {
        slug: "0",
        japanese: {
          reading: "ふくざつ",
          word: "複雑"
        },
        english: ["complicated", "complex"],
      };
      baseVocab = {
        ID: "0",
        Kana: "ふくざつ",
        Kanji: "複雑",
        Definition: "complicated / complex",
      };
    });

    afterEach(() => {
      history.clear();
    });

    describe("isEntry()", () => {
      it("TRUE just bc slug prop is included", () => {
        const entry = { ...baseEntry };
        expect(history.Test.isEntry(entry)).toBe(true);
      });

      it("TRUE despite other properties are missing", () => {
        const entry = { ...baseEntry };
        entry.japanese = {};
        entry.english = [];
        expect(history.Test.isEntry(entry)).toBe(true);
      });

      it("FALSE just bc slug is falsey", () => {
        const entry = {
          slug: "",
          japanese: {},
          english: [],
        };
        expect(history.Test.isEntry(entry)).toBe(false);
      });

      it("FALSE bc slug prop is falsey despite having all other properties", () => {
        const entry = { ...baseEntry };
        entry.slug = "";
        expect(history.Test.isEntry(entry)).toBe(false);
      });
    });

    describe("isVocabulary()", () => {
      it("TRUE just bc ID prop is included", () => {
        const vocab = {
          ID: "0",
          Kana: "",
          Kanji: "",
          Definition: "",
        };
        expect(history.Test.isVocabulary(vocab)).toBe(true);
      });

      it("FALSE just bc ID prop is falsey", () => {
        const vocab = { ...baseVocab };
        vocab.ID = "";
        expect(history.Test.isVocabulary(vocab)).toBe(false);
      });
    });

    describe("matchById()", () => {
      it("matches Entry and Entry", () => {
        const cachedEntry = { ...baseEntry };
        history.add(cachedEntry);
        const lookupEntry = {
          slug: "0",
          japanese: {},
          english: []
        };
        expect(history.Test.matchById(lookupEntry, cachedEntry)).toBe(true);
      });

      it("matches Vocab and Vocab", () => {
        const cachedVocab = { ...baseVocab };
        history.add(cachedVocab);
        const lookupVocab = {
          ID: "0",
          Kana: "",
          Kanji: "",
          Definition: "",
        };
        expect(history.Test.matchById(lookupVocab, cachedVocab)).toBe(true);
      });

      it("doesn't match Entry and Vocab", () => {
        const cachedEntry = { ...baseEntry };
        history.add(cachedEntry);
        const lookupVocab = { ...baseVocab };
        expect(history.Test.matchById(lookupVocab, cachedEntry)).toBe(false);
      });

      it("doesn't match Vocab and Entry", () => {
        const cachedVocab = { ...baseVocab };
        history.add(cachedVocab);
        const lookupEntry = { ...baseEntry };
        expect(history.Test.matchById(lookupEntry, cachedVocab)).toBe(false);
      });
    });

    describe("matchByKanji()", () => {
      it("matches Entry and Entry", () => {
        const cachedEntry = { ...baseEntry };
        history.add(cachedEntry);
        const lookupEntry = {
          ...baseEntry,
          slug: "1",
          japanese: {
            word: "複雑"
          },
        };
        expect(history.Test.matchByKanji(lookupEntry, cachedEntry)).toBe(true);
      });

      it("matches Vocab and Vocab", () => {
        const cachedVocab = { ...baseVocab };
        history.add(cachedVocab);
        const lookupVocab = {
          ...baseVocab,
          ID: "1",
          Kana: "",
          Definition: "",
        };
        expect(history.Test.matchByKanji(lookupVocab, cachedVocab)).toBe(true);
      });

      it("matches Entry and Vocab", () => {
        const cachedEntry = { ...baseEntry };
        history.add(cachedEntry);
        const lookupVocab = { ...baseVocab };
        expect(history.Test.matchByKanji(lookupVocab, cachedEntry)).toBe(true);
      });

      it("matches Vocab and Entry", () => {
        const cachedVocab = { ...baseVocab };
        history.add(cachedVocab);
        const lookupEntry = {
          ...baseEntry,
          japanese: {
            word: "複雑"
          },
        };
        expect(history.Test.matchByKanji(lookupEntry, cachedVocab)).toBe(true);
      });

      it("doesn't match bc both have different kanji", () => {
        const cachedEntry = { ...baseEntry };
        history.add(cachedEntry);
        const lookupEntry = {
          ...baseEntry,
          slug: "1",
          japanese: {
            reading: "ふくざつ",
            word: "簡単",
          },
        };
        expect(history.Test.matchByKanji(lookupEntry, cachedEntry)).toBe(false);
      });

      it("doesn't match bc both have different kanji", () => {
        const cachedVocab = { ...baseVocab };
        history.add(cachedVocab);
        const lookupVocab = {
          ...baseVocab,
          ID: "1",
          Kana: "",
          Kanji: "簡単",
        };
        expect(history.Test.matchByKanji(lookupVocab, cachedVocab)).toBe(false);
      });

      it("doesn't match bc both have different kanji", () => {
        const cachedEntry = { ...baseEntry };
        history.add(cachedEntry);
        const lookupVocab = {
          ...baseVocab,
          Kanji: "簡単",
        };
        expect(history.Test.matchByKanji(lookupVocab, cachedEntry)).toBe(false);
      });

      it("doesn't match bc Entry doesn't have kanji", () => {
        const cachedVocab = { ...baseVocab };
        history.add(cachedVocab);
        const lookupEntry = {
          ...baseEntry,
          japanese: {
            reading: "ふくざつ",
          },
        };
        expect(history.Test.matchByKanji(lookupEntry, cachedVocab)).toBe(false);
      });
    });

    describe("matchByReading()", () => {
      it("matches Entry and Entry", () => {
        const cachedEntry = {
          ...baseEntry,
          japanese: {
            reading: "ふくざつ",
          },
        };
        history.add(cachedEntry);
        const lookupEntry = {
          ...baseEntry,
          slug: "1",
          japanese: {
            reading: "ふくざつ",
          },
        };
        expect(history.Test.matchByReading(lookupEntry, cachedEntry)).toBe(true);
      });

      it("matches Vocab and Vocab", () => {
        const cachedVocab = {
          ...baseVocab,
          ID: "0",
          Kanji: "",
        };
        history.add(cachedVocab);
        const lookupVocab = {
          ...baseVocab,
          ID: "1",
          Kanji: "",
          Definition: "",
        };
        expect(history.Test.matchByReading(lookupVocab, cachedVocab)).toBe(true);
      });

      it("matches Entry and Vocab", () => {
        const cachedEntry = {
          ...baseEntry,
          japanese: {
            reading: "ふくざつ",
          },
        };
        history.add(cachedEntry);
        const lookupVocab = {
          ...baseVocab,
          Kanji: "",
        };
        expect(history.Test.matchByReading(lookupVocab, cachedEntry)).toBe(true);
      });

      it("matches Vocab and Entry", () => {
        const cachedVocab = {
          ...baseVocab,
          Kanji: "",
          Definition: "complex",
        };
        history.add(cachedVocab);
        const lookupEntry = {
          ...baseEntry,
          japanese: {
            reading: "ふくざつ",
          },
          english: [],
        };
        expect(history.Test.matchByReading(lookupEntry, cachedVocab)).toBe(true);
      });

      it("doesn't match Entry and Entry bc reading is different", () => {
        const cachedEntry = {
          ...baseEntry,
          japanese: {
            reading: "ふくざつ",
          },
        };
        history.add(cachedEntry);
        const lookupEntry = {
          ...baseEntry,
          slug: "1",
          japanese: {
            reading: "ふくざ",
          },
        };
        expect(history.Test.matchByReading(lookupEntry, cachedEntry)).toBe(false);
      });

      it("doesn't match Vocab and Vocab bc reading is different", () => {
        const cachedVocab = {
          ...baseVocab,
          Kanji: "",
        };
        history.add(cachedVocab);
        const lookupVocab = {
          ...baseVocab,
          ID: "1",
          Kana: "ざつ",
          Kanji: "",
        };
        expect(history.Test.matchByReading(lookupVocab, cachedVocab)).toBe(false);
      });

      it("doesn't match bc Entry has kanji", () => {
        const cachedEntry = { ...baseEntry };
        history.add(cachedEntry);
        const lookupVocab = {
          ...baseVocab,
          Kanji: "",
        };
        expect(history.Test.matchByReading(lookupVocab, cachedEntry)).toBe(false);
      });

      it("doesn't match bc Vocab has kanji", () => {
        const cachedVocab = { ...baseVocab };
        history.add(cachedVocab);
        const lookupEntry = {
          ...baseEntry,
          japanese: {
            reading: "ふくざつ",
          },
        };
        expect(history.Test.matchByReading(lookupEntry, cachedVocab)).toBe(false);
      });

      it("doesn't match bc both have kanji", () => {
        const cachedVocab = { ...baseVocab };
        history.add(cachedVocab);
        const lookupEntry = {
          ...baseEntry,
          japanese: {
            reading: "ふくざつ",
            word: "漢字"
          },
        };
        expect(history.Test.matchByReading(lookupEntry, cachedVocab)).toBe(false);
      });
    });
  });
});