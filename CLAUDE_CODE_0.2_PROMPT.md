# CLAUDE_CODE_0.2_PROMPT.md

Lies zuerst vollständig:

- MVP_SPEC_V1.md
- ARCHITECTURE.md
- DECISIONS.md
- RELEASE_0.2_SPEC.md

Bevor du Code schreibst:

1. Analysiere die bestehende Codebasis.
2. Identifiziere alle notwendigen Änderungen für Release 0.2.
3. Erstelle einen kurzen Umsetzungsplan.
4. Vermeide Refactoring bestehender funktionierender Komponenten, sofern nicht zwingend notwendig.

WICHTIG:

- Nutze so wenige Credits wie möglich.
- Arbeite inkrementell.
- Implementiere ausschließlich Release 0.2.
- Füge keine zusätzlichen Features hinzu.
- Treffe keine eigenen Produktentscheidungen.
- Halte bestehende Architektur und Datenmodelle ein.
- Bevorzuge Erweiterungen gegenüber Umbauten.

---

# Git Workflow

Arbeite niemals direkt auf main.

Erstelle zuerst:

release/0.2-test

oder

feature/release-0.2

als neue Branch.

Alle Änderungen erfolgen ausschließlich auf dieser Branch.

Vor jedem größeren Umbau:

- prüfen ob bestehende Funktionalität betroffen ist
- minimalinvasiven Weg bevorzugen

Nach Fertigstellung:

- lokale Tests durchführen
- Build ausführen
- Typfehler beseitigen
- Lint-Fehler beseitigen

Danach:

Erstelle eine Zusammenfassung:

- Welche Dateien wurden geändert
- Welche neuen Dateien wurden erstellt
- Welche Firestore-Felder wurden ergänzt
- Welche Risiken bestehen noch
- Welche Funktionen manuell getestet werden sollten

Anschließend:

- Änderungen commitbereit hinterlassen
- Noch NICHT nach main mergen

---

# Scope Release 0.2

Implementiere ausschließlich:

## 1. Einkaufslisten

- mehrere Einkaufslisten pro Familie
- Einkaufslisten erstellen
- Einkaufslisten bearbeiten
- Einkaufslisten löschen

### Shopping Items

- erstellen
- bearbeiten
- löschen
- übernehmen
- kaufen

Status:

- offen
- übernommen
- gekauft

Ein Item kann immer nur einer Person zugeordnet sein.

Bei Übernahme:

- Aufwand muss erfasst werden
- persönlicher Task wird erzeugt

Dashboard zeigt nur die eigenen übernommenen Einkaufsaufgaben.

---

## 2. Familienansicht

2x2 Raster:

- Mitglieder
- Familientermine
- Familienaufgaben
- Einkaufslisten

### Mitgliederansicht

Erste Ebene:

Nur aktueller Status.

Beim Klick:

- nächster Termin
- offene Familienaufgaben

anzeigen.

---

## 3. Statussystem

Status-Priorität:

1. Manuelle Überschreibung
2. Terminstatus
3. Standardstatus

Wenn Termin eine Location besitzt:

Status = Location

Wenn keine Location vorhanden:

Status = Beschäftigt

Manuelle Eingaben:

- Zuhause
- Freitext

Manuelle Status können:

- permanent
- zeitlich begrenzt

sein.

Nach Ablauf:

zur automatischen Logik zurückkehren.

---

## 4. Wiederkehrende Aufgaben

Unterstützen:

- täglich
- wöchentlich
- monatlich
- jährlich
- benutzerdefiniert

Zusätzlich:

- feste Zuweisung
- rotierende Zuweisung

Keine unendliche Generierung.

Nur begrenzte Vorausgenerierung.

Vor Serienende:

Dashboard-Hinweis anzeigen.

---

## 5. Deadline-Konfliktwarnungen

Erkennen:

Deadline einer Aufgabe fällt in einen Termin.

Warnung bei:

- Erstellung eines Termins
- Erstellung einer Aufgabe

Warnung auf:

- Dashboard
- Kalender

WICHTIG:

Niemals automatisch verändern.

Nur warnen.

---

# Nicht implementieren

NICHT Bestandteil von Release 0.2:

- Projekte
- Projektdashboard
- Space-Verwaltung
- Google Kalender Sync
- Outlook Sync
- Apple Sync
- Push Notifications
- Newsfeed
- KI Funktionen
- automatische Zeitplanung
- automatische Terminvorschläge

---

# Abschluss

Nach der Implementierung:

1. Build erfolgreich ausführen
2. TypeScript prüfen
3. Lint prüfen
4. Responsive Verhalten prüfen
5. Changelog erstellen

Danach stoppen.

Nicht automatisch mit main mergen.

Nicht automatisch weitere Features beginnen.