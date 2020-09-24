import { get } from "../helpers";

import Clock from "./clock";
import Game from "./game";
import Score from "./score";

export default function InitGame() {

  const gameInstance = Game();
  const clockInstance = Clock();
  const scoreInstance = Score();
  clockInstance.init(
    () => gameInstance.gameover(scoreInstance.getScore())
  );

  let playBtnListener;
  let formListener;
  const playBtn: HTMLElement = get("playBtn");
  const playAgainBtn: HTMLElement = get("playAgainBtn");
  const guessForm: HTMLElement = get("guessForm");

  return {
    addListeners: function () {

      playBtnListener = playBtn.addEventListener("click", async _ => {
        await gameInstance.initPlay()
          .then(_ => {
            clockInstance.countdown();
            scoreInstance.init();
            playBtn.removeEventListener("click", playBtnListener);
          });
      });

      playAgainBtn.addEventListener("click", async _ => {
        await gameInstance.initPlayAgain()
          .then(_ => {
            clockInstance.reset();
            scoreInstance.reset();
          });
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
            gameInstance.gameover(scoreInstance.getScore());
          });
      })
    },
    removeListeners: function () {
      playBtn.removeEventListener("click", playBtnListener);
      guessForm.removeEventListener("click", formListener);
    }
  }
}
