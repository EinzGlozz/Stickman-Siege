# Stickman Siege – Android-APK

**Version 0.1.0-endless-preview · 16. November 2026 · Android 8.0 oder neuer (API 26+).**

## Herunterladen und installieren

[APK herunterladen](https://raw.githubusercontent.com/EinzGlozz/Stickman-Siege/refs/heads/codex/android-apk/downloads/Stickman-Siege-Android.apk)

1. Den Link auf dem Android-Handy öffnen und die APK herunterladen.
2. Die heruntergeladene Datei öffnen. Falls Android danach fragt, die Installation aus dem verwendeten Browser bzw. Dateimanager erlauben.
3. **Installieren** wählen, danach **Stickman Siege** starten. Das Spiel läuft im Querformat.

Die APK ist eine direkt installierbare Vorschau und keine Play-Store-Veröffentlichung. Android kann deshalb einen Hinweis zur Installationsquelle anzeigen. Es ist weder Python noch ein lokaler Server nötig. iPhone/iPad können keine APK installieren; dort bleibt die Web-App vorgesehen.

## Enthalten und lokal gespeichert

- Normale Karten, Tutorial, Waffen, Skins und Upgrades des aktuellen lokalen Spielstands.
- Endloskarte **Nachtgarten** mit eigenem Run-Shop. Endloskäufe verändern keine normalen Level-Upgrades.
- Alle Spieldateien sind in der App enthalten. Die App fordert **keine Android-Berechtigungen**, auch keinen Internetzugriff, an. Die Darstellung übernimmt Android System WebView; ein funktionsfähiger, aktueller WebView ist erforderlich.
- Spielstände liegen im privaten Speicher der App. Sie werden nicht an einen Server übertragen. Ein Update mit derselben Paketkennung und demselben Schlüssel behält diese Daten normalerweise bei; **Deinstallation oder „App-Daten löschen“ entfernt sie**.
- Ein laufender Endloslauf wird nicht fortgesetzt; nur sein separat gespeicherter Rekord bleibt. Ton/Grafik/Steuerung und normaler Fortschritt werden lokal gespeichert.

## Bisherigen Browser-Spielstand übernehmen

Die APK hat einen eigenen Speicherbereich und kann Browserdaten nicht automatisch lesen. Im bisherigen Browser unter **Einstellungen → Sicherung herunterladen** eine JSON-Datei speichern. In der App **Einstellungen → Datei auswählen** öffnen, die Sicherung wählen und die Wiederherstellung bestätigen. Vorher die Vorschau kontrollieren. Export in der APK öffnet die Android-Dokumentauswahl; Import verwendet ebenfalls die Dokumentauswahl und prüft die Datei wie bisher. Admin-Ressourcen werden nicht in den normalen Save exportiert.

## Prüfstand und Grenzen

Der Build kompiliert den nativen Android-Wrapper und bündelt die aktuellen Webdateien. `apksigner` bestätigt gültige **APK-Signaturen v2/v3**; ZIP-Integrität, Ausrichtung, Manifest, Launcher, minSdk/targetSdk, Berechtigungen und Asset-Hashes wurden geprüft. **30/30 automatisierte Spieltests** bestehen, einschließlich Android-Export des normalen Profils aus dem Admin-Modus. Ein unabhängiger Code-Review prüfte Assetpfade, Lebenszyklus und Dateiauswahl; zwei gefundene Fehlerfälle wurden behoben.

**Noch nicht auf einem echten Android-Gerät oder Emulator installiert und ausgeführt.** Deshalb sind WebView-Laufzeit, Audio, echte Touchbedienung, Dokumentauswahl und fünfminütige Handy-Leistung noch nicht bestätigt. Die Vorschau ersetzt keine ausstehenden GameForge-Freigaben; Hauptzweig und Live-Site werden nicht zusammengeführt oder veröffentlicht.

Die Datei [Stickman-Siege-Android.apk.sha256](downloads/Stickman-Siege-Android.apk.sha256) enthält die SHA-256-Prüfsumme. Die öffentliche Signaturfingerprint lautet `1990ad5ddcd8b1f0ef8b9dde67395e3715a582bb2addbf3dedf7dea20c37f5e0`.

## APK erneut bauen (macOS)

Benötigt: Python 3, JDK 17 oder neuer, offizielle Android-SDK-Plattform 35 und Build Tools 35.0.0. Kein Gradle-/npm-Download und keine Fremdbibliothek zur Laufzeit. Projektstruktur: `dist/` enthält das Spiel; `android/` den nativen Java-Wrapper und den Builder.

Die offiziellen Archive `platform-35_r02.zip` und `build-tools_r35_macosx.zip` nach `android/toolchain/` entpacken. Erwartet werden `android/toolchain/android-35/android.jar` und `android/toolchain/android-15/aapt2` (Archivname für Build Tools 35). Dann aus dem Projektordner ausführen:

```sh
python3 android/build_apk.py
```

Ausgabe: `downloads/Stickman-Siege-Android.apk` sowie Prüfsumme. Der Builder erzeugt bei Bedarf einen projektspezifischen Signierschlüssel unter `android/private/`. **Schlüssel und Passwortdatei lokal sicher aufbewahren**, damit spätere Updates zur bisherigen Installation passen. Dieser Ordner ist von Git ausgeschlossen und wird nicht mit der APK ausgeliefert. Für spätere App-Versionen `versionCode` im Manifest erhöhen. Buildbericht und öffentliche Paketinformationen liegen nach dem Build unter `android/build/`.

Grundlagen: [Android – lokale WebView-Inhalte](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content), [Android – APK signieren und prüfen](https://developer.android.com/tools/apksigner), [Android – Dokument-URI absichern](https://developer.android.com/privacy-and-security/risks/content-resolver). Die App verwendet eine lokal abgefangene HTTPS-Adresse für die gebündelten Assets, keine unsicheren `file://`-Freigaben.
