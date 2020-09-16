export function get(el): HTMLElement {
  return document.getElementById(el);
}

export function apiRequest(path: string, options): Promise<any> {
  return fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
    .then(res => res.json());
}