# Zyklus 1 – QA-Bericht und ergänzende Browserprüfung

Stand: 8. November 2026, Branch `gameforge/cycle-1-local-font`. **QA-Gesamtstatus: NICHT BESTANDEN für Urteil B**, weil E1, E3 und E6 nicht vollständig belegt sind. Es wurde kein neuer Spieldefekt reproduziert.

| Kriterium | QA-Agent | Ergänzender Browser-Spotcheck durch DESIGNER |
| --- | --- | --- |
| E1, keine Drittanfrage | **NICHT PRÜFBAR als Ganzes.** `rg '@import|@font-face|https?://|url\(' dist/style.css` liefert keine Treffer. Kein vollständiges Browser-Netzprotokoll/SW-Update-Protokoll. | Neues lokales IAB-Tab bei laufendem Server geöffnet; `pageAssets.list()` zeigte nur lokale `style.css`, `core.js`, `game.js`. DOM-Stylesheets nur `127.0.0.1/style.css`. Dies ist eine Ressourcen-Stichprobe, kein vollständiger HAR-Mitschnitt. |
| E2, Offline-Start | **NICHT PRÜFBAR** im QA-Agent-Turn. | Lokalen Server auf Port 8770 nach Online-Start gestoppt; `curl` konnte ihn danach nicht erreichen. `tab.reload()` zeigte dennoch das komplette Startmenü; `getComputedStyle(document.documentElement).fontFamily` gab den neuen System-Stack aus. Das belegt einen Offline-Neustart in diesem IAB-Profil nach vorherigem Online-Laden, keinen frischen Offline-Installationsfall. |
| E3, Layout | **NICHT PRÜFBAR** im QA-Agent-Turn, da ihm kein Browser zur Verfügung stand. | IAB-Screenshots/AX bei 568×320: Startmenü, Shop, Levelauswahl, Tutorial, HUD, Pause; bei 667×300: Startmenü und Pause; bei 1280×720: Startmenü. Haupttexte und Aktionen sichtbar, `body.scrollWidth=clientWidth=568` im Startmenü, keine überlaufenden sichtbaren Shop-Buttons nach `scrollWidth/clientWidth`-Prüfung. 667×300 Pause zeigt „Zum Menü“ erst nach Scrollen; per AX-Klick erreichbar. Nicht alle sechs Screens wurden in allen drei Viewports verglichen; echtes Touch-Gerät fehlt. |
| E4, Spielstand | **ERFÜLLT für synthetischen Altstand.** Roundtrip behielt 731 Münzen, 52 XP, Damage 2, Health 1, Skin `spider`, Waffen `pistol`+`bow`, Musik 42. `core.js`, `game.js`, `sw.js` unverändert. | Kein echter v1-Browserstand geprüft. |
| E5, Regeln/Tests | **ERFÜLLT.** 21/21 Node-Tests, 0 Fehler, JS-Syntax erfolgreich; nur `dist/style.css` im Spiel geändert. | Designer wiederholte 21/21 Tests, 0 Fehler. |
| E6, Leistung | **NICHT PRÜFBAR.** Kein fünfminütiger Hochlastlauf, keine FPS-/Heapwerte, kein echtes Mittelklasse-Handy. | Keine weiteren Messungen. |

**Fehlerliste:** Kein neuer reproduzierter Codefehler. Die Baseline-Befunde QA-0-01 (Boss-Debugpfad) und QA-0-03 (kein Save-Schemafeld) bleiben außerhalb des Font-Zyklus. Der externe Import QA-0-02 ist im CSS entfernt, aber der vollständige Netzbeleg fehlt.

**Regression gegen Baseline:** Tests 21→21 und Syntax grün→grün; Balance-/Kampf-/Save-Code unverändert. Browser-Spotchecks zeigen keine neue Überlagerung der genannten Hauptaktionen, aber ein vollständiger Vorher/Nachher-Vergleich aller Viewports und Touch-Flows fehlt. FPS und Botdaten waren schon in Zyklus 0 unbekannt und bleiben unbekannt.

**Cache-Grenze:** `dist/sw.js` verwendet weiterhin `stickman-siege-v12` und network-first. Bei Online-Laden kann neues CSS in den Cache gelangen; ein neues SW-Installationsereignis ist durch den CSS-Diff nicht belegt. Der Offline-Spotcheck erfolgte nach einem Online-Laden der neuen CSS-Datei.

Die IAB-Screenshots wurden im Tool angezeigt, aber nicht als Projektdateien gespeichert. Es wurden keine Messwerte aus ihnen abgeleitet, die sie nicht enthalten.
