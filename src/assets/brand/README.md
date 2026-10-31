# Math Games icon

`calculator.svg` is original editable artwork: a smiling mint calculator on a purple launcher background. It shares the game's colorful, child-friendly direction without relying on a font or external icon pack.

## Regeneration

From the repository root, with Python and Pillow installed:

```sh
python tools/generate_app_icons.py
python tools/generate_app_icons.py --check
```

The generator produces:

- `icon.png`: opaque 1024px general Expo icon.
- `adaptive-icon.png`: transparent 1024px foreground, inset for Android's 66dp safe circle.
- `monochrome-icon.png`: transparent alpha artwork for themed launchers.
- Android launcher WebP images for mdpi through xxxhdpi, standard and round.
- An Android vector foreground, a monochrome drawable, and five native splash images.

Android adaptive-icon XML and the background color are wired in `android/app/src/main/res`; Expo equivalents are in `app.json`. Keep both configurations aligned because this repository builds the checked-in native Android project directly.

Pillow 13.0.0 generated the committed raster outputs. A different Pillow/WebP encoder version may produce different bytes; inspect regenerated artwork before committing it. The script is development tooling, not part of the application runtime.
