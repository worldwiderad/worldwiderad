// The ink world behind the homepage's projects: a camera flies down a corridor drawn from 4part,
// past one pen-and-ink scene per project, and the scroll position decides where in the piece you are.
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

  var LEN = window.LEN || 593.32, K = 0.25, D = 4.5, FAR = 26, NEAR = 0.32, WX = 150;
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

  // ---- scenes: one per section, placed along the piece
  var stations = [].slice.call(document.querySelectorAll('.journey .station')), scenes = [], todayZ = 421.5 * K, washZ = Infinity, lastT = 0;
  stations.forEach(function (el) {
    var t = el.dataset.f === '' ? lastT + 24 : +el.dataset.f * LEN; lastT = t;
    var st = { el: el, id: el.id, z: t * K };
    if (el.id === 'today') todayZ = st.z;
    var raw = W.scenes[el.id];
    if (raw) st.scene = { id: el.id, z: st.z, x: 0, y: -6, layers: raw.map(function (l) { return { dz: l.dz, x: l.x, y: l.y, s: l.s, raw: l.i, items: null }; }), total: 0 };
    if (st.scene) scenes.push(st.scene);
    if (el.id === 'coda') washZ = st.z - 6;
    st.anchor = 0; st.text = el.querySelector('div') || el; stations[stations.indexOf(el)] = st;
  });
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

  // ---- the corridor's notes: the horns on the right wall, the strings on the left
  function noteList(arr, side) { var out = []; for (var i = 0; i < arr.length; i += 2) out.push({ z: arr[i] / 10 * K, step: arr[i + 1], x: side * WX }); return out; }
  var notes = noteList(W.notes.R, 1).concat(noteList(W.notes.L, -1)).sort(function (a, b) { return a.z - b.z; });
  var head = (function () { var p = new Path2D(), r = rng(9); for (var i = 0; i <= 18; i++) { var a = i / 18 * 6.2832, k = 1 + (r() - 0.5) * 0.08, x = Math.cos(a) * 3.4 * k, y = Math.sin(a) * 2.35 * k, c = Math.cos(-0.38), s = Math.sin(-0.38); if (i) p.lineTo(x * c - y * s, x * s + y * c); else p.moveTo(x * c - y * s, x * s + y * c); } p.closePath(); return p; })();
  // before the finale: a marcato accent, a wedge of ink the camera flies into. Its outline is inked first,
  // then it floods from the tip down, and once the camera is inside, the page is dark.
  var accent = (function () {
    var C = [[0, -330], [430, 250], [292, 250], [0, 62], [-292, 250], [-430, 250]], r = rng(5), edge = [], i, j;
    function ring(k, dy) { var out = []; for (i = 0; i < C.length; i++) { var a = C[i], b = C[(i + 1) % C.length]; for (j = 0; j < 14; j++) { var u = j / 14; out.push([(a[0] + (b[0] - a[0]) * u) * k, (a[1] + (b[1] - a[1]) * u) * k + dy]); } } out.push(out[0].slice()); return out; }
    var body = ring(1, 0), fillP = new Path2D();
    body.forEach(function (q, n) { var x = q[0] + (r() - 0.5) * 3, y = q[1] + (r() - 0.5) * 3; if (n) fillP.lineTo(x, y); else fillP.moveTo(x, y); });
    fillP.closePath();
    [[1.045, -6, 9], [1.1, -14, 5]].forEach(function (o, n) { var pts = ring(o[0], o[1]); edge.push(brush(pts, o[2], 77 + n)); });
    return { fill: fillP, edge: edge };
  })();
  var STAFF = [0, 9, 18, 27, 36].map(function (v) { return v - 24; });

  // ---- layout and camera
  var dpr = 1, Wd = 0, Ht = 0, cx = 0, cy = 0, F = 1, camZ = 0, camX = 0, camY = 0, target = 0, press = 0, raf = 0, last = 0, buf = null, dark = false;
  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); Wd = root.clientWidth; Ht = window.innerHeight;
    var jl = journey.getBoundingClientRect().left;
    stage.style.marginLeft = -jl + 'px'; stage.style.width = Wd + 'px';
    cv.width = Math.round(Wd * dpr); cv.height = Math.round(Ht * dpr);
    var text = document.querySelector('.journey .station > div'), right = Wd > 1200 && text ? text.getBoundingClientRect().right + 24 : 0;
    cx = right ? (right + Wd) / 2 : Wd / 2; cy = Ht * 0.5;
    var px = right ? Math.min((Wd - right) * 0.8, Wd * 0.42) : Math.min(Wd * 0.88, Ht * 0.62 * 1.33);
    F = D * px / 240;
    var top = journey.getBoundingClientRect().top + scrollY;
    // beside the text, a scene is at viewing distance while you read its section; where the text spans the page,
    // it is there in the gap above the section, and flies past behind the text as you read on
    var lead = right ? 0.24 : 0.8; // 0.25 is where the page header switches to the next section
    stations.forEach(function (st) { st.anchor = (st.el.firstElementChild || st.el).getBoundingClientRect().top + scrollY - Ht * lead; });
    stations.start = top - Ht * 0.65;
  }
  function aim() { // the camera follows the page: each section's anchor puts its scene at viewing distance
    var y = scrollY, prevY = stations.start, prevZ = 0;
    for (var i = 0; i < stations.length; i++) {
      var st = stations[i], z = st.z - D;
      if (y < st.anchor) return prevZ + (z - prevZ) * clamp((y - prevY) / Math.max(1, st.anchor - prevY), 0, 1);
      prevY = st.anchor; prevZ = z;
    }
    return prevZ;
  }
  function fade(dz) { return clamp((FAR - dz) / (FAR * 0.38), 0, 1) * clamp((dz - NEAR) / 0.75, 0, 1); }
  function nearFade(dz) { return ease((dz - 0.7) / 2.6); } // the corridor thins away as it passes the camera
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a.toFixed(3) + ')'; }
  function inkFor(z) { var future = z > todayZ + 0.01; return dark ? (future ? PALE : LIGHT) : (future ? BLUE : INK); }
  function project(X, Y, dz) { var s = F / dz; return [cx + (X - camX) * s, cy + (Y - camY) * s, s]; }

  function band(x, y0, y1, z0, z1, w, color) { // a pen line running into the distance along the wall
    var pts = [], n = 30, i, j;
    for (i = 0; i <= n; i++) {
      var u = i / n, z = z0 + (z1 - z0) * u * u, dz = z - camZ; if (dz < 0.7) continue;
      var y = y0 + (y1 - y0) * u + Math.sin(z * 1.7 + x * 0.3 + y0) * 0.3, p = project(x, y, dz);
      var hw = clamp(w * p[2] * 0.16, 0.42, 1.2) * (1 + 0.22 * Math.sin(z * 2.3 + y0 * 0.7)) * (0.35 + 0.65 * clamp((FAR - dz) / (FAR * 0.5), 0, 1));
      pts.push([p[0], p[1], hw, nearFade(dz)]);
    }
    if (pts.length < 2) return;
    // in short runs, so the near end can fade while the rest stays full strength
    for (i = 0; i < pts.length - 1; i += 3) {
      var k = Math.min(pts.length - 1, i + 3), a = (pts[i][3] + pts[k][3]) / 2; if (a < 0.01) continue;
      var path = new Path2D();
      for (j = i; j <= k; j++) path[j > i ? 'lineTo' : 'moveTo'](pts[j][0], pts[j][1] - pts[j][2]);
      for (j = k; j >= i; j--) path.lineTo(pts[j][0], pts[j][1] + pts[j][2]);
      path.closePath(); g.globalAlpha = a; g.fillStyle = color; g.fill(path);
    }
    g.globalAlpha = 1;
  }
  function post(x, z, y0, y1, w, color, alpha, wmax) { // an upright stroke on the wall: a barline, the gate, the playhead
    var dz = z - camZ; if (dz < NEAR || dz > FAR) return;
    var a = project(x, y0, dz), b = project(x, y1, dz), hw = clamp(w * a[2] * 0.2, 0.4, wmax || 1.1);
    g.globalAlpha = alpha * fade(dz) * nearFade(dz); g.fillStyle = color;
    g.beginPath(); g.moveTo(a[0] - hw, a[1]); g.lineTo(a[0] + hw * 0.7, a[1]); g.lineTo(b[0] + hw, b[1]); g.lineTo(b[0] - hw * 0.8, b[1]); g.closePath(); g.fill();
  }

  function corridor() {
    var z0 = camZ + NEAR, z1 = camZ + FAR;
    [-1, 1].forEach(function (side) {
      STAFF.forEach(function (Y) {
        if (todayZ > z0 && todayZ < z1) { band(side * WX, Y, Y, z0, todayZ, 1.1, inkFor(z0)); band(side * WX, Y, Y, todayZ, z1, 1.1, inkFor(z1)); }
        else band(side * WX, Y, Y, z0, z1, 1.1, inkFor(z0));
      });
      for (var z = Math.ceil(z0 / 2) * 2; z < z1; z += 2) post(side * WX, z, STAFF[0], STAFF[4], 0.8, inkFor(z), 0.7);
    });
    stations.forEach(function (st) { [-1, 1].forEach(function (side) { post(side * WX, st.z, STAFF[0], STAFF[4], 0.8, inkFor(st.z), 1); post(side * WX + side * 2.6, st.z, STAFF[0], STAFF[4], 2.2, inkFor(st.z), 1, 2.2); }); });
    // notes
    for (var i = 0; i < notes.length; i++) {
      var nt = notes[i], dz = nt.z - camZ; if (dz < NEAR) continue; if (dz > FAR) break;
      var Y = STAFF[0] + nt.step * 4.5, p = project(nt.x, Y, dz), s = p[2], col = inkFor(nt.z), na = fade(dz) * ease((dz - 1.6) / 3.2);
      if (na < 0.01) continue;
      g.globalAlpha = na; g.fillStyle = col;
      g.setTransform(dpr * s, 0, 0, dpr * s, dpr * p[0], dpr * p[1]); g.fill(head);
      var up = nt.step >= 4, sx = up ? 3.1 : -3.1;
      g.fillRect(sx - 0.4, up ? -26 : 0.6, 0.8, 25.4);
      for (var k = -2; k >= nt.step; k -= 2) g.fillRect(-6, (k - nt.step) * 4.5 - 0.4, 12, 0.8); // ledger lines above the staff
      for (k = 10; k <= nt.step; k += 2) g.fillRect(-6, (k - nt.step) * 4.5 - 0.4, 12, 0.8); // and below
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    g.globalAlpha = 1;
    // today: a blue gate across the corridor; past it, everything is drawn in blue
    [-1, 1].forEach(function (side) { post(side * WX, todayZ, STAFF[0] - 46, STAFF[4] + 22, 2.6, dark ? PALE : BLUE, 1, 2.6); });
    var dzT = todayZ - camZ;
    if (dzT > NEAR && dzT < FAR) { var q = project(-WX + 6, STAFF[0] - 40, dzT); g.globalAlpha = fade(dzT); g.fillStyle = dark ? PALE : BLUE; g.font = 'italic ' + Math.max(9, Math.min(64, 7 * q[2])).toFixed(1) + 'px Petrona, Georgia, serif'; g.fillText('today', q[0], q[1]); g.globalAlpha = 1; }
    // while the recording plays, its playhead travels the corridor
    if (window.state === 'playing' && window.active) { var zp = window.active.a.currentTime * K; [-1, 1].forEach(function (side) { post(side * WX, zp, STAFF[0] - 16, STAFF[4] + 16, 2.4, dark ? PALE : BLUE, 1, 2.6); }); }
  }

  function scene(sc) {
    var R = ease((camZ - (sc.z - 15)) / 10.5); if (R <= 0) return;
    prep(sc);
    var reveal = R * sc.total, col = inkFor(sc.z), dz0 = sc.z - camZ;
    function place(dz, Ly) { var s = F / dz * Ly.s, X0 = sc.x + Ly.x, Y0 = sc.y + Ly.y; g.setTransform(dpr * s, 0, 0, dpr * s, dpr * (cx + (X0 - camX) * F / dz - 120 * s), dpr * (cy + (Y0 - camY) * F / dz - 90 * s)); }
    if (dz0 > NEAR && dz0 < FAR) { // the plate sits a little behind the whole drawing, so its back layers stay in front of it
      var back = Math.max.apply(null, sc.layers.map(function (Ly) { return Ly.dz; })) + 0.3, dzp = dz0 + back;
      place(dzp, { s: dzp / dz0, x: 0, y: 0 }); g.globalAlpha = fade(dz0) * ease(R * 2.5); g.fillStyle = plate(); g.fillRect(-60, -40, 360, 260);
    }
    sc.order.forEach(function (Ly) {
      var dz = sc.z + Ly.dz - camZ; if (dz < NEAR || dz > FAR) return;
      place(dz, Ly);
      var base = fade(dz);
      g.lineJoin = 'round'; g.lineWidth = press * 0.55 / Ly.s; g.strokeStyle = col;
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

  var plates = {};
  function plate() { // soft-edged paper, in local scene units (the box is 240 x 180)
    var key = dark ? 'n' : 'p';
    if (!plates[key]) {
      var c = dark ? NIGHT : PAPER, gr = g.createRadialGradient(120, 92, 0, 120, 92, 150);
      gr.addColorStop(0, rgba(c, 1)); gr.addColorStop(0.62, rgba(c, 0.97)); gr.addColorStop(0.85, rgba(c, 0.5)); gr.addColorStop(1, rgba(c, 0));
      plates[key] = gr;
    }
    return plates[key];
  }
  function render() {
    var dzW = washZ - camZ;
    dark = dzW < NEAR + 0.02;
    nightText(dzW);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalAlpha = 1;
    g.fillStyle = dark ? NIGHT : PAPER; g.fillRect(0, 0, Wd, Ht);
    camX = 7 * Math.sin(camZ * 0.09); camY = 3.5 * Math.sin(camZ * 0.13 + 1);
    corridor();
    // scenes far to near, and the ink wash before the finale
    var list = scenes.filter(function (sc) { var dz = sc.z - camZ; return dz > -3 && dz < FAR + 3; }).sort(function (a, b) { return b.z - a.z; });
    var washDrawn = false;
    list.forEach(function (sc) {
      if (!washDrawn && !dark && sc.z < washZ) { wash(dzW); washDrawn = true; }
      scene(sc); // a scene beyond the accent is hidden behind the ink until the camera is through it
    });
    if (!washDrawn && !dark) wash(dzW);
  }
  function flood(dz) { return ease((8.5 - dz) / 5); } // after the hackathon has passed the camera
  function nightText(dz) { // a section's text turns over once the ink behind its middle has flooded
    var p2 = flood(dz), s = F / dz;
    stations.forEach(function (st) {
      var on = dark;
      if (!on && p2 > 0 && st.z > todayZ) {
        var r = st.text.getBoundingClientRect(), x = (r.left + r.right) / 2, y = clamp((r.top + r.bottom) / 2, Math.max(r.top, 60), Math.min(r.bottom, Ht - 60));
        if (r.bottom > 0 && r.top < Ht) {
          var lx = (x - cx + camX * s) / s, ly = (y - cy + camY * s) / s;
          g.setTransform(1, 0, 0, 1, 0, 0);
          on = ly < -350 + 660 * p2 - 20 && g.isPointInPath(accent.fill, lx, ly);
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      }
      if (st.night !== on) { st.night = on; st.el.classList.toggle('night', on); }
    });
  }
  function wash(dz) { // the accent: outline first, then the flood from the tip down
    var p1 = ease((17 - dz) / 6), p2 = flood(dz); if (p1 <= 0 || dz < NEAR) return;
    var s = F / dz; g.setTransform(dpr * s, 0, 0, dpr * s, dpr * (cx - camX * s), dpr * (cy - camY * s));
    g.fillStyle = NIGHT;
    accent.edge.forEach(function (o, n) { var k = Math.floor(o.n * ease(p1 * 1.15 - n * 0.15)); if (k < 1) return; g.globalAlpha = 1; g.fill(outline(o, k)); });
    if (p2 > 0) { // the flood's front is wet ink, not a ruled edge
      var front = -350 + 660 * p2, x;
      g.save(); g.beginPath(); g.moveTo(-470, -360);
      for (x = -470; x <= 470; x += 20) g.lineTo(x, front + (12 * Math.sin(x * 0.031 + 1.3) + 7 * Math.sin(x * 0.083 + 0.4) + 4 * Math.sin(x * 0.19)) * Math.sin(Math.PI * p2));
      g.lineTo(470, -360); g.closePath(); g.clip(); g.fill(accent.fill); g.restore();
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalAlpha = 1;
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
  layout(); camZ = target = aim();
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', function () { layout(); kick(); });
  if (window.ResizeObserver) new ResizeObserver(function () { layout(); kick(); }).observe(journey);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); kick(); });
  kick();
})();
