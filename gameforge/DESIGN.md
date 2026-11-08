# GameForge – Bestandsdesign (Zyklus 0)

Stand: Version 12, Quellcommit `2c1c86873c69207616704320170fdfc7228ddb46` vom 7. November 2026. Dieses Dokument beschreibt den Ist-Zustand; Zyklus 0 ändert das Spiel nicht.

## Spiel und Kernschleife

Stickman Siege ist ein 2D-Wellen-Shooter im Browser. Der Spieler bewegt eine Stickman-Figur, schießt auf Comic-Monster, sammelt Münzen, XP und Powerups, kauft Ausrüstung und schaltet über Bosslevel neue Karten frei. Es gibt sechs Karten mit je 30 Levels. Jedes Level besteht aus drei Wellen; im letzten Level jeder Karte endet Welle 3 mit einem eigenen Boss (`dist/core.js:10`, `dist/core.js:39`, `dist/core.js:84`).

## Architektur und Inhalte

| Bereich | Bestand |
| --- | --- |
| Regeln und Daten | `dist/core.js`: Karten, acht Upgrades, sechs Waffen, vier Perks, acht Skins, sechs Powerups, Bossmuster, XP-/Preis-/Wellenformeln, Speicherstandbereinigung. |
| Spielschleife | `dist/game.js`: Canvas-Rendering, 60-Hz-Fixed-Step, Bewegung, Kollisionen, Gegner-KI, Projektile, Loot, Tutorial, Shop, Einstellungen und Audio. |
| Oberfläche | `dist/index.html` und `dist/style.css`: Startmenü, HUD, Kartenwahl, Shop, vier Einstellungsreiter, Pause, Ergebnis, Tutorial und Admin-Testprofil. |
| Assets | Selbst erzeugte Canvas-Grafik, ein SVG-Icon und zwei per Python erzeugte PNG-Icons. Musik und SFX werden mit WebAudio erzeugt. `tools/generate_icons.py` benötigt nur die Python-Standardbibliothek. |
| Offline-Betrieb | `dist/sw.js` verwaltet den Cache der installierbaren Web-App. `dist/manifest.webmanifest` fordert Querformat an. |
| Tests | `tests/core.test.js` prüft Regeln und Speicherstand; `tests/tutorial.test.js` nutzt einen DOM-/Canvas-Stub für Spielabläufe. |

Monster: Zombie, Skelett, Ghul, Golem, Geist und Dämon, dazu kartenspezifische Bosse. Ab Level 5 kann höchstens ein Elite-Monster pro regulärer Welle erscheinen (`dist/game.js:171`, `dist/game.js:188`). Gegner verwenden Nahkampf, Pfeile oder andere Projektile; Bossangriffe haben Warnphasen. Karten erzeugen zufällige Hindernisse mit freier Startzone (`dist/game.js:78`).

## Steuerung, Progression und Speichern

Handy: linker Joystick und rechter Feuerknopf; Positionen sind einstellbar. Computer: WASD/Pfeiltasten, Leertaste oder Maus; Tasten sind umbelegbar. Derzeit sperrt eine Hochformat-Einblendung das Spiel im Porträtmodus (`dist/style.css:102`, `dist/manifest.webmanifest`). Der neue Team-Rahmen fordert dagegen Skalierung in beiden Ausrichtungen. Diese Abweichung bleibt in Zyklus 0 unverändert und gehört auf die Prioritätenliste.

Der normale Spielstand liegt als JSON unter `stickman-siege-v3` im lokalen Browser; beim Laden wird auch `stickman-siege-v1` gelesen und durch `sanitizeSave` begrenzt (`dist/game.js:8`, `dist/core.js:92`). Das JSON enthält keine eigene Schema-Versionsnummer. Das separat herunterladbare Backup trägt `version: 1` (`dist/core.js:133`). Das Admin-Profil und seine Optionen liegen getrennt. Spielfortschritt wird nicht zwischen Geräten synchronisiert.

## Bekannte strukturelle Schwachstellen

1. **Externe Schriftanfrage:** `dist/style.css:1` lädt Google Fonts. Das widerspricht der neuen Vorgabe „keine externen Verbindungen“ und benötigt eine gezielte Lösung mit lokalem oder System-Font, samt sichtbarer Layoutprüfung.
2. **Speicherformat ohne Schema-Version:** Der Schlüsselname `v3` ist keine Version im Inhalt. `sanitizeSave` bietet Rückwärtskompatibilität, aber keine explizite Migrationskette (`dist/game.js:8`, `dist/core.js:92`). Änderungen am Speicherformat brauchen künftig eine eigene Version und Migration.
3. **Performance und Balance nicht zentral messbar:** Projektile, Partikel und Gegner werden per `push`/`splice` verwaltet; die 60-Hz-Schleife hat keine FPS-/Speicher-Telemetrie für Baselines (`dist/game.js:567`). Balance-Werte stehen teils in `core.js`, teils in `game.js` (zum Beispiel `enemyDefs` und Elite-Chance). Ein Bot-Modus für reproduzierbare Anfänger-/Normal-/Profi-Läufe fehlt.

Zusätzlich zu prüfen: Heldenskinnamen und Ähnlichkeit zu bekannten Figuren (`dist/core.js:53`), Mindestgröße einiger Touch-Ziele und das neue Porträtziel. Diese Befunde sind keine stillschweigenden Änderungen am Bestand.

## Vorschlag für spätere Balance-Auslagerung

Ein eigener Zyklus könnte eine `dist/balance.js` oder ein exportiertes `BALANCE`-Objekt in `core.js` einführen. Darin würden Gegnerwerte, Waffenwerte, Wellen-/XP-/Preisformeln und Zufallsraten als benannte Daten stehen. Zuerst sind Identitäts- und Speicherstandtests für alle bisherigen Werte nötig; erst danach darf der Balancer Werte ändern. Die Auslagerung findet **nicht** in Zyklus 0 statt.

## Zielrahmen des neuen Team-Protokolls

Genau eine Mechanik pro normalem Zyklus, ein eigener Branch, Annahme erst nach Urteil B. Cartoon-Darstellung ohne Blut, keine Echtgeldkäufe, Werbung, Tracker oder personenbezogene Daten. Gleichwertige Bedienung auf Handy und Computer. Messwerte und echte Gerätetests werden ausdrücklich von Annahmen und simulierten Tests getrennt.
