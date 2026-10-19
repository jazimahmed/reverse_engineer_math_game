# Difficulty system

Runtime difficulty selection and progression are UNKNOWN. The APK includes a `difficulty` string resource and `dialog_difficulty.xml`; this confirms a packaged difficulty dialog/resource, not its availability or choices in v14.2.

Observe supported levels, default selection, per-mode number ranges, progression triggers, score effects, and persistence before implementation. Do not assume the usual easy/medium/hard labels imply the exact rules.

## Runtime hints (2026-10-19)

- The topic mode-select carries a red **gear-with-"1"** button, and each arithmetic topic has **nine** numbered activity tiers (`AdditionGame1Activity` … `AdditionGame9Activity`) in the DEX. The mapping between the "1" badge, the nine tiers and any difficulty dialog is UNKNOWN.
- Addition **Game 1** was observed with operands in 0..10; the generator rule for the remaining tiers is UNKNOWN.
- The Equations variant seen live is named `GameEquationsEasy`, which implies at least one other difficulty variant exists for that game.
