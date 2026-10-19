# Unknown behavior

The target is `research/apk/Math-Games-v14-2-[Premium]-modyolo.apk`. **The APK is now installed and running on an emulator** (2026-10-19/20), so runtime observations exist; see `research/observations/RUNTIME_FIRST_PASS.md` and E-RT-001…E-RT-027 in `EVIDENCE_LOG.md`. The remaining unknowns below are what the runtime pass has *not* yet covered.

Highest-priority unknowns:

1. **The 5 unplayed Addition modes** (Play, Learn, Hard, plus full Duel/Quiz/Test/Time end-to-end) — Play's keypad/completion, Learn's column-addition gameplay, Hard's rules, Duel's win condition, Test/Time result screens and scoring are unknown.
2. **The other 7 topics' modes** (Subtract, Multiply, Divide, Square root, Decimals, Fractions) — mode labels are confirmed (E-RT-019) but no gameplay has been observed. The nine numbered `*Game1..9Activity` tiers per topic are unexplored (operand ranges, difficulty progression).
3. **The 7 other mini-games** in the hub (2048, Fifteen, Puzzle, Match, Sudoku, Mix, Memory) — tile presence is confirmed, behavior is not.
4. **Equations board interaction** — no successful drag has been performed; answer-cell fill/backspace, row/column feedback colouring, star award, the AD hint, the countdown duration and the empty header panel are all unknown. The level also self-ends after the tutorial, so the intended play loop is still unobserved.
5. **Result screen details** — the three bottom-bar icons (thumbs-up / refresh / pink), how wrong answers render in the review sheet, RESTART behavior, per-level persistence.
6. **Progress unlocks, star scoring, persistence and resume** — only the Settings Night toggle has been verified to persist (force-stop + relaunch). Level unlock state, stars, score history, and the reset button are unknown.
7. **The main-menu utility tiles** — profile avatar, language switch ("文/A"), reset progress, and the gear-with-"1" dialog on the topic screen.
8. **Offline behavior, ads, network requirements** — the Google Sign-In gate is observed; ad placements (the "AD" hint tile, the pink tile in the bottom bar) are unobserved.
9. **Duel/multiplayer online requirements and behavior without connectivity** — static generator only.
10. **Random Number mode** — still not reachable from any observed screen; its objective remains INFERRED and the DEX `completeEqTwo` conflict unresolved.
11. Which packaged assets are used by this v14.2 build versus legacy/unused resources (the `timerGameLevels` mismatch is one confirmed case).
12. How much the supplied Modyolo-distributed build differs from the original developer-signed build.

**Environment note (resolved):** the earlier "ADB cannot connect" blocker is fixed — `C:\Users\Administrator\.android` had to be created manually; the daemon then worked, the Pixel 6 AVD booted headless and the APK installed (`Success`). The npm blocker was a transient `read ECONNRESET`; the retry succeeded (299 packages, lockfile, `tsc --noEmit` clean, 26/26 tests).

## Static-code coverage that does not remove runtime unknowns

For the candidate random-number mode, DEX now establishes arithmetic parsing/evaluation, operator-slot category checks, initial row/grid setup, hint gating, input-slot alternation, result/target branches, level unlock write behavior, and candidate route wiring. AAPT establishes compiled layout hierarchy and constraints. Still UNKNOWN: whether users can reach the route, what target match/mismatch means to the player, feedback/toast wording, scoring, retry/undo behavior, ads at runtime, persistence across process restart, actual rendered appearance, and behavior on devices. The result activity launch and highest-level write are static code paths, not proof of a successful or winning gameplay outcome.

Math Pieces now has one established static score formula: correct/wrong attempt percentage maps to 0–3 stars (E-APK-016), and attempt-counter wiring plus the completion trigger are statically resolved (E-APK-020): a pass 100 ms after every accepted drop completes the level only when all row/column equations are valid in that single pass, with per-tag de-duplicated wrong-attempt counting and per-level counter resets. Remaining unknowns: runtime drag-acceptance rules, pass cadence when both scheduled runnables fire, the timer's role (`fixedTimeInMS` has no nonzero write in the dump), pauses, unlock/persistence, result presentation, and whether the candidate mode is reachable.

Math Pieces' row/column checker supports an inferred objective of arranging arithmetic pieces into equalities (E-APK-017). The completion trigger is now statically resolved (E-APK-020), but exact tile inventory, allowed movement, when the timer starts/stops, correction/undo behavior, and actual instructions remain UNKNOWN. Timer-related fields (`fixedTimeInMS`, `totalMiliseconds`, `time`, …) exist but receive no nonzero write in the current dump, so no countdown duration is established.
