# GameForge – QA-Baseline, Zyklus 0

Stand: 8. November 2026, Quellcommit `2c1c86873c69207616704320170fdfc7228ddb46`. **Status: Basis erfasst mit Testgrenzen.** Es wurde kein neuer Feature-Branch bewertet.

## Ausgeführte Prüfungen

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| Node-Tests | `node --test tests/*.test.js`: 21 bestanden, 0 fehlgeschlagen, 101,60475 ms. |
| Syntax | `node --check dist/core.js` und `dist/game.js`: Exit 0. Python-AST von `tools/generate_icons.py`: OK. Das Python-Skript wurde nicht ausgeführt. |
| HTTP-Start | Lokaler Server für `dist/`; HTML, CSS, JS, Icons, Manifest und Service Worker lieferten HTTP 200. |
| Browser-Viewports | 1280×720 Desktop, 667×300 und 568×320 Handy-Querformat laden; Canvas an Viewport angepasst, normales Menü/Tutorial sichtbar, keine Konsolenfehler im normalen Start. Bei 300×667 erscheint eine Orientierungssperre. Browser-Viewport-Test, kein echtes Handy und keine Touch-Emulation. |
| Altstand-Muster | Legacy-artiges Testobjekt behielt 731 Münzen, 52 XP, Level 34, Upgrade-Stufen, Skin und Waffen nach `sanitizeSave` und Backup-Roundtrip. Ein realer v1-Browser-Spielstand wurde nicht geladen. |

## Fehler und Risiken

| ID | Schwere | Reproduktion / Befund |
| --- | --- | --- |
| QA-0-01 | Mittel, Testpfad | `/?qaBoss=volcano&qaSuper=1` mit frischem Profil wirft `TypeError` bei `dist/game.js:781`, weil das Tutorial startet, bevor der Debugpfad einen Boss annimmt. Nach Tutorial-Skip funktioniert der Direktstart. |
| QA-0-02 | Hoch, neue Zielgruppen-Vorgabe | `dist/style.css:1` importiert Google Fonts extern. Eine externe Verbindung widerspricht dem neuen Protokoll; kein Tracker nachgewiesen. |
| QA-0-03 | Mittel, künftiges Speicher-Risiko | Lokaler Schlüssel `stickman-siege-v3` und Backup-Version 1 existieren, aber das Save-Objekt hat kein eigenes `version`-Feld und keine explizite Migrationskette (`dist/game.js:8–17`, `dist/core.js:86–139`). |

## Nicht gemessen / nicht getestet

FPS und Heap bei fünf Minuten Hochlast; Effekte auf hoher/niedriger Stufe; Bot-Läufe für Anfänger/Normal/Profi; echtes iOS-/Android-Gerät und Touch-Emulation; komplette HUD-/Shop-/Pause-/Neustart-Flows im Browser; realer Browser-Speicherstand einer Vorversion. Diese Punkte gelten **nicht** als bestanden.

Der localhost-QA-Hook `window.__SIEGE_QA__` (`dist/game.js:766–777`) bietet Snapshot, Startlevel, Step und Gegner-Spawn, aber keinen deterministischen Kampf-Seed, keine Action-Eingabe und keinen vollständigen Reset/Ergebnisexport. Kleinste spätere Test-Schnittstelle als eigener Zyklus: `reset({seed, profile, level})`, `step(dt, {moveX, moveY, fire, aim})`, `snapshot()` mit Zeit, HP, Welle, Kills, Münzen/XP, Upgrades, Todesursache und Bossausgang; alle Zufallsquellen müssen denselben Seed nutzen. Erst dann sind mehrere Botstrategien und wiederholbare Lastszenarien belastbar.
