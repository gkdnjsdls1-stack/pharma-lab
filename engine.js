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

// 깬 방 목록만 저장한다. 방 안의 진행은 저장하지 않는다 — 한 방은 앞에 끝내는 게 맞다.
const cleared = () => { try { return JSON.parse(localStorage.getItem(SAVE)) || []; }
                        catch (_) { return []; } };
const markCleared = id => { try {
  const c = cleared(); if (!c.includes(id)) localStorage.setItem(SAVE, JSON.stringify(c.concat(id)));
} catch (_) {} };

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
  if (!replay) say(R.INTRO);
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
  scene.add(at(box(34, .6, 26, 0x0e141b), 0, -.3, -3));
  scene.add(at(box(34, 14, .6, 0x0b1017), 0, 7, -14.3));
  scene.add(at(box(.6, 14, 26, 0x0a0f15), -17, 7, -3));
  scene.add(at(box(.6, 14, 26, 0x0a0f15),  17, 7, -3));
}
function lights(){
  scene.add(new THREE.AmbientLight(0x5a6b7a, .55));
  const key = new THREE.DirectionalLight(0xbfe4ee, .95);
  key.position.set(10, 20, 12); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  const c = key.shadow.camera;
  c.left = -26; c.right = 26; c.top = 26; c.bottom = -26; c.far = 70;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3a6a7a, .45);
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
  scene.background = new THREE.Color(0x070a0d);
  scene.fog = new THREE.Fog(0x070a0d, 26, 58);
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
      if (hit && hit.userData.drop) R.drop(hit.userData.drop, r);
      draw();
    } else if (orbit && moved < 6 && down && down.userData.o){
      S.sel = down.userData.o; S.msg = ''; S.open = true;
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
function vnNext(){ if (!vnQ.length) return; vnQ.shift(); vnShow(); if (!vnQ.length) draw(); }
// 그림은 쓰는 사람이 넣는다. 없으면 실루엣으로 떨어진다.
function portrait(n){
  const img = $('vnpic'), file = `portraits/${R.id}-${n}.png`;
  img.onload  = () => { img.hidden = false; $('vnfall').hidden = true; };
  img.onerror = () => { img.hidden = true;  $('vnfall').hidden = false;
                        $('vnmiss').textContent = file; };
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
      <button id="tohub">방 고르기</button></div></div>`;
  e.querySelector('#again').onclick = () => init(true);
  e.querySelector('#tohub').onclick = () => { location.href = 'index.html'; };
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

document.title = R.title;
$('roomname').textContent = R.title;
three();
init();
})();
