// The ink world behind the homepage: one drawing per project, placed along 4part's timeline, and one pen
// line, the thread, that runs from each drawing to the next. Every drawing has an opening the camera flies
// through, and in several of them the thread becomes part of the drawing.
//   node _tools/ink/world.mjs      writes static/ink/world.js
// Drawings are pen centrelines in a 240 x 180 box (they may spill over it); static/ink/stage.js turns them
// into brush strokes. For each scene:
//   S      its size in the world (1 = the box is 240 units wide)
//   look   the point the camera faces while you read the section
//   gap    the point the camera flies through
//   tin    where the thread arrives in the drawing, and tout where it leaves for the next one;
//          when they differ, a line of the drawing joins them
import fs from 'fs';
import { seed, rnd, line, poly, curve, ellipse, ellipsePts, fill, fillPoly, hatch, stipple, mirror, smooth } from './lib.mjs';
const ROOT = new URL('../../', import.meta.url).pathname;

// a layer: items in drawing order, at a depth (dz, in units behind the scene's plane), offset and scale
const L = (dz, items, o = {}) => ({ dz, x: o.x || 0, y: o.y || 0, s: o.s || 1, items });
const paper = pts => ({ ...fillPoly(pts), t: 'w' });
const along = (pts, step) => { const out = []; let acc = step * 0.5; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]); for (; acc < len; acc += step) out.push({ x: a[0] + (b[0] - a[0]) * acc / len, y: a[1] + (b[1] - a[1]) * acc / len, a: Math.atan2(b[1] - a[1], b[0] - a[0]) }); acc -= len; } return out; };
// move every point of some items (paths and dots) through fn
const xform = (items, fn) => items.map(it => {
  if (it.t === 'd') { const [x, y] = fn([it.cx, it.cy]); return { ...it, cx: +x.toFixed(1), cy: +y.toFixed(1) }; }
  if (it.dots) return { ...it, dots: it.dots.map(d => { const [x, y] = fn([d.cx, d.cy]); return { ...d, cx: +x.toFixed(1), cy: +y.toFixed(1) }; }) };
  return { ...it, d: it.d.replace(/([MLCQ])([^MLCQZ]*)/g, (m, cmd, nums) => { const v = nums.trim().split(/\s+/).map(Number), out = []; for (let i = 0; i + 1 < v.length; i += 2) { const [x, y] = fn([v[i], v[i + 1]]); out.push(x.toFixed(1), y.toFixed(1)); } return cmd + out.join(' '); }) };
});
const S = {};
const scene = (id, S_, look, gap, tin, tout, layers) => { S[id] = { S: S_, look, gap, tin, tout: tout || tin, layers }; };

// World Scholar's Cup: a laurel wreath to fly through, with the cup on top
seed(11);
{
  const C = [120, 104], R = 78, stem = [];
  for (let a = 97; a <= 251; a += 7) { const q = a * Math.PI / 180; stem.push([C[0] + Math.cos(q) * R, C[1] + Math.sin(q) * R]); }
  const sprig = [curve(stem, 'k', 0.3)], marks = along(stem, 8.4);
  marks.forEach((p, i) => {
    const k = 1 - 0.45 * i / marks.length;
    [-1, 1].forEach(side => { const a = p.a + side * 0.62, nx = -Math.sin(p.a) * side, ny = Math.cos(p.a) * side; sprig.push(fill(ellipsePts(p.x + nx * 4.4 * k + Math.cos(a) * 3.2 * k, p.y + ny * 4.4 * k + Math.sin(a) * 3.2 * k, 7.2 * k, 2.7 * k, 0, 360, a * 180 / Math.PI, 0.02, 30))); });
  });
  sprig.push(fill(ellipsePts(stem[stem.length - 1][0] + 3, stem[stem.length - 1][1] - 4, 5, 2.2, 0, 360, -70, 0.02, 30)));
  const bow = [curve([[120, 183], [109, 175], [101, 181], [107, 190], [120, 183]], 'k'), curve([[120, 183], [114, 194], [106, 205]], 'k1'), fill(ellipsePts(120, 183, 3.4, 3, 0, 360, 0, 0.03, 30))];
  const cup0 = [
    ellipse(120, 44, 34, 6.5, 'k', { a0: 180 }),
    curve([[86, 45], [87, 60], [93, 76], [104, 89], [120, 95], [136, 89], [147, 76], [153, 60], [154, 45]], 'k'),
    curve([[88, 52], [75, 50], [67, 58], [69, 70], [79, 78], [94, 80]], 'k'), curve([[152, 52], [165, 50], [173, 58], [171, 70], [161, 78], [146, 80]], 'k'),
    line(114, 95, 116, 111, 'k'), line(126, 95, 124, 111, 'k'), ellipse(120, 113.5, 8.5, 3.4, 'k', { a0: 200 }),
    line(116, 117, 112, 128, 'k'), line(124, 117, 128, 128, 'k'),
    poly([[104, 129], [100, 146], [140, 146], [136, 129], [104, 129]], 'k'), line(95, 146.5, 145, 146.5, 'k2', { bow: 0.004 }),
    ...hatch([[127, 51], [153, 48], [151, 63], [144, 78], [133, 88], [125, 90]], 62, 3.1), ...hatch([[127, 130], [136, 130], [139.5, 145], [128, 145]], 74, 2.5),
  ];
  const cup = xform(cup0, ([u, v]) => [120 + (u - 120) * 0.5, 28 + (v - 146.5) * 0.5]);
  const sparks = [line(152, -18, 152, -6, 'k1'), line(146, -12, 158, -12, 'k1'), line(84, -4, 84, 3, 'k1'), line(80.5, -0.5, 87.5, -0.5, 'k1')];
  scene('wsc', 1.15, [120, 96], [120, 104], [120, 150], null, [
    L(0, [...sprig, ...mirror(sprig), ...bow, ...mirror(bow), ...cup]), L(-1.2, sparks)]);
}

// Writing 4part: the four parts on a stave, and under them the training loss the parts are named after.
// The thread is the loss curve. The camera flies between the stave and the graph.
seed(4);
{
  const staff = [];
  [20, 28, 36, 44, 52].forEach(y => staff.push(line(10, y, 230, y + rnd(-0.6, 0.6), 'k1', { bow: 0.004, over: 0.3 })));
  staff.push(line(10, 18, 10, 54, 'k2', { over: 0.4 }));
  [65, 120, 175].forEach(x => staff.push(line(x, 20, x, 52, 'k1', { over: 0.3 })));
  staff.push(line(225, 20, 225, 52, 'k1', { over: 0.3 }), line(230, 18, 230, 54, 'k2', { over: 0.4 }));
  const roman = (s, x) => { const out = []; let cx = x - s.length * 2.6; for (const ch of s) { if (ch === 'I') out.push(line(cx, 0, cx, 9, 'k1')); else { out.push(poly([[cx - 1.4, 0], [cx + 1.8, 9], [cx + 5, 0]], 'k1')); cx += 2.6; } cx += 5.2; } return out; };
  staff.push(...roman('I', 38), ...roman('II', 93), ...roman('III', 148), ...roman('IV', 200));
  const N = [[24, 16], [37, 20], [50, 24], [78, 28], [92, 32], [106, 36], [134, 40], [148, 48], [162, 40], [190, 48], [203, 52], [216, 52]];
  const notes = [];
  N.forEach(([x, y]) => { notes.push(fill(ellipsePts(x, y, 4.6, 3.2, 0, 360, -24, 0.03, 30))); notes.push(y < 36 ? line(x - 4.2, y + 1, x - 4.2, y + 25, 'k1', { over: 0.2 }) : line(x + 4.2, y - 1, x + 4.2, y - 25, 'k1', { over: 0.2 })); });
  const G = N.map(([x, y]) => [x, 130 + (y - 16) * 1.12]);
  const loss = [[16, 127], ...G, [226, 170]];
  const graph = [curve(loss, 'k', 0.15), line(14, 124, 14, 176, 'k1', { over: 0.3 }), line(14, 176, 228, 176, 'k1', { bow: 0.004, over: 0.3 }), ellipse(148, G[7][1], 6, 6, 'k1', { jit: 0.05 })];
  scene('writing', 1.2, [120, 92], [120, 92], loss[0], loss[loss.length - 1], [L(0, [...graph, ...staff, ...notes])]);
}

// CIS-MAP: the floor plan. The thread comes in at the door's QR code and walks the route to the pin,
// and the camera flies through the pin's room.
seed(21);
{
  const route = [[61, 129], [66, 112], [77, 99], [110, 98], [140, 98], [148, 91], [152, 78], [165, 66], [177, 61]];
  const plan = [{ t: 'kd', d: smooth(route) },
    line(28, 34, 212, 34, 'k'), line(212, 34, 212, 150, 'k'), line(212, 150, 112, 150, 'k'), line(96, 150, 28, 150, 'k'), line(28, 150, 28, 34, 'k'),
    line(28, 88, 70, 88, 'k'), line(84, 88, 140, 88, 'k'), line(154, 88, 212, 88, 'k'), line(28, 108, 60, 108, 'k'), line(74, 108, 160, 108, 'k'), line(174, 108, 212, 108, 'k'),
    line(90, 34, 90, 88, 'k'), line(150, 34, 150, 88, 'k'), line(80, 108, 80, 150, 'k'), line(158, 108, 158, 150, 'k'),
  ];
  for (let x = 165; x <= 205; x += 5.7) plan.push(line(x, 114, x, 144, 'k1', { over: 0.2 }));
  plan.push(line(168, 129, 203, 129, 'k1'), poly([[198, 125], [203.5, 129], [198, 133]], 'k1'), poly([[36, 118], [58, 118], [58, 140], [36, 140], [36, 118]], 'k1'));
  [[38, 120], [50, 120], [38, 132]].forEach(([x, y]) => plan.push(fillPoly([[x, y], [x + 6, y], [x + 6, y + 6], [x, y + 6]])));
  [[46, 127], [51, 130], [48, 134], [53, 135], [46, 136], [51, 125]].forEach(([x, y]) => plan.push(fillPoly([[x, y], [x + 2.4, y], [x + 2.4, y + 2.4], [x, y + 2.4]])));
  const pin = [curve([[182, 62], [176.5, 53], [175, 46], [178, 40], [182, 38.5], [186, 40], [189, 46], [187.5, 53], [182, 62]], 'k'), fill(ellipsePts(182, 46.5, 2.6, 2.6, 0, 360, 0, 0.02, 40))];
  scene('cismap', 1.25, [120, 92], [182, 76], route[0], route[route.length - 1], [L(0, [...plan, ...pin])]);
}

// The Locke essays, law (the scales) and politeness (a request in a speech bubble), and the commendation.
// The camera flies between the two essays.
seed(26);
{
  const page = (x0, rot, inner) => {
    const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), cx = x0 + 40, cy = 95;
    const T = ([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
    return [paper([[x0, 40], [x0 + 80, 40], [x0 + 80, 150], [x0, 150]].map(T)), poly([[x0, 40], [x0 + 80, 40], [x0 + 80, 150], [x0, 150], [x0, 40]].map(T), 'k'),
      ...inner(T), ...[0, 1, 2].map(k => line(...T([x0 + 12, 128 + k * 6]), ...T([x0 + 68 - (k === 2 ? 22 : 0), 128 + k * 6]), 'k1', { over: 0.2, bow: 0.01 }))];
  };
  const scales = T => {
    const out = [line(...T([46, 64]), ...T([46, 116]), 'k'), line(...T([34, 118]), ...T([58, 118]), 'k'), line(...T([22, 70]), ...T([70, 70]), 'k'), ellipse(...T([46, 61]), 2.4, 2.4, 'k1')];
    [26, 66].forEach(x => out.push(line(...T([x, 71]), ...T([x - 7, 92]), 'k1', { over: 0.1 }), line(...T([x, 71]), ...T([x + 7, 92]), 'k1', { over: 0.1 }), curve([T([x - 9, 92]), T([x, 99]), T([x + 9, 92])], 'k')));
    return out;
  };
  const bubble = T => [curve([T([170, 66]), T([195, 61]), T([220, 66]), T([223, 82]), T([216, 96]), T([192, 99]), T([184, 99]), T([174, 110]), T([176, 98]), T([167, 92]), T([166, 78]), T([170, 66])], 'k', 0.2),
    line(...T([176, 74]), ...T([212, 74]), 'k1'), line(...T([176, 81]), ...T([214, 81]), 'k1'), line(...T([176, 88]), ...T([200, 88]), 'k1')];
  const ros = []; { const pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * 2 * Math.PI, k = 1 + 0.1 * Math.cos(a * 12); pts.push([120 + Math.cos(a) * 11 * k, 14 + Math.sin(a) * 11 * k]); } ros.push(curve(pts, 'k1', 0.05), fill(ellipsePts(120, 14, 6, 6, 0, 360, 0, 0.02, 30)), poly([[114, 23], [108, 42], [113, 39], [116, 44], [119, 25]], 'k1'), poly([[126, 23], [132, 42], [127, 39], [124, 44], [121, 25]], 'k1')); }
  scene('locke', 1.25, [120, 95], [120, 100], [120, 134], null, [L(0.4, page(2, -7, scales)), L(0, page(158, 6, bubble)), L(-1.4, ros)]);
}

// Modelling the Other: two heads facing each other, each picturing the other. The thread is the line
// of sight between them, and the camera passes just under it.
seed(31);
{
  const back = [[48, 152], [50, 130], [44, 115], [38, 99], [37.5, 80], [43, 63], [55, 51], [72, 46.5]];
  const face = [[72, 46.5], [83, 51.5], [88, 61], [89, 69], [92.5, 76.5], [98, 84.5], [93.5, 88], [92, 90.5], [94, 93.5], [91, 96.5], [92.8, 100], [89, 106], [82.5, 110], [76.5, 115], [75, 127], [77, 152]];
  const head = [curve(back, 'k'), curve(face, 'k', 0.15), curve([[59, 80], [54, 82], [53, 88], [56.5, 93], [60, 91.5]], 'k1'), line(79, 70.5, 83.5, 71.5, 'k1', { over: 0.2 }), ...hatch([[39, 98], [38.5, 80], [44, 63.5], [56, 52.5], [72, 48], [79, 51], [62, 56], [51, 69], [47, 90]], 118, 2.9)];
  const mini = (cx, cy, s, flip) => { const tr = p => [cx + (flip ? -1 : 1) * (p[0] - 68) * s, cy + (p[1] - 82) * s]; return [curve(back.slice(2).map(tr), 'k1', 0.03), curve(face.slice(0, 14).map(tr), 'k1', 0.03)]; };
  const bub = (cx, cy, rx, ry) => { const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * 2 * Math.PI, k = 1 + 0.1 * Math.abs(Math.sin(a * 4.5)); pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return pts; };
  const thought = [curve(bub(70, 14, 25, 15.5), 'k1', 0.1), ellipse(88, 36, 2.4, 2.1, 'k1'), ellipse(92, 43, 1.4, 1.3, 'k1'), ...mini(70, 15, 0.3, true)];
  const sight = [[87, 71], [153, 71]];
  scene('other', 1.2, [120, 92], [120, 98], sight[0], sight[1], [L(0, [{ t: 'kd', d: smooth(sight) }, ...head, ...mirror(head)]), L(-1.3, [...thought, ...mirror(thought)])]);
}

// VPS Veritas: the tanker on the sea. The thread is the sea it sails on, and the camera flies over the ship.
seed(41);
{
  const wavePts = (y, x0, x1, amp, len) => { const pts = []; for (let x = x0; x <= x1 + 0.01; x += len / 4) pts.push([x, y + Math.sin((x - x0) / len * 2 * Math.PI) * amp + rnd(-0.3, 0.3)]); return pts; };
  const sea = wavePts(127, 0, 240, 2.2, 24);
  const ship = [
    curve(sea, 'k', 0.1),
    curve([[40, 100], [45, 111], [57, 121.5], [80, 122], [184, 122], [193, 111], [199, 97]], 'k'), line(40, 100, 199, 97, 'k', { bow: 0.004 }), line(45, 107, 195, 104.5, 'k1', { bow: 0.003 }),
    fill([[47, 113.5], [56, 121], [80, 121.5], [183, 121.5], [190.5, 112.5], [150, 113], [100, 113.5]]),
    poly([[50, 100], [50, 72], [80, 72], [80, 100]], 'k'), line(45, 71.5, 85, 71.5, 'k'),
    ...[80, 89].flatMap(y => [55, 63, 71].map(x => line(x, y, x + 4, y, 'k1', { over: 0.1 }))),
    poly([[59, 71.5], [61, 55], [71, 55], [73, 71.5]], 'k'), fillPoly([[60.5, 59], [71.5, 59], [72, 63.5], [60, 63.5]]),
    line(85, 95, 192, 93.5, 'k1', { bow: 0.003 }), line(130, 97.5, 130, 62, 'k'), line(130, 64.5, 158, 57, 'k1'), line(158, 57, 158, 80, 'k1', { over: 0.1 }), curve([[158, 80], [158, 83.5], [155.2, 83.5], [155, 81]], 'k1', 0.05),
    ...[92, 105, 118, 131, 144, 157, 170, 183].map(x => line(x, 94.6, x, 98.5, 'k1', { over: 0.1 })),
  ];
  const smoke = [curve([[66, 52], [61, 45], [67, 39], [61, 32], [67, 25], [62, 18]], 'k1'), ellipse(74, 34, 3.5, 2.6, 'k1'), ellipse(80, 24, 4.2, 3, 'k1')];
  const wave = (y, x0, x1, amp, len, t) => curve(wavePts(y, x0, x1, amp, len), t, 0.1);
  const far = [wave(134, -80, 320, 1.8, 30, 'k1'), wave(143, -60, 300, 1.5, 24, 'k1')];
  const near = [wave(156, -100, 340, 3.2, 40, 'k'), wave(170, -80, 320, 2.6, 34, 'k1')];
  [[-10, 182], [50, 186], [170, 180], [240, 188]].forEach(([x, y]) => near.push(curve([[x, y], [x + 6, y - 3.5], [x + 12, y], [x + 18, y - 3]], 'k1', 0.1)));
  scene('vps', 1.2, [120, 96], [166, 30], sea[0], sea[sea.length - 1], [L(0, [...ship, ...smoke]), L(2.4, far), L(-2.2, near)]);
}

// Learning what to prove: mathematics as a tree. Roots are the axioms, the trunk is the library, and every
// proved result is a branch that later results grow from; fruit are results, and a few branches are cut back.
// The thread comes in as a root, climbs the trunk and leaves from the crown, and the camera rises over the top.
seed(53);
{
  const roots = [line(10, 134, 230, 134, 'k1', { bow: 0.004 })];
  let climb = null;
  [[-62, 30], [-34, 36], [-10, 40], [16, 38], [42, 34], [66, 26]].forEach(([dx, len], i) => {
    const a = [120 + dx * 0.08, 135], m = [120 + dx * 0.45, 135 + len * 0.55], e = [120 + dx, 135 + len];
    if (dx === 42) { climb = [e, m, a, [121.5, 116], [120.5, 97], [120, 70], [119.5, 40], [120, 6]]; return; }
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
  scene('prove', 1.3, [120, 92], [120, -16], climb[0], climb[climb.length - 1], [L(0, [curve(climb, 'k', 0.2), ...roots, ...trunk, ...levels.flat(), ...cut, ...tips])]);
}

// Train Pointillism: a steam locomotive and tender on a viaduct. The thread is the rail, and the camera
// flies through the middle arch.
seed(63);
{
  const up = items => xform(items, ([u, v]) => [u, v - 60]);
  const rail = [[2, 92], [238, 92]];
  const deck = [line(0, 100, 240, 100, 'k'), line(0, 108, 240, 108, 'k1')];
  for (let x = 6; x < 236; x += 10) deck.push(line(x, 94.5, x - 2, 98.5, 'k1', { over: 0.1 }));
  const arches = [];
  [40, 120, 200].forEach(cx => {
    const pts = [[cx - 30, 198]]; for (let a = 180; a <= 360; a += 15) { const q = a * Math.PI / 180; pts.push([cx + Math.cos(q) * 30, 146 + Math.sin(q) * 30]); } pts.push([cx + 30, 198]);
    pts.splice(1, 0, [cx - 30, 146]); pts.splice(pts.length - 1, 0, [cx + 30, 146]);
    arches.push(poly(pts.slice(0, 2), 'k'), curve(pts.slice(1, -1), 'k', 0.2), poly(pts.slice(-2), 'k'));
    for (let a = 195; a <= 345; a += 21) { const q = a * Math.PI / 180; arches.push(line(cx + Math.cos(q) * 30, 146 + Math.sin(q) * 30, cx + Math.cos(q) * 38, 146 + Math.sin(q) * 38, 'k1', { over: 0.1 })); }
  });
  arches.push(line(-20, 199, 260, 199, 'k1', { bow: 0.003 }), ...hatch([[2, 110], [8, 110], [8, 196], [2, 196]], 90, 2.4), ...hatch([[232, 110], [238, 110], [238, 196], [232, 196]], 90, 2.4));
  const wheel = (x, y, r, spokes) => { const out = [ellipse(x, y, r, r, 'k'), fill(ellipsePts(x, y, r * 0.18, r * 0.18, 0, 360, 0, 0.02, 40))]; for (let a = 0; a < 360; a += 360 / spokes) { const q = a * Math.PI / 180; out.push(line(x + Math.cos(q) * r * 0.24, y + Math.sin(q) * r * 0.24, x + Math.cos(q) * r * 0.86, y + Math.sin(q) * r * 0.86, 'k1', { over: 0, bow: 0 })); } return out; };
  const tender = [paper([[14, 88], [60, 88], [60, 122], [14, 122]]), poly([[14, 122], [14, 88], [60, 88], [60, 122], [14, 122]], 'k'), curve([[16, 88], [24, 80], [34, 78], [46, 79], [56, 84], [59, 88]], 'k1'), line(18, 104, 56, 104, 'k1'), ...wheel(26, 142, 9, 8), ...wheel(48, 142, 9, 8), line(14, 124, 60, 124, 'k1')];
  const cab = [paper([[62, 62], [94, 62], [94, 122], [62, 122]]), poly([[62, 122], [62, 64], [94, 64], [94, 122]], 'k'), line(57, 61, 99, 61, 'k2', { bow: 0.003 }), poly([[68, 72], [86, 72], [86, 90], [68, 90], [68, 72]], 'k1')];
  const boiler = [paper([[94, 84], [207, 84], [211, 100], [207, 120], [94, 120]]), line(94, 84, 200, 84, 'k'), line(94, 120, 200, 120, 'k'), ...[120, 150, 176].map(x => line(x, 84, x, 120, 'k1', { over: 0.1 })),
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
  scene('train', 1.2, [120, 112], [120, 160], rail[0], rail[1], [
    L(0, [line(...rail[0], ...rail[1], 'k2', { bow: 0.002, over: 0 }), ...deck, ...arches, ...up([...tender, ...cab, ...boiler, ...gear])]),
    L(1.2, [{ t: 'p', dots: up(smoke.map(d => ({ ...d, t: 'd' }))).map(d => ({ cx: d.cx, cy: d.cy, r: d.r })) }], { y: -4 })]);
}

// gvhackathon.com: the laptop, and the stopwatch of a seven-day build. The camera flies through the screen.
seed(71);
{
  const laptop = [poly([[64, 106], [64, 36], [176, 36], [176, 106]], 'k'), poly([[72, 98], [72, 44], [168, 44], [168, 98], [72, 98]], 'k1'),
    paper([[64, 106], [176, 106], [194, 126], [46, 126]]), poly([[64, 106], [176, 106], [194, 126], [46, 126], [64, 106]], 'k'), line(46, 127, 194, 127, 'k2', { bow: 0.003 }), poly([[107, 116.5], [133, 116.5], [134, 123], [106, 123], [107, 116.5]], 'k1'),
    poly([[92, 58], [82, 70], [92, 82]], 'k2'), poly([[148, 58], [158, 70], [148, 82]], 'k2'),
    ...hatch([[52, 129], [188, 129], [180, 135], [60, 135]], 0, 2.2, { min: 4 })];
  for (let row = 0; row < 2; row++) { const y = 109.5 + row * 3.8, x0 = 66 - row * 3.2, x1 = 174 + row * 3.2; for (let x = x0; x < x1; x += 7.2) laptop.push(line(x, y, x + 4.4, y, 'k1', { over: 0, bow: 0 })); }
  const watch = [ellipse(214, 30, 15, 15, 'k'), line(214, 11, 214, 15, 'k1'), poly([[209.5, 9], [218.5, 9]], 'k2'), line(225, 17, 228, 14, 'k1'), line(214, 30, 214, 20, 'k2', { over: 0 }), line(214, 30, 221, 33, 'k1', { over: 0 })];
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([u, v]) => watch.push(line(214 + u * 11, 30 + v * 11, 214 + u * 13.2, 30 + v * 13.2, 'k1', { over: 0 })));
  scene('hack', 1.3, [120, 86], [120, 70], [120, 92], null, [L(0, laptop), L(-1.3, watch)]);
}

// Next: a symphony in movements I to IV, fanned out. The thread ends as the conductor's baton.
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
  const baton = [[62, 150], [196, 58]];
  scene('coda', 1.2, [120, 108], null, baton[0], baton[1], [L(0.6, [...page(-36, 1, false), ...page(-12, 2, false), ...page(12, 3, false)]), L(0, page(36, 4, true)),
    L(0, [line(...baton[0], ...baton[1], 'k', { over: 0, bow: 0.004 }), fill(ellipsePts(65.5, 147.6, 6.5, 2.6, 0, 360, -34.5, 0.02, 30))])]);
}

// Garland motifs: small pieces of each drawing, strung in mirrored arcs along the thread between one
// drawing and the next, so the last project's motif hands over to the next one's. In a 20-unit box.
seed(91);
const M = {};
{
  M.wsc = [fill(ellipsePts(0, 0, 9, 3.2, 0, 360, 0, 0.02, 30)), curve([[-11, 1.5], [-6, 0.6], [0, 0.2]], 'k1', 0.05)];
  M.writing = [fill(ellipsePts(-3.4, 6, 4.4, 3.1, 0, 360, -24, 0.03, 30)), line(0.6, 5, 0.6, -12, 'k1', { over: 0.1 }), curve([[0.6, -12], [5.6, -8.5], [8, -3]], 'k1', 0.05)];
  M.cismap = [curve([[0, 10], [-5, 2], [-6.4, -4], [-3.4, -9], [0, -10.3], [3.4, -9], [6.4, -4], [5, 2], [0, 10]], 'k', 0.05), fill(ellipsePts(0, -4, 2.2, 2.2, 0, 360, 0, 0.02, 30))];
  M.locke = [poly([[-7, -9.5], [7, -9.5], [7, 9.5], [-7, 9.5], [-7, -9.5]], 'k1'), line(-4.5, -4, 4.5, -4, 'k1', { over: 0.1 }), line(-4.5, 0, 4.5, 0, 'k1', { over: 0.1 }), line(-4.5, 4, 1.5, 4, 'k1', { over: 0.1 })];
  { const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * 2 * Math.PI, k = 1 + 0.12 * Math.abs(Math.sin(a * 3.5)); pts.push([Math.cos(a) * 10 * k, -2 + Math.sin(a) * 6.4 * k]); } M.other = [curve(pts, 'k1', 0.05), ellipse(-6, 7.5, 1.6, 1.4, 'k1'), ellipse(-8.5, 10.5, 0.9, 0.8, 'k1')]; }
  M.vps = [curve([[-11, 1], [-6, -4], [-0.5, 0.5]], 'k', 0.05), curve([[0.5, 0.5], [6, -4], [11, 1]], 'k', 0.05)];
  M.prove = [fill(ellipsePts(0, 3.5, 3.8, 3.8, 0, 360, 0, 0.03, 30)), curve([[0, -0.5], [0.6, -4], [1.6, -8]], 'k1', 0.05), fill(ellipsePts(4.6, -6.4, 3.6, 1.4, 0, 360, -30, 0.02, 30))];
  M.train = [{ t: 'p', dots: stipple(ellipsePts(0, 0, 9, 6.4, 0, 360, 0, 0.08, 24), 14, { space: 2.6, rmin: 0.7, rmax: 1.3 }) }];
  M.hack = [poly([[-4, -6], [-9, 0], [-4, 6]], 'k1'), line(2.2, -7.5, -1.2, 7.5, 'k1', { over: 0 }), poly([[4, -6], [9, 0], [4, 6]], 'k1')];
}

// compact output: each item as [kind, data]
const pack = layers => layers.map(l => ({ dz: l.dz, x: l.x, y: l.y, s: l.s, i: l.items.map(it => it.t === 'p' ? ['p', it.dots.flatMap(d => [d.cx, d.cy, d.r])] : it.t === 'd' ? ['p', [it.cx, it.cy, it.r]] : [it.t, it.d]) }));
const r1 = v => v && v.map(n => +n.toFixed(1));
const world = { scenes: Object.fromEntries(Object.entries(S).map(([k, v]) => [k, { S: v.S, look: v.look, gap: v.gap, tin: r1(v.tin), tout: r1(v.tout), layers: pack(v.layers) }])), motifs: Object.fromEntries(Object.entries(M).map(([k, v]) => [k, pack([L(0, v)])[0].i])) };
const js = '// Generated by _tools/ink/world.mjs; edit that file, not this one.\nwindow.INK_WORLD = ' + JSON.stringify(world) + ';\n';
fs.mkdirSync(ROOT + 'static/ink', { recursive: true });
fs.writeFileSync(ROOT + 'static/ink/world.js', js);
console.log('static/ink/world.js', (js.length / 1024).toFixed(1), 'KB;', Object.entries(S).map(([k, v]) => k + ' ' + v.layers.reduce((n, l) => n + l.items.length, 0)).join(', '));
