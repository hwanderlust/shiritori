import { get } from "../helpers"

const defaultTime = 10;

export default function Clock() {
  window.sessionStorage.setItem("time", `${defaultTime}`);
  const clockEl: HTMLElement = get("clock");
  let currentTime = defaultTime;
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
      const allowedTime = Number(window.sessionStorage.getItem("time"));
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