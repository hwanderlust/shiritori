import { get } from "../helpers";

import Clock from "./clock";
import Game from "./game";
import Highscore from "./highscore";
import Score from "./score";

export default function InitGame() {

  function gameover() {
    gameInstance.gameover();

    if (highscoreInstance.isNewRecord(scoreInstance.getScore())) {
      highscoreInstance.showModal();
    }
  }

  const gameInstance = Game();
  const clockInstance = Clock();
  const highscoreInstance = Highscore();
  const scoreInstance = Score();
  clockInstance.init(gameover);

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
          });
      })
    },
    removeListeners: function () {
      playBtn.removeEventListener("click", playBtnListener);
      guessForm.removeEventListener("click", formListener);
    }
  }
}
