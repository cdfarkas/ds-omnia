"""Omnia pixel icon set: 16x16 grid, 2px blocks, currentColor, regular and solid styles."""
import copy, math, pathlib, sys

N = 16
OUT = pathlib.Path(sys.argv[1])


class G:
    def __init__(self):
        self.p = [[0] * N for _ in range(N)]

    def set(self, x, y, v=1):
        if 0 <= x < N and 0 <= y < N:
            self.p[y][x] = v

    def R(self, x0, y0, x1, y1, v=1):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.set(x, y, v)
        return self

    def E(self, *a):
        return self.R(*a, v=0)

    def disk(self, cx, cy, r, v=1):
        for y in range(N):
            for x in range(N):
                if (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r:
                    self.set(x, y, v)
        return self

    def ring(self, cx, cy, ro, ri, v=1):
        for y in range(N):
            for x in range(N):
                d = (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2
                if ri * ri < d <= ro * ro:
                    self.set(x, y, v)
        return self

    def diag(self, x0, y0, x1, y1, w=2, v=1):
        # one run of w pixels per row, stepping x linearly
        step = 1 if y1 >= y0 else -1
        n = abs(y1 - y0)
        for i in range(n + 1):
            y = y0 + i * step
            x = round(x0 + (x1 - x0) * i / n) if n else x0
            for k in range(w):
                self.set(x + k, y, v)
        return self

    def art(self, rows, v=1):
        assert len(rows) == N, len(rows)
        for y, row in enumerate(rows):
            assert len(row) == N, (y, row, len(row))
            for x, c in enumerate(row):
                if c == "#":
                    self.set(x, y, v)
        return self

    def mirror(self):
        self.p = [row[::-1] for row in self.p]
        return self

    def flip(self):
        self.p = self.p[::-1]
        return self

    def rot_cw(self):
        self.p = [[self.p[N - 1 - x][y] for x in range(N)] for y in range(N)]
        return self

    def shift(self, dy):
        blank = [[0] * N for _ in range(abs(dy))]
        self.p = (self.p[dy:] + blank) if dy > 0 else (blank + self.p[:dy])
        return self

    def where(self, f, v=1):
        for y in range(N):
            for x in range(N):
                if f(x, y):
                    self.set(x, y, v)
        return self

    def svg(self):
        d = []
        for y, row in enumerate(self.p):
            x = 0
            while x < N:
                if row[x]:
                    s = x
                    while x < N and row[x]:
                        x += 1
                    d.append(f"M{s} {y}h{x - s}v1h-{x - s}z")
                else:
                    x += 1
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {N} {N}" '
            f'fill="currentColor" shape-rendering="crispEdges"><path d="{"".join(d)}"/></svg>'
        )


def pad(rows):
    """Center-pad a short list of 16-char rows to 16 rows."""
    top = (N - len(rows)) // 2
    return ["." * N] * top + rows + ["." * N] * (N - len(rows) - top)


CLOSE = pad([
    "..##........##..",
    "..###......###..",
    "...###....###...",
    "....###..###....",
    ".....######.....",
    "......####......",
    "......####......",
    ".....######.....",
    "....###..###....",
    "...###....###...",
    "..###......###..",
    "..##........##..",
])
CHECK = pad([
    "............##..",
    "...........###..",
    "..........###...",
    ".........###....",
    "..##....###.....",
    "..###..###......",
    "...######.......",
    "....####........",
    ".....##.........",
])
CHEVRON_DOWN = pad([
    "..##........##..",
    "..###......###..",
    "...###....###...",
    "....###..###....",
    ".....######.....",
    "......####......",
    ".......##.......",
])
ARROW_RIGHT = pad([
    "........##......",
    "........###.....",
    ".........###....",
    "..........###...",
    "..############..",
    "..############..",
    "..........###...",
    ".........###....",
    "........###.....",
    "........##......",
])
EXTERNAL = [
    "................",
    "........#######.",
    "........#######.",
    ".######....####.",
    ".######...#####.",
    ".##......###.##.",
    ".##.....###..##.",
    ".##....###...##.",
    ".##...###.......",
    ".##..###...##...",
    ".##........##...",
    ".##........##...",
    ".##........##...",
    ".############...",
    ".############...",
    "................",
]
EYE = pad([
    ".....######.....",
    "...###....###...",
    "..##...##...##..",
    ".##...####...##.",
    "##...######...##",
    "##...######...##",
    ".##...####...##.",
    "..##...##...##..",
    "...###....###...",
    ".....######.....",
])
HEART = pad([
    "..####....####..",
    ".######..######.",
    ".##############.",
    ".##############.",
    ".##############.",
    "..############..",
    "...##########...",
    "....########....",
    ".....######.....",
    "......####......",
    ".......##.......",
])
STAR = [
    "................",
    ".......##.......",
    "......####......",
    "......####......",
    ".....######.....",
    ".##############.",
    "..############..",
    "...##########...",
    "....########....",
    "....########....",
    "...##########...",
    "...####..####...",
    "..####....####..",
    "..###......###..",
    ".##..........##.",
    "................",
]
BELL = [
    "................",
    ".......##.......",
    ".....######.....",
    "....########....",
    "...##########...",
    "...##########...",
    "...##########...",
    "...##########...",
    "..############..",
    "..############..",
    ".##############.",
    ".##############.",
    "................",
    "......####......",
    ".......##.......",
    "................",
]
SEARCH = [
    "................",
    "....######......",
    "...########.....",
    "..###....###....",
    "..##......##....",
    "..##......##....",
    "..##......##....",
    "..##......##....",
    "..###....###....",
    "...########.....",
    "....#######.....",
    ".........###....",
    "..........###...",
    "...........###..",
    "............##..",
    "................",
]
USER = [
    "................",
    "......####......",
    ".....######.....",
    "....########....",
    "....########....",
    "....########....",
    ".....######.....",
    "......####......",
    "................",
    ".....######.....",
    "...##########...",
    "..############..",
    ".##############.",
    ".##############.",
    ".##############.",
    "................",
]
MOON = [
    "................",
    ".....####.......",
    "...#####........",
    "..#####.........",
    ".#####..........",
    ".#####..........",
    ".######.........",
    ".######.........",
    ".#######......#.",
    ".#########...##.",
    ".#############..",
    "..############..",
    "...##########...",
    ".....######.....",
    "................",
    "................",
]


def pencil(x, y):
    a, p = x - y, x + y
    if not 13 <= p <= 18:
        return False
    if 8 <= a <= 12 or -4 <= a <= 6:
        return True
    return (-8 <= a <= -5 and 14 <= p <= 17) or (-11 <= a <= -9 and 15 <= p <= 16)


def g():
    return G()


def tri(gr, top, bottom, v=1):
    # solid isosceles triangle, apex 2px wide at `top`, full width at `bottom`
    for y in range(top, bottom + 1):
        half = 1 + round((y - top) * 6 / (bottom - top))
        gr.R(8 - half, y, 7 + half, y, v)
    return gr


def clone(gr):
    g = G()
    g.p = copy.deepcopy(gr.p)
    return g


def erode(gr):
    g = G()
    for y in range(N):
        for x in range(N):
            g.p[y][x] = int(gr.p[y][x] and all(
                0 <= x + dx < N and 0 <= y + dy < N and gr.p[y + dy][x + dx]
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))))
    return g


def outline(gr, k=2):
    inner = gr
    for _ in range(k):
        inner = erode(inner)
    g = clone(gr)
    for y in range(N):
        for x in range(N):
            if inner.p[y][x]:
                g.p[y][x] = 0
    return g


def fill_holes(gr):
    seen = [[0] * N for _ in range(N)]
    stack = [(x, y) for x in range(N) for y in (0, N - 1)] + [(x, y) for y in range(N) for x in (0, N - 1)]
    while stack:
        x, y = stack.pop()
        if 0 <= x < N and 0 <= y < N and not seen[y][x] and not gr.p[y][x]:
            seen[y][x] = 1
            stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    g = clone(gr)
    for y in range(N):
        for x in range(N):
            if not seen[y][x]:
                g.p[y][x] = 1
    return g


def build():
    I = {}
    I["close"] = g().art(CLOSE)
    I["check"] = g().art(CHECK)
    I["chevron-down"] = g().art(CHEVRON_DOWN)
    I["chevron-right"] = g().art(CHEVRON_DOWN).rot_cw().mirror()
    I["arrow-right"] = g().art(ARROW_RIGHT)
    I["arrow-left"] = g().art(ARROW_RIGHT).mirror()
    I["external-link"] = g().art(EXTERNAL)
    I["search"] = g().art(SEARCH)
    I["plus"] = g().R(7, 2, 8, 13).R(2, 7, 13, 8)
    I["minus"] = g().R(2, 7, 13, 8)
    I["menu"] = g().R(1, 2, 14, 3).R(1, 7, 14, 8).R(1, 12, 14, 13)
    I["info"] = g().disk(8, 8, 7).E(7, 3, 8, 4).E(7, 6, 8, 12)
    I["warning"] = tri(g(), 1, 14).E(7, 6, 8, 10).E(7, 12, 8, 13)
    I["error"] = g().disk(8, 8, 7).diag(4, 4, 10, 10, 2, 0).diag(10, 4, 4, 10, 2, 0)
    I["success"] = g().disk(8, 8, 7).diag(4, 7, 6, 9, 2, 0).diag(10, 4, 6, 10, 2, 0).E(6, 9, 7, 10)
    I["eye"] = g().art(EYE)
    eye_off = g().art(EYE)
    for y in range(1, 14):
        eye_off.E(16 - y, y, 16 - y, y).R(14 - y, y, 15 - y, y)
    I["eye-off"] = eye_off
    I["calendar"] = g().R(1, 3, 14, 14).E(3, 7, 12, 12).R(4, 1, 5, 4).R(10, 1, 11, 4).E(4, 3, 5, 3).E(10, 3, 11, 3).R(4, 1, 5, 2).R(10, 1, 11, 2).R(9, 9, 10, 10)
    I["user"] = g().art(USER)
    gear = g().disk(8, 8, 5.2).R(6, 1, 9, 14).R(1, 6, 14, 9)
    for (x, y) in [(2, 2), (11, 2), (2, 11), (11, 11)]:
        gear.R(x, y, x + 2, y + 2)
    I["settings"] = gear.disk(8, 8, 2.2, 0)
    I["home"] = tri(g(), 1, 7).R(2, 8, 13, 14).E(6, 10, 9, 14)
    I["trash"] = g().R(1, 3, 14, 4).R(5, 1, 10, 2).E(7, 2, 8, 2).R(2, 6, 13, 14).E(5, 8, 5, 12).E(10, 8, 10, 12).E(2, 14, 2, 14).E(13, 14, 13, 14)
    I["edit"] = g().where(lambda x, y: pencil(x + 1, y - 1))
    I["copy"] = g().R(1, 1, 10, 10).E(3, 3, 8, 8).E(4, 4, 15, 15).R(5, 5, 14, 14)
    tray = lambda gr: gr.R(1, 13, 14, 14).R(1, 10, 2, 14).R(13, 10, 14, 14)
    I["download"] = tray(g().art(ARROW_RIGHT).rot_cw().shift(2).E(0, 0, 15, 0))
    I["upload"] = tray(g().art(ARROW_RIGHT).rot_cw().rot_cw().rot_cw().shift(1).E(0, 11, 15, 15))
    I["heart"] = g().art(HEART)
    I["star"] = g().art(STAR)
    I["bell"] = g().art(BELL)
    I["sun"] = g().disk(8, 8, 3.6).R(7, 0, 8, 2).R(7, 13, 8, 15).R(0, 7, 2, 8).R(13, 7, 15, 8).R(2, 2, 3, 3).R(12, 2, 13, 3).R(2, 12, 3, 13).R(12, 12, 13, 13)
    I["moon"] = g().art(MOON)
    globe = g().ring(8, 8, 7, 5).R(1, 7, 14, 8)
    for y in range(N):
        for x in range(N):
            e = ((x + 0.5 - 8) / 3.2) ** 2 + ((y + 0.5 - 8) / 7) ** 2
            if 0.45 < e <= 1:
                globe.set(x, y)
    I["globe"] = globe
    I["loader"] = g().ring(8, 8, 7, 5).E(9, 0, 15, 7)
    return I


def build_styles():
    base = build()
    reg = {k: clone(v) for k, v in base.items()}
    sol = {k: clone(v) for k, v in base.items()}

    ring = lambda: G().ring(8, 8, 7, 5)
    reg["info"] = ring().R(7, 4, 8, 5).R(7, 7, 8, 11)
    x_mark = [(5, 5), (6, 5), (9, 5), (10, 5), (6, 6), (7, 6), (8, 6), (9, 6), (7, 7), (8, 7),
              (7, 8), (8, 8), (6, 9), (7, 9), (8, 9), (9, 9), (5, 10), (6, 10), (9, 10), (10, 10)]
    reg["error"] = ring()
    for x, y in x_mark:
        reg["error"].set(x, y)
    reg["success"] = ring().diag(4, 7, 6, 9, 2).diag(7, 9, 10, 6, 2)
    reg["warning"] = outline(tri(G(), 1, 14)).R(7, 7, 8, 9).R(7, 11, 8, 11)
    reg["user"] = outline(base["user"])
    gear = G().disk(8, 8, 5.2).R(6, 1, 9, 14).R(1, 6, 14, 9)
    for (x, y) in [(2, 2), (11, 2), (2, 11), (11, 11)]:
        gear.R(x, y, x + 2, y + 2)
    reg["settings"] = gear.disk(8, 8, 3.3, 0)
    reg["home"] = outline(base["home"])
    reg["trash"] = (G().R(1, 3, 14, 4).R(5, 1, 10, 2).E(7, 2, 8, 2)
                    .R(2, 6, 3, 14).R(12, 6, 13, 14).R(2, 13, 13, 14).R(7, 7, 8, 11)
                    .E(2, 14, 2, 14).E(13, 14, 13, 14))
    reg["copy"] = G().R(1, 1, 10, 10).E(3, 3, 8, 8).E(4, 4, 15, 15).R(5, 5, 14, 14).E(7, 7, 12, 12)
    for k in ("heart", "star", "bell"):
        reg[k] = outline(base[k])
    reg["sun"] = (G().ring(8, 8, 3.6, 1.7).R(7, 0, 8, 2).R(7, 13, 8, 15).R(0, 7, 2, 8).R(13, 7, 15, 8)
                  .R(2, 2, 3, 3).R(12, 2, 13, 3).R(2, 12, 3, 13).R(12, 12, 13, 13))

    sol["search"] = fill_holes(base["search"])
    sol["eye"] = fill_holes(base["eye"]).ring(8, 8, 3.4, 2.1, v=0)
    se = clone(sol["eye"])
    for y in range(1, 14):
        se.E(13 - y, y, 16 - y, y).R(14 - y, y, 15 - y, y)
    sol["eye-off"] = se
    sol["calendar"] = fill_holes(base["calendar"]).E(3, 6, 12, 6).E(9, 9, 10, 10)
    globe = G().disk(8, 8, 7).E(1, 8, 14, 8)
    for y in range(N):
        for x in range(N):
            e = ((x + 0.5 - 8) / 3.4) ** 2 + ((y + 0.5 - 8) / 7) ** 2
            if 0.72 < e <= 1:
                globe.set(x, y, 0)
    sol["globe"] = globe
    return reg, sol


if __name__ == "__main__":
    reg, sol = build_styles()
    for style, I in (("regular", reg), ("solid", sol)):
        d = OUT / style
        d.mkdir(parents=True, exist_ok=True)
        for name, gr in I.items():
            (d / f"{name}.svg").write_text(gr.svg(), encoding="utf-8")
    print(len(reg), len(sol), "->", OUT)
