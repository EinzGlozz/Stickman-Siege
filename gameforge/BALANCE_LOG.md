# GameForge – Balancing-Log

## Zyklus 0 · 8. November 2026

**Status: KRITISCH (statische Codeanalyse).** In Zyklus 0 wurden keine Werte geändert. Bot-Läufe und echte Spielzeitmessungen fehlen.

| Kennzahl | Richtziel aus Team-Protokoll | Ermittelter Ist-Zustand |
| --- | --- | --- |
| Erster Boss | nach etwa 6–10 Minuten | Boss in Level 30. Selbst bei sofortigen Kills liegt die rechnerische Untergrenze für Level 1–29 bei 16,09 Minuten; Kampf- und Menüzeit kommt hinzu. |
| Runde | 3–8 Minuten | Nicht gemessen; rechnerische Untergrenze für Level 1: 28,36 Sekunden. |
| Erste Upgradechance | nach 1–2 Minuten | Billigstes Upgrade: 90 Münzen und 1 Skillpunkt; erster Skillpunkt bei 60 XP. Kaufzeit nicht gemessen. |
| Anfänger-/Profi-Erfolg | Wellen- und Bossquoten laut Protokoll | Ohne Bot-Läufe nicht bestimmbar. |
| Upgradevielfalt | keine wirkungslosen oder dominanten Wahlen | Mehrschuss-Stufen 1 und 3 gewähren durch `Math.floor(save.upgrades.multi/2)` keinen zusätzlichen Schuss, kosten aber 180 beziehungsweise 416 Münzen und Skillpunkte. Dominanz anderer Upgrades nicht bestimmbar. |
| Münz-/XP-Rate | Fortschritt ohne Inflation/Sackgasse | Bei vollständig gesammelten Drops in Level 1 rechnerisch 15,34 Münzen und 13,03 XP je Kill im Erwartungswert; echte Sammelrate nicht gemessen. |

Belege: `dist/core.js:8–18,27,81–84` und `dist/game.js:208,385,393`; Berechnung des Balancer-Agenten. Der Startblaster hat rechnerisch 41,86 Roh-DPS, mit Schadensstufe 1 etwa 51,16 und mit Feuerratenstufe 1 etwa 46,51. Diese statischen Werte erlauben keine Aussage zur tatsächlichen Upgrade-Wahl oder Erfolgsquote.

**Nächste Messlücke:** Eine reproduzierbare Spiel-/Bot-Schnittstelle muss in einem eigenen Zyklus entstehen, bevor Spielzeit, Schwierigkeit und Inflation belastbar beurteilt werden können.

## Zyklus 1 · Build-Review · 8. November 2026

**Status: WARNUNG.** Der Schriftwechsel ändert laut Diff nur `dist/style.css`; 21/21 Tests bestehen. Startblaster, Wellen, Upgrade-/XP-Preise und Bossposition sind statisch unverändert. **Wertänderungen: 0.** Empirische Verhaltensgleichheit bleibt ohne Botläufe offen; die kritischen Zyklus-0-Befunde zu Mehrschuss und Bosszeit bleiben bestehen. Der QA-Status für Urteil B lautet NICHT BESTANDEN wegen anderer offener Nachweise.

## Zyklus 2 · Build-Review · 8. November 2026

**Status: WARNUNG.** Sechs Skin-Identitäten ändern sichtbare Daten und Zeichnung, aber keine Preise oder numerischen Spezialwerte. 0 Wertänderungen. Ein mit v12-Code aus `main` erzeugter Stand und Backup erhalten sechs Käufe; 23/23 Tests bestehen. Kauf-/Trefferquoten und Handy-FPS/Heap fehlen. Die Mehrschuss- und Bosszeit-Befunde bleiben separate Aufgaben.
