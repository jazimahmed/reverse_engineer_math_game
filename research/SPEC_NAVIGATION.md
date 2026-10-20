# Specification: Navigation & Screen Flow (E-RT-001…E-RT-010, E-RT-019)

**Evidence**: All runtime captures 2026-10-19/20

---

## 1. Global Navigation Graph

```
SPLASH (.SplashScreenActivity)
   │ 10-15s auto
   ▼
MAIN (.MainActivity)
   ├── topic: Add → ADDITION_MODESELECT (.addition.AdditionActivity)
   ├── topic: Subtract → SUBTRACTION_MODESELECT (.subtraction.SubtractionActivity)
   ├── topic: Multiply → MULTIPLICATION_MODESELECT (.multiplication.MultiplicationActivity)
   ├── topic: Division → DIVISION_MODESELECT (.division.DivisionActivity)
   ├── topic: SquareRoot → EXPONENTIAL_MODESELECT (.exponential.ExponentialActivity)
   ├── topic: Decimal → DECIMAL_MODESELECT (.decimal.DecimalActivity)
   ├── topic: Fraction → FRACTION_MODESELECT (.fraction.FractionActivity)
   ├── topic: Games → GAMES_HUB (.game.GameActivity)
   │       ├── Equations → EQ_LEVELS (.game.Game_equation_levels_Activity) → EQ_EASY (.game.GameEquationsEasy)
   │       ├── 2048 / Fifteen / Puzzle / Match / Sudoku / Mix / Memory → UNKNOWN
   │       └── crown → GOOGLE_SIGN_IN
   ├── gear → SETTINGS (.SettingsActivity)
   ├── avatar/profile → UNKNOWN
   ├── 文/A language → UNKNOWN
   └── reset (pink) → UNKNOWN
```

---

## 2. Mode-Select → Mode Activities (Addition)

```
ADDITION_MODESELECT
   ├── Practice → AdditionGame1Activity
   ├── Quiz → AdditionGame2Activity
   ├── Duel → AdditionGame3Activity
   ├── Play → AdditionGame4Activity
   ├── Test → AdditionGame5Activity
   ├── Time → AdditionGame6Activity
   ├── Learn → AdditionGame7Activity
   └── Hard → AdditionGame8Activity / AdditionGame9Activity (UNKNOWN which)
```

Other topics: same pattern, different `*Activity` classes.

---

## 3. Mode → Result → Back

```
*Game*Activity (Practice/Quiz/Test/Time/Duel/Play/Learn)
   │ completion (10th answer / win / timeout)
   ▼
ResultActivity (Score, Correct, Wrong, RESTART, EXIT, review sheet)
   │
   ├── EXIT → ModeSelect (e.g., AdditionActivity)
   ├── RESTART → same mode activity (UNOBSERVED)
   └── back → ModeSelect
```

**Note**: EXIT returns to the **topic mode-select**, not the main menu.

---

## 4. Settings Flow

```
MAIN → gear → SettingsActivity (dialog)
   │
   ├── Night toggle → instant theme change + persist
   ├── close/back → MAIN
   └── footer icons → UNKNOWN
```

---

## 5. Equations Flow

```
MAIN → gamepad → GAMES_HUB
   │
   ├── Equations → EQ_LEVELS (4-col grid, L1 unlocked)
   │       │
   │       └── tap L1 → EQ_EASY (5×5 board)
   │               │
   │               ├── overlay ▶ → playable (timer runs)
   │               │       │
   │               │       └── (auto) gameOver → EQ_LEVELS
   │               │
   │               └── back → EQ_LEVELS
   │
   └── back → MAIN
```

---

## 6. Splash Flow

```
SPLASH (GA STUDIOS, "v14.2", green dot)
   │ Lottie anim end + 500ms handler (DEX)
   ▼
MAIN
   │ exception catch path also → MAIN
```

---

## 7. Deep Links / External — UNKNOWN

- Google Sign-In → leaderboards (Games hub crown).
- Rate / Share / Facebook footer icons.
- "AD" hint tile in Equations tray.
- Reset progress button (main menu pink).
- Language switch ("文/A").
- Profile avatar.

---

## 7. Back Stack Behavior

| From | Back / System back | Result |
|---|---|---|
| Mode activity | back | Mode-select |
| Mode-select | back | Main menu |
| Result | EXIT / back | Mode-select |
| Settings | close / back | Main menu |
| Games hub | back | Main menu |
| EQ_LEVELS | back | Games hub |
| EQ_EASY | back | EQ_LEVELS |
| Splash | (none) | auto → Main |