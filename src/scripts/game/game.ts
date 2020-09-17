import { get } from "../helpers";
import Vocab from "./vocabulary";

const vocabInstance = Vocab();
vocabInstance.init()

export default function Game() {
  const landingPic = get("landingPic");
  const playBtn = get("playBtn");
  const playAgainBtn = get("playAgainBtn");
  const emojiContainer = get("emoji");;
  const inputEl = get("guessInput") as HTMLInputElement;
  const resultOverlay = get("overlay");
  const prevWord = get("prevWord");
  const prevPrimary = prevWord.firstElementChild as HTMLElement;
  const prevSecondary = prevWord.lastElementChild as HTMLElement;
  const emojiSad = emojiContainer.firstElementChild as HTMLElement;
  const emojiHappy = emojiContainer.lastElementChild as HTMLElement;

  function showWrongUI(): void {
    resultOverlay.classList.add("wrong");

    inputEl.classList.add("game-ui__input--wrong");
    inputEl.disabled = true;

    document.body.style.overflowX = "hidden";
    emojiContainer.classList.add("emoji--slideleft");
    emojiSad.classList.remove("hide");

    playAgainBtn.parentElement.classList.add("play-again--show");
    playAgainBtn.focus();
  }

  function resetInput(): void {
    inputEl.value = ""
    inputEl.disabled = false;

    if (inputEl.classList.contains("game-ui__input--wrong")) {
      inputEl.classList.remove("game-ui__input--wrong");
    }
    if (inputEl.classList.contains("game-ui__input--correct")) {
      inputEl.classList.remove("game-ui__input--correct");
    }
  }

  function showCorrectUI(): void {
    resultOverlay.classList.add("correct");
    inputEl.classList.add("game-ui__input--correct");

    document.body.style.overflowX = "hidden";
    emojiContainer.classList.add("emoji--slideleft");
    emojiHappy.classList.remove("hide");

    prevWord.classList.add("focus");
    inputEl.parentElement.parentElement.classList.add("hide");

    resetInput();
    displayNextWord();
    timeouts();
  }

  function displayNextWord() {
    const startingVocab = vocabInstance.nextWord();
    prevPrimary.innerText = startingVocab?.Kanji || startingVocab?.Kana;
    prevSecondary.innerText = startingVocab.Kanji ? startingVocab.Kana : "";
  }

  function timeouts() {
    setTimeout(() => {
      document.body.style.overflowX = "";
      emojiContainer.classList.add("emoji--vanish");
      emojiHappy.classList.add("hide");
      inputEl.classList.remove("game-ui__input--correct");
      resultOverlay.classList.remove("correct");

      setTimeout(() => {
        emojiContainer.classList.remove("emoji--vanish");

        setTimeout(() => {
          prevWord.classList.add("slide-left");
          inputEl.parentElement.parentElement.classList.remove("hide");

          setTimeout(() => {
            prevWord.classList.remove("focus", "slide-left");
            inputEl.focus();
          }, 100);
        }, 100);
      }, 100);
    }, 1000);
  }

  return {
    initPlay: function () {
      landingPic.classList.add("fade-out");
      playBtn.classList.add("fade-out");

      setTimeout(() => {
        landingPic.remove();
        playBtn.parentElement.remove();

        const startingVocab = vocabInstance.start();
        prevPrimary.innerText = startingVocab?.Kanji || startingVocab?.Kana;
        prevSecondary.innerText = startingVocab.Kanji ? startingVocab.Kana : "";
        inputEl.focus();
      }, 500);
    },

    initPlayAgain: function () {
      resultOverlay.classList.remove("wrong");
      resetInput();
      inputEl.focus();

      playAgainBtn.parentElement.classList.remove("play-again--show");
      emojiSad.classList.add("hide");

      const startingVocab = vocabInstance.start();
      prevPrimary.innerText = startingVocab?.Kanji || startingVocab?.Kana;
      prevSecondary.innerText = startingVocab.Kanji ? startingVocab.Kana : "";
    },

    searchUsersGuess: async function () {
      inputEl.disabled = true;
      return vocabInstance.searchUsersGuess(inputEl.value)
        .then(_ => {
          showCorrectUI();
        })
        .catch(err => {
          console.log(err);
          showWrongUI();
        });
    },

    gameover: function () {
      showWrongUI();
    }
  }
}
