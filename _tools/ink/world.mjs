// The ink world behind the homepage: one pen-and-ink drawing per project, standing on (or lying flat on)
// an open ground, placed along 4part's timeline. One pen line, the thread, runs along the ground from each
// drawing to the next and climbs into each one, where it becomes part of the drawing.
//   node _tools/ink/world.mjs      writes static/ink/world.js
//
// World units: x right, y down (the ground is y = 0, so things standing up have negative y), z forward.
// A drawing is made of layers. Each layer is a flat sheet in the world: its pen centrelines are in the
// layer's own (u, v) units, and the sheet is placed with lay(): which way it faces (UP = standing, facing
// the camera; FLAT = lying on the ground, its top edge furthest away; LEAN = standing but tipped back;
// a yaw turns it), the world point where one of its own points goes, and a scale.
// For each scene:
//   thread  the pieces of the thread inside the drawing, in the order the pen draws them; static/ink/stage.js
//           joins one piece to the next (and one drawing to the next) with a line along the ground
//   read    how far in front of the drawing the camera is while you read the section. The camera runs on one
//           straight rail down the middle (x = 0), 125 units above the ground, so every drawing is placed
//           for the rail to pass through or beside it.
// static/ink/stage.js turns centrelines into brush strokes and draws everything in perspective.
import fs from 'fs';
import { seed, rnd, line, poly, curve, ellipse, ellipsePts, fill, fillPoly, hatch, stipple, mirror, smooth } from './lib.mjs';
const ROOT = new URL('../../', import.meta.url).pathname;
const R2 = Math.PI / 180;

const paper = pts => ({ ...fillPoly(pts), t: 'w' });
const along = (pts, step) => { const out = []; let acc = step * 0.5; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]); for (; acc < len; acc += step) out.push({ x: a[0] + (b[0] - a[0]) * acc / len, y: a[1] + (b[1] - a[1]) * acc / len, a: Math.atan2(b[1] - a[1], b[0] - a[0]) }); acc -= len; } return out; };
const xform = (items, fn) => items.map(it => {
  if (it.t === 'd') { const [x, y] = fn([it.cx, it.cy]); return { ...it, cx: +x.toFixed(1), cy: +y.toFixed(1) }; }
  if (it.dots) return { ...it, dots: it.dots.map(d => { const [x, y] = fn([d.cx, d.cy]); return { ...d, cx: +x.toFixed(1), cy: +y.toFixed(1) }; }) };
  return { ...it, d: it.d.replace(/([MLCQ])([^MLCQZ]*)/g, (m, cmd, nums) => { const v = nums.trim().split(/\s+/).map(Number), out = []; for (let i = 0; i + 1 < v.length; i += 2) { const [x, y] = fn([v[i], v[i + 1]]); out.push(x.toFixed(1), y.toFixed(1)); } return cmd + out.join(' '); }) };
});

// which way a sheet faces
const UP = (yaw = 0) => ({ U: [Math.cos(yaw * R2), 0, Math.sin(yaw * R2)], V: [0, 1, 0] });
const FLAT = (yaw = 0) => ({ U: [Math.cos(yaw * R2), 0, Math.sin(yaw * R2)], V: [Math.sin(yaw * R2), 0, -Math.cos(yaw * R2)], ground: true });
const LEAN = back => ({ U: [1, 0, 0], V: [0, Math.cos(back * R2), -Math.sin(back * R2)] });
// a layer: its items, facing b, with its own point `pivot` placed at world point `at`, at scale s
const lay = (items, b, at, pivot, s, o = {}) => ({
  items, U: b.U, V: b.V, s, ground: !!b.ground, top: !!o.top,
  o: [0, 1, 2].map(k => at[k] - s * (pivot[0] * b.U[k] + pivot[1] * b.V[k])),
});
const S = {};
// a scene; a thread piece is {L: layer index, pts, t: pen}, drawn first in its layer
const scene = (id, layers, thread, read) => {
  thread.forEach(p => layers[p.L].items.unshift({ t: p.t || 'k', d: smooth(p.pts) }));
  S[id] = { layers, thread: thread.map(p => ({ L: p.L, a: p.pts[0], b: p.pts[p.pts.length - 1] })), read };
};

// World Scholar's Cup: a laurel wreath standing on the ground, turned a little, with the cup on top.
// The thread comes up the ribbon, draws both stems (passing under the cup) and goes back down.
seed(11);
{
  const C = [120, 104], R = 78, left = [];
  for (let a = 97; a <= 251; a += 7) { const q = a * R2; left.push([C[0] + Math.cos(q) * R, C[1] + Math.sin(q) * R]); }
  const right = left.map(([x, y]) => [240 - x, y]);
  const leaves = [], marks = along(left, 8.4);
  marks.forEach((p, i) => {
    const k = 1 - 0.45 * i / marks.length;
    [-1, 1].forEach(side => { const a = p.a + side * 0.62, nx = -Math.sin(p.a) * side, ny = Math.cos(p.a) * side; leaves.push(fill(ellipsePts(p.x + nx * 4.4 * k + Math.cos(a) * 3.2 * k, p.y + ny * 4.4 * k + Math.sin(a) * 3.2 * k, 7.2 * k, 2.7 * k, 0, 360, a * 180 / Math.PI, 0.02, 30))); });
  });
  const tipL = left[left.length - 1];
  leaves.push(fill(ellipsePts(tipL[0] + 3, tipL[1] - 4, 5, 2.2, 0, 360, -70, 0.02, 30)));
  const bow = [curve([[120, 183], [109, 175], [101, 181], [107, 190], [120, 183]], 'k'), fill(ellipsePts(120, 183, 3.4, 3, 0, 360, 0, 0.03, 30))];
  const cup0 = [
    ellipse(120, 44, 34, 6.5, 'k', { a0: 180 }),
    curve([[86, 45], [87, 60], [93, 76], [104, 89], [120, 95], [136, 89], [147, 76], [153, 60], [154, 45]], 'k'),
    curve([[88, 52], [75, 50], [67, 58], [69, 70], [79, 78], [94, 80]], 'k'), curve([[152, 52], [165, 50], [173, 58], [171, 70], [161, 78], [146, 80]], 'k'),
    line(114, 95, 116, 111, 'k'), line(126, 95, 124, 111, 'k'), ellipse(120, 113.5, 8.5, 3.4, 'k', { a0: 200 }),
    line(116, 117, 112, 128, 'k'), line(124, 117, 128, 128, 'k'),
    poly([[104, 129], [100, 146], [140, 146], [136, 129], [104, 129]], 'k'),
    ...hatch([[127, 51], [153, 48], [151, 63], [144, 78], [133, 88], [125, 90]], 62, 3.1), ...hatch([[127, 130], [136, 130], [139.5, 145], [128, 145]], 74, 2.5),
  ];
  const cup = xform(cup0, ([u, v]) => [120 + (u - 120) * 0.5, 28 + (v - 146.5) * 0.5]);
  const sparks = [line(152, -18, 152, -6, 'k1'), line(146, -12, 158, -12, 'k1'), line(84, -4, 84, 3, 'k1'), line(80.5, -0.5, 87.5, -0.5, 'k1')];
  const path = [[121, 192], [120, 186], ...left, [104, 31.6], [120, 32.2], [136, 31.6], ...right.slice().reverse(), [120, 186], [119, 192]];
  scene('wsc', [
    lay([...leaves, ...mirror(leaves), ...bow, ...mirror(bow), ...cup], UP(18), [0, 0, 0], [120, 192], 1.2),
    lay(sparks, UP(18), [0, 0, -40], [120, 192], 1.2),
  ], [{ L: 0, pts: path }], 390);
}

// Writing 4part: the thread splits into the five lines of a stave lying on the ground like a road, with
// the melody's notes along it and a signpost for each part. On both sides, hills shaped like the training
// loss the parts are named after: falling, a dip for the local minimum in part III, then flat.
seed(4);
{
  const road = [], LANE = [92, 106, 120, 134, 148];
  LANE.forEach(u => { if (u === 120) return; road.push(curve([[120, 336], [u, 300], [u, 150], [u, 0], [u, -150], [u, -290], [120, -330]].map(([x, y], i, a) => i && i < a.length - 1 ? [x + rnd(-0.6, 0.6), y] : [x, y]), 'k1', 0.2)); });
  [145, 0, -145].forEach(v => road.push(line(91, v, 149, v, 'k1', { over: 0.3 })));
  road.push(line(91, -282, 149, -282, 'k1', { over: 0.3 }), line(91, -290, 149, -290, 'k2', { over: 0.3 }));
  const note = (p, v, up = true) => { const u = 92 + p * 7; return [fill(ellipsePts(u, v, 6.2, 8.4, 0, 360, 20, 0.03, 30)), line(u + (up ? -7.4 : 7.4), v - (up ? 1 : -1), u + (up ? -7.4 : 7.4), v - (up ? 40 : -40), 'k', { over: 0.1 })]; };
  const notes = [];
  [[1, 262], [2, 228], [3, 196], [3, 166], [4, 118], [5, 86], [5, 56], [6, 26], [8, -104], [7, -128], [6, -172], [5, -200], [6, -228], [4, -262]].forEach(([p, v]) => notes.push(...note(p, v, p > 4)));
  notes.push(fillPoly([[99, -28], [99, -46], [106, -46], [106, -28]])); // part III opens with the longest silence: a rest // part III opens with the longest silence: a rest
  const sign = n => { const out = [line(0, 0, 0, -50, 'k'), paper([[-16, -48], [16, -48], [16, -68], [-16, -68]]), poly([[-16, -48], [16, -48], [16, -68], [-16, -68], [-16, -48]], 'k1')]; let x = -n.length * 2.6; for (const ch of n) { if (ch === 'I') out.push(line(x, -64, x, -52, 'k1', { over: 0.05 })); else { out.push(poly([[x - 2, -64], [x + 1.4, -52], [x + 4.8, -64]], 'k1')); x += 2.6; } x += 5.2; } return out; };
  const loss = u => { const t = u / 600; let h = 132 - 110 * Math.pow(Math.min(t / 0.52, 1), 0.7); if (t > 0.5 && t < 0.66) h -= 26 * Math.sin((t - 0.5) / 0.16 * Math.PI); if (t > 0.66) h = 22 + 6 * Math.cos((t - 0.66) * 9); return h; };
  const ridge = []; for (let u = -20; u <= 640; u += 10) ridge.push([u, -loss(clampU(u)) + rnd(-1.2, 1.2)]);
  function clampU(u) { return Math.max(0, Math.min(600, u)); }
  const hills = [curve(ridge, 'k', 0.3), line(-30, 0, 650, 0, 'k1', { bow: 0.002 })];
  for (let u = -10; u <= 630; u += 9) { const h = loss(clampU(u)), len = Math.min(h - 4, 10 + rnd(0, 18)); if (len > 4) hills.push(line(u + rnd(-2, 2), -h + 4, u + rnd(-3, 1), -h + 4 + len, 'k1', { over: 0.1, bow: 0.02 })); }
  hills.push(ellipse(330, -loss(330) - 9, 7, 7, 'k1', { jit: 0.05 }));
  const along3 = [-290, -145, 0, 145]; // world z where each part starts
  scene('writing', [
    lay([...road, ...notes], FLAT(), [0, 0, 0], [120, 0], 1),
    lay(hills, UP(90), [150, 0, -300], [0, 0], 1.15),
    lay(hills, UP(90), [-150, 0, -300], [0, 0], 1.15),
    ...['I', 'II', 'III', 'IV'].map((n, i) => lay(sign(n), UP(), [-58, 0, along3[i] + 10], [0, 0], 1.2)),
  ], [{ L: 0, pts: [[120, 340], [120, 300], [120, 150], [120, 0], [120, -150], [120, -290], [120, -340]] }], 400);
}

// CIS-MAP: the floor plan lying on the ground, with a pin standing at the destination. The thread comes in
// at the door, by its QR code, and walks the route to the pin; the camera follows it low over the plan.
seed(21);
{
  const route = [[50, 166], [50, 150], [51, 134], [58, 116], [70, 101], [110, 98], [140, 98], [148, 91], [152, 78], [165, 67], [180, 62]];
  const door = (x, y, w, dir) => [line(x, y, x, y - w * dir, 'k1', { over: 0.1 }), curve(Array.from({ length: 7 }, (_, i) => { const a = i / 6 * Math.PI / 2; return [x + Math.sin(a) * w, y - Math.cos(a) * w * dir]; }), 'k1', 0.05)];
  const plan = [
    line(28, 34, 212, 34, 'k'), line(212, 34, 212, 150, 'k'), line(212, 150, 56, 150, 'k'), line(44, 150, 28, 150, 'k'), line(28, 150, 28, 34, 'k'),
    line(28, 88, 70, 88, 'k'), line(84, 88, 140, 88, 'k'), line(154, 88, 212, 88, 'k'), line(28, 108, 60, 108, 'k'), line(74, 108, 160, 108, 'k'), line(174, 108, 212, 108, 'k'),
    line(90, 34, 90, 88, 'k'), line(150, 34, 150, 88, 'k'), line(80, 108, 80, 150, 'k'), line(158, 108, 158, 150, 'k'),
    ...door(44, 150, 12, 1), ...door(70, 88, 14, 1), ...door(140, 88, 14, 1), ...door(60, 108, 14, -1), ...door(160, 108, 14, -1),
  ];
  for (let x = 165; x <= 205; x += 5.7) plan.push(line(x, 114, x, 144, 'k1', { over: 0.2 }));
  plan.push(line(168, 129, 203, 129, 'k1'), poly([[198, 125], [203.5, 129], [198, 133]], 'k1'));
  plan.push(poly([[60, 136], [72, 136], [72, 148], [60, 148], [60, 136]], 'k1'));
  [[61.5, 137.5], [67.5, 137.5], [61.5, 143.5]].forEach(([x, y]) => plan.push(fillPoly([[x, y], [x + 3, y], [x + 3, y + 3], [x, y + 3]])));
  [[66, 142], [68.5, 144.5], [66.5, 146], [69, 141]].forEach(([x, y]) => plan.push(fillPoly([[x, y], [x + 1.4, y], [x + 1.4, y + 1.4], [x, y + 1.4]])));
  [[100, 50, 128, 62], [100, 68, 128, 80], [40, 50, 70, 60], [176, 92, 200, 100]].forEach(([a, b, c, d]) => plan.push(poly([[a, b], [c, b], [c, d], [a, d], [a, b]], 'k1')));
  const pin = [curve([[0, 0], [-6, -10], [-7.5, -18], [-4, -25], [0, -26.5], [4, -25], [7.5, -18], [6, -10], [0, 0]], 'k', 0.05), fill(ellipsePts(0, -18, 3, 3, 0, 360, 0, 0.02, 40))];
  const s = 1.4, at = ([u, v]) => [(u - 120) * s, 0, -(v - 92) * s];
  scene('cismap', [
    lay(plan, FLAT(), [0, 0, 0], [120, 92], s),
    lay(pin, UP(), at(route[route.length - 1]), [0, 0], 1.7),
  ], [{ L: 0, pts: route, t: 'kd' }], 400);
}

// The Locke essays: an open book lying on the ground, law (the scales) on the left page and politeness
// (a request in a speech bubble) on the right, with the commendation's rosette. The thread is the
// stitching down the spine, and the camera flies low between the pages.
seed(26);
{
  const lines = (x0, x1, y0, n, gap) => Array.from({ length: n }, (_, k) => line(x0 + rnd(0, 2), y0 + k * gap, x1 - (k === n - 1 ? 26 : rnd(0, 6)), y0 + k * gap + rnd(-0.4, 0.4), 'k1', { over: 0.1, bow: 0.01 }));
  const sheet = (spineAt) => { const out = [paper([[0, 0], [110, 0], [110, 150], [0, 150]]), poly([[0, 0], [110, 0], [110, 150], [0, 150], [0, 0]], 'k')]; const ox = spineAt ? 110 : 0; [1.8, 3.6].forEach(d => out.push(line(Math.abs(ox - d), 1.5, Math.abs(ox - d), 148.5, 'k1', { over: 0 }))); return out; };
  const leftPage = [...sheet(false),
    line(55, 30, 55, 82, 'k'), line(43, 84, 67, 84, 'k'), line(31, 36, 79, 37, 'k'), ellipse(55, 27, 2.4, 2.4, 'k1'),
    ...[33, 77].flatMap(x => [line(x, 37, x - 7, 58, 'k1', { over: 0.1 }), line(x, 37, x + 7, 58, 'k1', { over: 0.1 }), curve([[x - 9, 58], [x, 65], [x + 9, 58]], 'k')]),
    line(16, 12, 62, 12, 'k2', { over: 0.1 }), ...lines(16, 94, 100, 5, 7.5)];
  const rosette = []; { const pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * 2 * Math.PI, k = 1 + 0.1 * Math.cos(a * 12); pts.push([88 + Math.cos(a) * 10 * k, 118 + Math.sin(a) * 10 * k]); } rosette.push(curve(pts, 'k1', 0.05), fill(ellipsePts(88, 118, 5.4, 5.4, 0, 360, 0, 0.02, 30)), poly([[83, 126], [78, 143], [82.5, 140], [85, 145], [87.5, 128]], 'k1'), poly([[93, 126], [98, 143], [93.5, 140], [91, 145], [88.5, 128]], 'k1')); }
  const rightPage = [...sheet(true),
    curve([[22, 28], [50, 22], [82, 26], [90, 40], [84, 56], [58, 60], [40, 60], [30, 72], [32, 59], [20, 52], [17, 38], [22, 28]], 'k', 0.2),
    ...lines(30, 80, 34, 3, 7.5), ...lines(16, 94, 80, 3, 7.5), ...rosette];
  const spine = [];
  for (let v = 4; v < 150; v += 14) spine.push(line(-3.4, v, 3.4, v + 3, 'k1', { over: 0 }));
  const a = 16 * R2, s = 1.25;
  scene('locke', [
    lay(leftPage, { U: [Math.cos(a), Math.sin(a), 0], V: [0, 0, -1] }, [0, 0, 0], [110, 75], s),
    lay(rightPage, { U: [Math.cos(a), -Math.sin(a), 0], V: [0, 0, -1] }, [0, 0, 0], [0, 75], s),
    lay(spine, FLAT(), [0, -0.5, 0], [0, 75], s, { top: true }),
  ], [{ L: 2, pts: [[0, 176], [0, 150], [0, 75], [0, 0], [0, -22]] }], 320);
}

// Modelling the Other: two people facing each other, each picturing the other. The thread draws both of
// them in one line: up the back of the first head and down its face, across the ground between them,
// then up the second face and down the back. The camera flies between the two faces.
seed(31);
{
  const back = [[48, 152], [50, 130], [44, 115], [38, 99], [37.5, 80], [43, 63], [55, 51], [72, 46.5]];
  const face = [[72, 46.5], [83, 51.5], [88, 61], [89, 69], [92.5, 76.5], [98, 84.5], [93.5, 88], [92, 90.5], [94, 93.5], [91, 96.5], [92.8, 100], [89, 106], [82.5, 110], [76.5, 115], [75, 127], [77, 152]];
  const parts = [curve([[59, 80], [54, 82], [53, 88], [56.5, 93], [60, 91.5]], 'k1'), line(79, 70.5, 83.5, 71.5, 'k1', { over: 0.2 }), ...hatch([[39, 98], [38.5, 80], [44, 63.5], [56, 52.5], [72, 48], [79, 51], [62, 56], [51, 69], [47, 90]], 118, 2.9)];
  const mini = (cx, cy, k, flip) => { const tr = p => [cx + (flip ? -1 : 1) * (p[0] - 68) * k, cy + (p[1] - 82) * k]; return [curve(back.slice(2).map(tr), 'k1', 0.03), curve(face.slice(0, 14).map(tr), 'k1', 0.03)]; };
  const bub = (cx, cy, rx, ry) => { const pts = []; for (let i = 0; i <= 64; i++) { const t = i / 64 * 2 * Math.PI, k = 1 + 0.1 * Math.abs(Math.sin(t * 4.5)); pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]); } return pts; };
  const thought = [curve(bub(78, 12, 25, 15.5), 'k1', 0.1), ellipse(90, 34, 2.4, 2.1, 'k1'), ellipse(93, 40.5, 1.4, 1.3, 'k1'), ...mini(78, 13, 0.3, true)];
  const shoulders = [[84, 160], [100, 168], [120, 170], [140, 168], [156, 160]];
  const one = [[40, 178], [46, 166], ...back.slice(1), ...face.slice(1, -1), [78, 150], ...shoulders, ...[...face.slice(1, -1).reverse(), ...back.slice(1).reverse()].map(([x, y]) => [240 - x, y]), [194, 166], [200, 178]];
  scene('other', [
    lay([...parts, ...mirror(parts)], UP(), [0, 0, 0], [120, 178], 1.25),
    lay(thought, UP(16), [-14, 0, -40], [120, 178], 1.25),
    lay(mirror(thought), UP(-16), [14, 0, -40], [120, 178], 1.25),
  ], [{ L: 0, pts: one }], 390);
}

// VPS Veritas: a tanker on the sea. The thread is its wake, running along the water to the stern and on
// along the waterline to the bow; the camera flies over the ship.
seed(41);
{
  const sea = [];
  for (let z = -110; z <= 420; z += 24) {
    const n = 8 + Math.round(rnd(0, 3));
    for (let k = 0; k < n; k++) { const x = rnd(-420, 420), w = rnd(9, 20) * (1 + z / 600); if (Math.abs(z) < 30 && Math.abs(x) < 110) continue; sea.push(curve([[x, -z], [x + w * 0.5, -z - w * 0.16], [x + w, -z]], 'k1', 0.25)); }
  }
  sea.push(curve([[-600, -440], [-200, -436], [200, -441], [600, -437]], 'k1', 0.6)); // the horizon line of the swell
  const wake = [[-330, 86], [-260, 56], [-190, 28], [-130, 9], [-91, 0]];
  sea.push(curve([[-91, -2], [-140, -22], [-210, -46], [-290, -70]], 'k1', 0.5));
  [[-150, 14], [-200, 30], [-240, 46], [-170, -30], [-230, -52]].forEach(([x, v]) => sea.push(curve([[x, v], [x + 5, v - 2.5], [x + 10, v]], 'k1', 0.2)));
  const ship = [
    curve([[44, 122], [41, 112], [40, 100], [41, 94]], 'k'), curve([[41, 94], [90, 93], [150, 92.5], [188, 91], [200, 88], [207, 84]], 'k', 0.15),
    curve([[186, 122], [195, 114], [202, 102], [206, 90], [207, 84]], 'k'),
    fillPoly([[44, 122], [186, 122], [192, 116], [42, 116]]), line(42, 104, 200, 102, 'k1', { bow: 0.003 }),
    ...hatch([[42, 96], [58, 96], [58, 114], [43, 114]], 90, 3),
    paper([[50, 64], [84, 64], [84, 94], [50, 94]]), poly([[50, 94], [50, 64], [84, 64], [84, 94]], 'k'), line(52, 74, 84, 74, 'k1'), line(52, 84, 84, 84, 'k1'),
    ...[69, 79, 89].flatMap(y => [54, 60, 66, 72, 78].map(x => fillPoly([[x, y - 2], [x + 2.6, y - 2], [x + 2.6, y + 0.6], [x, y + 0.6]]))),
    line(44, 64, 90, 64, 'k'), poly([[56, 64], [56, 55], [78, 55], [78, 64]], 'k1'), ...[59, 63, 67, 71, 75].map(x => line(x, 57, x, 61, 'k1', { over: 0 })),
    poly([[60, 55], [62, 38], [74, 38], [76, 55]], 'k'), fillPoly([[61.6, 42], [74.4, 42], [74.8, 46], [61.2, 46]]),
    line(84, 64, 84, 46, 'k1'), line(79, 47, 89, 47, 'k1', { over: 0 }), fill(ellipsePts(84, 45, 1.2, 1.2, 0, 360, 0, 0.02, 20)),
    line(86, 88, 186, 87, 'k1', { bow: 0.002 }), ...[94, 108, 122, 136, 150, 164, 178].map(x => line(x, 88, x, 92, 'k1', { over: 0 })),
    line(128, 92, 128, 84, 'k1', { over: 0 }), line(134, 92, 134, 84, 'k1', { over: 0 }), line(140, 92, 140, 84, 'k1', { over: 0 }), line(125, 84, 143, 84, 'k1', { over: 0.2 }),
    line(134, 84, 134, 68, 'k'), line(134, 70, 154, 77, 'k1'), line(154, 77, 154, 85, 'k1', { over: 0 }),
    line(196, 87, 196, 66, 'k1'), fill(ellipsePts(196, 65, 1.4, 1.4, 0, 360, 0, 0.02, 20)), ellipse(200, 97, 1.6, 1.6, 'k1'),
    ellipse(58, 31, 6, 3.4, 'k1'), ellipse(46, 25, 7.4, 4, 'k1'), ellipse(32, 20, 8.6, 4.6, 'k1'),
  ];
  scene('vps', [
    lay(sea, FLAT(), [0, 0, 0], [0, 0], 1),
    lay(ship, UP(), [0, 0, 0], [120, 122], 1.2),
  ], [{ L: 0, pts: wake }, { L: 1, pts: [[44, 122], [115, 122.4], [186, 122]] }], 320);
}

// Learning what to prove: mathematics as a tree. Roots are the axioms, the trunk is the library, and every
// proved result is a branch that later results grow from; fruit are results, and a few branches are cut back.
// The thread dives to a root, climbs it into the trunk and up through the crown; the camera rises over the top.
seed(53);
{
  const roots = [];
  let climb = null;
  [[-62, 30], [-34, 36], [-10, 40], [16, 38], [42, 34], [66, 26]].forEach(([dx, len], i) => {
    const a = [120 + dx * 0.08, 135], m = [120 + dx * 0.45, 135 + len * 0.55], e = [120 + dx, 135 + len];
    if (dx === 42) { climb = [e, m, a, [121.5, 116], [120.5, 97], [120, 70], [119.5, 40], [120, 6]]; return; }
    roots.push(curve([a, m, e], i % 2 ? 'k' : 'k1'));
    if (len > 30) roots.push(curve([m, [m[0] + dx * 0.25, m[1] + 9], [m[0] + dx * 0.32 + rnd(-4, 4), m[1] + 16]], 'k1'));
  });
  roots.push(line(14, 134.5, 226, 134.5, 'k1', { bow: 0.003 }));
  const trunk = [fill([[110, 135], [112.5, 122], [114.5, 108], [115, 96], [125, 96], [125.5, 108], [127.5, 122], [131, 135], [124, 132], [116, 132]]),
    ...hatch([[121, 100], [125, 100], [126.5, 118], [128.5, 132], [122, 132]], 80, 2.2, { t: 'k1' })];
  const levels = [[], [], [], [], []], tips = [], cut = [];
  const grow = (x, y, a, len, d) => {
    const e = [x + Math.sin(a) * len, y - Math.cos(a) * len], m = [(x + e[0]) / 2 + Math.cos(a) * len * 0.08 * (rnd() - 0.5), (y + e[1]) / 2 + Math.sin(a) * len * 0.08];
    levels[d].push(curve([[x, y], m, e], d === 0 ? 'k2' : d < 2 ? 'k' : 'k1', 0.1));
    if (d === 4) { const r = rnd(); if (r < 0.5) tips.push(fill(ellipsePts(e[0], e[1] - 1, 2.6, 2.6, 0, 360, 0, 0.03, 40))); else tips.push(fill(ellipsePts(e[0] + Math.sin(a) * 2.6, e[1] - Math.cos(a) * 2.6, 3.6, 1.4, 0, 360, a * 180 / Math.PI - 90, 0.02, 40))); return; }
    if (d >= 2 && rnd() < 0.12) { cut.push(line(e[0] - 2.4, e[1] - 1.6, e[0] + 2.4, e[1] + 1.6, 'k1', { over: 0.1 })); return; } // cut back: not worth growing
    const n = d === 0 ? 3 : rnd() < 0.25 ? 3 : 2, spread = d === 0 ? 0.42 : 0.5;
    for (let i = 0; i < n; i++) grow(e[0], e[1], a + (n === 3 ? (i - 1) * spread : (i ? 1 : -1) * spread * 0.62) + rnd(-0.1, 0.1), len * rnd(0.68, 0.78), d + 1);
  };
  [-0.62, -0.06, 0.55].forEach((a, i) => grow(120 + (i - 1) * 3, 97, a, [27, 31, 26][i], 0));
  scene('prove', [lay([...roots, ...trunk, ...levels.flat(), ...cut, ...tips], UP(), [0, 0, 0], [120, 134], 1.4)], [{ L: 0, pts: climb }], 380);
}

// Train Pointillism: a steam locomotive and tender, side on, on a track that runs along the journey.
// The thread becomes one of the rails, and the camera flies along the track past the train.
seed(63);
{
  const track = [line(112, 130, 112, -300, 'k', { bow: 0.001 })];
  for (let v = 124; v > -300; v -= 15) track.push(line(103, v, 137, v + rnd(-1, 1), 'k1', { over: 0.2 }));
  const wheel = (x, y, r, spokes) => { const out = [ellipse(x, y, r, r, 'k'), fill(ellipsePts(x, y, r * 0.18, r * 0.18, 0, 360, 0, 0.02, 40))]; for (let a = 0; a < 360; a += 360 / spokes) { const q = a * R2; out.push(line(x + Math.cos(q) * r * 0.24, y + Math.sin(q) * r * 0.24, x + Math.cos(q) * r * 0.86, y + Math.sin(q) * r * 0.86, 'k1', { over: 0, bow: 0 })); } return out; };
  const tender = [paper([[14, 88], [60, 88], [60, 122], [14, 122]]), poly([[14, 122], [14, 88], [60, 88], [60, 122], [14, 122]], 'k'), curve([[16, 88], [20, 82], [25, 84], [30, 79], [36, 81], [42, 78], [48, 81], [54, 80], [59, 88]], 'k1', 0.3), line(18, 104, 56, 104, 'k1'), ...wheel(26, 141, 9, 8), ...wheel(48, 141, 9, 8), line(14, 124, 60, 124, 'k1')];
  const cab = [paper([[62, 62], [94, 62], [94, 122], [62, 122]]), poly([[62, 122], [62, 64], [94, 64], [94, 122]], 'k'), line(57, 61, 99, 61, 'k2', { bow: 0.003 }), poly([[68, 72], [86, 72], [86, 90], [68, 90], [68, 72]], 'k1')];
  const boiler = [paper([[94, 84], [207, 84], [211, 100], [207, 120], [94, 120]]), line(94, 84, 200, 84, 'k'), line(94, 120, 200, 120, 'k'), ...[120, 150, 176].map(x => line(x, 84, x, 120, 'k1', { over: 0.1 })),
    curve([[200, 82], [207, 84], [211, 94], [211, 110], [207, 120], [200, 122]], 'k'), line(200, 82, 200, 122, 'k1'), fill(ellipsePts(205, 102, 1.6, 1.6, 0, 360, 0, 0.02, 40)),
    poly([[189, 84], [190, 62], [198, 62], [199, 84]], 'k'), poly([[185, 61], [187, 54], [201, 54], [203, 61], [185, 61]], 'k'),
    curve([[132, 84], [133, 76], [139, 72.5], [145, 76], [146, 84]], 'k'), curve([[160, 84], [161, 79], [165, 77], [169, 79], [170, 84]], 'k1'),
    poly([[205, 72], [212, 72], [212, 79], [205, 79], [205, 72]], 'k1'),
    ...hatch([[96, 109], [198, 109], [198, 119], [96, 119]], 0, 3.4, { min: 6 })];
  const gear = [line(62, 124, 222, 124, 'k1'), poly([[184, 124], [208, 124], [208, 136], [184, 136], [184, 124]], 'k'),
    ...wheel(110, 136, 15, 12), ...wheel(146, 136, 15, 12), ...wheel(182, 143.5, 7.5, 6), ...wheel(201, 143.5, 7.5, 6),
    line(110, 141, 146, 141, 'k2', { over: 0.5 }), line(146, 131, 184, 130, 'k', { over: 0.4 }),
    poly([[208, 124], [228, 150], [214, 150], [206, 136]], 'k1')];
  const smoke = [];
  [[192, 44, 7, 18], [178, 34, 9, 20], [158, 27, 11, 20], [134, 23, 12, 16], [108, 23, 12, 11], [84, 26, 11, 7]].forEach(([x, y, r, n]) => smoke.push(...stipple(ellipsePts(x, y, r * 1.25, r * 0.8, 0, 360, 0, 0.08, 24), n, { space: 2.6, rmin: 0.6, rmax: 1.2 })));
  smoke.sort((a, b) => b.cx - a.cx);
  // the track runs at 20 degrees across the path, so the train is seen from the side and the rail crosses under the camera
  const s = 1.45, a = 20 * R2, O = [-120, 0, 0], side = { U: [Math.sin(a), 0, Math.cos(a)], V: [0, 1, 0] };
  scene('train', [
    lay(track, FLAT(-20), O, [120, 0], s),
    lay([...tender, ...cab, ...boiler, ...gear], side, O, [121, 151], s),
    lay([{ t: 'p', dots: smoke }], side, [O[0], -4, O[2]], [121, 151], s),
  ], [{ L: 0, pts: [[128, 134], [128, 0], [128, -150], [128, -306]] }], 360);
}

// gvhackathon.com: the laptop on the ground, keyboard flat and screen up, and the stopwatch of a seven-day
// build. The thread is the power lead, then the cursor line on the screen; the camera flies into the screen.
seed(71);
{
  const deck = [paper([[46, 106], [194, 106], [194, 132], [46, 132]]), poly([[46, 106], [194, 106], [194, 132], [46, 132], [46, 106]], 'k'), poly([[102, 121], [138, 121], [138, 131], [102, 131], [102, 121]], 'k1')];
  for (let row = 0; row < 3; row++) for (let x = 54 + row * 2; x < 186; x += 9.4) deck.push(poly([[x, 108.6 + row * 4], [x + 6.6, 108.6 + row * 4], [x + 6.6, 111.4 + row * 4], [x, 111.4 + row * 4], [x, 108.6 + row * 4]], 'k1'));
  const screen = [paper([[64, 36], [176, 36], [176, 106], [64, 106]]), poly([[64, 106], [64, 36], [176, 36], [176, 106], [64, 106]], 'k'), poly([[72, 98], [72, 44], [168, 44], [168, 98], [72, 98]], 'k1'),
    poly([[80, 49], [77, 52], [80, 55]], 'k1'), line(83.5, 56, 85.5, 48, 'k1', { over: 0 }), poly([[89, 49], [92, 52], [89, 55]], 'k1'),
    ...[[80, 112, 61], [86, 108, 66], [86, 118, 71], [92, 110, 76], [86, 104, 81], [80, 100, 86]].map(([a, b, y]) => line(a, y, b, y, 'k1', { over: 0, bow: 0.01 })),
    fillPoly([[151, 87], [156, 87], [156, 92.5], [151, 92.5]])];
  const watch = [ellipse(214, 30, 15, 15, 'k'), line(214, 11, 214, 15, 'k1'), poly([[209.5, 9], [218.5, 9]], 'k2'), line(225, 17, 228, 14, 'k1'), line(214, 30, 214, 20, 'k2', { over: 0 }), line(214, 30, 221, 33, 'k1', { over: 0 })];
  [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([u, v]) => watch.push(line(214 + u * 11, 30 + v * 11, 214 + u * 13.2, 30 + v * 13.2, 'k1', { over: 0 })));
  const s = 2.3, hinge = [0, 0, -(106 - 119) * s];
  scene('hack', [
    lay(deck, FLAT(), [0, 0, 0], [120, 119], s),
    lay(screen, LEAN(12), hinge, [120, 106], s),
    lay(watch, UP(-24), [196, 0, -60], [214, 46], 1.5),
  ], [{ L: 0, pts: [[14, 176], [22, 150], [34, 126], [46, 110], [62, 106]] }, { L: 1, pts: [[66, 104], [76, 96], [100, 92.5], [149, 92.5]] }], 470);
}

// Next: a symphony in movements I to IV, fanned out, and the conductor's baton, which is where the thread ends.
seed(81);
{
  const numeral = (n, x, y) => { const parts = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }[n].split(''), w = parts.length * 4.4, out = []; let cx = x - w / 2 + 2; parts.forEach(ch => { if (ch === 'I') out.push([[cx, y], [cx, y + 7]]); else { out.push([[cx - 1, y], [cx + 1.8, y + 7], [cx + 4.6, y]]); cx += 2.4; } cx += 4.4; }); return out; };
  const page = (rot, n, full) => {
    const c = Math.cos(rot * R2), s = Math.sin(rot * R2), T = ([x, y]) => [120 + (x - 120) * c - (y - 178) * s, 178 + (x - 120) * s + (y - 178) * c];
    const items = [paper([[92, 160], [92, 70], [148, 70], [148, 160]].map(T)), poly([[92, 160], [92, 70], [148, 70], [148, 160], [92, 160]].map(T), 'k')];
    numeral(n, 120, 76).forEach(seg => items.push(seg.length === 2 ? line(...T(seg[0]), ...T(seg[1]), 'k1', { over: 0.1 }) : poly(seg.map(T), 'k1')));
    [94, 114, 134].forEach(y0 => { for (let k = 0; k < 5; k++) items.push(line(...T([98, y0 + k * 3]), ...T([142, y0 + k * 3 + rnd(-0.3, 0.3)]), 'k1', { over: 0.2, bow: 0.004 })); });
    if (full) [[106, 97], [114, 95], [124, 99], [134, 96], [104, 118], [113, 116], [124, 120], [134, 115], [110, 137], [122, 140], [134, 138]].forEach(([x, y]) => items.push(fill(ellipsePts(...T([x, y]), 2, 1.5, 0, 360, rot - 24, 0.03, 40))));
    return items;
  };
  const baton = [fill(ellipsePts(44, 121, 8.6, 4.6, 0, 360, -14, 0.02, 30))]; // the cork grip; the thread is the stick
  scene('coda', [
    lay([...page(-36, 1, false), ...page(-12, 2, false), ...page(12, 3, false), ...page(36, 4, true)], UP(), [0, 0, 0], [120, 178], 1.3),
    lay(baton, UP(-10), [-150, 0, -60], [40, 178], 1.1),
  ], [{ L: 1, pts: [[34, 124], [46, 120], [100, 108], [156, 95]] }], 360);
}

// Garland motifs: small pieces of each drawing, strung on arches over the path between one drawing and the
// next, so the last project's motif hands over to the next one's. In a 20-unit box.
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
const items = list => list.map(it => it.t === 'p' ? ['p', it.dots.flatMap(d => [d.cx, d.cy, d.r])] : it.t === 'd' ? ['p', [it.cx, it.cy, it.r]] : [it.t, it.d]);
const r2 = a => a.map(n => +n.toFixed(2));
const world = {
  scenes: Object.fromEntries(Object.entries(S).map(([k, v]) => [k, {
    layers: v.layers.map(l => ({ o: r2(l.o), U: r2(l.U), V: r2(l.V), s: l.s, ground: l.ground || undefined, top: l.top || undefined, i: items(l.items) })),
    thread: v.thread, read: v.read,
  }])),
  motifs: Object.fromEntries(Object.entries(M).map(([k, v]) => [k, items(v)])),
};
const js = '// Generated by _tools/ink/world.mjs; edit that file, not this one.\nwindow.INK_WORLD = ' + JSON.stringify(world) + ';\n';
fs.mkdirSync(ROOT + 'static/ink', { recursive: true });
fs.writeFileSync(ROOT + 'static/ink/world.js', js);
console.log('static/ink/world.js', (js.length / 1024).toFixed(1), 'KB;', Object.entries(S).map(([k, v]) => k + ' ' + v.layers.reduce((n, l) => n + l.items.length, 0)).join(', '));
