# Zyklus 2 – Design & Build: Siege-Orden

**Urteil A:** Idee 1 gewählt (`JUDGMENTS.md`). Branch `gameforge/cycle-2-original-heroes` basiert unabhängig auf v12-`main`; Zyklus 1 ist nicht übernommen. Genau eine Inhaltsänderung: sechs bereits vorhandene kaufbare Skins erhalten eine eigenständige Identität. Keine neue Waffe, kein neues Upgrade, keine andere Balance oder Spielregel.

## Spielerfantasie, Schleife und Entscheidungen

Der Spieler verdient Münzen, kauft eine der sechs Figuren des Siege-Ordens und erkennt sie an einem eigenen Umriss und Angriffssymbol wieder. Kosten, Kauf-/Ausrüstungsentscheidung, Cooldowns und Spezialwirkungen bleiben wie bisher. Die neue Gestaltung soll aus dem Spiel selbst verständlich sein, ohne Kenntnis anderer Figuren.

## Verbindliche Figuren-Tabelle

Die Spalte „ID“ ist ausschließlich eine **alte Speicherkennung**. Sie bleibt erhalten, damit bestehende Käufe nicht verschwinden. Namen, Farbmuster, Umriss und sichtbares Angriffsbild ersetzen die bisher bekannten Anleihen vollständig.

| Legacy-ID | Neuer sichtbarer Name | Körper / Akzent | Silhouette und Symbol | Angriffsbild bei gleicher Wirkung |
| --- | --- | --- | --- | --- |
| `spider` | EISLOTSE | eisweiß / tiefes Petrol | eine seitliche Kristallfinne; `◇` | sechsseitige Frostlinse verlangsamt statt Netzsymbol |
| `bat` | ORBITWÄCHTER | dunkles Violett / Türkis | offener Schulterring; `◎` | rotierende geschlossene Scheibe statt Fledermausform |
| `wolverine` | KUPFERDUELLANT | Aubergine / Kupfer | diagonaler Schulterbügel; `◜` | eine breite, gebogene Klinge statt Dreifachklauen |
| `hulk` | BASALTWÄCHTER | Schieferblau / Bernstein | kantiger Kopf und Blocktorso; `▣` | bestehender Bodenring ohne grün-violettes Riesenbild |
| `iron` | PRISMENLOTSE | Mitternachtsblau / Koralle | asymmetrische Schulterlinse; `△` | Prisma-Strahl aus der Hand statt Brustreaktor/Visier |
| `thor` | FUNKENARCHIVAR | Creme / Purpur | zwei kurze seitliche Spulen; `⌁` | Kettenfunken ohne Umhang oder Hammer |

`soldier` und `ninja` bleiben unverändert. Geometrische Formen sind bewusst einfach für Canvas-Stickmen. Farben sind sekundär: Finne, Ring, Bügel, Block, Linse und Spulen müssen auch in Graustufen auseinanderzuhalten sein.

## Regeln, Randfälle und Balance

- Legacy-IDs, `ownedSkins`, aktiver `skin`-Wert und Backup-Format bleiben stabil. Ein v12-Spielstand mit allen sechs Käufen muss ohne Datenverlust laden.
- Balancer-Startwerte: Preise 2.200 / 2.700 / 3.100 / 3.500 / 3.900 / 4.400 Münzen; Spezialschaden, Reichweiten, Piercing/Slow, Zielzahl und Cooldowns unverändert. Keine Balance-Konfig-Änderung.
- Angriffsdauern bleiben: Spezialanimation 0,48 s; Frostlinse 1,2 s Projektil-Lebensdauer, Orbitscheibe 1,1 s, Sichel 0,3 s, Bodenring 0,45 s, Prisma 0,26 s, Kettenfunken 0,25 s. Bestehende SFX, Shake, Partikelzahlen und Shadow-Budget bleiben.
- Es werden keine fremden Grafikdateien oder Schriften eingebaut. Canvas-Code und Unicode-Symbole sind projektintern. Die Lizenzliste dokumentiert die neuen Motive.
- Der bekannte Google-Fonts-Import im v12-Basestand bleibt ein **separater, nicht behobener Freigabepunkt** aus Zyklus 1. Dieser Branch ändert keine CSS-Datei.

## Erfolgskriterien E1–E7

- **E1:** Alle sechs Shop-Namen, -Symbole, Farben und Beschreibungen entsprechen der Tabelle; README enthält keine alten sichtbaren Fremdfigurennamen.
- **E2:** Jede Figur hat im Canvas eine von Farbe unabhängige Form. Die alten Spinnenaugen, Fledermausohren/-umhänge, Dreifachklauen, Brustreaktoren und Hammerbilder erscheinen nicht mehr. QA dokumentiert Bilder der sechs Figuren mindestens in einer Karte und prüft ihre Unterscheidbarkeit.
- **E3:** Die sechs Spezialangriffe zeigen die neuen Angriffsformen, aber ihre numerischen Werte, Cooldowns, Reichweiten, Slow/Pierce/Zielzahl bleiben gegenüber v12 identisch. Keine zusätzlichen Partikel oder SFX.
- **E4:** Ein v12-JSON-Spielstand und ein Backup mit sechs gekauften Skins behalten Münzen, XP, Upgrades, alle `ownedSkins` und die aktive Auswahl nach Laden/Backup-Roundtrip. Verlust ist blockierend.
- **E5:** Die vorhandenen 21 Tests, Syntax und eine gezielte Altstand-Regression bestehen; Shop/Ausrüstung/Angriffe sind bei 568×320, 667×300 und 1280×720 prüfbar.
- **E6:** Fünfminütiger Hochlasttest auf repräsentativem Mittelklasse-Handy mit mindestens 30 FPS und Speicherbeobachtung. Ohne echte Messung **NICHT PRÜFBAR**, keine Annahme.
- **E7:** Jugendschutz: Cartoon ohne Blut, keine neuen externen Anfragen, Käufe nur mit erspielten Münzen, keine neuen schnellen Blitze; Lizenz-/Originalitätsprüfung ist eine Gestaltungsprüfung, keine juristische Garantie.

## Feel-Spezifikation, Übergabe und Grenzen

Auslöser der bestehenden Animationen ist weiterhin der normale Schuss mit bereitstehender Spezialfähigkeit. Dauer, Intensität und Ton bleiben wie oben; nur gezeichnete Formen und Farben wechseln. Kontrast auf dunkler Karte, klare Silhouette und Form statt Farbe allein sind Pflicht. Keine neuen Assets; `ASSET_LICENSES.md` wird ergänzt.

Der Designer ändert `dist/core.js`, die visuellen Skin-/Projektil-/Effektpfade in `dist/game.js`, `README.md` und einen sinnvollen Save-Regressions-Test. `dist/style.css`, Speicherformat, Shop-Kaufregeln und Feind-/Bossdaten bleiben unangetastet. QA bekommt diesen Branch, die Dateiliste und E1–E7. Ein echter iOS-/Android-Test, vollständige Netz-/FPS-Messung und Rechtsprüfung sind im bisherigen Arbeitsumfeld nicht belegt.
