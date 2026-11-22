// The pen-and-ink drawings beside each project on the homepage, as inline SVG centrelines.
// The script at the end of index.html turns the centrelines into brush strokes and draws them in.
//   node _tools/ink/build.mjs           report each drawing's size
//   node _tools/ink/build.mjs --apply   write the drawings into index.html, replacing svg#ink-<id>
import fs from 'fs';
import { seed, rnd, line, poly, curve, ellipse, ellipsePts, fill, fillPoly, dot, hatch, stipple, stippleRing, mirror, svg, smooth, dotPaths } from './lib.mjs';
const V = {};
const along = (pts, step) => { // evenly spaced points (with tangents) along a polyline
  const out = []; let acc = step * 0.5;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (; acc < L; acc += step) out.push({ x: a[0] + (b[0] - a[0]) * acc / L, y: a[1] + (b[1] - a[1]) * acc / L, a: Math.atan2(b[1] - a[1], b[0] - a[0]) });
    acc -= L;
  }
  return out;
};

// World Scholar's Cup: a cup between laurels
seed(11);
{
  const stem = [[103, 148], [88, 143], [76, 133], [68, 119], [65, 103], [66, 92]];
  const laurel = [curve(stem, 'k1')];
  along(stem, 8.6).forEach((p, i) => {
    const side = i % 2 ? 1 : -1, a = p.a + side * 0.75, nx = -Math.sin(p.a) * side, ny = Math.cos(p.a) * side;
    laurel.push(fill(ellipsePts(p.x + nx * 3.4 + Math.cos(a) * 2.4, p.y + ny * 3.4 + Math.sin(a) * 2.4, 5.2, 1.9, 0, 360, a * 180 / Math.PI, 0.02, 30)));
  });
  const back = [line(60, 152, 180, 152, 'k1', { bow: 0.006 }), ...laurel, ...mirror(laurel)];
  const cup = [
    ellipse(120, 44, 34, 6.5, 'k', { a0: 180 }),
    curve([[86, 45], [87, 60], [93, 76], [104, 89], [120, 95], [136, 89], [147, 76], [153, 60], [154, 45]], 'k'),
    curve([[88, 52], [75, 50], [67, 58], [69, 70], [79, 78], [94, 80]], 'k'),
    curve([[152, 52], [165, 50], [173, 58], [171, 70], [161, 78], [146, 80]], 'k'),
    line(114, 95, 116, 111, 'k'), line(126, 95, 124, 111, 'k'),
    ellipse(120, 113.5, 8.5, 3.4, 'k', { a0: 200 }),
    line(116, 117, 112, 128, 'k'), line(124, 117, 128, 128, 'k'),
    poly([[104, 129], [100, 146], [140, 146], [136, 129], [104, 129]], 'k'),
    line(95, 146.5, 145, 146.5, 'k2', { bow: 0.004 }),
    poly([[110, 134], [130, 134], [130, 141], [110, 141], [110, 134]], 'k1'),
  ];
  const front = [
    ...hatch([[127, 51], [153, 48], [151, 63], [144, 78], [133, 88], [125, 90]], 62, 3.1),
    ...hatch([[127, 130], [136, 130], [139.5, 145], [128, 145]], 74, 2.5),
    curve([[95, 55], [96, 63], [99, 70]], 'k1'), curve([[101, 74], [104, 79], [108, 83]], 'k1'),
    line(172, 22, 172, 36, 'k1'), line(165, 29, 179, 29, 'k1'), line(185, 42, 185, 49, 'k1'), line(181.5, 45.5, 188.5, 45.5, 'k1'),
  ];
  V.wsc = svg('wsc', [{ depth: 0.55, items: back, seq: 1 }, { depth: 1, items: cup, seq: 0 }, { depth: 1.35, items: front, seq: 2 }]);
}

// Writing 4part: four bars, and under them the training loss the parts are named after:
// it falls, dips into a local minimum, climbs out and converges
seed(4);
{
  const staff = [];
  [56, 64, 72, 80, 88].forEach(y => staff.push(line(24, y, 222, y + rnd(-0.6, 0.6), 'k1', { bow: 0.004, over: 0.3 })));
  staff.push(line(24, 54, 24, 90, 'k2', { over: 0.4 }));
  [74, 124, 174].forEach(x => staff.push(line(x, 56, x, 88, 'k1', { over: 0.3 })));
  staff.push(line(217, 56, 217, 88, 'k1', { over: 0.3 }), line(222, 54, 222, 90, 'k2', { over: 0.4 }));
  const nums = [line(49, 36, 49, 45, 'k1'), line(96, 36, 96, 45, 'k1'), line(102, 36, 102, 45, 'k1'),
    line(143, 36, 143, 45, 'k1'), line(149, 36, 149, 45, 'k1'), line(155, 36, 155, 45, 'k1'),
    line(192, 36, 192, 45, 'k1'), poly([[197, 36], [200.5, 45], [204, 36]], 'k1')];
  const N = [[36, 52], [50, 56], [63, 60], [86, 64], [99, 68], [112, 72], [136, 76], [149, 84], [162, 76], [186, 84], [198, 88], [210, 88]];
  const notes = [];
  N.forEach(([x, y]) => {
    notes.push(fill(ellipsePts(x, y, 4.3, 3, 0, 360, -24, 0.03, 30)));
    notes.push(y < 72 ? line(x - 3.9, y + 1, x - 3.9, y + 24, 'k1', { over: 0.2 }) : line(x + 3.9, y - 1, x + 3.9, y - 24, 'k1', { over: 0.2 }));
  });
  const G = N.map(([x, y]) => [x, 112 + (y - 52) * 1.12]);
  const graph = [line(24, 108, 24, 156, 'k1', { over: 0.3 }), line(24, 156, 222, 156, 'k1', { bow: 0.004, over: 0.3 }),
    curve([[26, 109], ...G, [222, 151.5]], 'k', 0.15), ellipse(149, G[7][1], 5.5, 5.5, 'k1', { jit: 0.05 })];
  V.writing = svg('writing', [{ depth: 0.6, items: [...staff, ...nums] }, { depth: 1.3, items: notes }, { depth: 0.85, items: graph }]);
}

// CIS-MAP: a floor plan, the stairs between floors, a door's QR code and the route to a room
seed(21);
{
  const walls = [
    line(28, 34, 212, 34, 'k'), line(212, 34, 212, 150, 'k'), line(212, 150, 112, 150, 'k'), line(96, 150, 28, 150, 'k'), line(28, 150, 28, 34, 'k'),
    line(28, 88, 70, 88, 'k'), line(84, 88, 140, 88, 'k'), line(154, 88, 212, 88, 'k'),
    line(28, 108, 60, 108, 'k'), line(74, 108, 160, 108, 'k'), line(174, 108, 212, 108, 'k'),
    line(90, 34, 90, 88, 'k'), line(150, 34, 150, 88, 'k'), line(80, 108, 80, 150, 'k'), line(158, 108, 158, 150, 'k'),
  ];
  const stairs = [];
  for (let x = 165; x <= 205; x += 5.7) stairs.push(line(x, 114, x, 144, 'k1', { over: 0.2 }));
  stairs.push(line(168, 129, 203, 129, 'k1'), poly([[198, 125], [203.5, 129], [198, 133]], 'k1'));
  const qr = [poly([[36, 118], [58, 118], [58, 140], [36, 140], [36, 118]], 'k1')];
  [[38, 120], [50, 120], [38, 132]].forEach(([x, y]) => qr.push(fillPoly([[x, y], [x + 6, y], [x + 6, y + 6], [x, y + 6]])));
  [[46, 127], [51, 130], [48, 134], [53, 135], [46, 136], [51, 125]].forEach(([x, y]) => qr.push(fillPoly([[x, y], [x + 2.4, y], [x + 2.4, y + 2.4], [x, y + 2.4]])));
  const route = [{ t: 'kd', d: smooth([[61, 129], [66, 112], [77, 99], [110, 98], [140, 98], [148, 91], [152, 78], [165, 66], [177, 61]]) }];
  const pin = [curve([[182, 62], [176.5, 53], [175, 46], [178, 40], [182, 38.5], [186, 40], [189, 46], [187.5, 53], [182, 62]], 'k'), fill(ellipsePts(182, 46.5, 2.6, 2.6, 0, 360, 0, 0.02, 40))];
  V.cismap = svg('cismap', [{ depth: 0.6, items: walls }, { depth: 0.85, items: [...stairs, ...qr] }, { depth: 1.35, items: [...route, ...pin] }]);
}

// Modelling the Other: two heads facing each other, each picturing the other
seed(31);
{
  const back = [[52, 152], [54, 130], [48, 115], [42, 99], [41.5, 80], [47, 63], [59, 51], [76, 46.5]];
  const face = [[76, 46.5], [87, 51.5], [92, 61], [93, 69], [96.5, 76.5], [102, 84.5], [97.5, 88], [96, 90.5], [98, 93.5], [95, 96.5], [96.8, 100], [93, 106], [86.5, 110], [80.5, 115], [79, 127], [81, 152]];
  const head = [curve(back, 'k'), curve(face, 'k', 0.15), curve([[63, 80], [58, 82], [57, 88], [60.5, 93], [64, 91.5]], 'k1'), line(83, 70.5, 87.5, 71.5, 'k1', { over: 0.2 })];
  const hair = hatch([[43, 98], [42.5, 80], [48, 63.5], [60, 52.5], [76, 48], [83, 51], [66, 56], [55, 69], [51, 90]], 118, 2.9);
  const mini = (cx, cy, s, flip) => { // the other person, small, inside the thought bubble
    const tr = p => [cx + (flip ? -1 : 1) * (p[0] - 72) * s, cy + (p[1] - 82) * s];
    return [curve(back.slice(2).map(tr), 'k1', 0.03), curve(face.slice(0, 14).map(tr), 'k1', 0.03)];
  };
  const bubblePts = (cx, cy, rx, ry) => { const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * 2 * Math.PI, k = 1 + 0.1 * Math.abs(Math.sin(a * 4.5)); pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return pts; };
  const thought = [curve(bubblePts(82, 22, 25, 15.5), 'k1', 0.1), ellipse(98, 43, 2.4, 2.1, 'k1'), ellipse(102.5, 49, 1.4, 1.3, 'k1'), ...mini(82, 23, 0.3, true)];
  V.other = svg('other', [{ depth: 0.75, items: [...hair, ...mirror(hair)], seq: 1 }, { depth: 1, items: [...head, ...mirror(head)], seq: 0 }, { depth: 1.3, items: [...thought, ...mirror(thought)], seq: 2 }]);
}

// VPS Veritas: a bunker tanker on the water, hull inked below the waterline
seed(41);
{
  const wave = (y, x0, x1, amp, len, t) => { const pts = []; for (let x = x0; x <= x1; x += len / 4) pts.push([x, y + Math.sin((x - x0) / len * 2 * Math.PI) * amp + rnd(-0.3, 0.3)]); return curve(pts, t, 0.1); };
  const far = [wave(134, 12, 228, 1.6, 22, 'k1'), wave(142, 20, 220, 1.4, 18, 'k1')];
  const ship = [
    curve([[40, 100], [45, 111], [57, 121.5], [80, 122], [184, 122], [193, 111], [199, 97]], 'k'),
    line(40, 100, 199, 97, 'k', { bow: 0.004 }),
    line(45, 107, 195, 104.5, 'k1', { bow: 0.003 }),
    fill([[47, 113.5], [56, 121], [80, 121.5], [183, 121.5], [190.5, 112.5], [150, 113], [100, 113.5]]),
    poly([[50, 100], [50, 72], [80, 72], [80, 100]], 'k'), line(45, 71.5, 85, 71.5, 'k'),
    line(55, 80, 59, 80, 'k1', { over: 0.1 }), line(63, 80, 67, 80, 'k1', { over: 0.1 }), line(71, 80, 75, 80, 'k1', { over: 0.1 }),
    line(55, 89, 59, 89, 'k1', { over: 0.1 }), line(63, 89, 67, 89, 'k1', { over: 0.1 }), line(71, 89, 75, 89, 'k1', { over: 0.1 }),
    poly([[59, 71.5], [61, 55], [71, 55], [73, 71.5]], 'k'), fillPoly([[60.5, 59], [71.5, 59], [72, 63.5], [60, 63.5]]),
    line(85, 95, 192, 93.5, 'k1', { bow: 0.003 }),
    line(130, 97.5, 130, 62, 'k'), line(130, 64.5, 158, 57, 'k1'), line(158, 57, 158, 80, 'k1', { over: 0.1 }), curve([[158, 80], [158, 83.5], [155.2, 83.5], [155, 81]], 'k1', 0.05),
  ];
  for (let x = 92; x <= 186; x += 13) ship.push(line(x, 94.6, x, 98.5, 'k1', { over: 0.1 }));
  const smoke = [curve([[66, 52], [61, 45], [67, 39], [61, 32], [67, 25], [62, 18]], 'k1'), ellipse(74, 34, 3.5, 2.6, 'k1'), ellipse(80, 24, 4.2, 3, 'k1')];
  const near = [wave(127, 8, 232, 2.2, 26, 'k')];
  [[30, 147], [62, 154], [100, 145], [140, 152], [178, 146], [210, 155]].forEach(([x, y]) => near.push(curve([[x, y], [x + 4, y - 2.4], [x + 8, y], [x + 12, y - 2]], 'k1', 0.1)));
  V.vps = svg('vps', [{ depth: 0.55, items: [...far, ...smoke], seq: 2 }, { depth: 1, items: ship, seq: 0 }, { depth: 1.45, items: near, seq: 1 }]);
}

// Learning what to prove: a search tree; most branches stop, one reaches a proof
seed(51);
{
  const node = (x, y, solid) => solid ? fill(ellipsePts(x, y, 3.6, 3.6, 0, 360, 0, 0.02, 30)) : ellipse(x, y, 3.6, 3.6, 'k1', { jit: 0.04 });
  const edge = (a, b, t) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return line(a[0] + dx / L * 5, a[1] + dy / L * 5, b[0] - dx / L * 5, b[1] - dy / L * 5, t, { over: 0.2, bow: 0.03 }); };
  const cross = (x, y) => [line(x - 3, y - 3, x + 3, y + 3, 'k1', { over: 0.1 }), line(x + 3, y - 3, x - 3, y + 3, 'k1', { over: 0.1 })];
  const P = { r: [120, 156], a: [66, 124], b: [120, 124], c: [174, 124], a1: [44, 92], a2: [80, 92], b1: [104, 92], b2: [136, 92], c1: [160, 92], c2: [196, 92], a2a: [72, 60], b1a: [96, 60], b2a: [124, 60], b2b: [150, 60], c1a: [168, 60], q: [158, 28] };
  const side = [];
  [['r', 'a'], ['r', 'c'], ['a', 'a1'], ['a', 'a2'], ['b', 'b1'], ['c', 'c1'], ['c', 'c2'], ['a2', 'a2a'], ['b1', 'b1a'], ['b2', 'b2a'], ['c1', 'c1a']].forEach(([u, v]) => side.push(edge(P[u], P[v], 'k1')));
  ['a', 'c', 'a2', 'b1', 'c1', 'a2a', 'b1a'].forEach(k => side.push(node(...P[k], false)));
  side.push(...cross(...P.a1), ...cross(...P.c2), ...cross(...P.b2a), ...cross(...P.c1a));
  [[72, 60, 64, 36], [72, 60, 82, 38], [96, 60, 92, 36]].forEach(([x, y, u, v]) => side.push({ t: 'kd', d: smooth([[x + (u - x) * 0.2, y + (v - y) * 0.2], [u, v]]) }));
  const main = [node(...P.r, true), edge(P.r, P.b, 'k2'), node(...P.b, true), edge(P.b, P.b2, 'k2'), node(...P.b2, true), edge(P.b2, P.b2b, 'k2'), node(...P.b2b, true), edge(P.b2b, P.q, 'k2'),
    fillPoly([[153, 23], [163, 23], [163, 33], [153, 33]])];
  V.prove = svg('prove', [{ depth: 0.7, items: side }, { depth: 1.25, items: main }]);
}

// Train Pointillism: a locomotive stippled in dots, on an inked rail
seed(61);
{
  const rail = [line(12, 140, 228, 140, 'k2', { bow: 0.002 })];
  for (let x = 18; x < 226; x += 11) rail.push(line(x, 142.5, x - 2, 147, 'k1', { over: 0.1 }));
  const wheels = [];
  [80, 110, 140].forEach(x => { wheels.push(ellipse(x, 126, 13, 13, 'k')); wheels.push(fill(ellipsePts(x, 126, 2.4, 2.4, 0, 360, 0, 0.02, 40))); for (let a = 0; a < 360; a += 45) { const r = a * Math.PI / 180; wheels.push(line(x + Math.cos(r) * 3.5, 126 + Math.sin(r) * 3.5, x + Math.cos(r) * 11, 126 + Math.sin(r) * 11, 'k1', { over: 0, bow: 0 })); } });
  wheels.push(ellipse(176, 131, 8, 8, 'k'), line(80, 131, 140, 131, 'k', { over: 0.5 }));
  wheels.push(poly([[184, 114], [200, 139]], 'k1'), poly([[189, 114], [208, 139]], 'k1'), line(180, 113.5, 202, 113.5, 'k1'));
  const band = p => { const t = (p[1] - 74) / 38; return 0.22 + 0.78 * Math.pow(Math.abs(t * 2 - 1), 1.4); };
  const body = [
    ...stipple([[70, 74], [160, 74], [160, 112], [70, 112]], 150, { density: band, rim: 3.2, space: 2.6 }),
    ...stipple([[160, 72], [170, 73], [176, 80], [178.5, 93], [176, 106], [170, 112], [160, 113]], 62, { space: 2.1, rim: 2.8 }),
    ...stipple([[149, 47], [163, 47], [160, 56], [160, 74], [152, 74], [152, 56]], 38, { space: 2, rim: 2.6 }),
    ...stipple([[112, 74], [114, 64], [120, 61], [128, 61], [134, 64], [136, 74]], 20, { space: 2.3, rim: 3 }),
    ...stipple([[34, 54], [70, 54], [70, 112], [34, 112]], 100, { density: p => (p[0] > 41 && p[0] < 63 && p[1] > 62 && p[1] < 82) ? 0 : 0.85, space: 2.5, rim: 3.1 }),
    ...stipple([[172, 64], [178, 64], [178, 70], [172, 70]], 6, { space: 1.3 }),
  ];
  const top = [line(29, 52, 75, 52, 'k2', { bow: 0.004 }), line(34, 113, 180, 113, 'k1')];
  const smoke = [];
  [[150, 37, 9, 20], [131, 27, 11, 18], [108, 21, 12, 15], [84, 19, 13, 11], [60, 21, 12, 7]].forEach(([x, y, r, n]) => smoke.push(...stipple(ellipsePts(x, y, r * 1.25, r * 0.8, 0, 360, 0, 0.08, 24), n, { space: 2.6, rmin: 0.5, rmax: 1 })));
  V.train = svg('train', [{ depth: 1.2, items: [...rail, ...wheels, ...top] }, { depth: 1, items: dotPaths(body, 'l') }, { depth: 0.6, items: dotPaths(smoke, 'r') }]);
}

// gvhackathon.com: a laptop with code on screen and the stopwatch of a seven-day build
seed(71);
{
  const shadow = hatch([[52, 129], [188, 129], [180, 135], [60, 135]], 0, 2.2, { min: 4 });
  const laptop = [
    poly([[64, 106], [64, 36], [176, 36], [176, 106]], 'k'), poly([[72, 98], [72, 44], [168, 44], [168, 98], [72, 98]], 'k1'),
    poly([[64, 106], [176, 106], [194, 126], [46, 126], [64, 106]], 'k'), line(46, 127, 194, 127, 'k2', { bow: 0.003 }),
    poly([[107, 116.5], [133, 116.5], [134, 123], [106, 123], [107, 116.5]], 'k1'),
    poly([[103, 58], [93, 70], [103, 82]], 'k2'), line(122, 55, 114, 85, 'k2'), poly([[131, 58], [141, 70], [131, 82]], 'k2'),
  ];
  for (let row = 0; row < 2; row++) { const y = 109.5 + row * 3.8, x0 = 66 - row * 3.2, x1 = 174 + row * 3.2; for (let x = x0; x < x1; x += 7.2) laptop.push(line(x, y, x + 4.4, y, 'k1', { over: 0, bow: 0 })); }
  const watch = [ellipse(200, 52, 15, 15, 'k'), line(200, 33, 200, 37, 'k1'), poly([[195.5, 31], [204.5, 31]], 'k2'), line(211, 39, 214, 36, 'k1'),
    line(200, 52, 200, 42, 'k2', { over: 0 }), line(200, 52, 207, 55, 'k1', { over: 0 })];
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([u, v]) => watch.push(line(200 + u * 11, 52 + v * 11, 200 + u * 13.2, 52 + v * 13.2, 'k1', { over: 0 })));
  V.hack = svg('hack', [{ depth: 0.7, items: shadow, seq: 2 }, { depth: 1, items: laptop, seq: 0 }, { depth: 1.4, items: watch, seq: 1 }]);
}

// Next: a multi-movement symphony, its movements fanned out I to IV, with a baton across them
seed(81);
{
  const numeral = (n, x, y) => { // roman numerals drawn as pen strokes, centred on x
    const parts = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }[n].split(''), w = parts.length * 4.4, out = []; let cx = x - w / 2 + 2;
    parts.forEach(ch => { if (ch === 'I') out.push([[cx, y], [cx, y + 7]]); else { out.push([[cx - 1, y], [cx + 1.8, y + 7], [cx + 4.6, y]]); cx += 2.4; } cx += 4.4; });
    return out;
  };
  const page = (rot, n, full) => {
    const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), T = ([x, y]) => [120 + (x - 120) * c - (y - 178) * s, 178 + (x - 120) * s + (y - 178) * c];
    const items = [{ ...fillPoly([[92, 160], [92, 70], [148, 70], [148, 160]].map(T)), t: 'w' }, poly([[92, 160], [92, 70], [148, 70], [148, 160], [92, 160]].map(T), 'k')];
    numeral(n, 120, 76).forEach(seg => items.push(seg.length === 2 ? line(...T(seg[0]), ...T(seg[1]), 'k1', { over: 0.1 }) : poly(seg.map(T), 'k1')));
    if (full) {
      [94, 114, 134].forEach(y0 => { for (let k = 0; k < 3; k++) items.push(line(...T([98, y0 + k * 4]), ...T([142, y0 + k * 4 + rnd(-0.3, 0.3)]), 'k1', { over: 0.2, bow: 0.004 })); });
      [[106, 96], [116, 92], [126, 98], [136, 94], [104, 118], [114, 116], [124, 120], [134, 114], [110, 136], [122, 140], [134, 138]].forEach(([x, y]) => items.push(fill(ellipsePts(...T([x, y]), 2.2, 1.6, 0, 360, rot - 24, 0.03, 40))));
    }
    return items;
  };
  const back = [...page(-36, 1, false), ...page(-12, 2, false), ...page(12, 3, false)], front = page(36, 4, true);
  const baton = [line(62, 150, 196, 58, 'k1', { over: 0.2, bow: 0.006 }), fill(ellipsePts(65.5, 147.6, 6.5, 2.6, 0, 360, -34.5, 0.02, 30))];
  V.coda = svg('coda', [{ depth: 0.75, items: back }, { depth: 1, items: front }, { depth: 1.35, items: baton }]);
}

if (process.argv.includes('--apply')) {
  const page = new URL('../../index.html', import.meta.url).pathname;
  let html = fs.readFileSync(page, 'utf8');
  for (const [k, v] of Object.entries(V)) {
    const re = new RegExp(`<svg class="ink" id="ink-${k}"[\\s\\S]*?</svg>`);
    if (!re.test(html)) throw new Error(`index.html has no svg#ink-${k}: add <div class="art"><svg class="ink" id="ink-${k}"></svg></div> to its section first`);
    html = html.replace(re, () => v);
  }
  fs.writeFileSync(page, html);
  console.log('wrote', Object.keys(V).length, 'drawings into index.html');
}
console.log(Object.entries(V).map(([k, v]) => `${k}: ${(v.length / 1024).toFixed(1)} KB`).join(', '), '| total', (Object.values(V).join('').length / 1024).toFixed(1), 'KB');
