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

  beforeAll(() => {
    document.body.innerHTML = `
      <div id="overlay"></div>
      <div id="emoji">
        <div></div>
      </div>
    `
  });

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
      highscore.Test.setVariables("R2D2", 2);
      highscore.update();
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

      highscore.Test.setVariables("first place", 10);
      highscore.update();

      highscore.Test.setVariables("second place", 9);
      highscore.update();

      highscore.Test.setVariables("third place", 8);
      highscore.update();

      highscore.Test.setVariables("fourth place", 7);
      highscore.update();

      highscore.Test.setVariables("fifth place", 6);
      highscore.update();

      highscore.Test.setVariables("sixth place", 5);
      highscore.update();

      highscore.Test.setVariables("seventh place", 4);
      highscore.update();

      highscore.Test.setVariables("eighth place", 3);
      highscore.update();

      highscore.Test.setVariables("ninth place", 2);
      highscore.update();

      highscore.Test.setVariables("tenth place", 1);
      highscore.update();
    });

    it("correctly updates 10th place with new record", () => {
      highscore.Test.setVariables("new record", 2);
      highscore.update();
      const lowestOnBoard = highscore.getBoard()[9];
      expect(lowestOnBoard).toEqual({ username: "new record", score: 2 });
    });

    it("maintains the top 10 scores", () => {
      highscore.Test.setVariables("new record", 6);
      highscore.update();
      expect(highscore.getBoard().length).toBe(10);
    });
  });

  describe("isNewRecord()", () => {
    let highscore;

    beforeAll(() => {
      highscore = Highscore();

      highscore.Test.setVariables("first place", 10);
      highscore.update();

      highscore.Test.setVariables("second place", 9);
      highscore.update();

      highscore.Test.setVariables("third place", 8);
      highscore.update();

      highscore.Test.setVariables("fourth place", 7);
      highscore.update();

      highscore.Test.setVariables("fifth place", 6);
      highscore.update();

      highscore.Test.setVariables("sixth place", 5);
      highscore.update();

      highscore.Test.setVariables("seventh place", 4);
      highscore.update();

      highscore.Test.setVariables("eighth place", 3);
      highscore.update();

      highscore.Test.setVariables("ninth place", 2);
      highscore.update();

      highscore.Test.setVariables("tenth place", 1);
      highscore.update();
    });

    it("tells us there's a new highscore based on the lowest score on the board", () => {
      expect(highscore.isNewRecord(7)).toBe(true);
    });

    it("returns FALSE for the score < lowest on the board", () => {
      expect(highscore.isNewRecord(0)).toBe(false);
    });
  });
});
