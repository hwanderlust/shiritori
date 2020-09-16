type DebugMode = "normal" | "debug";

function get(el): HTMLElement {
  return document.getElementById(el);
}

function apiRequest(path: string, options): Promise<any> {
  return fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
    .then(res => res.json());
}

function debug(mode: DebugMode = "normal", params: Array<any>) {
  if (mode === "debug") {
    console.debug(...params);
  }
}

export {
  DebugMode,
  apiRequest,
  debug,
  get,
}