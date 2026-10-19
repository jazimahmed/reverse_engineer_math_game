# Unknown behavior

The target is `research/apk/Math-Games-v14-2-[Premium]-modyolo.apk`. Static identity and structure are recorded, but this APK has not been installed or run.

Highest-priority unknowns:

1. Main-screen visual order, visible/locked modes, and exact navigation.
2. Whether activity names correspond to accessible modes; most mode rules and question generation. For Random Number, help art infers chained equations toward the target, but this conflicts with the DEX mismatch-to-gameOver branch and remains unverified at runtime.
3. Answer formats, validation, feedback, scoring, timers, hints, difficulty, and completion.
4. Progress unlocks, star scoring, persistence and resume after relaunch.
5. Settings, language behavior, offline behavior, errors, and orientation/responsive layouts.
6. Duel/multiplayer online requirements and behavior without connectivity.
7. Which packaged assets are used by this v14.2 build versus legacy/unused resources.
8. How much the supplied Modyolo-distributed build differs from the original developer-signed build.

ADB currently cannot connect: Windows `adb` fails to resolve its profile path and attempts to create `\.android`; the emulator itself was started in a workspace-local AVD but no ADB server/device was established. No app runtime observation has occurred.

## Static-code coverage that does not remove runtime unknowns

For the candidate random-number mode, DEX now establishes arithmetic parsing/evaluation, operator-slot category checks, initial row/grid setup, hint gating, input-slot alternation, result/target branches, level unlock write behavior, and candidate route wiring. AAPT establishes compiled layout hierarchy and constraints. Still UNKNOWN: whether users can reach the route, what target match/mismatch means to the player, feedback/toast wording, scoring, retry/undo behavior, ads at runtime, persistence across process restart, actual rendered appearance, and behavior on devices. The result activity launch and highest-level write are static code paths, not proof of a successful or winning gameplay outcome.

Math Pieces now has one established static score formula: correct/wrong attempt percentage maps to 0–3 stars (E-APK-016). This does not remove the unknowns around counter updates, completion trigger, time limits, pauses, unlock/persistence, result presentation, or whether the candidate mode is reachable.

Math Pieces' row/column checker supports an inferred objective of arranging arithmetic pieces into equalities (E-APK-017). Exact tile inventory, allowed movement, when lines are checked, correction/undo behavior, completion trigger, and actual instructions remain UNKNOWN. Timer-related fields alone do not establish a countdown: the current code trace has not identified an active timer scheduler or timeout path.
