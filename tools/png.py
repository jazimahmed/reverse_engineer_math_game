"""png.py - minimal PNG reader (8-bit, non-interlaced, RGB/RGBA/grey).

`adb shell screencap -p` produces exactly this format, so a dependency-free
reader is enough to sample the reference app's colours from the captured
screenshots.
"""

from __future__ import annotations

import struct
import zlib


class Png:
    def __init__(self, width: int, height: int, pixels: bytearray):
        self.width = width
        self.height = height
        self.pixels = pixels  # RGB, 3 bytes per pixel

    def pixel(self, x: int, y: int) -> tuple[int, int, int]:
        x = max(0, min(self.width - 1, x))
        y = max(0, min(self.height - 1, y))
        i = (y * self.width + x) * 3
        return (self.pixels[i], self.pixels[i + 1], self.pixels[i + 2])

    def hex_at(self, x: int, y: int) -> str:
        r, g, b = self.pixel(x, y)
        return f"#{r:02X}{g:02X}{b:02X}"

    def row_colors(self, y: int, x0: int, x1: int, step: int = 1) -> list[tuple[int, int, int]]:
        return [self.pixel(x, y) for x in range(x0, x1, step)]


def _paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def read(path: str) -> Png:
    with open(path, "rb") as fh:
        data = fh.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a PNG")
    pos = 8
    idat = bytearray()
    width = height = bitdepth = colortype = 0
    interlace = 0
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos:pos + 4])
        ctype = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if ctype == b"IHDR":
            width, height, bitdepth, colortype, _, _, interlace = struct.unpack(">IIBBBBB", chunk)
        elif ctype == b"IDAT":
            idat += chunk
        elif ctype == b"IEND":
            break
    if bitdepth != 8 or interlace != 0:
        raise ValueError(f"unsupported PNG: depth={bitdepth} interlace={interlace}")
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[colortype]
    raw = zlib.decompress(bytes(idat))
    stride = width * channels
    out = bytearray(height * stride)
    prev = bytearray(stride)
    p = 0
    for y in range(height):
        f = raw[p]
        p += 1
        line = bytearray(raw[p:p + stride])
        p += stride
        if f == 1:
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 0xFF
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif f == 3:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif f == 4:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                c = prev[i - channels] if i >= channels else 0
                line[i] = (line[i] + _paeth(a, prev[i], c)) & 0xFF
        out[y * stride:(y + 1) * stride] = line
        prev = line
    # normalise to RGB
    rgb = bytearray(width * height * 3)
    if channels == 3:
        rgb = out
    elif channels == 4:
        for i in range(width * height):
            rgb[i * 3:i * 3 + 3] = out[i * 4:i * 4 + 3]
    elif channels == 1:
        for i in range(width * height):
            v = out[i]
            rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = v
    return Png(width, height, rgb)
