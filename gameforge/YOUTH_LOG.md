# GameForge – Jugendcheck-Log

## Zyklus 0 · 8. November 2026

**Urteil: AUFLAGEN.** Codeprüfung durch den Jugendwächter-Agenten, kein Test mit Kindern und keine rechtliche Einstufung.

| Prüffeld | Ergebnis und Beleg |
| --- | --- |
| Cartoon-Gewalt | OK: gezeichnete Monster und Partikel beim Tod (`dist/game.js:477–507,296–307`), kein Blut im Code. |
| Datenschutz | Auflage: Speicherstände sind lokal (`dist/game.js:8–19`), aber `dist/style.css:1` lädt Google Fonts von außen. Ein Netzwerkmitschnitt fehlt. |
| Spielzeit und Kaufdruck | OK mit Beobachtung: kein Echtgeldkauf, keine Werbung und kein Login im untersuchten Code. Level enden in Ergebnisansichten (`dist/game.js:318–329`). |
| Verständlichkeit | Auflage: interaktives Tutorial vorhanden; 30-Sekunden-Verständnis ist nicht getestet. Kleine Texte und Hochformatsperre (`dist/style.css:23–27,100–102`). |
| Barrierefreiheit | Auflage: Ton, Partikel und Shake sind reduzierbar; einige Touchziele sind kleiner als 48 px (`dist/style.css:24,95,99,122,145–146`). Vollbild-Schadens-Flash nicht auf Frequenz/Belastung gemessen. |
| Namen/Lizenzen | Auflage: sechs bekannte Marvel-/DC-Figurennamen und charakteristische Farben (`dist/core.js:59–67`); Rechte nicht dokumentiert. Asset-Lizenzliste fehlt. |

**Persona-Simulationen (ANNAHME):** A (9–11, Handy) dürfte Joystick/Feuer verstehen, aber kleine Texte und Ziele erschweren die Bedienung. B (12–14) bekommt Karten und Bosswarnungen, deren Lesbarkeit unter Last ungeprüft ist. C (15–17, Desktop) kann Tasten und Shop nutzen, könnte aber das versteckte Admin-Profil und fremde Heldennamen als Bruch der Progression sehen. Kein echter Persona-Playtest.

**Auflagen:** (1) Externe Font-Anfrage beseitigen und Netzwerk prüfen. (2) Rechte an Figurennamen/Designs belegen oder eigene Figuren einsetzen; Asset-Lizenzen dokumentieren. (3) Touchziele auf mindestens 48×48 px bringen. (4) Kleine Texte und Tutorialverständnis real prüfen. (5) Schadens-Flash und Bosswarnungen auf Frequenz, Form und Kontrast prüfen. (6) Konflikt zwischen früherer Querformat-Vorgabe und neuer Hoch-/Querformat-Anforderung vor Umbau klären.

Für einen größeren Release empfiehlt der Agent Tests mit Kindern/Jugendlichen mit Einverständnis ihrer Eltern. Eine USK-/PEGI-Einstufung wurde nicht vorgenommen.
