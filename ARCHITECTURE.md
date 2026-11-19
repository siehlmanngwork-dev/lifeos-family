# ARCHITECTURE.md

## Architekturziel

Die Architektur muss folgende Anforderungen erfüllen:

- Persönliche Organisation als Hauptfokus
- Familienorganisation als Erweiterung
- Modulbasierte Erweiterbarkeit
- Individuelle Berechtigungen statt fester Rollen
- Browser-First
- PWA-fähig
- Firestore-kompatibel
- Spätere Integration von Kalendern, Benachrichtigungen und Planungsalgorithmen

---

# Technologie-Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- Firebase SDK

## Backend

- Firebase Authentication
- Cloud Firestore

## Hosting

- GitHub Pages

## App-Modell

- Progressive Web App (PWA)

---

# Projektstruktur

```text
src/

├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
│
├── pages/
│   ├── Dashboard/
│   ├── Calendar/
│   ├── Tasks/
│   ├── Family/
│   ├── Projects/
│   ├── Admin/
│   └── Settings/
│
├── components/
│   ├── dashboard/
│   ├── calendar/
│   ├── tasks/
│   ├── family/
│   ├── projects/
│   └── shared/
│
├── services/
│   ├── auth/
│   ├── firestore/
│   ├── permissions/
│   └── calendar/
│
├── hooks/
│
├── models/
│
├── utils/
│
└── firebase/
```

---

# Firestore Architektur

## Collections

```text
users
families
spaces
tasks
events
projects
categories
shoppingItems
permissions
settings
```

---

# users

```text
users/{userId}
```

Beispiel:

```json
{
  "displayName": "Max",
  "email": "max@example.com",
  "familyId": "family_001",

  "availableHoursPerDay": {
    "monday": 10,
    "tuesday": 10,
    "wednesday": 10,
    "thursday": 10,
    "friday": 10,
    "saturday": 5,
    "sunday": 5
  },

  "createdAt": ""
}
```

---

# families

```text
families/{familyId}
```

Beispiel:

```json
{
  "name": "Familie Müller",
  "createdBy": "user123",
  "joinCode": "FAM-72AB-91QX"
}
```

---

# spaces

```text
spaces/{spaceId}
```

Beispiel:

```json
{
  "name": "Urlaub 2027",

  "members": [
    "user1",
    "user2"
  ],

  "createdBy": "user1",

  "type": "custom"
}
```

---

# tasks

```text
tasks/{taskId}
```

Beispiel:

```json
{
  "title": "Steuererklärung",

  "description": "",

  "assignees": [
    "user1"
  ],

  "priority": "high",

  "categoryId": "finance",

  "estimatedDuration": 240,

  "deadline": "2027-01-15",

  "spaceId": "personal",

  "projectId": null,

  "status": "open",

  "isRecurring": false,

  "createdBy": "user1",

  "createdAt": ""
}
```

---

# events

```text
events/{eventId}
```

Beispiel:

```json
{
  "title": "Arzttermin",

  "startDateTime": "",

  "endDateTime": "",

  "location": "Frankfurt",

  "participants": [
    "user1"
  ],

  "spaceId": "family",

  "projectId": null,

  "private": false,

  "categoryId": "health"
}
```

---

# projects

```text
projects/{projectId}
```

Beispiel:

```json
{
  "name": "Italien Urlaub 2027",

  "description": "",

  "priority": "normal",

  "spaceId": "family",

  "members": [
    "user1",
    "user2"
  ],

  "deadline": "",

  "status": "active"
}
```

---

# categories

```text
categories/{categoryId}
```

Beispiel:

```json
{
  "name": "Fitness",

  "color": "#4CAF50",

  "icon": "dumbbell",

  "ownerId": "user1"
}
```

---

# shoppingItems

```text
shoppingItems/{itemId}
```

Beispiel:

```json
{
  "title": "Milch",

  "status": "open",

  "assignedTo": null,

  "estimatedDuration": null
}
```

---

# permissions

Da keine Rollen verwendet werden, wird jede Berechtigung individuell gespeichert.

```json
{
  "dashboard": true,

  "calendar": true,

  "tasks": true,

  "family": true,

  "projects": false,

  "admin": false,

  "assignTasksToOthers": false
}
```

---

# Dashboard Engine

Berechnet:

## Wichtigste Aufgabe

Algorithmus:

1. Sofort
2. Kritisch
3. Hoch
4. Normal
5. Niedrig

Danach:

- Deadline
- Überfällig
- Aufwand

---

## Nächster Termin

Algorithmus:

Kleinster Zeitabstand zum aktuellen Zeitpunkt.

---

## Konflikterkennung

Typ 1:

```text
Termin überschneidet Termin
```

Typ 2:

```text
Benötigte Zeit >
Verfügbare Zeit
```

---

# Projektfortschritt

Formel:

```text
erledigte Aufgaben
/
Gesamtaufgaben
```

Beispiel:

```text
8 / 10

=
80 %
```

---

# Statussystem

Status wird aus Terminen berechnet.

Wenn aktuelle Uhrzeit innerhalb eines Termins liegt:

```text
Location vorhanden

→ Location anzeigen
```

Ansonsten:

```text
Beschäftigt
```

Manuelle Überschreibung besitzt immer Vorrang.

---

# Mobile Navigation

Dynamisch generiert.

Standard:

```text
Dashboard
Kalender
Aufgaben
Familie
Neu
```

Navigation basiert auf Berechtigungen.

---

# Löschstrategie

## Aufgaben

```text
Erledigt

↓
Archiv

↓
7 Tage

↓
Löschen
```

---

## Termine

```text
Vergangen

↓
30 Tage

↓
Löschen
```

---

## Projekte

Nur manuelle Löschung.

---

# Entwicklungsreihenfolge

## Release 0.1

- Google Login
- Firestore
- Dashboard
- Aufgaben
- Familiencode
- Familienbeitritt
- Kalender
- Berechtigungen

## Release 0.2

- Einkaufsliste
- Wiederkehrende Aufgaben
- Konflikterkennung
- Statussystem

## Release 0.3

- Projekte
- Projektfortschritt
- Spaces

## Release 0.4

- Google-Kalender-Import
- Kapazitätsplanung
- Zeitkritische Warnungen

## Release 0.5

- Outlook-Kalender
- Apple-Kalender
- Benachrichtigungen
- Newsfeed

---

# Architektur-Leitsatz

Die Anwendung darf niemals versuchen, Entscheidungen für den Nutzer zu treffen.

Sie soll:

- Transparenz schaffen
- Konflikte sichtbar machen
- Prioritäten hervorheben
- Verplanung frühzeitig erkennen

Die endgültige Entscheidung verbleibt immer beim Nutzer.