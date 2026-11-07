# Stickman Siege · Version 11

Ein 2D-Stickman-Shooter für Handy und Computer. Du kämpfst gegen Zombies, Skelette, Ghule, Golems, Geister und Dämonen, sammelst Münzen, XP und animierte Powerups, kaufst Upgrades und besiegst Kartenbosse.

## Sofort spielen und auf dem Handy installieren

**Spiel-Link:** [Stickman Siege öffnen](https://stickman-siege-2d-20261106.bestcurry2.chatgpt.site/)

**Nur Querformat:** Halte das Handy quer. Im Hochformat zeigt das Spiel einen Drehhinweis und hält den laufenden Kampf an. Die installierte Web-App fordert auf unterstützten Geräten Querformat an.

Diese ChatGPT-Site ist derzeit für den Besitzerzugang freigegeben. Öffne den Link auf dem Handy im Browser und melde dich bei Bedarf mit demselben ChatGPT-Konto an.

| Gerät | Installation |
| --- | --- |
| **Android** | Den Spiel-Link in **Chrome** öffnen → Menü **⋮** → **App installieren** oder **Zum Startbildschirm hinzufügen**. |
| **iPhone / iPad** | Den Spiel-Link in **Safari** öffnen → **Teilen** → **Zum Home-Bildschirm** → **Hinzufügen**. |
| **PC / Mac** | [Offline-Paket als ZIP herunterladen](downloads/Stickman-Siege-PC-v11.zip), entpacken und `index.html` öffnen. Das Browserfenster muss breiter als hoch sein. In Chrome oder Edge kann die Web-App über das Installationssymbol in der Adressleiste installiert werden. |

Android und iOS verwenden dieselbe installierbare Web-App (PWA). Es gibt in dieser Version keine signierte APK- oder IPA-Datei. Für eine eigenständige Store-App wären Android-Buildwerkzeuge beziehungsweise ein Apple-Entwicklerkonto und Code-Signierung nötig. Das PC-ZIP enthält die Spieldateien für die Offline-Nutzung.

## Neu in Version 11

- **Proportionales Spielfeld:** Die Zeichenfläche übernimmt nach Größen- und Orientierungsänderungen sofort die tatsächliche Breite und Höhe. Kisten sind quadratisch; die Figur bleibt auf kurzen Querformat-Bildschirmen oberhalb der Tutorialkarte sichtbar.
- **Joystick löst zuverlässig:** Verliert das Handy die Fingererfassung, wird der Stick sofort neutral. Dasselbe gilt beim Pausieren, beim Wechsel in ein Menü und wenn die App in den Hintergrund geht. Ein kleiner Totbereich verhindert unbeabsichtigtes Loslaufen durch Berührungen nahe der Mitte.

## Seit Version 10 enthalten

- **Lebendigere Karten:** Kleine, kartenfarbene Lichtpunkte und ein sanft pulsierender Ring am Startbereich beleben die Arena. Der Partikelregler steuert ihre Stärke; bei 0 % oder aktivierter Option für reduzierte Bewegung bleiben sie aus.
- **Leuchtende Menüs und Buttons:** Langsam wandernde Hintergrundakzente, sanfte Lichtläufe auf Schaltflächen und ein pulsierender Feuerknopf. „Menü-Effekte“ im Grafik-Reiter schaltet die Menüanimationen aus; reduzierte Bewegung wird berücksichtigt.

## Seit Version 9 enthalten

- **Klarer Levelstart:** Jede Karte beginnt in einer freien Zone in der Mitte. Eine dezente Markierung zeigt den Startbereich; die Kamera hält die Figur beim Tutorial etwas höher, damit die Anleitung sie nicht verdeckt.
- **Übersichtliches Querformat:** Kartenname, Leben, Münzen und XP stehen in einer kompakten Zeile. Die Tutorial-Anleitung sitzt zwischen Joystick und Feuerknopf. Das Startmenü passt ohne abgeschnittene Überschrift auf kleine Handybildschirme.
- **Ruhigeres Grasland:** Kleinere Bodenflecken ersetzen die großen ovalen Flächen.

## Seit Version 8 enthalten

- **Verstecktes Admin-Menü:** Tippe auf der Startseite zweimal schnell auf den roten Punkt nach „SIEGE“. Am PC kann der Punkt zweimal per Maus oder Enter aktiviert werden. Der Admin-Schalter erscheint nicht mehr in den allgemeinen Einstellungen.
- **Mehr Admin-Einstellungen:** Im Admin-Labor kannst du Unverwundbarkeit und „Ein Treffer“ aktivieren sowie Monstertempo und Spawnrate einstellen. Diese Optionen wirken ausschließlich im lokalen Admin-Testprofil und werden getrennt vom normalen Spielstand gespeichert.

## Seit Version 7 enthalten

- **Spielstand sichern:** Einstellungen → „Sicherung herunterladen“ speichert das normale Spielerprofil als JSON-Datei. Das Admin-Testprofil wird nicht exportiert.
- **Spielstand wiederherstellen:** Eine Sicherungsdatei wird vorab geprüft. Eine Vorschau zeigt Münzen, Kartenfortschritt und Skin. Erst „Diesen Stand wiederherstellen“ ersetzt den normalen Spielstand. Der vorherige Stand lässt sich anschließend über „Letzten Stand zurückholen“ wiederherstellen.
- **Handywechsel:** Öffne die Site auf dem neuen Gerät und wähle in den Einstellungen die heruntergeladene Sicherung aus. Die Datei bleibt bei dir; es gibt keine Cloud-Synchronisierung.

## Bereits enthalten

- **Startseite:** Der Stickman bewegt Körper, Arme und Beine mit einer dezenten, flüssigen Idle-Animation. Die Animation lässt sich im Grafik-Reiter ausschalten und respektiert reduzierte Bewegung des Betriebssystems.
- **Einstellungen aus der Pause:** Ton, Grafik, Handy-Steuerung und PC-Steuerung sind während einer pausierten Runde erreichbar. Zurück führt in die Pause, ohne die Runde fortzusetzen.
- **Neuer Klang:** Ein dichterer Rhythmus für normale Levels und Bosskämpfe; leisere SFX und ein Audiobegrenzer reduzieren Übersteuerung.
- **Vier Einstellungsreiter:** Ton, Grafik, Handy-Steuerung und PC-Steuerung. Grafik bietet Regler für Partikel, Kamerawackeln und Menüanimation.

- **Interaktive Trainingskarte:** Sieben echte Aufgaben führen durch Bewegung, Schießen, Beute, Deckung, Powerup, Probe-Upgrade und Bosskampf. Die Karte wird beim ersten Spielstart automatisch angeboten und kann später über das Menü wiederholt werden. Überspringen ist möglich; der Fortschritt bleibt dann ohne Belohnung.
- **Einmaliger Abschlussbonus:** Erst nach dem besiegten Übungsboss erhält das normale Profil 300 Münzen. Trainingsbeute ist nur zur Übung. Wiederholungen und das Admin-Testprofil geben keinen weiteren Bonus.

- **6 Karten mit je 30 Levels:** Grasland, Wüste, Friedhof, Vulkaninsel, Frostfestung und Neonruinen. Level 30 jeder Karte enthält einen Boss und schaltet die nächste Karte frei.
- **Monster mit eigenen Angriffen:** Zombies und Ghule greifen im Nahkampf an, Skelette schießen Pfeile. Jeder Kartenboss besitzt eine eigene normale und eine eigene Superattacke: Dornen/Wurzeln, Sandlanzen/Sandsturm, Geister/Grabruf, Lavakugel/Eruption, Eissplitter/Frostnova oder Energiestrahl/Kreuzblitz. Die Angriffe werden vor dem Treffer sichtbar angekündigt.
- **Schwierigere Wellen:** Mehr Gegner pro Welle, etwas stärkere Gegner in späteren Wellen und längere normale Schusspausen. Das Powerup Dauerfeuer bleibt deutlich schneller.
- **Beute und Entwicklung:** Jeder besiegte Gegner lässt Münzen und XP fallen. Dazu kommen zufällige Powerups wie 4 Sekunden Dauerfeuer, Unsterblichkeit, Doppelschaden, Super-Magnet und Zeitlupe.
- **Ausrüstung:** Acht teurer werdende Upgrades, sechs Waffen, drei gleichzeitig ausrüstbare Waffen und zwei automatische Perks wie Pfeile, Ziegel oder Fußbälle.
- **Skins:** Spider-Man, Batman, Wolverine, Hulk, Iron Man, Thor und Schattenninja kosten Münzen und besitzen eigene Spezialattacken und Animationen. Die Figuren sind Fan-Inhalte; es besteht keine Verbindung zu den Rechteinhabern.
- **Steuerung und Klang:** Einstellbare Lautstärken für Musik und Effekte, frei belegbare Computertasten und anpassbare Positionen der Handy-Buttons. Die Musik wird im Browser erzeugt und wechselt im Bosskampf das Tempo.
- **Admin-Testprofil:** Im versteckten Admin-Labor lässt sich ein lokales Testprofil mit unbegrenzten Ressourcen und allen Freischaltungen aktivieren. Es ist kein Online-Konto und bietet keine Zugriffssicherheit.

## Steuerung

| Gerät | Bewegung | Schießen | Pause |
| --- | --- | --- | --- |
| Handy | Linker Joystick | Rechter Feuer-Button | Taste oben rechts |
| Computer | WASD oder Pfeiltasten | Leertaste oder Mausklick | P oder Escape |

Die Tastaturbelegung und die Positionen der Handy-Buttons lassen sich im Einstellungsmenü ändern. Nach dem ersten Laden können die Dateien über den Service Worker offline verfügbar sein. Spielstände werden lokal im jeweiligen Browser gespeichert.

## Entwicklung und Tests

Die Web-App liegt in `dist/` und benötigt zur Laufzeit keine externen Pakete. Für einen lokalen Test: `python3 -m http.server 8765 --directory dist`, dann `http://localhost:8765` öffnen. Regel- und Tutorialtests: `node --test tests/*.test.js`.

`tools/generate_icons.py` erzeugt die App-Icons. Der Quellcode liegt auch im [GitHub-Repository](https://github.com/EinzGlozz/Stickman-Siege). GitHub Pages ist zusätzlich nutzbar, sobald es im Repository unter **Settings → Pages → Deploy from a branch → main / (root)** aktiviert wird.
