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

## Zyklus 2 · Build-Review · 8. November 2026

**Status: WARNUNG.** Die sechs Namen, Icons und Canvas-Zweige sind gemäß Feel-Spezifikation im Code vorhanden; keine neuen SFX/Partikel/Dateiassets. Tatsächliche Silhouetten, Unicode-Glyphen auf iOS/Android, Spezialangriffe, Touch und fünfminütige Lastleistung wurden mangels Browser/Gerät nicht gesehen oder gemessen. Keine neue kritische Feel-Störung belegt; Wahrnehmungsurteile sind ANNAHMEN.

## Zyklus 3 · Feel-Spezifikation nach Urteil A · 8. November 2026

**Eine Funktion:** ruhiges Trefferfeedback. Keine Änderung an Schaden, HP, Schutzdauer, Cooldowns, Musik oder SFX-Werten. Der bestehende Stickman-Stil und das aktuelle Effektbudget bleiben Maßstab.

| Signal | Auslöser / Dauer | Form und Farbe | Ton / Effektregler / Leistung |
| --- | --- | --- | --- |
| Schutzphase nach echtem Treffer | `player.invuln > 0`, bestehende 0,55 s | Figur durchgehend sichtbar; zwei **stetige, getrennte** 120°-Bögen bei etwa 26–28 px Radius, helles Bernstein mit dunkler Kontur. Keine Helligkeitspulse. Der bestehende Unsterblichkeitsring bleibt ein geschlossener cyanfarbener Ring bei etwa 31 px und ist so auch ohne Farbe durch die Form unterscheidbar. | Kein zusätzlicher Ton. Maximal zwei kurze Canvas-Bögen pro Frame; kein Partikelobjekt für die Schutzkontur. Auch bei Partikelregler 0 und `prefers-reduced-motion` sichtbar. |
| Unmittelbarer Schaden | Tatsächlicher HP-Abzug; etwa 0,20–0,30 s lokales Feedback | Ein kurzer, eng um die Figur begrenzter Ring oder Doppelbogen, nie ein Vollbildimpuls. Der bestehende HP-Wert und der flüssige Verlustbalken zeigen den genauen Schaden; der Rand der vorhandenen Lebensanzeige darf für höchstens 0,3 s **stetig** heller werden, ohne Wippen oder Blinken. | Bestehendes `sfx('hurt')` unverändert und über Master/SFX stumm schaltbar. Bei Partikelregler 0 oder reduzierter Bewegung entfällt die dekorative Ringanimation; Schutzbögen und HP-Änderung bleiben. Keine zusätzlichen Partikel über die bisherigen 12 hinaus, vorzugsweise weniger. |
| Kamera | Nur beim tatsächlichen Treffer | Erschütterung höchstens so stark wie bisher, vorzugsweise auf etwa 3–4 statt 7 interne Einheiten begrenzt; keine neue Bewegung. | `settings.shake=0` und `prefers-reduced-motion` unterdrücken den Treffer-Shake. Andere Boss-/Kill-Shakes gehören nicht in diesen Zyklus. |

**Stil und Lesbarkeit:** gerundete Linien von ungefähr 2–3 px für Signalbögen; helle Form mit dunkler Begrenzung auf allen sechs Karten. Die Schutzform darf Projektilrichtung, Boss-Warnsignal oder Powerup-Ring nicht verdecken. Form, Ort und HP-Zahl tragen die Information, nicht Farbe oder Ton allein. Kein 18-Hz-Ausblenden der Figur und keine rote Bildschirmfüllung; damit gibt es durch diesen Trefferpfad keinen neuen großflächigen Helligkeitswechsel.

**Assets/Lizenzen:** nur projektinterner Canvas-/CSS-Code; keine neuen Grafik-, Font- oder Audiodateien, keine externe Anfrage. Die bestehende Assetliste bleibt gültig. **Performance-Budget:** den bisherigen Vollbild-Draw und das Ausblenden ersetzen, keine zusätzlichen dauerhaft lebenden Effekte oder WebAudio-Knoten. Tatsächliche FPS und Speicher sind zu messen und werden hier nicht behauptet.

**QA-/Barrierefreiheitsprüfung:** bei 568×320, 667×300 und Desktop sowie mit Partikelwert 0/100, Shake 0/100, Ton aus/an und `prefers-reduced-motion` einen einzelnen Treffer, wiederholte Treffer und Bosschaos ansehen. Schutzphase und HP-Verlust müssen ohne Ton und in Graustufen unterscheidbar sein. Fünf Minuten hohe Mobile-Last mit FPS/Heap und echte Wahrnehmungstests bleiben erforderlich; ohne sie ist der Feel-Erfolg eine **ANNAHME**.

## Zyklus 3 · Build-Review · 9. November 2026

**WARNUNG.** Code trifft die Spezifikation im Kern; `moveTo` trennt die zwei Schutzbögen, neuer Ring bleibt lokal, kein Vollbildimpuls oder schneller Blink-Guard. 21 Tests und isolierte Trefferfälle bestehen. Bestehender Shake-Wert 7 und Partikelburst bleiben erhalten; reducedMotion unterdrückt den neuen Ring und Zeichnungs-Shake. Keine neue kritische Regression belegt. Lesbarkeit, Graustufen, Touch, Bosschaos und fünfminütige mobile FPS-/Speichermessung fehlen. Details: `CYCLE_3_BUILD_REVIEWS.md`.
