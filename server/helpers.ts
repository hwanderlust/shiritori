import { Next, Request, Response } from 'express';

interface JoshiResponse {
  data: Array<JoshiElement>;
}
interface JoshiElement {
  slug: string;
  japanese: Array<JapaneseEntry>;
  senses: Array<Sense>;
}
interface JapaneseEntry {
  reading?: string;
  word?: string;
}
interface Sense {
  english_definitions: Array<string>;
  sentences: Array<string>;
}

interface ApiResponse {
  found: boolean;
  entry: ApiEntry;
}
interface ApiEntry {
  slug: string;
  japanese: JapaneseEntry;
  english: Array<string>;
}

function findAndSendMatch(query: string, receivedResp: JoshiResponse, res: Response): boolean {
  for (const i in receivedResp.data) {
    const searchResult = findWord(query, receivedResp.data[i]);
    console.log(`searchResult: `, receivedResp.data[i]);

    if (searchResult !== undefined) {
      const element = receivedResp.data[i];
      res.send(createFoundResponse(element, searchResult));
      return true;
    }
  }

  return false;
}

function findWord(query: string, potentialResult: JoshiElement): JapaneseEntry | undefined {
  return potentialResult.japanese.find(
    el => matchReading(query, el?.reading) || matchWord(query, el?.word)
  );
}

function createFoundResponse(element: JoshiElement, searchResult: JapaneseEntry): ApiResponse {
  const index = element.japanese.findIndex(
    el => el?.reading.localeCompare(searchResult?.reading) === 0 || el?.word.localeCompare(searchResult?.word) === 0
  );
  const japanese = element.japanese[index];
  const english = element.senses[0].english_definitions;
  const entry = {
    slug: element.slug,
    japanese,
    english,
  }
  return { found: true, entry };
}

function matchReading(query: string, reading: string | undefined): boolean {
  return reading?.localeCompare(query) === 0;
}
function matchWord(query: string, word: string | undefined): boolean {
  return word?.localeCompare(query) === 0;
}

function logger(req: Request, _, next: Next) {
  if (req.method !== "POST" && req.url !== "/search") {
    console.log(req.method, req.url, req.body);
    next();
    return;
  }

  console.log(req.method, req.url, decodeURI(req.body.query));
  next();
}

export {
  findAndSendMatch,
  logger,
}