# CLAUDE_CODE_START_PROMPT.md

Du bist der Lead Software Engineer dieses Projekts.

Lies zuerst vollständig die Dateien:

- MVP_SPEC_V1.md
- ARCHITECTURE.md

Halte dich exakt an diese Spezifikation.

Wenn Spezifikation und eigene Annahmen kollidieren, hat die Spezifikation immer Vorrang.

---

# Projektziel

Baue eine browserbasierte Progressive Web App (PWA) für persönliche Lebensorganisation und Familienkoordination.

Die Anwendung soll Nutzern helfen:

- Aufgaben zu organisieren
- Termine zu verwalten
- Planungskonflikte frühzeitig zu erkennen
- Familienaktivitäten zu koordinieren
- Verantwortlichkeiten transparent zu machen

Die App soll nicht versuchen Entscheidungen für den Nutzer zu treffen.

Sie soll Empfehlungen und Warnungen anzeigen.

---

# Technologiestack

Nutze ausschließlich:

Frontend:
- React
- TypeScript
- Vite

Backend:
- Firebase Authentication
- Firestore

Deployment:
- GitHub Pages

PWA:
- Ja

---

# Architekturprinzipien

1. Komponenten klein halten
2. TypeScript-Typen sauber definieren
3. Firestore-Zugriffe kapseln
4. UI-Komponenten wiederverwendbar bauen
5. Mobile und Desktop unterstützen
6. Erweiterbarkeit wichtiger als Geschwindigkeit
7. Keine unnötigen Libraries installieren

---

# WICHTIG

Baue NICHT die komplette App.

Implementiere nur Release 0.1.

Falls Funktionen für spätere Versionen vorgesehen sind:

- Architektur vorbereiten
- Funktion selbst NICHT implementieren

---

# Release 0.1 Scope

Implementiere ausschließlich:

## Auth

- Google Login
- Login Screen
- Logout

---

## User Setup

- Nutzer anlegen
- Nutzerprofil laden
- Nutzerprofil speichern

---

## Familienverwaltung

- Familie erstellen
- Familiencode generieren
- Familie beitreten über Familiencode

---

## Dashboard

Zeige:

- Begrüßung
- Aktuelles Datum
- Wichtigste Aufgabe
- Nächster Termin
- Konfliktbereich (Platzhalter)
- Heute
- Morgen
- Diese Woche
- Kapazitätsanzeige

Konfliktlogik zunächst als Placeholder-Komponente.

---

## Kalender

Implementiere:

- Tagesansicht
- Wochenansicht
- Monatsansicht

Funktionen:

- Termin erstellen
- Termin bearbeiten
- Termin löschen

Eigenschaften:

- Titel
- Startdatum
- Enddatum
- Kategorie
- Location
- Privat

Google-Kalender-Synchronisation noch nicht implementieren.

Nur Architektur vorbereiten.

---

## Aufgaben

Implementiere:

- Aufgabe erstellen
- Aufgabe bearbeiten
- Aufgabe löschen
- Aufgabe abschließen

Pflichtfelder:

- Titel
- Verantwortlicher
- Deadline
- Priorität
- Kategorie
- Aufwand
- Space

Optionale Felder:

- Beschreibung
- Erinnerung

---

## Kategorien

Implementiere:

- Kategorie erstellen
- Kategorie bearbeiten
- Kategorie löschen

Eigenschaften:

- Name
- Farbe
- Optionales Icon

---

## Berechtigungen

Implementiere Grundstruktur.

Rechte müssen in Firestore gespeichert werden.

Komplexe Adminoberfläche noch nicht notwendig.

---

# NICHT implementieren

Folgende Features NICHT bauen:

❌ Projekte

❌ Einkaufsliste

❌ Wiederkehrende Aufgaben

❌ Space-Verwaltung

❌ Google Kalender Import

❌ Outlook Integration

❌ Apple Kalender Integration

❌ Statussystem

❌ Standortsystem

❌ Newsfeed

❌ Benachrichtigungen

❌ Push Notifications

❌ Konfliktberechnung

❌ Automatische Planung

❌ Zeitvorschläge

❌ KI-Funktionen

❌ Analytics

❌ Chat

❌ Dateiupload

---

# Firestore Collections

Lege bereits jetzt folgende Collections an:

users

families

tasks

events

categories

permissions

settings

Weitere Collections später.

---

# UI Vorgaben

Designphilosophie:

Minimalistisch.

Kein Notion-Klon.

Kein überladenes Dashboard.

---

Dashboard muss innerhalb von 3 Sekunden beantworten:

1. Was ist meine wichtigste Aufgabe?
2. Was ist mein nächster Termin?

---

Desktop:

- Kartenlayout
- Zwei-Spalten-Dashboard

Mobile:

- Responsive
- Untere Navigation

---

# Mobile Navigation

Dashboard

Kalender

Aufgaben

Familie

Neu

Navigation muss zukünftig durch Berechtigungen erweiterbar sein.

---

# Codequalität

Erstelle:

- saubere Interfaces
- Typescript Types
- Services
- Hooks
- Firestore Layer

Kein Firestore Code direkt in UI-Komponenten.

---

# Ordnerstruktur

Verwende die Struktur aus ARCHITECTURE.md.

Falls nötig ergänzen, aber nicht grundsätzlich verändern.

---

# Entwicklungsreihenfolge

Schritt 1:
Projekt initialisieren

Schritt 2:
Firebase konfigurieren

Schritt 3:
Authentication

Schritt 4:
Routing

Schritt 5:
Dashboard

Schritt 6:
Kalender

Schritt 7:
Aufgaben

Schritt 8:
Kategorien

Schritt 9:
Familiencode-System

Schritt 10:
Cleanup & Refactoring

---

# Lieferziel

Erzeuge einen professionellen, funktionsfähigen MVP 0.1.

Der Fokus liegt auf:

- Stabilität
- Erweiterbarkeit
- sauberem Datenmodell

NICHT auf Featureumfang.

Treffe keine Produktentscheidungen eigenständig.

Wenn Anforderungen unklar sind:

- Architektur offen halten
- keine zusätzlichen Features erfinden
- bestehende Spezifikation respektieren