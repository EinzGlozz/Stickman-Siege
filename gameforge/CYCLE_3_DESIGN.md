# Zyklus 3 – Design und Build: Ruhiges Trefferfeedback

**Richterurteil A:** Idee 1 gewählt (`JUDGMENTS.md`). Der Branch basiert auf dem offenen Zyklus 1 und der Entwurfs-PR richtet sich gegen dessen Branch. Der **einzige neue Spielinhalt** in Zyklus 3 ist die Darstellung eines Spielertreffers und seiner Schutzphase. Kein Merge nach `main`, solange die Elternabhängigkeit und Urteil B offen sind. Zyklus-2-Skins sind nicht enthalten.

## Spielerfantasie und Kernschleife

Im dichten Kampf erkennen Spieler sofort, dass ein Treffer HP gekostet hat und wann die kurze Schutzphase läuft. Sie sehen ihre Figur durchgehend und können gezielt ausweichen. Die bisherige 18-Hz-Ausblendung und der rote Vollbildimpuls werden durch einen einmaligen kleinen Trefferkreis, zwei ruhige Schutzbögen und die vorhandene flüssige HP-Anzeige ersetzt.

## Regeln und Übergabe

- Bei einem gültigen Treffer bleibt die bestehende Schadens-/Rüstungsformel, `player.invuln=.55`, `state.shake=7`, maximal 12 bestehende Partikel vor Skalierung, der eine `hurt`-SFX und die HP-Aktualisierung erhalten. Im Tutorial bleibt `.45` ohne HP-Abzug.
- Der Trefferring entsteht **einmalig** am Spieler, dauert 0,24 s und ist lokal auf etwa 28–40 Spielpixel Radius begrenzt. Bei Partikelregler 0 oder `prefers-reduced-motion` entfällt er; kein zusätzlicher Ton, keine neue Partikelserie.
- Während `invuln>0` wird die Figur stets gezeichnet. Zwei statische, unterbrochene Bögen sind als Schutzphase sichtbar. Sie haben eine andere Form als der geschlossene Ring für das Unsterblichkeits-Powerup und pulsieren oder blinken nicht. Sie bleiben bei Partikelregler 0 und `prefers-reduced-motion` sichtbar; Kamera-Shake wird bei letzterem nicht gezeichnet.
- Das vollflächige rote `state.flash` wird entfernt. Der neue lokale Trefferkreis entfällt unter `prefers-reduced-motion`; Schutzbögen und HP liefern weiterhin das Signal ohne große Helligkeitsfläche.
- Keine externen Assets, Anfragen, Datensammlung oder neuen Spielwerte. Der vorhandene Font-Fix ist eine offene Abhängigkeit.

## Erfolgskriterien E1–E7

- **E1:** Gültiger Treffer reduziert HP wie vorher; Invulnerabilität 0,55 s bzw. Tutorial 0,45 s; kein Schadens-Doppeltreffer währenddessen.
- **E2:** Spielfigur bleibt durchgehend sichtbar; während Schutzzeit erscheinen zwei unterbrochene Bögen, unterscheidbar vom geschlossenen Unsterblichkeitsring, auch bei Partikelwert 0.
- **E3:** Ein einmaliger lokaler Ring und HP-Verlust ersetzen den roten Vollbildimpuls; bei Partikelwert 0/reduzierter Bewegung tragen Schutzbögen und HP die Information. Kein neuer SFX, keine neuen Partikel, keine ununterbrochene Helligkeitsmodulation; `prefers-reduced-motion` deaktiviert Zeichnungs-Shake.
- **E4:** Spielbar und lesbar bei 568×320, 667×300, 1280×720, mindestens in dichtem Kampf und Bosskampf; kein HUD/Spielerüberlappungsfehler.
- **E5:** Syntax, vorhandene Tests und eine gezielte Code-/Spielregression bestehen; alte Speicherstände bleiben unangetastet.
- **E6:** Fünf Minuten reale Mittelklasse-Handy-Hochlast mit ≥30 FPS und Speicherbeobachtung. Ohne Gerätetest **NICHT PRÜFBAR**, daher keine Annahme.
- **E7:** Jugend-/Barrierefreiheitsprüfung dokumentiert Reduktion der Blink- und Vollbildfläche; kein formaler WCAG-Konformitätsanspruch ohne Messung.

## Module und Grenzen

Nur `dist/game.js` für Spielcode. `gameforge`-Protokolle und README-Änderungsnotiz dokumentieren den Zyklus. Der Design-/Feel-Agent kontrolliert Ringform, Sichtbarkeit und Lesbarkeit nach dem Build. QA prüft die konkrete Version. Höchstens zwei Revisionsrunden bei begründetem Befund.
