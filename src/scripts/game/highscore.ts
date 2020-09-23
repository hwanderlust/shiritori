import { get } from "../helpers"

export default function Highscore(): HighscoreInstance {

  const scoreboard: Scoreboard = new Array(10)
    .fill(newRecord("", 0));

  return {
    getBoard: function (): Scoreboard {
      return scoreboard;
    },
    update: function (score: number, username: string): void {
      const index = scoreboard.findIndex(record => record.score < score);
      scoreboard.splice(index, 0, newRecord(username, score));
      scoreboard.pop();
    },
    isNewRecord: function (score: number): boolean {
      const lowestScore = scoreboard[9].score;
      return score > lowestScore;
    },
    display: function (): void {
      // manipulate HTML;
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
}

function newRecord(username: string, score: number): Record {
  return { username, score };
}