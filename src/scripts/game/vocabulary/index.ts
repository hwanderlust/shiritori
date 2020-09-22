import History, { HistoryInstance } from "./history";
import {
  Vocabulary,
  getNextWord,
  getRandomChar,
  getVocabulary,
  removeWordFromVocab,
  searchUsersGuess,
  selectWord,
} from "./helpers";
import {
  compileVocabulary,
  convertSmallChars,
  ensureHiragana,
  formatToVocab,
} from "./helper_atoms";

export default function Vocab() {
  let vocab: JSON = null;
  let currentWord: string = null;
  let nextFirst: string = null;
  const history = History();

  return {
    init: function (): void {
      getVocabulary(5)
        .then((r: JSON) => {
          vocab = compileVocabulary(r, vocab);
          window.sessionStorage.setItem("vocab", JSON.stringify(vocab));
        });

      getVocabulary(4)
        .then((r: JSON) => {
          vocab = compileVocabulary(r, vocab);
          window.sessionStorage.setItem("vocab", JSON.stringify(vocab));
        });

      getVocabulary(3)
        .then((r: JSON) => {
          vocab = compileVocabulary(r, vocab);
          window.sessionStorage.setItem("vocab", JSON.stringify(vocab));
        });
    },

    searchUsersGuess: function (query) {
      return searchUsersGuess(currentWord, query)
        .then(entry => {
          if (!history.check(entry)) {
            history.clear();
            return Promise.reject(Error("This word was already used this round"));
          }
          return Promise.resolve(entry);
        })
        .then(entry => {
          console.debug(`user guess`, entry);
          nextFirst = convertSmallChars(entry?.japanese?.reading || "");
          history.add(entry);
          return Promise.resolve();
        })
        .catch(err => {
          nextFirst = null;
          history.clear();
          return Promise.reject(err);
        });
    },

    start: async function () {
      vocab = JSON.parse(window.sessionStorage.getItem("vocab"));
      console.debug(`vocab start`);
      nextFirst = getRandomChar();
      return await this.nextWord();
    },

    nextWord: async function nextWord(): Promise<Vocabulary> {
      console.debug(`nextWord start ${nextFirst}`);
      nextFirst = ensureHiragana(nextFirst);
      const selectedObj = selectWord(vocab[nextFirst]);

      if (!selectedObj) {
        const fetchedWord = await getNextWord(nextFirst, history);

        if (!fetchedWord) {
          console.log(`An error occurred and a word starting with ${nextFirst} couldn't be found at this time. Another word with another beginning character will be supplied.`);
          return await this.start();
        }

        history.add(fetchedWord);
        const formattedWord = formatToVocab(fetchedWord);
        currentWord = formattedWord.Kana;
        console.debug(`selected`, formattedWord);
        return formattedWord;
      }

      if (!history.check(selectedObj)) {
        vocab = removeWordFromVocab(selectedObj, vocab);
        return await nextWord();
      }

      history.add(selectedObj);
      currentWord = selectedObj.Kana;
      console.debug(`selected`, selectedObj);

      vocab = removeWordFromVocab(selectedObj, vocab);
      return selectedObj;
    },
    Test: {
      getHistory: function (): HistoryInstance {
        return history;
      },
      setVocab: function (vocabulary): void {
        vocab = vocabulary;
      },
      setNextFirst: function (char: string): void {
        nextFirst = char;
      },
    }
  }
}