// TODO: use https://github.com/WaniKani/WanaKana

export default function Vocab() {
  let vocab;
  let currentWord: string;
  let nextFirst: string = null;

  return {
    init: function (): void {
      fetch("/api/vocabulary", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then(r => r.json())
        .then(r => JSON.parse(r))
        .then(r => {
          vocab = r;
        });
    },

    searchUsersGuess: async function (query: string): Promise<boolean> {

      if (!isValid(query)) {
        return Promise.resolve(false);
      }

      return fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      })
        .then(r => r.json())
        .then((r: Response) => {
          console.log(r);

          if (!r.found) {
            nextFirst = null;
            return Promise.resolve(false);
          }

          nextFirst = r.entry?.reading.substr(-1);
          return Promise.resolve(true);
        });
    },

    nextWord: function (): Vocab {
      if (!nextFirst) {
        nextFirst = getRandomChar();
      }
      console.log(`test`, extraKana[nextFirst]);

      if (!!extraKana[nextFirst]) {
        nextFirst = extraKana[nextFirst][0];
      }

      console.log(`nextFirst`, nextFirst);
      const selection = vocab[nextFirst];
      console.log(`selection`, selection);

      if (selection === undefined || !selection.length) {
        nextFirst = getRandomChar();
      }

      const selectedObj: Vocab = selection[calcRandomNum(selection.length)];

      if (!isValid(selectedObj.Kana)) {
        this.nextWord();
      }

      currentWord = selectedObj.Kana;
      console.log(`selected`, selectedObj);

      return selectedObj;
    }
  }
}

const kanaGroups = [
  "あ", "い", "う", "え", "お",
  "か", "き", "く", "け", "こ",
  "さ", "し", "す", "せ", "そ",
  "た", "ち", "つ", "て", "と",
  "な", "に", "ぬ", "ね", "の",
  "は", "ひ", "ふ", "へ", "ほ",
  "ま", "み", "む", "め", "も",
  "ら", "り", "る", "れ", "ろ",
  "や", "ゆ", "よ", "わ",
];

const extraKana = {
  "か": ["か", "が"],
  "が": ["か", "が"],
  "カ": ["か", "が"],
  "ガ": ["か", "が"],
  "き": ["き", "ぎ"],
  "ぎ": ["き", "ぎ"],
  "キ": ["き", "ぎ"],
  "ギ": ["き", "ぎ"],
  "く": ["く", "ぐ"],
  "ぐ": ["く", "ぐ"],
  "ク": ["く", "ぐ"],
  "グ": ["く", "ぐ"],
  "け": ["け", "げ"],
  "げ": ["け", "げ"],
  "ケ": ["け", "げ"],
  "ゲ": ["け", "げ"],
  "こ": ["こ", "ご"],
  "ご": ["こ", "ご"],
  "コ": ["こ", "ご"],
  "ゴ": ["こ", "ご"],
  "さ": ["さ", "ざ"],
  "ざ": ["さ", "ざ"],
  "サ": ["さ", "ざ"],
  "ザ": ["さ", "ざ"],
  "し": ["し", "じ"],
  "じ": ["し", "じ"],
  "シ": ["し", "じ"],
  "ジ": ["し", "じ"],
  "す": ["す", "ず"],
  "ず": ["す", "ず"],
  "ス": ["す", "ず"],
  "ズ": ["す", "ず"],
  "せ": ["せ", "ぜ"],
  "ぜ": ["せ", "ぜ"],
  "セ": ["せ", "ぜ"],
  "ゼ": ["せ", "ぜ"],
  "そ": ["そ", "ぞ"],
  "ぞ": ["そ", "ぞ"],
  "ソ": ["そ", "ぞ"],
  "ゾ": ["そ", "ぞ"],
  "た": ["た", "だ"],
  "だ": ["た", "だ"],
  "タ": ["た", "だ"],
  "ダ": ["た", "だ"],
  "ち": ["ち", "ぢ"],
  "ぢ": ["ち", "ぢ"],
  "チ": ["ち", "ぢ"],
  "ヂ": ["ち", "ぢ"],
  "て": ["て", "で"],
  "で": ["て", "で"],
  "テ": ["て", "で"],
  "デ": ["て", "で"],
  "と": ["と", "ど"],
  "ど": ["と", "ど"],
  "ト": ["と", "ど"],
  "ド": ["と", "ど"],
  "は": ["は", "ば", "ぱ"],
  "ば": ["は", "ば", "ぱ"],
  "ぱ": ["は", "ば", "ぱ"],
  "ハ": ["は", "ば", "ぱ"],
  "バ": ["は", "ば", "ぱ"],
  "パ": ["は", "ば", "ぱ"],
  "ひ": ["ひ", "び", "ぴ"],
  "び": ["ひ", "び", "ぴ"],
  "ぴ": ["ひ", "び", "ぴ"],
  "ヒ": ["ひ", "び", "ぴ"],
  "ビ": ["ひ", "び", "ぴ"],
  "ピ": ["ひ", "び", "ぴ"],
  "ふ": ["ふ", "ぶ", "ぷ"],
  "ぶ": ["ふ", "ぶ", "ぷ"],
  "ぷ": ["ふ", "ぶ", "ぷ"],
  "フ": ["ふ", "ぶ", "ぷ"],
  "ブ": ["ふ", "ぶ", "ぷ"],
  "プ": ["ふ", "ぶ", "ぷ"],
  "へ": ["へ", "べ", "ぺ"],
  "べ": ["へ", "べ", "ぺ"],
  "ぺ": ["へ", "べ", "ぺ"],
  "ヘ": ["へ", "べ", "ぺ"],
  "ベ": ["へ", "べ", "ぺ"],
  "ペ": ["へ", "べ", "ぺ"],
  "ほ": ["ほ", "ぼ", "ぽ"],
  "ぼ": ["ほ", "ぼ", "ぽ"],
  "ぽ": ["ほ", "ぼ", "ぽ"],
  "ホ": ["ほ", "ぼ", "ぽ"],
  "ボ": ["ほ", "ぼ", "ぽ"],
  "ポ": ["ほ", "ぼ", "ぽ"],
}

interface Response {
  found: boolean;
  entry: {
    reading: string;
    word: string;
  }
}

interface Vocab {
  Kana: string;
  Kanji: string;
  Definition: string;
}

/**
 * Goes through the Japanese hiragana alphabet and returns a single character
 */
function getRandomChar(): string {
  const nextCandidate = kanaGroups[calcRandomNum(kanaGroups.length)];

  if (extraKana[nextCandidate] !== undefined) {
    const extraCandidates = extraKana[nextCandidate];
    return extraCandidates[calcRandomNum(extraCandidates.length)];
  }
  return nextCandidate;
}

function calcRandomNum(numOfUnits: number) {
  return Math.floor(numOfUnits * Math.random());
}

function isValid(word: string): boolean {
  const result = word.substr(-1).localeCompare("ー") !== 0 &&
    word.substr(-1).localeCompare("～") !== 0 && word.substr(-1).localeCompare("ん") !== 0;

  console.log(`isValid`, result);
  return result;
}