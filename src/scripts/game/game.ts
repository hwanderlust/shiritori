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
  const underlay = get("underlay");
  const prevWord = get("prevWord");
  const prevPrimary = prevWord.firstElementChild as HTMLElement;
  const prevSecondary = prevWord.lastElementChild as HTMLElement;
  const emojiSad = emojiContainer.firstElementChild as HTMLElement;
  const emojiHappy = emojiContainer.lastElementChild as HTMLElement;

  function showWrongUI(): void {
    resultOverlay.classList.add("wrong");
    underlay.classList.add("gameover");

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

    emphasizeWord();
    resetInput();
    displayWord("next");
    activateTransitions();
  }

  function emphasizeWord() {
    prevWord.classList.add("focus");
    inputEl.parentElement.parentElement.classList.add("hide");
  }
  function resetWordEmphasis(timeout: number) {
    if (window.innerWidth < 1024) {
      inputEl.parentElement.parentElement.classList.remove("hide");
      prevWord.classList.remove("focus");
      inputEl.focus();

      setTimeout(() => {
        prevWord.classList.remove("slide");
      }, timeout);
      return;
    }

    setTimeout(() => {
      prevWord.classList.remove("focus", "slide");
      inputEl.parentElement.parentElement.classList.remove("hide");
      inputEl.focus();
    }, timeout);
  }

  function displayWord(type: "start" | "next") {
    const nextVocab = type === "start" ? vocabInstance.start() : vocabInstance.nextWord();
    prevPrimary.innerText = nextVocab?.Kanji || nextVocab?.Kana;
    prevSecondary.innerText = nextVocab.Kanji ? nextVocab.Kana : "";
  }

  function activateTransitions() {
    setTimeout(() => {
      document.body.style.overflowX = "";
      emojiContainer.classList.add("emoji--vanish");
      emojiHappy.classList.add("hide");
      inputEl.classList.remove("game-ui__input--correct");
      resultOverlay.classList.remove("correct");

      setTimeout(() => {
        emojiContainer.classList.remove("emoji--vanish");
        prevWord.classList.add("slide");
        resetWordEmphasis(100);
      }, 200);
    }, 1000);
  }

  return {
    initPlay: function () {
      landingPic.classList.add("fade-out");
      playBtn.classList.add("fade-out");

      emphasizeWord();
      displayWord("start")

      setTimeout(() => {
        landingPic.remove();
        playBtn.parentElement.remove();
        resetWordEmphasis(800);
      }, 500);
    },

    initPlayAgain: function () {
      resultOverlay.classList.remove("wrong");
      underlay.classList.remove("gameover");
      resetInput();

      playAgainBtn.parentElement.classList.remove("play-again--show");
      emojiSad.classList.add("hide");

      emphasizeWord();
      displayWord("start");
      resetWordEmphasis(1300);
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
