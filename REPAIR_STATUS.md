# Core gameplay repair status

**Date:** 2026-10-28

**Scope:** First repair pass from `PROJECT_REVIEW.md`: round progression, retry handling, scoring, and timeouts for the existing Addition-based Practice, Quiz, Test, Time, and Duel flows.

**Branch:** `fix/core-gameplay-rounds`

**Status:** Implemented and locally checked; Android device acceptance remains pending.

## Coordination and preservation

Two subagents worked concurrently with separate file ownership:

1. **Session agent:** `src/store/gameSessionStore.ts`, session tests, and their in-memory TypeScript loader.
2. **Interaction agent:** Practice, Quiz, Test, Time, and Duel components only.

The lead integrated and reviewed both changes, implemented the round controller and screen/result wiring, and added controller regression tests. Existing research logs, build-fix patch, package-lock backup, and other unrelated local work were not included in the repair changes. `PROJECT_REVIEW.md` is included as the baseline review, not rewritten to imply its findings have all been resolved.

## Fixes implemented

| Review issue | Repair | Verification |
|---|---|---|
| R01: round never advances/completes | Resolution and advancement are guarded store actions. Each advance replaces the question and increments its index atomically. Final transition ends at 10/10, with one completion callback. | Ten-question store/controller regression tests |
| R02: wrong answer locks retries | Wrong answers retain feedback but do not lock the question. Correct answers lock immediately with a ref, including repeated taps before a render. | Component code review; store/controller retry tests; native interaction testing pending |
| R03: timeout repeats question/passes limit | Timeout resolves once, records an unanswered history entry, loads the next question, resets the timer, and finishes at the round limit. | Full unattended 45-second virtual-clock round; boundary/race tests |
| R05: scoring and history | Store derives first-try status from prior wrong attempts. Practice/Quiz add one red on eventual retry success; Test/Time add red immediately once. One history row per resolved question. | Wrong/wrong/correct tests for all four modes; timeout with and without earlier wrong answer |
| R08: Duel duplicate scoring | First correct answer locks both players; store rejects later submissions; next question resets feedback. Existing cross-chip scoring is preserved. | Duplicate/simultaneous Duel submissions and bounded completion tests; component code review |
| R09: stale session/timer behavior | Session IDs and question indices reject stale events. Controller cancels callbacks on departure. Screen starts a fresh session on focus and pauses/resumes on AppState changes. Result replaces completed Game; Restart replaces Result; Exit returns to TopicSelect. | Disposal/restart/stale callback/pause tests; navigation wiring reviewed, native navigation pending |
| R13: solution exposed | Practice and Duel render `?` in the answer position. Quiz and True/False equation formats remain distinct. | Component code review |
| R16: conditional hook count | Effects execute before null-question returns; feedback timers clean up on question change/unmount. | Component code review and TypeScript check |
| R17: missing gameplay tests | Added 17 real-store tests and 10 controller tests using a deterministic clock. Existing domain tests retained. | 53 total tests pass |

The Result screen now displays Duel chip scores instead of ordinary green/red counters and labels unanswered history entries as timeouts.

## Explicit behavior choices

Some reference-app behavior remains unknown in the research specifications. These are implementation policies, not claims of verified reference parity:

- **First-try correct:** earns one green in Practice, Quiz, Test, and Time. Correct after a retry earns no green.
- **Practice/Quiz wrong attempts:** stay on the question; red is added once when eventually solved.
- **Test/Time wrong verdicts:** add red immediately once per question, remain retryable, and do not reset the timer.
- **Timeout:** counts as one red outcome. A preceding wrong verdict already counted red, so timeout does not add another. History records `userAnswer: null`, `correct: false`.
- **Time correct answer:** advances immediately. Other supported modes retain the existing 900 ms feedback transition, including on the final question.
- **At the deadline:** elapsed time is checked before accepting an answer. An expired question cannot receive a late answer, and its stale event cannot answer the newly loaded question.
- **Backgrounding:** timer and pending question transition pause. Foreground resumes the remaining question time; a paused feedback transition restarts its 900 ms delay.
- **Leaving the Game route:** ends that session and cancels its scheduled work. Re-entering/restarting creates a new session rather than silently resuming old progress.
- **Duel:** the first correct submission resolves the shared question; wrong submissions retain the existing cross-chip decrement behavior.

## Implementation map

- `src/store/gameSessionStore.ts`: authoritative score/history state, session identity, guarded answer/expiry/advance actions.
- `src/utils/gameRoundController.ts`: elapsed-time accounting, transition scheduling, completion callback, pause/resume/disposal.
- `src/screens/GameScreen.tsx`: controller lifecycle, AppState integration, captured question identity in callbacks, Result replacement.
- `src/components/{Practice,Quiz,Test,Time,Duel}View.tsx`: retry-friendly input, immediate resolution guards, feedback reset, unconditional hooks.
- `src/screens/ResultScreen.tsx`: clean restart/exit targets, Duel scores, timeout review labels.
- `tests/gameSession.test.mjs`: 17 store regression tests.
- `tests/gameRoundController.test.mjs`: 10 orchestration/virtual-clock regression tests.
- `tests/helpers/loadTypeScript.cjs`: compiles local TypeScript in memory; tests use the real Zustand store without mocking its mutations.

## Verification results

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | Passed: 53 tests, 0 failures (26 existing + 27 new) |
| `git diff --check` for repair files | Passed |
| Rendered component/native UI tests | Not performed; no component renderer is installed |
| Release APK build/install/device or emulator testing | Not performed during this repair |
| GitHub Actions build for this branch | Not run as part of the local verification; existing APK workflow is manually dispatched |

Existing Node module-type warnings from domain-test imports remain non-fatal. No dependency or lockfile changes were needed.

The automated tests establish the session and controller behavior. They do **not** establish correct native layout, touch dispatch, navigation animations, or Android background behavior. Those require testing the built APK.

## Remaining issues

- **R04:** Topic-specific generators and mode availability are still incorrect. Non-Addition topics and unsupported identifiers retain existing Addition fallbacks. This pass fixes the shared core loop, not the advertised topic coverage.
- **R06/R07:** Equations, Play, and Learn remain incomplete. Seven mini-games remain disabled previews.
- **R10:** Completion still does not update persistent topic/tier/level progress.
- **R11/R12:** Grid layout, narrow-screen geometry, and balanced Duel layout remain to be repaired.
- **R14:** Review-sheet touch dismissal and Android modal Back handling remain outstanding.
- **R15:** Utility actions, audio settings integration, and consistent Night mode remain incomplete.
- **R17 (partial):** CI now picks up the added Node tests through the existing test script, but no installed-release or rendered-component smoke suite exists.
- **R18/R19:** Production signing/versioning, research branding, startup delay, and historical documentation reconciliation remain outstanding.
- Native lifecycle/navigation and input behavior still need verification even for the repaired paths.

## Next APK acceptance pass

1. Complete ten questions in Practice/Quiz/Test with wrong → wrong → correct retries; check counts and one history entry per question.
2. Complete Time with no input, then with wrong/correct answers near expiry; verify new equations and exactly one Result transition.
3. Rapidly tap answers, including both Duel halves; check no duplicate score or skipped question.
4. Background during a timed question and during feedback; resume and check the documented pause policy.
5. Back out during feedback, re-enter, complete, Restart, Exit, and use Android Back; check for stale state and blank screens.
6. Confirm Practice/Duel hide the answer and every new question has usable controls.

Record the APK source commit/checksum, device, Android version, and actual results before marking device acceptance complete.
