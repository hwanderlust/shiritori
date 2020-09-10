import { get } from "./helpers"

export default function Score() {
  const scoreEl = get("score");
  let currentScore = 0;

  return {
    reset: function (): void {
      currentScore = 0;
    },
    update: function (pointsEarned): void {
      currentScore += pointsEarned;
      scoreEl.innerText = `${currentScore}`;
    },
    getScore: function (): number {
      return currentScore;
    },
    display: function (): void {
      scoreEl.classList.add("header__score--show");
    }
  }
}