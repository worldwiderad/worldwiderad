// The ink world behind the homepage: one scene per project, placed along 4part's timeline,
// and the horn and string lines of the score itself, which run along the corridor walls.
//   node _tools/ink/world.mjs      writes static/ink/world.js
// Scene drawings are pen centrelines in a 240 x 180 box; static/ink/stage.js turns them into brush strokes.
import fs from 'fs';
import { seed, rnd, line, poly, curve, ellipse, ellipsePts, fill, fillPoly, dot, hatch, stipple, mirror, smooth } from './lib.mjs';
const ROOT = new URL('../../', import.meta.url).pathname;
const LEN = 593.32;

// a layer: items in drawing order, at a depth (dz, in world units behind the scene's plane), offset and scale
const L = (dz, items, o = {}) => ({ dz, x: o.x || 0, y: o.y || 0, s: o.s || 1, items });
const paper = pts => ({ ...fillPoly(pts), t: 'w' });
const along = (pts, step) => { const out = []; let acc = step * 0.5; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]); for (; acc < len; acc += step) out.push({ x: a[0] + (b[0] - a[0]) * acc / len, y: a[1] + (b[1] - a[1]) * acc / len, a: Math.atan2(b[1] - a[1], b[0] - a[0]) }); acc -= len; } return out; };
const S = {};

// World Scholar's Cup: the cup, with laurel sprigs flying past on either side
seed(11);
{
  const stem = [[103, 148], [88, 143], [76, 133], [68, 119], [65, 103], [66, 92]];
  const laurel = [curve(stem, 'k1')];
  along(stem, 8.6).forEach((p, i) => { const side = i % 2 ? 1 : -1, a = p.a + side * 0.75, nx = -Math.sin(p.a) * side, ny = Math.cos(p.a) * side; laurel.push(fill(ellipsePts(p.x + nx * 3.4 + Math.cos(a) * 2.4, p.y + ny * 3.4 + Math.sin(a) * 2.4, 5.2, 1.9, 0, 360, a * 180 / Math.PI, 0.02, 30))); });
  const cup = [
    ellipse(120, 44, 34, 6.5, 'k', { a0: 180 }),
    curve([[86, 45], [87, 60], [93, 76], [104, 89], [120, 95], [136, 89], [147, 76], [153, 60], [154, 45]], 'k'),
    curve([[88, 52], [75, 50], [67, 58], [69, 70], [79, 78], [94, 80]], 'k'), curve([[152, 52], [165, 50], [173, 58], [171, 70], [161, 78], [146, 80]], 'k'),
    line(114, 95, 116, 111, 'k'), line(126, 95, 124, 111, 'k'), ellipse(120, 113.5, 8.5, 3.4, 'k', { a0: 200 }),
    line(116, 117, 112, 128, 'k'), line(124, 117, 128, 128, 'k'),
    poly([[104, 129], [100, 146], [140, 146], [136, 129], [104, 129]], 'k'), line(95, 146.5, 145, 146.5, 'k2', { bow: 0.004 }),
    poly([[110, 134], [130, 134], [130, 141], [110, 141], [110, 134]], 'k1'),
    ...hatch([[127, 51], [153, 48], [151, 63], [144, 78], [133, 88], [125, 90]], 62, 3.1), ...hatch([[127, 130], [136, 130], [139.5, 145], [128, 145]], 74, 2.5),
    curve([[95, 55], [96, 63], [99, 70]], 'k1'), curve([[101, 74], [104, 79], [108, 83]], 'k1'),
    line(60, 152, 180, 152, 'k1', { bow: 0.006 }), ...laurel, ...mirror(laurel),
  ];
  const sparks = [line(172, 22, 172, 36, 'k1'), line(165, 29, 179, 29, 'k1'), line(185, 42, 185, 49, 'k1'), line(181.5, 45.5, 188.5, 45.5, 'k1')];
  S.wsc = [L(0, cup), L(-1.2, sparks), L(-2.6, laurel, { x: -150, y: 10, s: 1.3 }), L(-2.6, mirror(laurel), { x: 150, y: 10, s: 1.3 })];
}

// Writing 4part: four bars, and under them the training loss the parts are named after
seed(4);
{
  const staff = [];
  [56, 64, 72, 80, 88].forEach(y => staff.push(line(24, y, 222, y + rnd(-0.6, 0.6), 'k1', { bow: 0.004, over: 0.3 })));
  staff.push(line(24, 54, 24, 90, 'k2', { over: 0.4 }));
  [74, 124, 174].forEach(x => staff.push(line(x, 56, x, 88, 'k1', { over: 0.3 })));
  staff.push(line(217, 56, 217, 88, 'k1', { over: 0.3 }), line(222, 54, 222, 90, 'k2', { over: 0.4 }));
  staff.push(line(49, 36, 49, 45, 'k1'), line(96, 36, 96, 45, 'k1'), line(102, 36, 102, 45, 'k1'), line(143, 36, 143, 45, 'k1'), line(149, 36, 149, 45, 'k1'), line(155, 36, 155, 45, 'k1'), line(192, 36, 192, 45, 'k1'), poly([[197, 36], [200.5, 45], [204, 36]], 'k1'));
  const N = [[36, 52], [50, 56], [63, 60], [86, 64], [99, 68], [112, 72], [136, 76], [149, 84], [162, 76], [186, 84], [198, 88], [210, 88]];
  const notes = [];
  N.forEach(([x, y]) => { notes.push(fill(ellipsePts(x, y, 4.3, 3, 0, 360, -24, 0.03, 30))); notes.push(y < 72 ? line(x - 3.9, y + 1, x - 3.9, y + 24, 'k1', { over: 0.2 }) : line(x + 3.9, y - 1, x + 3.9, y - 24, 'k1', { over: 0.2 })); });
  const G = N.map(([x, y]) => [x, 112 + (y - 52) * 1.12]);
  const graph = [line(24, 108, 24, 156, 'k1', { over: 0.3 }), line(24, 156, 222, 156, 'k1', { bow: 0.004, over: 0.3 }), curve([[26, 109], ...G, [222, 151.5]], 'k', 0.15), ellipse(149, G[7][1], 5.5, 5.5, 'k1', { jit: 0.05 })];
  S.writing = [L(0, [...staff, ...notes, ...graph])];
}

// CIS-MAP: the floor plan, a door's QR code, the route, and the pin floating above
seed(21);
{
  const plan = [
    line(28, 34, 212, 34, 'k'), line(212, 34, 212, 150, 'k'), line(212, 150, 112, 150, 'k'), line(96, 150, 28, 150, 'k'), line(28, 150, 28, 34, 'k'),
    line(28, 88, 70, 88, 'k'), line(84, 88, 140, 88, 'k'), line(154, 88, 212, 88, 'k'), line(28, 108, 60, 108, 'k'), line(74, 108, 160, 108, 'k'), line(174, 108, 212, 108, 'k'),
    line(90, 34, 90, 88, 'k'), line(150, 34, 150, 88, 'k'), line(80, 108, 80, 150, 'k'), line(158, 108, 158, 150, 'k'),
  ];
  for (let x = 165; x <= 205; x += 5.7) plan.push(line(x, 114, x, 144, 'k1', { over: 0.2 }));
  plan.push(line(168, 129, 203, 129, 'k1'), poly([[198, 125], [203.5, 129], [198, 133]], 'k1'), poly([[36, 118], [58, 118], [58, 140], [36, 140], [36, 118]], 'k1'));
  [[38, 120], [50, 120], [38, 132]].forEach(([x, y]) => plan.push(fillPoly([[x, y], [x + 6, y], [x + 6, y + 6], [x, y + 6]])));
  [[46, 127], [51, 130], [48, 134], [53, 135], [46, 136], [51, 125]].forEach(([x, y]) => plan.push(fillPoly([[x, y], [x + 2.4, y], [x + 2.4, y + 2.4], [x, y + 2.4]])));
  plan.push({ t: 'kd', d: smooth([[61, 129], [66, 112], [77, 99], [110, 98], [140, 98], [148, 91], [152, 78], [165, 66], [177, 61]]) });
  const pin = [curve([[182, 62], [176.5, 53], [175, 46], [178, 40], [182, 38.5], [186, 40], [189, 46], [187.5, 53], [182, 62]], 'k'), fill(ellipsePts(182, 46.5, 2.6, 2.6, 0, 360, 0, 0.02, 40))];
  S.cismap = [L(0, plan), L(-1.5, pin, { y: -6 })];
}

// The Locke essays: law (the scales) and politeness (a request in a speech bubble), and the commendation
seed(26);
{
  const page = (x0, rot, inner) => {
    const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), cx = x0 + 40, cy = 95;
    const T = ([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
    return [paper([[x0, 40], [x0 + 80, 40], [x0 + 80, 150], [x0, 150]].map(T)), poly([[x0, 40], [x0 + 80, 40], [x0 + 80, 150], [x0, 150], [x0, 40]].map(T), 'k'),
      ...inner(T), ...[0, 1, 2].map(k => line(...T([x0 + 12, 128 + k * 6]), ...T([x0 + 68 - (k === 2 ? 22 : 0), 128 + k * 6]), 'k1', { over: 0.2, bow: 0.01 }))];
  };
  const scales = T => {
    const out = [line(...T([70, 64]), ...T([70, 116]), 'k'), line(...T([58, 118]), ...T([82, 118]), 'k'), line(...T([46, 70]), ...T([94, 70]), 'k'), ellipse(...T([70, 61]), 2.4, 2.4, 'k1')];
    [50, 90].forEach(x => out.push(line(...T([x, 71]), ...T([x - 7, 92]), 'k1', { over: 0.1 }), line(...T([x, 71]), ...T([x + 7, 92]), 'k1', { over: 0.1 }), curve([T([x - 9, 92]), T([x, 99]), T([x + 9, 92])], 'k')));
    return out;
  };
  const bubble = T => [curve([T([146, 66]), T([171, 61]), T([196, 66]), T([199, 82]), T([192, 96]), T([168, 99]), T([160, 99]), T([150, 110]), T([152, 98]), T([143, 92]), T([142, 78]), T([146, 66])], 'k', 0.2),
    line(...T([152, 74]), ...T([188, 74]), 'k1'), line(...T([152, 81]), ...T([190, 81]), 'k1'), line(...T([152, 88]), ...T([176, 88]), 'k1')];
  const ros = []; { const pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * 2 * Math.PI, k = 1 + 0.1 * Math.cos(a * 12); pts.push([120 + Math.cos(a) * 11 * k, 30 + Math.sin(a) * 11 * k]); } ros.push(curve(pts, 'k1', 0.05), fill(ellipsePts(120, 30, 6, 6, 0, 360, 0, 0.02, 30)), poly([[114, 39], [108, 58], [113, 55], [116, 60], [119, 41]], 'k1'), poly([[126, 39], [132, 58], [127, 55], [124, 60], [121, 41]], 'k1')); }
  S.locke = [L(0.4, page(26, -7, scales)), L(0, page(134, 6, bubble)), L(-1.4, ros, { y: -6 })];
}

// Modelling the Other: two heads facing each other, each picturing the other
seed(31);
{
  const back = [[52, 152], [54, 130], [48, 115], [42, 99], [41.5, 80], [47, 63], [59, 51], [76, 46.5]];
  const face = [[76, 46.5], [87, 51.5], [92, 61], [93, 69], [96.5, 76.5], [102, 84.5], [97.5, 88], [96, 90.5], [98, 93.5], [95, 96.5], [96.8, 100], [93, 106], [86.5, 110], [80.5, 115], [79, 127], [81, 152]];
  const head = [curve(back, 'k'), curve(face, 'k', 0.15), curve([[63, 80], [58, 82], [57, 88], [60.5, 93], [64, 91.5]], 'k1'), line(83, 70.5, 87.5, 71.5, 'k1', { over: 0.2 }), ...hatch([[43, 98], [42.5, 80], [48, 63.5], [60, 52.5], [76, 48], [83, 51], [66, 56], [55, 69], [51, 90]], 118, 2.9)];
  const mini = (cx, cy, s, flip) => { const tr = p => [cx + (flip ? -1 : 1) * (p[0] - 72) * s, cy + (p[1] - 82) * s]; return [curve(back.slice(2).map(tr), 'k1', 0.03), curve(face.slice(0, 14).map(tr), 'k1', 0.03)]; };
  const bub = (cx, cy, rx, ry) => { const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * 2 * Math.PI, k = 1 + 0.1 * Math.abs(Math.sin(a * 4.5)); pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return pts; };
  const thought = [curve(bub(82, 22, 25, 15.5), 'k1', 0.1), ellipse(98, 43, 2.4, 2.1, 'k1'), ellipse(102.5, 49, 1.4, 1.3, 'k1'), ...mini(82, 23, 0.3, true)];
  S.other = [L(0, [...head, ...mirror(head)]), L(-1.3, [...thought, ...mirror(thought)], { y: -8 })];
}

// VPS Veritas: the tanker, with the sea in front and behind
seed(41);
{
  const wave = (y, x0, x1, amp, len, t) => { const pts = []; for (let x = x0; x <= x1; x += len / 4) pts.push([x, y + Math.sin((x - x0) / len * 2 * Math.PI) * amp + rnd(-0.3, 0.3)]); return curve(pts, t, 0.1); };
  const ship = [
    curve([[40, 100], [45, 111], [57, 121.5], [80, 122], [184, 122], [193, 111], [199, 97]], 'k'), line(40, 100, 199, 97, 'k', { bow: 0.004 }), line(45, 107, 195, 104.5, 'k1', { bow: 0.003 }),
    fill([[47, 113.5], [56, 121], [80, 121.5], [183, 121.5], [190.5, 112.5], [150, 113], [100, 113.5]]),
    poly([[50, 100], [50, 72], [80, 72], [80, 100]], 'k'), line(45, 71.5, 85, 71.5, 'k'),
    ...[80, 89].flatMap(y => [55, 63, 71].map(x => line(x, y, x + 4, y, 'k1', { over: 0.1 }))),
    poly([[59, 71.5], [61, 55], [71, 55], [73, 71.5]], 'k'), fillPoly([[60.5, 59], [71.5, 59], [72, 63.5], [60, 63.5]]),
    line(85, 95, 192, 93.5, 'k1', { bow: 0.003 }), line(130, 97.5, 130, 62, 'k'), line(130, 64.5, 158, 57, 'k1'), line(158, 57, 158, 80, 'k1', { over: 0.1 }), curve([[158, 80], [158, 83.5], [155.2, 83.5], [155, 81]], 'k1', 0.05),
    ...[92, 105, 118, 131, 144, 157, 170, 183].map(x => line(x, 94.6, x, 98.5, 'k1', { over: 0.1 })),
    wave(127, 8, 232, 2.2, 26, 'k'),
  ];
  const smoke = [curve([[66, 52], [61, 45], [67, 39], [61, 32], [67, 25], [62, 18]], 'k1'), ellipse(74, 34, 3.5, 2.6, 'k1'), ellipse(80, 24, 4.2, 3, 'k1')];
  const far = [wave(132, -60, 300, 1.8, 30, 'k1'), wave(141, -40, 280, 1.5, 24, 'k1')];
  const near = [wave(150, -80, 320, 3.2, 40, 'k'), wave(162, -60, 300, 2.6, 34, 'k1')];
  [[10, 172], [70, 176], [150, 170], [210, 178]].forEach(([x, y]) => near.push(curve([[x, y], [x + 6, y - 3.5], [x + 12, y], [x + 18, y - 3]], 'k1', 0.1)));
  S.vps = [L(0, [...ship, ...smoke]), L(2.4, far, { y: -14 }), L(-2.2, near, { y: 10 })];
}

// Learning what to prove: mathematics as a tree. Roots are the axioms, the trunk is the library,
// every proved result is a branch that later results grow from; fruit are results, a few branches are cut back.
seed(53);
{
  const roots = [line(18, 134, 222, 134, 'k1', { bow: 0.004 })];
  [[-62, 30], [-34, 36], [-10, 40], [16, 38], [42, 34], [66, 26]].forEach(([dx, len], i) => {
    const x0 = 120 + dx * 0.08, a = [x0, 135], m = [120 + dx * 0.45, 135 + len * 0.55], e = [120 + dx, 135 + len];
    roots.push(curve([a, m, e], i % 2 ? 'k' : 'k1'));
    if (len > 30) roots.push(curve([m, [m[0] + dx * 0.25, m[1] + 9], [m[0] + dx * 0.32 + rnd(-4, 4), m[1] + 16]], 'k1'));
  });
  const trunk = [fill([[110, 135], [112.5, 122], [114.5, 108], [115, 96], [125, 96], [125.5, 108], [127.5, 122], [131, 135], [124, 132], [116, 132]]),
    ...hatch([[121, 100], [125, 100], [126.5, 118], [128.5, 132], [122, 132]], 80, 2.2, { t: 'k1' })];
  const levels = [[], [], [], [], []], tips = [], cut = [];
  const grow = (x, y, a, len, d) => {
    const e = [x + Math.sin(a) * len, y - Math.cos(a) * len], m = [(x + e[0]) / 2 + Math.cos(a) * len * 0.08 * (rnd() - 0.5), (y + e[1]) / 2 + Math.sin(a) * len * 0.08];
    levels[d].push(curve([[x, y], m, e], d === 0 ? 'k2' : d < 2 ? 'k' : 'k1', 0.1));
    if (d === 4) { const r = rnd(); if (r < 0.42) tips.push(fill(ellipsePts(e[0], e[1] - 1, 2.6, 2.6, 0, 360, 0, 0.03, 40))); else if (r < 0.7) tips.push(fill(ellipsePts(e[0] + Math.sin(a) * 2.6, e[1] - Math.cos(a) * 2.6, 3.6, 1.4, 0, 360, a * 180 / Math.PI - 90, 0.02, 40))); else tips.push(ellipse(e[0], e[1], 1.7, 1.7, 'k1')); return; }
    if (d >= 2 && rnd() < 0.12) { cut.push(line(e[0] - 2.4, e[1] - 1.6, e[0] + 2.4, e[1] + 1.6, 'k1', { over: 0.1 })); return; } // cut back: not worth growing
    const n = d === 0 ? 3 : rnd() < 0.25 ? 3 : 2, spread = d === 0 ? 0.42 : 0.5;
    for (let i = 0; i < n; i++) grow(e[0], e[1], a + (n === 3 ? (i - 1) * spread : (i ? 1 : -1) * spread * 0.62) + rnd(-0.1, 0.1), len * rnd(0.68, 0.78), d + 1);
  };
  [-0.62, -0.06, 0.55].forEach((a, i) => grow(120 + (i - 1) * 3, 97, a, [27, 31, 26][i], 0));
  S.prove = [L(0, [...roots, ...trunk, ...levels.flat(), ...cut, ...tips])];
}

// Train Pointillism: a steam locomotive and tender, with the smoke in dots
seed(63);
{
  const rail = [line(4, 152, 236, 152, 'k2', { bow: 0.002 })];
  for (let x = 8; x < 234; x += 10) rail.push(line(x, 154.5, x - 2, 158.5, 'k1', { over: 0.1 }));
  const wheel = (x, y, r, spokes) => { const out = [ellipse(x, y, r, r, 'k'), fill(ellipsePts(x, y, r * 0.18, r * 0.18, 0, 360, 0, 0.02, 40))]; for (let a = 0; a < 360; a += 360 / spokes) { const q = a * Math.PI / 180; out.push(line(x + Math.cos(q) * r * 0.24, y + Math.sin(q) * r * 0.24, x + Math.cos(q) * r * 0.86, y + Math.sin(q) * r * 0.86, 'k1', { over: 0, bow: 0 })); } return out; };
  const tender = [poly([[14, 122], [14, 88], [60, 88], [60, 122], [14, 122]], 'k'), curve([[16, 88], [24, 80], [34, 78], [46, 79], [56, 84], [59, 88]], 'k1'), line(18, 104, 56, 104, 'k1'), ...wheel(26, 142, 9, 8), ...wheel(48, 142, 9, 8), line(14, 124, 60, 124, 'k1')];
  const cab = [paper([[62, 62], [94, 62], [94, 122], [62, 122]]), poly([[62, 122], [62, 64], [94, 64], [94, 122]], 'k'), line(57, 61, 99, 61, 'k2', { bow: 0.003 }), poly([[68, 72], [86, 72], [86, 90], [68, 90], [68, 72]], 'k1')];
  const boiler = [line(94, 84, 200, 84, 'k'), line(94, 120, 200, 120, 'k'), ...[120, 150, 176].map(x => line(x, 84, x, 120, 'k1', { over: 0.1 })),
    curve([[200, 82], [207, 84], [211, 94], [211, 110], [207, 120], [200, 122]], 'k'), line(200, 82, 200, 122, 'k1'), fill(ellipsePts(205, 102, 1.6, 1.6, 0, 360, 0, 0.02, 40)),
    poly([[189, 84], [190, 62], [198, 62], [199, 84]], 'k'), poly([[185, 61], [187, 54], [201, 54], [203, 61], [185, 61]], 'k'),
    curve([[132, 84], [133, 76], [139, 72.5], [145, 76], [146, 84]], 'k'), curve([[160, 84], [161, 79], [165, 77], [169, 79], [170, 84]], 'k1'),
    poly([[205, 72], [212, 72], [212, 79], [205, 79], [205, 72]], 'k1'),
    ...hatch([[96, 104], [198, 104], [198, 119], [96, 119]], 68, 3.2)];
  const gear = [line(62, 124, 222, 124, 'k1'), poly([[184, 124], [208, 124], [208, 136], [184, 136], [184, 124]], 'k'),
    ...wheel(110, 136, 15, 12), ...wheel(146, 136, 15, 12), ...wheel(182, 144, 7.5, 6), ...wheel(201, 144, 7.5, 6),
    line(110, 141, 146, 141, 'k2', { over: 0.5 }), line(146, 131, 184, 130, 'k', { over: 0.4 }),
    poly([[208, 124], [228, 150], [214, 150], [206, 136]], 'k1')];
  const smoke = [];
  [[192, 44, 7, 18], [178, 34, 9, 20], [158, 27, 11, 20], [134, 23, 12, 16], [108, 23, 12, 11], [84, 26, 11, 7]].forEach(([x, y, r, n]) => smoke.push(...stipple(ellipsePts(x, y, r * 1.25, r * 0.8, 0, 360, 0, 0.08, 24), n, { space: 2.6, rmin: 0.6, rmax: 1.2 })));
  smoke.sort((a, b) => b.cx - a.cx);
  S.train = [L(0, [...rail, ...tender, ...cab, ...boiler, ...gear]), L(1.2, [{ t: 'p', dots: smoke }], { y: -4 })];
}

// gvhackathon.com: the laptop, and the stopwatch of a seven-day build
seed(71);
{
  const laptop = [poly([[64, 106], [64, 36], [176, 36], [176, 106]], 'k'), poly([[72, 98], [72, 44], [168, 44], [168, 98], [72, 98]], 'k1'),
    poly([[64, 106], [176, 106], [194, 126], [46, 126], [64, 106]], 'k'), line(46, 127, 194, 127, 'k2', { bow: 0.003 }), poly([[107, 116.5], [133, 116.5], [134, 123], [106, 123], [107, 116.5]], 'k1'),
    poly([[103, 58], [93, 70], [103, 82]], 'k2'), line(122, 55, 114, 85, 'k2'), poly([[131, 58], [141, 70], [131, 82]], 'k2'),
    ...hatch([[52, 129], [188, 129], [180, 135], [60, 135]], 0, 2.2, { min: 4 })];
  for (let row = 0; row < 2; row++) { const y = 109.5 + row * 3.8, x0 = 66 - row * 3.2, x1 = 174 + row * 3.2; for (let x = x0; x < x1; x += 7.2) laptop.push(line(x, y, x + 4.4, y, 'k1', { over: 0, bow: 0 })); }
  const watch = [ellipse(200, 52, 15, 15, 'k'), line(200, 33, 200, 37, 'k1'), poly([[195.5, 31], [204.5, 31]], 'k2'), line(211, 39, 214, 36, 'k1'), line(200, 52, 200, 42, 'k2', { over: 0 }), line(200, 52, 207, 55, 'k1', { over: 0 })];
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([u, v]) => watch.push(line(200 + u * 11, 52 + v * 11, 200 + u * 13.2, 52 + v * 13.2, 'k1', { over: 0 })));
  S.hack = [L(0, laptop), L(-1.3, watch, { x: 10, y: -6 })];
}

// Next: a symphony in movements I to IV, fanned out, with a baton across them
seed(81);
{
  const numeral = (n, x, y) => { const parts = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }[n].split(''), w = parts.length * 4.4, out = []; let cx = x - w / 2 + 2; parts.forEach(ch => { if (ch === 'I') out.push([[cx, y], [cx, y + 7]]); else { out.push([[cx - 1, y], [cx + 1.8, y + 7], [cx + 4.6, y]]); cx += 2.4; } cx += 4.4; }); return out; };
  const page = (rot, n, full) => {
    const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), T = ([x, y]) => [120 + (x - 120) * c - (y - 178) * s, 178 + (x - 120) * s + (y - 178) * c];
    const items = [paper([[92, 160], [92, 70], [148, 70], [148, 160]].map(T)), poly([[92, 160], [92, 70], [148, 70], [148, 160], [92, 160]].map(T), 'k')];
    numeral(n, 120, 76).forEach(seg => items.push(seg.length === 2 ? line(...T(seg[0]), ...T(seg[1]), 'k1', { over: 0.1 }) : poly(seg.map(T), 'k1')));
    if (full) {
      [94, 114, 134].forEach(y0 => { for (let k = 0; k < 3; k++) items.push(line(...T([98, y0 + k * 4]), ...T([142, y0 + k * 4 + rnd(-0.3, 0.3)]), 'k1', { over: 0.2, bow: 0.004 })); });
      [[106, 96], [116, 92], [126, 98], [136, 94], [104, 118], [114, 116], [124, 120], [134, 114], [110, 136], [122, 140], [134, 138]].forEach(([x, y]) => items.push(fill(ellipsePts(...T([x, y]), 2.2, 1.6, 0, 360, rot - 24, 0.03, 40))));
    }
    return items;
  };
  S.coda = [L(0.6, [...page(-36, 1, false), ...page(-12, 2, false), ...page(12, 3, false)]), L(0, page(36, 4, true)), L(-1, [line(62, 150, 196, 58, 'k1', { over: 0.2, bow: 0.006 }), fill(ellipsePts(65.5, 147.6, 6.5, 2.6, 0, 360, -34.5, 0.02, 30))])];
}

// The corridor: the horns along the right wall and the strings along the left, straight from the score.
// piece.svg is a piano roll: x is time (5940 across the piece), y is pitch within each instrument group's band.
const svgText = fs.readFileSync(ROOT + 'static/score/piece.svg', 'utf8');
const all = [...svgText.match(/ d="([^"]+)"/)[1].matchAll(/M([\d.]+) ([\d.]+)h([\d.]+)/g)].map(m => [+m[1] * LEN / 5940, +m[2]]);
const voice = (lo, hi, gap) => {
  const sel = all.filter(n => n[1] >= lo && n[1] <= hi).sort((a, b) => a[0] - b[0]), out = [];
  let last = -9;
  for (const [t, y] of sel) {
    if (t - last < gap) continue;
    last = t;
    out.push(Math.round(t * 10), Math.round(-3 + (y - lo) / (hi - lo) * 13)); // staff step: 0 is the top line, 8 the bottom
  }
  return out;
};
const notes = { R: voice(246, 366, 0.8), L: voice(990, 1090, 0.8) };

// compact output: each item as [kind, data]
const pack = layers => layers.map(l => ({ dz: l.dz, x: l.x, y: l.y, s: l.s, i: l.items.map(it => it.t === 'p' ? ['p', it.dots.flatMap(d => [d.cx, d.cy, d.r])] : it.t === 'd' ? ['p', [it.cx, it.cy, it.r]] : [it.t, it.d]) }));
const world = { scenes: Object.fromEntries(Object.entries(S).map(([k, v]) => [k, pack(v)])), notes };
const js = '// Generated by _tools/ink/world.mjs; edit that file, not this one.\nwindow.INK_WORLD = ' + JSON.stringify(world) + ';\n';
fs.mkdirSync(ROOT + 'static/ink', { recursive: true });
fs.writeFileSync(ROOT + 'static/ink/world.js', js);
console.log('static/ink/world.js', (js.length / 1024).toFixed(1), 'KB;', 'notes R', notes.R.length / 2, 'L', notes.L.length / 2, ';', Object.entries(S).map(([k, v]) => k + ' ' + v.reduce((n, l) => n + l.items.length, 0)).join(', '));
