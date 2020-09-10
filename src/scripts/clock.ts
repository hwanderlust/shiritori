import { get } from "./helpers"

const allowedTime = 30;

export default function Clock() {
  const clockEl: HTMLElement = get("clock");
  let currentTime = allowedTime;
  let interval;

  return {
    countdown: function (): void {
      interval = setInterval(() => {
        currentTime--;
        if (currentTime < 0) {
          this.stop();
          return;
        }
        clockEl.innerText = `0:${currentTime}`;
      }, 1000)
    },
    reset: function (): void {
      currentTime = allowedTime;
      this.stop();
      setTimeout(() => {
        clockEl.innerText = `0:${currentTime}`;
        this.countdown();
      }, 200);
    },
    getTime: function (): number {
      // use when clock runs out? then show red screen etc
      return currentTime;
    },
    stop: function (): void {
      clearInterval(interval);
    }
  }
}