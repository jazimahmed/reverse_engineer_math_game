# Screen specifications

Screens have now been observed at runtime (2026-10-19, emulator run of the supplied APK v14.2). Sections are ordered newest-first: "Runtime-observed screens" is live observation; the older static sections below it remain candidate-only evidence.

For each observed screen record purpose, device resolution/density/orientation, component bounds, entry/exit routes, control actions, transitions, loading/error states, and capture references.

| Screen ID | Purpose / layout | Entry / exit | Confidence | Evidence |
|---|---|---|---|---|
| Candidate screens above | Runtime appearance and behavior unknown | Unknown | UNKNOWN | APK layout-name inventory only |

## Runtime-observed screens

Device: Pixel 6 AVD, Android 17, **1080x2400**, portrait. All bounds below are raw device pixels from `uiautomator` dumps (stored under `research/observations/runtime/ui/`) and screenshots (`research/observations/runtime/*.png`).

### SCR-01 — Splash (`.SplashScreenActivity`)

- Purpose: branded loading screen.
- Layout: white background; **GA STUDIOS** logo bottom-left, version text **"v14.2"** bottom-right, green circular progress indicator at centre.
- Exit: auto-advances to `.MainActivity` after the Lottie animation completes (10-15 s observed on a cold emulator start).
- Confidence: CONFIRMED (E-RT-001, E-RT-017).

### SCR-02 — Main menu (`.MainActivity`)

- Purpose: entry to the 8 topic tiles and 4 utility actions.
- Top bar (4 tiles, left→right): profile avatar (red), settings gear (green), language switch (blue, "文/A"), reset progress (pink circular arrow).
- Body: 2 columns x 4 rows of topic tiles on a light-blue checkered background: **Add** (green `+`), **Subtract** (light blue `−`), **Multiply** (orange `×`), **Division** (pink, drawn as a checkmark-style glyph in this build), **Square root** (purple `√`), **Decimals** (teal `0.1`), **Fractions** (blue `2/3`), **Games** (dark green gamepad).
- Behaviour: the tile grid animates in (briefly empty immediately after returning from a child screen).
- Exit: topic tiles → their topic activity; the gamepad tile → the Games hub (SCR-03); gear → Settings (SCR-07).
- UNKNOWN: profile tile behaviour, reset-tile behaviour, language switch behaviour, tile press sound.
- Confidence: CONFIRMED (E-RT-002).

### SCR-03 — Games hub (`.game.GameActivity`)

- Purpose: entry to the 8 mini-games.
- Header: back arrow (left), crown icon (right) for leaderboards.
- Body: 2 columns x 4 rows of tiles — **2048, Fifteen, Puzzle, Match, Sudoku, Mix, Memory, Equations** — scrollable, list continues below the fold.
- Behaviour: opening the hub raised the **Google Sign-In** activity (`com.google.android.gms/.auth.api.signin.ui.SignInActivity`), i.e. an account gate for the online feature; the exact trigger element is INFERRED to be the crown.
- Exit: a game tile → that game's activity; back → SCR-02.
- UNKNOWN: all seven non-Equations games; leaderboard content; sign-in cancellation behavior.
- Confidence: CONFIRMED for the tile list and the sign-in gate (E-RT-003).

### SCR-04 — Topic mode-select (`.addition.AdditionActivity`)

- Purpose: choose a mode for the topic.
- Header: back arrow, green topic title ("Addition") with a play triangle, red gear-with-"1" button.
- Body: 2 columns x 4 rows of mode tiles — **Practice** (book), **Quiz** (thinker "?"), **Duel** (two silhouettes), **Play** (triangle), **Test** (✓/✗), **Time** (stopwatch), **Learn** (box grid + ?), **Hard** (equation boxes + ?) — scrollable (Learn/Hard sit at the viewport bottom).
- Exit: a mode tile → that mode's activity; back → SCR-02.
- UNKNOWN: the gear-with-"1" dialog, whether other topics expose the identical 8 modes.
- Confidence: CONFIRMED for Addition (E-RT-004).

### SCR-05 — Practice round (`.addition.AdditionGame1Activity`)

- Purpose: answer 10 arithmetic questions.
- Header: back arrow, progress `qno` + `question` ("1/10"), settings gear (pink).
- Under the gear: a red **pencil/edit** button.
- Counters: `right1` (green chip) and `wrong1` (red chip) on the right of the question area.
- Question line: `n1` `sgn` `n2` `eql` `ans` (operand, sign, operand, equals, answer).
- Answers: `opt1`–`opt4` in a 2x2 grid, coloured light blue / orange / yellow / purple.
- Background states: light blue (idle), green flash (correct), orange (the 10/10 question).
- Exit: after the 10th answer → SCR-06.
- UNKNOWN: the pencil button, the gear dialog, sound effects, whether several wrong options may be marked in one question.
- Confidence: CONFIRMED (E-RT-005/006/007).

### SCR-06 — Result (`.ResultActivity`)

- Purpose: round summary.
- Title `text` = "Score" (underlined); `crct` = "Correct"; `tv_eq1` = "="; `rt` = correct count; `wrng` = "Wrong"; `tv_eq2` = "="; `wr` = wrong count.
- Controls: `restart` = "RESTART" (cyan), `exit` = "EXIT" (purple), a green checklist icon, and a shared 3-icon bottom bar (thumbs-up / refresh / pink).
- Review sheet: the green checklist icon opens a white, green-bordered scrollable dialog listing every question of the round in order with a green checkmark ("7 + 10 = 17" … "2 + 8 = 10"), closed by a red X.
- Exit: EXIT → SCR-04 (topic mode-select, not the main menu); RESTART unobserved.
- UNKNOWN: the three bottom-bar icons; how wrong answers render in the review sheet; star/medal presentation; per-level persistence.
- Confidence: CONFIRMED (E-RT-008/009/010).

### SCR-07 — Settings (`SettingsActivity`)

- Purpose: global toggles.
- Appearance: a **purple dialog** titled "Settings" with a white X close button and three toggle rows — Music (music-note icon), Sound (speaker icon), Night (crescent icon). Each toggle shows a knob: ON = red knob right, OFF = white knob left.
- The shared 3-icon bottom bar appears here too, so it is a common footer rather than a result-only element.
- Night ON switches the whole app to a dark theme (near-black background, dark grey tiles with light-grey borders, white glyphs) and **persists across force-stop + relaunch**.
- UNKNOWN: Music/Sound effects on playback, whether Night applies to every activity, profile persistence.
- Confidence: CONFIRMED (E-RT-011).

### SCR-08 — Equations level list (`.game.Game_equation_levels_Activity`)

- Purpose: pick an Equations level.
- Layout: 4-column grid of numbered level tiles; level 1 unlocked, every other tile shows a padlock icon; a back arrow top-left; long scrollable list (40+ levels observed; the packaged asset for the timed variant holds 150).
- Exit: a level tile → SCR-09; back → SCR-03.
- UNKNOWN: unlock conditions, per-level star display, how many levels exist in this variant.
- Confidence: CONFIRMED (E-RT-012).

### SCR-09 — Equations board (`.game.GameEquationsEasy`)

- Purpose: fill the crossword-style equation board.
- Header: back arrow, a wide empty panel, and a stopwatch counter on the right (counts **down**; 43 → 40 over 1.5 s).
- Board: 5 columns. Row 1 renders a complete equation `58 + 87 = [?]`, row 2 `18 - 8 = [?]`, further bands render operator-only rows (`+ -`, `= =`) and empty `?` placeholders — rows and columns are both 5-cell equations whose answer cells are shared `?` tiles.
- Tray (bottom): draggable pieces `1 2 3 4 5 ⌫` on the first line, `6 7 8 9 0` on the second, plus an **AD** lightbulb hint tile.
- Help overlay: on entry a large red circle with a red X and a white ▶ triangle covers the board; the timer reads 0 and input is blocked.
- Observed outcome: tapping ▶ dismisses the overlay and reveals a playable board with the countdown running, but within a few seconds the activity finishes itself and the app returns to SCR-08 (no crash, no ANR) — consistent with the static `completeEqTwo(value)` → `gameOver()` mismatch path.
- UNKNOWN: the actual drag interaction (no successful drag was performed), answer-cell feedback styling, completion/star presentation, the AD hint, and the empty header panel's meaning.
- Confidence: CONFIRMED for the rendered layout and the self-ending behavior (E-RT-013/014/015); grid geometry is INFERRED.

## Static MainActivity candidate

`MainActivity.onCreate` sets `activity_main` as its content layout. Its code binds click listeners to frames named Addition, Subtraction, Multiplication, Division, Decimal, Fraction, square root, and Games. Its `onClick` method contains launch intents for those arithmetic/category families plus ExponentialActivity, generic GameActivity, UserProfileActivity, SettingsActivity, and LangSettingActivity. These are static wiring facts only. Static switch-ID-to-target associations are documented in `NAVIGATION_MAP.md`; runtime availability remains UNKNOWN (E-APK-006).

The XML resource tree is preserved at `observations/activity_main_xmltree.txt`. It is not a rendered screenshot and cannot establish pixel layout at runtime.

The MainActivity route table is now mapped to resource names using the sparse-switch payload and compiled resource table; this improves the previous static inventory. It still does not provide black-box screen observation.

## Candidate random-number level list — static code evidence

`GameLevelsActivity.onCreate` sets `activity_game_levels` (layout resource ID `0x7f0d0053`), reads level data, and initializes its controls. Its DEX references a level `RecyclerView` adapter and a separate help control. A level-row callback stores the selected zero-based position and one-based level number, finishes the list activity, then launches `RandomGameActivity` (E-APK-008). `RandomGameActivity`'s back control returns to this list (DEX-RN-007). A `GameActivity.onClick` sparse-switch branch also launches `GameLevelsActivity`, but the corresponding user-visible control has not been resolved (E-APK-009).

This establishes code wiring only. The adapter shows/hides its lock image based on the saved level and attaches a click listener to each level text view without a saved-level guard in the callback; whether a visibly locked row can actually be activated through the overlapping lock image is UNKNOWN. Runtime appearance, row count/labels, scroll behavior, help-dialog contents, entry path, screen dimensions and transitions remain UNKNOWN. The layout's compiled resource tree has not been rendered or captured from a running device.

The help control opens a non-cancelable dialog sized to 7/8 screen height by 8/9 screen width, with two vertically arranged instruction images and a close image (DEX-RN-011). The instruction drawings support the inferred chain-to-target objective; exact on-device scaling and overlap remain UNKNOWN. Images were inspected only as APK evidence and are not reimplementation assets.

## Candidate random-number game — compiled layout and DEX evidence

`activity_random_game` is the layout set by `RandomGameActivity.onCreate` (layout resource `0x7f0d0070`). AAPT's compiled XML tree shows a full-screen vertical `LinearLayout` containing a `ConstraintLayout`, a top toolbar with back, undo and hint image controls, a level number (`level_no`, XML default text `100`), a target `TextView` (`game_random_number`), an equation `RecyclerView` (`equation_list`), an equation-row container (`equation_list_2`) with six predeclared row groups, a `GridLayout` for generated controls, and an ad `FrameLayout`. DEX initialization replaces the level/target values and derives the number-grid column count and visible equation-row count from level data.

The toolbar is declared at 10% of parent height; the target field is also constrained to 10%. The equation list and row container each have 60% height constraints, and the row groups are predeclared in XML. These are resource constraints, not measured rendered bounds; actual rendered sizes, overlays, visibility after initialization, orientation behavior and screen-size behavior remain UNKNOWN. No protected APK images/fonts are reused by the independent implementation.

The companion `activity_game_levels` compiled XML tree shows a toolbar with back control and a `RecyclerView` configured as a four-column `GridLayoutManager` with a 60% height constraint. Its header text is `LEVELS`; a progress overlay is also present in the static tree. This does not confirm that the progress overlay appears at launch or how long loading takes. XML trees are preserved in `observations/activity_random_game_xmltree.txt` and `observations/activity_game_levels_xmltree.txt` (E-APK-010).

## Candidate random-number result screen — static code and layout evidence

`RandomGameActivity.gameOver()` starts `Result_Game2Activity` with `KEY_ACTIVITY=RANDOM_NUMBER`. The result activity inflates `activity_result_game2`, reads the key, and has a RANDOM_NUMBER-specific level/progress branch. Its compiled layout includes a title text field, level/rank fields, an ad placeholder, and controls whose resource IDs are `bg_next`, `bg_restart`, `bg_exit`, `bg_fb`, `bg_rate`, and `bg_share`. DEX provides restart, next-level, back, share, rate, Facebook and leaderboard code paths; exact control-to-action mapping and which controls are visible in this mode remain unverified.

For RANDOM_NUMBER, `nextLevel()` increments the level position and one-based level, conditionally saves the new highest position, and launches `RandomGameActivity`. `restartGame()` launches `RandomGameActivity` at the current position. System back starts `GameActivity`. These are static paths; the result title/message does not prove that a target mismatch is shown as a win or loss. Compiled tree: `observations/activity_result_game2_xmltree.txt` (E-APK-013).

## Candidate splash screen — static code evidence

The manifest launcher is `SplashScreenActivity`. Its `onCreate` inflates `activity_splash_screen`, sets the text `v14.2`, loads and starts a Lottie animation named `math_splash.json`, and attaches an animation listener. The listener posts a task 500 ms after animation end to start `MainActivity`; a catch path also starts `MainActivity`. These are DEX implementation paths, not observed presentation or a measured splash duration (E-APK-007).
