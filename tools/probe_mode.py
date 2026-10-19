"""probe_mode.py - behavioural probe for one arithmetic mode of the reference APK.

Enters a mode, reads the question state from the uiautomator hierarchy,
derives the correct answer, and records how the app reacts to a wrong tap
and to a correct tap (counters, background, progression).

The eight arithmetic modes do not share a layout, so the reader is written
against the observed per-mode id layout:

  Practice (Game1) n1 sgn n2 eql ans          + opt1..opt4
  Quiz     (Game2) n1 sgn n2('?') eql ans     + opt1..opt4
  Duel     (Game3) n1..ans and n11..ans1     + opt1..opt4 / opt11..opt41
  Play     (Game4) n1..ans3, n11..ans1, ...  + key0..key9 (on-screen keypad)
  Test     (Game5) n1 sgn n2 eql ans          + True/False (opt11/opt21)
  Time     (Game6) n1 sgn n2 eql ans          + True/False
  Learn    (Game7) column addition + keypad   + digit-count checkboxes
  Hard     (Game8/9) TBD

Evidence is written to research/observations/runtime/ as screenshots plus
UI hierarchy XMLs, so every claim can be re-checked later.
"""

from __future__ import annotations

import re
import sys
import time

from rea import Node, Rea, apply_op, int_or_none

GROUP_SUFFIXES = ["", "1", "2", "3"]


class Question:
    """One equation slot on the screen."""

    def __init__(self, suffix: str):
        self.suffix = suffix
        self.n1 = ""
        self.sgn = ""
        self.n2 = ""
        self.eql = ""
        self.ans = ""
        self.options: dict[str, str] = {}
        self.option_nodes: dict[str, Node] = {}

    @property
    def label(self) -> str:
        return f"[{self.suffix or '-'}] {self.n1} {self.sgn} {self.n2} {self.eql} {self.ans}"

    def missing_operand(self) -> bool:
        return self.n2.strip() in ("?", "")

    def missing_result(self) -> bool:
        return self.ans.strip() in ("?", "")

    def expected(self) -> int | None:
        a = int_or_none(self.n1)
        b = int_or_none(self.n2)
        r = int_or_none(self.ans)
        op = self.sgn.strip()
        if a is None:
            return None
        if self.missing_operand():
            if r is None:
                return None
            if op == "+":
                return r - a
            if op == "-":
                return a - r
            if op in ("x", "×", "*"):
                return r // a if a else None
            if op in ("÷", "/"):
                return a // r if r else None
            return None
        if b is None:
            return None
        if self.missing_result():
            return apply_op(a, b, op)
        return None


def collect_options(nodes: list[Node], suffix: str) -> tuple[dict[str, str], dict[str, Node]]:
    """Options opt1..opt4 for a group; the app nests the label under a
    *N-suffixed id in some modes (opt11/opt21 for True/False)."""
    opts: dict[str, str] = {}
    nodes_by_id: dict[str, Node] = {}
    for n in nodes:
        if not re.fullmatch(r"opt\d+" + re.escape(suffix), n.rid or ""):
            continue
        nodes_by_id[n.rid] = n
    for i in (1, 2, 3, 4):
        nid = f"opt{i}{suffix}"
        n = nodes_by_id.get(nid)
        if not n:
            continue
        if n.text:
            opts[nid] = n.text
            continue
        # label lives in a nested view: opt11 / opt21 / ...
        for cand in (f"opt{i}1", f"opt{i}2", f"opt{i}3", f"opt{i}4"):
            c = nodes_by_id.get(cand)
            if c and c.text:
                opts[nid] = c.text
                nodes_by_id[nid] = c
                break
    return opts, nodes_by_id


def read_questions(nodes: list[Node]) -> list[Question]:
    qs: list[Question] = []
    for suf in GROUP_SUFFIXES:
        n1 = Rea.val(nodes, f"n1{suf}")
        sgn = Rea.val(nodes, f"sgn{suf}")
        n2 = Rea.val(nodes, f"n2{suf}")
        eql = Rea.val(nodes, f"eql{suf}")
        ans = Rea.val(nodes, f"ans{suf}")
        opts, opt_nodes = collect_options(nodes, suf)
        if not (n1 or n2 or ans or opts):
            continue
        q = Question(suf)
        q.n1, q.sgn, q.n2, q.eql, q.ans = n1, sgn, n2, eql, ans
        q.options, q.option_nodes = opts, opt_nodes
        qs.append(q)
    return qs


def counters(nodes: list[Node]) -> str:
    def g(rid: str) -> str:
        v = Rea.val(nodes, rid)
        return v if v else "-"
    return (f"qno={g('qno')} {g('question')} "
            f"right1={g('right1')} wrong1={g('wrong1')} "
            f"right11={g('right11')} wrong11={g('wrong11')}")


def enter_mode(r: Rea, topic: str, mode: str) -> list[Node]:
    """Open the topic and tap the given mode tile."""
    if not r.ensure(f"{topic}Activity"):
        if not r.ensure("MainActivity"):
            print("  [note] back navigation stuck - restarting the app")
            r.restart_app()
            time.sleep(12.0)   # splash animation + tile fade-in
            r.ensure("MainActivity")
        nodes = r.nodes()
        for _ in range(10):
            if Rea.by_id(nodes, topic):
                break
            time.sleep(1.0)
            nodes = r.nodes()
        r.tap_id(nodes, topic, settle=1.5)
        time.sleep(1.2)
    r.clear_anr()
    nodes = r.nodes()
    label = None
    for n in nodes:
        if n.text == mode:
            label = n
            break
    if label is None:
        print(f"  [miss] mode label {mode!r} not found")
        return []
    print(f"  [tap ] mode {mode!r} at ({label.cx},{label.cy})")
    r.tap_node(label, settle=1.6)
    r.clear_anr()
    return r.nodes()


def tap_value(r: Rea, q: Question, value: int, tag: str) -> bool:
    for nid, text in q.options.items():
        v = int_or_none(text)
        if v is not None and v == value:
            n = q.option_nodes[nid]
            print(f"  [tap ] {tag} {nid}={text} at ({n.cx},{n.cy})")
            r.tap_node(n, settle=1.0)
            return True
    print(f"  [miss] no option equals {value} (options={q.options})")
    return False


def probe_mode(r: Rea, topic: str, mode: str) -> None:
    print("=" * 74)
    print(f"  PROBE mode={mode!r} topic={topic!r}")
    print("=" * 74)

    nodes = enter_mode(r, topic, mode)
    print(f"  [top ] {r.top()}")
    r.snap(f"m2-probe-{topic}-{mode.lower()}-entry")
    print(r.describe(nodes))

    slug = f"{topic}-{mode.lower()}"
    qs = read_questions(nodes)

    # ---- True/False modes (Test, Time) -------------------------------
    base = next((q for q in qs if q.suffix == ""), None)
    tf = [(n.rid, n.text) for n in nodes
          if re.fullmatch(r"opt\d+", n.rid or "") and n.text in ("True", "False")]
    if tf and base is not None:
        a, b = int_or_none(base.n1), int_or_none(base.n2)
        r_val = int_or_none(base.ans)
        truth = apply_op(a, b, base.sgn.strip()) if (a is not None and b is not None) else None
        is_true = (truth == r_val)
        print(f"  [calc] {base.label} -> {a} {base.sgn} {b} = {truth} "
              f"vs shown {r_val} -> statement is {'TRUE' if is_true else 'FALSE'}")
        correct = "True" if is_true else "False"
        wrong = "False" if correct == "True" else "True"

        for nid, text in tf:
            if text == wrong:
                n = Rea.by_id(nodes, nid)
                print(f"  [tap ] DELIBERATELY WRONG {nid}={text}")
                r.tap_node(n, settle=1.3)
                break
        aw = r.snap(f"m2-probe-{slug}-wrong")
        print(f"  [cnt ] after wrong tap: {counters(aw)}")
        print(f"  [qst ] {base.label}")

        # Re-read: the question may have advanced, so recompute.
        nodes2 = aw
        base2 = next((q for q in read_questions(nodes2) if q.suffix == ""), base)
        a2, b2 = int_or_none(base2.n1), int_or_none(base2.n2)
        r2 = int_or_none(base2.ans)
        t2 = apply_op(a2, b2, base2.sgn.strip()) if (a2 is not None and b2 is not None) else None
        correct2 = "True" if t2 == r2 else "False"
        print(f"  [calc2] {base2.label} -> {t2} vs {r2} -> {correct2}")
        for nid, text in [(n.rid, n.text) for n in nodes2
                          if re.fullmatch(r"opt\d+", n.rid or "") and n.text in ("True", "False")]:
            if text == correct2:
                n = Rea.by_id(nodes2, nid)
                print(f"  [tap ] CORRECT {nid}={text}")
                r.tap_node(n, settle=1.3)
                break
        ar = r.snap(f"m2-probe-{slug}-correct")
        print(f"  [cnt ] after correct tap: {counters(ar)}")
        print(f"  [top ] {r.top()}")
        return

    # ---- Option modes (Practice, Quiz, Duel) ------------------------
    if qs:
        for q in qs:
            exp = q.expected()
            print(f"  [calc] {q.label} -> expected {exp}   options={q.options}")
            if exp is None:
                continue
            vals = [int_or_none(t) for t in q.options.values()]
            wrong_vals = [v for v in vals if v is not None and v != exp]
            if wrong_vals:
                target = wrong_vals[0]
                for nid, text in q.options.items():
                    if int_or_none(text) == target:
                        n = q.option_nodes[nid]
                        print(f"  [tap ] DELIBERATELY WRONG {nid}={text}")
                        r.tap_node(n, settle=1.3)
                        break
                aw = r.snap(f"m2-probe-{slug}-wrong")
                print(f"  [cnt ] after wrong tap: {counters(aw)}")
            tap_value(r, q, exp, "CORRECT")
            ar = r.snap(f"m2-probe-{slug}-correct")
            print(f"  [cnt ] after correct tap: {counters(ar)}")
        print(f"  [top ] {r.top()}")
        return

    # ---- Anything else (setup screens, keypad modes) ------------------
    print("  [note] no equation group detected - capturing the screen only")
    print(f"  [top ] {r.top()}")


if __name__ == "__main__":
    r = Rea()
    probe_mode(r, sys.argv[1], sys.argv[2])
