"""probe_duel.py - focused observation of the Duel mode.

The Duel screen shows two simultaneous equations: the top half is rotated
180 degrees (the opponent's side) and the bottom half is upright (the local
player). This probe answers the bottom half first-try, then the top half,
and records how the two score chips (right1 / right11) react.
"""

from __future__ import annotations

import sys
import time

from rea import Rea, int_or_none
from probe_mode import enter_mode, read_questions


def chips(nodes) -> str:
    def g(rid):
        v = Rea.val(nodes, rid)
        return v if v else "-"
    return f"right1={g('right1')} right11={g('right11')} wrong1={g('wrong1')} wrong11={g('wrong11')}"


def progress_green(nodes) -> int:
    """Count the filled progress squares (they are small views without ids)."""
    greens = 0
    for n in nodes:
        if n.cls.endswith("View") and 0 < n.w <= 40 and 0 < n.h <= 60 and n.y1 > 900 and n.y1 < 1200:
            greens += 1
    return greens


def tap_value(r: Rea, nodes, q, value, tag) -> bool:
    for nid, text in q.options.items():
        if int_or_none(text) == value:
            n = q.option_nodes[nid]
            print(f"  [tap ] {tag} {nid}={text} at ({n.cx},{n.cy})")
            r.tap_node(n, settle=1.2)
            return True
    return False


def run(r: Rea, topic: str = "addition", mode: str = "Duel") -> None:
    print("=" * 74)
    print(f"  DUEL PROBE  topic={topic!r} mode={mode!r}")
    print("=" * 74)
    nodes = enter_mode(r, topic, mode)
    print(f"  [top ] {r.top()}")
    r.snap("m2-duel-entry")
    print(r.describe(nodes))

    for step in range(1, 5):
        nodes = r.nodes()
        qs = read_questions(nodes)
        bottom = next((q for q in qs if q.suffix == "1"), None)
        top = next((q for q in qs if q.suffix == ""), None)
        if not bottom:
            print("  [note] no bottom question - stopping")
            break
        print(f"\n  --- round {step} ---")
        print(f"  [chips] {chips(nodes)}   progress={progress_green(nodes)}")
        print(f"  [bot  ] {bottom.label} options={bottom.options}")
        print(f"  [top  ] {top.label if top else '-'} options={top.options if top else '-'}")

        exp = bottom.expected()
        if exp is not None:
            tap_value(r, nodes, bottom, exp, "BOTTOM-correct")
            nodes = r.snap(f"m2-duel-r{step}-bottom-correct")
            print(f"  [chips] after bottom correct: {chips(nodes)} progress={progress_green(nodes)}")

        nodes = r.nodes()
        top = next((q for q in read_questions(nodes) if q.suffix == ""), None)
        if top:
            exp2 = top.expected()
            vals = [int_or_none(t) for t in top.options.values()]
            wrong = [v for v in vals if v is not None and exp2 is not None and v != exp2]
            if wrong:
                tap_value(r, nodes, top, wrong[0], "TOP-wrong")
                nodes = r.snap(f"m2-duel-r{step}-top-wrong")
                print(f"  [chips] after top wrong: {chips(nodes)} progress={progress_green(nodes)}")
            if exp2 is not None:
                tap_value(r, nodes, top, exp2, "TOP-correct")
                nodes = r.snap(f"m2-duel-r{step}-top-correct")
                print(f"  [chips] after top correct: {chips(nodes)} progress={progress_green(nodes)}")
        print(f"  [top-activity] {r.top()}")


if __name__ == "__main__":
    r = Rea()
    run(r, *(sys.argv[1:3] or ["addition", "Duel"]))
