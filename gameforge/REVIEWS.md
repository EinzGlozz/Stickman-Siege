# GameForge – Gesamteinschätzungen, Zyklus 0

## Kritiker

**Stärken:** sechs Karten mit eigenen Bossmustern, Monster, Powerups, Waffen und Perks, interaktives Tutorial, mobile und PC-Steuerung, lokaler Spielstand mit Backup. QA hat 21 Tests und drei Querformat-Viewports geprüft.

**Größte Risiken:** Der externe Google-Font (`dist/style.css:1`) verletzt die neue Offline-/Datenschutzvorgabe. Rechte an benannten Marvel-/DC-Skins sind nicht dokumentiert (`dist/core.js:59–67`). Mehrschuss-Stufen 1 und 3 kosten ohne zusätzlichen Schuss (`dist/game.js:208`); der erste Boss liegt rechnerisch frühestens nach 16,09 Minuten statt nach dem neuen Richtziel 6–10 Minuten. Save-Schema/Migration, echte Last-/Botdaten, kleine Touchziele und Quer-/Hochformat-Konflikt bleiben offen. Die genannten Probleme sind grundsätzlich behebbar; ein fataler Fehler im normalen Start ist nicht belegt. Visueller Glanz hat geringere Priorität.

## Befürworter

**Stärken:** Der Kern mit Karten, Bossmustern, mehreren Ausrüstungswegen und siebenstufigem Tutorial ist bereits spielbar (`dist/core.js`, `dist/game.js`, `README.md`). Auf dem Handy helfen Auto-Zielsuche, zwei Hauptkontrollen und Beute-Kompass ohne dritte Taste (`dist/game.js:179–181,720–733`). Lokaler Spielstand, Backup und Offline-Web-App sind nützlich.

**Faire Vorbehalte:** 21 Node-Tests und Browser-Viewports belegen weder flüssige Leistung auf echten Geräten noch gute Balance. Kleine Nebentouchziele und Flash können belasten; externe Schrift und Drittfigurennamen sind ungeklärt. Mehrschuss enthält einen konkreten Fehlanreiz.

**Größte Chance:** zuerst prüfbare Vertrauens- und Bedienungsfehler wie Font, Touchziele, Flash und QA-Direktstart lösen; danach mit reproduzierbaren Läufen Balance und Boss-Rhythmus verbessern. Insgesamt positiv mit klaren Auflagen, keine Feature-Freigabe allein aus Zyklus-0-Evidenz.
