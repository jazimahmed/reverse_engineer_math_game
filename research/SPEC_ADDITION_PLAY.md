# Specification: Addition → Play (E-RT-025) — **LAYOUT ONLY**

**Source**: `.addition.AdditionGame4Activity`  
**Evidence**: `m2-probe-addition-play-*`, `m2-mode-play.xml`  
**Status**: **Gameplay UNKNOWN** — only entry screen captured.

---

## 1. Screen Structure

| Region | View IDs | Description |
|---|---|---|
| Equations (3) | `n1`/`sgn`/`n2`/`eql`/`ans`, `n11`..., `n12`... | Three simultaneous equations, each with `?` in `ans` |
| Keypad | `key0`–`key9` | 4×3 grid (1-2-3 / 4-5-6 / 7-8-9 / 0) at bottom |
| Header | (none visible) | No `qno`, `right1`, `wrong1` observed |

---

## 2. Observed Behaviour

- Tapping a keypad digit **fills a `?` answer cell** (which cell gets focus is UNKNOWN).
- No visible counters, timer, progress indicator, or submit button.
- The three equations appear to be independent (different operands).
- Back navigation returns to mode-select.

---

## 3. UNKNOWN (Critical for Implementation)

| Question | Status |
|---|---|
| How does the player select which `?` cell to fill? | UNKNOWN |
| Is there a "submit" or "check" action? | UNKNOWN |
| What constitutes a correct/incorrect answer? | UNKNOWN |
| Are the 3 equations solved sequentially or in parallel? | UNKNOWN |
| Is there a round limit (10 questions like others)? | UNKNOWN |
| Scoring / stars / result screen? | UNKNOWN |
| Does the keypad support backspace/delete? | UNKNOWN |
| Operand ranges / difficulty? | UNKNOWN |
| Sound / feedback? | UNKNOWN |

---

## 4. Hypotheses (NOT CONFIRMED)

- Could be a "speed run": solve all 3 as fast as possible.
- Could be sequential: focus moves to next `?` after each entry.
- Could have a hidden timer (no visible countdown).
- Could be the "Play" mode = free practice without scoring.

**Do not implement** until runtime behavior is observed.