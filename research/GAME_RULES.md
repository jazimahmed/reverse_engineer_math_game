# Game rules

No rules have been verified at runtime. Static data in the exact supplied APK establishes only the following candidate puzzle input structures:

## Random-number levels

- `assets/randomNumberData.json` contains 250 ordered records under `levels`.
- Records have `numbers`, `randomNumber` (target), `hints`, and `maxHints` fields.
- Supplied levels use 4, 6, or 8 numbers (20, 50, and 180 records respectively); hint-list lengths vary from 1 to 4.
- Example first record: available numbers `[5, 3, 7, 9]`, target `45`, hint `5 x 9 = 45`.
- **INFERRED objective:** form chained equations from the number tiles until a result reaches the target. The level-list help dialog uses two packaged illustrations: target 55, `3 + 2 = 5`, followed by `5 × 11 = 55`; arrows show number-grid tiles feeding equation slots, and the final target/result are highlighted. DEX `calResult` recognizes `+`, `-`, `×`, and `÷`; `checkInput` enforces operator-vs-number slot categories. Available UI choices and number-reuse rules remain UNKNOWN.
- **Unresolved contradiction:** DEX `completeEqTwo(value)` calls `gameOver()` when `value != randomNo`, which appears inconsistent with the help illustration's non-target intermediate result 5. It is not established whether `completeEqTwo` runs after every intermediate equation or whether the help illustration matches the full shipped flow. Do not label a mismatch as a win/loss without runtime/result-message evidence.

## Math-pieces levels

- `assets/mathpiecesData.json` contains 150 records under `timerGameLevels`.
- Records contain a `cells` array, `isUnLocked`, and `stars`; arrays have 56, 72, or 90 cells.
- Each inspected cell has `cellTxt`, `isDragable`, and `lvl_id`; sampled first-level cells are blank in this state.
- The asset key suggests a timer game, but duration, puzzle construction, drag rules, scoring, stars, and unlock behavior are UNKNOWN.

## Other candidate modes

Activity/layout names suggest arithmetic, memory, equation, 2048, Sudoku, Rullo, and other puzzle families. No rules are inferred from names alone. See `GAME_MODES.md` and `STATIC_CODE_INVENTORY.md`.

## Code-level findings (not runtime verified)

The supplied APK's `RandomGameActivity` also contains a static evaluator and partial equation flow; see `research/observations/DEX_BEHAVIOR_FINDINGS.md`. This confirms implementation details in the artifact, not that a player can reach the mode or that every path behaves as the method names imply. The TypeScript evaluator is intentionally limited to this isolated code path.

## Multiplayer room question generation

Static `GenQuestions` code generates arithmetic questions by zero-based index. Bounds below are half-open (`min` included, `max` excluded); operation code 1=addition, 2=subtraction, 3=multiplication. The APK samples uniformly with `Random.nextInt(max-min)+min`.

| Question indexes | First operand | Second operand | Operations | Operand ordering / answer |
|---|---:|---:|---|---|
| 0–2 | [10, 50) | [10, 20) | +, − | subtraction is reordered to nonnegative |
| 3 | [20, 50) | [1, 10) | × | product |
| 4–5 | [20, 100) | [10, 20) | +, − | subtraction is reordered to nonnegative |
| 6–7 | [300, 999) | [99, 299) | +, − | subtraction is reordered to nonnegative |
| 8 | [100, 500) | [5, 10) | × | product |
| 9–10 | [1,000, 9,999) | [150, 500) | +, − | subtraction is reordered to nonnegative |
| 11–15 | [100, 999) | [10, 20) | +, −, × | subtraction is reordered to nonnegative |
| 16+ | [500, 999) | [50, 100) | +, −, × | subtraction is reordered to nonnegative |

`MultiplayerActivity.CreateNewRoom()` invokes this generator for 24 questions. This confirms a static room-creation code path, not accessible UI or successful online play. It is not a specification for the Random Number single-player puzzle.

## Random-number round initialization and hint display

Static `RandomGameActivity.startGame()` derives these values from the selected level record:

- equation rows: `maxHints + 2` when `maxHints` is 4, otherwise `maxHints + 1`;
- number grid columns: `floor(numberCount / 2) + 2`;
- the available numbers, target and hint list are copied from the record;
- number selection starts enabled and operator selection starts disabled.

`showNewHint()` increments a global hint-click counter only up to `maxHints`, then attempts to open a non-cancelable dialog backed by the level's hint list. Exact cost, ad/reward behavior and which hint is surfaced are UNKNOWN. These are static code facts, not black-box UI observations.

The complete 250-record level asset is copied to `src/domain/data/randomNumberLevels.json` for independent data loading; its source is the user-supplied APK asset. `parseRandomNumberLevelDataset()` validates the record structure but does not generate new puzzles. Static scans found number-list sizes of 4/6/8 in 20/50/180 records and `maxHints` values of 1/2/3/4 in 10/40/20/180 records, with hint-list lengths matching those respective counts.

## Math Pieces completion rating

- **CONFIRMED (static DEX):** `Game_MathPieces_Activity.calculateResult()` returns 0 when the correct-attempt count is zero. Otherwise it computes `correct / (correct + wrong) * 100` and maps 40–90% inclusive to 2 stars; above 90% through 100% to 3 stars; all other percentages to 1 star. Boundary float constants 40.0 (0x42200000), 90.0 (0x42B40000), and 100.0 (0x42C80000) were re-verified in the dump.
- **CONFIRMED (static DEX):** `onGameComplete()` stores the calculated star count on the active `PiecesGameLevel` when that object is non-null, then invokes `gameOver()`.
- **CONFIRMED (static DEX, 2026-10-19, E-APK-020):** attempt-counter wiring — see `SCORING_SYSTEM.md`. correctAttempts grows only `+equations.size()` on a fully valid check pass; wrongAttempts grows once per unique failing container tag (`equtaionTags`); both reset in the constructor and `reset()`.
- **UNKNOWN:** Runtime feedback, whether timer expiry can end a round (timer fields have no nonzero write in the dump), persistence, and reachability.
- The independent implementation in `src/domain/mathPieces.ts` models the calculation and the check-pass behavior (`checkMathPiecesEquations()`).

## Math Pieces line validation

- **CONFIRMED (static DEX):** the activity checks the line records produced for both rows and columns. Each record exposes five cell strings.
- **CONFIRMED (static DEX):** for interior cells containing `+`, `-`, `×`, or `÷`, the checker parses the adjacent operands and computes a result. `+`, `×`, and `÷` use Java integer arithmetic; the subtraction branch calculates the absolute difference. Each result is converted to float and rounded with `Math.round()` before comparison. A line passes if the computed decimal result appears at an endpoint immediately beside `=`.
- **INFERRED:** players arrange number, operator, equality and result pieces to complete valid equalities across rows and columns.
- **UNKNOWN:** how the pieces are moved, whether every line must be valid at once, feedback/retry behavior, timer rules, and how grid data encodes hidden/movable pieces.
- `isMathPiecesEquationCorrect()` in `src/domain/mathPieces.ts` reproduces the isolated complete-line check, with guarded malformed input handling documented in `DEX_BEHAVIOR_FINDINGS.md`.
