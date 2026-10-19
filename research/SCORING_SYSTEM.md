# Scoring system

Runtime scoring behavior is UNKNOWN. Static result activities/adapters, leaderboard identifiers, and the `stars` field in math-pieces level records show score/result/progress-related components exist in the package, but do not establish formulas or when progress is awarded.

Still to observe per game: initial score, correct/incorrect effects, time bonuses or penalties, hint costs, star thresholds, score persistence, and result-screen contents.

## Math Pieces stars — static code evidence

`Game_MathPieces_Activity.calculateResult()` returns a star count from correct and wrong attempt counters:

- 0 correct attempts → 0 stars.
- Otherwise calculate `correct / (correct + wrong) * 100`.
- 40% through 90%, inclusive → 2 stars.
- Above 90% through 100%, inclusive → 3 stars.
- Other percentages → 1 star.

`onGameComplete()` assigns this value to the active level's stars before entering `gameOver()`. Confidence is **CONFIRMED for the DEX path** (E-APK-016, boundary constants re-verified 2026-10-19). UI interpretation, persistence, and mode reachability remain **UNKNOWN**. Implementation is in `src/domain/mathPieces.ts`.

## Math Pieces attempt counters — static DEX evidence

Counter wiring is now statically resolved (E-APK-020); it is no longer unknown how attempts accrue:

- `calculateResult()`'s debug logs identify its own fields: field `o` = correctAttempts, field `p` = wrongAttempts.
- correctAttempts increases only by `+equations.size()` when a check pass marks an entire pass newly correct (`checkCorrectEquation()`), i.e., at level completion time.
- wrongAttempts increases only inside `checkEquations()` failure branches, de-duplicated per equation-container tag (`equtaionTags`): each container counts at most once, its first failure.
- Both counters reset to 0 in the activity constructor and in `reset()`.
- The timer fields (`fixedTimeInMS` etc.) receive no nonzero value in the dump; timing behavior remains UNKNOWN.
