# Zusammenfassung Release 0.2

Branch `release/0.2-test`, nicht committet, nicht nach `main` gemergt.

Prüfungen: `npm run typecheck`, `npm run lint`, `npm run build` ohne Fehler und Warnungen.
Logiktests (Status, Konflikte, Wiederholung): 36 Fälle bestanden (temporäre Skripte, nicht im Repo).
Browser: nur Login-Seite (375 px ohne horizontales Scrollen). Alles hinter dem Login und die Firestore-Rules sind ungetestet.

---

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `firestore.rules` | Einkauf, Busy-Einträge, Familientermine, Gekauft-Sync, Status `discarded`, Deadline-Uhrzeit, `manualStatus` |
| `package.json`, `package-lock.json` | Version 0.2.0, ESLint, Script `lint` |
| `src/app/layouts/AppLayout.tsx` | Status in der Topbar, Status-Editor, Busy-Abgleich |
| `src/app/providers/SessionProvider.tsx` | Kontext ausgelagert |
| `src/components/calendar/EventEditor.tsx`, `EventForm.tsx` | Personal/Family, Nur-Lesen für fremde Termine, Konfliktwarnung |
| `src/components/dashboard/ConflictArea.tsx` | Überschrift „⚠ Kritischer Planungskonflikt“ |
| `src/components/dashboard/FocusCards.tsx` | Deadline-Uhrzeit |
| `src/components/family/FamilyOverview.tsx` | aufklappbare Mitglieder, Statuszeile |
| `src/components/tasks/TaskEditor.tsx`, `TaskForm.tsx`, `TaskItem.tsx` | Uhrzeit, Wiederholung, Konfliktwarnung, 🔁, „Verworfen“, Start-Space |
| `src/hooks/useData.ts` | Familientermine, Busy-Einträge, Einkauf, Einstellungen |
| `src/hooks/useSession.ts`, `useSubscription.ts` | Import / Lint |
| `src/index.css` | Styles für neue Bereiche |
| `src/models/*` (conflict, event, index, settings, task, user) | neue Felder und Typen |
| `src/pages/Calendar/CalendarPage.tsx` | Konfliktmarkierung |
| `src/pages/Dashboard/DashboardPage.tsx` | Serienhinweis, Abend-Dialog |
| `src/pages/Family/FamilyPage.tsx` | 2×2-Raster |
| `src/pages/Settings/SettingsPage.tsx` | Uhrzeit Abend-Dialog |
| `src/pages/Tasks/TasksPage.tsx` | Archiv mit „Verworfen“, Item-Sync |
| `src/services/dashboard/conflictEngine.ts` | „Deadline in Termin“ statt Platzhalter |
| `src/services/firestore/collections.ts` | Subcollection-Namen |
| `src/services/firestore/eventService.ts` | Space, Familientermine, Busy-Einträge, Abgleich |
| `src/services/firestore/taskService.ts` | Serien, Verschieben, Verwerfen, Item-Sync |
| `src/services/firestore/userService.ts` | manueller Status |
| `src/services/firestore/index.ts` | Exporte |
| `src/utils/date.ts` | Deadline mit Uhrzeit |

## Neue Dateien

- Doku: `DECISIONS.md`, `RELEASE_0.2_PLAN.md`, `RELEASE_0.2_SUMMARY.md`, `CHANGELOG.md`, `eslint.config.js`
- Models: `src/models/shopping.ts`, `src/models/status.ts`
- Logik: `src/services/recurrence/recurrenceEngine.ts`, `src/services/status/statusEngine.ts`
- Firestore: `src/services/firestore/shoppingService.ts`, `src/services/firestore/settingsService.ts`
- Hooks: `src/hooks/useBusyBlockSync.ts`, `src/hooks/useMemberStatus.ts`
- Komponenten:
  - `src/components/shopping/` (ShoppingPanel, ShoppingListView, ShoppingItemRow, ClaimItemDialog)
  - `src/components/family/` (FamilyGrid, MembersPanel, FamilyTasksPanel, FamilyEventsPanel)
  - `src/components/status/StatusEditor.tsx`
  - `src/components/dashboard/SeriesEndNotice.tsx`, `OverdueRecurringDialog.tsx`
  - `src/components/tasks/RecurrenceFields.tsx`, `recurrenceValue.ts`
  - `src/components/settings/OverdueDialogSettings.tsx`
  - `src/components/shared/ConflictWarning.tsx`
  - `src/app/providers/sessionContext.ts`

## Firestore-Felder

| Ort | Felder |
|---|---|
| `families/{familyId}/shoppingLists/{listId}` (neu) | `name`, `familyId`, `createdBy`, `createdAt` |
| `families/{familyId}/busyBlocks/{eventId}` (neu) | `ownerId`, `startDateTime`, `endDateTime`, `title` (null wenn privat), `location` (null wenn privat) |
| `shoppingItems/{itemId}` (erstmals genutzt) | `title`, `note`, `listId`, `familyId`, `status`, `assignedTo`, `estimatedDuration`, `taskId`, `createdBy`, `createdAt` |
| `tasks` | `status` + Wert `discarded`; neu `deadlineTime`, `shoppingItemId`, `recurrenceType`, `recurrenceInterval`, `recurrenceUnit`, `rotationEnabled`, `rotationMembers`, `seriesId`, `occurrenceIndex`, `seriesLength`, `seriesStart` |
| `events` | `spaceId` jetzt wählbar, `familyId` bei Familienterminen |
| `users` | `manualStatus` |
| `settings` | `overdueDialogTime`, `dismissedSeriesIds` |
| `categories` | keine neuen Felder; Kategorie „Einkauf“ wird automatisch angelegt |

Alle neuen Felder sind optional; Daten aus 0.1 funktionieren ohne Migration.

## Offene Risiken

1. **Firestore-Rules ungetestet:** Syntax und Verhalten nicht im Emulator geprüft. Vor allem die Batch-Regeln (Übernehmen, Gekauft-Sync, Busy-Einträge mit `getAfter`) können beim ersten Test Berechtigungsfehler auslösen.
2. **Kein Backend:** Busy-Abgleich, Ablauf des manuellen Status, Serienhinweis und Abend-Dialog laufen nur, während die App offen ist. Termine eines Mitglieds, das die App nach dem Update nicht geöffnet hat, fehlen in dessen Status.
3. **Datenschutz Familientermine:** Nicht private Familientermine sind vollständig lesbar; private nur als Zeitraum (wie entschieden).
4. **Firestore-Kosten:** Jede Statusanzeige und viele Rules nutzen zusätzliche Lesevorgänge (`get()` in Rules).
5. **Rotation ohne Recht:** Ohne `assignTasksToOthers` ist Rotation ausgeblendet.
6. **Eigene Festlegungen (bitte bestätigen):**
   - Serienhinweis ab ≤ 2 offenen künftigen Wiederholungen.
   - Rotationsreihenfolge = alphabetische Mitgliederliste.
   - Familientermine anderer erscheinen auch im eigenen Kalender/Dashboard und zählen zur Tagesauslastung.
   - Private Familientermine sind für andere nur „Beschäftigt“.
   - Farbe der Kategorie „Einkauf“: Orange.
   - Löschen eines übernommenen Items lässt die Aufgabe bestehen.
7. **Mehrere Geräte:** Gleichzeitiges Verlängern derselben Serie überschreibt dieselben IDs (keine Duplikate, aber letzte Version gewinnt).

## Manuell zu testen

Voraussetzung: `firestore.rules` veröffentlichen; zwei Google-Konten in derselben Familie (A, B).

**Einkauf**
- [ ] Liste anlegen, umbenennen, löschen (mit Einträgen)
- [ ] Eintrag mit Notiz anlegen, bearbeiten, löschen
- [ ] A übernimmt → Aufgabe „🛒 … kaufen“ erscheint bei A im Dashboard; Kategorie „Einkauf“ existiert
- [ ] B sieht den Eintrag mit „👤 A“
- [ ] B hakt „Gekauft“ ab → Aufgabe von A ist erledigt
- [ ] A hakt die Aufgabe ab → Eintrag „Gekauft“; wieder öffnen → „Übernommen“

**Familie und Status**
- [ ] 2×2-Raster auf Handy und Desktop
- [ ] A setzt „🏠 Zuhause“ → B sieht es; zeitlich begrenzt → nach Ablauf automatische Logik
- [ ] A hat laufenden Termin mit Location → B sieht „📍 Location“; ohne Location „🔴 Beschäftigt“
- [ ] A hat privaten Termin → B sieht nur „Beschäftigt“, nie Titel/Location
- [ ] Mitglied anklicken → Status, nächster Termin, offene Familienaufgaben
- [ ] Familientermin von A: B sieht ihn, kann ihn nicht ändern
- [ ] Termin aus 0.1 bekommt nach Öffnen der App einen Busy-Eintrag

**Konflikte**
- [ ] Aufgabe mit Deadline 16:00 bei Termin 15–17 → Warnung im Formular, Dashboard, rote Markierung im Kalender
- [ ] Termin über eine bestehende Deadline legen → Warnung im Terminformular
- [ ] Speichern trotz Warnung möglich; ohne Uhrzeit keine Warnung

**Wiederholung**
- [ ] Wöchentlich, 3 Wiederholungen → 3 Aufgaben mit 🔁; Serienhinweis erscheint; „Verlängern“ fügt 3 hinzu; „Nein“ blendet aus
- [ ] Rotation (mit `assignTasksToOthers`) → Zuweisung wechselt pro Wiederholung
- [ ] Monatlich ab 31. → Februar am Monatsende
- [ ] Offene Wiederholung nach eingestellter Uhrzeit → Dialog; Verschieben ändert Deadline; Verwerfen → Archiv „Verworfen“
- [ ] Uhrzeit unter Einstellungen ändern

**Regression 0.1**
- [ ] Login, Dashboard, Kalender (Tag/Woche/Monat), Aufgaben, Kategorien, Familie beitreten
