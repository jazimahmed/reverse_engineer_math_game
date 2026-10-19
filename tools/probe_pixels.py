"""probe_pixels.py - sample colours from the captured reference screenshots.

Used to pin down the exact background-state colours of the game screens and
the progress/time bar semantics, so the reimplementation can match them.
"""

from __future__ import annotations

import os
import sys
from collections import Counter

from png import read

RT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                  "research", "observations", "runtime")


def sample(name: str, points: list[tuple[int, int]]) -> None:
    path = os.path.join(RT, f"{name}.png")
    img = read(path)
    print(f"{name}  ({img.width}x{img.height})")
    for x, y in points:
        print(f"   ({x:4},{y:4}) = {img.hex_at(x, y)}")


def row(name: str, y: int, x0: int = 0, x1: int = 0, step: int = 10) -> None:
    path = os.path.join(RT, f"{name}.png")
    img = read(path)
    x1 = x1 or img.width
    print(f"{name} row y={y}")
    for x in range(x0, x1, step):
        print(f"   x={x:4} = {img.hex_at(x, y)}")


def histogram(name: str, box: tuple[int, int, int, int] | None = None) -> None:
    path = os.path.join(RT, f"{name}.png")
    img = read(path)
    x0, y0, x1, y1 = box or (0, 0, img.width, img.height)
    counts: Counter[str] = Counter()
    for y in range(y0, y1, 2):
        for x in range(x0, x1, 2):
            counts[img.hex_at(x, y)] += 1
    print(f"{name} top colours in {box or 'full image'}")
    for hexcol, n in counts.most_common(12):
        print(f"   {hexcol}  {n}")


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "sample":
        pts = [(int(a), int(b)) for a, b in (p.split(",") for p in sys.argv[3:])]
        sample(sys.argv[2], pts)
    elif cmd == "row":
        row(sys.argv[2], int(sys.argv[3]),
            *(int(v) for v in sys.argv[4:6]) if len(sys.argv) > 5 else ())
    elif cmd == "hist":
        box = None
        if len(sys.argv) > 2:
            box = tuple(int(v) for v in sys.argv[2].split(","))
        histogram(sys.argv[3] if box else sys.argv[2], box)
