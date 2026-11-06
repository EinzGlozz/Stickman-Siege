# QA-Feedback · Version 4

## Automatische Tests

- `node --test tests/core.test.js`: 8 von 8 bestanden.
- `node --check` für `core.js`, `game.js` und `sw.js`: bestanden.
- `git diff --check`: bestanden.

## Browserprüfung

Die lokale Version wurde im Browser im Handy-Querformat (844 × 390) und Handy-Hochformat (390 × 844) geöffnet. Im Hochformat erschien die Sperre; der Lebenswert blieb während 1,3 Sekunden unverändert. Alle sechs normalen und sechs Superattacken wurden über den nur auf localhost verfügbaren Boss-Teststart ausgelöst. Die Browser-Konsole zeigte dabei keine JavaScript-Fehler. Die Neon-Superattacke wurde vor dem Treffer als Kreuz angezeigt; danach sank der Lebenswert von 340 auf 287.

## Gefundene und behobene Punkte

1. Der alte Service-Worker-Cache konnte auf Handys Version 2 festhalten. Version 3 verwendet einen neuen Cache und lädt aktualisierte Dateien zuerst aus dem Netz.
2. Das Dauerfeuer konnte zu viele Projektile und Sounds pro Sekunde erzeugen. Ein kurzes, festes Intervall begrenzt die Last und bleibt deutlich schneller als normales Feuer.
3. Entfernte Boss-Beute konnte vor dem Ergebnisbildschirm unerreichbar bleiben. Münzen und XP werden beim Levelabschluss automatisch gutgeschrieben.
4. Im Handy-Querformat waren Bildschirmtasten in einer schmalen Desktop-Vorschau verborgen; die Responsive-Regel wurde korrigiert.
5. Doppelbelegte Computertasten und ein altes Mausziel nach Touch-Eingabe wurden abgefangen.
6. Version 4 ergänzt ausschließliches Querformat, zwölf kartenspezifische Bossmuster und schwierigere Wellen mit längerer normaler Schusspause.

## Grenzen

Es wurde kein vollständiger Durchlauf aller 180 Levels auf realen Android- und iOS-Geräten durchgeführt. Das Admin-Profil ist ein lokaler Testmodus ohne Server-Authentifizierung. Android und iOS werden als installierbare Web-App bereitgestellt; native APK-/IPA-Dateien sind nicht enthalten.
