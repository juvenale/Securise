export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol === "file:") return;
  if (["localhost", "127.0.0.1", "::1"].includes(location.hostname)) {
    navigator.serviceWorker.getRegistrations?.().then((registrations) => registrations.forEach((registration) => registration.unregister()));
    return;
  }
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
