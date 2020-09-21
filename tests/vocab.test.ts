import Vocab from "../src/scripts/game/vocabulary";
import * as basicHelpers from "../src/scripts/helpers";
import * as helpers from "../src/scripts/game/vocabulary/helpers";
import * as helperAtoms from "../src/scripts/game/vocabulary/helper_atoms";
const vocab = require("../vocab-n5.json");

const { calcRandomNum, convertSmallChars, ensureHiragana, } = helperAtoms;
const {
  compileVocabulary,
  getNextWord,
  removeWordFromVocab,
  selectWord,
} = helpers;
const {
  getWordStartingWith,
  isValid,
  startsWithLastChar,
  validateQuery,
  validateResponse,
} = helpers.Test;

describe("Vocab tests", () => {
  // revisit toHavebeenCalled for existing tests

  describe("Vocab()", () => {

    describe("methods", () => {
      let vocabInstance;

      beforeAll(() => {
        vocabInstance = Vocab();
        vocabInstance.Test.setVocab(vocab);

        const origWindow = { ...window };
        const windowSpy = jest.spyOn(global, "window", "get");
        // @ts-ignore: Mock Type
        windowSpy.mockImplementation(() => {
          return {
            ...origWindow,
            sessionStorage: {
              ...origWindow.sessionStorage,
              getItem: () => JSON.stringify(vocab),
              setItem: () => { }
            }
          };
        });
      });

      describe("init()", () => {
        it("calls fetch API", () => {
          const spy = jest.spyOn(helpers, "getVocabulary");
          vocabInstance.init();
          expect(spy).toBeCalledTimes(3);
        })
      });

      describe("start()", () => {
        it("initiates the first word", async () => {
          const calcRandomNum = jest.spyOn(helperAtoms, "calcRandomNum");
          const nextWord = jest.spyOn(vocabInstance, "nextWord");

          await vocabInstance.start();
          expect(calcRandomNum).toHaveBeenCalled();
          expect(nextWord).toHaveBeenCalled();
        });
      });

      describe("nextWord()", () => {

        beforeEach(() => {
          vocabInstance.Test.setNextFirst("は");
        });

        it("retrieves a character to base finding a word with", async () => {
          const calcRandomNum = jest.spyOn(helperAtoms, "calcRandomNum");
          await vocabInstance.nextWord();
          expect(calcRandomNum).toHaveBeenCalled();
        });

        it("converts any possible Katakana to Hiragana to avoid reference errors", async () => {
          const ensureHiragana = jest.spyOn(helperAtoms, "ensureHiragana");
          await vocabInstance.nextWord();
          expect(ensureHiragana).toHaveBeenCalled();
        });

        it("retrieves another word from Joshi via backend", async () => {
          const getNextWord = jest.spyOn(helpers, "getNextWord");
          vocabInstance.Test.setNextFirst("る");
          await vocabInstance.nextWord();
          expect(getNextWord).toHaveBeenCalled();
        });

        it("chooses a word from a list of available options", async () => {
          const selectWord = jest.spyOn(helpers, "selectWord");
          await vocabInstance.nextWord();
          expect(selectWord).toHaveBeenCalled();
        });
      });
    });
  });

  describe("helpers", () => {

    describe("compileVocabulary()", () => {
      const vocab1 = JSON.parse(JSON.stringify({
        "あ": [{ Kana: "ああ" }, { Kana: "あつい" }],
      }));
      const vocab2 = JSON.parse(JSON.stringify({
        "あ": [{ Kana: "あまり" }, { Kana: "あたたかい" }],
        "い": [{ Kana: "いま" }],
      }));

      it("returns the response when 'vocab' is null", () => {
        const vocab = null;
        const resp = vocab1;
        const result = compileVocabulary(resp, vocab);
        expect(result).toEqual(resp);
      });

      it("returns consolidated vocab when 'vocab' isn't null", () => {
        const vocab = vocab1;
        const resp = vocab2;
        const result = compileVocabulary(resp, vocab);
        expect(result).toEqual({
          "あ": [
            { Kana: "ああ" },
            { Kana: "あつい" },
            { Kana: "あまり" },
            { Kana: "あたたかい" }
          ],
          "い": [{ Kana: "いま" }],
        });
      });
    });

    describe("validateQuery()", () => {
      describe("returns a Rejected Promise bc input isn't Japanese", () => {
        it("english", async () => {
          await expect(
            validateQuery("なんでも", "english")
          ).rejects.toEqual(
            Error("Not Japanese")
          );
        });

        it("12345", async () => {
          await expect(
            validateQuery("なんでも", "12345")
          ).rejects.toEqual(
            Error("Not Japanese")
          );
        });

        it("!@%", async () => {
          await expect(
            validateQuery("なんでも", "!@%")
          ).rejects.toEqual(
            Error("Not Japanese")
          );
        });
      });

      describe("returns a Rejected Promise bc of invalid input", () => {
        it("ーーーーー", async () => {
          await expect(
            validateQuery("なんでも", "ーーーーー")).rejects.toEqual(
              Error("Last character is unacceptable")
            );
        });

        it("そんな～", async () => {
          await expect(
            validateQuery("なんでも", "そんな～")).rejects.toEqual(
              Error("Last character is unacceptable")
            );
        });

        it("しんねん", async () => {
          await expect(
            validateQuery("なんでも", "しんねん")).rejects.toEqual(
              Error("Last character is unacceptable")
            );
        });
      });

      describe("returns a Rejected Promise bc word doesn't start with the previous' last character", () => {
        it("むてき", async () => {
          await expect(
            validateQuery("なんでも", "むてき")
          ).rejects.toEqual(
            Error("User input's first character doesn't match given word's last character")
          );
        });

        it("ったく", async () => {
          await expect(
            validateQuery("なんでも", "ったく")
          ).rejects.toEqual(
            Error("User input's first character doesn't match given word's last character")
          );
        });
      });

      describe("returns Resolved Promise", () => {
        it("むし", async () => {
          await expect(
            validateQuery("すすむ", "むし")
          ).resolves.toEqual(
            "No issues"
          );
        });

        it("うらやましい", async () => {
          await expect(
            validateQuery("じゆう", "うらやましい")
          ).resolves.toEqual(
            "No issues"
          );
        });

        it("るす", async () => {
          await expect(
            validateQuery("たべる", "るす")
          ).resolves.toEqual(
            "No issues"
          );
        });
      });
    });

    describe("validateResponse()", () => {
      it("returns a Rejected Promise bc input wasn't found / doesn't match", async () => {
        const currentWord = "なんでも";
        const response = {
          found: false,
          entry: {
            slug: "",
            japanese: {
              reading: "",
              word: ""
            },
            english: []
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
              slug: "",
              japanese: {
                reading: "みずん",
                word: ""
              },
              english: []
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
              slug: "",
              japanese: {
                reading: "みず～",
                word: ""
              },
              english: []
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
              slug: "",
              japanese: {
                reading: "すてき",
                word: "素敵"
              },
              english: []
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
              slug: "",
              japanese: {
                reading: "～まで",
                word: ""
              },
              english: []
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
              slug: "",
              japanese: {
                reading: "ズルい",
                word: ""
              },
              english: []
            }
          };
          await expect(validateResponse(response, currentWord)).resolves.toBe("No issues");
        });

        it("ギリギリ --> 理想的", async () => {
          const currentWord = "ギリギリ";
          const response = {
            found: true,
            entry: {
              slug: "",
              japanese: {
                reading: "りそうてき",
                word: "理想的"
              },
              english: []
            }
          };
          await expect(validateResponse(response, currentWord)).resolves.toBe("No issues");
        });

        it("わかりやすい --> 忙しい", async () => {
          const currentWord = "わかりやすい";
          const response = {
            found: true,
            entry: {
              slug: "",
              japanese: {
                reading: "いそがしい",
                word: "忙しい"
              },
              english: []
            }
          };
          await expect(validateResponse(response, currentWord)).resolves.toBe("No issues");
        });
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

    describe("selectWord()", () => {
      it("returns 'null' if all options aren't valid", () => {
        const availableWords = [
          { ID: "1", Kana: "かんぜん", Kanji: "完全", Definition: "" },
          { ID: "2", Kana: "たぶん", Kanji: "多分", Definition: "" },
          { ID: "3", Kana: "カテゴリー", Kanji: "", Definition: "" },
          { ID: "4", Kana: "ね～", Kanji: "", Definition: "" },
        ];
        const result = selectWord(availableWords);
        expect(result).toBe(null);
      });

      it("returns the sole valid option", () => {
        const validOption = { ID: "0", Kana: "ふくざつ", Kanji: "複雑", Definition: "" };
        const availableWords = [
          { ID: "1", Kana: "かんぜん", Kanji: "完全", Definition: "" },
          { ID: "2", Kana: "たぶん", Kanji: "多分", Definition: "" },
          { ID: "3", Kana: "カテゴリー", Kanji: "", Definition: "" },
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

    describe("removeWordFromVocab()", () => {
      let word1;
      let word2;
      let vocab;

      beforeEach(() => {
        word1 = JSON.parse(JSON.stringify({
          ID: "1",
          Kana: "あつい",
          Kanji: "熱い"
        }));
        word2 = JSON.parse(JSON.stringify({
          ID: "2",
          Kana: "あつい",
          Kanji: "暑い"
        }));
        vocab = JSON.parse(JSON.stringify({
          "あ": [word1]
        }));
      });

      it("calls 'ensureHiragana()'", () => {
        const spy = jest.spyOn(helperAtoms, "ensureHiragana");
        removeWordFromVocab(word1, vocab);
        expect(spy).toBeCalled();
      });

      it("removes the word from 'vocab' if found", () => {
        const beforeLength = vocab["あ"].length;
        const result = removeWordFromVocab(word1, vocab);
        const afterLength = result["あ"].length;

        expect(afterLength).toBe(beforeLength - 1);
        expect(result.valueOf()).toEqual({ "あ": [] });
      });

      it("returns 'vocab' without any changes", () => {
        const result = removeWordFromVocab(word1, vocab);
        expect(result.valueOf()).toEqual(vocab.valueOf());
      });
    });

    describe("getNextWord()", () => {
      let vocabInstance;
      let history;

      beforeAll(() => {
        vocabInstance = Vocab();
        vocabInstance.Test.setVocab(vocab);
        history = vocabInstance.Test.getHistory();
      });

      it("calls 'apiRequest' to the backend via 'getWordStartingWith'", async () => {
        const spy = jest.spyOn(basicHelpers, "apiRequest");
        await getNextWord("は", history);
        expect(spy).toBeCalled();
      });

      it("will call itself again upon failing history check", async () => {
        const spy = jest.spyOn(history, "check");
        await getNextWord("は", history);
        expect(spy).toBeCalled();
      });
    });

    describe("getWordStartingWith()", () => {
      it("calls 'apiRequest' to the backend", async () => {
        const spy = jest.spyOn(basicHelpers, "apiRequest");
        const char = "は";
        await getWordStartingWith(char);
        expect(spy).toBeCalledWith(`/words-starting-with/${encodeURI(char)}`, { method: "GET" })
      });
    });
  });

  describe("helper atoms", () => {

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
  });


  describe.skip("random tests [failure possibility]", () => {
    it("[selectWord] selects a random word from a list of words", () => {
      const availableWords = [
        { ID: "1", Kana: "かなり", Kanji: "", Definition: "" },
        { ID: "2", Kana: "かならず", Kanji: "必ず", Definition: "" },
        { ID: "3", Kana: "かっこいい", Kanji: "", Definition: "" },
        { ID: "4", Kana: "かつ", Kanji: "勝つ", Definition: "" },
      ];
      const result1 = selectWord(availableWords);
      const result2 = selectWord(availableWords);
      expect(result1).not.toEqual(result2);
    });

    it("[calcRandomNum] returns a random number between 0 and x", () => {
      const exampleArray = [1, 2, 3, 4, 5];
      const result1 = calcRandomNum(exampleArray);
      const result2 = calcRandomNum(exampleArray);
      expect(result1).not.toBe(result2);
    });

    it.skip("[searchUsersGuess]", () => { });
  });
});