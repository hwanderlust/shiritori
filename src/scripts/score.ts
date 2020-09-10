import { get } from "./helpers"

export default function Score() {
  const headerEl = get("header");
  let scoreEl;
  let currentScore = 0;

  return {
    init: function () {
      scoreEl = document.createElement("p");
      scoreEl.id = "score";
      scoreEl.className = "header__score header__score--show";
      scoreEl.innerText = "0000";
      headerEl.appendChild(scoreEl);
      scoreEl = get("score");
    },
    reset: function (): void {
      currentScore = 0;
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