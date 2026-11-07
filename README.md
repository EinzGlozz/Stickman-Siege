# Stickman Siege

Ein 2D-Stickman-Shooter mit 12 Levels, Bosskämpfen, zufällig erzeugten Deckungen und dauerhaften Upgrades. Die Arena und die Kamera bewegen sich mit der Spielfigur. Das Spiel läuft als installierbare Web-App auf iOS und Android.

## Auf dem Handy installieren

- **iPhone:** Den GitHub-Pages-Link in Safari öffnen, **Teilen** → **Zum Home-Bildschirm** → **Hinzufügen** wählen.
- **Android:** Den GitHub-Pages-Link in Chrome öffnen, Menü **⋮** → **App installieren** beziehungsweise **Installieren und Verknüpfung erstellen** wählen.

Das Spiel benötigt keine Anmeldung. Fortschritt und Upgrades werden lokal im Browser gespeichert. Nach dem ersten Laden können die Spiel-Dateien durch den Service Worker auch offline bereitstehen.

## Steuerung

- Handy: linker Joystick zum Bewegen, rechter Knopf zum Schießen.
- Tastatur: WASD oder Pfeiltasten zum Bewegen, Leertaste oder J zum Schießen, P oder Escape für Pause.

## Entwicklung

Die Spiel-Dateien liegen in `dist/` und werden für GitHub Pages im Repository-Stamm bereitgestellt. Es gibt keinen Build-Schritt und keine erforderlichen externen Laufzeit-Abhängigkeiten. `tools/generate_icons.py` erzeugt die PNG-App-Icons mit der Python-Standardbibliothek.
