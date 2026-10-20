# Specification: Addition → Duel (E-RT-022)

**Source**: `.addition.AdditionGame3Activity`  
**Evidence**: `m2-probe-addition-duel-*`, `m2-duel*`, `m2-duel2-*`, `m2-mode-duel.xml`

---

## 1. Screen Structure — Split Screen

| Half | Orientation | Equation Views | Option Views | Score Chip |
|---|---|---|---|---|
| **Top** | Rotated 180° | `n1`, `sgn`, `n2`, `eql`, `ans` (no suffix) | `opt1`–`opt4` | `right11` |
| **Bottom** | Upright | `n11`, `sgn1`, `n21`, `eql1`, `ans1` | `opt11`–`opt41` | `right1` |

Both halves display the **same equation simultaneously** (e.g., `6 + 5 = ?` on both).

---

## 2. Scoring Chips

| Chip | View ID | Half | Starts at | Increments | Decrements |
|---|---|---|---|---|---|
| Player | `right1` | Bottom (upright) | 0 | Correct tap on **top** half | Wrong tap on **top** half |
| Opponent | `right11` | Top (rotated) | 0 | Correct tap on **bottom** half | Wrong tap on **bottom** half |

**Cross-increment rule**: answering on one half awards the point to the **other** half's chip.
- Bottom correct → `right11` += 1
- Top correct → `right1` += 1
- Bottom wrong → `right11` -= 1
- Top wrong → `right1` -= 1

Both chips can go negative (observed: -1, -2, -3, -4).

---

## 3. Interaction Rules

- **Options**: 4 per half, identical values (mirrored layout).
- **Wrong tap**: option turns red (inferred), chip -1, question does **not** advance.
- **Correct tap**: question advances on **both halves simultaneously**, other chip +1.
- **No visible round counter** (`qno` shows "-").

---

## 4. State Machine

```
INIT
  │
  ▼
LOAD_PAIR (same equation on both halves)
  │
  ▼
IDLE (both halves show a + b = ?, 4 opts each, chips=P/O)
  │
  ├── BOTTOM tap CORRECT ──► O+=1 ──► LOAD_PAIR
  │
  ├── BOTTOM tap WRONG ──► O-=1 ──► (stay, option red)
  │       │
  │       └── BOTTOM tap CORRECT ──► O+=1 ──► LOAD_PAIR
  │
  ├── TOP tap CORRECT ──► P+=1 ──► LOAD_PAIR
  │
  └── TOP tap WRONG ──► P-=1 ──► (stay)
        │
        └── TOP tap CORRECT ──► P+=1 ──► LOAD_PAIR
```

---

## 5. End Condition — UNKNOWN

- No result screen observed.
- No win/loss threshold observed (chips reached +6 / -4 in probe).
- **UNKNOWN**: round limit, time limit, victory condition, result presentation.

---

## 6. UNKNOWN

- Whether this is a true multiplayer mode (the "opponent" half is fully interactive by the local player).
- Network requirements (the Duel tile may be local hot-seat only).
- Sound, pause, disconnect behavior.
- Whether `AdditionGame4`–`AdditionGame9` are harder Duel tiers.