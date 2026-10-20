# Specification: Addition → Practice (E-RT-005, E-RT-006, E-RT-007, E-RT-020)

**Source**: `com.GamesForKids.Mathgames.MultiplicationTables/.addition.AdditionGame1Activity`  
**Evidence**: Runtime observation 2026-10-19/20; screenshots `m2-probe-addition-practice-*`, `m2-counter-addition-practice-*`; UI dumps `m2-mode-practice.xml`, `m2-probe-addition-practice-*.xml`

---

## 1. Screen Structure

| Region | View IDs | Description |
|---|---|---|
| Header | `qno`, `question`, `setting` | Question index "N/10", settings gear |
| Counters | `right1` (green), `wrong1` (red) | First-try correct count, retry count |
| Equation | `n1`, `sgn`, `n2`, `eql`, `ans` | Operand, operator (+), operand, =, answer field |
| Options | `opt1`–`opt4` (2×2 grid) | Four answer buttons, distinct colours |
| Background | root view | Changes colour per state |

---

## 2. Round Rules

- **Length**: exactly 10 questions (`qno` shows "1/10" … "10/10"; "10/10" is still unanswered).
- **Operand range**: Addition Game 1 uses 0..10 for both operands (observed).
- **Options**: always 4, correct sum always present, distractors may repeat across questions.
- **Question generation**: may repeat within a round (observed "7 + 10" twice in 14 samples).

---

## 3. Answer Validation

| Player action | Immediate visual | Counters | Progression |
|---|---|---|---|
| **Correct on first try** | Background flashes green (#0E7C00), tapped option unchanged | `right1` += 1 | Next question loads (~0.9 s) |
| **Wrong tap** | Tapped option turns red with black text, stays marked | **No change** | Stays on same question |
| **Correct after wrong tap(s)** | Background returns to idle, wrong option stays red | `wrong1` += 1 (exactly once per question) | Next question loads |

**Key invariant**: `wrong1` increments **once per question** when the correct answer is finally given after ≥1 wrong taps. Multiple wrong taps on the same question do **not** increment `wrong1` further. This matches the DEX `equtaionTags` de-duplication (E-APK-020).

---

## 4. Background Colour States

| State | Hex (observed) | Trigger |
|---|---|---|
| Idle | #49C2FF (light blue) / #99CC00 (lime) / #2A52A3 (blue) | Varies per session (emulator GPU artifact); semantic = idle |
| Correct flash | #0E7C00 (dark green) | First-try correct answer |
| Final question (Q10) | #FEB401 (orange) | `qno` = "10/10" |

The idle colour cycles slowly across sessions but the **semantic states** (flash green, final orange) are consistent.

---

## 5. Counters Semantics (E-RT-020)

| Counter | View ID | Meaning | Increments when |
|---|---|---|---|
| Green | `right1` | First-try correct answers | Correct answer on first tap |
| Red | `wrong1` | Questions requiring a retry | Correct answer given after ≥1 wrong taps on that question |

**Result screen mapping**: "Correct" = `right1`, "Wrong" = `wrong1` (retry count, not error count).

---

## 6. State Machine

```
INIT
  │
  ▼
LOAD_QUESTION (n=1)
  │
  ├───► IDLE (bg=idle, qno="n/10", options enabled)
  │        │
  │        ├── tap CORRECT ──► FLASH_GREEN ──► n++ ──► (n≤10 ? LOAD_QUESTION : RESULT)
  │        │
  │        └── tap WRONG ──► OPTION_RED (bg=idle, counters unchanged)
  │                 │
  │                 └── tap CORRECT ──► wrong1++ ──► n++ ──► (n≤10 ? LOAD_QUESTION : RESULT)
  │
  └── (n=10) FINAL_QUESTION (bg=orange)
           │
           ├── tap CORRECT ──► FLASH_GREEN ──► RESULT
           │
           └── tap WRONG ──► OPTION_RED
                    │
                    └── tap CORRECT ──► wrong1++ ──► RESULT
```

---

## 7. Result Transition

- After 10th answer → `ResultActivity` with `KEY_ACTIVITY=ADDITION_PRACTICE` (inferred).
- Result screen shows: "Score", "Correct" = `right1`, "Wrong" = `wrong1`, RESTART, EXIT, review sheet icon.
- EXIT → `AdditionActivity` (mode-select). RESTART unobserved.

---

## 8. Persistence

- **UNKNOWN**: whether per-level best scores, stars, or completion state are saved.
- **UNKNOWN**: whether the 9 `AdditionGame1..9Activity` tiers represent difficulty levels with independent progress.

---

## 9. UNKNOWN / Not Yet Observed

- Pencil/edit button function (under settings gear).
- Settings gear dialog content.
- Sound effects on correct/wrong.
- Whether a question can have >1 wrong option marked (only single-wrong-tap observed).
- Exact operand generation algorithm beyond 0..10.
- Whether the 9 game tiers (`AdditionGame1`–`AdditionGame9`) are selectable or progressive.