import { get } from "../helpers";
import Vocab from "./vocabulary";
import { Vocabulary } from "./vocabulary/helpers";

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
  const prevWordEl = get("prevWord");
  const [prevPrimary, prevSecondary, prevDefinition] = Array.from(prevWordEl.children) as Array<HTMLElement>;
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

  function gameover(): void {
    showWrongUI();
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

  async function showCorrectUI(): Promise<void> {
    resultOverlay.classList.add("correct");
    inputEl.classList.add("game-ui__input--correct");

    document.body.style.overflowX = "hidden";
    emojiContainer.classList.add("emoji--slideleft");
    emojiHappy.classList.remove("hide");

    await displayWord("next");
    emphasizeWord();
    resetInput();
    activateTransitions();
  }

  function emphasizeWord(): void {
    prevWordEl.classList.add("focus");
    inputEl.parentElement.parentElement.classList.add("hide");
  }
  function resetWordEmphasis(timeout: number): void {
    if (window.innerWidth < 1024) {
      inputEl.parentElement.parentElement.classList.remove("hide");
      prevWordEl.classList.remove("focus");
      inputEl.focus();

      setTimeout(() => {
        prevWordEl.classList.remove("slide");
      }, timeout);
      return;
    }

    setTimeout(() => {
      prevWordEl.classList.remove("focus", "slide");
      inputEl.parentElement.parentElement.classList.remove("hide");
      inputEl.focus();
    }, timeout);
  }

  async function displayWord(type: "start" | "next"): Promise<void> {
    const nextVocab: Vocabulary = type === "start" ? await vocabInstance.start() : await vocabInstance.nextWord();
    prevPrimary.innerText = nextVocab?.Kanji || nextVocab?.Kana;
    prevSecondary.innerText = nextVocab.Kanji ? nextVocab.Kana : "";
    prevDefinition.innerText = nextVocab.Definition;
  }

  function activateTransitions(): void {
    setTimeout(() => {
      document.body.style.overflowX = "";
      emojiContainer.classList.add("emoji--vanish");
      emojiHappy.classList.add("hide");
      inputEl.classList.remove("game-ui__input--correct");
      resultOverlay.classList.remove("correct");

      setTimeout(() => {
        emojiContainer.classList.remove("emoji--vanish");
        prevWordEl.classList.add("slide");
        resetWordEmphasis(100);
      }, 200);
    }, 1000);
  }

  return {
    initPlay: async function (): Promise<void> {
      landingPic.classList.add("fade-out");
      playBtn.classList.add("fade-out");

      await displayWord("start")
      emphasizeWord();

      setTimeout(() => {
        landingPic.remove();
        playBtn.parentElement.remove();
        resetWordEmphasis(800);
      }, 500);
    },

    initPlayAgain: async function (): Promise<void> {
      resultOverlay.classList.remove("wrong");
      underlay.classList.remove("gameover");
      resetInput();

      playAgainBtn.parentElement.classList.remove("play-again--show");
      emojiSad.classList.add("hide");

      await displayWord("start");
      emphasizeWord();
      resetWordEmphasis(1300);
    },

    searchUsersGuess: function (): Promise<void> {
      inputEl.disabled = true;
      return vocabInstance.searchUsersGuess(inputEl.value)
        .then(_ => {
          showCorrectUI();
        })
        .catch(err => {
          console.log(err);
          gameover();
        });
    },

    gameover
  }
}
