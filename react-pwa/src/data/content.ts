export const CONTENT_INTEGRITY = {
  sourceFile: "src/legacy-app.js",
  questionCount: 3100,
  quizzDavidSeidlCount: 1005,
  examSets: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
  storageKey: "sy701-react-progress-v1"
} as const;

// The initial React migration intentionally imports src/legacy-app.js unchanged.
// That file contains the current question bank, guide topics, PBQs, flashcards,
// ports, exam generation, scoring, and UI behavior. Keeping it byte-for-byte
// aligned with the root app is the guardrail that prevents content drift.
