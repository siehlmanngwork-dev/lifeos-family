# RELEASE_0.2_SPEC.md

## Ziel von Release 0.2

Release 0.2 erweitert die bestehende Anwendung um die ersten echten Familienfunktionen.

Version 0.1 hat die Grundlage geschaffen:

- Login
- Dashboard
- Kalender
- Aufgaben
- Kategorien
- Familienzugehörigkeit

Version 0.2 soll die tägliche Nutzung innerhalb einer Familie ermöglichen.

Schwerpunkte:

- Einkaufsliste
- Familienansicht
- Statussystem
- Wiederkehrende Aufgaben
- Deadline-Konfliktwarnungen

Die Kernphilosophie bleibt bestehen:

> Die App unterstützt die Planung, trifft jedoch keine Entscheidungen für den Nutzer.

---

# Neue Navigation

Unter Familie erscheint weiterhin:

```text
👥 Mitglieder

📅 Familientermine

✅ Familienaufgaben

🛒 Einkaufslisten
```

Darstellung:

```text
2 x 2 Raster
```

für Mobile und Desktop.

---

# 1. Einkaufslisten

## Ziel

Familienmitglieder sollen gemeinsam Einkäufe planen und Verantwortlichkeiten verteilen können.

---

# Einkaufslisten-Modell

Eine Familie kann mehrere Einkaufslisten besitzen.

Beispiele:

```text
Wocheneinkauf

Baumarkt

Weihnachten

Geburtstag

Urlaub
```

Alle Familienmitglieder können auf alle Einkaufslisten zugreifen.

---

# Einkaufslisten-Eigenschaften

```text
Name

Ersteller

Erstellungsdatum

Items
```

---

# Einkaufseintrag

Eigenschaften:

```text
Titel

Notiz

Zuständiger

Status
```

---

Beispiel:

```text
Milch

Notiz:
2 Liter

Status:
Offen
```

oder

```text
Tomaten

Notiz:
500g
```

Die Notiz ersetzt ein starres Mengenfeld.

---

# Zustände

Ein Einkaufseintrag besitzt genau einen Status.

```text
Offen

Übernommen

Gekauft
```

---

# Verantwortlichkeit

Ein Eintrag kann immer nur einer Person gehören.

Erlaubt:

```text
Milch
→ Max
```

Nicht erlaubt:

```text
Milch
→ Max + Lisa
```

---

# Dashboard-Integration

Wenn ein Nutzer einen Einkauf übernimmt:

```text
Milch

Status:
Übernommen

Verantwortlich:
Max
```

entsteht automatisch ein persönlicher Task.

Zusätzliche Eigenschaft:

```text
Geschätzter Aufwand
```

muss angegeben werden.

---

Danach erscheint im persönlichen Dashboard:

```text
🛒 Milch kaufen
```

---

# Sichtbarkeit

Auch nach der Übernahme bleibt der Eintrag in der Einkaufsliste sichtbar.

Beispiel:

```text
Milch

Zuständig:
Max
```

---

# 2. Familienansicht

## Ziel

Schneller Überblick über die aktuelle Situation der Familie.

---

# Mitgliederansicht

Erste Ebene:

```text
Max

📍 Zuhause
```

oder

```text
Emma

📍 Schule
```

oder

```text
Lisa

🔴 Beschäftigt
```

---

Es wird zunächst ausschließlich der aktuelle Status angezeigt.

---

# Detailansicht

Beim Klick auf ein Familienmitglied:

Anzeige:

```text
Status

Nächster Termin

Offene Familienaufgaben
```

---

Beispiel:

```text
Emma

📍 Schule

Nächster Termin:
Fußballtraining 17:00

Offene Familienaufgaben:
2
```

---

# Datenschutz

Private Aufgaben bleiben privat.

Andere Nutzer sehen lediglich:

```text
Hat offene private Aufgaben
```

nicht jedoch den Inhalt.

---

# 3. Statussystem

## Ziel

Familienmitglieder sollen wissen:

```text
Wo ist die Person?

Ist sie beschäftigt?
```

---

# Statusquellen

Priorität:

## 1

Manuell gesetzter Status

---

## 2

Aktiver Termin

---

## 3

Kein aktiver Termin

---

# Automatische Statuslogik

Wenn aktiver Termin vorhanden:

und

```text
Location gesetzt
```

↓

Status:

```text
📍 Angegebene Location
```

---

Beispiel:

```text
📍 Schule

📍 Büro

📍 Rewe
```

---

Wenn keine Location gesetzt:

```text
🔴 Beschäftigt
```

---

# Manuelle Statusüberschreibung

Mögliche Eingaben:

```text
🏠 Zuhause
```

oder

```text
📍 Freitext
```

Beispiele:

```text
Fitnessstudio

Freunde

Innenstadt
```

---

# Gültigkeit

Manueller Status kann gesetzt werden:

```text
Unbegrenzt
```

oder

```text
Für bestimmte Zeitspanne
```

---

Nach Ablauf:

Rückkehr zur automatischen Logik.

---

# Aufgaben und Status

Wenn ein aktiver Task ausgeführt wird:

und eine manuelle Statussetzung abläuft,

kehrt die Statusanzeige zurück zum aktuell relevanten Task oder Termin.

---

# 4. Wiederkehrende Aufgaben

## Ziel

Regelmäßige Aufgaben automatisieren.

---

# Unterstützte Wiederholungen

```text
Täglich

Wöchentlich

Monatlich

Jährlich

Benutzerdefiniert
```

---

# Benutzerdefiniert

Beispiele:

```text
Alle 2 Wochen

Alle 3 Tage

Alle 6 Monate
```

---

# Gleichbleibende Zuweisung

Beispiel:

```text
Müll rausbringen

Max

Jede Woche
```

Neue Aufgaben behalten dieselbe Person.

---

# Rotierende Zuweisung

Optional.

Beispiel:

```text
Max

Lisa

Emma
```

↓

Woche 1:

```text
Max
```

↓

Woche 2:

```text
Lisa
```

↓

Woche 3:

```text
Emma
```

---

# Begrenzte Generierung

Wiederholungen werden nicht unendlich erzeugt.

Stattdessen:

```text
Vordefinierte Anzahl zukünftiger Wiederholungen
```

Beispiel:

```text
10 Wiederholungen
```

---

Wenn die Serie fast endet:

Dashboard-Hinweis:

```text
Soll die Serie verlängert werden?
```

---

# Nicht erledigte Wiederholungen

Wenn eine Aufgabe am Fälligkeitstag noch offen ist:

Abends erscheint Dialog:

```text
Aufgabe nicht erledigt.

Verschieben?

oder

Verwerfen?
```

---

Je nach Auswahl:

```text
Neue Deadline setzen
```

oder

```text
Aufgabe schließen
```

---

# 5. Deadline-Konflikte

## Neuer Konflikttyp

Deadline kollidiert mit Termin.

---

Beispiel:

```text
Steuerunterlagen

Deadline:
16:00
```

und

```text
Meeting

15:00 - 17:00
```

---

Sofortige Warnung:

```text
⚠ Deadline fällt in bestehenden Termin.
```

---

Warnung erscheint:

Beim Erstellen einer Aufgabe.

und

Beim Erstellen eines Termins.

---

# Konfliktanzeige

Anzeige im Dashboard:

```text
⚠ Kritischer Planungskonflikt
```

---

Zusätzlich:

Anzeige im Kalender.

---

# Wichtige Regel

Konflikte verhindern niemals:

```text
Termin
```

oder

```text
Aufgabe
```

Die App warnt lediglich.

---

# Neue Firestore Collections

Keine neuen Hauptcollections notwendig.

---

Neue Felder:

## Shopping Lists

```json
{
  "name": "",
  "familyId": "",
  "createdBy": ""
}
```

---

## Shopping Items

```json
{
  "title": "",
  "note": "",
  "assignedTo": "",
  "status": "open"
}
```

---

## Recurring Tasks

Zusätzliche Task-Felder:

```json
{
  "isRecurring": true,

  "recurrenceType": "weekly",

  "rotationEnabled": false
}
```

---

# Nicht Bestandteil von Release 0.2

Nicht implementieren:

❌ Projekte

❌ Projektdashboards

❌ Space-Verwaltung

❌ Google-Kalender-Synchronisation

❌ Outlook-Synchronisation

❌ Apple-Kalender-Synchronisation

❌ Push-Benachrichtigungen

❌ Newsfeed

❌ KI-Funktionen

❌ Automatische Kalenderplanung

❌ Automatische Terminvorschläge

❌ Freizeitreservierung

---

# Erfolgskriterien für Release 0.2

Ein Familienmitglied soll:

✅ sehen können, wo sich andere befinden

✅ Einkäufe gemeinsam organisieren können

✅ Verantwortlichkeiten erkennen können

✅ Wiederkehrende Aufgaben verwalten können

✅ Konflikte frühzeitig erkennen können

ohne die Einfachheit von Release 0.1 zu verlieren.