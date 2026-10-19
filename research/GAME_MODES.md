# Game mode inventory (static APK evidence)

The following are component families in the supplied APK's DEX/layout resources. This confirms packaged components, not that every item is reachable, enabled in this build, or behaves as its name suggests. Runtime verification remains outstanding.

| Candidate family | Static evidence | Confidence / runtime status |
|---|---|---|
| Addition | `addition.AdditionActivity`, `AdditionGame1Activity`–`AdditionGame9Activity`, memory-match activity and `activity_addition*` layouts | CONFIRMED components; flows UNKNOWN |
| Subtraction | `SubtractionActivity`, `SubtractionGame1Activity`–`SubtractionGame9Activity`, memory-match activity and `activity_subtraction*` layouts | CONFIRMED components; flows UNKNOWN |
| Multiplication | `MultiplicationActivity`, `MultiplicationGame1Activity`–`MultiplicationGame9Activity`, memory-match activity and `activity_multiplication*` layouts | CONFIRMED components; flows UNKNOWN |
| Division | `DivisionActivity`, `DivisionGame1Activity`–`DivisionGame9Activity`, level/new-game/memory-match activities and layouts | CONFIRMED components; rules UNKNOWN |
| Decimal, fraction, exponential, square root | Corresponding activity families and layouts | CONFIRMED components; rules UNKNOWN |
| Random-number challenge | `RandomGameActivity`, `GameLevelsActivity`, `randomNumberData.json` with 250 level records | CONFIRMED components/data; objective and loop UNKNOWN |
| Math pieces | `Game_MathPieces_Activity`, level activities, 150 `timerGameLevels`, cell/drag flags and 7×8/8×9/9×10 grid mappings | CONFIRMED static data and checker; player objective INFERRED; touch/timer behavior UNKNOWN |
| Equation, fast calculator, odd/even, matching, mix, memory, puzzle, 15-puzzle, Sudoku, Rullo, 2048, tap-add, match-3 | Corresponding named activities/layouts and/or `pro2048.json` | CONFIRMED components/assets; availability/rules UNKNOWN |
| Duel, multiplayer, leaderboard | Four `DuelChallenge*Activity` classes plus multiplayer and leaderboard activities | CONFIRMED components; network and player flows UNKNOWN |

No mode has been behaviorally verified. The current Play listing for this package is not sufficient to establish behavior for this supplied v14.2 artifact.

### Math Pieces static refinement

`Game_MathPieces_Activity` checks five-cell equations from both row and column collections and computes `calculateResult()` stars when `onGameComplete()` runs (E-APK-016/017). The packaged 150-level asset and `setGridRowColumn()` establish three board dimensions (E-APK-018). These support the inferred objective of arranging pieces into valid equations across the grid. Data parsing, grid dimension selection, line validation and star rating are standalone helpers in `src/domain/mathPieces.ts`. Drag/drop interaction, timer behavior, completion trigger, counter updates, level persistence, and runtime reachability remain unknown.

## Static code-path refinement

`RandomGameActivity` and its evaluator are present in the DEX, and level loading/result transition methods are documented in `observations/DEX_BEHAVIOR_FINDINGS.md`. This strengthens the code-level evidence for the random-number candidate. It does not establish screen reachability, full player interaction semantics, or equivalence to the initially named Play package.

## Static multiplayer code-path refinement

The DEX shows a room-creation path that requests 24 arithmetic questions from `GenQuestions`; the exact pattern ranges are documented in `GAME_RULES.md`. Mark this as confirmed generator code only. Do not claim that the multiplayer screen is reachable or that room creation works at runtime.
