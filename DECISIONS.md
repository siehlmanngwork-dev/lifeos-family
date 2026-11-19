# DECISIONS.md

Verbindliche Produkt- und Technikentscheidungen. Bei Widerspruch zu älteren Dokumenten gilt diese Datei.

---

## Release 0.1

| Thema | Entscheidung |
|---|---|
| Spaces | Nur „Personal“ und „Family“ fest eingebaut; Space-Verwaltung später. |
| Familien-ID | Dokument-ID der Familie = Familiencode (`FAM-XXXX-XXXX`). Familien können nicht aufgelistet werden. |
| Berechtigungen | Keine Rollen. Standardwerte aus ARCHITECTURE.md; Änderungen nur durch Nutzer mit `admin: true`. |
| Wichtigste Aufgabe | Priorität → Deadline (früheste zuerst, „Irgendwann“ zuletzt) → größerer Aufwand. |

---

## Release 0.2

### D1 – Speicherort Einkaufslisten
Listen als Subcollection `families/{familyId}/shoppingLists`. Items in der bestehenden Collection `shoppingItems` mit `listId`. Keine neue Hauptcollection.

### D2 – Task bei Übernahme eines Einkaufs-Items
- Deadline: wird beim Übernehmen abgefragt (zusammen mit dem Pflicht-Aufwand).
- Priorität: Normal.
- Kategorie: feste Kategorie „Einkauf“, wird automatisch angelegt, falls nicht vorhanden.
- Space: Personal.

### D3 – Status „Gekauft“
- Aufgabe und Item sind in beide Richtungen verknüpft: Aufgabe erledigt ⇄ Item gekauft.
- Jedes Familienmitglied darf „Gekauft“ setzen.

### D4 – Deadline-Uhrzeit
Optional. Aufgaben ohne Uhrzeit oder mit „Irgendwann“ bleiben erlaubt. Konflikte werden nur geprüft, wenn eine Uhrzeit vorhanden ist.

### D5 – Familientermine
Das Terminformular erhält die Auswahl Personal / Family. Weitere Spaces später.

### D6 – Lesbarkeit von Terminen in der Familie
- Familientermine sind für alle Familienmitglieder lesbar.
- Persönliche Termine sind nur für den Ersteller lesbar.
- Für Status und „Nächster Termin“ wird pro Termin ein separater Eintrag ohne geschützte Inhalte gespeichert.
- Private Termine: andere sehen nur „Beschäftigt“; Inhalte sind technisch nicht lesbar.

#### R1 – Inhalt der Busy-Einträge (`families/{familyId}/busyBlocks`)
- Private Termine legen für andere niemals Titel oder Location offen: nur Zeitraum + „Beschäftigt“.
- Nicht private persönliche Termine: Titel, Location und Zeitraum.

### D7 – Hinweis „Hat offene private Aufgaben“
Entfällt in 0.2 (Komplexität sparen).

### D8 – Statusquellen
Status kommt nur aus manueller Angabe und Terminlogik. Keine „aktiven Tasks“ in 0.2.

### D9 – Anzahl erzeugter Wiederholungen
Beim Erstellen einstellbar, Standardwert 10.

### D10 – Abend-Dialog für unerledigte Aufgaben
- Uhrzeit vom Nutzer frei einstellbar.
- Gilt nur für wiederkehrende Aufgaben.
- „Verwerfen“ ist ein eigener Status `discarded` und zählt nicht als erledigt.
- R2: Standarduhrzeit 20:00, änderbar unter Einstellungen.

### D11 – Aufgaben anderen zuweisen
Bleibt ein individuelles Recht (`assignTasksToOthers`). Keine Rollen, keine automatischen Standardrechte. Feste/rotierende Zuweisung an andere nur mit diesem Recht.

### D12 – Lint
ESLint wird als Entwicklungsabhängigkeit eingerichtet.
