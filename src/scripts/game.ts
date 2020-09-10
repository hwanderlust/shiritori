import { get } from "./helpers";

interface Response {
  found: boolean;
  entry: {
    reading: string;
    word: string;
  }
}

export default function Game() {

  const landingPic: HTMLElement = get("landingPic");
  const playBtn: HTMLElement = get("playBtn");
  const gamePic: HTMLElement = get("gamePic");
  const playAgainBtn: HTMLElement = get("playAgainBtn");
  const emojiContainer: HTMLElement = get("emoji");;
  const inputEl: HTMLInputElement = get("guessForm").firstElementChild as HTMLInputElement;
  const resultOverlay: HTMLElement = get("overlay");
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

    setTimeout(() => {
      document.body.style.overflowX = undefined;
      emojiContainer.classList.add("emoji--vanish");
      emojiHappy.classList.add("hide");
      inputEl.classList.remove("game-ui__input--correct");
      resultOverlay.classList.remove("correct");

      setTimeout(() => {
        emojiContainer.classList.remove("emoji--vanish");
      }, 150);
    }, 1000);

    resetInput();

    // move on
  }

  return {
    initPlay: function () {
      landingPic.remove();
      playBtn.parentElement.remove();
      gamePic.classList.add("game-bg-pic--active");
      inputEl.focus();
    },

    initPlayAgain: function () {
      resultOverlay.classList.remove("wrong");
      resetInput();
      inputEl.focus();

      playAgainBtn.parentElement.classList.remove("play-again--show");
      emojiSad.classList.add("hide");
    },

    searchUsersGuess: async function (): Promise<boolean> {
      return fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputEl.value })
      })
        .then(r => r.json())
        .then((r: Response) => {
          console.log(r);

          if (!r.found) {
            showWrongUI();
            return Promise.resolve(false);
          }

          showCorrectUI();
          return Promise.resolve(true);
        });
    }
  }
}
