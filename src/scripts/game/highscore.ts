import { get } from "../helpers"

export default function Highscore(): HighscoreInstance {

  const underlay = get("underlay");
  const overlay = get("overlay");
  const emoji = get("emoji").firstElementChild as HTMLElement;

  const scoreboard: Scoreboard = new Array(10)
    .fill(newRecord("enter username", 0));
  let recentUsername = "";
  let recentScore = 0;

  function update(): void {
    // remove arguments from tests
    const index = scoreboard.findIndex(record => record.score < recentScore);
    const record = newRecord(recentUsername, recentScore);
    scoreboard.splice(index, 0, record);
    scoreboard.pop();
    console.debug(`record added`, record);
  }

  async function display(): Promise<void> {
    const contents = get("hsModalContents");
    const title = get("hsModalTitle");
    const form = get("hsModalForm");

    title.innerText = "High Scores";
    form.remove();

    const scoreboardEl = document.createElement("div");
    scoreboardEl.classList.add("modal__contents__scoreboard");

    scoreboard.forEach((record: Record, index) => {
      const container = document.createElement("p");
      container.classList.add("scoreboard__record");
      if (window.innerWidth >= 1024) {
        container.style.order = gridOrder[index];
      }

      const usernameEl = document.createElement("span");
      usernameEl.innerText = record.username;
      const scoreEl = document.createElement("span");
      scoreEl.innerText = `${record.score}`;

      container.appendChild(usernameEl);
      container.appendChild(scoreEl);
      scoreboardEl.appendChild(container);
    });
    contents.appendChild(scoreboardEl);

    await createAndAddButton("Close");
    const btn = get("hsModalBtn");
    btn.addEventListener("click", _ => {
      onClosePress();
    });
    btn.focus();
  }

  function onAddPress(username: string): void {
    recentUsername = username;
    update();
    display();
  }

  function onClosePress(): void {
    overlay.classList.remove("congrats");
    emoji.innerText = "( ﾟДﾟ)";
    emoji.parentElement.classList.remove("emoji--congrats");
    const modal = get("hsModal");
    modal.remove();

    const playAgainBtn = get("playAgainBtn");
    playAgainBtn.focus();
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
      setTimeout(async () => {
        underlay.classList.add("gameover");
        overlay.classList.add("congrats");
        emoji.innerText = "＼(^_^)／";
        emoji.parentElement.classList.add("emoji--congrats");

        await createModal(recentUsername);
        addEventListeners(onAddPress);
        const input = get("hsModalInput") as HTMLInputElement;
        input.focus();
        input.select();

      }, 1000);
    },
    onAddPress,
    onClosePress,
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
  onAddPress: (username: string) => void;
  onClosePress: () => void;
}

const gridOrder = {
  0: 1,
  1: 3,
  2: 5,
  3: 7,
  4: 9,
  5: 2,
  6: 4,
  7: 6,
  8: 8,
  9: 10,
};

function newRecord(username: string, score: number): Record {
  return { username, score };
}

async function createModal(recentUsername: string): Promise<void> {
  await createAndAddModal();
  await createAndAddTitle();
  await createAndAddForm(recentUsername);
  await createAndAddButton("Add Me", recentUsername);
}

function createAndAddModal() {
  const modal = document.createElement("div");
  modal.id = "hsModal";
  modal.classList.add("modal");
  const container = document.createElement("div");
  container.classList.add("modal__container");
  modal.appendChild(container);

  const bg = document.createElement("span");
  bg.setAttribute("role", "img");
  bg.setAttribute("aria-label", "Chopsticks picking up sushi");
  container.appendChild(bg);

  const contents = document.createElement("div");
  contents.id = "hsModalContents";
  contents.classList.add("modal__contents");
  container.appendChild(contents);

  document.body.appendChild(modal);
}

function createAndAddTitle() {
  const contents = get("hsModalContents");
  const title = document.createElement("h1");
  title.id = "hsModalTitle";
  title.innerText = "New High Score";
  title.classList.add("modal__contents__title");
  contents.appendChild(title);
}

function createAndAddForm(recentUsername: string) {
  const contents = get("hsModalContents");
  const form = document.createElement("form");
  form.id = "hsModalForm";
  form.classList.add("modal__contents__form");
  const label = document.createElement("label");
  label.setAttribute("for", "username");
  label.innerText = "Username";
  form.appendChild(label);
  const input = document.createElement("input");
  input.id = "hsModalInput";
  input.type = "text";
  input.classList.add("text-input");
  input.name = "username";
  input.required = true;
  input.minLength = 3;
  input.value = recentUsername;
  form.appendChild(input);
  contents.appendChild(form);
}

function createAndAddButton(text: "Add Me" | "Close", recentUsername: string = ""): void {
  const contents = get("hsModalContents");
  const btnContainer = document.createElement("div");
  const btn = document.createElement("button");
  btn.id = "hsModalBtn";
  btn.classList.add("btn");
  btn.innerText = text;
  if (text === "Add Me" && !recentUsername) {
    btn.disabled = true;
    btn.classList.add("disabled");
  }
  btnContainer.appendChild(btn);
  contents.appendChild(btnContainer);
}

function addEventListeners(onAddPress: (username: string) => void) {
  const form = get("hsModalForm");
  const input = get("hsModalInput") as HTMLInputElement;
  const btn = get("hsModalBtn") as HTMLButtonElement;

  form.addEventListener("submit", event => {
    event.preventDefault();
    onAddPress(input.value.trim());
    btn.parentElement.remove();
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Backspace") {
      if (input.value.length === 3) {
        btn.classList.add("disabled");
        btn.disabled = true;
      }
      return;
    }

    if (input.value.length === 3) {
      if (btn.classList.contains("disabled")) {
        btn.classList.remove("disabled");
        btn.disabled = false;
        return;
      }
    }
  });

  input.addEventListener("keypress", _ => {

    if (input.value.length === 2) {
      if (btn.classList.contains("disabled")) {
        btn.classList.remove("disabled");
        btn.disabled = false;
        return;
      }
    }

    if (input.value.length < 3 && !btn.classList.contains("disabled")) {
      btn.classList.add("disabled");
      btn.disabled = true;
    }
  });

  btn.addEventListener("click", event => {
    event.stopPropagation();
    onAddPress(input.value.trim());
    btn.parentElement.remove();
  });
}