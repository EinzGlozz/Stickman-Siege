# Zyklus 1 – Recherche und Ideen

Stand: 8. November 2026. Priorität 1 des Richters ist die externe Schriftanfrage. Jede Zeile ist ein **eigener** möglicher Zyklus; in Zyklus 1 wird höchstens eine davon gewählt.

## Recherche: drei Primärquellen

| Quelle | Kernidee und Übertragbarkeit |
| --- | --- |
| [MDN: `font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-family) | `system-ui` nutzt die UI-Schrift des Geräts. Eine System-Font-Stack benötigt keine heruntergeladene Schrift; für Stickman Siege ist sie ein kleiner, wartbarer Ersatz für den externen Import. Die konkrete Textbreite muss in den Spielansichten geprüft werden. |
| [web.dev: Best practices for fonts](https://web.dev/articles/font-best-practices) | Webfonts können Texterscheinen verzögern und beim Austausch Layoutverschiebungen erzeugen; Self-Hosting entfernt eine Drittverbindung, ist aber nicht pauschal schneller. Für den kleinen Offline-Shooter ist eine Systemschrift der einfachste erste Versuch; Aussehen und Lesbarkeit müssen gemessen werden. |
| [MDN: PWA-Caching](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching) | Offline-Funktion hängt davon ab, dass benötigte HTML-, CSS-, JS-, Bild- und Font-Ressourcen erreichbar oder gecacht sind. Ein lokaler Font-Stack beseitigt eine besondere externe Abhängigkeit des bestehenden Service Workers. Ein echter Offline-/Netzwerktest ist weiter nötig. |

Es wurden nur Prinzipien recherchiert, kein fremder Code und kein fremdes Asset übernommen. Die drei Quellen begründen die Schriftentscheidung; sie belegen keine FPS-, Spielerlebnis- oder Datenschutzmessung des bestehenden Spiels.

## Acht Kandidaten

Bewertung 1–5: Spaß (S), Neuheit (N), Passung (P), geringer Aufwand (A: 5 = wenig), geringes Risiko (R: 5 = wenig). Alle Kandidaten sind für 10- bis 16-Jährige grundsätzlich geeignet; konkrete Umsetzung und Jugendprüfung bleiben nötig.

| Nr. | Idee / Spielerfantasie und Kernschleife | S | N | P | A | R | Größtes Risiko / betroffene Dateien |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | **Schrift ohne Netz:** Das Spiel ist auf dem Handy sofort lesbar, auch ohne Font-Verbindung. Menü öffnen → Systemschrift sehen → spielen. | 2 | 1 | 5 | 5 | 5 | Andere Textbreiten können kleine Boxen sprengen; `dist/style.css`. |
| 2 | **Eigene Heldenidentität:** Skins behalten ihre Fähigkeiten, erhalten aber eigene Namen und klar eigene Optik. Coins verdienen → Skin kaufen → Fähigkeit nutzen. | 4 | 3 | 5 | 3 | 3 | Alter Save darf Skin-ID nicht verlieren; `dist/core.js`, `dist/game.js`, CSS/Assets, README. |
| 3 | **Ruhiges Trefferfeedback:** Treffer bleiben eindeutig, ohne schnelles Blinken oder starken Vollbildimpuls. Gefahr erkennen → reagieren → geschützt weiterkämpfen. | 3 | 2 | 5 | 4 | 4 | Zu wenig visuelles Feedback; `dist/game.js`, `dist/style.css`. |
| 4 | **Daumenfreundliche Menüs:** Pause, Shop und Tutorial lassen sich auf kleinem Querdisplay zuverlässig treffen. Wählen → bestätigen → spielen. | 3 | 1 | 5 | 3 | 4 | Mehr Platzbedarf/Überlappung; `dist/style.css`, eventuell `dist/index.html`. |
| 5 | **Sicherer Speicherstand:** Alte Speicherstände behalten Münzen, XP und Ausrüstung über Updates. Speichern → Update → fortsetzen. | 2 | 1 | 5 | 3 | 3 | Migrationsfehler; `dist/core.js`, `dist/game.js`, Tests. |
| 6 | **Messbare Trainingsarena:** Ein reproduzierbarer QA-Modus kann Anfänger, Normal und Profi simulieren. Level seedbar starten → Aktionen einspeisen → Rohdaten ausgeben. | 1 | 2 | 4 | 2 | 3 | Testhook greift ungewollt ins Spiel; `dist/game.js`, QA-Tools/Tests. |
| 7 | **Früher Schattenboss:** Ein kleiner, lesbar angekündigter Boss erscheint vor Level 30 als Zwischenziel. Wellen schaffen → Signal erkennen → Mini-Boss besiegen. | 5 | 4 | 4 | 2 | 2 | Balance, neue Warnformen und Belohnung brauchen Botdaten; `dist/core.js`, `dist/game.js`, Balance-Konfig. Verhalten: klar telegraphierter Sturmangriff; Schwäche: seitliches Ausweichen; Belohnung: bestehende Münzen/XP. Nur Konzept, keine Umsetzung in Zyklus 1. |
| 8 | **Jede Mehrschuss-Stufe wirkt:** Kauf gewährt sofort einen sichtbaren zusätzlichen Effekt. Münzen/Skillpunkt investieren → Schussbild vergleichen. | 4 | 2 | 5 | 3 | 3 | Schussdichte/Balance kann kippen; `dist/game.js`, Balance-Konfig, Tests. |

**Top 3 für Runde 1:** 1, 2, 3 in dieser Reihenfolge gemäß Richterpriorität. Schwächen ehrlich: Idee 1 steigert den Spielspaß kaum direkt; Idee 2 benötigt Rechte-/Designarbeit und Save-Sicherheit; Idee 3 benötigt echte Sinnes- und Lesbarkeitsprüfung. Die anderen Kandidaten bleiben getrennte mögliche Zyklen. Hochformat wird nicht vorgeschlagen, weil alte Nutzerpräferenz und neue Protokollregel einander widersprechen.
