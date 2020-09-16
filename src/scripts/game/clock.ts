import { get } from "../helpers"

const allowedTime = 30;

export default function Clock() {
  const clockEl: HTMLElement = get("clock");
  let currentTime = allowedTime;
  let interval;
  let callBuzzer: () => void;

  return {
    init: function (cb): void {
      callBuzzer = cb;
    },
    countdown: function (): void {
      interval = setInterval(() => {
        currentTime--;

        if (currentTime === 0) {
          callBuzzer();
        }

        if (currentTime < 0) {
          this.stop();
          clockEl.innerText = `0:00`;
          return;
        }

        if (currentTime < 10) {
          clockEl.innerText = `0:0${currentTime}`;
          return;
        }

        clockEl.innerText = `0:${currentTime}`;
      }, 1000);
    },

    reset: function (): void {
      currentTime = allowedTime;
      this.stop();
      setTimeout(() => {
        clockEl.innerText = `0:${currentTime}`;
        this.countdown();
      }, 200);
    },

    stop: function (): void {
      clearInterval(interval);
    }
  }
}