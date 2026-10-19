# Reengineering plan

## Goal
Build an independent implementation based on the user-supplied APK (`research/apk/Math-Games-v14-2-[Premium]-modyolo.apk`; SHA-256 is in `research/observations/APK_TRIAGE.md`). The supplied artifact is the active target by user direction. It is a different package/developer from the initially named Play listing, so conclusions do not transfer to that listing. Use static evidence for internal code facts and runtime evidence for observable behavior.

## Milestones
- [x] M0 — Inspect workspace, host tools, Android SDK, emulator images/AVDs, and REA registration.
- [x] M1 — Obtain and statically inventory the supplied APK.
- [ ] M2 — Run the exact APK on an authorized emulator/device; inventory screens, navigation, settings, and modes across repeated sessions.
- [ ] M3 — Complete evidence-linked specifications and state machines; label unsupported behavior UNKNOWN.
- [ ] M4 — Confirm Expo package compatibility; implement verified functionality only.
- [ ] M5 — Differentially test verified scenarios against the APK and fix documented differences.
- [ ] M6 — Complete automated and available Android device testing; document limitations and residual unknowns.
- [ ] M7 — Build Android artifact and assess completion criteria.

## Latest progress — 2026-10-19
- [x] Resolved default English result-screen resource labels: “Completed”, “Level”, and “Rank” (E-APK-015).
- [x] Kept the mismatch/outcome interpretation UNKNOWN because the resource wording does not resolve the static DEX/help-illustration conflict.
- [x] Added the Math Pieces static completion star formula and its `onGameComplete()` call path to the evidence/specification, and implemented the isolated formula in `src/domain/mathPieces.ts` (E-APK-016).
- [x] Added the static five-cell row/column equation check and inferred grid objective; implemented the isolated line evaluator with explicit malformed-input limitations (E-APK-017).
- [x] Copied the exact 150-level Math Pieces dataset and added schema parsing plus APK-derived 7×8, 8×9 and 9×10 grid configuration (E-APK-018).
- [x] Added a root Expo/TypeScript scaffold and documented an Expo SDK 58 package matrix matching its official bundled native versions (E-ENV-006).
- [x] Inspected Math Pieces touch/drop DEX: drag starts from a tagged tile; accepted drop transfers text/tag and clears the source. Added isolated transfer helper and evidence (E-APK-019, E-IMPL-010).
- [ ] Dependency install remains unverified: npm cannot access `registry.npmjs.org` (`EACCES`), so Expo CLI, RN packages, lockfile and Android build are unavailable.
- [x] Ran `npm.cmd test`: 23 Node test cases passed; strict TypeScript compile passed for Math Pieces domain module using global `tsc.cmd`.
- [ ] Runtime reference observation remains unavailable; ADB still fails before device enumeration (`Cannot mkdir '\.android': Permission denied`) despite workspace-local Android home variables.
- [ ] Continue mapping other game-mode assets/classes only as static candidate evidence; no unverified mode should be implemented.

## Environment
- Workspace had no existing source project or package metadata.
- Node 24.22.0, npm 11.4.1 and TypeScript 5.8.3 are installed globally; TypeScript compiler is callable with `node .../typescript/bin/tsc` because PowerShell script execution blocks `tsc.ps1`.
- Android SDK is at `C:\Users\Administrator\AppData\Local\Android\Sdk`; platform images 34/35/36.1 and a Pixel_6 AVD are present.
- ADB fails with `Cannot mkdir '\.android': Permission denied` even after workspace-local home variables; direct emulator boot was observed previously, but app installation was not possible.
- REA instructions are installed but REA tools are not registered; no JADX/REA CLI. `aapt`, `apksigner`, and `dexdump` are available.
- No Expo/React Native dependencies are present in the workspace. Network access is restricted, so dependency restore and Expo package compatibility cannot currently be verified.

## Evidence rules
Label claims CONFIRMED (directly observed or exact artifact/code facts), INFERRED (supported by repeated observations), or UNKNOWN. APK class/resource names confirm packaged components only, not accessibility or behavior. DEX semantics are static implementation evidence and not black-box observation.

## Current milestone report (2026-10-19)

- Analyzed this iteration: Math Pieces drag touch start, accepted drop transfer, keyed-tag and row/column bookkeeping branches from static DEX.
- Evidence added: E-APK-019 and E-IMPL-010; DEX-MP-005.
- Implemented this iteration: isolated accepted-drop text transfer (target receives source text; source clears). No app UI integration.
- Tests this iteration: `npm.cmd test` passed 23/23; strict standalone TypeScript check passed. The PowerShell `npm` shim was blocked by execution policy; `.cmd` invocation worked.
- Differences found/resolved: static handler proves transfer rather than swap; exact drop acceptance conditions and rendered effects remain unknown.
- Remaining: runtime launch, full board event/state modeling, and actual UI integration.

- Analyzed: supplied APK identity; static DEX paths for random-number input alternation, expression result/target branches, help dialog, result actions, level initialization/hint gate and route chain from GameActivity through the level list; packaged help illustrations supporting an inferred chained-equation objective; all 250 random-number level records' schema/distributions; multiplayer question generator and room-construction call; MainActivity navigation switch/resources; splash-to-main code path; Math Pieces five-cell row/column validation, inferred grid objective, 150-level asset schema, three grid dimensions and completion star formula.
- Evidence collected: `research/observations/DEX_BEHAVIOR_FINDINGS.md`, `research/EVIDENCE_LOG.md` (E-APK-008 through E-APK-018, E-IMPL-005/006/007/008/009), `research/NAVIGATION_MAP.md`, and compiled layout trees for MainActivity, GameLevelsActivity, the level item, RandomGameActivity, help dialog and result screen.
- Implemented: root Expo/TypeScript shell with an explicit research notice; random-number data parser and supplied level records, evaluation, selection validation, initialization, hint decisions, target-progression branch and result next-level helper; index-based multiplayer question generator; Math Pieces level parser/data, grid sizing, isolated line-equation validator and attempt-to-stars formula.
- Tests executed: 22 Node test cases passed; strict TypeScript check passed for the three standalone domain modules. The Expo app cannot be typechecked or built until dependency restore succeeds. No APK runtime, device, or differential tests.
- Differences found/resolved: first parser version did not match Java `Integer.parseInt`; it now rejects whitespace, decimal strings and signed 32-bit overflow. No reference-runtime comparison has been possible.
- Remaining: launch APK and record screens; inspect complete mode mechanics and persistence; restore Expo dependencies and run SDK checks; implement UI and all verified behavior; add integration/E2E/device tests; build Android.

## Active checklist

- [x] Workspace/SDK/REA/automation inventory.
- [x] APK metadata, DEX/resource/data inventory.
- [x] Record selected static behavior findings and confidence/limits.
- [ ] Establish runtime observation of the exact APK.
- [ ] Observe all reachable screens/modes across sessions and complete evidence-linked specifications.
- [x] Create the independent RN app shell and check the official Expo SDK 58 version matrix.
- [ ] Restore packages, verify with the local Expo CLI, typecheck and build the Android app.
- [ ] Implement all verified flows/modes, persistence and settings.
- [ ] Differential and automated/device testing.
- [ ] Build Android and audit all completion criteria.
