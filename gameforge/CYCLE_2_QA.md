# Zyklus 2 – QA-Bericht

**Status: NICHT BESTANDEN für Urteil B.** 8. November 2026, Branch `gameforge/cycle-2-original-heroes`. QA hat keine Dateien geändert. Browser und echtes Handy waren in diesem Agentenlauf nicht verfügbar (`browsers: []`); visuelle und Leistungswerte werden nicht behauptet.

| Kriterium | Status | Tatsächlicher Beleg / Grenze |
| --- | --- | --- |
| E1, sechs Shop-Identitäten | **TEILWEISE ERFÜLLT** | `dist/core.js` enthält sechs neue Namen, Icons, Farben und Angriffsnamen; `dist/game.js` verwendet sie im Shop, README wurde angepasst. Gerenderte Karten nicht gesehen. |
| E2, unterscheidbare Figuren | **NICHT PRÜFBAR** | Sechs andere Zeichenzweige sind im Code. Screenshots, Graustufen- und Kleingrößenvergleich fehlen. |
| E3, eigene Spezialangriffe | **TEILWEISE ERFÜLLT** | Neue Form-/Projektilpfade implementiert; Zahlen für Schaden, Reichweite, Slow/Pierce/Zielzahl, Cooldowns blieben im Diff. Gerenderte Angriffe und Effektbudget ungeprüft. |
| E4, v12-Spielstand | **ERFÜLLT im automatisierten Test** | Mit `main:dist/core.js` erzeugter v12-Stand und Backup wurden mit neuem Code gelesen. 6 Käufe, aktiver Skin, 6423 Münzen, 243 XP, Upgrades, Waffen, Musik 42 und Preise blieben. Echter Browser-Spielstand fehlt. |
| E5, Tests/Viewports | **TEILWEISE ERFÜLLT** | `node --test tests/*.test.js`: 23/23 bestanden (Baseline 21/21). JS-Syntax, Python-AST, `git diff --check` grün. Shop/Ausrüstung/Angriffe bei 568×320, 667×300, 1280×720 und Touch nicht geprüft. |
| E6, mobile Leistung | **NICHT PRÜFBAR** | Kein 5-Minuten-Lauf, keine FPS-/Heap-/Botdaten und kein echtes Mittelklasse-Handy. |
| E7, Jugend/Release | **NICHT VOLLSTÄNDIG ERFÜLLT** | Kein neues Blut, Echtgeldkauf oder externer Assetzugriff im geänderten Code. `dist/style.css:1` des unabhängigen v12-Basestands lädt weiter Google Fonts; separate Release-Auflage aus Zyklus 1. Menschliche Rechte-/Jugendprüfung fehlt. |

**Fehlerliste:** Kein neuer Laufzeitfehler reproduziert. Externer Font-Import bleibt ein bekannter Bestandsmangel. QA-0-01 Boss-Debugstart und QA-0-03 Save-Schema wurden hier nicht erneut funktional geprüft.

**Regression:** Testzahl 21→23, alle bestanden; Preis-/Save-Daten der sechs IDs kompatibel. Für Animation, Layout, Steuerung, Gegnerverhalten und Leistung ist ohne Browser/Gerät keine Regressionsaussage möglich. Bot-Rohdaten: keine. Feel-Daten/Screenshots: keine.
