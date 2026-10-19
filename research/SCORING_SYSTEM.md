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

`onGameComplete()` assigns this value to the active level's stars before entering `gameOver()`. Confidence is **CONFIRMED for the DEX path**, but UI interpretation, persistence, and the events that increment each counter are **UNKNOWN**. Implementation is in `src/domain/mathPieces.ts`.
