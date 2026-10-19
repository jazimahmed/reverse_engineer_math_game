# Screen specifications

No screen has been observed at runtime. Static layout resources suggest candidate screens for splash, main, arithmetic categories, individual games, results, settings, language, user profile, and multiplayer. Treat these as candidate screens only.

For each observed screen record purpose, device resolution/density/orientation, component bounds, entry/exit routes, control actions, transitions, loading/error states, and capture references.

| Screen ID | Purpose / layout | Entry / exit | Confidence | Evidence |
|---|---|---|---|---|
| Candidate screens above | Runtime appearance and behavior unknown | Unknown | UNKNOWN | APK layout-name inventory only |

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
