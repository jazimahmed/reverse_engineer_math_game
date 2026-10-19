# Navigation map

No navigation has been observed at runtime. These edges are reconstructed from MainActivity DEX control flow plus resource-ID names. They confirm packaged code wiring only, not runtime visibility or successful transitions.

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

The static route chain includes MainActivity `games` -> GameActivity -> a GameActivity click-switch case -> GameLevelsActivity -> selected level -> RandomGameActivity -> Result_Game2Activity on the `gameOver()` path. Result actions can restart/advance to RandomGameActivity; system back starts GameActivity. RandomGameActivity's own back control returns to GameLevelsActivity. The GameActivity switch case's user-visible label and runtime reachability are still UNKNOWN.
