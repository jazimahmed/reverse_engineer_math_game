# Test matrix

The matrix distinguishes static artifact evidence, implementation checks, and actual reference-runtime comparison. The APK has not launched in this environment.

| Feature ID | Reference behavior / static evidence | Implemented behavior | Evidence | Test result | Difference | Severity | Resolution |
|---|---|---|---|---|---|---|---|
| APK-IDENTITY | Package `com.GamesForKids.Mathgames.MultiplicationTables`, version 14.2/142 | N/A | E-APK-001 | Static inventory only | Different from initially named Play package; supplied APK is active target by user direction | N/A | Scope recorded |
| RN-EVALUATOR | DEX `calResult`: integer addition, subtraction, multiplication, and guarded division; fallback 0. `checkInput` enforces operator category at slot 1 | Standalone TypeScript evaluator and slot validator | E-APK-003; DEX findings | 3 test cases passed; strict compile passed | No screen/caller runtime behavior verified | Medium | Partial code path implemented |
| RN-INITIALIZER | DEX derives equation rows/number-grid columns from level data | Pure config helper | DEX-RN-005 | 1 test case passed | Layout/runtime geometry unknown | Medium | Static helper implemented |
| RN-DATA | APK's 250 ordered levels with fixed numbers, target and hints | Copied level JSON plus validated parser | E-APK-011; E-IMPL-006 | 2 test cases passed | Runtime asset loading and level selection unverified | Medium | Data parser implemented |
| RN-HINT-FLOW | DEX caps hint counter, applies unlimited/max gate, and invokes rewarded-video path at limit | Pure decision helpers | DEX-RN-006/007 | 2 test cases passed | Ad callback/UI and hint content unknown | Medium | Static helpers implemented |
| RN-TARGET-BRANCH | Target mismatch enters gameOver/result route; target match continues or reaches max-row feedback branch | Pure target transition helper | DEX-RN-009 | 2 test cases passed | Result route's win/loss meaning and toast content unknown | Medium | Static branch helper implemented |
| RN-RESULT | Result activity restart, next-level state, and back-to-game-menu code paths | Next-level state helper only | E-APK-013; E-IMPL-007 | 1 test case passed | UI controls, visibility, messages and persistence integration unverified | Medium | State helper implemented |
| RN-NAV | GameActivity branch opens GameLevelsActivity; level-row callback selects and opens RandomGameActivity; back returns to levels | Static route map only | E-APK-008/009; DEX-RN-007 | Not run against APK runtime | Visible control label and reachable route unknown | N/A | Static route documented |
| RN-LEVELS | Saved-level lock image logic; row text click listener exists for each position | Static adapter/layout analysis | E-APK-012 | Not run against APK runtime | Whether locked row touch reaches callback unknown | N/A | Static behavior documented |
| RN-HELP | Help dialog statically shows two images illustrating chained arithmetic to target | Original APK illustrations inspected; no reuse in app | E-APK-014 | Static asset/dialog inspection only | Actual dialog rendering and conflict with mismatch branch unresolved | Medium | Objective labeled inferred; conflict documented |
| RN-RESULT-TEXT | Shared result layout heading “Completed”, with level/rank labels | Resource/layout inspection only | E-APK-015 | Static resource lookup; no runtime comparison | Does not establish whether mismatch is a loss, success, or generic completion | Medium | Outcome remains UNKNOWN |
| MP-STAR-SCORE | Math Pieces attempt percentage mapped to 0–3 stars at zero, 40%, 90%, and 100% boundaries | Standalone scoring helper | E-APK-016 | 2 Node test cases; static DEX comparison (boundary constants re-verified 2026-10-19); no runtime comparison | Persistence and rendered meaning unknown; counter events now resolved (E-APK-020) | Medium | Isolated formula implemented; broader mode pending |
| MP-LINE-CHECK | Five-cell Math Pieces row/column arithmetic equality check | Standalone line validator | E-APK-017 | 2 Node test cases; static DEX comparison; no runtime comparison | Full grid interactions and per-line check timing inside the verified pass model unknown | Medium | Isolated checker implemented; broader mode pending |
| MP-DATA-GRID | 150 packaged Math Pieces level records and three grid dimension mappings | Dataset parser and grid config helper | E-APK-018 | 3 Node test cases; exact asset/hash and DEX mapping | Render order, saved progress overrides, and device sizing not checked | Low | Asset copied and helper implemented |
| MP-DRAG-TRANSFER | Accepted DEX drop copies dragged text/tag to target and clears source | Pure text transfer helper; no UI integration | E-APK-019; E-IMPL-010 | Included in 26 passing Node tests; strict TS check passed | Target acceptance, keyed-tag behavior, board integration, and runtime visuals remain unknown | Medium | Isolated transfer helper implemented |
| MP-CHECK-PASS | DEX `checkCorrectEquation`: pass 100 ms after each accepted drop rebuilds fresh equations; completes only when every line is newly valid in one pass; wrong attempts de-duplicated per container tag; counters 0 in constructor/`reset()` and `calculateResult()` logs name `o`=correctAttempts, `p`=wrongAttempts | Pure check-pass helper with optional per-key wrong-attempt dedupe; no UI integration | E-APK-020; DEX-MP-006 | 4 Node test cases (one-pass completion, partial pass, empty pass, dedupe); strict TS check passed | Runtime pass cadence (both runnables), drag acceptance, timer effect, and visuals unknown | Medium | Check-pass helper implemented |
| MULTI-GENERATOR | DEX `GenQuestions`, CreateNewRoom requests 24 | Standalone index-based question generator | E-APK-005 | 4 test cases passed; strict compile passed | No network, room, or user-visible multiplayer behavior verified | Medium | Generator slice implemented |
| RN-FLOW | Data-driven level, target comparison, saved highest level and result activity in DEX | No UI/state machine | E-APK-003 | Not run against reference | Reachability and full semantics unknown | N/A | Pending observation |
| CAT-ARITH | Arithmetic category activity families and numbered games in DEX | None | E-APK-002 | Not run | Screen flow/rules unknown | N/A | Pending observation |
| PUZZLE-RANDOM | 250 target/number/hint records | No gameplay UI | E-APK-002 | Data inspected only | Objective/feedback/scoring unknown | N/A | Pending observation |
| PUZZLE-MATHPIECES | 150 `timerGameLevels`; timer-related activity methods | None | E-APK-002, E-APK-004 | Static only | Objective/timer/scoring unknown | N/A | Pending observation |
| NAVIGATION | Candidate Activities/resources present | None | E-APK-002 | Not run | Routes/reachability unknown | N/A | Pending observation |
| DEVICE-ADB | Pixel 6 AVD files present; emulator boot was observed | N/A | E-ENV-003/004 | ADB invocation failed before device enumeration | APK install/launch/capture unavailable | N/A | Environment blocker |

## Runtime-observed rows (2026-10-19 emulator run of the exact APK)

The APK is now installed and running; the rows above that say "Not run" describe the pre-runtime state. These rows record what was actually observed against the reference.

| Feature ID | Reference behavior (observed) | Implemented behavior | Evidence | Test result | Difference | Severity | Resolution |
|---|---|---|---|---|---|---|---|
| RT-BOOT | Splash shows GA STUDIOS logo, "v14.2", green progress dot, then hands off to MainActivity after 10-15 s | None | E-RT-001, E-RT-017 | Observed on device; screenshots captured | No implementation yet | High | Pending M4 |
| RT-MAINMENU | 4 utility tiles (avatar, gear, 文/A, reset) + 8 topic tiles in 2x4; gamepad tile opens the Games hub | None | E-RT-002 | Observed on device; UI dump captured | No implementation yet | High | Pending M4 |
| RT-MODESEL | Topic screen shows 8 mode tiles: Practice, Quiz, Duel, Play, Test, Time, Learn, Hard | None | E-RT-004 | Observed for Addition only | Other topics unverified | High | Pending M4 |
| RT-PRACTICE-STRUCT | 10 questions, 4 options in a 2x2 grid, operands 0..10 for Game 1 | None | E-RT-005, E-RT-018 | Observed; 14 question samples recorded | No implementation yet | High | Pending M4 |
| RT-PRACTICE-SCORE | Green counter = first-try correct; red counter = questions needing a retry; wrong tap marks the option red, does not advance, does not change counters | None | E-RT-006 | Observed with controlled taps (single-wrong-tap case) | Multi-wrong-tap counting unknown | High | Pending M4 |
| RT-PRACTICE-FEEDBACK | Idle background light blue, correct flash green, last question orange | None | E-RT-007 | Observed | No implementation yet | Medium | Pending M4 |
| RT-RESULT | "Score" title, Correct/Wrong counts, RESTART/EXIT, green checklist icon, 3-icon bottom bar; EXIT returns to the topic screen | None | E-RT-008, E-RT-010 | Observed (10/10 round: Correct 10, Wrong 0) | RESTART and bottom-bar icons unobserved | High | Pending M4 |
| RT-REVIEW-SHEET | Checklist icon opens a scrollable per-question list with green checks | None | E-RT-009 | Observed; scrolled | Wrong-answer rendering unobserved | Medium | Pending M4 |
| RT-SETTINGS | Purple dialog with Music/Sound/Night; Night = global dark theme and persists across force-stop + relaunch | None | E-RT-011 | Observed and persistence verified | Music/Sound effects unobserved | High | Pending M4 |
| RT-GAMES-HUB | 8 mini-game tiles (2048, Fifteen, Puzzle, Match, Sudoku, Mix, Memory, Equations); crown raises Google Sign-In | None | E-RT-003 | Observed | 7 games unentered | Medium | Pending M4 |
| RT-EQ-LEVELS | Equations level list: 4 columns, level 1 unlocked, others padlocked, long scroll | None | E-RT-012 | Observed | Unlock rules unknown | Medium | Pending M4 |
| RT-EQ-BOARD | 5x5 crossword board (`58 + 87 = ?`, `18 - 8 = ?`), digit tray with 1-9/0/backspace/AD hint, countdown stopwatch | None | E-RT-013, E-RT-014 | Observed | Drag interaction not performed | High | Pending M4 |
| RT-EQ-TUTORIAL | ▶ on the help overlay reveals a playable board, then the level ends by itself and the app returns to the level list | None | E-RT-015 | Observed 3x (no crash, no ANR) | Matches the static `completeEqTwo` → `gameOver()` mismatch path | High | Documented; parity requires reproducing the self-end |
| RT-DATA-MISMATCH | Live board is 5x5; packaged `timerGameLevels` dataset is 56/72/90 cells (7x8/8x9/9x10) | Dataset parser + grid config (static mapping) | E-RT-016, E-APK-018 | Data compared | The packaged dataset belongs to a different variant | High | Dataset must not drive the Easy board |

## Runtime-observed rows (2026-10-19/20 emulator runs)

| Feature ID | Reference behavior (observed) | Implemented behavior | Evidence | Test result | Difference | Severity | Resolution |
|---|---|---|---|---|---|---|---|
| RT-MODESEL-VARIANT | Mode tiles vary per topic: Add/Sub 8 modes; Mul/Div 8 with Exam; Sqrt 6; Dec 4 cross-topic; Frac 6 cross-topic | None | E-RT-019 | Observed for all 7 topics | No implementation | High | Pending M4 |
| RT-PRACTICE-SCORE-FULL | Green = first-try correct; red = retry count per question (not per wrong tap); multiple wrong taps don't increment red further | None | E-RT-020 | Observed with 3 wrong taps then correct | De-duplication confirmed | High | Pending M4 |
| RT-QUIZ-MISSING-OP | Missing-operand format (`a + ? = r`), 4 options, same scoring | None | E-RT-023 | Observed | No implementation | High | Pending M4 |
| RT-DUEL-SPLIT | Split screen, same question both halves, two chips (+1/-1), mirrors | None | E-RT-022 | Observed 6 bottom-only + 3 top-only rounds | No implementation | High | Pending M4 |
| RT-TEST-TF | True/False on complete equation; wrong increments red immediately | None | E-RT-021 | Observed | No implementation | High | Pending M4 |
| RT-TIME-AUTO | True/False with auto-advance ~4.5s/q; wrong increments red | None | E-RT-024 | Observed 3 auto-advances in 9s | No implementation | High | Pending M4 |
| RT-PLAY-KEYPAD | 3 simultaneous equations, on-screen keypad 0-9, no counters/timer | None | E-RT-025 | Layout captured | Gameplay unknown | Medium | Pending M4 |
| RT-LEARN-SETUP | Digit-count checkboxes + Start; gameplay unobserved | None | E-RT-026 | Entry captured | Gameplay unknown | Medium | Pending M4 |
| RT-MODE-HARD | Hard mode tile present; not entered | None | — | Not observed | UNKNOWN | Medium | Pending M4 |

## Specification rows (M3 — evidence-linked specs written)

| Feature ID | Reference behavior (observed) | Spec document | Evidence | Status | UNKNOWNs noted |
|---|---|---|---|---|---|
| SPEC-ADD-PRACTICE | 10Q, 4opt, first-try green, retry red, de-duplicated wrong | `SPEC_ADDITION_PRACTICE.md` | E-RT-005..007,020 | Written | Pencil, gear, sound, gen algo |
| SPEC-ADD-QUIZ | Missing-operand, 4opt, same scoring | `SPEC_ADDITION_QUIZ.md` | E-RT-023 | Written | Operand ranges, higher tiers |
| SPEC-ADD-DUEL | Split screen, cross-increment chips, mirror | `SPEC_ADDITION_DUEL.md` | E-RT-022 | Written | Win condition, network, tiers |
| SPEC-ADD-TEST | True/False on full eq, wrong→red immediate | `SPEC_ADDITION_TEST.md` | E-RT-021 | Written | right1 behavior, result screen |
| SPEC-ADD-TIME | True/False + auto-advance 4.5s/q | `SPEC_ADDITION_TIME.md` | E-RT-024 | Written | Total duration, pause, scoring |
| SPEC-ADD-PLAY | 3 eq + keypad | `SPEC_ADDITION_PLAY.md` | E-RT-025 | Written | **All gameplay UNKNOWN** |
| SPEC-ADD-LEARN | Digit-count checkboxes + Start | `SPEC_ADDITION_LEARN.md` | E-RT-026 | Written | **All gameplay UNKNOWN** |
| SPEC-EQUATIONS | 5×5 crossword, tray, countdown, overlay self-end | `SPEC_EQUATIONS.md` | E-RT-013..016 | Written | Drag, validation, stars, timer, AD |
| SPEC-SETTINGS | Music/Sound/Night toggles, Night persists | `SPEC_SETTINGS.md` | E-RT-011 | Written | Music/Sound persist, footer icons |
| SPEC-NAVIGATION | Full back-stack, topic-specific mode sets | `SPEC_NAVIGATION.md` | E-RT-001..010,019 | Written | Profile, lang, reset, deep links |
| SPEC-PERSISTENCE | Night mode SharedPreferences, level unlock | `SPEC_PERSISTENCE.md` | E-RT-011,012,019 | Written | Scores, reset, schema, migration |
| STATE-MACHINES | Complete ASCII machines for all observed modes | `STATE_MACHINES.md` | All E-RT | Written | Explicit UNKNOWN labels per transition |
