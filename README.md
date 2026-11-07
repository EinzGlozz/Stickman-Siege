# Stickman Siege · Version 3

Ein 2D-Stickman-Shooter für Handy und Computer. Du kämpfst gegen Zombies, Skelette, Ghule, Golems, Geister und Dämonen, sammelst Münzen, XP und animierte Powerups, kaufst Upgrades und besiegst Kartenbosse.

## Sofort spielen und auf dem Handy installieren

**Spiel-Link:** [Stickman Siege öffnen](https://stickman-siege-2d-20261106.bestcurry2.chatgpt.site/)

Diese ChatGPT-Site ist derzeit für den Besitzerzugang freigegeben. Öffne den Link auf dem Handy im Browser und melde dich bei Bedarf mit demselben ChatGPT-Konto an.

| Gerät | Installation |
| --- | --- |
| **Android** | Den Spiel-Link in **Chrome** öffnen → Menü **⋮** → **App installieren** oder **Zum Startbildschirm hinzufügen**. |
| **iPhone / iPad** | Den Spiel-Link in **Safari** öffnen → **Teilen** → **Zum Home-Bildschirm** → **Hinzufügen**. |
| **PC / Mac** | [Offline-Paket als ZIP herunterladen](https://github.com/EinzGlozz/Stickman-Siege/raw/refs/heads/main/downloads/Stickman-Siege-PC-v3.zip), entpacken und `index.html` öffnen. In Chrome oder Edge kann die Web-App über das Installationssymbol in der Adressleiste installiert werden. |

Android und iOS verwenden dieselbe installierbare Web-App (PWA). Es gibt in dieser Version keine signierte APK- oder IPA-Datei. Für eine eigenständige Store-App wären Android-Buildwerkzeuge beziehungsweise ein Apple-Entwicklerkonto und Code-Signierung nötig. Das PC-ZIP enthält die Spieldateien für die Offline-Nutzung.

## Das steckt in Version 3

- **6 Karten mit je 30 Levels:** Grasland, Wüste, Friedhof, Vulkaninsel, Frostfestung und Neonruinen. Level 30 jeder Karte enthält einen Boss und schaltet die nächste Karte frei.
- **Monster mit eigenen Angriffen:** Zombies und Ghule greifen im Nahkampf an, Skelette schießen Pfeile, weitere Monster und Bosse verwenden eigene Muster.
- **Beute und Entwicklung:** Jeder besiegte Gegner lässt Münzen und XP fallen. Dazu kommen zufällige Powerups wie 4 Sekunden Dauerfeuer, Unsterblichkeit, Doppelschaden, Super-Magnet und Zeitlupe.
- **Ausrüstung:** Acht teurer werdende Upgrades, sechs Waffen, drei gleichzeitig ausrüstbare Waffen und zwei automatische Perks wie Pfeile, Ziegel oder Fußbälle.
- **Skins:** Spider-Man, Batman, Wolverine, Hulk, Iron Man, Thor und Schattenninja kosten Münzen und besitzen eigene Spezialattacken und Animationen. Die Figuren sind Fan-Inhalte; es besteht keine Verbindung zu den Rechteinhabern.
- **Steuerung und Klang:** Einstellbare Lautstärken für Musik und Effekte, frei belegbare Computertasten und anpassbare Positionen der Handy-Buttons. Die Musik wird im Browser erzeugt und wechselt im Bosskampf das Tempo.
- **Tutorial und Admin-Testprofil:** Das Tutorial erklärt die Grundlagen in sechs Schritten. In den Einstellungen lässt sich ein lokales Admin-Testprofil mit unbegrenzten Ressourcen und allen Freischaltungen aktivieren. Es ist kein Online-Konto und bietet keine Zugriffssicherheit.

## Steuerung

| Gerät | Bewegung | Schießen | Pause |
| --- | --- | --- | --- |
| Handy | Linker Joystick | Rechter Feuer-Button | Taste oben rechts |
| Computer | WASD oder Pfeiltasten | Leertaste oder Mausklick | P oder Escape |

Die Tastaturbelegung und die Positionen der Handy-Buttons lassen sich im Einstellungsmenü ändern. Nach dem ersten Laden können die Dateien über den Service Worker offline verfügbar sein. Spielstände werden lokal im jeweiligen Browser gespeichert.

## Entwicklung und Tests

Die Web-App liegt in `dist/` und benötigt zur Laufzeit keine externen Pakete. Für einen lokalen Test: `python3 -m http.server 8765 --directory dist`, dann `http://localhost:8765` öffnen. Regeltests: `node --test tests/core.test.js`.

`tools/generate_icons.py` erzeugt die App-Icons. Der Quellcode liegt auch im [GitHub-Repository](https://github.com/EinzGlozz/Stickman-Siege). GitHub Pages ist zusätzlich nutzbar, sobald es im Repository unter **Settings → Pages → Deploy from a branch → main / (root)** aktiviert wird.
