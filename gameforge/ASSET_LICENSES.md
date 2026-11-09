# Asset- und Lizenzliste (Bestandsaufnahme)

| Asset | Quelle / Erstellung | Lizenzstatus |
| --- | --- | --- |
| Figuren, Karten, Effekte | Canvas-Zeichencode in `dist/game.js` | Im Projekt erzeugt; keine separate Datei-Lizenz dokumentiert. |
| Musik und SFX | WebAudio-Erzeugung in `dist/game.js` | Im Projekt erzeugt; keine externe Audiodatei. |
| App-Icon SVG | `dist/icon.svg` | Im Projekt vorhanden; Urheber-/Lizenzangabe im Repo fehlt. |
| PNG-Icons | `dist/icon-192.png`, `dist/icon-512.png`, generiert mit `tools/generate_icons.py` | Im Projekt erzeugt; Skript im Repo, Urheber-/Lizenzangabe fehlt. |
| UI-Schrift | Google-Fonts-Import in `dist/style.css:1` | Externe Anfrage; konkrete Schrift-/Lizenzdatei nicht lokal dokumentiert. Vor neuem Release klären oder Systemschrift verwenden. |
| Benannte Heldenskins | Namen/Farben in `dist/core.js:59–67`, Canvas-Zeichnung | Nutzungsrechte an bekannten Drittfiguren nicht dokumentiert; vor öffentlicher Weiterentwicklung klären oder eigenständige Figuren einsetzen. |

Diese Liste ist eine Bestandsaufnahme, keine Rechtefreigabe. Neue Assets sind künftig einzeln mit Quelle und Lizenz zu ergänzen.

## Zyklus 2 · Historie des separaten Branches `gameforge/cycle-2-original-heroes`

Diese Figuren sind **nicht im Zyklus-3-Build enthalten**. Auf dem separaten Zyklus-2-Branch bestehen Eislotse, Orbitwächter, Kupferduellant, Basaltwächter, Prismenlotse und Funkenarchivar aus neuem Canvas-Zeichencode in `dist/game.js` und Dateneinträgen in `dist/core.js`. Quelle: projektintern entworfen; keine neue fremde Grafik- oder Audiodatei. Die Formen sind geometrisch (Finne, Ring, Bügel, Block, Linse, Spulen). Die unveränderten internen IDs dienen ausschließlich dazu, alte Käufe in Spielständen zu erhalten. Eine juristische Rechteprüfung oder Freigabe des gesamten Bestands ist damit nicht behauptet.

## Zyklus 1 · Arbeitsbranch

`gameforge/cycle-1-local-font` ersetzt die externen Schriftdeklarationen durch geräteseitige Systemfonts. Es wurde keine Fontdatei und kein neues Asset hinzugefügt. Die Tabelle oben bleibt die Dokumentation des v12-Ausgangsstands; ein Release ist für Zyklus 1 noch nicht freigegeben.

## Zyklus 3 · Trefferfeedback im Arbeitsbranch

Die bernsteinfarbenen Konturbögen und der lokale Trefferring entstehen ausschließlich aus projektinternem Canvas-Zeichencode. Keine neue Grafik-, Schrift- oder Audiodatei und keine zusätzliche externe Anfrage. Die offene Zyklus-1-Abhängigkeit bleibt bestehen.
