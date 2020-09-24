import { get } from "../helpers"

export default function Highscore(): HighscoreInstance {

  const underlay = get("underlay");
  const overlay = get("overlay");
  const emoji = get("emoji").firstElementChild as HTMLElement;

  const scoreboard: Scoreboard = new Array(10)
    .fill(newRecord("", 0));
  let recentUsername = "";
  let recentScore = 0;

  function update(): void {
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

    const scoreboardDisplay = scoreboard.reduce((acc, record) => {
      if (!!record.username) {
        return acc.concat(record);
      }
      return acc;
    }, [] as Array<Record>);

    if (Array.isArray(scoreboardDisplay)) {
      if (scoreboardDisplay.length > 5) {
        contents.classList.add("contents--grid");
        scoreboardEl.classList.add("scoreboard--grid");
      }

      scoreboardDisplay.forEach((record, index) => {
        const container = document.createElement("p");
        container.classList.add("scoreboard__record");

        if (scoreboardDisplay.length > 5) {
          if (window.innerWidth >= 1024) {
            container.style.order = gridOrder[scoreboardDisplay.length][index];
          }
        }

        const usernameEl = document.createElement("span");
        usernameEl.innerText = record.username;
        const scoreEl = document.createElement("span");
        scoreEl.innerText = `${record.score}`;

        if (record.username.localeCompare(recentUsername) === 0 && record.score === recentScore) {
          container.classList.add("just-added");
        }

        container.appendChild(usernameEl);
        container.appendChild(scoreEl);
        scoreboardEl.appendChild(container);
      });
    }

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
    const modal = get("hsModal");
    modal.classList.remove("modal--fadein");
    modal.classList.add("modal--fadeout");

    overlay.classList.remove("congrats");
    emoji.innerText = "( ﾟДﾟ)";
    emoji.parentElement.classList.remove("emoji--congrats");

    const playAgainBtn = get("playAgainBtn") as HTMLButtonElement;
    playAgainBtn.disabled = false;
    playAgainBtn.classList.remove("disabled");
    playAgainBtn.focus();

    setTimeout(() => {
      modal.remove();
    }, 500);
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
      }, 500);

      setTimeout(() => {
        get("hsModal").classList.add("modal--fadein");
        const input = get("hsModalInput") as HTMLInputElement;
        input.focus();
        input.select();
      }, 750);
    },
    onAddPress,
    onClosePress,
    Test: {
      setVariables: (username, score) => {
        recentUsername = username;
        recentScore = score;
      },
    }
  }
}

type Scoreboard = Array<Record>;
interface Record {
  score: number;
  username: string;
}

interface HighscoreInstance {
  getBoard: () => Scoreboard;
  update: () => void;
  isNewRecord: (score: number) => boolean;
  display: () => void;
  showModal: () => void;
  onAddPress: (username: string) => void;
  onClosePress: () => void;
  Test: Test;
}
interface Test {
  setVariables: (username: string, score: number) => void;
}

const gridOrder = {
  6: {
    0: 1,
    1: 3,
    2: 5,
    3: 2,
    4: 4,
    5: 6,
  },
  7: {
    0: 1,
    1: 3,
    2: 5,
    3: 7,
    4: 2,
    5: 4,
    6: 6
  },
  8: {
    0: 1,
    1: 3,
    2: 5,
    3: 7,
    4: 2,
    5: 4,
    6: 6,
    7: 8,
  },
  9: {
    0: 1,
    1: 3,
    2: 5,
    3: 7,
    4: 9,
    5: 2,
    6: 4,
    7: 6,
    8: 8
  },
  10: {
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
  }
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
  contents.innerHTML += `
    <h1 id="hsModalTitle" class="modal__contents__title">
      New High Score
    </h1>
  `;
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
  form.innerHTML += `
    <input 
      id="hsModalInput"  
      type="text"
      class="text-input"
      name="username"
      required
      minLength="3"
      value="${recentUsername}"
    />
    `;
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