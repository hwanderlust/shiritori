import { filterByChar } from "../server/helpers";

describe("helpers", () => {
  describe("filterByChar()", () => {
    const results = [
      {
        "slug": "留守",
        "japanese": [
          {
            "word": "留守",
            "reading": "るす"
          },
          {
            "word": "留主",
            "reading": "るす"
          }
        ],
        "senses": [
          {
            "english_definitions": [
              "absence",
              "being away from home"
            ]
          }
        ]
      },
      {
        "slug": "留守番",
        "japanese": [
          {
            "word": "留守番",
            "reading": "るすばん"
          }
        ],
        "senses": [
          {
            "english_definitions": [
              "care-taking",
              "house-sitting",
              "house-watching",
              "staying at home"
            ]
          },
        ]
      },
      {
        "slug": "リズム",
        "japanese": [
          {
            "reading": "リズム"
          },
          {
            "reading": "ルズム"
          }
        ],
        "senses": [
          {
            "english_definitions": [
              "rhythm"
            ]
          },
        ]
      }
    ];

    it("filters by the character given", () => {
      const char = "る";
      const result = filterByChar(char, results);
      expect(
        result.map(
          el => el.japanese[0].reading.substr(0, 1)
        )
      )
        .not.toContain("リ");
    });

    it("returns the expected array of JoshiElement", () => {
      const char = "る";
      const result = filterByChar(char, results)
      expect(
        result.map(el => el.slug)
      ).toEqual(
        ["留守", "留守番"]
      );
    });

    it("converts Katakana to Hiragana", () => {
      const char = "ル";
      const result = filterByChar(char, results);
      expect(
        result.map(el => el.japanese[0].reading.substr(0, 1))
      ).toEqual(
        ["る", "る"]
      );
    });

    it("doesn't fail when the element's japanese object doesn't have a 'reading' prop", () => {
      const char = "る";
      const extendedResults = [
        ...results,
        {
          slug: "ルール",
          japanese: [{ word: "ルール" }],
          senses: [
            { english_definitions: ["rule"] }
          ]
        }
      ];
      const result = filterByChar(char, extendedResults);
      expect(
        result.map(el => el.japanese[0].reading.substr(0, 1))
      ).toEqual(
        ["る", "る"]
      );
    });
  });
});