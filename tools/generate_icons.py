"""Generate the two PWA icons without external image dependencies."""

from pathlib import Path
import math
import struct
import zlib

OUT = Path(__file__).resolve().parent.parent / "dist"
BG = (10, 21, 37)
BODY = (220, 247, 251)
CYAN = (82, 231, 229)
ORANGE = (245, 165, 96)


def line_distance(x, y, x1, y1, x2, y2):
    dx, dy = x2 - x1, y2 - y1
    t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
    return math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))


STROKES = [
    (95, 72, 95, 128, 9, BODY),
    (95, 91, 66, 114, 9, BODY),
    (95, 91, 130, 102, 9, BODY),
    (95, 128, 66, 170, 9, BODY),
    (95, 128, 124, 170, 9, BODY),
    (122, 99, 158, 87, 9, CYAN),
    (160, 87, 182, 87, 6, ORANGE),
]


def sample(x, y):
    radius = 42
    cx = min(max(x, radius), 192 - radius)
    cy = min(max(y, radius), 192 - radius)
    if math.hypot(x - cx, y - cy) > radius:
        return (0, 0, 0, 0)
    color = (*BG, 255)
    if abs(math.hypot(x - 95, y - 51) - 17) <= 4.5:
        color = (*BODY, 255)
    for x1, y1, x2, y2, width, stroke_color in STROKES:
        if line_distance(x, y, x1, y1, x2, y2) <= width / 2:
            color = (*stroke_color, 255)
    return color


def png_chunk(kind, data):
    payload = kind + data
    return struct.pack(">I", len(data)) + payload + struct.pack(">I", zlib.crc32(payload) & 0xFFFFFFFF)


def render(size):
    rows = bytearray()
    for py in range(size):
        rows.append(0)
        for px in range(size):
            samples = [sample((px + sx) * 192 / size, (py + sy) * 192 / size)
                       for sx, sy in ((.25, .25), (.75, .25), (.25, .75), (.75, .75))]
            rows.extend(round(sum(pixel[channel] for pixel in samples) / 4) for channel in range(4))
    header = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    output = header + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", zlib.compress(bytes(rows), 9)) + png_chunk(b"IEND", b"")
    (OUT / f"icon-{size}.png").write_bytes(output)


if __name__ == "__main__":
    for icon_size in (192, 512):
        render(icon_size)
