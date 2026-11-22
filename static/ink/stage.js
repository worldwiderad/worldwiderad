// The ink world behind the homepage's projects. Scrolling flies a camera through one pen-and-ink drawing per
// project, each placed at its point in 4part, and one pen line, the thread, runs from each drawing to the next.
// The camera follows the thread through an opening in every drawing; the drawings fly past at the edges.
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

  // K: world units per second of music. D: how far in front of a drawing the camera is while you read its section.
  // AHEAD: how far ahead of the camera the pen has drawn.
  var LEN = window.LEN || 593.32, K = 0.35, D = 4.5, FAR = 30, NEAR = 0.12, AHEAD = 24;
  var INK = '#1a1a1a', BLUE = '#2340a8', PAPER = '#ffffff', NIGHT = '#1c1b19', LIGHT = '#efece4', PALE = '#b4c2ff';
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
  function brush(P, w, seed) {
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
  function outline(o, k) { // the stroke as drawn up to its k-th sample
    var p = new Path2D(), A = o.A, B = o.B, i;
    p.moveTo(A[0], A[1]);
    for (i = 1; i <= k; i++) p.lineTo(A[2 * i], A[2 * i + 1]);
    for (i = k; i >= 0; i--) p.lineTo(B[2 * i], B[2 * i + 1]);
    p.closePath();
    return p;
  }
  function dots(list, k) { var p = new Path2D(); for (var i = 0; i < k; i++) { var d = list[i]; p.moveTo(d[0] + d[2], d[1]); p.arc(d[0], d[1], d[2], 0, 6.2832); } return p; }

  // ---- the drawings, one per section, placed along the piece
  var stations = [].slice.call(document.querySelectorAll('.journey .station')), scenes = [], todayZ = 421.5 * K, washZ = Infinity, lastT = 0;
  stations.forEach(function (el, i) {
    var t = el.dataset.f === '' ? lastT + 24 : +el.dataset.f * LEN; lastT = t;
    var st = { el: el, id: el.id, z: t * K, anchor: 0, text: el.querySelector('div') || el }, raw = W.scenes[el.id];
    if (el.id === 'today') todayZ = st.z;
    if (el.id === 'coda') washZ = st.z - 7;
    if (raw) scenes.push(st.scene = { id: el.id, z: st.z, S: raw.S, look: raw.look, gap: raw.gap, tin: raw.tin, tout: raw.tout, total: 0,
      layers: raw.layers.map(function (l) { return { dz: l.dz, x: l.x, y: l.y, s: l.s, raw: l.i, items: null }; }) });
    stations[i] = st;
  });
  function wp(sc, p) { return [sc.S * (p[0] - 120), sc.S * (p[1] - 90)]; } // a drawing's point, in the world
  function prep(sc) {
    if (sc.total) return;
    var seed0 = hash(sc.id), n = 0, acc = 0;
    sc.layers.forEach(function (Ly) {
      Ly.items = Ly.raw.map(function (it) {
        var kind = it[0], o = { kind: kind };
        if (kind in WIDTH) { o.b = brush(sample(it[1], 1.4), WIDTH[kind], seed0 + n * 7919); o.full = outline(o.b, o.b.n); o.w = Math.max(5, o.b.len) * (kind === 'k1' ? 0.5 : 1); }
        else if (kind === 'kd') { var P = sample(it[1], 0.5), list = [], gap = 0; for (var i = 1; i < P.length; i++) { gap += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (gap >= 4.4) { list.push([P[i][0], P[i][1], 1.15]); gap = 0; } } o.list = list; o.full = dots(list, list.length); o.w = list.length * 1.6; }
        else if (kind === 'p') { var L = []; for (var j = 0; j < it[1].length; j += 3) L.push([it[1][j], it[1][j + 1], it[1][j + 2]]); o.list = L; o.full = dots(L, L.length); o.w = L.length * 0.5; }
        else { o.full = new Path2D(it[1]); o.w = kind === 'w' ? 1 : 9; }
        o.start = acc; acc += o.w; n++;
        return o;
      });
    });
    sc.order = sc.layers.slice().sort(function (a, b) { return b.dz - a.dz; });
    sc.total = acc;
  }

  // ---- the camera's path: in front of each drawing while you read, then through its opening.
  // A monotone cubic through those points, so it never overshoots an opening.
  function spline(zs, vs) {
    var n = zs.length, d = [], m = [], i;
    for (i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (zs[i + 1] - zs[i]));
    m[0] = 0; m[n - 1] = 0;
    for (i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) { m[i] = 0; continue; }
      var h0 = zs[i] - zs[i - 1], h1 = zs[i + 1] - zs[i], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
    return function (z, slope) {
      if (z <= zs[0]) return slope ? 0 : vs[0];
      if (z >= zs[n - 1]) return slope ? 0 : vs[n - 1];
      var k = 0; while (z > zs[k + 1]) k++;
      var h = zs[k + 1] - zs[k], t = (z - zs[k]) / h, t2 = t * t, t3 = t2 * t;
      if (slope) return ((6 * t2 - 6 * t) * vs[k] + (3 * t2 - 4 * t + 1) * h * m[k] + (-6 * t2 + 6 * t) * vs[k + 1] + (3 * t2 - 2 * t) * h * m[k + 1]) / h;
      return (2 * t3 - 3 * t2 + 1) * vs[k] + (t3 - 2 * t2 + t) * h * m[k] + (-2 * t3 + 3 * t2) * vs[k + 1] + (t3 - t2) * h * m[k + 1];
    };
  }
  var keys = [];
  function key(z, p) { if (!keys.length || z > keys[keys.length - 1][0] + 0.3) keys.push([z, p[0], p[1]]); }
  key(0, wp(scenes[0], scenes[0].look));
  scenes.forEach(function (sc) { key(sc.z - D, wp(sc, sc.look)); if (sc.gap) key(sc.z, wp(sc, sc.gap)); });
  var pathX = spline(keys.map(function (k) { return k[0]; }), keys.map(function (k) { return k[1]; }));
  var pathY = spline(keys.map(function (k) { return k[0]; }), keys.map(function (k) { return k[2]; }));

  // ---- the thread: from where it leaves one drawing to where it enters the next, a curve in depth
  var segs = [];
  function addSeg(a, b) { // a, b: [x, y, z]
    var L = (b[2] - a[2]) * 0.45, n = Math.max(8, Math.ceil((b[2] - a[2]) / 0.15)), pts = [], beads = [], lastB = Math.floor(a[2] / 1.6);
    for (var i = 0; i <= n; i++) {
      var t = i / n, u = 1 - t, c0 = u * u * u, c1 = 3 * u * u * t, c2 = 3 * u * t * t, c3 = t * t * t;
      var z = c0 * a[2] + c1 * (a[2] + L) + c2 * (b[2] - L) + c3 * b[2];
      pts.push(c0 * a[0] + c1 * a[0] + c2 * b[0] + c3 * b[0], c0 * a[1] + c1 * a[1] + c2 * b[1] + c3 * b[1], z);
      if (Math.floor(z / 1.6) !== lastB && i > 1 && i < n - 1) { beads.push(i); lastB = Math.floor(z / 1.6); }
    }
    segs.push({ p: pts, n: n, z0: a[2], z1: b[2], beads: beads });
  }
  (function () {
    var e = wp(scenes[0], scenes[0].tin);
    addSeg([e[0] - 40, e[1] + 70, Math.max(0.6, scenes[0].z - 16)], [e[0], e[1], scenes[0].z]);
    for (var i = 0; i + 1 < scenes.length; i++) {
      var a = wp(scenes[i], scenes[i].tout), b = wp(scenes[i + 1], scenes[i + 1].tin);
      addSeg([a[0], a[1], scenes[i].z], [b[0], b[1], scenes[i + 1].z]);
    }
  })();
  // garlands: mirrored arcs of small motifs along the thread, the last drawing's motif handing over to the next one's
  var shapes = {}, garland = [], strands = [];
  function motif(id) { // brush outlines for a motif, built the first time it's needed
    if (id in shapes) return shapes[id];
    var raw = W.motifs && W.motifs[id], seed0 = hash('m' + id);
    return (shapes[id] = raw ? raw.map(function (it, n) {
      var kind = it[0];
      if (kind in WIDTH) { var b = brush(sample(it[1], 0.7), WIDTH[kind], seed0 + 7919 * n); return outline(b, b.n); }
      if (kind === 'p') { var L = []; for (var j = 0; j < it[1].length; j += 3) L.push([it[1][j], it[1][j + 1], it[1][j + 2]]); return dots(L, L.length); }
      return new Path2D(it[1]);
    }) : null);
  }
  function strings() {
    for (var i = 0; i + 1 < scenes.length; i++) {
      var A = scenes[i], B = scenes[i + 1]; if (B.id === 'coda') continue;
      var z0 = A.z + 2.2, z1 = B.z - 7.5; if (z1 - z0 < 1.5) continue;
      var count = z1 - z0 > 8 ? 3 : 2;
      for (var k = 0; k < count; k++) {
        var f = k / (count - 1), z = z0 + (z1 - z0) * f; if (Math.abs(z - todayZ) < 2.5) continue;
        var px = pathX(z), py = pathY(z), up = (i + k) % 2;
        for (var side = -1; side <= 1; side += 2) {
          var line = [];
          for (var j = 0; j <= 30; j++) {
            var u = j / 30, sn = Math.sin(Math.PI * u * 0.85), cs = Math.cos(Math.PI * u * 0.85), x = side * (30 + 130 * u), y = up ? -42 + 96 * sn : 38 - 96 * sn;
            line.push([px + x, py + y, z - u * 1.6]);
            if (j % 3 || !j) continue;
            var ang = Math.atan2((up ? 1 : -1) * 96 * Math.PI * 0.85 * cs, 130);
            garland.push({ z: z - u * 1.6, x: px + x, y: py + y + 6, a: side > 0 ? ang : -ang, flip: side < 0, size: 12 + 8 * u, m: f < 0.34 ? A.id : f > 0.66 ? B.id : (j % 2 ? B.id : A.id) });
          }
          strands.push({ p: line, z0: z - 1.6, z1: z });
        }
      }
    }
    garland.sort(function (a, b) { return a.z - b.z; });
  }
  function threadAt(z) { // the thread's point at a depth
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i]; if (z < s.z0 || z > s.z1) continue;
      for (var j = 0; j < s.n; j++) { var za = s.p[3 * j + 2], zb = s.p[3 * j + 5]; if (z >= za && z <= zb) { var u = (z - za) / ((zb - za) || 1); return [s.p[3 * j] + (s.p[3 * j + 3] - s.p[3 * j]) * u, s.p[3 * j + 1] + (s.p[3 * j + 4] - s.p[3 * j + 1]) * u]; } }
    }
    return null;
  }

  // before the finale, a marcato accent: a wedge of ink the camera flies into. Its outline is inked first,
  // then it floods from the tip down, and once the camera is inside, the page is dark.
  var accent = (function () {
    var C = [[0, -330], [430, 250], [292, 250], [0, 62], [-292, 250], [-430, 250]], r = rng(5), edge = [], i, j;
    function ring(k, dy) { var out = []; for (i = 0; i < C.length; i++) { var a = C[i], b = C[(i + 1) % C.length]; for (j = 0; j < 14; j++) { var u = j / 14; out.push([(a[0] + (b[0] - a[0]) * u) * k, (a[1] + (b[1] - a[1]) * u) * k + dy]); } } out.push(out[0].slice()); return out; }
    var body = ring(1, 0), fillP = new Path2D();
    body.forEach(function (q, n) { var x = q[0] + (r() - 0.5) * 3, y = q[1] + (r() - 0.5) * 3; if (n) fillP.lineTo(x, y); else fillP.moveTo(x, y); });
    fillP.closePath();
    [[1.045, -6, 9], [1.1, -14, 5]].forEach(function (o, n) { edge.push(brush(ring(o[0], o[1]), o[2], 77 + n)); });
    return { fill: fillP, edge: edge, x: 0, y: 0 };
  })();
  // today: a blue diamond, ruled twice, that the camera flies through; past it everything is drawn in blue
  var gate = (function () {
    function diamond(h) { var C = [[0, -h], [h, 0], [0, h], [-h, 0]], out = [], i, j; for (i = 0; i <= 4; i++) for (j = 0; j < 12; j++) { if (i === 4 && j > 2) break; var a = C[i % 4], b = C[(i + 1) % 4], u = j / 12; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); } return out; }
    return { edge: [brush(diamond(150), 6, 31), brush(diamond(134), 2.4, 32)], x: 0, y: 0 };
  })();

  // ---- layout and camera
  var dpr = 1, Wd = 0, Ht = 0, cx = 0, cy = 0, F = 1, camZ = 0, camX = 0, camY = 0, cr = 1, sr = 0, target = 0, press = 0, raf = 0, last = 0, buf = null, dark = false;
  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); Wd = root.clientWidth; Ht = window.innerHeight;
    var jl = journey.getBoundingClientRect().left;
    stage.style.marginLeft = -jl + 'px'; stage.style.width = Wd + 'px';
    cv.width = Math.round(Wd * dpr); cv.height = Math.round(Ht * dpr);
    var text = document.querySelector('.journey .station > div'), right = Wd > 1200 && text ? text.getBoundingClientRect().right + 24 : 0;
    cx = right ? (right + Wd) / 2 : Wd / 2; cy = Ht * 0.5;
    var px = right ? Math.min((Wd - right) * 1.05, Wd * 0.5) : Math.min(Wd * 1.02, Ht * 0.7);
    F = D * px / 288; // a drawing 1.2 x 240 units wide spans px pixels while you read its section
    var top = journey.getBoundingClientRect().top + scrollY;
    // beside the text, a drawing is in view while you read its section; where the text spans the page,
    // it is there in the gap above the section, and you fly through it behind the text as you read on
    var lead = right ? 0.24 : 0.8; // 0.25 is where the page header switches to the next section
    stations.forEach(function (st) { st.anchor = (st.el.firstElementChild || st.el).getBoundingClientRect().top + scrollY - Ht * lead; });
    stations.start = top - Ht * 0.65;
  }
  function aim() { // scroll position to camera depth: each section's anchor puts the camera in front of its drawing
    var y = scrollY, prevY = stations.start, prevZ = 0;
    for (var i = 0; i < stations.length; i++) {
      var st = stations[i], z = st.z - D;
      if (y < st.anchor) return prevZ + (z - prevZ) * clamp((y - prevY) / Math.max(1, st.anchor - prevY), 0, 1);
      prevY = st.anchor; prevZ = z;
    }
    return prevZ;
  }
  // The pen works in order: while you read a section the thread ends in its drawing; as you fly through it,
  // the pen runs the thread on to the next drawing (garlands appear along it), then draws that drawing.
  var tipZ = 0, playZ = -Infinity, RUN = 6;
  function reach(z) {
    var tip = scenes[0].z;
    for (var i = 0; i < scenes.length; i++) { var T = scenes[i].z - 2.5; if (z < T) break; tip = i + 1 < scenes.length ? Math.min(scenes[i + 1].z, scenes[i].z + (z - T) * RUN) : scenes[i].z; }
    return Math.min(tip, z + AHEAD);
  }
  function revealOf(i) { // the camera's approach draws a drawing, and so does the recording reaching its part of the piece
    var sc = scenes[i], byMusic = ease((playZ - (sc.z - 6)) / 5); if (!i) return Math.max(byMusic, ease((camZ - (sc.z - AHEAD)) / 12));
    var A = scenes[i - 1], start = A.z - 2.5 + (sc.z - A.z) / RUN, end = Math.max(start + 1.5, sc.z - D - 1);
    return Math.max(byMusic, ease((camZ - start) / (end - start)));
  }
  function fade(dz) { return clamp((FAR - dz) / (FAR * 0.3), 0, 1); } // things come out of the distance; nothing fades up close
  function inkFor(z) { var future = z > todayZ + 0.01; return dark ? (future ? PALE : LIGHT) : (future ? BLUE : INK); }
  function project(X, Y, dz) { var s = F / dz, x = (X - camX) * s, y = (Y - camY) * s; return [cx + x * cr - y * sr, cy + x * sr + y * cr, s]; }
  function place(s, ox, oy, ang, flip) { // local units to screen: scale s, origin at (ox, oy) before the camera's roll, turned by ang
    var e = cx + (ox - cx) * cr - (oy - cy) * sr, f = cy + (ox - cx) * sr + (oy - cy) * cr, c = cr, n = sr, fx = flip ? -1 : 1;
    if (ang) { c = Math.cos(ang) * cr - Math.sin(ang) * sr; n = Math.sin(ang) * cr + Math.cos(ang) * sr; }
    g.setTransform(dpr * s * c * fx, dpr * s * n * fx, -dpr * s * n, dpr * s * c, dpr * e, dpr * f);
  }

  function scene(sc) {
    var R = revealOf(scenes.indexOf(sc)); if (R <= 0) return;
    prep(sc);
    var reveal = R * sc.total, col = inkFor(sc.z);
    sc.order.forEach(function (Ly) {
      var dz = sc.z + Ly.dz - camZ; if (dz < NEAR || dz > FAR) return;
      var k = F / dz, s = k * sc.S * Ly.s;
      place(s, cx + (sc.S * (Ly.x - 120 * Ly.s) - camX) * k, cy + (sc.S * (Ly.y - 90 * Ly.s) - camY) * k);
      var base = fade(dz);
      g.lineJoin = 'round'; g.lineWidth = press * 0.55 / (sc.S * Ly.s); g.strokeStyle = col;
      Ly.items.forEach(function (o) {
        var p = (reveal - o.start) / o.w; if (p <= 0) return;
        var path = o.full, alpha = base;
        if (p < 1) {
          if (o.b) path = outline(o.b, Math.max(1, Math.floor(o.b.n * p)));
          else if (o.list) path = dots(o.list, Math.ceil(o.list.length * p));
          else alpha *= p;
        }
        g.globalAlpha = alpha;
        g.fillStyle = o.kind === 'w' ? (dark ? NIGHT : PAPER) : col;
        g.fill(path);
        if (press > 0.02 && o.kind !== 'w' && !o.list) g.stroke(path);
      });
    });
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalAlpha = 1;
  }

  function thread(za, zb) { // the part of the thread between two depths, as a tapered pen line with beads
    var lo = Math.max(za, camZ + NEAR), hi = Math.min(zb, camZ + FAR, tipZ); if (hi <= lo) return;
    var tip = tipZ;
    segs.forEach(function (s) {
      if (s.z1 < lo || s.z0 > hi) return;
      var P = [], i, z, q;
      function at(i0, zt) { // a point between samples i0 and i0 + 1, at depth zt
        var za = s.p[3 * i0 + 2], u = (zt - za) / ((s.p[3 * i0 + 5] - za) || 1), r = project(s.p[3 * i0] + (s.p[3 * i0 + 3] - s.p[3 * i0]) * u, s.p[3 * i0 + 1] + (s.p[3 * i0 + 4] - s.p[3 * i0 + 1]) * u, zt - camZ);
        r.push(zt); P.push(r);
      }
      for (i = 0; i <= s.n; i++) {
        z = s.p[3 * i + 2];
        if (z < lo) continue;
        if (!P.length && i > 0) at(i - 1, lo);
        if (z > hi) { if (i > 0) at(i - 1, hi); break; }
        q = project(s.p[3 * i], s.p[3 * i + 1], z - camZ); q.push(z); P.push(q);
      }
      if (P.length < 2) return;
      for (i = 0; i < P.length - 1; i += 6) { // in short runs, so colour and distance can change along it
        var k = Math.min(P.length - 1, i + 6), zm = (P[i][3] + P[k][3]) / 2, path = new Path2D(), A = [], B = [], m;
        for (m = i; m <= k; m++) {
          var a = P[Math.max(0, m - 1)], b = P[Math.min(P.length - 1, m + 1)], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
          var hw = clamp(0.8 * P[m][2], 0.5, 1.45);
          A.push([P[m][0] - dy / len * hw, P[m][1] + dx / len * hw]); B.push([P[m][0] + dy / len * hw, P[m][1] - dx / len * hw]);
        }
        path.moveTo(A[0][0], A[0][1]); for (m = 1; m < A.length; m++) path.lineTo(A[m][0], A[m][1]);
        for (m = B.length - 1; m >= 0; m--) path.lineTo(B[m][0], B[m][1]);
        path.closePath();
        g.globalAlpha = fade(zm - camZ); g.fillStyle = inkFor(zm); g.fill(path);
      }
      s.beads.forEach(function (bi) { // a bead every so often: the line's rhythm, and a sense of distance
        z = s.p[3 * bi + 2]; if (z < lo || z > hi) return;
        q = project(s.p[3 * bi], s.p[3 * bi + 1], z - camZ);
        g.globalAlpha = fade(z - camZ); g.fillStyle = inkFor(z); g.beginPath(); g.arc(q[0], q[1], clamp(1.1 * q[2], 0.9, 2.6), 0, 6.2832); g.fill();
      });
      if (tip > s.z0 && tip < s.z1 && tip <= hi) { var e = P[P.length - 1]; g.globalAlpha = fade(tip - camZ); g.fillStyle = inkFor(tip); g.beginPath(); g.arc(e[0], e[1], clamp(1.9 * e[2], 1.6, 3.4), 0, 6.2832); g.fill(); } // the pen
    });
    strands.forEach(function (st) { // the garlands' strings
      if (st.z1 < lo || st.z0 > hi) return;
      var path = new Path2D(), A = [], B = [], m, P = [];
      st.p.forEach(function (q) { if (q[2] >= lo && q[2] <= hi && q[2] <= tipZ) P.push(project(q[0], q[1], q[2] - camZ)); });
      if (P.length < 2) return;
      for (m = 0; m < P.length; m++) {
        var a = P[Math.max(0, m - 1)], b = P[Math.min(P.length - 1, m + 1)], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, hw = clamp(0.34 * P[m][2], 0.3, 0.85);
        A.push([P[m][0] - dy / len * hw, P[m][1] + dx / len * hw]); B.push([P[m][0] + dy / len * hw, P[m][1] - dx / len * hw]);
      }
      path.moveTo(A[0][0], A[0][1]); for (m = 1; m < A.length; m++) path.lineTo(A[m][0], A[m][1]);
      for (m = B.length - 1; m >= 0; m--) path.lineTo(B[m][0], B[m][1]);
      g.globalAlpha = fade((st.z0 + st.z1) / 2 - camZ) * ease((tipZ - st.z1) / 2); g.fillStyle = inkFor(st.z0); g.fill(path);
    });
    garland.forEach(function (o) {
      if (o.z < lo || o.z > hi || o.z > tipZ) return;
      var sh = motif(o.m); if (!sh) return;
      var dz = o.z - camZ, k = F / dz, s = k * o.size / 20;
      place(s, cx + (o.x - camX) * k, cy + (o.y - camY) * k, o.a, o.flip);
      g.globalAlpha = fade(dz) * ease((tipZ - o.z) / 2); g.fillStyle = inkFor(o.z);
      sh.forEach(function (p) { g.fill(p); });
    });
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalAlpha = 1;
  }

  function today() {
    var dz = todayZ - camZ, R = ease((tipZ - todayZ) / 10); if (dz < NEAR || dz > FAR || R <= 0) return;
    var s = F / dz; place(s, cx + (gate.x - camX) * s, cy + (gate.y - camY) * s);
    g.globalAlpha = fade(dz); g.fillStyle = dark ? PALE : BLUE;
    gate.edge.forEach(function (o, n) { var k = Math.floor(o.n * ease(R * 1.2 - n * 0.2)); if (k >= 1) g.fill(outline(o, k)); });
    if (R > 0.6) { g.globalAlpha = fade(dz) * ease((R - 0.6) / 0.3); g.font = 'italic 15px Petrona, Georgia, serif'; g.fillText('today', -132, -6); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalAlpha = 1;
  }
  function flood(dz) { return ease((8.5 - dz) / 5); } // after the hackathon has passed the camera
  function wash(dz) { // the accent: outline first, then the flood from the tip down
    var p1 = ease((tipZ - washZ) / 4), p2 = flood(dz); if (p1 <= 0 || dz < NEAR) return;
    var s = F / dz; place(s, cx + (accent.x - camX) * s, cy + (accent.y - camY) * s);
    g.fillStyle = NIGHT; g.globalAlpha = 1;
    accent.edge.forEach(function (o, n) { var k = Math.floor(o.n * ease(p1 * 1.15 - n * 0.15)); if (k >= 1) g.fill(outline(o, k)); });
    if (p2 > 0) { // the flood's front is wet ink, not a ruled edge
      var front = -350 + 660 * p2, x;
      g.save(); g.beginPath(); g.moveTo(-470, -360);
      for (x = -470; x <= 470; x += 20) g.lineTo(x, front + (12 * Math.sin(x * 0.031 + 1.3) + 7 * Math.sin(x * 0.083 + 0.4) + 4 * Math.sin(x * 0.19)) * Math.sin(Math.PI * p2));
      g.lineTo(470, -360); g.closePath(); g.clip(); g.fill(accent.fill); g.restore();
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function nightText(dz) { // a section's text turns over once the ink behind its middle has flooded
    var p2 = flood(dz), s = F / dz;
    stations.forEach(function (st) {
      var on = dark;
      if (!on && p2 > 0 && st.z > todayZ) {
        var r = st.text.getBoundingClientRect(), x = (r.left + r.right) / 2, y = clamp((r.top + r.bottom) / 2, Math.max(r.top, 60), Math.min(r.bottom, Ht - 60));
        if (r.bottom > 0 && r.top < Ht) {
          var ux = (x - cx) * cr + (y - cy) * sr, uy = -(x - cx) * sr + (y - cy) * cr, lx = ux / s + camX - accent.x, ly = uy / s + camY - accent.y;
          g.setTransform(1, 0, 0, 1, 0, 0);
          on = ly < -350 + 660 * p2 - 20 && g.isPointInPath(accent.fill, lx, ly);
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      }
      if (st.night !== on) { st.night = on; st.el.classList.toggle('night', on); }
    });
  }
  function playhead() { // while the recording plays, a blue ring rides the thread at the music's position
    if (window.state !== 'playing' || !window.active) return;
    var z = playZ, dz = z - camZ, p = threadAt(z); if (!p || dz < NEAR || dz > FAR || z > tipZ) return;
    var q = project(p[0], p[1], dz), r = clamp(3.2 * q[2], 4, 11);
    g.globalAlpha = fade(dz); g.strokeStyle = dark ? PALE : BLUE; g.lineWidth = clamp(0.9 * q[2], 1.4, 2.6);
    g.beginPath(); g.arc(q[0], q[1], r, 0, 6.2832); g.stroke(); g.globalAlpha = 1;
  }

  function render() {
    var dzW = washZ - camZ;
    dark = dzW < NEAR + 0.02;
    playZ = window.state === 'playing' && window.active ? window.active.a.currentTime * K : -Infinity;
    camX = pathX(camZ); camY = pathY(camZ); tipZ = Math.max(reach(camZ), Math.min(playZ, camZ + AHEAD)); // while it plays, the music draws the thread on
    var roll = clamp(-pathX(camZ, true) * 0.006, -0.13, 0.13); cr = Math.cos(roll); sr = Math.sin(roll); // bank into the turns
    nightText(dzW);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalAlpha = 1;
    g.fillStyle = dark ? NIGHT : PAPER; g.fillRect(0, 0, Wd, Ht);
    // far to near: each drawing, the gate and the accent, with the thread drawn in the stretches between them
    var ev = [];
    scenes.forEach(function (sc) { var dz = sc.z - camZ; if (dz > -3.5 && dz < FAR + 3) ev.push({ z: sc.z, f: function () { scene(sc); } }); });
    ev.push({ z: todayZ, f: today });
    if (!dark) ev.push({ z: washZ, f: function () { wash(dzW); } });
    ev.sort(function (a, b) { return b.z - a.z; });
    var hi = Infinity;
    ev.forEach(function (e) { thread(e.z, hi); e.f(); hi = e.z; });
    thread(-Infinity, hi);
    playhead();
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
  gate.x = pathX(todayZ); gate.y = pathY(todayZ) + 10;
  accent.x = pathX(washZ); accent.y = pathY(washZ);
  strings();
  layout(); camZ = target = aim();
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', function () { layout(); kick(); });
  if (window.ResizeObserver) new ResizeObserver(function () { layout(); kick(); }).observe(journey);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); kick(); });
  kick();
})();
