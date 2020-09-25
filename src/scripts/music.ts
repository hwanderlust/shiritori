import { get } from "./helpers";
require("../images/music-pause.png");
require("../music/YOASOBI - 夜に駆ける.mp3");
require("../music/SCANDAL - Stamp.mp3");
require("../music/ヨルシカ - ただ君に晴れ.mp3");
require("../music/ちゃんみな - Lady.mp3");
require("../music/NiziU - Make you happy.mp3");
require("../music/Yui - Again.mp3");

export default function Music(): void {
  const player = get("musicPlayer") as HTMLMediaElement;
  const playPauseBtn = get("musicPlayBtn");
  const nextBtn = get("musicNextBtn");
  let index = 0;

  player.src = `${baseUrl}/${songs[index]}`;

  player.addEventListener("ended", _ => {
    index = nextSong(player, index);
  });

  playPauseBtn.addEventListener("click", _ => {
    playPauseSong(player, index);
  });

  nextBtn.addEventListener("click", _ => {
    index = nextSong(player, index);
  });
}

const baseUrl = "http://localhost:8080/assets";
const yoasobi = "YOASOBI - 夜に駆ける.mp3";
const yoroshika = "ヨルシカ - ただ君に晴れ.mp3";
const scandal = "SCANDAL - Stamp.mp3";
const chanmina = "ちゃんみな - Lady.mp3";
const niziu = "NiziU - Make you happy.mp3";
const yui = "Yui - Again.mp3";
const songs = [yoasobi, yoroshika, scandal, niziu, chanmina, yui];

function nextSong(player: HTMLMediaElement, index: number): number {
  const title = get("musicTitle");

  if (index + 1 === songs.length) {
    index = 0;
  } else {
    index++;
  }

  player.src = `${baseUrl}/${songs[index]}`;
  const song = songs[index];
  title.innerText = song.substr(0, song.length - 4);
  player.play();
  return index;
}

function playPauseSong(player: HTMLMediaElement, index: number): void {
  const playPauseBtn = get("musicPlayBtn");
  const nextBtn = get("musicNextBtn");
  const icon = playPauseBtn.firstElementChild as HTMLImageElement;
  const title = get("musicTitle");

  if (player.paused) {
    player.play();
    icon.src = `${baseUrl}/music-pause.png`;
    title.innerText = removeExtension(songs[index]);

    if (nextBtn.classList.contains("next-btn")) {
      nextBtn.classList.remove("next-btn");
    }
    return;
  }

  player.pause();
  icon.src = `${baseUrl}/music-play.png`;
}

/**
 * Remove .mp3
 */
function removeExtension(songTitle: string): string {
  return songTitle.substr(0, songTitle.length - 4);
}