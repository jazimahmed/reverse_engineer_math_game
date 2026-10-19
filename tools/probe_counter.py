"""probe_counter.py - determine whether the red counter counts wrong *taps*
or wrong *questions*, and whether the green counter means first-try correct.

Taps a deliberately wrong option twice, then the correct one, recording the
counter values after every step.
"""

from __future__ import annotations

import sys
import time

from rea import Rea, apply_op, int_or_none
from probe_mode import enter_mode, read_questions, counters


def pick_wrong(r: Rea, nodes, q, used: set[str]) -> bool:
    exp = q.expected()
    for nid, text in q.options.items():
        if nid in used:
            continue
        v = int_or_none(text)
        if v is not None and exp is not None and v != exp:
            n = q.option_nodes[nid]
            print(f"  [tap ] wrong {nid}={text}")
            r.tap_node(n, settle=1.3)
            used.add(nid)
            return True
    return False


def pick_correct(r: Rea, nodes, q) -> bool:
    exp = q.expected()
    for nid, text in q.options.items():
        if int_or_none(text) == exp:
            n = q.option_nodes[nid]
            print(f"  [tap ] correct {nid}={text}")
            r.tap_node(n, settle=1.4)
            return True
    return False


def run(r: Rea, topic: str, mode: str) -> None:
    print("=" * 74)
    print(f"  COUNTER PROBE  topic={topic!r} mode={mode!r}")
    print("=" * 74)
    nodes = enter_mode(r, topic, mode)
    print(f"  [top ] {r.top()}")
    q = next((x for x in read_questions(nodes) if x.suffix == ""), None)
    if q is None:
        print("  [note] no base question found")
        return
    print(f"  [qst ] {q.label}  options={q.options}")
    print(f"  [cnt ] initial: {counters(nodes)}")

    # True/False modes: the correct option is the verdict of the statement.
    tf = [(n.rid, n.text) for n in nodes
          if n.rid.startswith("opt") and n.text in ("True", "False")]
    if tf and q.expected() is None:
        a, b = int_or_none(q.n1), int_or_none(q.n2)
        r_val = int_or_none(q.ans)
        truth = apply_op(a, b, q.sgn.strip()) if (a is not None and b is not None) else None
        correct = "True" if truth == r_val else "False"
        wrong = "False" if correct == "True" else "True"
        print(f"  [calc] {a} {q.sgn} {b} = {truth} vs {r_val} -> {correct}")
        for step in (1, 2, 3):
            nid = next((i for i, t in tf if t == wrong), None)
            if not nid:
                break
            n = Rea.by_id(nodes, nid)
            print(f"  [tap ] wrong {nid}={wrong}")
            r.tap_node(n, settle=1.3)
            nodes = r.snap(f"m2-counter-{topic}-{mode.lower()}-wrong{step}")
            print(f"  [cnt ] after wrong #{step}: {counters(nodes)}")
        nid = next((i for i, t in tf if t == correct), None)
        if nid:
            n = Rea.by_id(nodes, nid)
            print(f"  [tap ] correct {nid}={correct}")
            r.tap_node(n, settle=1.4)
            nodes = r.snap(f"m2-counter-{topic}-{mode.lower()}-correct")
            print(f"  [cnt ] after correct: {counters(nodes)}")
        return

    used: set[str] = set()
    for step in (1, 2, 3):
        if not pick_wrong(r, nodes, q, used):
            print("  [note] ran out of wrong options")
            break
        nodes = r.snap(f"m2-counter-{topic}-{mode.lower()}-wrong{step}")
        print(f"  [cnt ] after wrong #{step}: {counters(nodes)}")
        print(f"  [qst ] {q.label}")

    if pick_correct(r, nodes, q):
        nodes = r.snap(f"m2-counter-{topic}-{mode.lower()}-correct")
        print(f"  [cnt ] after correct: {counters(nodes)}")

    # Now answer the NEXT question correctly on the first try and see whether
    # the green counter moves.
    q2 = next((x for x in read_questions(nodes) if x.suffix == ""), None)
    if q2:
        print(f"  [qst ] next question: {q2.label} options={q2.options}")
        if pick_correct(r, nodes, q2):
            nodes = r.snap(f"m2-counter-{topic}-{mode.lower()}-correct2")
            print(f"  [cnt ] after first-try correct: {counters(nodes)}")


if __name__ == "__main__":
    r = Rea()
    run(r, sys.argv[1], sys.argv[2])
