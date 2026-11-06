# QA-Feedback · Version 3

## Automatische Tests

- `node --test tests/core.test.js`: 6 von 6 bestanden.
- `node --check` für `core.js`, `game.js` und `sw.js`: bestanden.
- `git diff --check`: bestanden.

## Browserprüfung

Die lokale Version wurde im Browser in Desktopansicht, Handy-Querformat (844 × 390) und Handy-Hochformat (390 × 844) geöffnet. Start, Tutorial, Karten-/Levelmenü, Upgrade-/Skinmenü, Einstellungen, Admin-Testprofil, Spielfeld und Ergebnisansicht wurden visuell geprüft. Die Browser-Konsole zeigte bei diesen Wegen keine JavaScript-Fehler.

## Gefundene und behobene Punkte

1. Der alte Service-Worker-Cache konnte auf Handys Version 2 festhalten. Version 3 verwendet einen neuen Cache und lädt aktualisierte Dateien zuerst aus dem Netz.
2. Das Dauerfeuer konnte zu viele Projektile und Sounds pro Sekunde erzeugen. Ein kurzes, festes Intervall begrenzt die Last und bleibt deutlich schneller als normales Feuer.
3. Entfernte Boss-Beute konnte vor dem Ergebnisbildschirm unerreichbar bleiben. Münzen und XP werden beim Levelabschluss automatisch gutgeschrieben.
4. Im Handy-Querformat waren Bildschirmtasten in einer schmalen Desktop-Vorschau verborgen; die Responsive-Regel wurde korrigiert.
5. Doppelbelegte Computertasten und ein altes Mausziel nach Touch-Eingabe wurden abgefangen.

## Grenzen

Es wurde kein vollständiger Durchlauf aller 180 Levels auf realen Android- und iOS-Geräten durchgeführt. Das Admin-Profil ist ein lokaler Testmodus ohne Server-Authentifizierung. Android und iOS werden als installierbare Web-App bereitgestellt; native APK-/IPA-Dateien sind nicht enthalten.
