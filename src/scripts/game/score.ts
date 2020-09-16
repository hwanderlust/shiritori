import { get } from "../helpers"

export default function Score() {
  const scoreEl = get("score");
  let currentScore = 0;

  return {
    init: function (): void {
      scoreEl.classList.add("header__score--show");
    },
    reset: function (): void {
      currentScore = 0;
      scoreEl.innerText = format(currentScore);
    },
    update: function (pointsEarned): void {
      currentScore += pointsEarned;
      scoreEl.innerText = format(currentScore);
    },
    getScore: function (): number {
      return currentScore;
    },
  }
}

function format(n: number): string {
  return n.toString().padStart(4, "0");
}