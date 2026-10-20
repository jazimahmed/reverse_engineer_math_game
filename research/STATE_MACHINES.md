# Complete State Machines — Evidence-Gated

All transitions are **CONFIRMED** by runtime observation unless marked UNKNOWN.

---

## 1. Addition → Practice (CONFIRMED)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADDITION PRACTICE                            │
└─────────────────────────────────────────────────────────────────────┘

   ┌─────────┐
   │  INIT   │  (activity created, loadData→reset→setTextOnCells)
   └────┬────┘
        │
        ▼
   ┌─────────────────┐
   │ LOAD_QUESTION n │  n = 1..10  (qno = "n/10")
   └────────┬────────┘
            │
            ▼
   ┌──────────────────────┐
   │      IDLE_n          │  bg=idle, 4 opts enabled
   │  n1 + n2 = ?         │
   └──────────┬───────────┘
              │
      ┌───────┼───────┐
      │       │       │
      ▼       ▼       ▼
┌──────────┐ ┌──────────────┐ ┌─────────────────┐
│ TAP_OK   │ │  TAP_WRONG   │ │  (n=10) FINAL  │
│ 1st try  │ │  (opt→red)   │ │  bg=ORANGE      │
└────┬─────┘ └──────┬───────┘ └────────┬────────┘
     │              │                  │
     │              │ (stay,          │
     │              │  counters        │
     │              │  unchanged)      │
     ▼              ▼                  ▼
┌──────────┐ ┌──────────────┐ ┌─────────────────┐
│ FLASH_GRN│ │  TAP_OK      │ │  TAP_WRONG      │
│ right1++ │ │ wrong1++     │ │ (opt→red)       │
│ n++      │ │ n++          │ │                 │
└────┬─────┘ └──────┬───────┘ └────────┬────────┘
     │              │                  │
     │              │                  │ (stay)
     ▼              ▼                  ▼
┌─────────────────────────────────────────────────────┐
│                   NEXT OR RESULT                     │
│  if n ≤ 10: LOAD_QUESTION n                          │
│  if n > 10: RESULT_ACTIVITY                          │
└─────────────────────────────────────────────────────┘
```

**Counters** (E-RT-020):
- `right1` (green) = first-try correct count
- `wrong1` (red) = questions needing retry (increments **once** when correct given after ≥1 wrong)

---

## 2. Addition → Quiz (CONFIRMED)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADDITION QUIZ                                │
└─────────────────────────────────────────────────────────────────────┘

   LOAD_QUESTION n (n=1..10)
            │
            ▼
   ┌──────────────────────┐
   │      IDLE_n          │  n1 + ? = ans   (n2 shows "?")
   │  4 options for ?     │
   └──────────┬───────────┘
              │
      ┌───────┼───────┐
      ▼       ▼       ▼
   TAP_OK  TAP_WRONG  FINAL (n=10, bg=orange)
  1st try  (opt→red)   │
      │       │        │
      ▼       ▼        ▼
   FLASH   TAP_OK    TAP_WRONG
  right1++ wrong1++  (opt→red)
  n++      n++          │
      │       │          ▼
      └───────┼────── TAP_OK
              │       wrong1++
              ▼       n++
         NEXT/RESULT
```

**Same counter semantics as Practice** (E-RT-023).

---

## 3. Addition → Test (CONFIRMED)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADDITION TEST                                │
└─────────────────────────────────────────────────────────────────────┘

   LOAD_QUESTION n (n=1..10)
            │
            ▼
   ┌──────────────────────┐
   │      IDLE_n          │  a + b = c  [TRUE] [FALSE]
   └──────────┬───────────┘
              │
      ┌───────┼───────┐
      ▼       ▼       ▼
   TAP_OK  TAP_WRONG  FINAL (n=10)
  (advances) wrong1++   │
      │       │         │
      ▼       ▼         ▼
   NEXT    (stay)    TAP_OK
  /RESULT  │          (advances)
           │              │
           └──────────────▼
                     NEXT/RESULT
```

**Counters** (E-RT-021):
- `wrong1` increments **immediately** on wrong verdict.
- `right1` **not observed** to change.
- De-duplicated per question (multiple wrong taps → 1 red increment).

---

## 4. Addition → Time (CONFIRMED)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADDITION TIME                                │
└─────────────────────────────────────────────────────────────────────┘

   LOAD_QUESTION n (n=1..10)
            │
            ▼
   ┌────────────────────────────────────┐
   │         IDLE_n (timer=4.5s)        │  a + b = c  [TRUE] [FALSE]
   └─────────────────┬──────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    TIMER_EXP    TAP_OK        TAP_WRONG
    (auto n++)   (n++)        wrong1++
        │          │            │
        ▼          ▼            │
   NEXT/      NEXT/RESULT   (stay, timer runs)
   RESULT     (timer cancels)  │
                              ▼
                          TAP_OK
                          (n++)
                          ▼
                       NEXT/RESULT
```

- Auto-advance every ~4.5 s (E-RT-024).
- Wrong tap does **not** pause timer (inferred).
- `wrong1` increments immediately; `right1` unobserved.

---

## 5. Addition → Duel (CONFIRMED)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADDITION DUEL                                │
└─────────────────────────────────────────────────────────────────────┘

   LOAD_PAIR (same eq on both halves)
            │
            ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                      IDLE                                     │
   │  TOP (rotated 180°):  a + b = ?  [opt1][opt2][opt3][opt4]    │
   │  BOTTOM (upright):    a + b = ?  [opt11][opt21][opt31][opt41]│
   │  Chips:  right11=O  |  right1=P                                │
   └────────────────────────────┬─────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
     BOTTOM_OK              BOTTOM_WRONG            TOP_OK
     (player side)          (opt→red)               (opponent side)
          │                     │                       │
          ▼                     ▼                       ▼
     right11 += 1         right11 -= 1            right1 += 1
     LOAD_PAIR            (stay)                   LOAD_PAIR
                                          
                         BOTTOM_WRONG then OK:          TOP_WRONG then OK:
                         right11 += 1                    right1 += 1
                         LOAD_PAIR                       LOAD_PAIR
```

**Cross-increment**: bottom correct → `right11`++; top correct → `right1`++.
Wrong → corresponding chip -1.
Chips can go negative. No round counter (`qno`="-").

**Win condition**: UNKNOWN.

---

## 6. Settings (CONFIRMED)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SETTINGS                                     │
└─────────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────────────────┐
   │ SETTINGS_DIALOG (Music=ON, Sound=ON,       │
   │                  Night=OFF)                │
   └────────────────────┬───────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   TOGGLE_MUSIC    TOGGLE_SOUND    TOGGLE_NIGHT
        │               │               │
        ▼               ▼               ▼
   (instant)        (instant)        (instant)
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │ Night=ON → dark │
                                    │ theme global +  │
                                    │ persist         │
                                    └─────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
     CLOSE (X)       BACK KEY      FOOTER ICONS
        │               │               │
        ▼               ▼               ▼
   MAIN_MENU      MAIN_MENU        UNKNOWN
```

---

## 7. Equations (PARTIAL — overlay self-end CONFIRMED)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EQUATIONS EASY (L1)                              │
└─────────────────────────────────────────────────────────────────────┘

   ┌──────────────────┐
   │   ENTER_LEVEL    │  (from EQ_LEVELS tap L1)
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────┐
   │  OVERLAY_ACTIVE      │  red circle + X + ▶
   │  timer=0 (frozen)    │  input BLOCKED
   │  board HIDDEN        │
   └──────────┬───────────┘
              │
              ▼ (tap ▶)
   ┌──────────────────────┐
   │  PLAYABLE            │  5×5 crossword visible
   │  timer=COUNTDOWN     │  (43→40…)
   │  tray: 1-9,0,⌫,AD    │
   └──────────┬───────────┘
              │
              ▼ (within seconds, no input)
   ┌──────────────────────┐
   │  GAMEOVER            │  activity.finish() → TO_BACK
   │  (completeEqTwo      │  returns to EQ_LEVELS
   │   mismatch path)     │
   └──────────────────────┘
```

**Full play loop**: UNKNOWN (drag, validation, stars, timer expiry, completion).

---

## 8. Navigation Back-Stack (CONFIRMED)

```
SPLASH → MAIN
  │
  ├─→ TOPIC_MODESELECT → MODE_ACTIVITY → RESULT → TOPIC_MODESELECT
  │       (back)           (back/EXIT)        (back/EXIT)
  │
  ├─→ GAMES_HUB → EQ_LEVELS → EQ_EASY → (auto) EQ_LEVELS
  │       (back)      (back)      (back)
  │
  └─→ SETTINGS → MAIN
          (close/back)
```

**Critical**: EXIT from Result → **ModeSelect**, not Main.