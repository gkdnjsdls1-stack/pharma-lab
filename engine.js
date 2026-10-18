// 방탈출 공통 엔진 — 3D·고르기·대사·창·저장.
// 방에만 해당하는 것(화학·사물·퍼즐·대사 내용)은 room-*.js가 들고 있다.
// 방 모듈은 window.ROOM에 다음을 담아 둔다:
//   id title chem next name situation state() build(K) paint3d(stage)
//   VIEW HINTS stuckAt() nextHint() INTRO STAGE_LINES drop(target,reagent) act(id)
(function(){
const R = window.ROOM;
const C = R.chem;
const $ = id => document.getElementById(id);
window.$ = $;
const SAVE = 'pharma-lab.cleared';
const MUTE = 'pharma-lab.muted';

// 방마다 빛깔을 다르게 준다. 여덟 방이 같은 회색이면 한 방을 여덟 번 하는 것이다.
// 방 파일은 이걸 몰라도 된다 — 엔진이 id로만 고른다.
const PALETTE = {
  aspirin:   {key:0xbfe4ee, rim:0x3a6a7a, bg:0x070a0d, wall:0x0b1017, floor:0x0e141b},
  ors:       {key:0xcfe8d8, rim:0x2f6a5a, bg:0x060b0a, wall:0x0a1412, floor:0x0d1a16},
  quinine:   {key:0xe8dcb8, rim:0x6a5a34, bg:0x0b0a07, wall:0x14110b, floor:0x1a160e},
  penicillin:{key:0xd4e4bc, rim:0x4a6a38, bg:0x080b07, wall:0x0d130b, floor:0x111a0e},
  methanol:  {key:0xd0d8e8, rim:0x3a4a7a, bg:0x07080d, wall:0x0b0d17, floor:0x0e111b},
  blood:     {key:0xf0d4d4, rim:0x7a3a3a, bg:0x0d0708, wall:0x170b0d, floor:0x1b0e11},
  bleach:    {key:0xd8eef0, rim:0x3a7a78, bg:0x070c0d, wall:0x0b1517, floor:0x0e1b1d},
  ether:     {key:0xc8ccE4, rim:0x4a467a, bg:0x08080c, wall:0x0d0d15, floor:0x111119},
};
const P = PALETTE[R.id] || PALETTE.aspirin;

// --- 소리 — 음원 파일 없이 코드로 낸다. 그래서 받을 것이 늘지 않는다 ----------
let actx = null, muted = false;
try { muted = localStorage.getItem(MUTE) === '1'; } catch (_) {}
function tone(f, t0, dur, type, vol){
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(actx.destination);
  o.start(t0); o.stop(t0 + dur + 0.03);
}
const SFX = {
  tap:  a => tone(520, a, .05, 'triangle', .04),
  open: a => tone(300, a, .09, 'sine', .05),
  drop: a => { tone(190, a, .08, 'triangle', .06); tone(380, a + .05, .07, 'sine', .035); },
  warn: a => tone(240, a, .16, 'square', .03),
  win:  a => { tone(392, a, .2, 'sine', .07); tone(523, a + .13, .26, 'sine', .07);
               tone(659, a + .28, .5, 'sine', .06); },
  lose: a => { tone(200, a, .4, 'sine', .07); tone(140, a + .2, .8, 'sine', .06); },
};
// 브라우저는 사용자가 건드리기 전에는 소리를 안 내준다. 그래서 늦게 만들고, 실패해도 조용히 넘긴다.
function sfx(n){
  if (muted || !SFX[n]) return;
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    SFX[n](actx.currentTime);
  } catch (_) {}
}
function toggleMute(){
  muted = !muted;
  try { localStorage.setItem(MUTE, muted ? '1' : '0'); } catch (_) {}
  $('mute').textContent = muted ? '소리 꺼짐' : '소리 켜짐';
  $('mute').setAttribute('aria-pressed', String(!muted));
  if (!muted) sfx('tap');
}

// 넘어갈 때 툭 끊지 않는다 — 화면이 한 번 어두워졌다 들어온다
function leave(href){
  document.body.classList.add('leaving');
  setTimeout(() => { location.href = href; }, 280);
}

// 깬 방 목록만 저장한다. 방 안의 진행은 저장하지 않는다 — 한 방은 앞에 끝내는 게 맞다.
const cleared = () => { try { return JSON.parse(localStorage.getItem(SAVE)) || []; }
                        catch (_) { return []; } };
const markCleared = id => { try {
  const c = cleared(); if (!c.includes(id)) localStorage.setItem(SAVE, JSON.stringify(c.concat(id)));
} catch (_) {} };

// 카드 누르면 곧바로 방이던 것을, 제목 한 장 보여주고 들어가게 했다
function titleCard(then){
  const t = $('titlecard');
  let done = false;
  t.innerHTML = `<div class="tcard"><div class="tkicker">pharma-lab</div>
    <h2>${R.title}</h2><div class="tsit">${R.situation}</div>
    <div class="ttech">${R.name}</div></div>`;
  t.classList.remove('off');
  t.hidden = false;
  const go = () => {
    if (done) return;
    done = true;
    t.classList.add('off');
    setTimeout(() => { t.hidden = true; then(); }, 420);
  };
  t.onclick = go;
  setTimeout(go, 2400);
}

let S;
window.S = null;
function init(replay){
  S = Object.assign({
    spent:0, over:false, sel:null, msg:'', open:false,
    hintsLeft:3, hintTier:{}, hintShown:[], shownStage:0,
  }, R.state());
  window.S = S;
  $('end').hidden = true;
  $('vn').hidden = true;
  vnQ = [];
  draw();
  if (!replay) titleCard(() => say(R.INTRO));
}

const stage = () => Math.min(3, C.stageOf(S.spent));
window.stage = stage;
function spend(sec){
  S.spent += sec;
  if (S.spent >= C.BUDGET) finish(false, R.DEATH || '늦었다.', R.DEATH_WHY || '');
}
window.spend = sec => spend(sec);

// --- 3D ------------------------------------------------------------------
let scene, cam, renderer, ray, PICK = [], hovered = null;
const camState = {az:0, el:0.32, r:19.5, t:new THREE.Vector3(0.5, 4.2, -9)};

const M   = c => new THREE.MeshLambertMaterial({color:c});
const box = (w,h,d,c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), M(c));
  m.castShadow = m.receiveShadow = true; return m; };
const cyl = (a,b,h,c,s=18) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,s), M(c));
  m.castShadow = m.receiveShadow = true; return m; };
const at  = (m,x,y,z) => { m.position.set(x,y,z); return m; };
// 유리병 — 안에 든 것이 보여야 정색 결과가 읽힌다
const glass = (r,h,c) => new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,18),
  new THREE.MeshLambertMaterial({color:c, transparent:true, opacity:.16, depthWrite:false}));
const grp = (...k) => { const g = new THREE.Group(); k.forEach(x => g.add(x)); return g; };

// 작은 물체는 화면에서 20 px도 안 된다 — 보이지 않는 집기 상자를 씌운다
const MIN_HIT = 1.5;
function reg(g, o, extra){
  g.userData = Object.assign({o}, extra || {});
  scene.add(g);
  const b = new THREE.Box3().setFromObject(g);
  const size = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(size.x, MIN_HIT), Math.max(size.y, MIN_HIT),
                          Math.max(size.z, MIN_HIT)),
    new THREE.MeshBasicMaterial({visible:false}));
  hit.position.copy(c);
  hit.castShadow = hit.receiveShadow = false;
  g.add(hit);
  PICK.push(g);
  return g;
}

function shell(){
  scene.add(at(box(34, .6, 26, P.floor), 0, -.3, -3));
  scene.add(at(box(34, 14, .6, P.wall), 0, 7, -14.3));
  scene.add(at(box(.6, 14, 26, P.bg), -17, 7, -3));
  scene.add(at(box(.6, 14, 26, P.bg),  17, 7, -3));
}
function lights(){
  scene.add(new THREE.AmbientLight(0x5a6b7a, .55));
  const key = new THREE.DirectionalLight(P.key, .95);
  key.position.set(10, 20, 12); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  const c = key.shadow.camera;
  c.left = -26; c.right = 26; c.top = 26; c.bottom = -26; c.far = 70;
  scene.add(key);
  const rim = new THREE.DirectionalLight(P.rim, .45);
  rim.position.set(-14, 8, -6); scene.add(rim);
}
function placeCam(){
  const {az, el, t} = camState;
  const r = camState.r * (camState.fit || 1);
  cam.position.set(t.x + r*Math.cos(el)*Math.sin(az),
                   t.y + r*Math.sin(el),
                   t.z + r*Math.cos(el)*Math.cos(az));
  cam.lookAt(t);
}
function resize(){
  const w = $('room').clientWidth, h = $('room').clientHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  cam.aspect = w / h; cam.updateProjectionMatrix();
  // fov는 세로 기준이라 좁은 화면에서는 방 좌우가 잘린다. 그만큼 물러선다.
  camState.fit = Math.min(1.9, Math.max(1, 1.45 / cam.aspect));
  placeCam();
}
function three(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(P.bg);
  scene.fog = new THREE.Fog(P.bg, 26, 58);
  cam = new THREE.PerspectiveCamera(42, 1, .1, 220);
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  $('room').appendChild(renderer.domElement);
  ray = new THREE.Raycaster();
  lights(); shell();
  R.build({reg, box, cyl, glass, at, grp, scene});
  placeCam(); resize();
  window.addEventListener('resize', resize);
  bindPointer(renderer.domElement);
  renderer.setAnimationLoop(frame);
}
// 방에는 글자를 두지 않는다. 만질 수 있는 것은 가리키면 빛나는 걸로만 알린다.
function frame(t){
  if (R.tick) R.tick(t);
  renderer.render(scene, cam);
}

function rootAt(e){
  const r = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    -((e.clientY - r.top) / r.height) * 2 + 1), cam);
  const hits = ray.intersectObjects(PICK, true);
  if (!hits.length) return null;
  let o = hits[0].object;
  while (o && PICK.indexOf(o) === -1) o = o.parent;
  return o || null;
}
const emissive = (root, c) => root.traverse(m => {
  if (m.material && m.material.emissive) m.material.emissive.setHex(c); });
function paint(){
  for (const g of PICK)
    emissive(g, g === hovered ? 0x2b8a99
              : g.userData.o && g.userData.o === S.sel ? 0x10404a : 0x000000);
}

let drag = null, orbit = null, down = null, moved = 0;
function bindPointer(cv){
  cv.addEventListener('pointerdown', e => {
    if (S.over || !$('vn').hidden) return;
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    down = rootAt(e); moved = 0;
    if (down && down.userData.grab){
      drag = down.userData.grab;
      $('ghost').textContent = (C.REAGENTS[drag] || {}).name || drag;
      $('ghost').hidden = false; moveGhost(e);
    } else {
      orbit = {x:e.clientX, y:e.clientY, az:camState.az, el:camState.el};
    }
  });
  cv.addEventListener('pointermove', e => {
    if (drag){ moveGhost(e); setHover(rootAt(e)); return; }
    if (orbit){
      moved = Math.max(moved, Math.abs(e.clientX-orbit.x) + Math.abs(e.clientY-orbit.y));
      camState.az = Math.max(-.7, Math.min(.7, orbit.az - (e.clientX - orbit.x) * .005));
      camState.el = Math.max(.12, Math.min(.85, orbit.el + (e.clientY - orbit.y) * .004));
      placeCam(); return;
    }
    if (S.over || !$('vn').hidden) return;
    setHover(rootAt(e));
  });
  cv.addEventListener('pointerup', e => {
    const hit = rootAt(e);
    if (drag){
      $('ghost').hidden = true;
      const r = drag; drag = null;
      if (hit && hit.userData.drop) { sfx('drop'); R.drop(hit.userData.drop, r); }
      draw();
    } else if (orbit && moved < 6 && down && down.userData.o){
      S.sel = down.userData.o; S.msg = ''; S.open = true;
      sfx('open');
      if (R.onSelect) R.onSelect(down.userData);
      draw();
    }
    orbit = null; down = null;
  });
  cv.addEventListener('pointerleave', () => setHover(null));
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    camState.r = Math.max(12, Math.min(30, camState.r + Math.sign(e.deltaY) * 1.2));
    placeCam();
  }, {passive:false});
}
const moveGhost = e => { $('ghost').style.left = e.clientX+'px'; $('ghost').style.top = (e.clientY-26)+'px'; };
function setHover(root){
  if (root === hovered) return;
  hovered = root;
  renderer.domElement.style.cursor = root ? 'pointer' : 'grab';
  paint();
}

// --- 대사 -----------------------------------------------------------------
let vnQ = [];
function say(lines){ vnQ = vnQ.concat(lines); vnShow(); }
window.say = say;
function vnShow(){
  if (!vnQ.length){ $('vn').hidden = true; return; }
  const l = vnQ[0];
  $('vn').hidden = false;
  $('vnname').textContent = l.who || '';
  $('vnline').textContent = l.t;
  if (l.pic !== undefined) portrait(l.pic);
}
function vnNext(){ if (!vnQ.length) return; sfx('tap'); vnQ.shift(); vnShow(); if (!vnQ.length) draw(); }
// 그림은 쓰는 사람이 넣는다. 없으면 실루엣으로 떨어진다.
function portrait(n){
  const img = $('vnpic'), file = `portraits/${R.id}-${n}.jpg`;
  img.onload  = () => { img.hidden = false; $('vnfall').hidden = true; };
  img.onerror = () => { img.hidden = true;  $('vnfall').hidden = false; };
  img.src = file;
}
$('vn').addEventListener('click', vnNext);
$('sheet').addEventListener('pointerdown', e => {
  if (e.target === $('sheet')) { S.open = false; S.msg = ''; draw(); }
});
window.addEventListener('keydown', e => {
  if (!$('vn').hidden){
    if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); vnNext(); }
    return;
  }
  if (e.key === 'Escape' && S && S.open){ S.open = false; S.msg = ''; draw(); }
});

// --- 버튼: 공통 두 가지만 엔진이 맡고 나머지는 방이 맡는다 -------------------
function act(id){
  sfx(id === 'sheetclose' ? 'open' : 'tap');
  if (id === 'sheetclose'){ S.open = false; S.msg = ''; draw(); return; }
  if (id === 'hint'){
    const k = R.stuckAt();
    S.hintShown.push(R.nextHint());
    S.hintTier[k] = (S.hintTier[k] || 0) + 1;
    S.hintsLeft--;
    spend(C.COST.hint);
    draw(); return;
  }
  R.act(id);
}

function finish(win, text, why){
  S.over = true;
  sfx(win ? 'win' : 'lose');
  if (win) markCleared(R.id);
  const nextOpen = win && R.next;
  const e = $('end');
  e.hidden = false;
  e.innerHTML = `<div class="panel"><h2>${win ? '살렸다' : '놓쳤다'}</h2>
    <div class="big ${win?'ok':'bad'}" style="margin:12px 0">${win ? R.WIN_WORD || '끝' : '여기까지'}</div>
    <div class="doc">${text}</div>
    ${why ? `<div class="note bad">${why}</div>` : ''}
    ${win && R.WIN_NOTE ? `<div class="note">${R.WIN_NOTE}<br>호출 ${3 - S.hintsLeft}회 사용.</div>` : ''}
    ${nextOpen ? `<div class="doc ok">다음 방이 열렸다.</div>` : ''}
    <div class="row" style="justify-content:center;margin-top:14px">
      <button class="go" id="again">다시</button>
      <button id="endhub">방 고르기</button></div></div>`;
  e.querySelector('#again').onclick = () => { sfx('tap'); init(true); };
  e.querySelector('#endhub').onclick = () => leave('index.html');
}
window.finish = finish;

// --- 그리기 --------------------------------------------------------------
function draw(){
  const st = stage();
  if (st > S.shownStage && !S.over){
    S.shownStage = st;
    if (R.STAGE_LINES[st]) say(R.STAGE_LINES[st]);
  }
  const v = $('vital');
  v.textContent = C.STAGES[st];
  v.className = ['', 'warn', 'warn', 'bad'][st];
  R.paint3d(st);
  paint();

  const open = S.open && !S.over && S.sel;
  $('sheet').hidden = !open;
  if (open){
    const d = $('sheetbox');
    d.innerHTML = '<button id="sheetclose" aria-label="닫기">✕</button>'
      + R.VIEW[S.sel]() + (S.msg ? `<div class="row warn">${S.msg}</div>` : '');
    d.querySelectorAll('button').forEach(b => b.onclick = () => act(b.id));
    d.querySelectorAll('input').forEach(i => i.onkeydown = ev => {
      if (ev.key === 'Enter') { const b = d.querySelector('button.go'); if (b) b.click(); }
    });
  }
  const toast = $('toast');
  toast.hidden = open || !S.msg;
  if (!toast.hidden) toast.textContent = S.msg;
  $('hint3d').style.opacity = toast.hidden ? '' : '0';
}
window.draw = draw;

document.title = `${R.title} — pharma-lab`;
$('roomname').textContent = R.title;
$('mute').textContent = muted ? '소리 꺼짐' : '소리 켜짐';
$('mute').setAttribute('aria-pressed', String(!muted));
$('mute').onclick = toggleMute;
$('tohub').addEventListener('click', e => { e.preventDefault(); leave('index.html'); });
three();
init();
})();
