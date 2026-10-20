# Specification: Settings (E-RT-011)

**Source**: `.SettingsActivity`  
**Entry**: Main menu → gear (`bg_set`)  
**Evidence**: `m2-settings-*`, `m2-settings-dialog.xml`

---

## 1. Screen Structure

- **Dialog**: purple background, title "Settings", white X close (`close`).
- **Three toggles** (each: label + icon + `Switch`):
  - Music (`tv_music` + `switch_music`) — music note icon
  - Sound (`tv_sound` + `switch_sound`) — speaker icon
  - Night (`tv_colors` + `switch_color`) — crescent icon
- **Shared footer**: 3-icon bar (thumbs-up `facebook`/`bg_fb`, refresh `rate`/`bg_rate`, pink `bg_share`) — same as Result screen.

---

## 2. Toggle Semantics

| Toggle | View ID | Default | ON = | OFF = | Persists |
|---|---|---|---|---|---|
| Music | `switch_music` | ON | red knob right | white knob left | **UNKNOWN** (audio not tested) |
| Sound | `switch_sound` | ON | red knob right | white knob left | **UNKNOWN** |
| Night | `switch_color` | OFF | red knob right | white knob left | **YES** (CONFIRMED) |

---

## 3. Night Mode Behavior

- **ON**: global dark theme — near-black background, dark grey tiles with light-grey borders, white glyphs.
- **Applies to**: Main menu, topic screens, game screens (INFERRED), Settings dialog.
- **Splash screen**: remains light-themed (observed after restart with Night ON).
- **Persistence**: survives `am force-stop` + relaunch → stored in `SharedPreferences`.

---

## 4. State Machine

```
SETTINGS_DIALOG (Music=ON, Sound=ON, Night=OFF)
  │
  ├── tap Music switch ──► toggles immediately, no confirmation
  │
  ├── tap Sound switch ──► toggles immediately
  │
  ├── tap Night switch ──► toggles immediately
  │       │
  │       └── Night=ON ──► app-wide dark theme applied instantly
  │
  ├── tap close (X) ──► dismiss → MainActivity
  │
  ├── tap footer icons ──► UNKNOWN (rate, share, facebook)
  │
  └── Android back ──► dismiss → MainActivity
```

---

## 5. UNKNOWN

- Music/Sound toggle effects on actual audio playback.
- Whether Music/Sound persist across restart (Night does; others untested).
- Footer icon actions: thumbs-up (rate?), refresh (replay?), pink (ad?).
- Profile avatar, language switch, reset progress on main menu — separate from this dialog.
- Whether the gear-with-"1" on topic screens opens the same dialog.