# Project review: Math Games Android app

**Reviewed:** 2026-10-28

**Repository:** `jazimahmed/reverse_engineer_math_game`

**Local HEAD:** `f131eea3316bf82674e84ff6f130ed808e2b113c`

**Verdict:** Not ready for a general-user release. The current app is a research prototype with broken core round handling and substantial unfinished functionality.

## 1. Executive summary

The reported poor APK experience is consistent with concrete problems in the source. The biggest problems are functional, rather than build failures:

- Practice, Quiz, and Test can become unresponsive after a single answer.
- Correct answers do not advance the question number or normally finish a round.
- Time mode advances the counter without changing the question and can continue beyond 10 questions.
- All arithmetic topics use addition generators; several advertised modes silently become Practice.
- Play, Learn, and Equations are incomplete screens. Seven other mini-games are disabled previews.
- Several layouts, settings controls, and progress features are only partially connected.

**A successful GitHub APK build does not establish that the game works.** The existing checks validate compilation and isolated domain functions, not the screens and session logic that users interact with.

Recommended direction: first deliver one complete Addition flow, with reliable scoring, navigation, and release-APK tests; then expand the supported feature set.

## 2. Scope and evidence

Reviewed the local application entry point, navigation, all gameplay components, screen flows, stores, question generation, existing tests, Android app configuration, and GitHub Actions APK workflow.

This is a source review with executed local checks and direct store probes. The user's downloaded APK was not installed or exercised during this review, and its checksum/build commit was not provided. Findings apply to the local checkout; association with that exact GitHub artifact remains to be verified. Device reproduction steps below are derived from code unless explicitly marked executed.

Existing uncommitted work was present in `research/gradle_release.log`, `android/.kotlin/`, `math-games-build-fixes.patch`, and a package-lock backup. This review adds this document only.

### Checks executed

| Check | Result | What it establishes |
|---|---|---|
| `npm run typecheck` | Passed | Current TypeScript compiles |
| `npm test` | 26 passed, 0 failed | Existing domain helper tests pass |
| Direct Test-mode store probe | Wrong answer leaves `redChip: 0`, history length 1 | Wrong-answer scoring defect confirmed |
| Direct Time-mode store probe | After 11 expiries: index 12, total 10, still active, original question retained, history empty | Timeout progression defects confirmed |
| Direct Practice-mode store probe | Correct answer gives green 1 but index remains 1 | Recording an answer alone does not advance the round; screen also omits the advance call |

Probes loaded the actual TypeScript store through an in-memory TypeScript-to-CommonJS loader and called its actions. They did not render React Native components. The test command also emitted Node module-type warnings; these were not test failures.

### Priority definitions

- **P1 — High:** Blocks meaningful gameplay or produces materially wrong behavior. Fix before wider APK testing.
- **P2 — Medium:** Incomplete feature, lifecycle, UI, or release-quality issue requiring correction before calling the affected feature complete.
- **P3 — Low:** Presentation or documentation problem.

## 3. Findings

### R01 — P1: Correct answers do not advance the round

**Evidence:** `src/screens/GameScreen.tsx:115–138`; `src/store/gameSessionStore.ts:98–102`.

Both normal and Duel correct-answer handlers schedule `loadNextQuestion`, but never call `nextQuestion`. The question index remains 1. Practice/Quiz/Test reset their selection state only when that index changes, so the replacement question retains disabled controls. The final-question branch is not reached through normal correct-answer progression.

**Reproduce:** Addition → Practice → choose the correct answer → wait approximately 900 ms. The equation may change, but the counter stays at 1/10 and answer buttons remain locked.

**Fix:** Make advancing the index, replacing the question, resetting per-question state, and completing the round one coordinated transition. Apply equivalent handling to Duel.

**Acceptance:** Exactly ten answered questions produce one Result screen, with each index shown once and no disabled state carried into the next question.

### R02 — P1: Wrong answers permanently lock retry-based modes

**Evidence:** `src/components/PracticeView.tsx:48–79,128–133`; `QuizView.tsx:46–76,117–121`; `TestView.tsx:50–73,111–115`.

Each component sets a selected answer even when incorrect, then blocks every subsequent answer. The parent intentionally stays on the same question after a wrong answer, so the reset never occurs. Time mode has the same selection lock until its next timer expiry.

**Reproduce:** Addition → Practice or Quiz → choose a wrong answer → try the correct answer. In Test, choose an incorrect verdict and retry.

**Fix:** Separate incorrect-option feedback from the transition lock. Only lock the whole question once it is resolved, according to that mode's rules.

**Acceptance:** Multiple incorrect attempts followed by a correct attempt remain possible in retry modes.

### R03 — P1: Time mode repeats the same question indefinitely

**Evidence:** `src/store/gameSessionStore.ts:134–141`; `src/screens/GameScreen.tsx:83–113`.

`tickTime` increments the index and resets the timer, but neither generates a new question nor records an unanswered question. There is no expiry-driven completion check. The screen has no effect that loads a question when the index changes.

**Executed evidence:** Eleven 4,500 ms expiries produced `{index:12,total:10,isActive:true,sameQuestion:true,history:0}`.

**Reproduce:** Start Time and leave it untouched for more than 45 seconds.

**Fix:** Route expiry and answer submission through a single guarded transition. Record timeouts, load a fresh question, and finish at the round boundary. Prevent expiry and a pending answer transition from both advancing the same question.

### R04 — P1: Topic and mode selection does not match gameplay

**Evidence:** `src/constants/game.ts:84–92`; `src/screens/TopicSelectScreen.tsx:47–49`; `src/screens/GameScreen.tsx:32,58–70,90–111`; `src/utils/questionGenerator.ts:40–99`.

`topicId` is not used to choose a generator. Subtraction, multiplication, division, square root, decimal, and fraction selections still lead to addition questions. Hard is explicitly mapped to ordinary Practice. Exam and cross-topic mode identifiers fall through to the same Practice default.

**Reproduce:** Subtract → Practice; Multiply → Exam; Fractions → Multiply. Inspect the operator and operand types.

**Fix:** Use an explicit supported topic/mode registry with matching generators and rules. Hide or clearly disable unsupported combinations rather than silently substituting another game.

### R05 — P1: Scoring does not implement the documented rules

**Evidence:** `src/store/gameSessionStore.ts:104–118`; `src/components/PracticeView.tsx:51–52`; `QuizView.tsx:50–52`; `TestView.tsx:52–65`; `TimeView.tsx:55–66`.

Wrong Test/Time answers never increment red, despite the stated immediate-red behavior. In Practice/Quiz, `firstTry` checks whether the currently selected option was previously wrong, rather than whether any prior answer to the question was wrong. After retry handling is repaired, selecting a previously untouched correct option would still incorrectly count as first-try correct. History currently records attempts, whereas the review UI presents them as question entries.

**Executed evidence:** A wrong Test answer left red at 0.

**Fix:** Track attempts and final outcome per question; implement separate scoring policies for retry modes and verdict modes. Define whether review shows attempts or one summary per question.

**Acceptance:** Three wrong taps then a correct Practice answer count as one retry question; Test/Time wrong verdicts follow their defined immediate scoring rule.

### R06 — P1: Equations is an empty, non-playable board

**Evidence:** `src/screens/EquationsBoardScreen.tsx:20–43,59–98,105–122`.

The selected level is unused. The board starts as 25 empty strings and is never populated or updated. Cells, digits, backspace, and hint controls have empty handlers. Expiry stops visually at zero without ending the level. The tutorial claims it ends the level, but its play action only hides the overlay.

**Reproduce:** Games → Equations → level 1 → play → tap cells/digits and wait for expiry.

**Fix:** Supply verified Easy-board data and implement input, validation, completion, timeout, and progress updates. Until then, identify Equations as unavailable. The repository's `TEST_MATRIX.md:49–50` explicitly warns that the packaged larger-grid data belongs to a different variant; do not wire it into this 5×5 board blindly.

### R07 — P1: Play and Learn expose actions that do nothing

**Evidence:** `src/components/PlayView.tsx:40–45,61–63,96–106`; `src/components/LearnView.tsx:66–68,108–114`; `src/screens/GameScreen.tsx:109–110`.

Play submission and Learn Start are empty handlers. Play expects extra equation fields not generated by the supplied question model, so its nominal three-equation screen only receives one equation. Neither flow can complete.

**Reproduce:** Addition → Play → enter an answer → press ✓; Addition → Learn → Start.

**Fix:** Implement full mode-specific state and actions or disable these entries with a clear availability label.

### R08 — P2: Duel permits repeated scoring and competing delayed transitions

**Evidence:** `src/components/DuelView.tsx:35–57,83–88,118–123`; `src/screens/GameScreen.tsx:128–138`.

Duel has no answered/transition guard and never clears its option-color state for a new question. Repeated taps on the correct option repeatedly score and schedule question replacements; both players can do this during the same transition window.

**Reproduce:** Rapidly tap a correct Duel answer several times before 900 ms elapses.

**Fix:** Resolve each question once with an atomic guard, cancel redundant callbacks, and reset both halves' feedback on a new question ID. Repair R01 first to make full-round verification possible.

### R09 — P2: Session lifecycle and navigation can preserve or revive stale state

**Evidence:** `src/screens/GameScreen.tsx:72–88,115–138,203–205`; `src/screens/ResultScreen.tsx:23–29`; `src/navigation/AppNavigator.tsx:34–40`.

Initialization is mount-only and skips resetting an already-active session of the same internal mode. Leaving a game with Android Back does not end it. Entering the same mode again, even under another topic, can reuse that session. Delayed question-load callbacks are not cancelled on departure. Timers have no focus or AppState policy. Result is pushed over a Game screen that returns `null` once inactive, so back navigation can expose that blank screen.

**Reproduce:** Start a mode, answer, immediately go Back, and reopen the same mode; also test Result → Android Back after round completion is repaired.

**Fix:** Define explicit new-game/resume/restart actions, tie cleanup to route focus and app lifecycle, cancel scheduled transitions, and design the result stack so completed game screens cannot be revisited as blank pages.

### R10 — P2: Progress persistence exists but is never updated by gameplay

**Evidence:** `src/store/additionProgressStore.ts:32–49`; `src/store/equationsProgressStore.ts:33–57`; `src/screens/EquationsLevelsScreen.tsx:20,35–45`; completion path in `src/screens/GameScreen.tsx:141–157`.

Source search found no calls to `updateTier`, `updateLevel`, or `unlockLevel`. Equations therefore keeps only level 1 unlocked by default, and arithmetic results never populate the progress store. Addition's tier-only storage key also lacks the per-mode identity claimed in its header comment.

**Fix:** Write progress exactly once on successful completion, scope records by topic/mode/tier, and verify force-stop/relaunch persistence and reset behavior.

### R11 — P2: Level and mini-game grids are actually single columns

**Evidence:** `src/screens/EquationsLevelsScreen.tsx:34–61,79–89`; `src/screens/GamesHubScreen.tsx:42–65,84–94`.

Both ScrollViews render tiles directly inside content containers without `flexDirection: 'row'` or `flexWrap: 'wrap'`. Tile widths of 23% and 48% do not create columns by themselves. Default vertical layout produces narrow tiles stacked one per row.

**Fix:** Use a wrapping row layout or `FlatList` with explicit column counts. Verify four level columns and the intended hub grid on a phone.

### R12 — P2: Fixed geometry causes narrow-screen layout problems

**Evidence:** `src/screens/EquationsBoardScreen.tsx:146–175`; `src/components/DuelView.tsx:135–138,153–173`.

The Equations tray needs 424 logical pixels: six 56-pixel buttons + five 8-pixel gaps + 48 pixels of padding. It cannot fit within common 360/393-pixel phone widths. Duel combines two large square-button grids with headers/equations; the bottom half lacks `flex: 1`, so the two halves do not divide the screen evenly.

**Fix:** Calculate cell sizes from available width and height, balance Duel halves, and test compact phones, landscape, display scaling, and larger text. Device screenshots are needed to assess exact clipping.

### R13 — P2: Practice and Duel display the answer before selection

**Evidence:** `src/utils/questionGenerator.ts:46–54`; `src/components/PracticeView.tsx:105–111`; `src/components/DuelView.tsx:69–74,104–109`.

Generators put the correct answer in `answer`, and these views render it directly in the equation while asking the user to select an answer. This undermines the exercise.

**Fix:** Keep the solution in the question model but render `?` in the answer position for answer-selection modes. Preserve complete equations for True/False modes.

### R14 — P2: Review modal dismisses when its content is touched

**Evidence:** `src/screens/ResultScreen.tsx:80–107`.

The parent overlay closes the modal on `onTouchStart`, including touches that originate within its child review sheet. Attempting to scroll the list can dismiss it. There is also no explicit Android `onRequestClose` handler.

**Fix:** Use a separate backdrop press target outside the sheet, allow sheet gestures normally, and handle Android Back explicitly. Verify long-history scrolling after the round flow is repaired.

### R15 — P2: Settings and utility affordances are partially nonfunctional

**Evidence:** `src/screens/MainMenuScreen.tsx:50–54,85–95`; `src/screens/TopicSelectScreen.tsx:62–64`; `src/components/PracticeView.tsx:90,142`; `src/screens/GamesHubScreen.tsx:37–39`; `src/screens/ResultScreen.tsx:65–75`; `src/store/settingsStore.ts:9–35`.

Profile, language, reset, several settings gears, pencil, crown/sign-in, and result footer controls have no implemented action. Music and Sound values are persisted, but the only consumers found are the settings UI/store; no playback implementation uses them. Night mode is incomplete: Play, Learn, Duel, and Equations hard-code a light-blue background and some dark text.

**Fix:** Implement or visibly disable each action, wire audio settings to playback if audio is in scope, and apply shared theme tokens consistently.

### R16 — P2: Component hooks depend on whether a question exists

**Evidence:** `src/components/PracticeView.tsx:38–39,75–79`; `QuizView.tsx:36–37,72–76`; `TestView.tsx:37–38,69–73`; `TimeView.tsx:40–41,70–74`.

These components return early before calling a later `useEffect`. A null/non-null question transition within the same mounted component changes the hook count, violating React's hook rules. The current parent initialization often supplies a question before rendering, so this review does not claim an observed APK crash from this issue.

**Fix:** Call every hook unconditionally before any early return. Add a hook-rules lint check and a component test covering null → question → replacement question.

### R17 — P2: CI verifies packaging, not playable behavior

**Evidence:** `.github/workflows/android-apk.yml:44–70`; `package.json:6–10`; `tests/randomNumber.test.mjs`, `tests/mathPieces.test.mjs`, `tests/multiplayerQuestions.test.mjs`.

The workflow correctly installs locked dependencies, checks TypeScript, runs domain tests, builds release, and checks ZIP/bundle integrity. However, none of the existing tests exercise `gameSessionStore`, the active question generators, React components, navigation, or installed Android behavior. Thus all current checks can pass with R01–R07 present.

**Fix:** Add focused round-transition/scoring tests, component interaction tests, and an installed-release smoke flow covering a complete game and back/restart. Keep checksum and source-commit diagnostics, which are useful for matching reports to artifacts.

### R18 — P2: Release APK uses development signing and fixed version metadata

**Evidence:** `android/app/build.gradle:95–106,112–115`; `.github/workflows/android-apk.yml:50–76`.

The release variant uses `signingConfigs.debug`, with versionCode 1 and versionName 0.1.0. This is suitable for a disposable research build, but not a completed production release process. Artifact run numbers do not change the installed application's version metadata.

**Fix:** For production distribution, configure a dedicated signing identity and monotonically increasing version codes. Record a user-visible build identifier so testers can report the exact installed build. This does not explain the gameplay failures above.

### R19 — P3: Research presentation and completeness claims need reconciliation

**Evidence:** `src/screens/SplashScreen.tsx:14–26`; `app.json:3–5`; `src/screens/GamesHubScreen.tsx:55–62`; `src/navigation/AppNavigator.tsx:44–51`; `DEFECT_LOG.md:3`; historical sections in `TEST_MATRIX.md`.

Splash forces a 12-second wait and shows `GA STUDIOS / v14.2`, while this app identifies itself as a research build version 0.1.0. Seven mini-games are explicitly disabled with “Soon”; their registered routes render `null` but are not normally reachable from the hub. Research/UNKNOWN badges remain on unfinished screens. The defect log says gameplay defects have not been assessed, and the test matrix contains historical pre-implementation status.

**Fix:** Publish an accurate implemented/experimental/unavailable feature list; use the actual build identity; remove artificial startup delay unless deliberately required; update the defect log and matrix with current app-level results. Keep historical evidence clearly dated.

## 4. Why these problems coexist

1. **Implementation breadth exceeds completeness.** Menus advertise many topics, while the shared game engine only generates Addition and several screens are layout sketches.
2. **Round ownership is fragmented.** The store changes counters, the parent schedules question replacement, and children reset only on index changes. No single action enforces the round invariants.
3. **Modes share rules that should differ.** Retry-based scoring and True/False scoring are routed through the same generic handler.
4. **Evidence comments are not executable behavior.** Comments describe intended reference behavior, but handlers and persistence paths remain empty.
5. **Verification is aimed at a different layer.** Well-tested standalone helpers are not the same code paths as the user-facing game loop.

## 5. Recommended repair order

### Stage 1 — Restore one complete playable path

- Repair R01–R03 and R05 with one authoritative round transition and per-question identity.
- Repair answer display and retry behavior.
- Make Addition Practice complete ten questions, show correct results, restart cleanly, and exit predictably.
- Add focused regression tests for wrong → wrong → correct, last question, duplicate tap, timeout, and departure during transition.

**Exit condition:** A release APK completes this entire journey on an Android phone without stuck controls, incorrect counts, or blank back-stack screens.

### Stage 2 — Make the supported feature set truthful

- Correct topic/mode routing or disable unsupported combinations.
- Complete Quiz/Test/Time/Duel individually against explicit scoring and termination rules.
- Treat Play/Learn/Equations and the seven mini-games as unavailable until their gameplay is implemented.
- Connect progress updates and mode-specific result displays; Result currently renders only ordinary green/red scores, not the supplied Duel scores (`ResultScreen.tsx:37–47`).

### Stage 3 — Repair device UX and persistence

- Correct grids, responsive sizing, theme consistency, and modal interaction.
- Implement lifecycle cleanup, reliable Android Back, restart/exit semantics, and settings behavior.
- Verify progress and preferences after force-stop and relaunch.

### Stage 4 — Make release verification representative

- Install and smoke-test the actual release APK in CI or a repeatable device procedure.
- Retain artifact checksum, source commit, version, and test-device details with each report.
- Configure production signing/versioning when moving beyond research/test distribution.
- Update project documentation based on these checks rather than compilation alone.

## 6. Minimum APK acceptance checklist

These are proposed tests, not tests completed during this source review.

| Journey | Required result |
|---|---|
| Fresh launch | Actual build identity; no unexplained fixed wait |
| Every enabled topic/mode | Correct arithmetic and rules; no silent fallback |
| Practice/Quiz wrong → wrong → correct | Retry remains possible; one question outcome; correct retry score |
| Ten correct answers | Ten distinct progression steps; exactly one result transition |
| Test wrong verdict | Correct immediate score behavior and permitted next action |
| Time with no input | New question per expiry; timeout recorded; round ends at limit |
| Answer near timeout | Exactly one transition, no double scoring |
| Duel rapid taps/both players | At most one resolution per question; clean feedback reset |
| Back during transition / re-enter | No late state mutation or unintended old session |
| Result → restart / exit / Android Back | Defined destination, fresh round, no blank screen |
| Review scrolling | Scrolls without dismissal; Back closes modal |
| Equations, if enabled | Real puzzle, working inputs, correct completion/expiry, unlock persistence |
| Settings and progress → force-stop → relaunch | Values and achievements retained correctly |
| 360-pixel-width phone and larger font | All controls fit and remain reachable |
| Night mode across all enabled screens | Consistent readable colors |
| Background/resume and repeated navigation | Defined timer behavior; no duplicate callbacks |

## 7. Overall assessment

The project has useful foundations: modular screens/stores, isolated domain helpers with passing tests, locked dependencies, and an APK workflow with artifact integrity diagnostics. Its current user-facing implementation is substantially less complete than the menus imply.

**Priority is functional stabilization, not visual polish.** Repair the shared session loop and scoring first, make unavailable features explicit, then validate complete journeys in the exact release APK. The build system cannot compensate for missing gameplay logic.
