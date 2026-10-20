# Specification: Addition → Quiz (E-RT-023)

**Source**: `.addition.AdditionGame2Activity`  
**Evidence**: `m2-probe-addition-quiz-*`, `m2-mode-quiz.xml`

---

## 1. Screen Structure

| Region | View IDs | Description |
|---|---|---|
| Header | `qno`, `question`, `setting` | "N/10", settings |
| Counters | `right1`, `wrong1` | Same as Practice |
| Equation | `n1`, `sgn`, `n2`(="?"), `eql`, `ans` | **Missing operand**: `n2` shows "?" |
| Options | `opt1`–`opt4` (2×2) | Four candidate values for the missing operand |

---

## 2. Rules

- **Round**: 10 questions ("N/10").
- **Format**: `a + ? = r` (e.g., `9 + ? = 19` → answer 10).
- **Options**: 4 values, correct missing operand always present.
- **Counters**: Identical semantics to Practice (E-RT-020):
  - Green (`right1`) = first-try correct
  - Red (`wrong1`) = retry count per question (de-duplicated)
- **Wrong tap**: option turns red, no advance, no counter change.
- **Correct after wrong**: advances, `wrong1` += 1.

---

## 3. State Machine

```
LOAD_QUESTION (n=1..10)
  │
  ▼
IDLE (n1 + ? = ans, 4 options)
  │
  ├── tap CORRECT ──► FLASH_GREEN ──► n++ ──► (n≤10 ? LOAD : RESULT)
  │
  └── tap WRONG ──► OPTION_RED
       │
       └── tap CORRECT ──► wrong1++ ──► n++ ──► (n≤10 ? LOAD : RESULT)
```

---

## 4. UNKNOWN

- Operand ranges (observed similar to Practice).
- Whether subtraction/multiplication variants appear in later tiers.
- Sound, pencil, gear dialog (same as Practice).