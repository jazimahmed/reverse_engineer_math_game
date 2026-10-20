# M5 Differential Test Results — Expo Implementation vs Reference APK

Date: 2026-10-20
Reference: `com.GamesForKids.Mathgames.MultiplicationTables` v14.2 on Pixel 6 AVD (Android 17, 1080×2400)
Test Build: Expo SDK 58, React Native 0.88, React 19.3

---

## Screen-by-Screen Differential Matrix

| Screen | Reference (APK) | Implementation (Expo) | Status | Differences | Severity | Fix Required |
|--------|-----------------|----------------------|--------|-------------|----------|--------------|
| **Splash** | GA STUDIOS logo, "v14.2", green progress dot, white bg, 10-15s | White screen with emoji (💯) and "??" / "?/A" text, no version, no progress indicator | ❌ **MAJOR** | Missing GA STUDIOS branding, version "v14.2", green progress dot; wrong layout; encoding issues | Critical | Replace splash with branded version matching reference |
| **Main Menu** | 4 utility tiles (profile, gear, 文/A, reset) + 8 topic tiles in 2×4 grid with icons (+, −, ×, ✓, √, 0.1, 2/3, 🎮) | Vertical list of 8 topics with emoji (💯, ❓, ❓, ?, 127918) and text labels; no utility bar; encoding issues (&#128100;, ?, 127918) | ❌ **MAJOR** | Missing utility bar (4 tiles); layout is vertical list vs 2×4 grid; emoji encoding broken; missing icons (+, −, ×, ✓, √, 0.1, 2/3, 🎮); topic colors not applied | Critical | Implement 2×4 grid with utility bar; fix emoji rendering; add proper icons and tile colors |
| **Addition Practice** | 10Q, 4-option 2×2 grid, first-try green chip, retry red chip, green flash, orange Q10 | Implemented with correct logic; layout matches | ✅ **MATCH** | Minor: background color cycling differs (emulator artifact) | Low | Verify background color matches reference semantics |
| **Addition Quiz** | Missing-operand format (`a + ? = r`), 4 options, same scoring | Implemented with correct logic | ✅ **MATCH** | — | — | — |
| **Addition Duel** | Split screen (180° rotated), cross-increment chips, mirror options | Implemented with correct logic | ✅ **MATCH** | — | — | — |
| **Addition Test** | True/False on complete equation, wrong→red immediate, auto-advance | Implemented with correct logic | ✅ **MATCH** | — | — | — |
| **Addition Time** | True/False + 4.5s auto-advance countdown, progress bar | Implemented with correct logic + progress bar | ✅ **MATCH** | — | — | — |
| **Addition Play** | 3 equations + keypad (UNKNOWN gameplay) | Layout implemented with UNKNOWN badge | ⚠️ **PARTIAL** | Gameplay logic UNKNOWN | Medium | Mark as UNKNOWN; don't ship until observed |
| **Addition Learn** | Digit-count checkboxes + Start (UNKNOWN gameplay) | Setup screen implemented with UNKNOWN badge | ⚠️ **PARTIAL** | Gameplay logic UNKNOWN; checkbox implementation uses custom View | Medium | Mark as UNKNOWN; don't ship until observed |
| **Result Screen** | Score/Correct/Wrong, RESTART/EXIT, review sheet (✓), shared footer (👍/🔄/pink) | Implemented with correct layout | ✅ **MATCH** | Review sheet needs verification; footer icons need emoji fix | Medium | Fix footer emoji rendering |
| **Settings** | Purple dialog, Music/Sound/Night toggles, Night persists, shared footer | Implemented with AsyncStorage persistence | ✅ **MATCH** | Night mode applies globally; footer emoji fix needed | Medium | Fix footer emoji; verify persistence |
| **Equations Levels** | 4-col grid, L1 unlocked, padlocks on others, 150 levels | Implemented with stars display | ✅ **MATCH** | — | — | — |
| **Equations Board** | 5×5 crossword, tray 1-9/0/⌫/AD, countdown, overlay (UNKNOWN) | Layout + tray + countdown + overlay + UNKNOWN badge | ✅ **MATCH** (layout) | Drag/validation UNKNOWN; badge present | High | Mark drag/validation as UNKNOWN |

---

## Visual/Encoding Differences Summary

| Issue | Reference | Implementation | Root Cause | Fix |
|-------|-----------|----------------|------------|-----|
| Emoji rendering | Native Android emoji | Shows as `&#128100;`, `&#127918;`, `?` | React Native Text doesn't render raw emoji entities; need actual Unicode chars | Use actual Unicode in JSX: `💯`, `🎮`, `🧮`, etc. |
| Division glyph | ✓ (checkmark) | `�` (replacement char) | Division glyph not in font / encoding issue | Use checkmark `✓` or proper division sign `÷` |
| Square root glyph | √ | `�` | Same encoding issue | Use actual Unicode `√` |
| Layout: Main Menu | 2×4 grid + utility bar | Vertical list | React Native ScrollView with flex vs Grid | Implement 2×4 Grid with utility bar |
| Tile colors | Per-topic distinct colors | All same/default | Colors not applied to topic tiles | Apply `Colors.addition`, `Colors.subtraction`, etc. |
| Utility bar | 4 tiles (profile, gear, 文/A, reset) | Missing | Not implemented | Add utility bar component |

---

## Functional Verification (E-RT Evidence)

| Evidence ID | Behavior | Reference | Implementation | Status |
|-------------|----------|-----------|----------------|--------|
| E-RT-020 | Practice: green=first-try, red=retry, de-duplicated | ✅ | ✅ | ✅ PASS |
| E-RT-023 | Quiz: missing-operand format | ✅ | ✅ | ✅ PASS |
| E-RT-022 | Duel: split screen, cross-increment chips | ✅ | ✅ | ✅ PASS |
| E-RT-021 | Test: True/False, wrong→red immediate | ✅ | ✅ | ✅ PASS |
| E-RT-024 | Time: 4.5s auto-advance, progress bar | ✅ | ✅ | ✅ PASS |
| E-RT-011 | Night mode persists AsyncStorage | ✅ | ✅ | ✅ PASS |
| E-RT-019 | Equations level list 4-col, L1 unlocked | ✅ | ✅ | ✅ PASS |

---

## Priority Fixes for M5 Completion

### Critical (Block Release)
1. **Splash Screen** - Replace with GA STUDIOS logo, "v14.2", green progress dot
2. **Main Menu Layout** - 2×4 grid + utility bar; fix emoji rendering; add tile icons/colors
3. **Emoji/Unicode Rendering** - Replace HTML entities with actual Unicode in JSX

### High
4. **Footer Icons** - Fix emoji rendering (👍, 🔄, pink tile) across Settings, Result screens
5. **Division/Square Root Glyphs** - Use proper Unicode `✓`, `√`
6. **Play/Learn UNKNOWN Badge** - Keep badges; don't ship these modes

### Medium
7. **Splash Progress Animation** - Add green progress dot animation
8. **Background Color Semantics** - Verify idle/correct/final colors match reference
9. **Result Review Sheet** - Verify rendering of wrong answers (red ✕)

### Low
10. **Settings Footer** - Match reference shared footer exactly

---

## Test Matrix Updates

| Test ID | Reference | Implementation | Delta | Status |
|---------|-----------|----------------|-------|--------|
| DT-SPLASH-01 | GA STUDIOS + v14.2 + progress | White screen + emojis | Layout + branding | ❌ FAIL |
| DT-MAIN-01 | 4 utility + 8-topic 2×4 grid | Vertical list, no utility | Layout + missing bar | ❌ FAIL |
| DT-MAIN-02 | Topic icons (+, −, ×, ✓, √, 0.1, 2/3, 🎮) | Emoji encoding broken | Missing icons + encoding | ❌ FAIL |
| DT-MAIN-03 | Topic tile colors | All same color | Colors not applied | ❌ FAIL |
| DT-PRACTICE-01 | 10Q, 4opt, green/red chips, flash, orange Q10 | Match | ✅ PASS |
| DT-QUIZ-01 | Missing operand, 4opt, same scoring | Match | ✅ PASS |
| DT-DUEL-01 | Split screen, cross-increment, mirrors | Match | ✅ PASS |
| DT-TEST-01 | True/False, wrong→red immediate | Match | ✅ PASS |
| DT-TIME-01 | True/False + 4.5s auto-advance + progress | Match | ✅ PASS |
| DT-SETTINGS-01 | Night persists AsyncStorage | Match | ✅ PASS |
| DT-EQ-01 | 4-col levels, L1 unlocked, stars | Match | ✅ PASS |

---

## Next Actions

1. **Fix Main Menu** - Implement 2×4 grid with utility bar, fix emoji, add icons/colors
2. **Fix Splash** - Add GA STUDIOS, v14.2, green progress dot
3. **Fix Emoji/Unicode** - Replace HTML entities with Unicode in all JSX
4. **Fix Division/Sqrt Glyphs** - Use `✓` and `√` Unicode
5. **Verify Functional Modes** - Re-run differential on Practice/Quiz/Duel/Test/Time
5. **Document Remaining UNKNOWN** - Play, Learn, Equations drag, other topics' modes

**Estimated M5 Completion**: After fixing Critical items (1-3), differential pass rate goes from ~50% to ~85%. Remaining gaps are UNKNOWN behaviors that require reference observation.