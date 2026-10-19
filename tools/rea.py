"""rea.py - runtime observation toolkit for the M2 sweep of the supplied APK.

Wraps adb + uiautomator so screen states can be captured and parsed
structurally, and stores every capture under
research/observations/runtime/ as evidence.

Usage:
    python tools/rea.py describe            # dump the current screen
    python tools/rea.py mode addition Quiz   # probe one mode's behaviour
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field

ADB = r"C:\Users\Administrator\AppData\Local\Android\Sdk\platform-tools\adb.exe"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RT_DIR = os.path.join(ROOT, "research", "observations", "runtime")
UI_DIR = os.path.join(RT_DIR, "ui")
PACKAGE = "com.GamesForKids.Mathgames.MultiplicationTables"


@dataclass
class Node:
    cls: str = ""
    text: str = ""
    desc: str = ""
    rid: str = ""
    package: str = ""
    clickable: str = "false"
    checked: str = "false"
    selected: str = "false"
    x1: int = 0
    y1: int = 0
    x2: int = 0
    y2: int = 0

    @property
    def cx(self) -> int:
        return (self.x1 + self.x2) // 2

    @property
    def cy(self) -> int:
        return (self.y1 + self.y2) // 2

    @property
    def w(self) -> int:
        return self.x2 - self.x1

    @property
    def h(self) -> int:
        return self.y2 - self.y1

    def __repr__(self) -> str:
        return (f"<{self.cls.split('.')[-1]} id={self.rid!r} text={self.text!r} "
                f"desc={self.desc!r} checked={self.checked} "
                f"@({self.x1},{self.y1}) {self.w}x{self.h}>")


class Rea:
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        os.makedirs(RT_DIR, exist_ok=True)
        os.makedirs(UI_DIR, exist_ok=True)

    # ---------------------------------------------------------------- adb
    def sh(self, *args: str, timeout: int = 120) -> str:
        res = subprocess.run([ADB, *args], capture_output=True, text=True,
                             timeout=timeout)
        return (res.stdout or "") + (res.stderr or "")

    def top(self) -> str:
        out = self.sh("shell", "dumpsys", "activity", "activities")
        m = re.search(r"topResumedActivity=ActivityRecord\{\S+ u0\s+(\S+)", out)
        if m:
            return m.group(1)
        m = re.search(r"mResumedActivity: ActivityRecord\{\S+ u0\s+(\S+)", out)
        return m.group(1) if m else "unknown"

    def activity(self) -> str:
        """Short activity name, e.g. 'AdditionGame1Activity'."""
        top = self.top()
        return top.rsplit(".", 1)[-1] if "." in top else top

    # ------------------------------------------------------------ capture
    def dump_xml(self) -> str:
        remote = "/sdcard/rea_probe.xml"
        self.sh("shell", "uiautomator", "dump", remote)
        res = subprocess.run([ADB, "pull", remote, os.path.join(UI_DIR, "_probe.xml")],
                             capture_output=True, text=True, timeout=120)
        path = os.path.join(UI_DIR, "_probe.xml")
        if not os.path.exists(path):
            return ""
        with open(path, "rb") as fh:
            data = fh.read()
        self.sh("shell", "rm", remote)
        return data.decode("utf-8", "replace")

    @staticmethod
    def parse(xml: str) -> list[Node]:
        out: list[Node] = []
        if not xml:
            return out
        try:
            root = ET.fromstring(xml)
        except ET.ParseError:
            return out
        for el in root.iter("node"):
            b = el.get("bounds", "")
            m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", b)
            n = Node(
                cls=el.get("class", ""),
                text=el.get("text", ""),
                desc=el.get("content-desc", ""),
                rid=el.get("resource-id", "").split("/")[-1],
                package=el.get("package", ""),
                clickable=el.get("clickable", "false"),
                checked=el.get("checked", "false"),
                selected=el.get("selected", "false"),
            )
            if m:
                n.x1, n.y1, n.x2, n.y2 = (int(m.group(i)) for i in range(1, 5))
            out.append(n)
        return out

    def nodes(self) -> list[Node]:
        return self.parse(self.dump_xml())

    def screenshot(self, name: str) -> str:
        remote = f"/sdcard/rea_{name}.png"
        self.sh("shell", "screencap", "-p", remote)
        local = os.path.join(RT_DIR, f"{name}.png")
        subprocess.run([ADB, "pull", remote, local], capture_output=True, text=True,
                       timeout=180)
        self.sh("shell", "rm", remote)
        return local

    def snap(self, name: str) -> list[Node]:
        nodes = self.nodes()
        self.screenshot(name)
        if self.verbose:
            print(f"  [snap] {name}  ({len(nodes)} nodes)")
        return nodes

    # ------------------------------------------------------------- input
    def tap(self, x: int, y: int, settle: float = 0.9) -> None:
        self.sh("shell", "input", "tap", str(x), str(y))
        time.sleep(settle)

    def tap_node(self, n: Node, settle: float = 0.9) -> None:
        self.tap(n.cx, n.cy, settle)

    def tap_id(self, nodes: list[Node], rid: str, settle: float = 1.2) -> bool:
        n = self.by_id(nodes, rid)
        if not n:
            print(f"  [miss] id={rid!r}")
            return False
        print(f"  [tap ] id={rid!r} at ({n.cx},{n.cy})")
        self.tap_node(n, settle)
        return True

    def tap_text(self, nodes: list[Node], text: str, settle: float = 0.9) -> bool:
        n = self.by_text(nodes, text)
        if not n:
            print(f"  [miss] text={text!r}")
            return False
        print(f"  [tap ] {text!r} at ({n.cx},{n.cy})")
        self.tap_node(n, settle)
        return True

    def back(self, settle: float = 0.9) -> None:
        self.sh("shell", "input", "keyevent", "4")
        time.sleep(settle)

    def key(self, k: str) -> None:
        self.sh("shell", "input", "text", k)
        time.sleep(0.3)

    def scroll(self, direction: str = "up", amount: int = 600) -> None:
        w, h = 540, 1200
        if direction == "up":
            self.sh("shell", "input", "swipe", str(w), str(h), str(w), str(h - amount), "300")
        else:
            self.sh("shell", "input", "swipe", str(w), str(h - amount), str(w), str(h), "300")
        time.sleep(0.8)

    # ------------------------------------------------------------ lookup
    @staticmethod
    def by_id(nodes: list[Node], rid: str) -> Node | None:
        for n in nodes:
            if n.rid == rid:
                return n
        return None

    @staticmethod
    def by_text(nodes: list[Node], text: str) -> Node | None:
        for n in nodes:
            if n.text == text:
                return n
        return None

    @staticmethod
    def val(nodes: list[Node], rid: str, default: str = "") -> str:
        n = Rea.by_id(nodes, rid)
        return n.text if n else default

    @staticmethod
    def visible(nodes: list[Node], package: str = PACKAGE) -> list[Node]:
        return [n for n in nodes if n.package == package]

    def clear_anr(self) -> bool:
        nodes = self.nodes()
        for n in nodes:
            if "isn't responding" in n.text or "not responding" in n.text.lower():
                wait = self.by_text(nodes, "Wait")
                if wait:
                    print("  [anr ] dismissing SystemUI ANR dialog")
                    self.tap_node(wait, 1.2)
                    return True
        return False

    def ensure(self, pattern: str, max_back: int = 8) -> bool:
        for _ in range(max_back):
            if re.search(pattern, self.top()):
                return True
            self.back(0.7)
        return bool(re.search(pattern, self.top()))

    def restart_app(self) -> None:
        self.sh("shell", "am", "force-stop", PACKAGE)
        time.sleep(1.0)
        self.sh("shell", "am", "start", "-n", f"{PACKAGE}/.SplashScreenActivity")
        time.sleep(3.0)

    # ------------------------------------------------------------ report
    def describe(self, nodes: list[Node] | None = None) -> str:
        if nodes is None:
            nodes = self.nodes()
        lines = []
        for n in sorted(nodes, key=lambda n: (n.y1, n.x1)):
            if n.text or n.rid:
                lines.append(f"  ({n.x1:4},{n.y1:4}) {n.w:4}x{n.h:<4} "
                             f"{n.cls.split('.')[-1]:<12} id={n.rid:<14} "
                             f"text={n.text!r} chk={n.checked}")
        return "\n".join(lines)


# ---------------------------------------------------------------- helpers
def int_or_none(text: str) -> int | None:
    text = (text or "").strip()
    if not text:
        return None
    m = re.match(r"^-?\d+$", text)
    return int(text) if m else None


def apply_op(a: int, b: int, op: str) -> int | None:
    if op == "+":
        return a + b
    if op == "-":
        return a - b
    if op in ("x", "×", "*"):
        return a * b
    if op in ("÷", "/"):
        return a // b if b else None
    if op == "√":
        return int(round(a ** 0.5)) if a >= 0 else None
    return None


def main() -> None:
    r = Rea()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "describe"
    if cmd == "describe":
        print(f"top: {r.top()}")
        print(r.describe())
    elif cmd == "mode":
        topic = sys.argv[2]
        mode = sys.argv[3]
        from probe_mode import probe_mode
        probe_mode(r, topic, mode)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
