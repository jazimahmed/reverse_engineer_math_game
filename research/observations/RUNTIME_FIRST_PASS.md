# Runtime observations — live emulator sessions (M2)

- Date: 2026-10-19 (OpenCode session; first successful execution of the target APK).
- Device: Google Pixel 6 AVD (`sdk_gphone16k_x86_64`), Android 17, 1080x2400, headless (`-no-window -gpu swiftshader_indirect -no-audio -no-boot-anim -no-snapshot`).
- APK: `research/apk/Math-Games-v14-2-[Premium]-modyolo.apk` → installed `Success`; `versionName=14.2`, `versionCode=142`, `minSdk=19`, `targetSdk=32`; package `com.GamesForKids.Mathgames.MultiplicationTables`; launcher `.SplashScreenActivity`.
- Everything below was observed on-device (screenshots in `research/observations/runtime/*.png`, UI hierarchies in `research/observations/runtime/ui/*.xml`).
- Confidence labels: **CONFIRMED** = directly observed; **INFERRED** = consistent with observation plus static evidence; **UNKNOWN** = not yet observed.

## 0. Environment notes (not app defects)

- The emulator's own SystemUI raised an ANR ("System UI isn't responding") twice during cold boot and once mid-session under `screenrecord` load. It is an emulator/swiftshader artifact: the game process stayed alive and the dialog was dismissed with "Wait" both times. Logcat showed no app crash, no app ANR.
- The emulator process died once mid-observation (no `FATAL EXCEPTION`, no `ActivityManager` kill of the app). Rebooting restores the app; the AVD is booted with `-no-snapshot`, so emulator restarts do not preserve app state.
- AVD is not writable-state-persistent across boots, but app data (SharedPreferences) does persist because it lives in the AVD userdata image; settings persistence below was verified by force-stop + relaunch, not by a device reboot.

## 1. Splash / cold start (E-RT-001)

- CONFIRMED: `SplashScreenActivity` shows a white screen with the **GA STUDIOS** logo bottom-left, the version string **"v14.2"** bottom-right, and a green circular progress indicator at the centre.
- CONFIRMED: after ~10–15 s the app hands off to `.MainActivity`.
- The splash rendered in the light theme even while Night mode was enabled (screenshot `main-night-after-restart.png`).

## 2. Main menu — `.MainActivity` (E-RT-002)

CONFIRMED layout (1080x2400):
- Top bar, 4 tiles: profile avatar (red), settings gear (green), language switch (blue, "文/A"), reset-progress (pink circular arrow).
- Body: 8 topic tiles, 2 columns x 4 rows, on a white/light-blue checkered background:
  1. Add — green tile, `+` glyph
  2. Subtract — light blue tile, `−` glyph
  3. Multiply — orange tile, `×` glyph
  4. Division — pink tile, checkmark-style glyph (this build draws a ✓, not `÷`)
  5. Square root — purple tile, `√` glyph
  6. Decimals — teal tile, `0.1` glyph
  7. Fractions — blue tile, `2/3` glyph
  8. Mixed/games — dark green tile, gamepad glyph
- CONFIRMED: tiles animate in — immediately after returning from a child screen the grid is briefly empty, then tiles appear.
- CONFIRMED: the gamepad tile opens the **Games hub**, not a "Mixed" arithmetic topic.
- UNKNOWN: whether the profile tile changes anything yet; what the reset tile does (not yet exercised); audio on tile press.

## 3. Games hub — `.game.GameActivity` (E-RT-003)

- Reached from the main-menu gamepad tile. CONFIRMED 8 tiles: **2048, Fifteen, Puzzle, Match, Sudoku, Mix, Memory, Equations** (2 columns x 4 rows, scrollable; the list continues below the fold).
- Header: back arrow (left), crown icon (right) = ranking/leaderboards.
- CONFIRMED: opening the hub triggers **Google Sign-In** (`com.google.android.gms/.auth.api.signin.ui.SignInActivity`) because the crown/leaderboard feature requires an account. (The sign-in screen was reached before the hub settled; the exact trigger element is INFERRED to be the crown.)
- UNKNOWN: behaviour of each of the 7 non-Equations games; leaderboard content.

## 4. Topic mode-select — `.addition.AdditionActivity` (E-RT-004)

- CONFIRMED: tapping the Add topic opens `.addition.AdditionActivity`.
- Header: back arrow, green "Addition" title with a play triangle, red gear-with-"1" button.
- CONFIRMED 8 mode tiles, 2 columns x 4 rows: **Practice** (book), **Quiz** (thinker "?"), **Duel** (two silhouettes), **Play** (triangle), **Test** (✓/✗), **Time** (stopwatch), **Learn** (box grid + ?), **Hard** (equation boxes + ?).
- CONFIRMED: the mode list is scrollable (Learn/Hard sit at the bottom edge of the viewport).
- INFERRED: every topic (subtract/multiply/divide/root/decimals/fractions) exposes the same 8 modes with a different title — to be verified in the sweep.

## 5. Practice round — `.addition.AdditionGame1Activity` (E-RT-005 … E-RT-009)

- CONFIRMED activity: `.addition.AdditionGame1Activity` (one activity per game level tier; the digit is the tier).
- CONFIRMED layout and view ids: back arrow; progress `qno` + `question` ("1/10"); settings gear (pink); a red **pencil/edit** button under the gear; counter chips `right1` (green) and `wrong1` (red); question line `n1` `sgn` `n2` `eql` `ans`; four answer buttons `opt1`–`opt4` in a 2x2 grid, colours light-blue / orange / yellow / purple.
- CONFIRMED round length: **10 questions** ("N/10" shows the index of the question currently displayed; the 10th question is still unanswered when the label reads 10/10).
- CONFIRMED question generation for Addition Game 1: both operands in 0..10, one operator (`+` observed; the sign view `sgn` is a separate view), four options always containing the correct sum. Observed samples: 10+4 {3,10,16,14}, 3+9 {12,18,20,14}, 5+2 {12,18,7,19}, 4+8 {4,5,12,18}, 7+10 {12,18,20,14}, 2+9 {11,7,10,20}, 1+9 {10,5,19,7}, 10+3 {13,16,5,3}, 4+6 {10,9,7,15}, 5+8 {13,12,7,19}, 9+5 {14,15,12,4}, 7+10 {17,12,3,8}, 9+1 {10,7,12,8}, 2+8 {10,9,5,2}.
- CONFIRMED **counter semantics**: the green chip counts **first-try correct** answers only; the red chip counts questions that needed a retry.
  - Correct on first try → green +1 immediately, screen background flashes green, next question loads (next question already visible ~0.9 s after the tap).
  - Wrong tap → that button turns **red with black text** and stays marked; the question does **not** advance and the counters do not change (verified 4 s later, frames identical).
  - Then answering correctly → the question advances, background returns to the normal light blue, **red +1** and the green chip is **not** incremented.
- CONFIRMED the background colour states: light blue = idle question, green = correct-answer flash, **orange = the 10/10 (last) question**.
- INFERRED: the "green = first try" reading also explains the result screen showing Correct = 10 after 10 first-try answers.
- UNKNOWN: the pencil button's function; the gear-with-1 dialog; sound effects; whether a wrong answer is limited to one wrong option per question (only one wrong tap was observed per question).

## 6. Result screen — `.ResultActivity` (E-RT-010, E-RT-011)

- CONFIRMED: after the 10th question the app switches to `.ResultActivity`.
- CONFIRMED layout and ids: title `text` = "Score" (underlined); `crct` = "Correct"; `tv_eq1` = "="; `rt` = correct count; `wrng` = "Wrong"; `tv_eq2` = "="; `wr` = wrong count; `restart` = "RESTART" (cyan); `exit` = "EXIT" (purple). A green checklist icon (right of the counters) and a bottom bar of three icon buttons (thumbs-up / circular refresh / pink empty tile).
- CONFIRMED values: a 10-question round answered 10/10 first-try showed "Correct = 10", "Wrong = 0".
- CONFIRMED **answer-review sheet**: the green checklist icon opens a white dialog with a green border listing every question of the round in order with a green checkmark, e.g. "7 + 10 = 17", "2 + 9 = 11", … "2 + 8 = 10" (10 rows, scrollable, confirmed by scrolling), and a red X close button top-right.
- CONFIRMED navigation: **EXIT** returns to `.addition.AdditionActivity` (the topic mode-select), not to the main menu. RESTART was not exercised.
- UNKNOWN: the three bottom-bar icon buttons' actions (thumbs-up = rate, refresh = replay, pink = ad slot?); whether wrong answers appear in the review sheet with a red cross; star/medal presentation (not observed for Practice); whether the result screen persists per level.

## 7. Settings — `.SettingsActivity` (E-RT-012)

- CONFIRMED: the main-menu gear opens `.SettingsActivity` — a **purple dialog** with the title "Settings", a white X close button, and three toggle rows:
  - Music (music-note icon) — ON (red knob, right)
  - Sound (speaker icon) — ON
  - Night (crescent icon) — OFF (white knob, left)
- The same three-icon bottom bar (thumbs-up / refresh / pink) appears in the settings dialog and on the result screen, i.e. it is a shared footer.
- CONFIRMED **persistence**: after toggling Night ON, force-stopping the app and relaunching it shows the dark theme → settings are stored on the device (SharedPreferences-class) and restored at startup.
- CONFIRMED **night theme**: global switch to a near-black background, tiles become dark grey with light-grey borders, all glyphs white; applied to the main menu. Whether it also applies to game screens is INFERRED (not separately captured).
- UNKNOWN: Music/Sound toggle effects on playback; whether the reset tile and the "1" gear are the same dialog; persistence of profile/avatar state.

## 8. Equations (Math Pieces) mode (E-RT-013 … E-RT-018)

- CONFIRMED: the games hub's **Equations** tile opens `.game.Game_equation_levels_Activity`.
- CONFIRMED level list: 4-column grid of numbered tiles, level 1 unlocked, all other levels showing a padlock; a back arrow top-left; the list is long (levels 1..40+ observed, scrollable) — the packaged asset for this mode holds 150 levels.
- CONFIRMED: tapping level 1 opens `.game.GameEquationsEasy`.
- CONFIRMED board layout: 5 columns; row 1 renders as a complete equation `58 + 87 = [?]`, row 2 as `18 - 8 = [?]`, further rows render operator-only bands (`+ -`, `= =`) and empty `?` placeholders — i.e. a **crossword-style grid where rows and columns are both 5-cell equations** and the `?` tiles are the shared answer cells.
- CONFIRMED bottom tray: draggable pieces `1 2 3 4 5 ⌫` / `6 7 8 9 0` plus an **AD** lightbulb (hint) tile.
- CONFIRMED header: back arrow, a wide empty panel, and a **stopwatch counter** (right). The counter counts **down** (43 → 40 across a 1.5 s gap), and reads 0 while the help overlay is up.
- CONFIRMED **help overlay**: on entering a level a large red circle with a red X and a white ▶ play triangle covers the board; the timer is frozen at 0; input is blocked (a drag attempt over the overlay had no effect).
- CONFIRMED **overlay outcome**: tapping ▶ dismisses the overlay and reveals the playable board with the countdown running; within a few seconds the activity finishes itself and the app returns to the level list (no crash, no ANR — verified in logcat: the activity is simply finished / TO_BACK).
- This runtime outcome **matches the static contradiction** recorded in the Codex evidence: the help illustration performs a step whose value does not match the target, and the DEX path `completeEqTwo(value)` calls `gameOver()` on mismatch — so the tutorial ends the level instead of starting play. Previously UNKNOWN; now CONFIRMED by observation.
- CONFIRMED correction to the static model: the packaged asset `src/domain/data/mathPiecesLevels.json` (field `timerGameLevels`, 150 levels, level 1 = **56 cells** → 7x8 grid) does **not** describe the live Equations-Easy board (**5x5**). The extracted dataset therefore belongs to a different variant of this game (the "timer" variant), and the DEX class analysed earlier (`Game_MathPieces_Activity`) is not the class that runs in the Easy variant (`GameEquationsEasy`). Both variants remain to be mapped.
- UNKNOWN: which entry point loads `timerGameLevels`; the drag/drop interaction itself (no successful drag was performed yet — a synthetic long-press gesture was consumed as a system back gesture, and the overlay blocked the second attempt); the answer-cell feedback styling; the star award path in this variant; what the AD hint does; what the header's empty panel shows.

## 9. Behavioural summary that the reimplementation must reproduce

1. Boot: splash (GA STUDIOS + v14.2) → main menu.
2. Main menu: 4 utility buttons + 8 topic tiles (games hub lives behind the gamepad tile).
3. Topic screen: 8 mode tiles.
4. Practice: 10 questions, 4 options, first-try-correct scoring, wrong-answer lock on the option, red counter for retries, green flash on correct, orange background for the last question.
5. Result: Score screen with Correct/Wrong, review sheet, RESTART/EXIT (EXIT → topic screen).
6. Settings: Music, Sound, Night; persisted.
7. Equations: level list → 5x5 crossword board with tray, countdown timer, tutorial overlay that ends the level.
