import {
  Vocabulary,
  compileVocabulary,
  getRandomChar,
  getVocabulary,
  searchUsersGuess,
  selectChar,
  selectWord,
} from "./helpers";

export default function Vocab() {
  let vocab: JSON = null;
  let currentWord: string = null;
  let nextFirst: string = null;

  return {
    init: function (): void {
      getVocabulary(5)
        .then((r: JSON) => {
          vocab = compileVocabulary(r, vocab);
        });

      getVocabulary(4)
        .then((r: JSON) => {
          vocab = compileVocabulary(r, vocab);
        });
    },

    searchUsersGuess: function (query) {
      return searchUsersGuess(currentWord, query)
        .then(guessWord => {
          nextFirst = guessWord;
          return Promise.resolve();
        })
        .catch(err => {
          nextFirst = null;
          return Promise.reject(err);
        });
    },

    start: function () {
      console.log(`vocab start`);
      nextFirst = getRandomChar();
      return this.nextWord();
    },

    nextWord: function (): Vocabulary {
      console.log(`nextWord start ${nextFirst}`);

      nextFirst = selectChar(vocab, nextFirst);
      console.log(`nextFirst`, nextFirst);
      const selectedObj = selectWord(vocab[nextFirst]);

      if (!selectedObj) {
        console.warn(`There are no words starting with ${nextFirst} at this time. Another word will be supplied.`);
        return this.start();
      }

      currentWord = selectedObj.Kana;
      console.log(`selected`, selectedObj);
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