# Specification: Addition → Learn (E-RT-026) — **ENTRY ONLY**

**Source**: `.addition.AdditionGame7Activity`  
**Evidence**: `m2-probe-addition-learn-*`, `m2-mode-learn.xml`  
**Status**: **Gameplay UNKNOWN** — only setup screen captured.

---

## 1. Setup Screen Structure

| View ID | Type | Text | Description |
|---|---|---|---|
| `check1` | CheckBox | "3-5" | Operand digit count range |
| `check2` | CheckBox | "3" | Fixed 3-digit operands |
| `check3` | CheckBox | "4" | Fixed 4-digit operands |
| `check4` | CheckBox | "5" | Fixed 5-digit operands |
| `start` | Button | "Start" | Launches the column-addition gameplay |

No header, counters, or equation display on this screen.

---

## 2. UNKNOWN (Critical)

| Question | Status |
|---|---|
| What is the column-addition gameplay? | UNKNOWN |
| How many problems per session? | UNKNOWN |
| Is there a keypad for entering digits column-by-column? | UNKNOWN |
| How are carries handled? | UNKNOWN |
| Scoring / stars / result? | UNKNOWN |
| Does "3-5" mean random 3-to-5 digits per problem? | UNKNOWN |
| Can multiple checkboxes be selected? | UNKNOWN (radio vs checkbox behavior unobserved) |
| Sound / feedback? | UNKNOWN |

---

## 3. Hypotheses (NOT CONFIRMED)

- Standard column addition: operands stacked vertically, player enters result digits from right to left with carry.
- Checkboxes select difficulty (operand width).
- "Start" begins a round of N problems (likely 10, like other modes).
- May have a result screen similar to Practice/Test.

**Do not implement** until runtime behavior is observed.