import { Test, } from "../src/scripts/vocab";

// nextWord

const {
  calcRandomNum,
  convertSmallChars,
  ensureHiragana,
  isValid,
  selectWord,
  startsWithLastChar,
  validateQuery,
  validateResponse,
} = Test;

describe("Vocab tests", () => {

  describe("validateQuery()", () => {
    describe("returns a Rejected Promise bc input isn't Japanese", () => {
      it("english", async () => {
        await expect(validateQuery("なんでも", "english"))
          .rejects.toEqual(Error("Not Japanese"));
      });

      it("12345", async () => {
        await expect(validateQuery("なんでも", "12345"))
          .rejects.toEqual(Error("Not Japanese"));
      });

      it("!@%", async () => {
        await expect(validateQuery("なんでも", "!@%"))
          .rejects.toEqual(Error("Not Japanese"));
      });
    });

    describe("returns a Rejected Promise bc of invalid input", () => {
      it("ーーーーー", async () => {
        await expect(validateQuery("なんでも", "ーーーーー"))
          .rejects.toEqual(Error("Last character is unacceptable"));
      });

      it("そんな～", async () => {
        await expect(validateQuery("なんでも", "そんな～"))
          .rejects.toEqual(Error("Last character is unacceptable"));
      });

      it("しんねん", async () => {
        await expect(validateQuery("なんでも", "しんねん"))
          .rejects.toEqual(Error("Last character is unacceptable"));
      });
    });

    describe("returns a Rejected Promise bc word doesn't start with the previous' last character", () => {
      it("むてき", async () => {
        await expect(validateQuery("なんでも", "むてき"))
          .rejects.toEqual(Error("User input's first character doesn't match given word's last character"));
      });

      it("ったく", async () => {
        await expect(validateQuery("なんでも", "ったく"))
          .rejects.toEqual(Error("User input's first character doesn't match given word's last character"));
      });
    });

    describe("returns Resolved Promise", () => {
      it("むし", async () => {
        await expect(validateQuery("すすむ", "むし"))
          .resolves.toEqual("No issues");
      });

      it("うらやましい", async () => {
        await expect(validateQuery("じゆう", "うらやましい"))
          .resolves.toEqual("No issues");
      });

      it("るす", async () => {
        await expect(validateQuery("たべる", "るす"))
          .resolves.toEqual("No issues");
      });
    });
  });

  describe("validateResponse()", () => {
    it("returns a Rejected Promise bc input wasn't found / doesn't match", async () => {
      const currentWord = "なんでも";
      const response = {
        found: false,
        entry: {
          reading: "",
          word: ""
        }
      };
      return validateResponse(response, currentWord)
        .catch(err =>
          expect(err).toEqual(Error("No exact matches in the Joshi dictionary"))
        );
    });

    describe("returns a Rejected Promise bc of invalid input", () => {
      it("ん", () => {
        const currentWord = "みず";
        const response = {
          found: true,
          entry: {
            reading: "みずん",
            word: ""
          }
        };
        return validateResponse(response, currentWord)
          .catch(err =>
            expect(err).toEqual(Error("User's kanji input ends with unacceptable character"))
          );
      });

      it("～", () => {
        const currentWord = "みず";
        const response = {
          found: true,
          entry: {
            reading: "みず～",
            word: ""
          }
        };
        return validateResponse(response, currentWord)
          .catch(err =>
            expect(err).toEqual(Error("User's kanji input ends with unacceptable character"))
          );
      });
    })

    describe("returns a Rejected Promise bc word doesn't start with the previous' last character", () => {
      it("みず --> すてき", async () => {
        const currentWord = "みず";
        const response = {
          found: true,
          entry: {
            reading: "すてき",
            word: "素敵"
          }
        };
        return validateResponse(response, currentWord)
          .catch(err =>
            expect(err).toEqual(Error("User's kanji input's first character doesn't match given word's last character"))
          );
      });

      it("みず --> ～まで", async () => {
        const currentWord = "みず";
        const response = {
          found: true,
          entry: {
            reading: "～まで",
            word: ""
          }
        };
        return validateResponse(response, currentWord)
          .catch(err =>
            expect(err).toEqual(Error("User's kanji input's first character doesn't match given word's last character"))
          );
      });
    });

    describe("returns Resolved Promise", () => {
      it("みず --> ズルい", async () => {
        const currentWord = "みず";
        const response = {
          found: true,
          entry: {
            reading: "ズルい",
            word: ""
          }
        };
        await expect(validateResponse(response, currentWord)).resolves.toBe("No issues");
      });

      it("ギリギリ --> 理想的", async () => {
        const currentWord = "ギリギリ";
        const response = {
          found: true,
          entry: {
            reading: "りそうてき",
            word: "理想的"
          }
        };
        await expect(validateResponse(response, currentWord)).resolves.toBe("No issues");
      });

      it("わかりやすい --> 忙しい", async () => {
        const currentWord = "わかりやすい";
        const response = {
          found: true,
          entry: {
            reading: "いそがしい",
            word: "忙しい"
          }
        };
        await expect(validateResponse(response, currentWord)).resolves.toBe("No issues");
      });
    });

  });

  describe.skip("calcRandomNum()", () => {
    it("returns a random number between 0 and x [failure possibility]", () => {
      const exampleArray = [1, 2, 3, 4, 5];
      const result1 = calcRandomNum(exampleArray);
      const result2 = calcRandomNum(exampleArray);
      expect(result1).not.toBe(result2);
    });
  });

  describe("isValid()", () => {
    it("returns TRUE", () => {
      expect(isValid("しごと")).toBe(true);
      expect(isValid("フォーク")).toBe(true);
      expect(isValid("就活")).toBe(true);
    });
    it("returns FALSE", () => {
      expect(isValid("ルーター")).toBe(false);
      expect(isValid("え～")).toBe(false);
      expect(isValid("かんたん")).toBe(false);
    });

  });

  describe("startsWithLastChar()", () => {
    it("returns TRUE for にほんご --> ごぜん", () => {
      const prevWord = "にほんご";
      const guessWord = "ごぜん";
      const result = startsWithLastChar(prevWord, guessWord);
      expect(result).toBe(true);
    });

    it("returns TRUE for ふくざつ --> つくりかた", () => {
      const prevWord = "ふくざつ";
      const guessWord = "つくりかた";
      const result = startsWithLastChar(prevWord, guessWord);
      expect(result).toBe(true);
    });

    it("returns TRUE for かのじょ --> よやく", () => {
      const prevWord = "かのじょ";
      const guessWord = "よやく";
      const result = startsWithLastChar(prevWord, guessWord);
      expect(result).toBe(true);
    });

    it("returns TRUE for アメリカ --> かなり", () => {
      const prevWord = "アメリカ";
      const guessWord = "かなり";
      const result = startsWithLastChar(prevWord, guessWord);
      expect(result).toBe(true);
    });

    describe("returns TRUE for kanji guessWords", () => {
      it("仕方ない", () => {
        const prevWord = "なんでも";
        const guessWord = "仕方ない";
        const result = startsWithLastChar(prevWord, guessWord);
        expect(result).toBe(true);
      });

      it("色々", () => {
        const prevWord = "なんでも";
        const guessWord = "色々";
        const result = startsWithLastChar(prevWord, guessWord);
        expect(result).toBe(true);
      });

      it("日本", () => {
        const prevWord = "なんでも";
        const guessWord = "日本";
        const result = startsWithLastChar(prevWord, guessWord);
        expect(result).toBe(true);
      });
    })

    it("returns FALSE for つくりかた --> つくりもの", () => {
      const prevWord = "つくりかた";
      const guessWord = "つくりもの";
      const result = startsWithLastChar(prevWord, guessWord);
      expect(result).toBe(false);
    });

    it("returns FALSE for ルーター --> たてもの", () => {
      const prevWord = "ルーター";
      const guessWord = "たてもの";
      const result = startsWithLastChar(prevWord, guessWord);
      expect(result).toBe(false);
    });

  });

  describe("ensureHiragana()", () => {
    it("detects katakana and converts to corresponding hiragana", () => {
      expect(ensureHiragana("カ")).toBe("か");
      expect(ensureHiragana("フ")).toBe("ふ");
      expect(ensureHiragana("ヲ")).toBe("を");
      expect(ensureHiragana("ユ")).toBe("ゆ");
      expect(ensureHiragana("ン")).toBe("ん");
    });
    it("returns same character if already hiragana", () => {
      expect(ensureHiragana("ち")).toBe("ち");
      expect(ensureHiragana("た")).toBe("た");
      expect(ensureHiragana("り")).toBe("り");
      expect(ensureHiragana("ー")).toBe("ー");
      expect(ensureHiragana("～")).toBe("～");
    });
  });

  describe("convertSmallChars()", () => {
    describe("for words ending in certain 'small' characters", () => {
      it("converts 'ょ' to 'よ'", () => {
        expect(convertSmallChars("かのじょ")).toBe("よ");
      });
      it("converts 'ゃ' to 'や'", () => {
        expect(convertSmallChars("じゃ")).toBe("や");
      });
      it("converts 'ゅ' to 'ゆ'", () => {
        expect(convertSmallChars("しゅ")).toBe("ゆ");
      });
      it("converts 'っ' to 'つ'", () => {
        expect(convertSmallChars("ふっ")).toBe("つ");
      });
      it("converts 'ぇ' to 'え'", () => {
        expect(convertSmallChars("ちぇ")).toBe("え");
      });
    });

    describe("for words ending with regular characters", () => {
      it("returns the word's last character as-is, unchanged", () => {
        const word = "すごい";
        expect(convertSmallChars(word)).toBe("い");
      });
    });
  });

  describe("selectWord()", () => {
    it.skip("selects a random word from a list of words [failure possibility]", () => {
      const availableWords = [
        { Kana: "かなり", Kanji: "", Definition: "" },
        { Kana: "かならず", Kanji: "必ず", Definition: "" },
        { Kana: "かっこいい", Kanji: "", Definition: "" },
        { Kana: "かつ", Kanji: "勝つ", Definition: "" },
      ];
      const result1 = selectWord(availableWords);
      const result2 = selectWord(availableWords);
      expect(result1).not.toEqual(result2);
    });

    it("returns 'null' if all options aren't valid", () => {
      const availableWords = [
        { Kana: "かんぜん", Kanji: "完全", Definition: "" },
        { Kana: "たぶん", Kanji: "多分", Definition: "" },
        { Kana: "カテゴリー", Kanji: "", Definition: "" },
        { Kana: "ね～", Kanji: "", Definition: "" },
      ];
      const result = selectWord(availableWords);
      expect(result).toBe(null);
    });

    it("returns the sole valid option", () => {
      const validOption = { Kana: "ふくざつ", Kanji: "複雑", Definition: "" };
      const availableWords = [
        { Kana: "かんぜん", Kanji: "完全", Definition: "" },
        { Kana: "たぶん", Kanji: "多分", Definition: "" },
        { Kana: "カテゴリー", Kanji: "", Definition: "" },
        validOption
      ];
      const result = selectWord(availableWords);
      expect(result).toEqual(validOption);
    });

    it("returns 'null' if there are no options", () => {
      const availableWords = [];
      const result = selectWord(availableWords);
      expect(result).toBe(null);
    });
  });
});