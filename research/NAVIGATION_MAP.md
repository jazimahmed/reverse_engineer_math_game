# Navigation map

Navigation **has** now been observed at runtime (2026-10-19). The "Runtime-observed edges" table below is live observation; the older static table is retained as supporting code evidence.

| From | Control ID / static action | To / result | Confidence | Evidence |
|---|---|---|---|---|
| MainActivity | `addition` | AdditionActivity | CONFIRMED (static) | E-APK-006 |
| MainActivity | `subtraction` | SubtractionActivity | CONFIRMED (static) | E-APK-006 |
| MainActivity | `multiplication` | MultiplicationActivity | CONFIRMED (static) | E-APK-006 |
| MainActivity | `division` | DivisionActivity | CONFIRMED (static) | E-APK-006 |
| MainActivity | `decimal` | DecimalActivity | CONFIRMED (static) | E-APK-006 |
| MainActivity | `fraction` | FractionActivity | CONFIRMED (static) | E-APK-006 |
| MainActivity | `square_root` | ExponentialActivity | CONFIRMED (static code mapping) | E-APK-006 |
| MainActivity | `games` | GameActivity | CONFIRMED (static) | E-APK-006 |
| GameActivity | A `GameActivity.onClick` sparse-switch case | GameLevelsActivity | CONFIRMED (static route); control label/reachability UNKNOWN | E-APK-009 |
| MainActivity | `bg_lang` | LangSettingActivity | CONFIRMED (static) | E-APK-006 |
| MainActivity | `bg_user` | UserProfileActivity | CONFIRMED (static) | E-APK-006 |
| MainActivity | `bg_set` | SettingsActivity | CONFIRMED (static) | E-APK-006 |
| MainActivity | `bg_adfree` | Toast resource (text/conditions not identified) | CONFIRMED (static destination) | E-APK-006 |
| MainActivity | `bg_more` | `RedirectManager.moreApps` | CONFIRMED (static) | E-APK-006 |
| MainActivity | `bg_rate` | `RedirectManager.rateUs` | CONFIRMED (static) | E-APK-006 |
| SplashScreenActivity | Lottie animation end; handler delay 500 ms | MainActivity | CONFIRMED (static code path); timing/visibility UNKNOWN | E-APK-007 |
| SplashScreenActivity | Exception catch path | MainActivity | CONFIRMED (static fallback path); occurrence UNKNOWN | E-APK-007 |
| RandomGameActivity | Back control calls `onBackPressed()`; finishes and starts | GameLevelsActivity | CONFIRMED (static) | DEX-RN-007 |
| RandomGameActivity | `gameOver()`; finishes and starts with `KEY_ACTIVITY=RANDOM_NUMBER` | Result_Game2Activity | CONFIRMED (static) | DEX-RN-003/010 |
| GameLevelsActivity | Level item callback sets `MyConstant.LEVEL_POS` to the clicked index, sets `MyConstant.LEVEL` to index + 1, finishes the list activity, and starts | RandomGameActivity | CONFIRMED (static) | DEX-RN-008 |
| GameLevelsActivity | Help control | Non-cancelable random-number instruction dialog; close image dismisses | CONFIRMED (static) | DEX-RN-011 |
| Result_Game2Activity (RANDOM_NUMBER) | `nextLevel()` increments level state, conditionally saves highest unlocked position, starts | RandomGameActivity | CONFIRMED (static) | DEX-RN-010 |
| Result_Game2Activity (RANDOM_NUMBER) | `restartGame()` starts | RandomGameActivity at current position | CONFIRMED (static) | DEX-RN-010 |
| Result_Game2Activity | System back handler starts | GameActivity | CONFIRMED (static) | DEX-RN-010 |
| Any other listed destination | Back/action/completion | Unknown | UNKNOWN | No runtime observation |

## Runtime-observed edges (2026-10-19)

| From | Control | To / result | Confidence | Evidence |
|---|---|---|---|---|
| `.SplashScreenActivity` | Lottie animation end (500 ms handler delay in DEX) | `.MainActivity` | CONFIRMED (runtime) | E-RT-001, E-RT-017 |
| `.MainActivity` | Add tile | `.addition.AdditionActivity` | CONFIRMED (runtime) | E-RT-004 |
| `.MainActivity` | gamepad tile (8th) | `.game.GameActivity` | CONFIRMED (runtime) | E-RT-003 |
| `.MainActivity` | settings gear | `.SettingsActivity` | CONFIRMED (runtime) | E-RT-011 |
| `.MainActivity` | profile avatar / language "文/A" / reset pink arrow | not exercised | UNKNOWN | — |
| `.game.GameActivity` | Equations tile | `.game.Game_equation_levels_Activity` | CONFIRMED (runtime) | E-RT-012 |
| `.game.GameActivity` | hub entry | `com.google.android.gms/.auth.api.signin.ui.SignInActivity` (account gate) | CONFIRMED (runtime) | E-RT-003 |
| `.game.Game_equation_levels_Activity` | level tile 1 | `.game.GameEquationsEasy` | CONFIRMED (runtime) | E-RT-012 |
| `.game.GameEquationsEasy` | ▶ on the help overlay | board becomes playable, countdown runs | CONFIRMED (runtime) | E-RT-015 |
| `.game.GameEquationsEasy` | (no input) | activity finishes itself → back to `.game.Game_equation_levels_Activity` | CONFIRMED (runtime) | E-RT-015 |
| `.addition.AdditionActivity` | Practice tile | `.addition.AdditionGame1Activity` | CONFIRMED (runtime) | E-RT-005 |
| `.addition.AdditionGame1Activity` | 10th answer | `.ResultActivity` | CONFIRMED (runtime) | E-RT-008 |
| `.ResultActivity` | EXIT | `.addition.AdditionActivity` | CONFIRMED (runtime) | E-RT-010 |
| `.ResultActivity` | RESTART | not exercised | UNKNOWN | — |
| `.ResultActivity` | green checklist icon | review dialog (in-screen) | CONFIRMED (runtime) | E-RT-009 |
| `.ResultActivity` | back arrow | `.addition.AdditionActivity` (observed in the round-end capture) | CONFIRMED (runtime) | E-RT-010 |
| `.addition.AdditionGame1Activity` | back arrow | `.addition.AdditionActivity` | CONFIRMED (runtime) | E-RT-005 |
| Any screen | Android back | previous screen in the stack (standard) | INFERRED | observed stack returns |

### Runtime correction to the static chain

The static chain "MainActivity `games` -> GameActivity -> GameLevelsActivity -> RandomGameActivity -> Result_Game2Activity" was **not** confirmed at runtime. The observed hub opens **Equation levels** (not the random-number level list) from the Equations tile; the random-number mode's entry point remains UNKNOWN.

The static route chain includes MainActivity `games` -> GameActivity -> a GameActivity click-switch case -> GameLevelsActivity -> selected level -> RandomGameActivity -> Result_Game2Activity on the `gameOver()` path. Result actions can restart/advance to RandomGameActivity; system back starts GameActivity. RandomGameActivity's own back control returns to GameLevelsActivity. The GameActivity switch case's user-visible label and runtime reachability are still UNKNOWN.
