# Zyklus 2 – Recherche und Ideen

Stand: 8. November 2026. Ausgangspunkt ist der spielbare v12-Hauptzweig. Zyklus 1 (lokale Systemschrift) ist als eigener Entwurf noch nicht angenommen. Zyklus 2 prüft daher **eine** unabhängige Änderung; er übernimmt den Font-Diff nicht. Richterpriorität 2 aus Zyklus 0: ungeklärte Rechte an bekannten Heldenskinnamen und -bildern.

## Drei Primärquellen und übertragbare Prinzipien

| Quelle | Kernidee | Übertragung auf Stickman Siege |
| --- | --- | --- |
| [WIPO: Character Merchandising](https://www.wipo.int/copyright/en/docs/wo_inf_108.pdf) | Erkennbare Figuren können sich durch Namen, Aussehen und Symbole ausdrücken; verschiedene Schutzrechte können eine Rolle spielen. | Bekannte Namen zu entfernen reicht als Designmaßnahme nicht aus. Silhouette, Farbverteilung, Symbole und Angriffsbild müssen eine eigene Identität bilden. Das ist ein Risikohinweis, keine rechtliche Einstufung. |
| [Riot Games: Gameplay Clarity](https://www.riotgames.com/en/news/valorant-shaders-and-gameplay-clarity) | Lesbare Silhouetten und Kontrast helfen, Figuren im Kampf zu erkennen, auch bei reduzierter Grafikqualität. | Sechs neue Stickman-Skins erhalten verschiedene Kopfformen, Rückenformen oder Waffen-Umrisse; sie bleiben ohne Farberkennung unterscheidbar und erzeugen keine zusätzliche Effektlast. Keine Gestaltung oder Assets der Quelle werden kopiert. |
| [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) | `localStorage` speichert Strings; Spielobjekte werden serialisiert und beim Laden wieder gelesen. | Bestehende Skin-IDs sind gespeicherte Besitzdaten. Anzeigenamen/Zeichnung können sich ändern, die IDs bleiben in diesem Zyklus stabil; alte JSON- und Backup-Stände müssen nach dem Build dieselben Käufe enthalten. |

## Fünf Kandidaten

Bewertung 1–5: Spaß (S), Neuheit (N), Passung (P), geringer Aufwand (A; 5 = wenig), geringes Risiko (R; 5 = wenig). Alle Ideen sind für 10–16-Jährige grundsätzlich geeignet; die Konzepte sind noch keine Build-Freigabe.

| Nr. | Idee, Spielerfantasie und Kernschleife | S | N | P | A | R | Größtes Risiko / Module |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | **Siege-Orden:** Sechs kaufbare Stickman-Helden werden zu eigenständigen Figuren mit eigenen Namen, Formen und Angriffsbildern. Münzen sammeln → Figur kaufen → vorhandene Spezialfähigkeit nutzen. | 4 | 4 | 5 | 2 | 2 | Eine bloße Umbenennung könnte weiterhin an Drittfiguren erinnern; zu viele Zeichenänderungen oder verlorene Skin-IDs. `dist/core.js`, `dist/game.js`, README, Tests. |
| 2 | **Ruhiges Trefferfeedback:** Schaden und Schutzphase bleiben erkennbar, ohne schnelles Blinken/roten Vollbildimpuls. Treffer sehen → ausweichen → HP lesen. | 3 | 2 | 5 | 4 | 4 | Gefahrenfeedback könnte zu schwach werden; `dist/game.js`, ggf. CSS. |
| 3 | **Daumenfreundliche Menüs:** Alle Nebenaktionen sind im kleinen Querformat sicher zu treffen. Pause/Shop/Tutorial öffnen → Aktion wählen. | 3 | 1 | 5 | 3 | 4 | Platzbedarf/Überlappung; `dist/style.css`, ggf. `dist/index.html`. |
| 4 | **Sicheres Save-Schema:** Alter Fortschritt übersteht spätere Updates. Speichern → Version wechseln → weiterspielen. | 2 | 1 | 5 | 3 | 3 | Fehler in Migration könnten Käufe verlieren; `dist/core.js`, `dist/game.js`, Tests. |
| 5 | **Messbare Trainingsarena:** QA kann wiederholbar Kämpfe in drei Stufen simulieren. Seed wählen → Aktionen abspielen → Daten auswerten. | 1 | 2 | 4 | 2 | 3 | Debugpfad könnte Produktion beeinflussen; `dist/game.js`, Testwerkzeuge. |

**Top 3:** 1 → 2 → 3, entsprechend Richterpriorität 2–4. Schwächste Punkte: Idee 1 hat hohen Design- und Save-Aufwand und erfordert besonders strenge Eigenständigkeitsprüfung; Idee 2 braucht tatsächliche Wahrnehmungsprüfung; Idee 3 kann den ohnehin engen 568×320-Bildschirm überladen. Hochformat bleibt wegen widersprüchlicher Nutzer-/Protokollvorgaben außerhalb dieses Zyklus.
