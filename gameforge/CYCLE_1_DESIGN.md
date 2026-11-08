# Zyklus 1 – Design & Build: Schrift ohne Netz

**Urteil A:** Idee 1 gewählt (`JUDGMENTS.md`). Branch: `gameforge/cycle-1-local-font`. Eine Darstellungsänderung, keine neue Spielmechanik. Ziel: Das Spiel verwendet bei frischem Start keine externe Schriftverbindung, während Text und Spielansichten bedienbar bleiben.

## Spielerfantasie und Kernschleife

Menü und Spiel sind auch bei schwacher oder fehlender Verbindung sofort lesbar. Der Spieler öffnet die Web-App, wählt Level/Ausrüstung und spielt wie zuvor. Keine neue Entscheidung oder Belohnung; bestehende Käufe, XP, Steuerung und Kämpfe bleiben gleich.

## Regeln, Randfälle und Umsetzung

Der Google-Fonts-`@import` entfällt. Fließtext/Buttons/HUD/Tutorial nutzen `system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`; Display-Titel und Zahlen nutzen `Impact,Haettenschweiler,"Arial Narrow",system-ui,sans-serif`. Diese Fonts kommen vom Betriebssystem, ohne neues Asset oder Download. Farben, Animationen, Sound, Canvas und Balance-Werte bleiben unangetastet. In alten Service-Worker-Caches kann vor dem Update noch altes CSS liegen; daher müssen frischer Start **und** SW-Update geprüft werden. Unterschiedliche Systemfonts können Breiten ändern, Zeilen umbrechen oder die schmale Titelschrift ersetzen.

**Erfolgskriterien für QA:**

- **E1:** `dist/style.css` enthält keinen externen Font-Import und keine externe Font-URL; die App erzeugt beim frischen Start sowie nach SW-Update keine Drittanfrage. Browser-Netzwerkbeleg erforderlich.
- **E2:** Die App startet mit aktualisiertem Cache offline, ohne fehlende Schriftressource und ohne neuen Konsolenfehler.
- **E3:** Menü, Shop, Levelauswahl, Tutorial, Pause und HUD sind bei 568×320, 667×300 sowie 1280×720 sichtbar und bedienbar. Kein neuer horizontaler Überlauf, keine neu abgeschnittenen interaktiven Labels, kein Titel über dem Hauptknopf; Screenshots/Vergleichsnotizen erforderlich.
- **E4:** Ein bestehender Spielstand behält Münzen, XP, Upgrades, Ausrüstung und Einstellungen nach dem Build; keine Änderungen an `dist/core.js`, `dist/game.js` oder dem Save-Format.
- **E5:** Die 21 vorhandenen Tests und Syntaxprüfungen bestehen; Balance-/Kampfwerte sind gegenüber der Baseline unverändert.
- **E6:** Leistung mit Effekten erreicht laut Teamziel mindestens 30 FPS auf einem Mittelklasse-Handy. Ohne echte fünfminütige Messung als **NICHT PRÜFBAR** ausweisen; keine Freigabe behaupten.

## Auflagen und Feel-Spezifikation

Der Richter verlangt einen engen Font-Diff, Netz-/Offline-Test, Layoutkontrolle aller genannten Screens, Save-Regression und keine Nebenänderung des Hochformat-Konflikts. Der Jugendwächter gibt das Konzept frei, verlangt aber Lesbarkeit und einen echten Netzbeleg. Der Balancer setzt **keine** neuen Werte: Startblaster 18 Schaden/0,43 s, Level-1-Wellen 10/13/16, erstes Upgrade ab 90 Münzen + 1 Punkt, Boss in Level 30 bleiben identisch.

| UI-Bereich | Auslöser/Dauer | Darstellung und Lesbarkeitsregel | Ton / Leistung |
| --- | --- | --- | --- |
| Fließtext, Buttons, HUD, Tutorial | Seitenaufbau, statisch | System-UI-Stack; bestehende Akzentfarben/Größen; keine neuen Umbrüche oder Clippings | Kein neuer Ton; kein Download, DOM- oder Effektzuwachs. |
| Titel, Karten-/Levelzahlen, Toasts | Seitenaufbau oder bestehender Toast | Schmaler lokaler Display-Stack; Titel überlagert keine Aktion, Werte bleiben sichtbar | Bestehende Animation/SFX unverändert. |
| Canvas-/Bosstext | Bestehendes Rendering | Bestehende `sans-serif`-Zeichnung unverändert | Kein zusätzlicher Canvas-Aufwand. |

Stil: dunkles Marine, Cyan und Gold, gerundete Stickman-Linien. **Assets/Lizenz:** kein neues Asset; geräteseitige Systemfonts. Textkontrast, Tastaturfokus, Stummschalter und reduzierte Bewegung bleiben wie im Bestand. Die bekannten kleinen Touchziele und Kleinschrift sind separate Folgefelder. Echte iOS-/Android-Fontvarianten, 200%-Zoom und Screenreader gelten ohne Test als offen.

## Übergabe und bekannte Grenzen

Geplant ist ausschließlich `dist/style.css`. Die Baseline hat keine Botdaten, fünfminütigen FPS-/Speicherlauf, echte Touch-Emulation oder Realgerätetests. Aus einem CSS-Diff allein folgt keine Freigabe für E1–E3/E6; QA muss die tatsächlich ausgeführten Teile belegen und alles andere als nicht prüfbar markieren.
