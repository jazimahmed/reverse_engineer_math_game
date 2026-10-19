"""probe_duel2.py - decisive experiment for Duel mode.

Phase A: answer ONLY the bottom (upright) half, never touching the top half,
          and watch both chips and both questions.
Phase B: answer ONLY the top (rotated) half and watch the bottom chip.

This reveals whether the top half is a simulated opponent, and what the two
score chips actually count.
"""

from __future__ import annotations

import sys
import time

from rea import Rea, int_or_none
from probe_mode import enter_mode, read_questions
from probe_duel import chips


def tap_value(r: Rea, nodes, q, value, tag) -> bool:
    for nid, text in q.options.items():
        if int_or_none(text) == value:
            n = q.option_nodes[nid]
            print(f"  [tap ] {tag} {nid}={text}")
            r.tap_node(n, settle=1.1)
            return True
    return False


def run(r: Rea, topic: str = "addition", mode: str = "Duel") -> None:
    print("=" * 74)
    print("  DUEL PHASE A: answer only the BOTTOM (upright) half")
    print("=" * 74)
    nodes = enter_mode(r, topic, mode)
    print(f"  [top-activity] {r.top()}")

    for step in range(1, 7):
        nodes = r.nodes()
        if "AdditionGame3" not in r.top():
            print(f"  [note] left the duel activity after {step - 1} rounds -> {r.top()}")
            break
        qs = read_questions(nodes)
        bottom = next((q for q in qs if q.suffix == "1"), None)
        top = next((q for q in qs if q.suffix == ""), None)
        print(f"\n  --- round {step} ---")
        print(f"  [chips] {chips(nodes)}")
        print(f"  [bot  ] {bottom.label if bottom else '-'} {bottom.options if bottom else ''}")
        print(f"  [top  ] {top.label if top else '-'} {top.options if top else ''}")
        if not bottom:
            break
        exp = bottom.expected()
        if exp is not None:
            tap_value(r, nodes, bottom, exp, "BOTTOM-correct")
        nodes = r.snap(f"m2-duel2-bottom-r{step}")
        print(f"  [chips] after bottom correct: {chips(nodes)}")
        print(f"  [top-activity] {r.top()}")

    print()
    print("=" * 74)
    print("  DUEL PHASE B: answer only the TOP (rotated) half")
    print("=" * 74)
    for step in range(1, 4):
        nodes = r.nodes()
        if "AdditionGame3" not in r.top():
            print(f"  [note] left the duel activity -> {r.top()}")
            break
        qs = read_questions(nodes)
        top = next((q for q in qs if q.suffix == ""), None)
        bottom = next((q for q in qs if q.suffix == "1"), None)
        print(f"\n  --- round {step} ---")
        print(f"  [chips] {chips(nodes)}")
        print(f"  [top  ] {top.label if top else '-'} {top.options if top else ''}")
        print(f"  [bot  ] {bottom.label if bottom else '-'} {bottom.options if bottom else ''}")
        if not top:
            break
        exp = top.expected()
        if exp is not None:
            tap_value(r, nodes, top, exp, "TOP-correct")
        nodes = r.snap(f"m2-duel2-top-r{step}")
        print(f"  [chips] after top correct: {chips(nodes)}")


if __name__ == "__main__":
    r = Rea()
    run(r, *(sys.argv[1:3] or ["addition", "Duel"]))
