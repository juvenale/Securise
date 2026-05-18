This directory is reserved for the component-by-component React rewrite.

For the first migration pass, `src/legacy-app.js` is loaded under official React
so that the current app content and behavior remain unchanged. Future refactors
can move Dashboard, Quiz, PBQ, Flashcards, Ports, Weak Areas, and Exam into this
folder one at a time while keeping the same data IDs and storage contracts.
