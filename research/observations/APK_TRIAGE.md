# APK triage — supplied artifact

## Identity
- File: `research/apk/Math-Games-v14-2-[Premium]-modyolo.apk`
- SHA-256: `0C626FB5C2969B4EAC508AD5DDBA0A55B9F9B064F22E2C1EA0BAFB02284E58DD`
- Size: 13,181,480 bytes
- Static tool: Android SDK `aapt` 37.0.0; Python ZIP inspection; Android SDK `apksigner` 36.1.0.
- No installation or execution was performed.

## Findings

- **CONFIRMED (artifact metadata):** Package is `com.GamesForKids.Mathgames.MultiplicationTables`, version name `14.2`, version code `142`; launch activity is `com.GamesForKids.Mathgames.MultiplicationTables.SplashScreenActivity`.
- **CONFIRMED (comparison with earlier Play target):** This package ID differs from `com.agandeev.mathgames.pro`. The user has since explicitly set this supplied APK as the reengineering target, so this file is the target artifact for the current work; it is not the earlier Pavel Olegovich Play app.
- **CONFIRMED (artifact contents):** ZIP has 1,469 entries, four DEX files, Android resources, and data assets. `mathpiecesData.json` contains 150 `timerGameLevels` entries; `randomNumberData.json` contains 250 `levels`; `temp_randomNum.json` contains 35 `levels`; `pro2048.json` is a Lottie animation named `2048`.
- **CONFIRMED (artifact signing metadata):** `apksigner` reports a signer certificate SHA-256 of `3b61c2a82aff9f7652ffe0b04be3c8f248b5e1aa7063f1a3846f0cf5c778628a`; the APK ZIP includes `META-INF/ModYolo.RSA` and `.SF`. The signing relationship to the target developer is UNKNOWN.
- **UNKNOWN:** Whether this is a modified build, related edition, or unrelated app; whether its code/data matches any target release; all runtime screens and gameplay behavior.

## Use in this project

Treat this exact file as the selected artifact. Its static contents are valid evidence about what is packaged in this artifact, but its data filenames and class names do not establish runtime behavior. The available REA tools/JADX are not registered/installed, so current inspection is limited to APK metadata and archive/resource inventory.

## Public listing comparison

The package in the supplied APK is listed on Google Play as “Math Games, Learn Add Multiply” by GunjanApps Studios. The earlier package `com.agandeev.mathgames.pro` is “Math Games Premium” by Pavel Olegovich. The user selected the supplied APK as the active target, so this listing comparison is background only. Sources and limits are recorded in `research/EVIDENCE_LOG.md`.
