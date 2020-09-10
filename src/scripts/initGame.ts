import Clock from "./clock";
import { get } from "./helpers";
import Game from "./game";
import Score from "./score";

const gameInstance = Game();
const clockInstance = Clock();
const scoreInstance = Score();

export default function InitGame() {

  let playBtnListener;
  let formListener;
  const landingPic: HTMLElement = get("landingPic");
  const playBtn: HTMLElement = get("playBtn");
  const playAgainBtn: HTMLElement = get("playAgainBtn");
  const gamePic: HTMLElement = get("gamePic");
  const guessForm: HTMLElement = get("guessForm");
  const emojiContainer: HTMLElement = get("emoji");
  const inputEl: HTMLInputElement = guessForm.firstElementChild as HTMLInputElement;
  const resultOverlay: HTMLElement = get("overlay");

  return {
    addListeners: function () {

      playBtnListener = playBtn.addEventListener("click", _ => {
        gameInstance.initPlay();
        clockInstance.countdown();
        scoreInstance.init();
      });

      playAgainBtn.addEventListener("click", _ => {
        gameInstance.initPlayAgain();
        clockInstance.reset();
        scoreInstance.reset();

        // bring in another word to start with
      });

      formListener = guessForm.addEventListener("submit", event => {
        event.preventDefault();
        event.stopPropagation();

        gameInstance.searchUsersGuess()
          .then(correct => {
            if (!correct) {
              clockInstance.stop();
              return;
            }
            clockInstance.reset();
            scoreInstance.update(1);
          })
      })
    },
    removeListeners: function () {
      playBtn.removeEventListener("click", playBtnListener);
      guessForm.removeEventListener("click", formListener);
    }
  }
}
