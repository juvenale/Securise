import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { CONTENT_INTEGRITY } from "./data/content";
import { QUIZZ_DAVID_SEIDL_QUESTIONS } from "./data/quizzDavidSeidl";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import { hydrateLocalStorageFromIndexedDb, installProgressMirror } from "./storage/progressStorage";

window.React = React;
window.ReactDOM = { createRoot };
(window as typeof window & { QUIZZ_DAVID_SEIDL_QUESTIONS: typeof QUIZZ_DAVID_SEIDL_QUESTIONS }).QUIZZ_DAVID_SEIDL_QUESTIONS = QUIZZ_DAVID_SEIDL_QUESTIONS;

registerServiceWorker();

async function prepareProgressStorage(): Promise<void> {
  installProgressMirror();
  await Promise.race([
    hydrateLocalStorageFromIndexedDb(),
    new Promise<void>((resolve) => window.setTimeout(resolve, 800))
  ]);
}

async function bootApp(): Promise<void> {
  try {
    await prepareProgressStorage();
  } catch {
    // Rendering should never depend on optional persistence setup.
  }
  window.dispatchEvent(new CustomEvent("sy701:content-ready", { detail: CONTENT_INTEGRITY }));
  await import("./legacy-app.js");
}

void bootApp();
