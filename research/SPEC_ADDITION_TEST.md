# Specification: Addition → Test (E-RT-021)

**Source**: `.addition.AdditionGame5Activity`  
**Evidence**: `m2-probe-addition-test-*`, `m2-counter-addition-test-*`, `m2-mode-test.xml`

---

## 1. Screen Structure

| Region | View IDs | Description |
|---|---|---|
| Header | `qno`, `question`, `setting` | "N/10" |
| Counters | `right1`, `wrong1` | Green, red |
| Equation | `n1`, `sgn`, `n2`, `eql`, `ans` | **Complete equation** (e.g., `2 + 5 = 12`) |
| Verdict | `opt11`="True", `opt21`="False" | Two large buttons, full width |

---

## 2. Rules

- **Round**: 10 questions ("N/10").
- **Task**: Judge whether the displayed equation is mathematically correct.
- **Counters**:
  - `wrong1` (red): increments **immediately** on wrong verdict tap; does not advance.
  - `right1` (green): **not observed to change** in probe.
- **Wrong tap**: no visual on button (inferred), question stays.
- **Correct tap**: advances to next question.
- **Multiple wrong taps**: `wrong1` does **not** increment further (de-duplicated per question, like Practice).

---

## 3. State Machine

```
LOAD_QUESTION (n=1..10)
  │
  ▼
IDLE (a + b = c, [True] [False])
  │
  ├── tap CORRECT verdict ──► n++ ──► (n≤10 ? LOAD : RESULT)
  │
  └── tap WRONG verdict ──► wrong1++ (once per question)
       │
       └── tap CORRECT verdict ──► n++ ──► (n≤10 ? LOAD : RESULT)
```

---

## 4. UNKNOWN

- Whether `right1` increments on first-try correct.
- Result screen mapping for this mode.
- Sound, timing, pause.
- Operand ranges (observed similar to Practice).