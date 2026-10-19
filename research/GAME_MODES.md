# Game mode inventory (static APK evidence)

The following are component families in the supplied APK's DEX/layout resources. This confirms packaged components, not that every item is reachable, enabled in this build, or behaves as its name suggests. Runtime verification remains outstanding.

| Candidate family | Static evidence | Confidence / runtime status |
|---|---|---|
| Addition | `addition.AdditionActivity`, `AdditionGame1Activity`-`AdditionGame9Activity`, memory-match activity and `activity_addition*` layouts | CONFIRMED components; **flows partially observed at runtime** (E-RT-004/005) |
| Subtraction | `SubtractionActivity`, `SubtractionGame1Activity`–`SubtractionGame9Activity`, memory-match activity and `activity_subtraction*` layouts | CONFIRMED components; flows UNKNOWN |
| Multiplication | `MultiplicationActivity`, `MultiplicationGame1Activity`–`MultiplicationGame9Activity`, memory-match activity and `activity_multiplication*` layouts | CONFIRMED components; flows UNKNOWN |
| Division | `DivisionActivity`, `DivisionGame1Activity`–`DivisionGame9Activity`, level/new-game/memory-match activities and layouts | CONFIRMED components; rules UNKNOWN |
| Decimal, fraction, exponential, square root | Corresponding activity families and layouts | CONFIRMED components; rules UNKNOWN |
| Random-number challenge | `RandomGameActivity`, `GameLevelsActivity`, `randomNumberData.json` with 250 level records | CONFIRMED components/data; objective and loop UNKNOWN |
| Math pieces | `Game_MathPieces_Activity`, level activities, 150 `timerGameLevels`, cell/drag flags and 7×8/8×9/9×10 grid mappings | CONFIRMED static data and checker; player objective INFERRED; touch/timer behavior UNKNOWN |
| Equation, fast calculator, odd/even, matching, mix, memory, puzzle, 15-puzzle, Sudoku, Rullo, 2048, tap-add, match-3 | Corresponding named activities/layouts and/or `pro2048.json` | CONFIRMED components/assets; availability/rules UNKNOWN |
| Duel, multiplayer, leaderboard | Four `DuelChallenge*Activity` classes plus multiplayer and leaderboard activities | CONFIRMED components; network and player flows UNKNOWN |

No mode has been behaviorally verified. The current Play listing for this package is not sufficient to establish behavior for this supplied v14.2 artifact.

## Runtime-observed modes (2026-10-19 emulator run)

| Mode | How it is reached | Observed behavior | Confidence |
|---|---|---|---|
| **Topic mode-select** | Main menu → topic tile | 8 mode tiles: Practice, Quiz, Duel, Play, Test, Time, Learn, Hard. Observed for Addition only. | CONFIRMED (E-RT-004) |
| **Practice** | Mode-select → Practice | 10-question round, 4 options in a 2x2 grid, first-try-correct green counter, red counter for questions needing a retry, green flash on correct, orange background on the 10/10 question, result screen with Score/Correct/Wrong plus a per-question review sheet. | CONFIRMED (E-RT-005 … E-RT-010) |
| **Quiz / Duel / Play / Test / Time / Learn / Hard** | Mode-select → tile | Not yet entered. | UNKNOWN |
| **Equations (Math Pieces variant)** | Main menu → gamepad → Games hub → Equations → level 1 | 4-column level list (level 1 unlocked, rest padlocked) → 5x5 crossword board `58 + 87 = ?` / `18 - 8 = ?` with a digit tray, a countdown stopwatch and a tutorial overlay whose ▶ ends the level. | CONFIRMED (E-RT-012 … E-RT-015) |
| **2048 / Fifteen / Puzzle / Match / Sudoku / Mix / Memory** | Games hub → tile | Tiles confirmed present; not entered. | UNKNOWN (E-RT-003) |
| **Leaderboards** | Games hub → crown | Opens Google Sign-In; the leaderboard screen itself is unobserved. | UNKNOWN (E-RT-003) |
| **Random Number** | unknown entry | Not reachable from any observed screen. | UNKNOWN |

The mode list is therefore CONFIRMED to contain 8 topic modes per topic, but only **Practice** and **Equations** have been played. Every other mode remains UNKNOWN.

### Math Pieces static refinement

`Game_MathPieces_Activity` checks five-cell equations from both row and column collections and computes `calculateResult()` stars when `onGameComplete()` runs (E-APK-016/017). The packaged 150-level asset and `setGridRowColumn()` establish three board dimensions (E-APK-018). Data parsing, grid dimension selection, line validation, star rating, and the drop-triggered check pass are standalone helpers in `src/domain/mathPieces.ts` (E-IMPL-010/011).

Completion is now statically resolved (E-APK-020): after every accepted drop the APK schedules `checkCorrectEquation()` 100 ms later; that pass rebuilds all row/column equations fresh, marks valid lines, and completes the level only when every equation in the pass is newly valid (score equals the rows + columns master list that `loadData()` establishes). Wrong-attempt counting is de-duplicated per equation-container tag; attempt counters reset per level via `reset()`. Still unknown: drag acceptance rules at runtime, timer effect (`fixedTimeInMS` has no nonzero write), feedback presentation, level persistence, and reachability.

## Static code-path refinement

`RandomGameActivity` and its evaluator are present in the DEX, and level loading/result transition methods are documented in `observations/DEX_BEHAVIOR_FINDINGS.md`. This strengthens the code-level evidence for the random-number candidate. It does not establish screen reachability, full player interaction semantics, or equivalence to the initially named Play package.

## Static multiplayer code-path refinement

The DEX shows a room-creation path that requests 24 arithmetic questions from `GenQuestions`; the exact pattern ranges are documented in `GAME_RULES.md`. Mark this as confirmed generator code only. Do not claim that the multiplayer screen is reachable or that room creation works at runtime.
