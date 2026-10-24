import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

W, H = 640, 360
FPS = 30
SEGMENT_S = 2.0
SCENES = ["smiley", "heart", "star"]
SS = 4
OUT = Path(__file__).resolve().parent.parent / "public" / "low-res-default.mp4"


def ease_out_circ(t):
    t = min(1.0, max(0.0, t))
    return math.sqrt(1 - (t - 1) ** 2)


def smiley(local):
    size = 300 * SS
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((10 * SS, 10 * SS, size - 10 * SS, size - 10 * SS), fill=(250, 204, 21))
    wink = 0.4 < local < 0.55
    d.ellipse((95 * SS, 95 * SS, 125 * SS, 140 * SS), fill=(30, 30, 30))
    if wink:
        d.line((170 * SS, 120 * SS, 210 * SS, 120 * SS), fill=(30, 30, 30), width=12 * SS)
    else:
        d.ellipse((175 * SS, 95 * SS, 205 * SS, 140 * SS), fill=(30, 30, 30))
    d.arc((80 * SS, 110 * SS, 220 * SS, 230 * SS), 20, 160, fill=(30, 30, 30), width=14 * SS)
    return img.resize((300, 300), Image.LANCZOS)


def heart(local):
    size = 300 * SS
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pts = []
    for i in range(200):
        a = i / 200 * math.tau
        x = 16 * math.sin(a) ** 3
        y = 13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a)
        pts.append((size / 2 + x * 8.5 * SS, size / 2 - y * 8.5 * SS - 10 * SS))
    d.polygon(pts, fill=(239, 68, 68))
    return img.resize((300, 300), Image.LANCZOS)


def star(local):
    size = 300 * SS
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pts = []
    spin = local * math.tau / 2
    for i in range(10):
        r = (140 if i % 2 == 0 else 60) * SS
        a = spin + i * math.pi / 5 - math.pi / 2
        pts.append((size / 2 + r * math.cos(a), size / 2 + r * math.sin(a)))
    d.polygon(pts, fill=(45, 212, 191))
    return img.resize((300, 300), Image.LANCZOS)


DRAW = {"smiley": smiley, "heart": heart, "star": star}


def background(t):
    img = Image.new("RGB", (W, H), (10, 13, 14))
    draw = ImageDraw.Draw(img)
    for i in range(14):
        x = (i * 53 + t * 40) % (W + 80) - 40
        y = (i * 97) % H
        r = 2 + (i % 3)
        shade = 40 + (i * 17) % 50
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(shade, shade + 20, shade + 18))
    return img


def frame(index):
    t = index / FPS
    segment = int(t // SEGMENT_S) % len(SCENES)
    local = (t % SEGMENT_S) / SEGMENT_S
    img = background(t)

    grow = ease_out_circ(local / 0.18)
    shrink = ease_out_circ((1 - local) / 0.15)
    scale = min(grow, shrink)
    name = SCENES[segment]
    if name == "heart":
        scale *= 1 + 0.12 * max(0, math.sin(local * math.pi * 6)) ** 4
    size = int(250 * scale)
    if size < 4:
        return img

    glyph = DRAW[name](local).resize((size, size), Image.LANCZOS)
    if name == "smiley":
        glyph = glyph.rotate(math.sin(local * math.tau) * 10, resample=Image.BICUBIC, expand=True)

    cx = W / 2 + (math.sin(local * math.tau) * 60 if name == "smiley" else 0)
    cy = H / 2 + math.sin(local * math.pi * 4) * 10
    img.paste(glyph, (int(cx - glyph.width / 2), int(cy - glyph.height / 2)), glyph)
    return img


def main():
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is required")
    total = int(len(SCENES) * SEGMENT_S * FPS)
    with tempfile.TemporaryDirectory() as tmp:
        for i in range(total):
            frame(i).save(Path(tmp) / f"f{i:04d}.png")
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error",
                "-framerate", str(FPS),
                "-i", str(Path(tmp) / "f%04d.png"),
                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                "-crf", "26", "-preset", "slow",
                "-movflags", "+faststart",
                str(OUT),
            ],
            check=True,
        )
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
