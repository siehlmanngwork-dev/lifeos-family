MVP_SPEC_V1.md
Projektname (Arbeitstitel)

LifeOS Family

1. Produktvision

LifeOS Family ist ein persönliches Lebensorganisationssystem mit integrierter Familienkoordination.

Die App soll nicht primär Kalender, Aufgaben oder Einkaufslisten verwalten.

Die zentrale Aufgabe der App besteht darin:

Dem Nutzer jederzeit verständlich zu zeigen, was als Nächstes wichtig ist und frühzeitig vor zeitlichen Konflikten zu warnen.

Die App soll die persönliche Organisation verbessern und gleichzeitig Familienkoordination ermöglichen.

2. Kernprinzipien
Prinzip 1

Die App berät, sie entscheidet nicht.

Konflikte werden angezeigt, aber nicht automatisch behoben.

Prinzip 2

Wichtigkeit und zeitliche Nähe sind verschiedene Dinge.

Deshalb werden auf dem Dashboard angezeigt:

Wichtigste Aufgabe
Nächster Termin

als zwei getrennte Elemente.

Prinzip 3

Alle Informationen müssen innerhalb weniger Sekunden erfassbar sein.

Der Nutzer soll nie überlegen müssen:

"Was sollte ich jetzt tun?"

Prinzip 4

Persönliche Organisation steht im Mittelpunkt.

Familie ist ein wichtiger Space, aber nicht das Fundament der Architektur.

3. Technologiestack

Frontend:

React
TypeScript


Backend:

Firebase Authentication
Firestore Database


Deployment:

GitHub Pages


App-Typ:

Progressive Web App (PWA)


Kein nativer Android- oder iOS-Client für MVP.

4. Login & Registrierung

Login:

Google Login


Nach Registrierung:

Eigener Account wird erstellt


Familienbeitritt:

Familiencode eingeben


Beispiel:

FAM-72AB-91QX


Keine E-Mail-Einladungen.

Keine Adminbestätigung notwendig.

5. Spaces

Spaces sind organisatorische Bereiche.

Beispiele:

Personal
Family
Urlaub 2027
Hausbau
Studium


Eigenschaften:

Name
Mitglieder
Ersteller
Aufgaben
Termine
Projekte


Der Ersteller entscheidet über die Mitglieder.

6. Berechtigungssystem

Es existieren keine festen Rollen.

Berechtigungen werden individuell vergeben.

Beispiele:

Dashboard sehen
Kalender sehen
Aufgaben erstellen
Aufgaben zuweisen
Familie sehen
Adminbereich sehen


Die Navigation wird automatisch anhand der Berechtigungen erzeugt.

7. Dashboard
Kopfbereich
Guten Morgen Max

Mittwoch, 18. November

Oberster Bereich

Linke Karte:

Wichtigste Aufgabe


Rechte Karte:

Nächster Termin


Beide gleich groß.

Konfliktbereich

Nur sichtbar wenn nötig.

Beispiele:

Terminüberschneidung

oder

Zeitlich kritische Aufgabe

Heute

Aufgaben und Termine für heute.

Morgen

Aufgaben und Termine für morgen.

Diese Woche

Vorschau kommender Ereignisse.

Demnächst kritisch

Beispiele:

Steuererklärung

Deadline in 5 Tagen

4 Stunden Aufwand

Tagesauslastung

Visualisierung:

██████░░░░

6 von 10 Stunden verplant


Der Nutzer definiert seine verfügbare Tageskapazität selbst.

Morgenzusammenfassung

Automatisch erzeugt.

Beispiel:

3 Termine
4 Aufgaben
1 Konflikt

8. Prioritäten
🟢 Niedrig
🟡 Normal
🟠 Hoch
🔴 Kritisch
⚫ Sofort


Farben müssen konsistent in der gesamten App verwendet werden.

9. Kalender

Unterstützung MVP:

Google Kalender


Später:

Apple Kalender
Outlook Kalender

Termine

Eigenschaften:

Titel
Startdatum
Startzeit
Enddatum
Endzeit
Location
Kategorie
Teilnehmer
Space
Optionales Projekt
Privat-Flag

Kategorien

Kategorien besitzen:

Name
Farbe
Optionales Icon


Kategorien färben Termine im Kalender ein.

Mehrtägige Termine

Unterstützt.

Beispiel:

Montag 11:00

bis

Freitag 18:00

Kalenderansichten
Tag
Woche
Monat


Fließender Übergang zwischen den Ansichten.

Kein harter Wechsel.

10. Konfliktlogik
Typ 1

Termin überschneidet Termin

Beispiel:

15:00 Arzt

15:30 Meeting

Typ 2

Aufwand passt nicht mehr zur verbleibenden Zeit

Beispiel:

8 Stunden Aufwand

2 Stunden frei

Deadline morgen


Konflikte erzeugen:

Dashboard-Warnung
Kalender-Markierung


Keine automatische Veränderung von Terminen oder Aufgaben.

11. Aufgaben
Pflichtfelder
Titel
Verantwortliche Person(en)
Deadline
Priorität
Kategorie
Geschätzte Dauer
Space
Wiederholung

Optionale Felder
Beschreibung
Erinnerung

Deadlines

Möglichkeiten:

Konkretes Datum


oder

Irgendwann

Aufgabenarten
Persönliche Aufgaben

Standard:

1 Verantwortlicher

Familienaufgaben

Möglich:

Mehrere Verantwortliche

Abschluss

Nach Erledigung:

Archiv


Nach:

7 Tagen automatische Löschung

12. Wiederkehrende Aufgaben

Beispiele:

Müll rausbringen

wöchentlich


oder

Hund füttern

täglich


Wiederholungen werden nicht unendlich erzeugt.

Stattdessen:

Nächste X Wiederholungen erzeugen


Am Ende der Serie:

Serie fortsetzen?

13. Projekte

Projekte sind eigenständige Objekte.

Keine Unteraufgaben im MVP.

Eigenschaften:

Name
Beschreibung
Mitglieder
Priorität
Deadline
Space
Aufgaben
Termine
Fortschritt

Fortschritt

Berechnung:

Erledigte Aufgaben
/
Gesamtaufgaben


Beispiel:

4 von 10 Aufgaben

40 %

Projekttermine

Termine können optional einem Projekt zugeordnet werden.

Projektarchiv

Projekte werden nicht automatisch gelöscht.

Löschung erfolgt manuell.

14. Einkaufsliste

Einträge:

Milch
Brot
Käse


Status:

Offen
Übernommen
Gekauft


Regel:

Ein Eintrag kann immer nur einer Person zugewiesen sein.

Bei Übernahme:

Geschätzte Dauer erforderlich


Danach entsteht automatisch ein persönlicher Task.

15. Familienbereich

Navigation:

👥 Mitglieder

📅 Familientermine

✅ Familienaufgaben

🛒 Einkaufsliste

Mitgliederansicht

Jede Person zeigt:

Status
Nächster Termin


Optional:

Planungsansicht


mit Vorschau der kommenden Tage.

16. Standort-/Statussystem

Automatisch über Termine.

Wenn Termin Location besitzt:

📍 Uni Frankfurt


Wenn Termin keine Location besitzt:

🔴 Beschäftigt


Manuelle Überschreibung möglich:

Zuhause
Rewe
Fitnessstudio
etc.

17. Datenschutz
Private Aufgaben

Andere Nutzer sehen nicht die Inhalte.

Private Termine

Standard:

sichtbar


Optional:

Privat markieren


Dann sehen andere nur:

Beschäftigt

18. Mobile Navigation

Standard-Navigation:

🏠 Dashboard

📅 Kalender

✅ Aufgaben

👨‍👩‍👧 Familie

➕ Neu


Navigation basiert auf Berechtigungen.

Ein Nutzer sieht nur Bereiche, für die Rechte bestehen.

19. Langfristige Vision

Die wichtigste Frage, die die App beantworten soll:

Was sollte ich jetzt tun, damit ich mich später nicht verplane?

Erfolgsdefinition

Der Nutzer soll sagen:

"Ich benutze diese App, weil ich jederzeit weiß, was ansteht und frühzeitig bemerke, wenn meine Planung nicht mehr aufgeht."