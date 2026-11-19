# Changelog

## 0.2.0 – unveröffentlicht (Branch `release/0.2-test`)

Grundlage: `RELEASE_0.2_SPEC.md`, Entscheidungen in `DECISIONS.md` (D1–D12, R1–R2).

### Neu
- **Einkaufslisten:** mehrere Listen pro Familie (anlegen, umbenennen, löschen); Einträge mit Titel und Notiz; Status Offen / Übernommen / Gekauft; genau eine zuständige Person.
- **Übernehmen:** Aufwand und Deadline sind Pflicht; es entsteht die persönliche Aufgabe „🛒 … kaufen“ (Priorität Normal, Kategorie „Einkauf“ wird automatisch angelegt).
- **Gekauft ⇄ Erledigt:** Item und Aufgabe sind in beide Richtungen verknüpft; jedes Familienmitglied darf „Gekauft“ setzen.
- **Familienansicht:** 2×2-Raster mit Mitgliedern, Familienterminen, Familienaufgaben und Einkaufslisten.
- **Mitglieder:** erste Ebene nur Status; Detail mit Status, nächstem Termin und offenen Familienaufgaben.
- **Termine Personal/Family:** Auswahl im Terminformular; nicht private Familientermine sind für die Familie sichtbar und nur vom Ersteller änderbar.
- **Statussystem:** manueller Status (🏠 Zuhause / 📍 Freitext, unbegrenzt oder bis Zeitpunkt) → aktiver Termin (📍 Location / 🔴 Beschäftigt) → kein aktiver Termin. Eigener Status in der oberen Leiste.
- **Busy-Einträge:** `families/{id}/busyBlocks` machen persönliche und private Termine für Status und „Nächster Termin“ sichtbar; private Termine nur als Zeitraum.
- **Deadline-Uhrzeit:** optional.
- **Deadline-Konflikte:** „⚠ Deadline fällt in bestehenden Termin“ in Aufgaben- und Terminformular, „⚠ Kritischer Planungskonflikt“ auf dem Dashboard, Markierung im Kalender. Nur Warnungen, nichts wird automatisch geändert.
- **Wiederkehrende Aufgaben:** täglich, wöchentlich, monatlich, jährlich, benutzerdefiniert (alle N Tage/Wochen/Monate); begrenzte Anzahl (Standard 10, einstellbar); feste oder rotierende Zuweisung (Rotation nur mit `assignTasksToOthers`).
- **Serienende:** Dashboard-Hinweis „Soll die Serie verlängert werden?“ (Verlängern / Nein).
- **Abend-Dialog:** offene wiederkehrende Aufgaben ab einstellbarer Uhrzeit (Standard 20:00): Verschieben oder Verwerfen.
- **Status „Verworfen“:** zählt nicht als erledigt, erscheint im Archiv.
- **Einstellungen:** Uhrzeit des Abend-Dialogs.
- **Tooling:** ESLint (`npm run lint`).

### Geändert
- Kalender und Dashboard zeigen zusätzlich nicht private Familientermine anderer Mitglieder.
- Session-Kontext in eigene Datei verschoben (nur für Lint, Verhalten unverändert).

### Firestore
- Neu: `families/{familyId}/shoppingLists`, `families/{familyId}/busyBlocks`.
- Genutzt: `shoppingItems` (bisher reserviert).
- Neue Felder: siehe `RELEASE_0.2_SUMMARY.md`.
- `firestore.rules` erweitert; muss in der Firebase-Konsole veröffentlicht werden.

## 0.1.0

Erste Version: Google-Login, Nutzerprofil, Familie mit Familiencode, Dashboard, Kalender (Tag/Woche/Monat), Aufgaben, Kategorien, Berechtigungen, PWA.
