# Evidence log

## E-ENV-001 — Workspace and tool inventory
- Confidence: CONFIRMED (environment inspection only)
- Date: 2026-10-19
- Evidence: workspace root listing had no project source files or package metadata; Node 24.22.0 and npm 11.4.1 available; SDK contains platform-tools/adb.exe, emulator.exe, Android images, and Pixel_6 AVD.
- Limitation: adb invocation fails with `Cannot mkdir '\.android': Permission denied`; no device list was obtained. This says nothing about the original game's behavior.

## E-ENV-002 — REA and capture/automation availability
- Confidence: CONFIRMED (current session inventory only)
- Date: 2026-10-19
- Evidence: REA skill instructions are installed, but session tool inventory has no REA tools; `rea`, `ffmpeg`, `ffprobe`, Maestro, Detox, and pytest were not found on PATH.
- Limitation: PATH lookup does not prove a utility is absent from every location. No binary/app analysis or screen capture has been performed.

## E-TGT-001 — Target behavior
- Confidence: UNKNOWN
- Evidence: none. The original app has not been launched or observed.

## E-TGT-002 — Public Google Play listing (metadata only)
- Confidence: CONFIRMED for listing text; UNKNOWN for runtime behavior.
- Date accessed: 2026-10-19.
- Evidence: [Google Play listing](https://play.google.com/store/apps/details?id=com.agandeev.mathgames.pro), current page identifies Math Games Premium by Pavel Olegovich and advertises “10+” games and offline availability. Listing categorizes it as single-player. Screenshot thumbnails are listed, but image fetches failed in this environment (cache miss).
- Limitation: marketing text and listing metadata do not establish exact mode names, actual offline behavior, screen flows, game rules, or version installed on a device. No gameplay claim is inferred from this listing.

## User-provided reference evidence needed
For meaningful black-box analysis, provide any of the following from an authorized installation:

1. A screen recording from launch through the home/menu and each mode's start, a few correct and incorrect answers, end/result, and restart/exit.
2. Screenshots of every distinct screen, including settings, dialogs, and error states.
3. Short notes for actions not obvious from captures: selected mode, answer entered, feedback/score change, timer or difficulty changes, and whether progress remains after relaunch.
4. Device model, Android version, display resolution/orientation, and app version/build if visible.

A user-provided APK or an authorized, working reference device/emulator session can also enable direct inspection. Do not include account credentials or unrelated personal data.

## E-ENV-003 — ADB home-path retry
- Confidence: CONFIRMED (environment inspection only)
- Date: 2026-10-19.
- Evidence: retried `adb devices -l` with `ANDROID_USER_HOME`, `ANDROID_SDK_HOME`, `HOME`, `USERPROFILE`, `HOMEDRIVE`, and `HOMEPATH` set to workspace-local paths; adb still failed with `Cannot mkdir '\.android': Permission denied` and returned no devices.
- Result: no authorized Android device is observable through ADB in this session at present. The emulator executable can enumerate the `Pixel_6` AVD, but no running/connected instance was verified.

## E-APK-001 — User-supplied APK static inventory
- Confidence: CONFIRMED for the exact supplied artifact's metadata/content; UNKNOWN for relation to the target game's behavior.
- Date: 2026-10-19.
- Artifact: `research/apk/Math-Games-v14-2-[Premium]-modyolo.apk`; SHA-256 `0C626FB5C2969B4EAC508AD5DDBA0A55B9F9B064F22E2C1EA0BAFB02284E58DD`.
- Evidence: `aapt dump badging` reports package `com.GamesForKids.Mathgames.MultiplicationTables`, version 14.2 (142), launcher `SplashScreenActivity`. The supplied target Play ID is `com.agandeev.mathgames.pro`, so package identity does not match. Python ZIP inventory found four DEX files and data assets named `mathpiecesData.json` (150 `timerGameLevels` entries), `randomNumberData.json` (250 `levels`), `temp_randomNum.json` (35 `levels`), plus a Lottie resource named `2048`. `apksigner` reports signer cert SHA-256 `3b61c2a82aff9f7652ffe0b04be3c8f248b5e1aa7063f1a3846f0cf5c778628a`; archive includes `META-INF/ModYolo.RSA`/`.SF`.
- Limitation: no APK execution/installation; no developer-signature baseline; REA/JADX unavailable. Package mismatch and third-party filename prevent treating this as the exact target build. Asset names/data do not confirm runtime game modes or rules.

## E-TGT-003 — Public listing comparison
- Confidence: CONFIRMED for the two listings' current public descriptions; UNKNOWN for runtime feature equivalence.
- Date accessed: 2026-10-19.
- Target listing: [Math Games Premium, package `com.agandeev.mathgames.pro`](https://play.google.com/store/apps/details?id=com.agandeev.mathgames.pro), developer Pavel Olegovich; listing advertises 10+ games.
- Supplied APK package listing: [Math Games, Learn Add Multiply, package `com.GamesForKids.Mathgames.MultiplicationTables`](https://play.google.com/store/apps/details?id=com.GamesForKids.Mathgames.MultiplicationTables), developer GunjanApps Studios; listing describes addition/subtraction/multiplication/division and categories including Play, Learn, Quiz, Practice, Duel, and Test.
- Conclusion: both listings describe math practice and overlap on basic arithmetic, but they are different package IDs and different listed developers. Equal feature sets, question rules, UI, and progression are UNKNOWN. Marketing descriptions do not establish implementation equivalence.

## E-APK-002 — DEX/resource structure inventory
- Confidence: CONFIRMED for packaged class/layout/data identifiers; UNKNOWN for user-visible behavior.
- Date: 2026-10-19.
- Evidence: DEX class-table inventory contains activity families for addition, subtraction, multiplication, division, decimal, fraction, exponential, square root, random number, math pieces, equations, fast calculator, odd/even, matching, mix, memory, puzzle, 15-puzzle, Sudoku, Rullo, 2048, tap-add, match-3, duel/multiplayer, settings, language, profile/statistics, and results. `res/layout/` contains corresponding activity layouts. Data asset dimensions/schema are recorded in `research/observations/STATIC_CODE_INVENTORY.md`.
- Limitation: names establish code/resource presence only. Selected code paths and the main layout XML tree have since been inspected, but no layout has been rendered and no APK runtime behavior observed. Other components may be inaccessible, obsolete, or gated.

## E-ENV-004 — Workspace-local emulator launch
- Confidence: CONFIRMED (host emulator process/boot properties only).
- Date: 2026-10-19.
- Evidence: copied the Pixel_6 AVD configuration into `.android-user/avd` and started the emulator with its writable data paths inside the workspace. Emulator logs report Android boot properties and serial `EMULATOR37X1X11X0`.
- Limitation: `adb.exe devices -l` still fails before connecting because its Windows profile lookup yields an empty path and it attempts `\.android`. No APK installation, app launch, screenshot, or runtime observation occurred.
# Evidence log

## E-APK-003 — Random-number mode code paths
- Confidence: CONFIRMED for DEX implementation; UNKNOWN for runtime reachability and observed player behavior.
- Date: 2026-10-19.
- Evidence: `research/observations/classes_dump.txt` methods `RandomGameActivity.readJSONData`, `startGame`, `calResult`, `checkInput`, `completeEqTwo`, `showEquationTwo`, and `gameOver`; summarized in `research/observations/DEX_BEHAVIOR_FINDINGS.md`.
- Findings: data-driven level loading; integer operators +, -, ×, ÷; division guard; target comparison; result activity transition; conditional highest-level persistence.
- Limit: static DEX inspection does not establish actual screen reachability, complete interaction semantics, user-visible feedback or handling of every branch.

## E-APK-004 — Math-pieces code/data indicators
- Confidence: CONFIRMED for class/data identifiers; UNKNOWN for mode objective and runtime behavior.
- Evidence: `mathpiecesData.json` contains 150 `timerGameLevels`; `Game_MathPieces_Activity` contains timer-formatting, result calculation, data-loading, hint and grid methods in the DEX dump.
- Limit: names and methods do not establish the complete rules, UI or whether the mode is accessible.

## E-IMPL-001 — Random-number evaluator slice
- Confidence: CONFIRMED for this implementation and its tests; not a reference-runtime comparison.
- Date: 2026-10-19.
- Evidence: `src/domain/randomNumber.ts`; `tests/randomNumber.test.mjs`; strict TypeScript check via global TypeScript 5.8.3 and `node --experimental-strip-types --test tests/randomNumber.test.mjs`.
- Result: strict compile succeeded; 3 test cases passed for evaluator semantics and slot-category validation.
- Limitation: tests validate the independent helper against the static DEX interpretation, not screens or the original app's runtime behavior.

## E-APK-005 — Multiplayer question generator
- Confidence: CONFIRMED for generator code and CreateNewRoom invocation; UNKNOWN for user-visible multiplayer behavior.
- Evidence: `classes_dump.txt` `MultiplayerActivity.CreateNewRoom` around line 898113 and class `util.GenQuestions` around lines 1019475–1019760; summarized in `DEX_BEHAVIOR_FINDINGS.md`.
- Findings: CreateNewRoom requests 24 generated questions; index-specific half-open ranges, three arithmetic operators, sequential IDs, and nonnegative subtraction are explicit in DEX.
- Limitation: question timing/scoring, room lifecycle, backend success, matchmaking, and reachable UI remain unverified.

## E-IMPL-002 — Multiplayer question generator slice
- Confidence: CONFIRMED for implementation and test execution; not a reference runtime comparison.
- Evidence: `src/domain/multiplayerQuestions.ts`, `tests/multiplayerQuestions.test.mjs`.
- Result: strict TypeScript check succeeded; four multiplayer generator test cases passed for deterministic ranges, subtraction ordering, count, and IDs.
- Limitation: injected `Math.random`-style sampling matches the bounds/distribution, not Java Random's seeded sequence.

## E-APK-006 — MainActivity static navigation wiring
- Confidence: CONFIRMED for DEX click wiring/intent targets; UNKNOWN for runtime reachability and visibility.
- Evidence: `classes_dump.txt` MainActivity methods `onCreate`, `initIds`, and `onClick` around lines 654732–655000; `activity_main.xml` resource tree at `research/observations/activity_main_xmltree.txt`.
- Findings: `onCreate` calls `setContentView(R.layout.activity_main)` and initializes IDs. `initIds` registers click listeners on Addition, Subtraction, Multiplication, Division, Decimal, Fraction, square-root, and Games frames. `onClick` contains explicit `startActivity` calls to AdditionActivity, SubtractionActivity, MultiplicationActivity, DivisionActivity, DecimalActivity, FractionActivity, ExponentialActivity, generic GameActivity, UserProfileActivity, SettingsActivity, and LangSettingActivity.
- Resource switch IDs are resolved using the DEX sparse-switch payload and `aapt dump resources`; exact static ID-to-target pairs are listed in `NAVIGATION_MAP.md`. Runtime visibility/reachability and successful navigation remain unverified.

## E-APK-007 — Splash-to-main startup code
- Confidence: CONFIRMED for static startup wiring; UNKNOWN for runtime rendering/timing.
- Evidence: `classes_dump.txt` `SplashScreenActivity.onCreate` around lines 712711–712802, `SplashScreenActivity$1.onAnimationEnd` around 712491–712512, and `SplashScreenActivity$1$1.run` around 712425–712437; `aapt dump resources` maps layout ID `0x7f0d0077` to `activity_splash_screen`.
- Findings: splash layout sets a Lottie animation named `math_splash.json`, places text `v14.2`, and registers an animator listener. On animation end the code plays a sound and posts a handler runnable after 500 ms; that runnable starts MainActivity and finishes SplashScreenActivity. An exception handler also starts MainActivity directly.
- Limitation: no launch/runtime observation; actual animation duration, appearance, sound, and error frequency are unknown.


## E-IMPL-003 - Random-number level initializer
- Confidence: CONFIRMED for implementation and test execution; not a reference runtime comparison.
- Evidence: `buildRandomNumberLevelConfig()` in `src/domain/randomNumber.ts`; test coverage in `tests/randomNumber.test.mjs`.
- Result: included in the strict TypeScript check; row-count special case, column formula, target and initial input mode are asserted.
- Limitation: only mirrors static `startGame()` values; no UI or runtime state comparison.


## E-ENV-005 - Runtime/dependency recheck
- Confidence: CONFIRMED (current workspace/tool probe).
- Date: 2026-10-19.
- Evidence: `adb.exe devices -l` exits before enumeration with `Cannot mkdir '\.android': Permission denied`; current `package.json` and `App.tsx` now define an Expo scaffold, but `node_modules` is absent.
- Limitation: no Android app launch/capture path or locally installed Expo dependencies are available. This does not establish that no external device/software could be configured outside the managed workspace.

## E-ENV-006 - Expo SDK 58 matrix and dependency restore
- Confidence: CONFIRMED for the official version matrix and observed npm failure; installed-package compatibility/build UNKNOWN.
- Date: 2026-10-19.
- Evidence: Expo SDK 58 reference and `bundledNativeModules.json`; `research/observations/EXPO_COMPATIBILITY.md`; root `package.json`, `app.json`, `App.tsx`, and `index.ts`; npm 11.4.1 / Node 24.22.0 install output.
- Findings: selected React Native 0.88.0 / React 19.3.0 and Expo-bundled versions for AsyncStorage 2.2.0, Reanimated 4.7.1 with Worklets 0.13.0, and SVG 15.16.0; Zustand 5.0.15. Expo SDK 58 requires Node 22.13.x minimum, met by Node 24.22.0. A blank TypeScript Expo shell is in place.
- Result: `npm install` cannot access `registry.npmjs.org` (`EACCES`); no `node_modules` or lockfile was created. The existing 22 Node unit tests still pass through `npm test`. Expo CLI compatibility checks, Expo app typecheck, and Android build remain unrun.


## E-IMPL-004 - Random-number hint flow helpers
- Confidence: CONFIRMED for implementation and tests; not a reference UI comparison.
- Evidence: `requestRandomNumberHint()` and `chooseRandomNumberHintClickAction()` in `src/domain/randomNumber.ts`, based on DEX-RN-006/007; asserted in `tests/randomNumber.test.mjs`.
- Result: 2 test cases cover no hint data, counter limits, unlimited preference, disabled clicks, and rewarded-video gate selection.
- Limitation: ad playback/callbacks, hint content selection, and persistence are not implemented.

## E-APK-008 - Random-number level-list callback
- Confidence: CONFIRMED for static code wiring; UNKNOWN for user-facing reachability.
- Date: 2026-10-19.
- Evidence: `classes_dump.txt` `GameLevelsActivity.onCreate` around 929898, `GameLevelsActivity$2.onlevelClicked` around 929447, and `LevelsAdapter$1.onClick` around 930750; summarized in `observations/DEX_BEHAVIOR_FINDINGS.md`.
- Findings: a level-row callback stores the zero-based selected index and one-based level value, finishes the list activity, and starts `RandomGameActivity`. RandomGameActivity's back handler returns to `GameLevelsActivity` (DEX-RN-007).
- Limit: the route into the list, row unlock/tap behavior, rendered screen, and runtime transition have not been observed.

## E-APK-009 - Static route from generic games menu to random-number level list
- Confidence: CONFIRMED for DEX intent wiring; UNKNOWN for which visible control invokes it and runtime reachability.
- Date: 2026-10-19.
- Evidence: `classes_dump.txt` `MainActivity.onClick` route to `GameActivity` (E-APK-006) and `GameActivity.onClick` around 852799, including the sparse-switch branch around 852921.
- Findings: one GameActivity click-switch branch constructs an intent for `GameLevelsActivity` and calls `startActivity`; the same branch records a Firebase Analytics property string `game_solve`.
- Limit: the analytics string does not prove the visible label/objective. The branch's resource ID was not resolved in this inspection, and no runtime interaction was observed.

## E-IMPL-005 - Random-number target progression helper
- Confidence: CONFIRMED for implementation and test execution against the static DEX reading; not a reference-runtime comparison.
- Date: 2026-10-19.
- Evidence: `resolveRandomNumberTargetBranch()` in `src/domain/randomNumber.ts`, two assertions in `tests/randomNumber.test.mjs`, and DEX-RN-009.
- Result: strict TypeScript check succeeded; both branch tests passed, covering mismatch/result route/highest-level update, match/next-row, max-row feedback, and empty results.
- Limitation: code models the DEX branch decisions only. It does not establish whether result navigation is displayed as win/loss or reproduce toast/ad/animation presentation.

## E-APK-010 - Random-number screen compiled layout structure
- Confidence: CONFIRMED for packaged XML hierarchy/attributes and DEX layout selection; UNKNOWN for rendered appearance.
- Date: 2026-10-19.
- Evidence: AAPT 37.0.0 compiled XML trees in `research/observations/activity_random_game_xmltree.txt` and `activity_game_levels_xmltree.txt`; resource-name mappings from `aapt dump resources`; `RandomGameActivity.onCreate`/`GameLevelsActivity.onCreate` in `classes_dump.txt`.
- Findings: random-game layout has a toolbar with back/undo/hint controls, level and target text fields, equation list/rows, a dynamic GridLayout, and ad FrameLayout; layout constraints include 10% toolbar and target heights and 60% equation area. Level-list layout has a LEVELS header, back control and a four-column GridLayoutManager RecyclerView with 60% height constraint.
- Limit: compiled XML is not a screenshot. It cannot establish rendered bounds, visibility after DEX initialization, colors/asset appearance, loading duration, or device/orientation behavior.

## E-APK-011 - Random-number level dataset schema
- Confidence: CONFIRMED for packaged static data only.
- Date: 2026-10-19.
- Evidence: `assets/randomNumberData.json` in the supplied APK; SHA-256 of the APK is recorded in `observations/APK_TRIAGE.md`.
- Findings: 250 ordered level objects have `hints`, `maxHints`, `numbers`, and `randomNumber`; number-list lengths are 4/6/8 with counts 20/50/180; maxHints distribution is 1/2/3/4 with counts 10/40/20/180. Example level 1 has numbers [5,3,7,9], target 45, and one hint expression `5 x 9 = 45`.
- Limit: packaged data does not establish how a player sees or solves a level. It is not evidence of random generation.

## E-IMPL-006 - Random-number dataset parser
- Confidence: CONFIRMED for implementation and test execution; not a runtime comparison.
- Evidence: `src/domain/data/randomNumberLevels.json`, `parseRandomNumberLevelDataset()` in `src/domain/randomNumber.ts`, and tests in `tests/randomNumber.test.mjs`.
- Result: parser accepts all 250 packaged records and rejects malformed root/record fields; strict TypeScript check succeeded; 2 dataset cases passed.
- Limitation: the data is copied from the supplied APK; Expo asset bundling/loading has not been configured or verified.

## E-APK-012 - Random-number level lock and row callback wiring
- Confidence: CONFIRMED for static DEX/XML behavior; UNKNOWN for actual touch response.
- Date: 2026-10-19.
- Evidence: `LevelsAdapter.onBindViewHolder` around `classes_dump.txt` lines 931002-931033; `GameLevelsActivity$2.onlevelClicked` around 929447; compiled item layout at `observations/level_item_xmltree.txt`.
- Findings: positions at or below the saved random-game level hide the row's lock image; higher positions retain the XML-default visible lock. A click listener is attached to each row's level TextView, and the callback launches the selected level without an explicit saved-level check. The lock image is not declared clickable in the item XML.
- Limit: Android touch dispatch/overlap and runtime accessibility have not been observed; do not claim locked rows can or cannot be activated.

## E-APK-013 - Random-number result activity branch
- Confidence: CONFIRMED for static DEX/layout paths; UNKNOWN for rendered message, win/loss presentation and actual runtime actions.
- Date: 2026-10-19.
- Evidence: `RandomGameActivity.gameOver`, `Result_Game2Activity.onCreate`, `nextLevel`, `restartGame`, `onBackPressed`, and `onClick` in `classes_dump.txt`; AAPT tree at `observations/activity_result_game2_xmltree.txt`.
- Findings: `gameOver()` supplies `KEY_ACTIVITY=RANDOM_NUMBER`; next advances position and opens the random-game activity, restart reopens it at the current position, and system back starts GameActivity. The layout has level/rank fields, action-control groups and an ad placeholder.
- Limit: the result message and mapping of each clickable view to actions/visibility are not fully established; neither DEX names nor unlock writes prove a win/loss result.

## E-IMPL-007 - Random-number result next-level state helper
- Confidence: CONFIRMED for implementation and test execution against the static method; not a runtime comparison.
- Evidence: `advanceRandomNumberResultLevel()` in `src/domain/randomNumber.ts` and its test in `tests/randomNumber.test.mjs`, based on E-APK-013.
- Result: strict TypeScript check succeeded; level index/number update and max-unlocked preservation assertions passed.
- Limitation: no React Native result screen, restart UI, or runtime persistence integration exists yet.

## E-APK-014 - Random-number help illustrations and inferred objective
- Confidence: CONFIRMED for dialog wiring and packaged image content; INFERRED for intended gameplay objective; runtime behavior UNKNOWN.
- Date: 2026-10-19.
- Evidence: `GameLevelsActivity.dialogHelp()` around `classes_dump.txt` lines 929688-929742; compiled tree `observations/dialog_help_random_num_xmltree.txt`; packaged `res/drawable/random_help1.png` and `random_help2.png` inspected from the user-supplied APK.
- Findings: a non-cancelable help dialog displays both illustrations and a close control. The illustrations show target 55, `3 + 2 = 5`, then `5 × 11 = 55`, with arrows from the number grid into equation slots and the final 55 highlighted. This supports a chained-equation-to-target objective.
- Asset identity: `random_help1.png` is 600×900, 16,151 bytes, SHA-256 `f3e770dc1d54dd0242cabd07cc9d235785d8ea374e2cf0e2b59fa374bbe0ede7`; `random_help2.png` is 600×900, 16,293 bytes, SHA-256 `d409763296e489afe0fa01185f67d2296074566384a65a36e20af7e293c37517`.
- Limit: this is an explanatory illustration, not gameplay observation. DEX-RN-009's mismatch-to-gameOver branch appears to conflict with an intermediate non-target result in the illustration; caller timing/runtime semantics remain unresolved. The extracted images are evidence only and are not included as reimplementation assets.

## E-APK-015 - Result screen wording
- Confidence: CONFIRMED for compiled layout and default English resource values; UNKNOWN for how the result is reached and interpreted at runtime.
- Date: 2026-10-19.
- Evidence: `observations/activity_result_game2_xmltree.txt` references `completed`, `level`, and `rank`; `aapt dump --values resources` on the supplied APK resolves the default English `completed` value to “Completed”.
- Findings: the shared result layout is headed “Completed” and includes level and rank labels. This wording does not settle whether the DEX-observed target-mismatch branch is presented as a failure, success, or generic completion.
- Limit: resource/layout inspection is static; no original-app runtime screen or action sequence is available. Preserve the gameplay outcome as UNKNOWN.

## E-APK-016 - Math Pieces star calculation
- Confidence: CONFIRMED for static DEX formula and call site; UNKNOWN for runtime visibility and event timing.
- Date: 2026-10-19.
- Evidence: `observations/classes_dump.txt`, `Game_MathPieces_Activity.calculateResult()` around lines 922092–922153 and `onGameComplete()` around lines 921169–921185.
- Findings: zero correct attempts yields 0 stars. Otherwise percentage is `correct / (correct + wrong) * 100`; 40–90% inclusive yields 2 stars, >90–100% yields 3, and other percentages yield 1. The completion method stores this rating on the active level when non-null, then calls `gameOver()`.
- Limit: does not establish how attempts are counted, what triggers completion, whether timer expiry completes a round, how stars persist or render, or whether the mode is reachable. It supports only the scoring helper, not a full Math Pieces implementation.

## E-APK-017 - Math Pieces row/column arithmetic validation
- Confidence: CONFIRMED for the static validation algorithm; INFERRED for the intended grid objective; runtime interaction UNKNOWN.
- Date: 2026-10-19.
- Evidence: `observations/classes_dump.txt`, `checkCorrectEquation()` around lines 919598–919683 and `checkEquations(PieceEquation)` around lines 919684–919991; numeric/operator helper `B(String)` around lines 922027–922053.
- Findings: the activity combines row and column equation records, evaluates the four arithmetic operators from adjacent cells in each five-cell line, converts the int result to float and calls `Math.round()`, then recognizes the calculated result at an endpoint next to `=`. The subtraction code chooses absolute difference; division uses integer division. This supports an inferred objective to arrange pieces into valid equalities across rows and columns.
- Implementation: `isMathPiecesEquationCorrect()` models one complete five-cell line. Tests cover valid/invalid equations and division-by-zero behavior.
- Limit: no player-facing objective, grid/drag behavior, timing, feedback, correction loop, persistence, or runtime reachability has been observed. Malformed-line behavior is guarded in the helper and may differ from the original's thrown parse exception.

## E-IMPL-008 - Math Pieces static-rule helpers
- Confidence: CONFIRMED for implementation and test execution against static DEX findings; not a runtime comparison.
- Evidence: `src/domain/mathPieces.ts`, `tests/mathPieces.test.mjs`, E-APK-016 and E-APK-017.
- Result: strict TypeScript compilation passed; Node assertions cover star thresholds, row/column-shaped equation patterns, all four operators, incorrect/incomplete equations, and division by zero.
- Limitation: tests validate these isolated functions only. They do not exercise a grid UI, DEX event wiring, timer, persistence, or the APK runtime.

## E-APK-018 - Math Pieces packaged level data and grid mapping
- Confidence: CONFIRMED for asset records and static code mapping; runtime display/progress state UNKNOWN.
- Date: 2026-10-19.
- Evidence: supplied APK `assets/mathpiecesData.json`; `Game_MathPieces_Activity.setGridRowColumn()` around `classes_dump.txt` lines 921461–921497; `readJSONData()` around lines 922763–922785.
- Findings: 150 levels use fields `cells`, `isUnLocked`, and `stars`; cells use `cellTxt`, `isDragable`, and `lvl_id`. Board data lengths 56/72/90 occur 15/45/90 times, and the DEX maps them to 7×8, 8×9, and 9×10 column/row counts. All bundled records start with `isUnLocked=false` and `stars=0`; these are asset defaults, not proof of runtime progression.
- Artifact: `src/domain/data/mathPiecesLevels.json`, SHA-256 `1CEAEA9862275D732490FB450BE52CED842756BD698F3CC051042BC8D228D279`.
- Limit: does not specify touch behavior, grid visual order, runtime progress overrides, persistence, or device sizing.

## E-IMPL-009 - Math Pieces data parser and grid configuration
- Confidence: CONFIRMED for implementation and tests against static artifact/code facts; not runtime comparison.
- Evidence: `parseMathPiecesLevelDataset()` and `buildMathPiecesGridConfig()` in `src/domain/mathPieces.ts`; tests in `tests/mathPieces.test.mjs`.
- Result: parser accepts all 150 copied level records and rejects malformed data; 56/72/90 cell counts map to the recorded board dimensions; strict TypeScript compile and Node tests passed.
- Limitation: no UI or persistence path consumes this data yet, and assets are not bundled in an Expo app.

## E-APK-019 - Math Pieces drag gesture and accepted drop
- Confidence: CONFIRMED for static DEX operations; runtime gesture acceptance and presentation UNKNOWN.
- Date: 2026-10-19.
- Evidence: `observations/classes_dump.txt`, `MyDragListener.onDrag()` around lines 918682–918785 and `MyTouchListener.onTouch()` around lines 918987–919052.
- Findings: touch down creates ClipData from the touched view's tag and starts Android drag. On a drop, the handler copies source text/tag into the target, empties the source text, updates keyed tags/hints and performs row/column bookkeeping. The text operation is transfer rather than swap.
- Implementation: `transferMathPiece()` models only the text transfer for an accepted drop; drop acceptance, Android keyed tags, and view effects are excluded.
- Limit: the APK was not launched; actual draggable target restrictions, board rendering, feedback, sound audibility, and event reachability are UNKNOWN.

## E-IMPL-010 - Math Pieces accepted-drop transfer helper
- Confidence: CONFIRMED for helper behavior and executed isolated tests; not a runtime comparison.
- Evidence: `src/domain/mathPieces.ts`, `tests/mathPieces.test.mjs`, E-APK-019.
- Result: strict TypeScript check passed and the Node test suite passed 23/23 tests, including copy-to-target/source-clear semantics and index bounds.
- Limitation: helper is not connected to an application screen or Android gesture handler.

