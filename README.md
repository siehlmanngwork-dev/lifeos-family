# LifeOS Family — Release 0.1

React + TypeScript + Vite PWA mit Firebase Authentication und Firestore.
Spezifikation: `MVP_SPEC_V1.md`, `ARCHITECTURE.md`, `CLAUDE_CODE_START_PROMPT.md`.

## Einrichtung

1. Firebase-Projekt: **Authentication → Google** aktivieren, **Firestore** anlegen.
2. `.env.example` nach `.env.local` kopieren und die Web-App-Werte eintragen.
3. Firestore-Regeln aus `firestore.rules` veröffentlichen (Konsole → Firestore → Regeln,
   oder `firebase deploy --only firestore:rules`).
4. `npm install` und `npm run dev`.

## Deployment (GitHub Pages)

`npm run build` erzeugt `dist/`. Inhalt von `dist/` auf GitHub Pages veröffentlichen
(relativer `base` + HashRouter → läuft unter jedem Repository-Pfad).
Die Pages-Domain unter **Authentication → Settings → Authorized domains** eintragen.

## Berechtigungen

`permissions/{userId}` wird bei der ersten Anmeldung mit den Standardwerten aus
ARCHITECTURE.md angelegt. Änderungen sind nur für Nutzer mit `admin: true` erlaubt;
eine Adminoberfläche folgt in einer späteren Version (bis dahin über die Firebase-Konsole).

## Struktur

```text
src/
├── app/        router, providers (Session), layouts (Navigation)
├── pages/      Dashboard, Calendar, Tasks, Family, Settings, Login
├── components/ dashboard, calendar, tasks, family, settings, shared
├── services/   auth, firestore (gesamter Datenzugriff), permissions, calendar (Provider-Schnittstelle), dashboard (Engine)
├── hooks/      Session- und Daten-Hooks
├── models/     TypeScript-Typen
├── utils/      Datum, Familiencode
└── firebase/   Initialisierung
```
