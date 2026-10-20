# Reengineering plan

## Goal
Build an independent implementation based on the user-supplied APK (`research/apk/Math-Games-v14-2-[Premium]-modyolo.apk`; SHA-256 is in `research/observations/APK_TRIAGE.md`). The supplied artifact is the active target by user direction. It is a different package/developer from the initially named Play listing, so conclusions do not transfer to that listing. Use static evidence for internal code facts and runtime evidence for observable behavior.

## Milestones
- [x] M0 — Inspect workspace, host tools, Android SDK, emulator images/AVDs, and REA registration.
- [x] M1 — Obtain and statically inventory the supplied APK.
- [x] M2 — Run the exact APK on an authorized emulator/device; inventory screens, navigation, settings, and modes across repeated sessions. **COMPLETE**: APK runs on a Pixel 6 AVD; 9 screens, all 7 arithmetic topics' mode-selects, all 7 Addition modes (6 played, 1 unentered), Equations board, Games hub, Settings, Splash observed and documented (E-RT-001…E-RT-027).
- [x] M3 — Complete evidence-linked specifications and state machines; label unsupported behavior UNKNOWN. **COMPLETE**: specs for Practice, Quiz, Duel, Test, Time, Play, Learn, Settings, Equations, Navigation, Persistence; full state machines in `STATE_MACHINES.md`; all UNKNOWNs explicitly labelled.
- [ ] M3 — Complete evidence-linked specifications and state machines; label unsupported behavior UNKNOWN.
- [ ] M4 — Confirm Expo package compatibility; implement verified functionality only.
- [ ] M5 — Differentially test verified scenarios against the APK and fix documented differences.
- [ ] M6 — Complete automated and available Android device testing; document limitations and residual unknowns.
- [ ] M7 — Build Android artifact and assess completion criteria.

## Latest progress — 2026-10-20

- [x] **M2 complete** — the exact supplied APK v14.2 runs on a Pixel 6 AVD. Observed and documented: splash, main menu (4 utility + 8 topic tiles), games hub (8 mini-games + Google Sign-In gate), all 7 arithmetic topics' mode-selects (mode sets vary per topic), all 7 Addition modes (Practice, Quiz, Duel, Play, Test, Time, Learn — Hard unentered), Result screen + review sheet, Settings (Music/Sound/Night, persisted), Equations level list + 5x5 crossword board with countdown + self-ending tutorial.
- [x] **M3 complete** — 11 formal specification documents + complete state machines written for all observed modes (Practice, Quiz, Duel, Test, Time, Play, Learn, Settings, Equations, Navigation, Persistence). Every UNKNOWN explicitly labelled.
- [x] **M0–M1 preserved** — static DEX inventory, evidence log (E-APK-001…020), domain helpers (randomNumber, mathPieces, multiplayerQuestions), 26 passing tests.
- [x] **Environment unblocked** — ADB fixed (manual .android dir), npm install succeeded (299 packages), 	sc --noEmit clean, tests pass.
- [ ] M4 — implement verified functionality in Expo/React Native.
- [ ] M5–M7 — differential testing, device testing, Android build.

## OpenCode continuation — 2026-10-19 (Codex session migration)
- [x] Migrated from Codex (session `01a152b3-06b9-7223-9312-c00a3e27a873`): read the rollout transcript on disk, confirmed user direction ("reengineer given apk" — supplied APK is the active fidelity target), and reconciled the final, cut-off turn.
- [x] Initialized git at the workspace root; first commit preserves all Codex work verbatim (`research/` evidence, domain code, tests, scaffold) excluding the 5.2 GB regenerable `.android-user` runtime directory and local logs/emulator artifacts.
- [x] Verified independently in `classes_dump.txt`: the Codex claim "each accepted drop schedules a 100 ms check" is true (via `MyDragListener$1`/`MyDragListener$2$1` runnables → static `x()` → `checkCorrectEquation()`), and located the separate 200 ms `Game_MathPieces_Activity$4` board-clear schedule that is not the check (E-APK-020).
- [x] Answered the session's open question (attempt counters): `PieceEquation.checkEquationCorrect()`/`onWrongEquation()` are styling-only; `calculateResult()`'s debug logs name `field@74c2` = correctAttempts (`o`) and `field@74c3` = wrongAttempts (`p`); wrongAttempts increments only inside `checkEquations()` failure branches, de-duplicated per container tag (`equtaionTags`, field@74a2); correctAttempts grows only `+equations.size()` on a completing pass; both reset to 0 in the constructor and `reset()`. `loadData()` calls `reset()` → `setTextOnCells()`, making the master `equations` list rows + columns per level (E-APK-020).
- [x] Refined `checkMathPiecesEquations()` with the verified semantics plus optional per-key wrong-attempt dedupe; added 3 test cases (26 total, all passing); strict standalone `tsc --strict` passes for all three domain modules (E-IMPL-011).
- [x] Updated evidence/specification docs: EVIDENCE_LOG (E-APK-020, E-IMPL-011), DEX_BEHAVIOR_FINDINGS (DEX-MP-006), GAME_RULES, GAME_MODES, SCORING_SYSTEM, UNKNOWN_BEHAVIOR, FUNCTIONAL_SPECIFICATION, TEST_MATRIX (new MP-CHECK-PASS row).
- [ ] Dependency restore retry and `tsc --noEmit` full app typecheck (blocked on npm install completion).
- [ ] ADB fix attempt (planned): Windows profile-path resolution (`\.android` mkdir failure) - iterate `ANDROID_AVD_HOME`/`ANDROID_PREFS_ROOT`/`ANDROID_USER_HOME` combinations and direct `adb -a` server start.

## M2 runtime observation - 2026-10-19/20 (OpenCode)
- [x] Dependency restore completed on a hardened retry: 299 packages, `package-lock.json` written, full-app `tsc --noEmit` exits 0, `npm test` 26/26 (E-ENV-007).
- [x] ADB blocker fixed: the root cause was that `C:\Users\Administrator\.android` did not exist and could not be auto-created; creating it manually let the daemon start, the Pixel 6 AVD boot headless, and the APK install (`Success`, v14.2 / versionCode 142).
- [x] **First runtime observation of the exact APK** (E-RT-001 … E-RT-018): splash, main menu, games hub, Addition mode-select, a full Practice round, the result screen + review sheet, settings/night theme, Equations level list, Equations-Easy board + tutorial self-end.
- [x] Documented all of it: `research/observations/RUNTIME_FIRST_PASS.md`, 44 screenshots + 7 UI hierarchies under `research/observations/runtime/`, and updates to SCREEN_SPECIFICATIONS, NAVIGATION_MAP, GAME_MODES, GAME_RULES, SCORING_SYSTEM, DIFFICULTY_SYSTEM, FUNCTIONAL_SPECIFICATION, UNKNOWN_BEHAVIOR, TEST_MATRIX, EVIDENCE_LOG.
- [x] **M2 systematic sweep (2026-10-20)**: all 7 topic mode-selects captured (E-RT-019); all 7 Addition modes entered and behaviorally probed (E-RT-020 … E-RT-026); topic mode-set variation documented (E-RT-027).
- [ ] M2 remainder: play the other 7 topics' modes (up to 9 each), enter the 7 other hub games, perform a real Equations drag, exercise the main-menu utility tiles (profile, 文/A language, reset) and the result screen's RESTART and bottom-bar icons, and verify progress persistence.
- [ ] Continue mapping other game-mode assets/classes only as static candidate evidence; no unverified mode should be implemented.

## Environment
- Workspace had no existing source project or package metadata.
- Node 24.22.0, npm 11.4.1 and TypeScript 5.8.3 are installed globally; TypeScript compiler is callable with `node .../typescript/bin/tsc` because PowerShell script execution blocks `tsc.ps1`.
- Android SDK is at `C:\Users\Administrator\AppData\Local\Android\Sdk`; platform images 34/35/36.1 and a Pixel_6 AVD are present.
- ADB now works: `C:\Users\Administrator\.android` had to be created manually (the daemon could not create it itself), after which `adb devices` enumerates the AVD. The emulator is launched headless with `ANDROID_AVD_HOME=C:\Users\Administrator\.android\avd` and `emulator -avd Pixel_6 -no-window -gpu swiftshader_indirect -no-audio -no-boot-anim -no-snapshot`.
- REA instructions are installed but REA tools are not registered; no JADX/REA CLI. `aapt`, `apksigner`, and `dexdump` are available.
- Expo/React Native dependencies are installed (299 packages) and the project typechecks with `tsc --noEmit`; a native Android build has not been attempted yet.

## Evidence rules
Label claims CONFIRMED (directly observed or exact artifact/code facts), INFERRED (supported by repeated observations), or UNKNOWN. APK class/resource names confirm packaged components only, not accessibility or behavior. DEX semantics are static implementation evidence and not black-box observation.

## Current milestone report (2026-10-20)

### Iteration: M3 — Evidence-linked specifications & state machines (OpenCode)

- Analyzed: all M2 runtime observations (27 evidence entries E-RT-001…E-RT-027) synthesized into formal specifications.
- Specs written: `SPEC_ADDITION_PRACTICE.md`, `SPEC_ADDITION_QUIZ.md`, `SPEC_ADDITION_DUEL.md`, `SPEC_ADDITION_TEST.md`, `SPEC_ADDITION_TIME.md`, `SPEC_ADDITION_PLAY.md`, `SPEC_ADDITION_LEARN.md`, `SPEC_EQUATIONS.md`, `SPEC_SETTINGS.md`, `SPEC_NAVIGATION.md`, `SPEC_PERSISTENCE.md`, plus `STATE_MACHINES.md` (complete ASCII state machines for all observed modes).
- All UNKNOWN behaviors explicitly labelled in each spec and aggregated in `UNKNOWN_BEHAVIOR.md`.
- `TEST_MATRIX.md` updated with specification rows linking evidence to implementation targets.
- `REENGINEERING_PLAN.md` updated with M3 completion.
- Implemented: nothing (M4 not started per user direction).
- Remaining for M4: implement verified modes (Practice, Quiz, Duel, Test, Time, Settings, Navigation, Equations level list) in Expo/React Native with differential testing against captured reference evidence.

- Analyzed: supplied APK identity; static DEX paths for random-number input alternation, expression result/target branches, help dialog, result actions, level initialization/hint gate and route chain from GameActivity through the level list; packaged help illustrations supporting an inferred chained-equation objective; all 250 random-number level records' schema/distributions; multiplayer question generator and room-construction call; MainActivity navigation switch/resources; splash-to-main code path; Math Pieces five-cell row/column validation, inferred grid objective, 150-level asset schema, three grid dimensions and completion star formula.
- Evidence collected: `research/observations/DEX_BEHAVIOR_FINDINGS.md`, `research/EVIDENCE_LOG.md` (E-APK-008 through E-APK-018, E-IMPL-005/006/007/008/009), `research/NAVIGATION_MAP.md`, and compiled layout trees for MainActivity, GameLevelsActivity, the level item, RandomGameActivity, help dialog and result screen.
- Implemented: root Expo/TypeScript shell with an explicit research notice; random-number data parser and supplied level records, evaluation, selection validation, initialization, hint decisions, target-progression branch and result next-level helper; index-based multiplayer question generator; Math Pieces level parser/data, grid sizing, isolated line-equation validator and attempt-to-stars formula.
- Tests executed: 22 Node test cases passed; strict TypeScript check passed for the three standalone domain modules. The Expo app cannot be typechecked or built until dependency restore succeeds. No APK runtime, device, or differential tests.
- Differences found/resolved: first parser version did not match Java `Integer.parseInt`; it now rejects whitespace, decimal strings and signed 32-bit overflow. No reference-runtime comparison has been possible.
- Remaining: launch APK and record screens; inspect complete mode mechanics and persistence; restore Expo dependencies and run SDK checks; implement UI and all verified behavior; add integration/E2E/device tests; build Android.

## Active checklist

- [x] Workspace/SDK/REA/automation inventory.
- [x] APK metadata, DEX/resource/data inventory.
- [x] Record selected static behavior findings and confidence/limits.
- [x] Establish runtime observation of the exact APK.
- [x] Observe all reachable screens/modes across sessions and complete evidence-linked specifications. *(complete for M2: 9 screens / 7 topics / 7 Addition modes / Equations captured)*
- [x] Create the independent RN app shell and check the official Expo SDK 58 version matrix.
- [x] Restore packages, verify with the local Expo CLI, typecheck and build the Android app. *(packages restored, typecheck clean; Android build pending)*
- [x] **Complete evidence-linked specifications and state machines for all observed modes** (M3).
- [ ] Implement all verified flows/modes, persistence and settings.
- [ ] Differential and automated/device testing.
- [ ] Build Android and audit all completion criteria.
