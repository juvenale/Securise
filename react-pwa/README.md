# SY0-701 React PWA

Nouvelle version React + Vite + TypeScript + PWA de l'app SY0-701.

L'app historique reste disponible a la racine du projet. Cette version charge le contenu actuel sans modifier les textes, IDs, reponses, explications, PBQ, ports, flashcards ou examens.

## Commandes

```powershell
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
npm run check:content
```

`npm install` necessite une connexion Internet si les dependances ne sont pas deja en cache local.

## Stockage

La progression utilise toujours la cle `sy701-react-progress-v1` dans `localStorage` pour rester compatible avec l'ancienne app. La version React recopie aussi cette progression dans IndexedDB, puis continue a ecrire dans les deux stockages.

## Fonctions ajoutees

- Recherche globale locale sur QCM, explications, flashcards, ports, PBQ et objectifs.
- Smart Practice de 20 questions base sur erreurs recentes, objectifs faibles, questions jamais vues et difficulte.
- Dashboard analytique avec tendance 7 jours, progression par type et temps moyen par question.
- Revision post-examen avec session ciblee sur questions ratees, non repondues, PBQ echoues et objectifs lies.

## Contenu

Le fichier `src/legacy-app.js` est une copie de l'app actuelle et sert de source de contenu stable pour cette premiere migration. Le controle `npm run check:content` verifie les invariants principaux:

- 1,076 QCM actifs
- 540 questions Domain Practice
- 108 PBQ
- 519 flashcards
- 69 ports
- examens A-J a 90 questions
- examens D-J avec 5 PBQ chacun
