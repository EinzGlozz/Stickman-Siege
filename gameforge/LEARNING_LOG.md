# GameForge – Lernlog

Zyklus 0: noch keine Regeln. Prüffähige Heuristiken werden erst nach einem abgeschlossenen normalen Zyklus und Urteil B ergänzt.

## Nach Zyklus 2, Urteil B: ÜBERARBEITEN

1. Wenn ein Feature-Branch einen bekannten Verstoß gegen die verbindlichen Zielgruppenregeln aus seinem Basisstand übernimmt, dann muss die Basis vor Annahme bereinigt und vom Jugendwächter erneut geprüft werden; ein isolierter Feature-Diff hebt das Veto nicht auf.
2. Wenn gespeicherte IDs für gekaufte Inhalte umgestaltet werden, dann bleiben die IDs stabil und ein aus dem Vorversionscode erzeugter Save samt Backup wird vor der Freigabe gegen Münzen, XP, Besitz und aktive Auswahl geprüft.
3. Wenn eine visuelle Eigenständigkeit Erfolgskriterium ist, dann müssen gerenderte Vorher/Nachher-Bilder einschließlich kleiner Ansicht und Graustufen vor Urteil B vorliegen; Codeform allein genügt nicht.

## Nach Zyklus 3, Urteil B: ÜBERARBEITEN

1. Wenn mehrere Canvas-Bögen getrennte Schutzsegmente darstellen sollen, dann bekommt jedes weitere Segment einen eigenen Teilpfad (`moveTo` oder neues `beginPath`); QA prüft unerwünschte Verbindungslinien.
2. Wenn Blinkfeedback entfällt, dann bleiben Figur, HP-Verlust und ein durch Form unterscheidbarer Schutzindikator auch bei Partikelwert 0 und reduzierter Bewegung vorhanden; Lesbarkeit wird im dichten Kampf tatsächlich angesehen.
3. Wenn ein Entwurf auf einem ungeprüften Feature-Branch basiert, dann benennt PR und Dokumentation diese Abhängigkeit, richtet den isolierten Diff dagegen und hält den Merge bis zu beiden Urteilen B zurück.
