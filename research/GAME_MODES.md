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

## Runtime-observed modes (2026-10-19/20 emulator runs)

| Mode | How it is reached | Observed behavior | Confidence |
|---|---|---|---|
| **Topic mode-select** | Main menu → topic tile | Mode tiles and labels **vary per topic** (see below). Observed for all 7 arithmetic topics. | CONFIRMED (E-RT-019) |
| **Addition modes** | Addition mode-select | | |
| — Practice | Mode-select → Practice | 10 questions, 4 options (2x2), first-try-correct = green chip, retry = red chip, green flash, orange on Q10. | CONFIRMED (E-RT-020) |
| — Quiz | Mode-select → Quiz | 10 questions, **missing-operand** (`a + ? = r`), 4 options, same scoring. | CONFIRMED (E-RT-023) |
| — Duel | Mode-select → Duel | Split screen (180° rotated), same question both halves, two chips (+1/-1), 4 options each. | CONFIRMED (E-RT-022) |
| — Play | Mode-select → Play | 3 simultaneous equations, on-screen keypad 0-9, completion/scoring UNKNOWN. | CONFIRMED layout (E-RT-025) |
| — Test | Mode-select → Test | 10 True/False (judge shown equation), wrong increments red immediately. | CONFIRMED (E-RT-021) |
| — Time | Mode-select → Time | True/False with **auto-advance countdown** (~4.5 s/q), wrong increments red. | CONFIRMED (E-RT-024) |
| — Learn | Mode-select → Learn | Setup screen: 4 digit-count checkboxes + Start; gameplay unobserved. | CONFIRMED entry (E-RT-026) |
| — Hard | Mode-select → Hard | Not entered. | UNKNOWN |
| **Subtraction modes** | Subtraction mode-select | Same 8 labels as Addition; not played. | CONFIRMED labels (E-RT-019) |
| **Multiplication modes** | Multiplication mode-select | Learn, Exam, Practice, Quiz, Duel, Play, Test, Time (8, "Exam" replaces "Hard"); not played. | CONFIRMED labels (E-RT-019) |
| **Division modes** | Division mode-select | Same 8 as Multiplication; not played. | CONFIRMED labels (E-RT-019) |
| **Square Root modes** | Exponential mode-select | Learn, Play², Practice² (6 modes); not played. | CONFIRMED labels (E-RT-019) |
| **Decimal modes** | Decimal mode-select | **Cross-topic**: Addition, Subtract, Duel, Play (4 modes); not played. | CONFIRMED labels (E-RT-019) |
| **Fraction modes** | Fraction mode-select | **Cross-topic**: Addition, Subtract, Multiply, Division, Hard, Play (6 modes); not played. | CONFIRMED labels (E-RT-019) |
| **Equations (Math Pieces variant)** | Games hub → Equations → level 1 | 4-column level list → 5x5 crossword board, digit tray, countdown, tutorial overlay ends level. | CONFIRMED (E-RT-012 … E-RT-015) |
| **2048 / Fifteen / Puzzle / Match / Sudoku / Mix / Memory** | Games hub → tile | Tiles present; not entered. | UNKNOWN (E-RT-003) |
| **Leaderboards** | Games hub → crown | Opens Google Sign-In; leaderboard unobserved. | UNKNOWN (E-RT-003) |
| **Random Number** | unknown entry | Not reachable from any observed screen. | UNKNOWN |

The mode list is **topic-specific**, not a universal 8-mode grid. Only Addition modes have been played. Every other topic's modes remain UNKNOWN.

### Math Pieces static refinement

`Game_MathPieces_Activity` checks five-cell equations from both row and column collections and computes `calculateResult()` stars when `onGameComplete()` runs (E-APK-016/017). The packaged 150-level asset and `setGridRowColumn()` establish three board dimensions (E-APK-018). Data parsing, grid dimension selection, line validation, star rating, and the drop-triggered check pass are standalone helpers in `src/domain/mathPieces.ts` (E-IMPL-010/011).

Completion is now statically resolved (E-APK-020): after every accepted drop the APK schedules `checkCorrectEquation()` 100 ms later; that pass rebuilds all row/column equations fresh, marks valid lines, and completes the level only when every equation in the pass is newly valid (score equals the rows + columns master list that `loadData()` establishes). Wrong-attempt counting is de-duplicated per equation-container tag; attempt counters reset per level via `reset()`. Still unknown: drag acceptance rules at runtime, timer effect (`fixedTimeInMS` has no nonzero write), feedback presentation, level persistence, and reachability.

## Static code-path refinement

`RandomGameActivity` and its evaluator are present in the DEX, and level loading/result transition methods are documented in `observations/DEX_BEHAVIOR_FINDINGS.md`. This strengthens the code-level evidence for the random-number candidate. It does not establish screen reachability, full player interaction semantics, or equivalence to the initially named Play package.

## Static multiplayer code-path refinement

The DEX shows a room-creation path that requests 24 arithmetic questions from `GenQuestions`; the exact pattern ranges are documented in `GAME_RULES.md`. Mark this as confirmed generator code only. Do not claim that the multiplayer screen is reachable or that room creation works at runtime.
