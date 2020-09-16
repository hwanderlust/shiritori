import Clock from "./clock";
import { get } from "../helpers";
import Game from "./game";
import Score from "./score";

export default function InitGame() {

  const gameInstance = Game();
  const clockInstance = Clock();
  const scoreInstance = Score();
  clockInstance.init(gameInstance.gameover);

  let playBtnListener;
  let formListener;
  const playBtn: HTMLElement = get("playBtn");
  const playAgainBtn: HTMLElement = get("playAgainBtn");
  const guessForm: HTMLElement = get("guessForm");

  return {
    addListeners: function () {

      playBtnListener = playBtn.addEventListener("click", _ => {
        gameInstance.initPlay();
        clockInstance.countdown();
        scoreInstance.init();
        playBtn.removeEventListener("click", playBtnListener);
      });

      playAgainBtn.addEventListener("click", _ => {
        gameInstance.initPlayAgain();
        clockInstance.reset();
        scoreInstance.reset();
      });

      formListener = guessForm.addEventListener("submit", event => {
        event.preventDefault();
        event.stopPropagation();

        gameInstance.searchUsersGuess()
          .then(_ => {
            clockInstance.reset();
            scoreInstance.update(1);
          })
          .catch(_ => {
            clockInstance.stop();
          });
      })
    },
    removeListeners: function () {
      playBtn.removeEventListener("click", playBtnListener);
      guessForm.removeEventListener("click", formListener);
    }
  }
}
