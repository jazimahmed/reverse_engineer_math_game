"""probe_time.py - observe the Time mode's countdown.

Samples the screen rapidly and records the question index, the counters and
any changing text, so the per-question timeout and the end-of-round
behaviour can be characterised.
"""

from __future__ import annotations

import sys
import time

from rea import Rea, int_or_none
from probe_mode import enter_mode, read_questions


def summary(nodes) -> str:
    def g(rid):
        v = Rea.val(nodes, rid)
        return v if v else "-"
    texts = [f"{n.rid}={n.text!r}" for n in nodes
             if n.text and n.rid and n.rid not in ("qno", "question", "right1", "wrong1",
                                                  "n1", "n2", "ans", "sgn", "eql")]
    return (f"qno={g('qno')} right1={g('right1')} wrong1={g('wrong1')} | "
            + " ".join(texts[:8]))


def run(r: Rea, topic: str = "addition", mode: str = "Time", seconds: float = 12.0) -> None:
    print("=" * 74)
    print(f"  TIME PROBE  topic={topic!r} mode={mode!r}  sampling {seconds}s")
    print("=" * 74)
    nodes = enter_mode(r, topic, mode)
    print(f"  [top-activity] {r.top()}")
    r.snap("m2-time-entry")
    print(r.describe(nodes))

    t0 = time.time()
    last = None
    while time.time() - t0 < seconds:
        nodes = r.nodes()
        s = summary(nodes)
        if s != last:
            print(f"  [{time.time() - t0:5.1f}s] {s}")
            last = s
        time.sleep(0.35)
    r.snap("m2-time-after")
    print(f"  [top-activity] {r.top()}")


if __name__ == "__main__":
    r = Rea()
    run(r, *(sys.argv[1:3] or ["addition", "Time"]))
