import History from "./history";
import {
  Vocabulary,
  compileVocabulary,
  formatToVocab,
  getRandomChar,
  getVocabulary,
  getWordStartingWith,
  removeWordFromVocab,
  searchUsersGuess,
  selectWord,
} from "./helpers";
import { convertSmallChars, ensureHiragana } from "./helper_atoms";

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
            return Promise.reject(Error("This word was already used this round"));
          }

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
      console.log(`vocab start`);
      nextFirst = getRandomChar();
      return await this.nextWord();
    },

    nextWord: async function (): Promise<Vocabulary> {
      console.log(`nextWord start ${nextFirst}`);

      nextFirst = ensureHiragana(nextFirst);
      console.log(`nextFirst`, nextFirst);
      const selectedObj = selectWord(vocab[nextFirst]);

      if (!selectedObj) {
        let fetchedWord = await getWordStartingWith(nextFirst);

        if (!fetchedWord) {
          console.log(`An error occurred and a word starting with ${nextFirst} couldn't be found at this time. Another word with another beginning character will be supplied.`);
          return await this.start();
        }

        // TODO: see if user guessed the word yet 
        // if (!history.check(fetchedWord)) {
        //   fetchedWord = await getWordStartingWith(nextFirst);
        // }

        history.add(fetchedWord);
        const formattedWord = formatToVocab(fetchedWord);
        currentWord = formattedWord.Kana;
        console.log(`selected`, formattedWord);
        return formattedWord;
      }

      currentWord = selectedObj.Kana;
      console.log(`selected`, selectedObj);

      vocab = removeWordFromVocab(selectedObj, vocab);
      return selectedObj;
    },
    Test: {
      setVocab: function (vocabulary): void {
        vocab = vocabulary;
      },
      setNextFirst: function (char: string): void {
        nextFirst = char;
      },
    }
  }
}