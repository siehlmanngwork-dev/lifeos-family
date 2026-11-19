# Umsetzungsplan Release 0.2

Branch: `release/0.2-test` · Basis: Commit `43ddf52` (Release 0.1)

Grundlage: `RELEASE_0.2_SPEC.md`, `DECISIONS.md` (D1–D12), `CLAUDE_CODE_0.2_PROMPT.md`, `MVP_SPEC_V1.md`, `ARCHITECTURE.md`.

---

## 1. Restliche Detailfragen (nicht blockierend für Schritt 1–3)

| # | Frage | Vorschlag |
|---|---|---|
| R1 | D6: Was enthält der „Beschäftigt“-Eintrag eines **nicht privaten** persönlichen Termins? Die Spezifikation zeigt beim Status die Location („📍 Schule“) und im Detail den Titel („Fußballtraining 17:00“). | Nicht privat: Titel, Location, Zeiten. Privat: nur Zeiten → „Beschäftigt“. Entspricht MVP §17 („Standard: sichtbar“). |
| R2 | D10: Standarduhrzeit für den Abend-Dialog, bevor der Nutzer sie einstellt? | 20:00, änderbar unter Einstellungen. |

---

## 2. Firestore-Erweiterungen

### Einkaufslisten (D1)
```text
families/{familyId}/shoppingLists/{listId}
{ name, familyId, createdBy, createdAt }
```

### `shoppingItems` (bestehende, bisher reservierte Collection)
```text
{ title, note, listId, familyId,
  status: "open" | "claimed" | "bought",
  assignedTo: uid | null,
  estimatedDuration: number | null,   // Pflicht bei Übernahme
  taskId: string | null,              // verknüpfter persönlicher Task (D3)
  createdBy, createdAt }
```

### Status-Einträge zu Terminen (D6)
```text
families/{familyId}/busyBlocks/{eventId}
{ ownerId, startDateTime, endDateTime,
  title: string | null,      // null bei privaten Terminen (R1)
  location: string | null }  // null bei privaten Terminen (R1)
```
Wird im selben Batch wie der Termin geschrieben/gelöscht. Nur für persönliche Termine nötig; Familientermine sind direkt lesbar.

### `events`
Keine neuen Felder. `spaceId` wird wählbar (D5); bei `family` wird `familyId` gesetzt.

### `tasks` – neue Felder
```text
status: "open" | "done" | "discarded"   // D10: neuer Status
deadlineTime: "HH:mm" | null            // D4, optional
shoppingItemId: string | null           // D3
// Wiederholung (Feldnamen laut Spezifikation + nötige Ergänzungen)
isRecurring: boolean                    // existiert bereits
recurrenceType: "daily" | "weekly" | "monthly" | "yearly" | "custom" | null
recurrenceInterval: number | null       // custom: alle N …
recurrenceUnit: "days" | "weeks" | "months" | null
rotationEnabled: boolean
rotationMembers: uid[]
seriesId: string | null
occurrenceIndex: number | null
seriesLength: number | null             // D9, Standard 10
```
Deterministische IDs `${seriesId}_${index}` verhindern doppelte Vorkommen.

### `users` – neues Feld
```text
manualStatus: { type: "home" | "custom", label: string, expiresAt: string | null } | null
```

### `settings` – neues Feld
```text
overdueDialogTime: "HH:mm"   // D10, Standard laut R2
```

### `categories`
Keine neuen Felder. Kategorie „Einkauf“ wird bei der ersten Übernahme für den Nutzer angelegt (D2).

### Firestore-Rules
- `shoppingLists`, `shoppingItems`: Zugriff für alle mit `familyId == myFamilyId()`. Übernahme nur für sich selbst; „Gekauft“ darf jedes Familienmitglied setzen (D3).
- `busyBlocks`: lesen für Familienmitglieder, schreiben nur durch `ownerId`.
- `events.read`: zusätzlich Familientermine (`spaceId == 'family'`, `familyId == myFamilyId()`).
- `tasks`: neue Felder und Status `discarded` in `validTask`; Item-Verknüpfung erlaubt Update durch Familienmitglieder nur beim Status.
- `users.update`: `manualStatus` zulassen.

---

## 3. Neue Komponenten und Module

**Models:** `shopping.ts`, `status.ts`; `task.ts` (Status, Uhrzeit, Wiederholung), `conflict.ts` (`deadline-in-event`), `settings.ts` (`overdueDialogTime`).

**Logik (rein, testbar):**
- `services/recurrence/recurrenceEngine.ts` – Datumsfolge, Rotation
- `services/status/statusEngine.ts` – manuell → aktiver Termin → kein Termin
- `services/dashboard/conflictEngine.ts` – „Deadline in Termin“ statt Platzhalter

**Firestore-Services:**
- neu `shoppingService.ts` – Listen/Items, `claimItem` (Item + Task + ggf. Kategorie im Batch), `markBought` (inkl. Task)
- `taskService.ts` erweitern – Serie anlegen/verlängern, Verschieben, Verwerfen, Item-Sync beim Abhaken
- `eventService.ts` erweitern – Space, Busy-Eintrag im Batch, Familientermine abonnieren
- `userService.ts` erweitern – manueller Status; `settingsService.ts` neu

**Hooks:** `useShoppingLists`, `useShoppingItems`, `useFamilyEvents`, `useBusyBlocks`, `useMemberStatus`, `useSettings`

**Komponenten:**
- `family/FamilyGrid` (2×2), `MembersPanel`, `MemberDetail`, `FamilyEventsPanel`, `FamilyTasksPanel`, `ShoppingPanel`
- `shopping/ShoppingListView`, `ShoppingItemRow`, `ClaimItemDialog` (Aufwand + Deadline Pflicht)
- `status/StatusBadge`, `StatusEditor` (🏠 Zuhause / 📍 Freitext, unbegrenzt / bis Zeitpunkt)
- `tasks/RecurrenceFields` (Typ, Intervall, Anzahl, Rotation nur mit Recht D11)
- `dashboard/SeriesEndNotice`, `dashboard/OverdueRecurringDialog`
- `shared/ConflictWarning` (blockiert nie das Speichern)

---

## 4. UI-Änderungen an Bestehendem (minimalinvasiv)

| Datei | Änderung |
|---|---|
| `pages/Family/FamilyPage.tsx` | Mit Familie: `FamilyGrid` statt `FamilyOverview` (Familiencode bleibt sichtbar) |
| `components/tasks/TaskForm.tsx` | optionale Uhrzeit, Wiederholung/Rotation, Konfliktwarnung |
| `components/calendar/EventForm.tsx` | Space-Auswahl Personal/Family, Konfliktwarnung |
| `components/tasks/TaskItem.tsx` | Uhrzeit, Serien-Kennzeichen, 🛒-Präfix |
| `pages/Tasks/TasksPage.tsx` | Archiv zeigt „Verworfen“ getrennt von „Erledigt“ |
| `pages/Dashboard/DashboardPage.tsx` | „⚠ Kritischer Planungskonflikt“, Serienhinweis, Abend-Dialog |
| `TimeGrid.tsx` / `MonthView.tsx` | Konfliktmarkierung befüllen (`markedEventIds` existiert) |
| `app/layouts/AppLayout.tsx` | eigener Status in der Topbar + StatusEditor |
| `pages/Settings/SettingsPage.tsx` | Uhrzeit des Abend-Dialogs |
| `services/dashboard/dashboardEngine.ts` | Deadline-Uhrzeit berücksichtigen, `discarded` ausschließen |
| `firestore.rules` | siehe Abschnitt 2 |

Hauptnavigation bleibt unverändert.

---

## 5. Risiken

1. **Busy-Einträge veralten (D6):** Termine aus 0.1 und Termine vor einem Familienbeitritt haben noch keinen Eintrag → einmaliger Abgleich beim App-Start nötig.
2. **Kein Backend:** Serien-Verlängerung, Ablauf des manuellen Status und Abend-Dialog laufen in der App; parallele Geräte können kollidieren (deterministische IDs, Batches).
3. **Zweiseitige Verknüpfung Item ⇄ Task (D3):** Ein Familienmitglied setzt „Gekauft“ → der fremde persönliche Task muss erledigt werden. Rules müssen genau diese eine Änderung erlauben, sonst Datenschutzlücke.
4. **Rules-Aufwand:** max. 10 `get()` pro Anfrage; Batch-Regeln mit `getAfter`.
5. **Datumslogik:** Monatsende (31.), 29.02., Sommerzeit.
6. **Neuer Status `discarded`:** Alle Stellen, die `open`/`done` prüfen, müssen ihn kennen (Dashboard, Kapazität, Archiv).
7. **Rotation ohne Recht (D11):** Ohne freigeschaltetes `assignTasksToOthers` ist Rotation nicht nutzbar – UI muss das klar zeigen.
8. **Bestandsdaten:** Felder fehlen bei 0.1-Daten → `undefined` wie `null` behandeln, keine Migration.

---

## 6. Reihenfolge der Implementierung

| Schritt | Inhalt | Größe |
|---|---|---|
| 1 | ESLint einrichten, Models, Rules-Grundgerüst | S |
| 2 | Einkaufslisten, Items, Übernahme → Task, Gekauft-Sync | M |
| 3 | Familien-2×2-Raster (Mitglieder, Familienaufgaben, Einkauf) | S |
| 4 | Space im Terminformular, Familientermine, Busy-Einträge, Statussystem, Mitglieder-Detail | M |
| 5 | Deadline-Uhrzeit + Konfliktwarnungen (Formulare, Dashboard, Kalender) | M |
| 6 | Wiederkehrende Aufgaben, Rotation, Serienhinweis, Abend-Dialog, Status `discarded` | L |
| 7 | Build, Typecheck, Lint, Responsive-Check, Changelog, Zusammenfassung | S |

R1 wird vor Schritt 4 gebraucht, R2 vor Schritt 6.
