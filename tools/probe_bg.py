"""probe_bg.py - track the background colour of a game screen over time.

The reference app changes the whole-screen background while a question is
open. This samples a background pixel repeatedly and reports the colour
sequence together with the question index, so the rule can be derived.
"""

from __future__ import annotations

import sys
import time

from png import read
from probe_mode import enter_mode

RT = r"C:\Users\Administrator\Desktop\REA\research\observations\runtime"


def sample_bg(r, points=((540, 1200), (540, 300), (60, 2200))) -> list[str]:
    path = f"{RT}\\_bg_sample.png"
    r.screenshot("_bg_sample")
    img = read(path)
    return [img.hex_at(x, y) for x, y in points]


def run(r: Rea, topic: str = "addition", mode: str = "Practice", seconds: float = 14.0) -> None:
    print("=" * 74)
    print(f"  BACKGROUND PROBE  topic={topic!r} mode={mode!r}")
    print("=" * 74)
    nodes = enter_mode(r, topic, mode)
    t0 = time.time()
    last = None
    while time.time() - t0 < seconds:
        cols = sample_bg(r)
        if cols != last:
            print(f"  [{time.time() - t0:5.1f}s]  bg={cols[0]}  {cols[1]}  {cols[2]}")
            last = cols
        time.sleep(0.25)


if __name__ == "__main__":
    from rea import Rea
    r = Rea()
    run(r, *(sys.argv[1:3] or ["addition", "Practice"]))
