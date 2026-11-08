# GameForge – Urteilsarchiv

## Zyklus 0 · Bestandsurteil · 8. November 2026

**Urteil:** Die Bestandsaufnahme ist als Ausgangspunkt brauchbar. Es gibt noch keine Freigabe für ein neues Feature oder einen Merge (kein Urteil A/B). Die folgenden Handlungsfelder sind nach Wirkung und Aufwand priorisiert. Jedes ist bei Umsetzung als eigener, begrenzter Zyklus zu behandeln. Zyklus 0 ändert den Spielcode nicht.

| Rang | Handlungsfeld | Wirkung / Aufwand | Begründung und nächster prüfbarer Schritt |
| --- | --- | --- | --- |
| 1 | Externe Schriftanfrage entfernen | Hoch / niedrig | `dist/style.css:1` lädt Google Fonts. Das widerspricht der neuen Regel „keine externen Verbindungen“ und ist in `BASELINE.md` als QA-0-02 sowie in `YOUTH_LOG.md` als Auflage erfasst. Lokale oder Systemschriften einsetzen, anschließend Netzwerkanfragen und Layout in kleinen Querformat-Viewports prüfen. Ein Netzwerkmitschnitt liegt noch nicht vor; eine Datenweitergabe wurde nicht nachgewiesen. |
| 2 | Rechte an benannten Heldenskins klären | Hoch / mittel | `dist/core.js:59–67` enthält bekannte Marvel-/DC-Figurennamen samt charakteristischen Farben. Nutzungsrechte sind in `ASSET_LICENSES.md` nicht dokumentiert. Rechte belegen oder eigenständige Namen und Designs entwickeln; vor einer Umstellung bestehende Skin-IDs und Spielstände auf Erhalt prüfen. Dies ist ein Lizenzrisiko, keine hier getroffene Rechtsfeststellung. |
| 3 | Schnelles Trefferblinken und Vollbildimpuls entschärfen | Hoch / niedrig bis mittel | `dist/game.js:534` nutzt für die Unverwundbarkeitsanzeige eine 18-Hz-Zeitbasis; `dist/game.js:564` zeichnet einen roten Vollbildimpuls. `FEEL_LOG.md` und `YOUTH_LOG.md` verlangen eine Prüfung der Sinnesbelastung. Eine dauerhafte Kontur oder langsamere, reduzierte Anzeige soll Treffer klar zeigen; reduzierte Bewegung und Effektregler müssen wirken. Blitzfrequenz und Lesbarkeit sind noch nicht gemessen. |
| 4 | Touchziele und Kleinschrift im Handy-Querformat verbessern | Hoch / mittel | `dist/style.css:95` setzt den Pause-Knopf auf 36 × 36 px; der Shop-Kaufknopf ist 38 px hoch (`dist/style.css:2`). Die neue Vorgabe beträgt mindestens 48 × 48 px. `FEEL_LOG.md` nennt außerdem 8–11 px Schrift. Menüs, HUD und Tutorial in 568 × 320 und 667 × 300 px prüfen, Ziele vergrößern und Überlappungen sowie Bedienbarkeit per Touch testen. |
| 5 | Spielstand-Schema versionieren und Migration absichern | Hoch (präventiv) / mittel | `dist/game.js:8–17` lädt lokale Schlüssel `v3`/`v1`, aber das Save-Objekt hat kein eigenes Schemafeld (`dist/core.js:86–114`); die Backup-Version ist separat (`dist/core.js:132–138`). `BASELINE.md` zeigt nur einen konstruierten Legacy-Roundtrip, keinen echten Vorversions-Spielstand. Vor einer Formatänderung Schema-Version, explizite Migration und Regressionstest mit realem Altstand vorsehen. Aktueller Spielstandverlust ist **nicht** belegt. |

**Weitere belegte Punkte für spätere Zyklen:** Der QA-Boss-Direktstart wirft mit frischem Profil einen `TypeError` (QA-0-01 in `BASELINE.md`); der normale Start ist davon nicht als betroffen belegt. Mehrschuss-Stufen 1 und 3 kosten Münzen und Skillpunkte, ohne einen zusätzlichen Schuss zu geben (`BALANCE_LOG.md`; `dist/game.js:208` des dokumentierten Quellstands). Der erste Kartenboss liegt rechnerisch frühestens nach 16,09 Minuten statt beim neuen Richtziel von 6–10 Minuten; echte Spielzeitdaten fehlen. Ein deterministischer Bot-/Lasttest und fünfminütige FPS-/Speichermessungen fehlen ebenfalls. Diese Punkte sind keine getesteten Gameplay-Ergebnisse und keine Freigabe, mehrere Fixes in einen Zyklus zu packen.

**Ausrichtungskonflikt:** Der Nutzer hat zuvor ausdrücklich ausschließlich Querformat gewünscht. Das neue Team-Protokoll fordert Skalierung in Hoch- und Querformat (Abschnitt 3); der Ist-Stand sperrt Hochformat (`dist/style.css:102`, `dist/manifest.webmanifest`). Dies bleibt offen und ist **keine** Ermächtigung zum eigenmächtigen Hochformat-Umbau. Vor einem solchen Zyklus ist die Produktvorgabe zu klären. Die gegenwärtige Querformat-Bedienung wird unabhängig davon geprüft.

**Evidenzgrenzen:** Laut `BASELINE.md` bestanden 21 Node-Tests und drei Querformat-Viewport-Starts. Es gab keine echte Handyprüfung, keine Touch-Emulation, keinen fünfminütigen Lasttest, keine Bot-Läufe und keinen echten Altstand im Browser. Die statischen Balance- und Persona-Aussagen sind Annahmen beziehungsweise Rechnungen. Ein neuer Feature-Branch braucht später die im Protokoll geforderten Reviews und ein eigenes Urteil A/B.

**Lernhinweis an den DESIGNER:** Beginne mit Rang 1 als kleinstem eigenständigen Zyklus und formuliere messbare Kriterien für ausbleibende externe Anfragen sowie unveränderte Lesbarkeit. Halte die übrigen Funde getrennt, damit Ursache und Wirkung jeder Änderung überprüfbar bleiben.

## Zyklus 1 · Urteil A · 8. November 2026

**Urteil: GEWÄHLT – Idee 1 „Schrift ohne Netz“.**

**Begründung:** Der externe Google-Fonts-Import in `dist/style.css:1` widerspricht der neuen Regel gegen externe Verbindungen und steht auf Rang 1 der Zyklus-0-Prioritätenliste. Idee 1 beseitigt diesen belegten Befund mit dem kleinsten Eingriff; Befürworter und Kritiker ordnen sie nach Runde 2 beide vor Idee 3 und 2 ein (`CYCLE_1_ROUND_1_2.md`). Der Jugendwächter gibt sie mit Netz- und Lesbarkeitsprüfung frei, und der Game-Feel-Agent bewertet den Aufwand als gering. Der direkte Spielspaßgewinn ist klein; die Änderung sichert aber die Offline-Nutzung und schafft eine prüfbare Grundlage, bevor weitere Funktionen hinzukommen. Für Idee 2 bleiben Umfang, Lizenz- und Save-Fragen offen, für Idee 3 die noch ungeprüfte Wahrnehmung der Trefferanzeige.

**Design-Auflagen:**

1. Nur die Schriftversorgung als einen Zyklus ändern: externen Font-Import entfernen und einen Systemschrift-Stack für Fließtext und Überschriften festlegen. Keine neuen externen Assets oder Spielregeländerungen.
2. Nach frischem Laden und mit aktualisiertem Service-Worker-Cache per Netzwerkanalyse prüfen, dass das Spiel keine Font- oder sonstigen Drittanfragen auslöst; Offline-Start separat prüfen. Ein bloßer Quelltextbefund genügt für Urteil B nicht.
3. Menü, Shop, Levelauswahl, Tutorial, Pause und HUD bei 568 × 320, 667 × 300 und einem Desktop-Viewport auf Umbrüche, abgeschnittene Texte und Lesbarkeit vergleichen. Mindestens die bestehenden bedienbaren Bereiche müssen erhalten bleiben; Abweichungen dokumentieren.
4. Einen vorhandenen Spielstand mit Münzen, XP, gekaufter Ausrüstung und Einstellungen vor/nach dem Build vergleichen; `dist/core.js` und das Speicherformat bleiben in diesem Zyklus unverändert.
5. Den Querformat-/Hochformat-Konflikt aus Zyklus 0 nicht nebenbei lösen. Die in `BASELINE.md` fehlenden Geräte-, Touch- und Langzeitmessungen im QA-Bericht als Grenzen ausweisen, sofern sie auch für diesen Build nicht durchgeführt werden.

**Lernhinweis an den DESIGNER:** Die Schriftwahl ist erst mit Netz- und Layoutbeleg abgeschlossen. Halte den Diff eng, damit eine Veränderung im Spielgefühl eindeutig auf den Font-Wechsel zurückgeführt werden kann.

## Zyklus 1 · Urteil B · Überarbeitungsrunde 1 · 8. November 2026

**Urteil: ÜBERARBEITEN. Keine Merge-Freigabe.**

**Begründung:** `CYCLE_1_QA.md` meldet für Urteil B **NICHT BESTANDEN**, weil E1 (vollständiger Netz-/Service-Worker-Beleg), E3 (alle vereinbarten Ansichten) und E6 (Handy-Leistung) unvollständig sind; nach Team-Protokoll §4/12 ist ANNEHMEN damit ausgeschlossen. Der enge CSS-Diff, 21/21 Node-Tests und der synthetische Save-Roundtrip sprechen gegen einen belegten neuen Codefehler, ersetzen aber die fehlenden Nachweise nicht. Balancer und Game-Feel-Agent stehen auf WARNUNG, der Jugendwächter erteilt AUFLAGEN statt Build-Freigabe (`CYCLE_1_BUILD_REVIEWS.md`). Der Offline-Reload im IAB belegt nur den geprüften Cache-Zustand; für einen Mittelklasse-Handy-Lauf mit mindestens 30 FPS gibt es keinen Messwert.

**Änderungs- und Prüfliste (höchstens zwei Überarbeitungsrunden insgesamt):**

1. **E1 nachweisen:** Frischen Start und Aktualisierung eines bestehenden Service-Worker-Caches mit vollständigem Browser-Netzprotokoll prüfen; alle Requests nach Ursprung und Status auflisten. Keine Drittanfrage, insbesondere kein Google-Font-Aufruf, ist das Annahmekriterium. Falls eine Anfrage verbleibt, nur die Schriftversorgung gezielt korrigieren.
2. **E2 absichern:** Nach dem Cache-Update den Server beziehungsweise die Verbindung deaktivieren und die installierte App neu starten; sichtbaren Start, geladene Systemschrift und fehlende Konsolen-/Ressourcenfehler dokumentieren.
3. **E3 vervollständigen:** Menü, Shop, Levelauswahl, Tutorial, Pause und HUD jeweils bei 568 × 320, 667 × 300 und 1280 × 720 prüfen und Vorher/Nachher-Notizen oder gespeicherte Screenshots zu Textumbruch, Clipping, Überlauf und bedienbaren Aktionen liefern. Den bei 667 × 300 nur durch Scrollen erreichbaren Pause-Menüpunkt ausdrücklich mit Touch testen; kein anderer Layout-Fix wird in diesen Zyklus aufgenommen.
4. **E6 messen:** Mindestens fünf Minuten Kampf unter hoher Effektlast auf einem repräsentativen Mittelklasse-Handy messen, mit FPS-Verlauf, Minimum/Perzentil und Speicherverhalten; mindestens 30 FPS im spielbaren Zustand ist Merge-Bedingung. Wenn ein echtes Gerät nicht verfügbar ist, E6 offen lassen und keine Annahme behaupten.
5. **Spielstand-Regressionsbeleg stärken:** Einen echten Spielstand einer veröffentlichten Vorversion mit Münzen, XP, Upgrades, Ausrüstung und Einstellungen vor und nach dem Build vergleichen; bei fehlendem Altstand die Grenze melden. Der synthetische Roundtrip bleibt als bereits bestandener Teiltest bestehen.

**Lernhinweis an den DESIGNER:** Keine zweite Funktion und keinen kosmetischen Nebenfix ergänzen. Reiche gezielt die fehlenden Nachweise und aktualisierte QA-, Jugend- und Feel-Reviews ein; die nächste Entscheidung prüft nur diese Lücken und etwaige dadurch sichtbar gewordene Fehler.

## Zyklus 2 · Urteil A · 8. November 2026

**Urteil: GEWÄHLT – Idee 1 „Siege-Orden“.** Dies ist eine Ideenauswahl für den unabhängigen Arbeitsbranch, keine Build- oder Merge-Freigabe.

**Begründung:** Die bekannten Namen und zugehörigen Figurengestalten sind die höchste noch offene inhaltliche Richterpriorität (`dist/core.js:53–62`, `dist/game.js:524–543`; Zyklus-0-Urteil Rang 2). Befürworter und Kritiker setzen nach ihrer zweiten Runde beide Idee 1 vor Ideen 2 und 3; der Jugendwächter sieht kein Konzept-Veto, verlangt aber eine vollständige eigenständige Gestaltung und Spielstand-Erhalt (`CYCLE_2_ROUND_1_2.md`). Der Game-Feel-Agent bestätigt Potenzial 4/5, bewertet den Aufwand jedoch als hoch und fordert klar unterschiedliche Silhouetten ohne zusätzliche Effektlast. Die sechs Figuren bilden hier **eine** zusammenhängende Skin-Identitätsänderung; wenn Name, Bild und Angriff nicht zusammen vollständig bearbeitet werden können, wird der Umfang nicht künstlich durch bloßes Umbenennen verkleinert. Der noch offene Fontverstoß des v12-Basestands und die fehlenden Geräte-/Leistungsdaten erlauben aus Urteil A ausdrücklich keine Veröffentlichung.

**Auflagen für das Design und den Build:**

1. Für jeden der sechs betroffenen Skins eine Prüftabelle mit neuem Namen, Farbverteilung, von Farbe unabhängig erkennbarer Silhouette, Symbol und Angriffsbild erstellen. Keine erkennbaren Anleihen an die bisherigen Spinnenaugen, Fledermausohren/-umhänge, Dreifachklauen, Brustreaktoren oder Hämmer; keine fremden Namen in sichtbaren Spieltexten oder README.
2. Bestehende interne Skin-IDs, Besitz, aktive Auswahl, Münzpreise und Kampfwerte erhalten. Einen veröffentlichten Altstand sowie Backup-Roundtrip mit allen sechs gekauften Skins prüfen; Verlust eines Kaufs ist blockierend.
3. Die sechs Formen und Spezialangriffe als Stickman-Cartoon ohne Blut gestalten. Warnsignale bleiben klar, Silhouetten auch ohne Farberkennung unterscheidbar; keine neuen Assets ohne dokumentierte Quelle/Lizenz und keine höheren Partikel-/Effektbudgets.
4. Das Design in messbare E1…En-Kriterien zerlegen. QA prüft alle sechs Shop-Karten, Ausrüstung und Angriffsansichten, Save-Regression, Handy-/Desktop-Layouts und die geforderte mindestens fünfminütige Mobile-Leistung; ungemessene Werte ausdrücklich offen lassen.
5. Der Branch basiert unabhängig auf v12. Der externe Font-Import aus Richterrang 1 bleibt eine separate Veröffentlichungssperre, bis Zyklus 1 angenommen oder die gleiche Regelverletzung in einem eigenständig bewerteten Fix beseitigt wurde. Keine Font-, Touch- oder Trefferfeedback-Änderung in Zyklus 2 verstecken.

**Lernhinweis an den DESIGNER:** Die Aufgabe besteht in sechs konsistent **eigenständigen** Skin-Identitäten bei vollständig erhaltenem Besitz. Liefere pro Figur überprüfbare Vorher/Nachher-Belege; Quellcode-Namen allein sind weder Spielstandtest noch Rechteklärung.

## Zyklus 2 · Urteil B · erste Prüfung · 8. November 2026

**Urteil: ÜBERARBEITEN. Keine Annahme, kein Merge und keine Veröffentlichung.** Das Jugendwächter-**VETO** bleibt bindend, bis derselbe Wächter nach einer Überarbeitung ausdrücklich FREIGABE gibt.

**Begründung:** `CYCLE_2_QA.md` meldet NICHT BESTANDEN: 23/23 Tests und ein mit v12-Code erzeugter Save-/Backup-Roundtrip sind bestanden, aber Figuren, Shop, Angriffe und Touch wurden nicht im Browser geprüft und die geforderte fünfminütige Handy-Leistung ist unbekannt. Der Jugendwächter belegt den weiterhin externen Font-Import in `dist/style.css:1` des unabhängigen v12-Branches; der in Zyklus 1 vorgeschlagene Fix ist noch nicht angenommen (`CYCLE_2_BUILD_REVIEWS.md`). Nach §4/12 verhindern das Veto und die fehlende Mobile-Performance eine Annahme. Balancer und Game-Feel-Agent melden WARNUNG; für einen neuen Laufzeitfehler oder beschädigte Käufe gibt es keinen Beleg, während die Originalität des gesamten visuellen Ergebnisses ohne gerenderte Ansichten offen bleibt.

**Konkrete Überarbeitungs- und Prüfliste (höchstens fünf Punkte):**

1. Den externen Font als **separate Zyklus-1-Änderung** zur Annahme bringen und Cycle 2 erst danach auf den freigegebenen Hauptstand aktualisieren. Anschließend den Jugendwächter den resultierenden Gesamtstand erneut auf externe Anfragen prüfen lassen und eine ausdrückliche FREIGABE einholen; den Font nicht als heimlichen zweiten Cycle-2-Fix einbauen.
2. Alle sechs neuen Shop-Karten, ausgerüsteten Figuren und Spezialangriffe in 568×320, 667×300 und 1280×720 tatsächlich rendern und dokumentieren. Umrisse zusätzlich in Graustufen und kleiner Spielgröße prüfen; besonders BASALTWÄCHTER darf im Gesamtbild nicht weiter wie eine bekannte Riesen-/Faustfigur wirken.
3. Einen **echten** Browser-Spielstand der veröffentlichten v12-Version mit gekauften sechs Skins, aktivem Skin, Münzen, XP und Upgrades vor und nach dem Build vergleichen. Der bestandene automatisierte v12-JSON-/Backup-Test bleibt erhalten; Datenverlust ist blockierend.
4. Fünf Minuten hohe Kampf- und Effektlast auf einem repräsentativen Mittelklasse-Handy messen, FPS-Verlauf, Minimum/Perzentil und Speicher dokumentieren; mindestens 30 FPS im spielbaren Zustand nachweisen. Zusätzlich die betroffenen Kauf-/Ausrüstungs- und Touch-Flows auf dem Handy bedienen.
5. QA-, Game-Feel- und Jugend-Reviews mit diesen tatsächlichen Ergebnissen erneut einreichen; nur visuell belegte Ähnlichkeiten oder Lesbarkeitsprobleme gezielt im Skin-Inhaltsumfang korrigieren, Kampfwerte und andere Funktionen unangetastet lassen.

**Lernhinweis an den DESIGNER:** Die statisch nachgewiesene Save-Kompatibilität ist ein guter Teilbeleg, ersetzt jedoch weder einen echten Altstand noch die Bild- und Gerätetests. Halte die externen Font- und Leistungsfreigaben von der Skin-Gestaltung getrennt, damit der Richter Ursache und Wirkung pro Zyklus beurteilen kann.
