# Security+ SY0-701 Exam Prep App

Open `index.html` in a browser.

## Android PWA install

The app is now PWA-ready. To install it on Android, serve this folder over HTTP or HTTPS, open the URL in Chrome, then use **Add to Home screen** or **Install app**.

Important: PWA installation and offline caching do not work from a direct `file://` URL. For local testing, start a small local server from this folder, then open the server URL on the phone.

On Windows, run `start-pwa-server.ps1` from this folder. It prints the Android URL to open in Chrome.

## Current version

- React-style single-page app with tab navigation.
- Self-contained local launch with no CDN or internet dependency.
- PWA manifest, service worker, and local Android icons for installable offline use.
- Dark mobile-responsive interface.
- Dashboard with five SY0-701 domains and official weights.
- Countdown to May 20, 2026.
- Quiz engine with English CompTIA-style questions and French explanations.
- Domain Practice bank with 540 dedicated questions, including added Domain 4 and Domain 5 sets.
- PBQ simulator with firewall/ACL rules, log analysis, matching, topology placement, IAM configuration, ordering, implicit deny, and partial credit.
- Flashcards with 327 SY0-701 acronyms, French definitions, English full names, examples, objectives, search, domain filters, and spaced-repetition weighting.
- Ports and protocols drill with speed and accuracy tracking.
- Weak-area review grouped by sub-objective.
- Dedicated Exam A through Exam F simulations with 90 items each, 90-minute timers, domain proportions, and no feedback until final review. Exams D, E, and F include PBQs.
- Progress is saved in `localStorage`.

## Seed data

The app now includes 3,100 practice questions, with at least 100 quiz questions for every available SY0-701 sub-objective and balanced coverage across the official domains. The same source structure also enriches concept flashcards, PBQs, ports/protocols, weak-area explanations, and exam simulations.

## React/Vite version

A modern React + Vite + TypeScript PWA version lives in `react-pwa/`. The root app remains available as the stable local fallback.

From `react-pwa/`:

- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run preview`
- `npm run check:content`

The React/Vite version loads the current content without changing question, PBQ, flashcard, port, exam, explanation, score, or storage IDs. It reads existing progress from `localStorage` key `sy701-react-progress-v1` and mirrors future progress to IndexedDB plus `localStorage`.
