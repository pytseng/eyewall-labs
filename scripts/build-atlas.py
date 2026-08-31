#!/usr/bin/env python3
"""Build a single reused tile atlas.

Runtime cost is one image decode. Fidelity is secondary: cells are ~160x100
and meant to read as screens from across the storm, not as live pages.

Sources (vendored at build time, see public/media/SOURCES.md):
  - NASA stills (U.S. government public domain)
  - Wikimedia Commons public-domain paintings
  - Generated dashboard / chart / code / news layouts (not product screenshots)
"""

from __future__ import annotations

import json
import random
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "media"
CACHE = Path("/tmp/eyewall-src")
UA = "EyewallLabsAtlas/1.0 (https://github.com/pytseng/eyewall-labs; tile texture bake)"

COLS, ROWS = 8, 8
CELL_W, CELL_H = 160, 100
DRAW_W, DRAW_H = CELL_W * 2, CELL_H * 2

KIND_RANGES = {
    "video": (0, 16),
    "dashboard": (16, 28),
    "chart": (28, 38),
    "code": (38, 48),
    "screenshot": (48, 60),
    "debris": (60, 64),
}

FONT_SANS = "/usr/share/fonts/truetype/macos/Inter-Regular.ttf"
FONT_SANS_MD = "/usr/share/fonts/truetype/macos/Inter-Medium.ttf"
FONT_SANS_BD = "/usr/share/fonts/truetype/macos/Inter-Bold.ttf"
FONT_SERIF = "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf"
FONT_MONO = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf"
FONT_MONO_BD = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf"

NASA = [
    (
        "s36-39-014",
        "STS-36 night Earth observation of New York City",
        "https://images-assets.nasa.gov/image/s36-39-014/s36-39-014~small.jpg",
        "NASA/JSC",
    ),
    (
        "GSFC_20171208_Archive_e001586",
        "City Lights Illuminate the Nile",
        "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001586/GSFC_20171208_Archive_e001586~small.jpg",
        "NASA/GSFC",
    ),
    (
        "GSFC_20171208_Archive_e001638",
        "City Lights of South America’s Atlantic Coast",
        "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001638/GSFC_20171208_Archive_e001638~small.jpg",
        "NASA/GSFC",
    ),
    (
        "iss040e091208",
        "Earth Observation from ISS",
        "https://images-assets.nasa.gov/image/iss040e091208/iss040e091208~small.jpg",
        "NASA/JSC",
    ),
    (
        "GSFC_20171208_Archive_e001464",
        "Hubble reveals the Ring Nebula’s true shape",
        "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001464/GSFC_20171208_Archive_e001464~small.jpg",
        "NASA/ESA/Hubble",
    ),
    (
        "GSFC_20171208_Archive_e001955",
        "Hubble reveals heart of Lagoon Nebula",
        "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001955/GSFC_20171208_Archive_e001955~small.jpg",
        "NASA/ESA/Hubble",
    ),
    (
        "GSFC_20171208_Archive_e000699",
        "Hubble View of a Nitrogen-Rich Nebula",
        "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000699/GSFC_20171208_Archive_e000699~small.jpg",
        "NASA/ESA/Hubble",
    ),
    (
        "PIA03606",
        "Most Detailed Image of the Crab Nebula",
        "https://images-assets.nasa.gov/image/PIA03606/PIA03606~small.jpg",
        "NASA/JPL/ESA/Hubble",
    ),
    (
        "carina_nebula",
        "JWST NIRCam Cosmic Cliffs in Carina Nebula",
        "https://images-assets.nasa.gov/image/carina_nebula/carina_nebula~small.jpg",
        "NASA/ESA/CSA/STScI",
    ),
    (
        "PIA24433",
        "Aurorae on Jupiter and Earth",
        "https://images-assets.nasa.gov/image/PIA24433/PIA24433~small.jpg",
        "NASA/JPL",
    ),
    (
        "GSFC_20171208_Archive_e001386",
        "Blue Marble 2012",
        "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001386/GSFC_20171208_Archive_e001386~small.jpg",
        "NASA/GSFC",
    ),
    (
        "PIA18033",
        "Earth",
        "https://images-assets.nasa.gov/image/PIA18033/PIA18033~small.jpg",
        "NASA/JPL",
    ),
    (
        "iss042e099123",
        "ISS observation",
        "https://images-assets.nasa.gov/image/iss042e099123/iss042e099123~small.jpg",
        "NASA/JSC",
    ),
]

WIKI = [
    (
        "starry-night",
        "Vincent van Gogh, The Starry Night (1889)",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/330px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
        "Public domain / Wikimedia Commons",
    ),
    (
        "great-wave",
        "Hokusai, The Great Wave off Kanagawa",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/330px-The_Great_Wave_off_Kanagawa.jpg",
        "Public domain / Wikimedia Commons",
    ),
    (
        "impression-sunrise",
        "Claude Monet, Impression, Sunrise (1872)",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/330px-Monet_-_Impression%2C_Sunrise.jpg",
        "Public domain / Wikimedia Commons",
    ),
    (
        "water-lilies",
        "Claude Monet, Water Lilies (1906)",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/330px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
        "Public domain / Wikimedia Commons",
    ),
    (
        "cafe-terrace",
        "Vincent van Gogh, Café Terrace at Night (1888)",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Vincent_Willem_van_Gogh_-_Cafe_Terrace_at_Night_%28Yorck%29.jpg/330px-Vincent_Willem_van_Gogh_-_Cafe_Terrace_at_Night_%28Yorck%29.jpg",
        "Public domain / Wikimedia Commons",
    ),
    (
        "wanderer",
        "Caspar David Friedrich, Wanderer above the Sea of Fog",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/330px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
        "Public domain / Wikimedia Commons",
    ),
    (
        "red-fuji",
        "Hokusai, Fine Wind, Clear Morning (Red Fuji)",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Red_Fuji_southern_wind_clear_morning.jpg/330px-Red_Fuji_southern_wind_clear_morning.jpg",
        "Public domain / Wikimedia Commons",
    ),
    (
        "scream",
        "Edvard Munch, The Scream (1893)",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/330px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
        "Public domain / Wikimedia Commons",
    ),
]


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def fetch(url: str, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 800:
        return dest
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as res:
        dest.write_bytes(res.read())
    return dest


def open_rgb(path: Path) -> Image.Image:
    im = Image.open(path)
    if im.mode in ("RGBA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (12, 12, 12))
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert("RGB")


def cover(im: Image.Image, w: int, h: int, rng: random.Random | None = None) -> Image.Image:
    scale = max(w / im.width, h / im.height)
    nw, nh = max(1, int(im.width * scale)), max(1, int(im.height * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    if rng is None:
        left = (nw - w) // 2
        top = (nh - h) // 2
    else:
        left = rng.randint(0, max(0, nw - w))
        top = rng.randint(0, max(0, nh - h))
    return im.crop((left, top, left + w, top + h))


def letterbox(photo: Image.Image) -> Image.Image:
    canvas = Image.new("RGB", (DRAW_W, DRAW_H), (6, 6, 8))
    inner = cover(photo, DRAW_W, int(DRAW_H * 0.78))
    canvas.paste(inner, (0, (DRAW_H - inner.height) // 2))
    d = ImageDraw.Draw(canvas)
    d.rectangle((0, 0, DRAW_W, 14), fill=(8, 8, 10))
    d.rectangle((0, DRAW_H - 14, DRAW_W, DRAW_H), fill=(8, 8, 10))
    d.ellipse((DRAW_W - 28, 6, DRAW_W - 16, 18), fill=(220, 70, 70))
    return canvas


def rr(d: ImageDraw.ImageDraw, box, fill, radius=8):
    d.rounded_rectangle(box, radius=radius, fill=fill)


def text(d: ImageDraw.ImageDraw, xy, s, f, fill):
    d.text(xy, s, font=f, fill=fill)


def sparkline(d: ImageDraw.ImageDraw, x, y, w, h, rng: random.Random, color):
    pts = []
    n = 10
    for i in range(n):
        px = x + i * w / (n - 1)
        py = y + h * (0.2 + 0.7 * rng.random())
        pts.append((px, py))
    d.line(pts, fill=color, width=3)
    d.ellipse((pts[-1][0] - 3, pts[-1][1] - 3, pts[-1][0] + 3, pts[-1][1] + 3), fill=color)


def draw_dashboard(rng: random.Random, variant: int) -> Image.Image:
    dark = variant % 2 == 0
    bg = (14, 16, 22) if dark else (236, 238, 242)
    card = (28, 32, 44) if dark else (255, 255, 255)
    mute = (90, 98, 118) if dark else (150, 156, 168)
    ink = (230, 234, 242) if dark else (22, 24, 30)
    accents = [(80, 200, 255), (120, 255, 180), (255, 196, 80), (255, 110, 160)]
    im = Image.new("RGB", (DRAW_W, DRAW_H), bg)
    d = ImageDraw.Draw(im)
    # sidebar
    d.rectangle((0, 0, 36, DRAW_H), fill=(10, 12, 18) if dark else (28, 32, 40))
    for i, c in enumerate(accents):
        yy = 18 + i * 28
        d.rounded_rectangle((8, yy, 28, yy + 16), 4, fill=c)
    # cards
    f_sm = font(FONT_SANS, 13)
    f_bd = font(FONT_SANS_BD, 22)
    metrics = ["1.2M", "98.4", "4.8k", "12ms"]
    labels = ["users", "uptime", "jobs", "p95"]
    for i in range(4):
        x = 48 + (i % 2) * 136
        y = 12 + (i // 2) * 70
        rr(d, (x, y, x + 124, y + 62), card, 8)
        text(d, (x + 10, y + 8), labels[i], f_sm, mute)
        text(d, (x + 10, y + 26), metrics[(i + variant) % 4], f_bd, ink)
        sparkline(d, x + 70, y + 28, 44, 24, rng, accents[i])
    # bottom chart
    bx, by, bw, bh = 48, 154, 260, 36
    rr(d, (bx, by, bx + bw, by + bh), card, 8)
    bars = 12
    for i in range(bars):
        h = 6 + int(rng.random() * 24)
        x = bx + 8 + i * 20
        d.rectangle((x, by + bh - 6 - h, x + 12, by + bh - 6), fill=accents[i % 4])
    return im


def draw_chart(rng: random.Random, variant: int) -> Image.Image:
    styles = ["bars", "line", "donut", "area", "heatmap"]
    style = styles[variant % len(styles)]
    bg = (12, 14, 20)
    im = Image.new("RGB", (DRAW_W, DRAW_H), bg)
    d = ImageDraw.Draw(im)
    rr(d, (10, 10, DRAW_W - 10, DRAW_H - 10), (22, 26, 36), 12)
    title = ["latency", "revenue", "errors", "traffic", "gpu"][variant % 5]
    text(d, (24, 18), title, font(FONT_SANS_MD, 16), (180, 190, 210))
    palette = [(70, 210, 255), (255, 170, 70), (140, 255, 170), (255, 90, 140)]
    if style == "bars":
        for i in range(8):
            h = 30 + int(rng.random() * 110)
            x = 28 + i * 36
            d.rectangle((x, 178 - h, x + 24, 178), fill=palette[i % 4])
    elif style == "line" or style == "area":
        pts = []
        for i in range(12):
            pts.append((28 + i * 24, 50 + rng.random() * 120))
        if style == "area":
            d.polygon(pts + [(pts[-1][0], 178), (pts[0][0], 178)], fill=(70, 210, 255, ))
            # pillow polygon doesn't take alpha on RGB; overlay
            overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
            od = ImageDraw.Draw(overlay)
            od.polygon(pts + [(pts[-1][0], 178), (pts[0][0], 178)], fill=(70, 210, 255, 70))
            im.paste(Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB"))
            d = ImageDraw.Draw(im)
        d.line(pts, fill=palette[0], width=4)
    elif style == "donut":
        bbox = (90, 40, 230, 180)
        d.ellipse(bbox, fill=palette[0])
        d.pieslice(bbox, 0, 110, fill=palette[1])
        d.pieslice(bbox, 110, 200, fill=palette[2])
        d.ellipse((125, 75, 195, 145), fill=(22, 26, 36))
    else:
        for r in range(5):
            for c in range(10):
                v = rng.random()
                col = (int(20 + 40 * v), int(40 + 180 * v), int(80 + 140 * v))
                x = 28 + c * 28
                y = 48 + r * 26
                d.rectangle((x, y, x + 24, y + 22), fill=col)
    return im


CODE_LINES = [
    ("fn", "  spin(dt: f32) {", (80, 170, 255)),
    ("cm", "  // eyewall peak", (90, 140, 90)),
    ("kw", "  const w = omega(r);", (220, 180, 90)),
    ("st", '  tile.theta -= w * dt;', (200, 140, 255)),
    ("nm", "  return project(tile);", (120, 220, 200)),
    ("fn", "export function pack() {", (80, 170, 255)),
    ("cm", "  /* atlas cell */", (90, 140, 90)),
    ("kw", "  let slot = hash(id);", (220, 180, 90)),
    ("st", '  fetch("/media/atlas.webp")', (210, 150, 110)),
    ("nm", "  .then(decodeImage);", (120, 220, 200)),
]


def draw_code(rng: random.Random, variant: int) -> Image.Image:
    themes = [
        ((18, 18, 22), (30, 30, 36)),  # dark
        ((12, 16, 14), (20, 28, 24)),  # terminal green
        ((28, 24, 18), (40, 34, 26)),  # warm
        ((16, 18, 32), (24, 28, 48)),  # navy
    ]
    bg, gutter = themes[variant % len(themes)]
    im = Image.new("RGB", (DRAW_W, DRAW_H), bg)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 42, DRAW_H), fill=gutter)
    d.rectangle((0, 0, DRAW_W, 22), fill=(40, 42, 50))
    for i, c in enumerate([(255, 95, 87), (255, 189, 46), (39, 201, 63)]):
        d.ellipse((10 + i * 16, 6, 20 + i * 16, 16), fill=c)
    text(d, (70, 4), ["omega.ts", "atlas.py", "Tile.tsx", "spin.rs"][variant % 4], font(FONT_MONO, 13), (180, 184, 196))
    f = font(FONT_MONO, 13)
    start = variant % (len(CODE_LINES) - 6)
    for i in range(8):
        line = CODE_LINES[(start + i) % len(CODE_LINES)]
        y = 32 + i * 20
        text(d, (10, y), f"{i + 12}", font(FONT_MONO, 12), (80, 84, 96))
        text(d, (50, y), line[1][:28], f, line[2])
    if variant % 3 == 0:
        # cursor bar
        d.rectangle((50, 52, 54, 68), fill=(80, 200, 255))
    return im


NEWS = [
    ("THE SIGNAL", "Models ship weekly now", True),
    ("WIRE CUT", "A quieter interface wins", True),
    ("ORB DAILY", "Eyewall season, visualized", False),
    ("STACK", "Why tiles beat iframes", True),
    ("NIGHTLY", "Latency is a design tool", False),
    ("PULSE", "Open weights, closed loops", True),
]


def draw_news(photo: Image.Image, variant: int) -> Image.Image:
    name, headline, dark = NEWS[variant % len(NEWS)]
    bg = (12, 12, 14) if dark else (246, 244, 238)
    ink = (240, 240, 242) if dark else (18, 18, 20)
    mute = (140, 144, 150) if dark else (90, 90, 90)
    accent = (220, 40, 40) if dark else (180, 20, 20)
    im = Image.new("RGB", (DRAW_W, DRAW_H), bg)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, DRAW_W, 28), fill=(8, 8, 8) if dark else (20, 20, 20))
    text(d, (12, 6), name, font(FONT_SANS_BD, 14), (255, 255, 255))
    d.rectangle((DRAW_W - 80, 10, DRAW_W - 12, 18), fill=accent)
    # hero
    hero = cover(photo, DRAW_W, 88)
    im.paste(hero, (0, 28))
    d = ImageDraw.Draw(im)
    words = headline.upper()
    text(d, (12, 122), words[:22], font(FONT_SERIF, 18), ink)
    # columns
    for col in range(3):
        x = 12 + col * 104
        for row in range(4):
            wlen = 70 + (row * 7 + col * 11) % 28
            y = 148 + row * 12
            d.rectangle((x, y, x + wlen, y + 6), fill=mute)
    return im


def draw_browser_ui(photo: Image.Image, variant: int) -> Image.Image:
    im = Image.new("RGB", (DRAW_W, DRAW_H), (32, 34, 40))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, DRAW_W, 28), fill=(46, 48, 56))
    for i, c in enumerate([(255, 95, 87), (255, 189, 46), (39, 201, 63)]):
        d.ellipse((10 + i * 16, 8, 20 + i * 16, 18), fill=c)
    rr(d, (70, 6, 300, 22), (28, 30, 36), 8)
    hosts = ["maps.local", "studio.local", "lab.local", "news.local"]
    text(d, (82, 7), hosts[variant % 4], font(FONT_SANS, 12), (170, 174, 184))
    body = cover(photo, DRAW_W, DRAW_H - 28)
    im.paste(body, (0, 28))
    # fake floating panel
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((18, 50, 150, 170), 10, fill=(16, 18, 24, 210))
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(im)
    for i in range(4):
        d.rectangle((30, 64 + i * 24, 138, 76 + i * 24), fill=(70, 80, 96))
    return im


def draw_debris(photo: Image.Image, rng: random.Random) -> Image.Image:
    im = cover(photo, DRAW_W, DRAW_H, rng)
    im = ImageEnhance.Contrast(im).enhance(1.6)
    im = ImageEnhance.Color(im).enhance(0.55)
    im = ImageOps.posterize(im, 5)
    # hard crop fragment
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, DRAW_W, 8), fill=(0, 0, 0))
    d.rectangle((DRAW_W - 10, 0, DRAW_W, DRAW_H), fill=(0, 0, 0))
    return im.filter(ImageFilter.SHARPEN)


def down(im: Image.Image) -> Image.Image:
    return im.resize((CELL_W, CELL_H), Image.Resampling.LANCZOS)


def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    credits: list[dict] = []
    photos: list[Image.Image] = []

    print("fetching NASA + Wikimedia stills…")
    for kind, bucket in (("nasa", NASA), ("wikimedia", WIKI)):
        for key, title, url, credit in bucket:
            dest = CACHE / f"{kind}-{key}.jpg"
            try:
                fetch(url, dest)
                photos.append(open_rgb(dest))
                credits.append(
                    {"id": key, "title": title, "source": credit, "url": url, "kind": kind}
                )
                print("  ok", key)
            except Exception as exc:
                print("  FAIL", key, exc)

    if len(photos) < 8:
        raise SystemExit(f"not enough source photos ({len(photos)})")

    atlas = Image.new("RGB", (COLS * CELL_W, ROWS * CELL_H), (8, 8, 8))
    cells: list[dict] = []
    rng = random.Random(7)

    def put(index: int, im: Image.Image, kind: str, label: str) -> None:
        col, row = index % COLS, index // COLS
        atlas.paste(down(im), (col * CELL_W, row * CELL_H))
        cells.append({"i": index, "kind": kind, "label": label})

    # video: cinematic stills with letterbox
    for i in range(16):
        photo = photos[i % len(photos)]
        put(i, letterbox(photo), "video", f"still-{i}")

    # dashboards
    for i, idx in enumerate(range(16, 28)):
        put(idx, draw_dashboard(rng, i), "dashboard", f"dash-{i}")

    # charts
    for i, idx in enumerate(range(28, 38)):
        put(idx, draw_chart(rng, i), "chart", f"chart-{i}")

    # code
    for i, idx in enumerate(range(38, 48)):
        put(idx, draw_code(rng, i), "code", f"code-{i}")

    # screenshots: news + browser chrome over photos
    for i, idx in enumerate(range(48, 60)):
        photo = photos[(i * 3) % len(photos)]
        if i % 2 == 0:
            put(idx, draw_news(photo, i), "screenshot", f"news-{i}")
        else:
            put(idx, draw_browser_ui(photo, i), "screenshot", f"ui-{i}")

    # debris
    for i, idx in enumerate(range(60, 64)):
        put(idx, draw_debris(photos[(i + 4) % len(photos)], rng), "debris", f"debris-{i}")

    webp = OUT_DIR / "atlas.webp"
    jpg = OUT_DIR / "atlas.jpg"
    atlas.save(webp, "WEBP", quality=72, method=6)
    atlas.save(jpg, "JPEG", quality=78, optimize=True)
    manifest = {
        "cols": COLS,
        "rows": ROWS,
        "cellW": CELL_W,
        "cellH": CELL_H,
        "file": "atlas.webp",
        "fallback": "atlas.jpg",
        "kinds": {k: {"start": a, "count": b - a} for k, (a, b) in KIND_RANGES.items()},
        "credits": credits,
    }
    (OUT_DIR / "atlas.json").write_text(json.dumps(manifest, indent=2) + "\n")

    sources = [
        "# Tile media sources",
        "",
        "Tiles share **one** atlas (`atlas.webp`). Nothing is fetched live at runtime.",
        "Product UIs are drawn, not captured. News pages are fake mastheads over public-domain stills.",
        "",
        "## Still photography / painting",
        "",
    ]
    for c in credits:
        sources.append(f"- **{c['title']}** — {c['source']} — `{c['url']}`")
    sources += [
        "",
        "## Generated (this repo)",
        "",
        "- Dashboards, charts, code editors, terminal chrome, and news layouts in `scripts/build-atlas.py`.",
        "",
        "Rebuild with `python3 scripts/build-atlas.py`.",
        "",
    ]
    (OUT_DIR / "SOURCES.md").write_text("\n".join(sources))
    print(f"wrote {webp} ({webp.stat().st_size} bytes) and {jpg} ({jpg.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
