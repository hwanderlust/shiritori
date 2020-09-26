import fetch from "node-fetch";

type DebugMode = "normal" | "debug";

function get(el): HTMLElement {
  return document.getElementById(el);
}

function apiRequest(path: string, options): Promise<any> {
  return fetch(`http://localhost:8080/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
    .then(res => res.json())
    .catch(err => {
      console.error(err);
      return err;
    });
}

function debug(mode: DebugMode = "normal", params: Array<any>) {
  if (mode === "debug") {
    console.debug(...params);
  }
}

function addDarkUnderlay() {
  const underlay = document.createElement("div");
  underlay.id = "darkUnderlay";
  underlay.style.position = "absolute";
  underlay.style.top = "0";
  underlay.style.bottom = "0";
  underlay.style.left = "0";
  underlay.style.right = "0";
  underlay.style.zIndex = "1";
  underlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  document.body.appendChild(underlay);
}

function removeDarkUnderlay() {
  get("darkUnderlay").remove();
}

export {
  DebugMode,
  addDarkUnderlay,
  apiRequest,
  debug,
  get,
  removeDarkUnderlay,
}