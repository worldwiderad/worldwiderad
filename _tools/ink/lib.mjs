// Authoring helpers for pen-and-ink vignettes. Coordinates are in a 240 x 180 box.
export function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let R = rng(7);
export function seed(s) { R = rng(s); }
export const rnd = (a = 0, b = 1) => a + (b - a) * R();
const f = n => +n.toFixed(1);
// smooth path through points (Catmull-Rom -> cubic Bezier)
export function smooth(pts, closed = false) {
  if (pts.length < 2) return '';
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 1; i <= n; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
// a hand-drawn straight line: slight bow, slight overshoot
export function line(x1, y1, x2, y2, t = 'k', o = {}) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  const over = o.over ?? 0.8, bow = (o.bow ?? 0.012) * len * (R() - 0.5) * 2;
  const a = [x1 - ux * over * R(), y1 - uy * over * R()], b = [x2 + ux * over * R(), y2 + uy * over * R()];
  const m = [(a[0] + b[0]) / 2 - uy * bow, (a[1] + b[1]) / 2 + ux * bow], c = [2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2];
  return { t, d: `M${f(a[0])} ${f(a[1])}Q${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}` };
}
export function poly(pts, t = 'k', closed = false) { // corners kept: straight segments joined
  const p = pts.map(q => [q[0] + rnd(-0.3, 0.3), q[1] + rnd(-0.3, 0.3)]);
  let d = `M${f(p[0][0])} ${f(p[0][1])}` + p.slice(1).map(q => `L${f(q[0])} ${f(q[1])}`).join('');
  if (closed) d += `L${f(p[0][0] + rnd(0.5, 1.5))} ${f(p[0][1] + rnd(-0.5, 0.5))}`;
  return { t, d };
}
export function curve(pts, t = 'k', jit = 0.4) { return { t, d: smooth(pts.map(q => [q[0] + rnd(-jit, jit), q[1] + rnd(-jit, jit)])) }; }
export function ellipsePts(cx, cy, rx, ry, a0 = 0, sweep = 360, rot = 0, jit = 0.012, step = 12) {
  const pts = [], n = Math.max(3, Math.round(Math.abs(sweep) / step)), cr = Math.cos(rot * Math.PI / 180), sr = Math.sin(rot * Math.PI / 180);
  for (let i = 0; i <= n; i++) {
    const a = (a0 + sweep * i / n) * Math.PI / 180, k = 1 + (R() - 0.5) * 2 * jit;
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    pts.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return pts;
}
export function ellipse(cx, cy, rx, ry, t = 'k', o = {}) { // hand circle: overlaps where it closes
  const a0 = o.a0 ?? rnd(0, 360), sweep = o.sweep ?? 360 + rnd(10, 22);
  return { t, d: smooth(ellipsePts(cx, cy, rx, ry, a0, sweep, o.rot || 0, o.jit ?? 0.012, o.step || 12)) };
}
export function fill(pts, closed = true) { return { t: 'f', d: smooth(pts, closed) + 'Z' }; }
export function fillPoly(pts) { return { t: 'f', d: 'M' + pts.map(p => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z' }; }
export function dot(cx, cy, r) { return { t: 'd', cx: f(cx), cy: f(cy), r: +r.toFixed(2) }; }
// parallel hatching clipped to a polygon
export function hatch(polyPts, angle, gap, o = {}) {
  const a = angle * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, out = [];
  const proj = polyPts.map(p => p[0] * nx + p[1] * ny), lo = Math.min(...proj), hi = Math.max(...proj);
  for (let s = lo + gap * (0.5 + rnd(-0.2, 0.2)); s < hi; s += gap * rnd(0.85, 1.15)) {
    const xs = [];
    for (let i = 0; i < polyPts.length; i++) {
      const p = polyPts[i], q = polyPts[(i + 1) % polyPts.length], dp = p[0] * nx + p[1] * ny - s, dq = q[0] * nx + q[1] * ny - s;
      if ((dp < 0) !== (dq < 0)) { const k = dp / (dp - dq); const x = p[0] + (q[0] - p[0]) * k, y = p[1] + (q[1] - p[1]) * k; xs.push(x * ux + y * uy); }
    }
    xs.sort((m, n) => m - n);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const i0 = xs[i] + rnd(0.3, 1.6), i1 = xs[i + 1] - rnd(0.3, 1.6);
      if (i1 - i0 < (o.min ?? 2)) continue;
      out.push(line(s * nx + i0 * ux, s * ny + i0 * uy, s * nx + i1 * ux, s * ny + i1 * uy, o.t || 'k1', { over: 0.2, bow: 0.02 }));
    }
  }
  return out;
}
function inside(pt, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
// stippling: dots inside a polygon (density can vary) plus a denser rim
export function stipple(P, n, o = {}) {
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), out = [];
  let tries = 0;
  while (out.length < n && tries++ < n * 60) {
    const p = [rnd(x0, x1), rnd(y0, y1)];
    if (!inside(p, P)) continue;
    if (o.density && R() > o.density(p)) continue;
    if (out.some(q => Math.hypot(q.cx - p[0], q.cy - p[1]) < (o.space ?? 2.2))) continue;
    out.push(dot(p[0], p[1], rnd(o.rmin ?? 0.55, o.rmax ?? 1.15)));
  }
  if (o.rim) for (let i = 0; i < P.length; i++) {
    const p = P[i], q = P[(i + 1) % P.length], len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    for (let s = rnd(0, o.rim); s < len; s += o.rim * rnd(0.8, 1.2)) out.push(dot(p[0] + (q[0] - p[0]) * s / len + rnd(-0.5, 0.5), p[1] + (q[1] - p[1]) * s / len + rnd(-0.5, 0.5), rnd(0.7, 1.3)));
  }
  return out;
}
export function stippleRing(cx, cy, r, gap, o = {}) { const out = []; const n = Math.round(2 * Math.PI * r / gap); for (let i = 0; i < n; i++) { const a = i / n * 2 * Math.PI + rnd(-0.05, 0.05); out.push(dot(cx + Math.cos(a) * (r + rnd(-0.4, 0.4)), cy + Math.sin(a) * (r + rnd(-0.4, 0.4)), rnd(o.rmin ?? 0.7, o.rmax ?? 1.3))); } return out; }
export function mirror(items, axis = 120) {
  return items.map(it => it.t === 'd' ? { ...it, cx: f(2 * axis - it.cx) } : { ...it, d: it.d.replace(/([MLCQ])([^MLCQZ]*)/g, (m, cmd, nums) => cmd + nums.trim().split(/\s+/).map((v, i) => i % 2 === 0 ? f(2 * axis - +v) : v).join(' ')) });
}
// many dots as one path of zero-length round-capped segments, in three sizes
export function dotPaths(dots, dir = 'l') {
  const g = [[], [], []];
  dots.forEach(d => g[d.r < 0.8 ? 0 : d.r < 1.05 ? 1 : 2].push(`M${d.cx} ${d.cy}h0`));
  return g.map((a, i) => a.length ? { t: 'p p' + (i + 1), d: a.join(''), dir } : null).filter(Boolean);
}
export function svg(id, layers, o = {}) {
  const body = layers.map((L, i) => `<g class="lay${L.items.every(it => /^p /.test(it.t)) ? ' plain' : ''}" data-depth="${L.depth}" data-seq="${L.seq ?? i}">` + L.items.map(it =>
    it.t === 'd' ? `<circle class="d" cx="${it.cx}" cy="${it.cy}" r="${it.r}"/>` : `<path class="${it.t}"${it.dir ? ` data-dir="${it.dir}"` : ''} d="${it.d}"/>`).join('') + '</g>').join('');
  return `<svg class="ink" id="ink-${id}" viewBox="0 0 240 ${o.h || 180}" aria-hidden="true" focusable="false">${body}</svg>`;
}
