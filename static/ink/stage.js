// The ink world behind the homepage's projects: a pen-and-ink landscape, one drawing per project standing on
// (or lying on) open ground, placed along 4part's timeline. One pen line, the thread, runs along the ground
// from each drawing to the next and climbs into each one. Scrolling moves a camera straight down the middle of
// it, at one height and one angle, through or past every drawing.
(function () {
  'use strict';
  var W = window.INK_WORLD, journey = document.querySelector('.journey');
  if (!W || !journey || !window.Path2D || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = document.createElement('canvas'), g = cv.getContext('2d');
  if (!g) return;
  var root = document.documentElement;
  root.classList.add('ink-on');
  var stage = document.createElement('div');
  stage.className = 'stage'; stage.setAttribute('aria-hidden', 'true'); stage.appendChild(cv);
  journey.insertBefore(stage, journey.firstChild);

  // The journey is measured in J units: K per second of music. The world is measured in drawing units,
  // Z of them per J unit. AHEAD: how far ahead of the camera the pen can have drawn (J units).
  var LEN = window.LEN || 593.32, K = 0.35, Z = 64, D = 4.5, AHEAD = 24, FARW = 30 * Z, NEAR = 6;
  var INK = '#1a1a1a', BLUE = '#2340a8', PAPER = '#ffffff';
  var WIDTH = { k: 1.9, k1: 0.95, k2: 2.9 };

  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(str) { for (var h = 2166136261, i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }

  // ---- pen strokes: sample a centreline (M, L, Q, C), then build a nib-shaped outline around it
  function sample(d, step) {
    var t = d.match(/[MLQCZ]|-?\d*\.?\d+/g) || [], pts = [], i = 0, cmd = '', x = 0, y = 0;
    function n() { return +t[i++]; }
    function seg(f, len) { var k = Math.max(2, Math.ceil(len / step)); for (var j = 1; j <= k; j++) pts.push(f(j / k)); }
    while (i < t.length) {
      if (/[MLQCZ]/.test(t[i])) cmd = t[i++];
      if (cmd === 'M') { x = n(); y = n(); pts.push([x, y]); cmd = 'L'; }
      else if (cmd === 'L') { var lx = n(), ly = n(), ax = x, ay = y; seg(function (u) { return [ax + (lx - ax) * u, ay + (ly - ay) * u]; }, Math.hypot(lx - ax, ly - ay)); x = lx; y = ly; }
      else if (cmd === 'Q') { var qx = n(), qy = n(), qe = n(), qf = n(), bx = x, by = y; seg(function (u) { var v = 1 - u; return [v * v * bx + 2 * v * u * qx + u * u * qe, v * v * by + 2 * v * u * qy + u * u * qf]; }, Math.hypot(qx - bx, qy - by) + Math.hypot(qe - qx, qf - qy)); x = qe; y = qf; }
      else if (cmd === 'C') { var c1 = n(), c2 = n(), c3 = n(), c4 = n(), ce = n(), cf = n(), dx = x, dy = y; seg(function (u) { var v = 1 - u; return [v * v * v * dx + 3 * v * v * u * c1 + 3 * v * u * u * c3 + u * u * u * ce, v * v * v * dy + 3 * v * v * u * c2 + 3 * v * u * u * c4 + u * u * u * cf]; }, Math.hypot(c1 - dx, c2 - dy) + Math.hypot(c3 - c1, c4 - c2) + Math.hypot(ce - c3, cf - c4)); x = ce; y = cf; }
      else { i++; }
    }
    return pts;
  }
  function brush(P, w, seed) { // the nib: lands thin, swells, lifts off thin, with an uneven pressure along the way
    var n = P.length - 1, r = rng(seed), len = 0, cum = [0], i;
    for (i = 1; i <= n; i++) { len += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); cum.push(len); }
    var ph1 = r() * 6.283, ph2 = r() * 6.283, f1 = 0.5 + r(), f2 = 2 + r() * 2.5, land = 0.05 + r() * 0.08, lift = 0.12 + r() * 0.16;
    var amp = len < 10 ? 0.04 : 0.2, waves = Math.max(1, len / 70), A = [], B = [];
    for (i = 0; i <= n; i++) {
      var t = len ? cum[i] / len : 0, a = P[Math.max(0, i - 1)], b = P[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
      var shape = 0.32 + 0.68 * Math.sin(Math.PI / 2 * Math.min(1, t / land)) * Math.pow(Math.sin(Math.PI / 2 * Math.min(1, (1 - t) / lift)), 0.8);
      var hw = w / 2 * shape * (1 + amp * Math.sin(6.283 * f1 * waves * t + ph1) + amp * 0.45 * Math.sin(6.283 * f2 * waves * t + ph2));
      var ja = hw * (1 + (r() - 0.5) * 0.36), jb = hw * (1 + (r() - 0.5) * 0.36);
      A.push(P[i][0] - dy / m * ja, P[i][1] + dx / m * ja); B.push(P[i][0] + dy / m * jb, P[i][1] - dx / m * jb);
    }
    return { A: A, B: B, n: n, len: len };
  }
  function strokePoly(b, k) { // the stroke as drawn up to its k-th sample, as one outline
    var out = [], i;
    for (i = 0; i <= k; i++) out.push(b.A[2 * i], b.A[2 * i + 1]);
    for (i = k; i >= 0; i--) out.push(b.B[2 * i], b.B[2 * i + 1]);
    return out;
  }
  function flat(pts) { var out = []; for (var i = 0; i < pts.length; i++) out.push(pts[i][0], pts[i][1]); return out; }

  // ---- the drawings, one per section, placed along the piece
  var stations = [].slice.call(document.querySelectorAll('.journey .station')), scenes = [], todayZ = 421.5 * K, lastT = 0;
  stations.forEach(function (el, i) {
    var t = el.dataset.f === '' ? lastT + 24 : +el.dataset.f * LEN; lastT = t;
    var st = { el: el, id: el.id, z: t * K, read: t * K - D, anchor: 0, text: el.querySelector('div') || el }, raw = W.scenes[el.id];
    if (el.id === 'today') todayZ = st.z;
    if (raw) {
      var Zw = st.z * Z, sc = st.scene = { id: el.id, z: st.z, Z: Zw, total: 0, thread: raw.thread, read: (Zw - raw.read) / Z,
        layers: raw.layers.map(function (l) { var o = [l.o[0], l.o[1], l.o[2] + Zw]; return { o: o, o0: o.slice(), U: l.U, V: l.V, U0: l.U, V0: l.V, s: l.s, s0: l.s, ground: l.ground, top: l.top, raw: l.i, items: null }; }) };
      sc.Zd = Zw; // where the drawing actually sits along the journey (moved only for a section with a side panel)
      st.read = sc.read; // while you read the section, the camera is raw.read units in front of the drawing
      scenes.push(sc);
    }
    stations[i] = st;
  });
  function onLayer(Ly, p) { return [Ly.o[0] + Ly.s * (p[0] * Ly.U[0] + p[1] * Ly.V[0]), Ly.o[1] + Ly.s * (p[0] * Ly.U[1] + p[1] * Ly.V[1]), Ly.o[2] + Ly.s * (p[0] * Ly.U[2] + p[1] * Ly.V[2])]; }
  function prep(sc) {
    if (sc.total) return;
    var seed0 = hash(sc.id), n = 0, acc = 0;
    sc.layers.forEach(function (Ly) {
      var u0 = Infinity, v0 = Infinity, u1 = -Infinity, v1 = -Infinity;
      function box(u, v) { if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v; }
      Ly.items = Ly.raw.map(function (it) {
        var kind = it[0], o = { kind: kind }, i;
        if (kind in WIDTH) { o.b = brush(sample(it[1], 1.4), WIDTH[kind], seed0 + n * 7919); o.full = strokePoly(o.b, o.b.n); o.w = Math.max(5, o.b.len) * (kind === 'k1' ? 0.5 : 1); }
        else if (kind === 'kd') { var P = sample(it[1], 0.5), list = [], gap = 0; for (i = 1; i < P.length; i++) { gap += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (gap >= 4.4) { list.push(P[i][0], P[i][1], 1.15); gap = 0; } } o.dots = list; o.w = list.length / 3 * 1.6; }
        else if (kind === 'p') { o.dots = it[1]; o.w = it[1].length / 3 * 0.5; }
        else { o.full = flat(sample(it[1], 1.2)); o.w = kind === 'w' ? 1 : 9; }
        var src = o.full || o.dots, step = o.dots ? 3 : 2; for (i = 0; i < src.length; i += step) box(src[i], src[i + 1]);
        o.start = acc; acc += o.w; n++;
        return o;
      });
      Ly.lb = [u0, v0, u1, v1];
    });
    sc.total = acc;
    boxes(sc);
  }
  function boxes(sc) { // each sheet's corners and middle in the world, for culling and depth order
    sc.layers.forEach(function (Ly) {
      if (!Ly.lb) return;
      var b = Ly.lb;
      Ly.box = [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]].map(function (p) { return onLayer(Ly, p); });
      Ly.mid = onLayer(Ly, [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]);
    });
  }
  function place(sc, X, Zc, k, yaw) { // move a whole drawing on the ground: its centre to (X, Zc), scaled by k, turned by yaw
    var c = Math.cos(yaw), n = Math.sin(yaw);
    function turn(v) { return [v[0] * c + v[2] * n, v[1], -v[0] * n + v[2] * c]; }
    sc.layers.forEach(function (Ly) {
      var r = turn([Ly.o0[0], Ly.o0[1], Ly.o0[2] - sc.Z]);
      Ly.o = [X + k * r[0], k * r[1], Zc + k * r[2]]; Ly.s = k * Ly.s0; Ly.U = turn(Ly.U0); Ly.V = turn(Ly.V0);
    });
    sc.Zd = Zc; sc.X = X; sc.k = k; sc.yaw = yaw;
    boxes(sc);
  }

  // ---- the camera runs on one straight rail down the middle of the world (x = 0), at a fixed height, looking
  // straight ahead and a little down. It never turns: only its distance along the rail changes.
  var HEIGHT = 125, PITCH = 6 * Math.PI / 180;
  stations.forEach(function (st) { if (!st.scene) st.read = st.z - 8; }); // today: far enough back to see the whole gate

  // ---- the thread: the pieces inside the drawings are part of the drawings; between them it runs along the ground
  var pieces = [], hops = [];
  function addHop(a, b, sc) { // a and b are [x, y, z]; the line settles onto the ground between them
    var L = Math.max(0, b[2] - a[2]) * 0.42, P1 = [a[0], 0, a[2] + L], P2 = [b[0], 0, b[2] - L], len = Math.hypot(b[0] - a[0], b[2] - a[2]) + Math.abs(a[1]) + Math.abs(b[1]);
    var n = Math.max(6, Math.ceil(len / 10)), pts = [], beads = [], acc = 0, lastB = 0;
    for (var i = 0; i <= n; i++) {
      var t = i / n, u = 1 - t, c0 = u * u * u, c1 = 3 * u * u * t, c2 = 3 * u * t * t, c3 = t * t * t;
      var p = [c0 * a[0] + c1 * P1[0] + c2 * P2[0] + c3 * b[0], c0 * a[1] + c1 * P1[1] + c2 * P2[1] + c3 * b[1], c0 * a[2] + c1 * P1[2] + c2 * P2[2] + c3 * b[2]];
      if (i) acc += Math.hypot(p[0] - pts[pts.length - 3], p[2] - pts[pts.length - 1]);
      pts.push(p[0], p[1], p[2]);
      if (acc - lastB > 90 && i < n - 2 && Math.abs(p[1]) < 2) { beads.push(i); lastB = acc; }
    }
    hops.push({ p: pts, n: n, z0: Math.min(a[2], b[2]) - 1, z1: Math.max(a[2], b[2]) + 1, beads: beads, sc: sc || null });
  }
  function threadUp() {
    pieces = []; hops = [];
    scenes.forEach(function (sc) { sc.thread.forEach(function (p, k) { pieces.push({ sc: sc, k: k, a: onLayer(sc.layers[p.L], p.a), b: onLayer(sc.layers[p.L], p.b), L: p.L }); }); });
    var a = pieces[0].a; addHop([a[0] - 160, 0, Math.max(40, a[2] - 900)], a);
    for (var i = 0; i + 1 < pieces.length; i++) addHop(pieces[i].b, pieces[i + 1].a, pieces[i].sc === pieces[i + 1].sc ? pieces[i].sc : null);
  }
  threadUp();
  function threadAt(zw) { // the thread's point at a world depth, on the ground stretches
    for (var i = 0; i < hops.length; i++) {
      var h = hops[i]; if (h.sc || zw < h.z0 || zw > h.z1) continue;
      for (var j = 0; j < h.n; j++) { var za = h.p[3 * j + 2], zb = h.p[3 * j + 5]; if ((zw - za) * (zw - zb) <= 0) { var u = (zw - za) / ((zb - za) || 1); return [h.p[3 * j] + (h.p[3 * j + 3] - h.p[3 * j]) * u, h.p[3 * j + 1] + (h.p[3 * j + 4] - h.p[3 * j + 1]) * u, zw]; } }
    }
    return null;
  }

  // garlands: arches over the path between drawings, strung with motifs; the last drawing's motif, then the next one's
  var shapes = {}, arches = [];
  function motif(id) {
    if (id in shapes) return shapes[id];
    var raw = W.motifs && W.motifs[id], seed0 = hash('m' + id);
    return (shapes[id] = raw ? raw.map(function (it, n) {
      var kind = it[0];
      if (kind in WIDTH) { var b = brush(sample(it[1], 0.7), WIDTH[kind], seed0 + 7919 * n); return { poly: strokePoly(b, b.n) }; }
      if (kind === 'p') return { dots: it[1] };
      return { poly: flat(sample(it[1], 0.8)) };
    }) : null);
  }

  // today: a blue diamond, ruled twice, standing on the ground across the path
  var gate = (function () {
    function diamond(h) { var C = [[0, -h], [h, 0], [0, h], [-h, 0]], out = [], i, j; for (i = 0; i <= 4; i++) for (j = 0; j < 12; j++) { if (i === 4 && j > 2) break; var a = C[i % 4], b = C[(i + 1) % 4], u = j / 12; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); } return out; }
    return { edge: [brush(diamond(150), 6, 31), brush(diamond(134), 2.4, 32)], L: null };
  })();

  // ---- layout, and the camera's pose
  var dpr = 1, Wd = 0, Ht = 0, cx = 0, cy = 0, F = 1, camZ = 0, target = 0, press = 0, raf = 0, last = 0, buf = null;
  var C = [0, 0, 0], RX = [1, 0, 0], RY = [0, 1, 0], RZ = [0, 0, 1];
  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); Wd = root.clientWidth; Ht = window.innerHeight;
    var jl = journey.getBoundingClientRect().left;
    stage.style.marginLeft = -jl + 'px'; stage.style.width = Wd + 'px';
    cv.width = Math.round(Wd * dpr); cv.height = Math.round(Ht * dpr);
    var text = document.querySelector('.journey .station > div'), right = Wd > 1200 && text ? text.getBoundingClientRect().right + 24 : 0;
    cx = right ? (right + Wd) / 2 : Wd / 2; cy = Ht * 0.5;
    F = right ? Math.min((Wd - right) * 1.05, Wd * 0.5, Ht * 0.58) : Math.min(Wd * 1.02, Ht * 0.7); // focal length: a drawing ~290 units wide fills this many pixels while you read it
    var top = journey.getBoundingClientRect().top + scrollY;
    // beside the text, a drawing is in view while you read its section; where the text spans the page,
    // it is there in the gap above the section, and you fly through it behind the text as you read on
    var lead = right ? 0.24 : 0.8; // 0.25 is where the page header switches to the next section
    var moved = false;
    stations.forEach(function (st) {
      var head = (st.el.firstElementChild || st.el).getBoundingClientRect(), sc = st.scene;
      st.anchor = head.top + scrollY - Ht * lead;
      if (!sc) return;
      var X = 0, Zc = sc.Z, k = 1, yaw = 0;
      if (right && st.el.classList.contains('has-side')) {
        // the right-hand column is taken, so the drawing goes on the ground where, seen from the camera's reading
        // position on the rail, it lies in the space under the text. The camera itself never moves off the rail.
        var t = st.text.getBoundingClientRect(), kids = st.text.children, last = kids.length ? kids[kids.length - 1].getBoundingClientRect().bottom : t.bottom; // the grid stretches the block itself to the panel's height
        var bottom = Ht * lead + (last - head.top) + 24, room = Ht - bottom - 16;
        if (room > 150) {
          var c = Math.cos(PITCH), n = Math.sin(PITCH), r = (bottom + room * 0.42 - cy) / F, Cz = sc.read * Z;
          var dz = HEIGHT * (c - r * n) / (n + r * c), depth = HEIGHT * n + dz * c, w = Math.min((t.right - t.left) * 0.62, room * 1.9);
          X = ((t.left + t.right) / 2 - cx) / F * depth; Zc = Cz + dz;
          yaw = Math.atan2(X, dz); // turned so its spine points back at the camera, as if it lay open in front of you
          // being near the camera, its near edge looks much bigger than its far edge, so size it by its outline on screen
          prep(sc);
          var fits = function (kk) {
            place(sc, X, Zc, kk, yaw);
            var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
            sc.layers.forEach(function (Ly) { Ly.box.forEach(function (q) { var dy = q[1] + HEIGHT, d = q[2] - Cz, qz = dy * n + d * c, qx = cx + F * q[0] / qz, qy = cy + F * (dy * c - d * n) / qz; if (qx < x0) x0 = qx; if (qx > x1) x1 = qx; if (qy < y0) y0 = qy; if (qy > y1) y1 = qy; }); });
            return x1 - x0 <= w && y1 <= Ht - 12 && y0 >= bottom - 8;
          };
          var lo = 0.12, hi = 1;
          for (var it = 0; it < 14; it++) { var mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; }
          k = lo;
        }
      }
      if (X !== (sc.X || 0) || Zc !== sc.Zd || k !== (sc.k || 1) || yaw !== (sc.yaw || 0) || sc.fit !== k) { place(sc, X, Zc, k, yaw); sc.fit = k; moved = true; }
    });
    if (moved) threadUp();
    stations.start = top - Ht * 0.65;
  }
  function aim() { // scroll position to journey depth: each section's anchor puts the camera at that drawing's reading pose
    var y = scrollY, prevY = stations.start, prevZ = 0;
    for (var i = 0; i < stations.length; i++) {
      var st = stations[i], z = st.read;
      if (y < st.anchor) return prevZ + (z - prevZ) * clamp((y - prevY) / Math.max(1, st.anchor - prevY), 0, 1);
      prevY = st.anchor; prevZ = z;
    }
    return prevZ;
  }
  function pose() { // on the rail: straight ahead, tilted down by PITCH
    var c = Math.cos(PITCH), n = Math.sin(PITCH);
    C = [0, -HEIGHT, camZ * Z]; RX = [1, 0, 0]; RY = [0, c, -n]; RZ = [0, n, c];
  }
  function cam(p) { var dx = p[0] - C[0], dy = p[1] - C[1], dz = p[2] - C[2]; return [dx * RX[0] + dy * RX[1] + dz * RX[2], dx * RY[0] + dy * RY[1] + dz * RY[2], dx * RZ[0] + dy * RZ[1] + dz * RZ[2]]; }
  function dir(v) { return [v[0] * RX[0] + v[1] * RX[1] + v[2] * RX[2], v[0] * RY[0] + v[1] * RY[1] + v[2] * RY[2], v[0] * RZ[0] + v[1] * RZ[1] + v[2] * RZ[2]]; }
  function fade(zc) { return clamp((FARW - zc) / (FARW * 0.3), 0, 1); } // things come out of the distance; nothing fades up close
  function inkFor(zj) { return zj > todayZ + 0.01 ? BLUE : INK; } // past today, everything is drawn in blue

  // ---- drawing in perspective: a sheet's points are projected one by one, and cut at the near plane
  var ox = 0, oy = 0, oz = 0, ux = 0, uy = 0, uz = 0, vx = 0, vy = 0, vz = 0, X = [], Y = [], Q = [];
  function sheet(Ly) { var o = cam(Ly.o), U = dir(Ly.U), V = dir(Ly.V); ox = o[0]; oy = o[1]; oz = o[2]; ux = U[0] * Ly.s; uy = U[1] * Ly.s; uz = U[2] * Ly.s; vx = V[0] * Ly.s; vy = V[1] * Ly.s; vz = V[2] * Ly.s; }
  function addPoly(path, P) { // P: u, v pairs on the current sheet, a closed outline
    var n = P.length / 2, i, near = false;
    for (i = 0; i < n; i++) { var u = P[2 * i], v = P[2 * i + 1]; X[i] = ox + u * ux + v * vx; Y[i] = oy + u * uy + v * vy; Q[i] = oz + u * uz + v * vz; if (Q[i] < NEAR) near = true; }
    if (!near) { path.moveTo(cx + F * X[0] / Q[0], cy + F * Y[0] / Q[0]); for (i = 1; i < n; i++) path.lineTo(cx + F * X[i] / Q[i], cy + F * Y[i] / Q[i]); path.closePath(); return; }
    var started = false;
    function put(x, y, q) { var sx = cx + F * x / q, sy = cy + F * y / q; if (started) path.lineTo(sx, sy); else { path.moveTo(sx, sy); started = true; } }
    for (i = 0; i < n; i++) {
      var j = (i + n - 1) % n, ci = Q[i] >= NEAR, cj = Q[j] >= NEAR;
      if (ci !== cj) { var t = (NEAR - Q[j]) / (Q[i] - Q[j]); put(X[j] + (X[i] - X[j]) * t, Y[j] + (Y[i] - Y[j]) * t, NEAR); }
      if (ci) put(X[i], Y[i], Q[i]);
    }
    if (started) path.closePath();
  }
  function addDots(path, L, count, scale) {
    for (var i = 0; i < count; i++) {
      var u = L[3 * i], v = L[3 * i + 1], q = oz + u * uz + v * vz; if (q < NEAR) continue;
      var x = cx + F * (ox + u * ux + v * vx) / q, y = cy + F * (oy + u * uy + v * vy) / q, r = L[3 * i + 2] * scale * F / q;
      path.moveTo(x + r, y); path.arc(x, y, r, 0, 6.2832);
    }
  }
  function visible(Ly) { // is any part of the sheet in front of the camera and inside the far limit?
    var front = false, nearest = Infinity;
    for (var i = 0; i < 4; i++) { var q = cam(Ly.box[i])[2]; if (q > NEAR) front = true; if (q < nearest) nearest = q; }
    return front && nearest < FARW;
  }
  function drawLayer(Ly, reveal, col, base) {
    if (!visible(Ly)) return;
    sheet(Ly);
    var path = new Path2D(), fillC = null, fillA = -1, any = false, zc = cam(Ly.mid)[2];
    function flush() {
      if (any) { g.globalAlpha = fillA; g.fillStyle = fillC; g.fill(path); if (press > 0.02 && fillC !== PAPER) { g.lineWidth = press * 0.55 * Ly.s * F / Math.max(NEAR, zc); g.strokeStyle = fillC; g.stroke(path); } }
      path = new Path2D(); any = false;
    }
    Ly.items.forEach(function (o) {
      var p = (reveal - o.start) / o.w; if (p <= 0) return;
      var colr = o.kind === 'w' ? PAPER : col, a = base * (p < 1 && !o.b && !o.dots ? p : 1);
      if (colr !== fillC || a !== fillA) { flush(); fillC = colr; fillA = a; }
      if (o.b) addPoly(path, p < 1 ? strokePoly(o.b, Math.max(1, Math.floor(o.b.n * p))) : o.full);
      else if (o.dots) addDots(path, o.dots, p < 1 ? Math.ceil(o.dots.length / 3 * p) : o.dots.length / 3, Ly.s);
      else addPoly(path, o.full);
      any = true;
    });
    flush();
  }

  // ---- the pen's progress: while you read a section the thread ends in its drawing; as you fly through it,
  // the pen runs on to the next drawing (garlands appear along the way), then draws that one
  var tipZ = 0, playZ = -Infinity, RUN = 6;
  function reach(z) {
    var tip = scenes[0].z;
    for (var i = 0; i < scenes.length; i++) { var T = scenes[i].z - 2.5; if (z < T) break; tip = i + 1 < scenes.length ? Math.min(scenes[i + 1].z, scenes[i].z + (z - T) * RUN) : scenes[i].z; }
    return Math.min(tip, z + AHEAD);
  }
  function revealOf(i) { // the camera's approach draws a drawing, and so does the recording reaching its part of the piece
    var sc = scenes[i], byMusic = ease((playZ - (sc.z - 6)) / 5); if (!i) return Math.max(byMusic, ease((camZ - (sc.read - 12)) / 10));
    var A = scenes[i - 1], start = A.z - 2.5 + (sc.z - A.z) / RUN, end = Math.max(start + 1.5, sc.read - 1);
    return Math.max(byMusic, ease((camZ - start) / (end - start)));
  }

  function scene(sc) {
    var i = scenes.indexOf(sc), R = revealOf(i); if (R <= 0) return;
    prep(sc);
    var reveal = R * sc.total, col = inkFor(sc.z), base = fade(cam([sc.X || 0, -100, sc.Zd])[2]);
    var order = sc.layers.slice().sort(function (a, b) { return (!!a.top - !!b.top) || (!!b.ground - !!a.ground) || (cam(b.mid)[2] - cam(a.mid)[2]); });
    var grounds = order.filter(function (Ly) { return Ly.ground && !Ly.top; });
    grounds.forEach(function (Ly) { drawLayer(Ly, reveal, col, base); });
    hops.forEach(function (h, k) { if (h.sc === sc) drawHop(h, -Infinity, Infinity, clamp((R - 0.3) / 0.25, 0, 1)); }); // the stretch between two pieces of one drawing
    order.forEach(function (Ly) { if (!(Ly.ground && !Ly.top)) drawLayer(Ly, reveal, col, base); });
    g.globalAlpha = 1;
  }

  function project(p) { var c = cam(p); return c[2] < NEAR ? null : [cx + F * c[0] / c[2], cy + F * c[1] / c[2], F / c[2], c[2]]; }
  function ribbon(P, hwOf) { // a tapered line through projected points
    var path = new Path2D(), A = [], B = [], m;
    for (m = 0; m < P.length; m++) {
      var a = P[Math.max(0, m - 1)], b = P[Math.min(P.length - 1, m + 1)], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, hw = hwOf(P[m]);
      A.push(P[m][0] - dy / len * hw, P[m][1] + dx / len * hw); B.push(P[m][0] + dy / len * hw, P[m][1] - dx / len * hw);
    }
    path.moveTo(A[0], A[1]); for (m = 1; m < P.length; m++) path.lineTo(A[2 * m], A[2 * m + 1]);
    for (m = P.length - 1; m >= 0; m--) path.lineTo(B[2 * m], B[2 * m + 1]);
    path.closePath();
    return path;
  }
  function drawHop(h, lo, hi, part) { // the ground stretch between depths lo and hi (world), drawn up to `part` of its length
    if (part <= 0) return;
    var P = [], last = Math.floor(h.n * part), i, q;
    for (i = 0; i <= last; i++) {
      var z = h.p[3 * i + 2]; if (z < lo - 40 || z > hi + 40) continue;
      q = project([h.p[3 * i], h.p[3 * i + 1], z]); if (!q) { if (P.length > 1) break; P = []; continue; }
      q.push(z); P.push(q);
    }
    if (P.length < 2) return;
    for (i = 0; i < P.length - 1; i += 8) {
      var k = Math.min(P.length - 1, i + 8), zm = (P[i][4] + P[k][4]) / 2;
      g.globalAlpha = fade((P[i][3] + P[k][3]) / 2); g.fillStyle = inkFor(zm / Z);
      g.fill(ribbon(P.slice(i, k + 1), function (p) { return clamp(0.95 * p[2], 0.5, 2.2); }));
    }
    h.beads.forEach(function (bi) {
      if (bi > last) return;
      var z = h.p[3 * bi + 2]; if (z < lo || z > hi) return;
      q = project([h.p[3 * bi], h.p[3 * bi + 1], z]); if (!q) return;
      g.globalAlpha = fade(q[3]); g.fillStyle = inkFor(z / Z); g.beginPath(); g.arc(q[0], q[1], clamp(1.2 * q[2], 0.9, 2.6), 0, 6.2832); g.fill();
    });
    if (part < 1 && P.length) { var e = P[P.length - 1]; g.globalAlpha = fade(e[3]); g.fillStyle = inkFor(e[4] / Z); g.beginPath(); g.arc(e[0], e[1], clamp(1.8 * e[2], 1.5, 3.2), 0, 6.2832); g.fill(); } // the pen
  }
  function thread(lo, hi) { // the ground stretches, and the garlands, between two depths (world units)
    var tipW = tipZ * Z;
    hops.forEach(function (h) {
      if (h.sc || h.z1 < lo || h.z0 > hi || h.z0 > tipW) return;
      drawHop(h, lo, hi, h.z1 <= tipW ? 1 : clamp((tipW - h.z0) / (h.z1 - h.z0), 0, 1));
    });
    arches.forEach(function (A) {
      if (A.z < lo || A.z > hi || A.z > tipW) return;
      var q0 = cam([A.x, A.y, A.z]); if (q0[2] < NEAR) return;
      var alpha = fade(q0[2]) * ease((tipW - A.z) / 40), col = inkFor(A.z / Z), P = [];
      A.line.forEach(function (p) { var q = project(p); if (q) P.push(q); });
      g.globalAlpha = alpha; g.fillStyle = col;
      if (P.length > 1) g.fill(ribbon(P, function (p) { return clamp(0.45 * p[2], 0.35, 1.1); }));
      var path = new Path2D();
      A.beads.forEach(function (b) {
        var sh = motif(b.m); if (!sh) return;
        ox = 0; oy = 0; oz = 0; var c0 = cam([b.x, b.y, A.z]), U = dir([b.c, b.s, 0]), V = dir([-b.s, b.c, 0]);
        ox = c0[0]; oy = c0[1]; oz = c0[2]; ux = U[0] * b.k; uy = U[1] * b.k; uz = U[2] * b.k; vx = V[0] * b.k; vy = V[1] * b.k; vz = V[2] * b.k;
        sh.forEach(function (it) { if (it.poly) addPoly(path, it.poly); else addDots(path, it.dots, it.dots.length / 3, b.k); });
      });
      g.fill(path);
    });
    g.globalAlpha = 1;
  }
  function strings() { // build the arches, once the camera path exists
    for (var i = 0; i + 1 < scenes.length; i++) {
      var A = scenes[i], B = scenes[i + 1]; if (B.id === 'coda') continue;
      var z0 = A.Z + 260, z1 = B.read * Z - 60; if (z1 - z0 < 200) continue;
      [0.3, 0.75].forEach(function (f, k) {
        var z = z0 + (z1 - z0) * f; if (Math.abs(z - todayZ * Z) < 160) return;
        var x0 = 0, id = k ? B.id : A.id, line = [], beads = [];
        for (var j = 0; j <= 40; j++) { var t = j / 40 * Math.PI, x = x0 - Math.cos(t) * 190, y = -Math.sin(t) * 235; line.push([x, y, z]); }
        for (j = 1; j < 14; j++) { var t2 = j / 14 * Math.PI, tx = Math.sin(t2) * 190, ty = -Math.cos(t2) * 235, tm = Math.hypot(tx, ty); beads.push({ x: x0 - Math.cos(t2) * 190, y: -Math.sin(t2) * 235 + 10, c: tx / tm, s: ty / tm, k: 1.3, m: id }); }
        arches.push({ z: z, x: x0, y: -120, line: line, beads: beads });
      });
    }
  }

  function today() {
    var T = todayZ * Z, R = ease((tipZ - todayZ) / 1.6); if (R <= 0) return;
    if (!gate.L) gate.L = { o: [0, -150, T], U: [1, 0, 0], V: [0, 1, 0], s: 1, box: [[-150, -300, T], [150, -300, T], [150, 0, T], [-150, 0, T]] };
    var Ly = gate.L; if (!visible(Ly)) return;
    sheet(Ly); var q = cam(Ly.o)[2], path = new Path2D();
    gate.edge.forEach(function (b, n) { var k = Math.floor(b.n * ease(R * 1.2 - n * 0.2)); if (k >= 1) addPoly(path, strokePoly(b, k)); });
    g.globalAlpha = fade(q); g.fillStyle = BLUE; g.fill(path);
    var p = project([Ly.o[0] - 166, Ly.o[1] + 5, T]);
    if (p && R > 0.6) { g.globalAlpha = fade(q) * ease((R - 0.6) / 0.3); g.font = 'italic ' + (17 * p[2]).toFixed(1) + 'px Petrona, Georgia, serif'; g.textAlign = 'right'; g.fillText('today', p[0], p[1]); g.textAlign = 'left'; }
    g.globalAlpha = 1;
  }
  function playhead() { // while the recording plays, a blue ring rides the thread at the music's position
    if (window.state !== 'playing' || !window.active || playZ > tipZ) return;
    var p = threadAt(playZ * Z); if (!p) return;
    var q = project(p); if (!q) return;
    g.globalAlpha = fade(q[3]); g.strokeStyle = BLUE; g.lineWidth = clamp(0.9 * q[2], 1.4, 2.6);
    g.beginPath(); g.arc(q[0], q[1], clamp(3.2 * q[2], 4, 11), 0, 6.2832); g.stroke(); g.globalAlpha = 1;
  }

  function render() {
    playZ = window.state === 'playing' && window.active ? window.active.a.currentTime * K : -Infinity;
    tipZ = Math.max(reach(camZ), Math.min(playZ, camZ + AHEAD)); // while it plays, the music draws the thread on
    pose();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalAlpha = 1;
    g.fillStyle = PAPER; g.fillRect(0, 0, Wd, Ht);
    // far to near: each drawing and the gate, with the thread and garlands in the stretches between them
    var ev = [];
    scenes.forEach(function (sc) { if (sc.Zd > C[2] - 700 && sc.Zd < C[2] + FARW + 400) ev.push({ z: sc.Zd, f: function () { scene(sc); } }); });
    ev.push({ z: todayZ * Z, f: today });
    ev.sort(function (a, b) { return b.z - a.z; });
    var hi = Infinity;
    ev.forEach(function (e) { thread(e.z, hi); e.f(); hi = e.z; });
    thread(-Infinity, hi);
    playhead();
    g.globalAlpha = 1;
  }

  function level() {
    var tap = window.tap; if (!tap || window.state !== 'playing') return 0;
    var s = 0, i;
    if (tap.getFloatTimeDomainData) { buf = buf || new Float32Array(tap.fftSize); tap.getFloatTimeDomainData(buf); for (i = 0; i < buf.length; i++) s += buf[i] * buf[i]; }
    else { buf = buf || new Uint8Array(tap.fftSize); tap.getByteTimeDomainData(buf); for (i = 0; i < buf.length; i++) s += (buf[i] - 128) * (buf[i] - 128) / 16384; }
    return clamp((Math.sqrt(s / buf.length) - 0.02) / 0.26, 0, 1);
  }
  function frame(now) {
    raf = 0;
    var dt = Math.min(0.05, (now - (last || now)) / 1000) || 0.016; last = now;
    target = aim();
    camZ += (target - camZ) * (1 - Math.exp(-dt / 0.38)); // glide toward the scroll position, easing out
    if (Math.abs(target - camZ) < 0.0015) camZ = target;
    var lv = level(); press += (lv - press) * (1 - Math.exp(-dt / (lv > press ? 0.09 : 0.45))); if (press < 0.003 && !lv) press = 0;
    var vis = journey.getBoundingClientRect();
    if (vis.bottom > 0 && vis.top < Ht) render();
    if (camZ !== target || press > 0 || window.state === 'playing') raf = requestAnimationFrame(frame); else last = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  window.inkKick = kick;
  strings();
  layout(); camZ = target = aim();
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', function () { layout(); kick(); });
  if (window.ResizeObserver) new ResizeObserver(function () { layout(); kick(); }).observe(journey);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); kick(); });
  kick();
})();
