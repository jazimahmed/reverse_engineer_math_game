# Specification: Equations (Math Pieces — Easy Variant) (E-RT-013…E-RT-016)

**Source**: `.game.GameEquationsEasy` (level 1)  
**Entry**: Main → gamepad → Games hub → Equations → level 1  
**Evidence**: `equations-*`, `m2-probe-equations-*` (none successful yet), UI dumps `equations-board-*.xml`

---

## 1. Screen Structure

| Region | View IDs / Description |
|---|---|
| Header | Back arrow, empty wide panel, **stopwatch** (counts down) |
| Board | 5×5 crossword grid: 5 rows × 5 cols, each a 5-cell equation |
| Row 1 | `58 + 87 = ?` (complete equation, `?` = answer cell) |
| Row 2 | `18 - 8 = ?` |
| Rows 3-4 | Operator bands: `+ -`, `= =` (column operators) |
| Row 5 | Two empty `?` tiles (column answer cells) |
| Tray | `1 2 3 4 5 ⌫` / `6 7 8 9 0` + **AD hint** tile |
| Overlay | Red circle + red X + white ▶ (blocks input, timer frozen at 0) |

**Grid geometry**: rows and columns are both 5-cell equations; `?` tiles are shared intersections.

---

## 2. Level List (`.game.Game_equation_levels_Activity`)

- 4-column grid of numbered tiles.
- Level 1 unlocked; all others show padlock.
- Long scrollable list (40+ visible; packaged asset has 150 for timer variant).
- Back → Games hub.

---

## 3. Timer

- **Countdown stopwatch** (not count-up).
- Reads **0** while help overlay is displayed.
- Starts at non-zero (observed 43) after overlay dismissed.
- Decrements in real time (43 → 40 in 1.5 s).

---

## 4. Tutorial Overlay — Self-Ending (E-RT-015)

- On level entry: full-screen red circle with red X and white ▶.
- Blocks all input; timer frozen at 0.
- Tapping ▶ dismisses overlay → playable board revealed, timer running.
- **Within seconds**: activity finishes itself, app returns to level list.
- **No crash, no ANR** — clean `TO_BACK` transition.
- **Matches static DEX**: `completeEqTwo(value)` → `gameOver()` on mismatch (the tutorial performs a demo move that mismatches).

---

## 4. Tray Pieces

- Digits `1`–`9`, `0`, backspace (`⌫`), **AD** (hint/ad) tile.
- Draggable (inferred from `MyDragListener` in DEX); no successful drag observed at runtime.

---

## 5. Dataset Mismatch (E-RT-016)

| Source | Grid | Cells |
|---|---|---|
| Live `GameEquationsEasy` level 1 | 5×5 | 25 |
| Packaged `timerGameLevels` level 1 | 7×8 / 8×9 / 9×10 | 56 / 72 / 90 |

The packaged 150-level JSON (`mathpiecesData.json` → `timerGameLevels`) **does not describe** the live Easy board. It belongs to a different variant. The DEX class analysed earlier (`Game_MathPieces_Activity`) is **not** the class running here (`GameEquationsEasy`).

---

## 6. UNKNOWN (Critical for Implementation)

| Question | Status |
|---|---|
| Drag acceptance rules (which tray piece → which cell)? | UNKNOWN |
| Answer-cell feedback (green/red flash, lock)? | UNKNOWN |
| Row/column validation trigger (per-cell? per-line? 100ms check?) | UNKNOWN |
| Star award thresholds (3-star % from DEX is 40/90/100)? | UNKNOWN |
| AD hint behavior (cost? reveals one cell?) | UNKNOWN |
| Empty header panel purpose (score? stars? level?) | UNKNOWN |
| Countdown duration (starts at 43? 60? varies per level?) | UNKNOWN |
| What happens when timer reaches 0? | UNKNOWN |
| Level completion → stars → unlock next level? | UNKNOWN |
| How many levels in Easy variant? | UNKNOWN (only 1 unlocked) |
| Which entry point loads `timerGameLevels`? | UNKNOWN |

---

## 7. Static DEX Findings (from `Game_MathPieces_Activity` — may not apply)

- `checkCorrectEquation()` scheduled 100ms after accepted drop (DEX-MP-006).
- Rebuilds all row/column equations fresh per pass.
- Completes only when **every** equation is newly valid in one pass.
- Wrong attempts de-duplicated per container tag (`equtaionTags`).
- `calculateResult()`: 0★ if 0 correct; else % = correct/(correct+wrong)×100 → 1★ (<40), 2★ (40-90), 3★ (>90).
- `onGameComplete()` stores stars, calls `gameOver()`.

**These may or may not apply to `GameEquationsEasy`** — runtime verification needed.