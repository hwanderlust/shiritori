import Highscore from "../src/scripts/game/highscore";

const initialScoreboard = [
  { username: "", score: 0 },
  { username: "", score: 0 },
  { username: "", score: 0 },
  { username: "", score: 0 },
  { username: "", score: 0 },
  { username: "", score: 0 },
  { username: "", score: 0 },
  { username: "", score: 0 },
  { username: "", score: 0 },
  { username: "", score: 0 },
];

describe("Highscore", () => {

  it("initializes with an empty scoreboard", () => {
    const highscore = Highscore();
    expect(highscore.getBoard()).toEqual(initialScoreboard);
  });

  describe("getBoard()", () => {
    it("returns the current scoreboard", () => {
      const highscore = Highscore();
      expect(highscore.getBoard()).toEqual(initialScoreboard);
    });

    it("returns the updated scoreboard", () => {
      const highscore = Highscore();
      highscore.update(2, "R2D2");
      expect(highscore.getBoard()).toEqual([
        { username: "R2D2", score: 2 },
        { username: "", score: 0 },
        { username: "", score: 0 },
        { username: "", score: 0 },
        { username: "", score: 0 },
        { username: "", score: 0 },
        { username: "", score: 0 },
        { username: "", score: 0 },
        { username: "", score: 0 },
        { username: "", score: 0 },
      ]);
    });
  });

  describe("update()", () => {
    let highscore;

    beforeEach(() => {
      highscore = Highscore();
      highscore.update(10, "first place");
      highscore.update(9, "second place");
      highscore.update(8, "third place");
      highscore.update(7, "fourth place");
      highscore.update(6, "fifth place");
      highscore.update(5, "sixth place");
      highscore.update(4, "seventh place");
      highscore.update(3, "eighth place");
      highscore.update(2, "ninth place");
      highscore.update(1, "tenth place");
    });

    it("correctly updates 10th place with new record", () => {
      highscore.update(2, "new record");
      const lowestOnBoard = highscore.getBoard()[9];
      expect(lowestOnBoard).toEqual({ username: "new record", score: 2 });
    });

    it("maintains the top 10 scores", () => {
      highscore.update(6, "new record");
      expect(highscore.getBoard().length).toBe(10);
    });
  });

  describe("isNewRecord()", () => {
    let highscore;

    beforeAll(() => {
      highscore = Highscore();
      highscore.update(10, "first place");
      highscore.update(9, "second place");
      highscore.update(8, "third place");
      highscore.update(7, "fourth place");
      highscore.update(6, "fifth place");
      highscore.update(5, "sixth place");
      highscore.update(4, "seventh place");
      highscore.update(3, "eighth place");
      highscore.update(2, "ninth place");
      highscore.update(1, "tenth place");
    });

    it("tells us there's a new highscore based on the lowest score on the board", () => {
      expect(highscore.isNewRecord(7)).toBe(true);
    });

    it("returns FALSE for the score < lowest on the board", () => {
      expect(highscore.isNewRecord(0)).toBe(false);
    });
  });
});