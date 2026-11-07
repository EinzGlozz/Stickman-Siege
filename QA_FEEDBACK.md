# QA-Feedback · Version 11

Version 11 behebt das Hängenbleiben der Handy-Bewegung bei verlorener Pointer-Erfassung und sichert die Spielfeldmaße nach Größenwechseln ab. Die Kisten sind jetzt quadratisch. Im lokalen Browser waren Spielfeld, Figur und Tutorial bei 667 × 300 Pixeln sichtbar; die Canvas-CSS-Größe und der Zeichenpuffer betrugen jeweils 667 × 300 Pixel.

## Tests für Version 11

- `node --test tests/*.test.js`: 19 von 19 bestanden. Neu: Resize bei 667 × 300 und 568 × 320 Pixeln mit 2× Pixeldichte, Joystick-Verlust der Fingererfassung, Totbereich und Pause/Fortsetzen.
- Ein echter Finger-Test auf iOS und Android steht noch aus; die gemeldete Verzerrung ließ sich in der Browser-Vorschau nicht direkt reproduzieren. Die Größenabgleichung und Eingabe-Rücksetzung decken die erkannten Fehlermöglichkeiten ab.

## Vorherige Prüfung

Version 10 wurde im lokalen Browser bei 568 × 320 Pixeln geprüft. Startmenü und Tutorial blieben trotz der neuen Lichtakzente lesbar; der Grafikregler „Menü-Effekte“ deaktivierte die CSS-Animationen und ließ sie danach wieder zu. Die Browser-Konsole zeigte keine JavaScript-Fehler. Die Kartenlichter hängen am vorhandenen Partikelregler und werden bei reduzierter Bewegung ausgelassen.

## Automatische Tests

- `node --test tests/*.test.js`: 17 von 17 bestanden. Neu geprüft: Der Startpunkt liegt auf allen sechs Karten und ihren Bosslevels in einer freien Zone; die Kamera zeigt die Figur im Tutorial oberhalb der Anleitung.
- `node --check` für `core.js`, `game.js` und `sw.js`: bestanden.
- `git diff --check`: bestanden.

## Browserprüfung

Version 9 wurde im lokalen Browser bei 568 × 320, 667 × 375 und 844 × 390 Pixeln geprüft. Vor der Korrektur überlappten Kartenname, Leben und Ressourcen in der schmalen Ansicht, während das Tutorial Joystick und Figur teilweise verdeckte. Nach der Korrektur sind HUD, Spielfigur, Tutorialkarte und Touch-Buttons getrennt. Startmenü, Kartenübersicht, Tutorial sowie Grasland- und Neon-Level wurden sichtbar geprüft. Die Browser-Konsole zeigte keine JavaScript-Fehler.

In Version 8 wurde das versteckte Admin-Labor und der Profilwechsel geprüft.

In Version 7 wurden Sicherungsmenü und Dateivorschau geprüft. Eine Testdatei mit 1234 Münzen, Wüste Level 2 und Spider-Man wurde eingespielt und anschließend per „Letzten Stand zurückholen“ rückgängig gemacht. Die Schaltfläche für den Download meldete Erfolg; ein tatsächlicher Dateidownload konnte im Testbrowser nicht als Datei abgefangen werden.

In Version 6 wurden die dezente Startseitenfigur, alle vier Einstellungsreiter und der Weg Pause → Einstellungen → Pause sichtbar geprüft. Während der Rückkehr aus den Einstellungen blieb die Lebensanzeige bei 295/340; die Runde lief im Hintergrund nicht weiter. Der Reiterbereich wurde bei 844 × 390 geprüft.

Aus Version 4 stammt die Prüfung der Querformatsperre sowie aller sechs normalen und sechs Superattacken. Die Neon-Superattacke wurde vor dem Treffer als Kreuz angezeigt.

## Gefundene und behobene Punkte

1. Der alte Service-Worker-Cache konnte auf Handys Version 2 festhalten. Version 3 verwendet einen neuen Cache und lädt aktualisierte Dateien zuerst aus dem Netz.
2. Das Dauerfeuer konnte zu viele Projektile und Sounds pro Sekunde erzeugen. Ein kurzes, festes Intervall begrenzt die Last und bleibt deutlich schneller als normales Feuer.
3. Entfernte Boss-Beute konnte vor dem Ergebnisbildschirm unerreichbar bleiben. Münzen und XP werden beim Levelabschluss automatisch gutgeschrieben.
4. Im Handy-Querformat waren Bildschirmtasten in einer schmalen Desktop-Vorschau verborgen; die Responsive-Regel wurde korrigiert.
5. Doppelbelegte Computertasten und ein altes Mausziel nach Touch-Eingabe wurden abgefangen.
6. Version 4 ergänzt ausschließliches Querformat, zwölf kartenspezifische Bossmuster und schwierigere Wellen mit längerer normaler Schusspause.

## Grenzen

Die neue Musik und SFX wurden technisch im Browser gestartet, aber noch nicht auf echten Lautsprechern oder Kopfhörern probegehört. Der automatisierte Tutorialtest führt den Spielcode mit simulierten Eingaben aus; ein vollständiger Tutorial-Durchlauf auf einem echten Handy steht noch aus.

Es wurde kein vollständiger Durchlauf aller 180 Levels auf realen Android- und iOS-Geräten durchgeführt. Das Admin-Profil ist ein lokaler Testmodus ohne Server-Authentifizierung. Android und iOS werden als installierbare Web-App bereitgestellt; native APK-/IPA-Dateien sind nicht enthalten.
