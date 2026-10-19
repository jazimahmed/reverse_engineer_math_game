# Scoring system

Runtime scoring behavior is UNKNOWN. Static result activities/adapters, leaderboard identifiers, and the `stars` field in math-pieces level records show score/result/progress-related components exist in the package, but do not establish formulas or when progress is awarded.

Still to observe per game: initial score, correct/incorrect effects, time bonuses or penalties, hint costs, star thresholds, score persistence, and result-screen contents.

## Runtime-observed scoring — Addition Practice (E-RT-006)

**CONFIRMED** by controlled taps and counter read-outs:

- A round is **10 questions**.
- The green chip (`right1`) counts **first-try correct** answers only.
- The red chip (`wrong1`) counts **questions that required a retry** — it does not count wrong taps. A question answered wrong on the first tap and then correctly contributes **1 red** and **0 green**.
- A wrong tap has **no** immediate effect on either counter; the tapped option turns red with black text and stays marked, and the question does not advance (verified over 4 s with identical frames).
- A correct first-try answer increments the green chip **immediately** and flashes the background green; the next question loads within ~0.9 s.
- The result screen's "Correct" number equals the number of questions solved without a retry (a 10/10 first-try round showed Correct = 10, Wrong = 0).
- Consequence for the reimplementation: "Wrong" on the result screen is a **retry count**, not an error count; a question may have had several wrong taps and still count once.

UNKNOWN: whether a question can accumulate more than one red (only single-wrong-tap situations were observed), the exact threshold of the red chip, whether any other mode scores this way, and whether results persist per level.

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
