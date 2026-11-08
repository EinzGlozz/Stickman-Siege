# GameForge – Game-Feel-Log und Stil-Leitfaden

## Zyklus 0 · 8. November 2026

**Status: WARNUNG.** Codeprüfung durch den Game-Feel-Agenten, kein Wahrnehmungstest mit echten Spielern. Es wurden keine Assets und keine Spiellogik geändert.

| Prüfpunkt | Befund |
| --- | --- |
| Aktionsfeedback / Stil | OK: gerundete Canvas-Stickmen, Partikel, Ringe, kurze SFX (`dist/game.js:396,505–552`). |
| Lesbarkeit / Touch | Mangel: Shop-Kaufknopf etwa 38 px, Pause etwa 42 px; im kleinen Querformat teils 8–11 px Schrift (`dist/style.css`). |
| Bosswarnung | Sichtbare Warnformen und Namen vorhanden (`dist/game.js:461–481`); vor Auflösung kein eigener Warnton. |
| Sound | Getrennte Musik-/SFX-/Master-Pegel und Kompressor (`dist/game.js:42–72`); Hörtest ausstehend. |
| Barrierefreiheit | Partikel und Shake sind einstellbar; Trefferblinken mit etwa 18-Hz-Zeitbasis und roter Vollbildimpuls berücksichtigen reduzierte Bewegung nicht vollständig (`dist/game.js:317,524,564`). |
| Leistung | Nicht prüfbar: keine fünfminütige FPS-/Speichermessung; Partikel/Effekte ohne Pooling. |

**Bestehender Stil:** dunkles Marine `#080f1d`, Cyan `#54e4df` als UI-Akzent, Gold `#ffd078` für Münzen, Hellblau `#9bdcff` für XP, karteneigene Akzente aus `dist/core.js:10–16`. Figuren aus runden Linien mit ungefähr 5–6 px Körper-/Beinstrich und etwa 10 px Kopfradius; Monstersilhouetten unterscheiden sich. Treffer-/Pickup-Effekte dauern ungefähr 0,18–0,6 s. SFX sind kurze WebAudio-Oszillator-Klänge; Musik hat eigenen Pegel.

**Priorisierte Verbesserungen:** (1) Touchziele auf mindestens 48 px und kleine Schrift lesbar machen. (2) Schnelles Blinken/Vollbildimpuls auf reduzierte Effekte abstimmen. (3) Sanften Boss-Vorwarn-SFX ergänzen. (4) Effektlast messen und Budget/Pooling in eigenem Zyklus planen. (5) Externe Schrift ersetzen und Asset-Lizenzen dokumentieren.

## Zyklus 1 · Build-Review · 8. November 2026

**Status: WARNUNG.** Die geprüften Hauptaktionen und der dunkle/Cyan-Stil bleiben mit Systemfonts sichtbar. Keine neuen Animationen, SFX, Canvas-Effekte oder Assets. Vollständige Layoutmatrix, echte iOS-/Android-/Windows-Font-Fallbacks, Touch, 200%-Zoom und fünfminütige Lastmessung fehlen. Kein neuer kritischer Feel-Defekt belegt; QA bleibt NICHT BESTANDEN. Nächste Prüfungen: alle Screens/Viewports, Font-Fallback, Netz-/SW-Zustand, mobile Last. Touchgröße bleibt separater Zyklus.
