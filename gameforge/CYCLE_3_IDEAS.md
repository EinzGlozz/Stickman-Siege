# Zyklus 3 – Recherche und Ideen

Stand: 8. November 2026. Basis ist der noch nicht angenommene Zyklus-1-Zweig mit lokaler Systemschrift. Zyklus 3 bearbeitet genau **eine weitere Funktion** und enthält keine Skin-Änderungen aus Zyklus 2. Die Abhängigkeit von Zyklus 1 bleibt bis zu dessen Freigabe offen.

## Drei Primärquellen und Übertragung

| Quelle | Befund | Übertragung |
| --- | --- | --- |
| [W3C WCAG 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) | Mehr als drei große Blitze pro Sekunde überschreiten die genannte Schwelle. | Das heutige 18-Hz-Verschwinden der Spielfigur wird durch ein stetiges Schutzsignal ersetzt; kein vollflächiger roter Trefferimpuls. Eine formale Konformitätsprüfung bleibt offen. |
| [Microsoft Xbox Accessibility Guideline 118](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/118) | Frequenz, Kontrast und Fläche von Lichtwechseln sind relevante Risiken; kleinere, schwächere Effekte sind vorzuziehen. | Schadensfeedback wird auf Figur und HP-Bereich beschränkt; keine zusätzliche große Blitzfläche. |
| [Apple: Reduced Motion evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria) | Bewegungsarme Alternativen sollen Informationen erhalten, ohne unnötige Bewegung zu erzeugen. | Statische Kontur und HP-Verlust bleiben verständlich; systemseitige Bewegungspräferenz wird für neue Effekte berücksichtigt. |

## Sechs Kandidaten

Skala 1–5: Spaß (S), Neuheit (N), Passung (P), geringer Aufwand (A), geringes Risiko (R). Konzeptbewertung, keine Build-Freigabe.

| Nr. | Idee und Kernschleife | S | N | P | A | R | Risiko / Module |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | **Ruhiges Trefferfeedback:** Treffer sehen, HP lesen, Schutzphase erkennen und ausweichen; Figur bleibt sichtbar. | 3 | 2 | 5 | 4 | 4 | Zu schwaches Signal; `dist/game.js`. |
| 2 | **Daumenfreundliche Menüs:** Buttons im Querformat sicher treffen, ohne Nachbarn auszulösen. | 3 | 1 | 5 | 3 | 4 | Überlappung bei 568×320; CSS/HTML. |
| 3 | **Sicheres Save-Schema:** Alte Spielstände und Käufe bei Updates bewahren. | 2 | 1 | 5 | 3 | 3 | Migration kann Daten verlieren; Core/Tests. |
| 4 | **Messbare Trainingsarena:** feste Seeds und Inputspur für reproduzierbare Kampftests. | 2 | 2 | 4 | 2 | 3 | Debugpfad greift ins Spiel ein; Testwerkzeug/Game. |
| 5 | **Richtungsklarer Boss-Warnkreis:** Telegraph zeigt Fluchtseite; ausweichen, kontern. | 4 | 2 | 4 | 3 | 3 | Warnung zu kurz oder überladen; Game. |
| 6 | **Leiser Treffer-SFX:** begrenzte gleichzeitige SFX; Treffer akustisch lesen. | 3 | 2 | 4 | 4 | 4 | Kein klarer Ton auf Handy; Audio/Game. |

**Top 3:** 1 → 2 → 3. Idee 1 setzt Richterpriorität 3 aus Zyklus 0 um. Schwachpunkt ist die Wahrnehmung des Schadens unter Kampfbelastung; die folgende Designprüfung muss lesbaren HP-Verlust und Schutzphase festlegen. Mobile Screenshots und echte Wahrnehmungstests sind hier noch nicht verfügbar.
