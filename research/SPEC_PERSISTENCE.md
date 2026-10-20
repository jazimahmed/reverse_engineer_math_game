# Specification: Persistence & Data (E-RT-011, E-RT-012, E-RT-019)

**Evidence**: Runtime observation 2026-10-19/20; static DEX `SharedPreferences` usage.

---

## 1. Confirmed Persistent Data

| Key / Feature | Storage | Verified | Scope |
|---|---|---|---|
| **Night mode** | `SharedPreferences` | ✅ force-stop + relaunch | Global (all activities except splash) |
| **Settings toggles (Music, Sound)** | `SharedPreferences` | ❌ (Night only tested) | Global |
| **Level unlock (Equations)** | `SharedPreferences` / level object | ✅ level 1 unlocked, others padlocked | Per variant (Easy) |
| **Stars per level (Equations)** | Level object `stars` field | ❌ (not observed) | Per level |
| **Highest unlocked level (Random Number)** | `MyConstant.LEVEL_POS` / `MyConstant.LEVEL` | ✅ DEX only (E-APK-013) | Global |
| **Score history / per-mode best** | UNKNOWN | ❌ | UNKNOWN |

---

## 2. Night Mode Persistence (CONFIRMED)

- **Trigger**: Settings dialog → Night toggle ON.
- **Effect**: Immediate global dark theme.
- **Survives**: `am force-stop <package>` + fresh launch.
- **Splash**: Remains light-themed (theme applied after splash).
- **Implementation**: Likely `AppCompatDelegate.setDefaultNightMode()` or equivalent, backed by `SharedPreferences` boolean.

---

## 3. Equations Level Unlock (CONFIRMED)

- Level list shows padlock overlay on locked levels.
- Only level 1 unlocked initially.
- **UNKNOWN**: unlock condition (stars on previous? completion? score?).
- **UNKNOWN**: whether unlock state survives reinstall (likely yes, `SharedPreferences`).

---

## 4. Addition Mode Progress — UNKNOWN

| Question | Status |
|---|---|
| Does Practice remember which `AdditionGame1..9` tier was last played? | UNKNOWN |
| Are per-mode high scores saved? | UNKNOWN |
| Does the gear-with-"1" on mode-select show/control difficulty? | UNKNOWN |
| Is there a "profile" with XP/level? | UNKNOWN (avatar tile untested) |

---

## 5. Random Number Progress (DEX ONLY — E-APK-013)

- `RandomGameActivity.gameOver()` → `Result_Game2Activity`.
- `nextLevel()`: increments `MyConstant.LEVEL_POS` and `MyConstant.LEVEL`, conditionally saves new highest position.
- `restartGame()`: relaunches same level.
- **Not verified at runtime** — Random Number mode unreachable.

---

## 6. Multiplayer / Duel — UNKNOWN

- Duel mode shows two local chips; no network traffic observed.
- Static `GenQuestions` / `CreateNewRoom` → 24 questions for room creation.
- **UNKNOWN**: whether Duel is local hot-seat only or has online component.

---

## 7. Reset Progress (Main Menu Pink Tile) — UNKNOWN

- Tile present, not exercised.
- **Hypothesis**: clears all `SharedPreferences` + level unlocks + scores.
- **Risk**: irreversible; do not test without backup plan.

---

## 8. Data Schema for Reimplementation

### Settings (SharedPreferences)
```json
{
  "music_enabled": true,
  "sound_enabled": true,
  "night_mode": false
}
```

### Equations Easy (per-level, likely in SharedPreferences or local DB)
```json
{
  "levels": {
    "1": { "unlocked": true, "stars": 0, "best_time": null },
    "2": { "unlocked": false, "stars": 0 },
    ...
  }
}
```

### Addition / Arithmetic (per topic per tier — UNKNOWN structure)
```json
{
  "addition": {
    "game1": { "best_score": 10, "stars": 3, "completed": true },
    "game2": { ... },
    ...
  }
}
```

---

## 9. Migration / Upgrade — UNKNOWN

- No versioned schema observed.
- Modyolo build may have modified persistence vs original.

---

## 10. Test Plan for Persistence (M5)

1. Toggle Night ON → force-stop → relaunch → verify dark theme.
2. Complete Addition Practice 10/10 → force-stop → relaunch → check if result screen shows "Completed" badge on Practice tile.
3. Unlock Equations level 2 (if possible) → force-stop → verify unlock persists.
4. Toggle Music/Sound → force-stop → verify audio state (requires audio capture).
5. Test reset tile → verify all progress cleared (destructive; last).