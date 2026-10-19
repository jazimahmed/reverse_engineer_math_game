# Functional specification — evidence-gated baseline

This specification describes code-level evidence from the supplied APK v14.2. It is not a complete user-visible product specification because the APK is not currently observable at runtime and its package differs from the initially named Play app.

## Candidate mode: Random Number

Evidence: `research/observations/DEX_BEHAVIOR_FINDINGS.md` DEX-RN-001 through DEX-RN-011; dataset structure in `STATIC_CODE_INVENTORY.md`.

### Inferred objective

Use available number tiles in chained equations so that a result reaches the displayed target. The packaged help dialog illustrates `3 + 2 = 5`, then carries `5` into `5 × 11 = 55` for target 55 (DEX-RN-011). This is inferred from help illustrations, not an observed play session.

### Inputs and stored data

- A level index selects an entry from `randomNumberData.json`'s `levels` array.
- The level model supplies integer number tiles, a target integer (`randomNo`) and a maximum (`maxHints` in the data model; activity field `max`).
- The activity stores equation selections in three string slots and prior intermediate results in a results list.

### Verified code rules

- Expression layout passed to `calResult` is `[leftOperand, operator, rightOperand]`.
- Operators: `+`, `-`, `×`, `÷`; arithmetic is integer-based.
- Division returns truncated integer quotient only if divisor is nonzero and left operand is at least right operand; otherwise result is zero.
- `completeEqTwo(value)` compares its value with target; mismatch invokes `gameOver()`.
- `gameOver()` marks level complete, conditionally records a new highest level, and opens `Result_Game2Activity`.
- Input selection is category-checked by slot: operators are accepted only in slot index 1; number values are accepted in slots 0 and 2. After accepted slot 0, operator controls are enabled and number controls disabled. After slot 1 or 2, number controls are enabled and operator controls disabled. On a target match with more rows available, the next row is seeded with the previous result and set up for operator selection.
- A completed three-slot expression is evaluated and appended to the activity's result list. When `completeEqTwo` receives a value different from the target, it calls `gameOver()`. When the value equals the target and fewer than `max` results have been recorded, the activity initializes the next row from the previous result and allows further input. At `results.size == max`, it plays a sound, calls `CustomToast()`, and animates the undo button.
- `showEquationTwo` ignores input after `isLevelCompleted` is set. Its exception handlers route to the back handler.

### State machine, partial

`UNOBSERVED/INITIALIZATION → LEVEL_DATA_LOADED → ALTERNATING_NUMBER_OPERATOR_INPUT → EXPRESSION_EVALUATED → {TARGET_MISMATCH: RESULT_ACTIVITY | TARGET_MATCH: NEXT_ROW | TARGET_MATCH_AT_MAX_ROWS: FEEDBACK_BRANCH}`

The labels are an implementation model of static code paths, not confirmed screen states. The help illustration implies non-target intermediate results can continue into another row, but `completeEqTwo`'s target-mismatch branch calls `gameOver()`; the exact invocation timing and shipped behavior are contradictory/UNKNOWN until runtime observation. The result activity's presentation does not establish whether a mismatch is shown as a win or loss. Number reuse, undo semantics, hint effect/cost, retry behavior, scoring and timers remain unknown.

### Not specified due to missing evidence

Do not implement a timer, score formula, hint cost, incorrect-answer penalty, random question generator, or navigation route based only on class names. Reachability and user-facing operation need device evidence.

## Candidate mode: Math Pieces

The asset and activity indicate level/grid data and time-related fields. An inferred objective is arranging arithmetic pieces so equations are valid across rows and columns; the static checker and limits are recorded in DEX-MP-003.

The exact 150-level asset is copied to `src/domain/data/mathPiecesLevels.json`. The static `setGridRowColumn()` mapping is 56 cells → 7 columns × 8 rows, 72 → 8 × 9, and 90 → 9 × 10. Asset defaults show all levels locked and 0 stars, but runtime progress may be applied elsewhere, so those values are not used as a persistence specification.

The independently implemented rule is limited to one complete five-cell line: recognized operators evaluate adjacent integer operands; the result must appear at either end adjacent to `=`. Subtraction uses the nonnegative absolute difference, division uses integer quotient, and the APK converts results to float before `Math.round()`. This does not model the board or state transitions.

The completion trigger is statically resolved by E-APK-020 / DEX-MP-006: 100 ms after every accepted drop, `checkCorrectEquation()` rebuilds all row/column equations (fresh per pass), marks valid ones, and ends the level only when every line is valid in that one pass (`score == equations.size()`, the rows + columns master list `loadData()` establishes per level); then `calculateResult()` stores stars per E-APK-016. Wrong-attempt counting is de-duplicated per container tag, and attempt counters reset per level. `checkMathPiecesEquations()` in `src/domain/mathPieces.ts` models a pass; callers must rebuild their input with `isCorrect=false` on each pass for parity.

Timer behavior remains unspecified due to missing evidence (the timer fields have no nonzero write in the dump), and no UI exists. Do not implement a countdown, score display, or persistence without further evidence.

## Candidate mode: Multiplayer room question generation

Evidence: `research/observations/DEX_BEHAVIOR_FINDINGS.md` DEX-MULTI-001 and the table in `GAME_RULES.md`.

The pure question generator is specified and implemented from DEX evidence. The APK code path requests 24 questions while constructing a room. This does not verify multiplayer entry/navigation, network dependencies, timer behavior, scoring, answer validation, player synchronization, result handling, or offline behavior. Those remain UNKNOWN; do not represent the isolated generator as a complete multiplayer mode.
