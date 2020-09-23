import { get } from "../helpers"

export default function Highscore(): HighscoreInstance {

  const underlay = get("underlay");
  const overlay = get("overlay");
  const emoji = get("emoji").firstElementChild as HTMLElement;

  // const usernameInput = get(""); or createElement within showModal?

  const scoreboard: Scoreboard = new Array(10)
    .fill(newRecord("", 0));
  let recentUsername = "";
  let recentScore = 0;

  function update(score: number, username: string = recentUsername): void {
    // get username input element and get text
    // const username = usernameInput.innerText.trim();
    // recentUsername = username;

    // remove arguments, also from tests

    const index = scoreboard.findIndex(record => record.score < score);
    scoreboard.splice(index, 0, newRecord(username, score));
    scoreboard.pop();
  }

  function display(): void {
    // show the scoreboard within the modal
  }

  function onAddPress(): void {
    // update();
    display();
  }

  return {
    getBoard: function (): Scoreboard {
      return scoreboard;
    },
    update,
    isNewRecord: function (score: number): boolean {
      recentScore = score;
      const lowestScore = scoreboard[9].score;
      return score > lowestScore;
    },
    display,
    showModal: function (): void {
      setTimeout(() => {
        // show or create the modal with input to get user's username

        underlay.classList.add("gameover");
        overlay.classList.add("congrats");
        emoji.innerText = "＼(^_^)／";
        emoji.parentElement.classList.add("emoji--congrats");

        const modal = document.createElement("div");
        modal.id = "highscoreModal";
        modal.classList.add("modal");
        const container = document.createElement("div");
        container.classList.add("modal__container");
        modal.appendChild(container);

        const bg = document.createElement("span");
        bg.setAttribute("role", "img");
        bg.setAttribute("aria-label", "Chopsticks picking up sushi");
        container.appendChild(bg);

        const contents = document.createElement("div");
        contents.classList.add("modal__contents");
        container.appendChild(contents);

        const title = document.createElement("h1");
        title.innerText = "New High Score";
        title.classList.add("modal__contents__title");
        contents.appendChild(title);

        const label = document.createElement("label");
        label.innerText = "Username";
        contents.appendChild(label);

        // form
        // text input

        const btnContainer = document.createElement("div");
        const btn = document.createElement("button");
        btn.classList.add("btn");
        btnContainer.appendChild(btn);
        contents.appendChild(btnContainer);

        document.body.appendChild(modal);

        // form.addEventListener("submit", event => { event.preventDefault(); });

        btn.addEventListener("click", event => {
          // event.preventDefault();
          // event.stopPropagation();
          // onAddPress(input.innerText.trim())
        });
      }, 1000);
    },
    onAddPress,
    onClosePress: function (): void {
      // close modal
      underlay.classList.remove("gameover");
      overlay.classList.remove("congrats");
      emoji.innerText = "( ﾟДﾟ)";
      emoji.parentElement.classList.remove("emoji--congrats");

      get("highscoreModal").remove();
    }
  }
}

interface Record {
  score: number;
  username: string;
}
type Scoreboard = Array<Record>;

interface HighscoreInstance {
  getBoard: () => Scoreboard;
  update: (score: number, username: string) => void;
  isNewRecord: (score: number) => boolean;
  display: () => void;
  showModal: () => void;
  onAddPress: () => void;
  onClosePress: () => void;
}

function newRecord(username: string, score: number): Record {
  return { username, score };
}