# Specification: Addition → Time (E-RT-024)

**Source**: `.addition.AdditionGame6Activity`  
**Evidence**: `m2-probe-addition-time-*`, `m2-time-*`, `m2-mode-time.xml`

---

## 1. Screen Structure

Identical to Test:
- Header: `qno`, `question`
- Counters: `right1`, `wrong1`
- Equation: `n1`, `sgn`, `n2`, `eql`, `ans` (complete equation)
- Verdict: `opt11`="True", `opt21`="False"

---

## 2. Rules — Adds Auto-Advance Timer

- **Per-question deadline**: ~4.5 seconds (observed: qno 1→2→3 in ~9 s without player input).
- **Auto-advance**: when timer expires, `qno` increments automatically; equation changes.
- **Wrong tap**: increments `wrong1` immediately, does **not** reset/pause timer (inferred).
- **Correct tap**: advances immediately (cancels remaining time for that question).
- **Counters**: same as Test — `wrong1` increments on wrong verdict; `right1` not observed.

---

## 3. State Machine

```
LOAD_QUESTION (n=1..10)
  │
  ▼
IDLE (a + b = c, [True] [False], timer=4.5s)
  │
  ├── timer EXPIRES ──► n++ ──► (n≤10 ? LOAD : RESULT)
  │
  ├── tap CORRECT ──► n++ ──► (n≤10 ? LOAD : RESULT)
  │
  └── tap WRONG ──► wrong1++ (once) ──► (timer continues)
       │
       └── tap CORRECT ──► n++ ──► (n≤10 ? LOAD : RESULT)
```

---

## 4. UNKNOWN

- Total round duration (10 × 4.5s = 45s? or variable?).
- Whether timer pauses on wrong tap.
- Whether auto-advance counts as "wrong" for scoring.
- Result screen: does it show time taken? Time bonus?
- Whether `right1` increments on correct (first-try or any).
- Sound/tick cues.