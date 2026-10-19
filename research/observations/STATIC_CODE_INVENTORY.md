# Static code and resource inventory

## Input

`research/apk/Math-Games-v14-2-[Premium]-modyolo.apk` (SHA-256 recorded in `APK_TRIAGE.md`). Inventory was read from the APK ZIP, binary manifest/resources, and DEX tables. APK was not installed or executed.

## Manifest facts

- Package: `com.GamesForKids.Mathgames.MultiplicationTables`
- Version: `14.2` / code `142`
- Minimum SDK: 19; target SDK: 32
- Launcher activity: `SplashScreenActivity`
- Main application activity family includes `MainActivity`.
- Other app-level names include settings, language setting, user profile/statistics, results, and multiplayer.

## Candidate arithmetic areas

- Addition: nine numbered game activities, a new-game class, and memory-match.
- Subtraction: nine numbered game activities, new-game, and memory-match.
- Multiplication: nine numbered game activities, new-game, and memory-match.
- Division: nine numbered game activities, new-game, and memory-match.
- Decimal, fraction, exponential, and square-root game families.

## Candidate puzzle / challenge areas

Activity and layout identifiers include random-number, math pieces, equations, fast calculator, odd/even, matching, mix, memory, general puzzle, 15-puzzle, Sudoku, Rullo, 2048, tap-add, and match-3. Multiplayer/duel challenge classes include addition, division, multiplication, and subtraction variants.

## Packaged data

- `randomNumberData.json`: 250 entries under `levels`; each inspected record has `hints`, `maxHints`, `numbers`, and `randomNumber` fields.
- `temp_randomNum.json`: 35 entries with a similar record structure.
- `mathpiecesData.json`: 150 entries under `timerGameLevels`; each record has cells, unlock, and star fields.
- `pro2048.json`: Lottie JSON animation named `2048`.

These facts describe packaged names/data only. They do not establish mode reachability, exact rules, timers, scoring, progression, localization, or persistence. See E-APK-002 in `EVIDENCE_LOG.md`.
