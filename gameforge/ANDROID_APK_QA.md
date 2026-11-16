# Android-APK – Umsetzung und QA

16. November 2026. Nutzerauftrag: eine echte `.apk` zum Herunterladen realisieren. Branch `codex/android-apk`, Basis `codex/endless-mode`. Eigenständiger lokaler Android-Wrapper für den vorhandenen Webcode; kein neuer Spielmodus und keine Balanceänderung. Keine Zusammenführung in den Hauptzweig, keine Site- oder Play-Store-Veröffentlichung.

## Umsetzung

- Native Activity mit WebView, festem HTTPS-Asset-Ursprung, DOM-Speicher, ausgeschaltetem Zoom und Querformat. Alle Dateien kommen aus App-Assets; fremde Navigation und nicht gebündelte Ressourcen werden abgewiesen. Keine Android-Berechtigungen angefordert, kein Internetzugriff und keine Datensammlung.
- Bestehender lokaler Save und getrennte Endlos-Upgrades bleiben im Spielcode erhalten. Die APK besitzt einen eigenen privaten Speicherbereich; Browser-Saves werden über den bisherigen JSON-Export und -Import übernommen.
- Export nutzt eine eng begrenzte JavaScript-Schnittstelle für validierte Sicherungsdaten, Größe höchstens 1 MB, nur vom lokalen App-Ursprung. Nutzer wählt den Zielort über Androids Dokumentauswahl. Import liefert nur die vom Nutzer ausgewählte Dokument-URI an den bisherigen File-/JSON-Prüfpfad.
- Zurück-Taste pausiert und fragt vor dem Verlassen; App-Hintergrund pausiert WebView/Timer. Installationspaket enthält keine privaten Schlüssel, Passwörter oder Gerätedaten. Signierschlüssel bleibt ausschließlich lokal im ignorierten `android/private/`.

## Ausgeführte Prüfungen

1. Offizielle SDK-Archive 35 anhand der von Googles Repository gelieferten SHA-1-Werte geprüft. Java-Wrapper kompiliert; DEX mit D8 erzeugt; Ressourcen mit AAPT2 gebündelt; APK ausgerichtet und signiert.
2. `apksigner verify --verbose --print-certs`: **Verifies**, gültige Signaturschemata v2/v3. Paket `io.github.einzglozz.stickmansiege`, minSdk26, target35, Launcher-Activity vorhanden; keine `uses-permission` im finalen Manifest.
3. ZIP-CRC/Ausrichtung geprüft, `classes.dex` und Spielassets vorhanden, enthaltene Core-/Game-Dateien mit den aktuellen Quellen verglichen. Separate SHA-256-Datei erzeugt. Kein privater Schlüssel im APK-Archiv oder Git-Staging.
4. **30/30 Node-Tests** sowie JS-Syntax und `git diff --check` bestanden. Neuer Test: Native Backup-Schnittstelle erhält aus dem Admin-Profil ausschließlich den normalen Spieler-Save mit 42 Münzen und seinen echten Upgrades; JSON lässt sich mit dem bisherigen Backup-Parser laden.
5. Unabhängiger Android-Review fand zwei konkrete Fehlerfälle: Export konnte bei verweigerten Dokumentzugriffen abstürzen; Dateiauswahl akzeptierte unerwartete `file://`-URIs. Behoben durch Abfangen von `SecurityException` und ausschließlich `content://` für Import/Export. Der finale Build wurde danach neu erzeugt. Keine weiteren belegten Codeblocker im Review.

## Testgrenzen und Status

**Build und statische/automatisierte Prüfungen bestanden, echte Android-Laufzeit noch nicht geprüft.** Kein angeschlossenes Android-Gerät oder Emulator, keine Installation, kein On-Device-WebView-/Audio-/Touch-/Dateiauswahltest und kein fünfminütiger Handy-FPS-/Speicherlauf. Es wird daher eine signierte **Test-APK**, keine voll getestete öffentliche App-Version, bereitgestellt. Die früheren GameForge-Freigabeauflagen bleiben bestehen.

Der erste javac-Aufruf mit Android-Bootclasspath scheiterte an Java-Lambda-Bootstrap-Stubs. Builder auf `--release 8` und Android-API-Classpath angepasst; nachfolgende Builds erfolgreich. Die verbleibenden JDK-Hinweise zu alten Android-APIs/Java-8-Zielcode sind dokumentierte Kompatibilitätshinweise, keine Buildfehler.
