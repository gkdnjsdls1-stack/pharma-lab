// 방 1 — 아스피린. 심근경색.
// 화학은 chem.js, 공통 엔진은 engine.js. 이 파일은 이 방에만 해당하는 것만 담는다.
(function(){
const C = window.CHEM;

// 3D 물체 — 엔진이 넘겨주는 도구로 짓는다
let crystalMesh, patientSkin = [], flameMesh;
const powderMesh = {};
const STAIN = {fecl3:0x7b3fa0, iodine:0x2340a8, benedict:0xcc5a22};
const FLAME_NA = 0xffc23d;

function build(K){
  const {reg, box, cyl, glass, at, grp, scene} = K;
  // 바닥과 벽
  const fl = box(34, .6, 26, 0x0e141b); at(fl, 0, -.3, -3); scene.add(fl);
  scene.add(at(box(34, 14, .6, 0x0b1017), 0, 7, -14.3));
  scene.add(at(box(.6, 14, 26, 0x0a0f15), -17, 7, -3));
  scene.add(at(box(.6, 14, 26, 0x0a0f15),  17, 7, -3));

  // 작업대
  const bench = grp(at(box(22, .5, 3.4, 0x1d2630), 1, 3.1, -11.6),
                    at(box(21, 2.9, 3.0, 0x141b23), 1, 1.6, -11.6));
  scene.add(bench);

  // ① 라벨 없는 흰 가루 병 넷 — 떨어뜨릴 자리
  Object.keys(C.BOTTLES).forEach((b, i) => {
    const x = -9.4 + i * 1.9;
    const jar  = at(glass(.44, 1.4, 0xd6eaf0), x, 4.05, -11.4);
    const pow  = at(cyl(.37,.37,.78, 0xe8eef4), x, 3.74, -11.4);
    const cap  = at(cyl(.2,.2,.22,   0x2a3b45), x, 4.72, -11.4);
    pow.userData.floor = 3.35;     // 가루가 줄어도 바닥은 그대로
    powderMesh[b] = pow;
    reg(grp(jar, pow, cap), 'bottles', {drop:b});
  });

  // 저울 · 눈금실린더
  reg(grp(at(box(1.9,.3,1.5, 0x1e2832), -1.3, 3.5, -11.5),
          at(box(1.5,.5,1.1, 0x0d1218), -1.3, 3.6, -11.9),
          at(box(.9,.05,.5,  0x0a1a1e), -1.3, 3.9, -11.3)), 'balance');
  reg(grp(at(cyl(.3,.34,1.9, 0x16202a), 1.1, 4.3, -11.5),
          at(cyl(.3,.3,.12,  0x9a8f6a), 1.1, 4.5, -11.5)), 'cylinder');

  // 물중탕과 플라스크 — 결정을 떨어뜨릴 자리
  const bathBody = at(box(3.2,1.1,2.4, 0x0f1820), 3.9, 3.9, -11.5);
  const water    = at(box(2.8,.12,2.0, 0x16323c), 3.9, 4.4, -11.5);
  const flask    = at(cyl(.12,1.0,1.6, 0x16242c), 3.9, 5.2, -11.5);
  crystalMesh    = at(cyl(.1,.74,.5,  0xe6ecf2), 3.9, 4.75, -11.5);
  crystalMesh.visible = false;
  reg(grp(bathBody, water, flask, crystalMesh), 'bath', {drop:'crystal'});

  // 융점측정기
  reg(grp(at(box(2.4,1.6,1.7, 0x0d1218), 7.8, 4.1, -11.5),
          at(box(1.2,.7,.08,  0x0a1a1e), 7.6, 4.5, -10.62),
          at(cyl(.07,.07,1.3, 0x20303a), 8.8, 4.9, -11.3)), 'mp');

  // 시약 선반 — 집어서 끌어온다
  scene.add(at(box(11,.26,1.5, 0x1a222c), 5.6, 6.6, -13.2));
  const RE = [['fecl3','염화철',0x6b4a7a,0x5a3a7a], ['iodine','요오드',0x4a5a7a,0x2a3a6a],
              ['benedict','베네딕트',0x3a6a7a,0x1a6a7a]];
  RE.forEach(([k, short, glassC, liq], i) => {
    const x = 1.6 + i * 2.6;
    reg(grp(at(glass(.3, 1.2, glassC), x, 7.35, -13.2),
            at(cyl(.26,.26,.6, liq),  x, 7.1,  -13.2),
            at(cyl(.12,.12,.3, 0x2a3b45), x, 8.1, -13.2)),
        null, {grab:k});
  });
  // 버너 — 불꽃 시험
  flameMesh = at(cyl(.001,.22,.8, 0xd8a634, 10), 9.4, 8.0, -13.2);
  reg(grp(at(cyl(.28,.36,1.0, 0x20282f), 9.4, 7.25, -13.2), flameMesh),
      null, {grab:'flame'});

  // 벽에 걸린 것들
  const wall = (x, y, w, h, c) => at(box(w, h, .18, c), x, y, -13.9);
  reg(grp(wall(-13, 8.4, 2.6, 1.8, 0x0d1218),
          at(box(1.3,.8,.06, 0x0a1a1e), -13.4, 8.6, -13.78),
          at(cyl(.12,.12,.08, 0x59c46a), -12.1, 8.9, -13.78))  , 'radio');
  reg(grp(wall(-13, 4.6, 2.6, 3.0, 0x0d1218),
          at(box(2.6,.08,.2, 0x2f3a47), -13, 4.6, -13.78)), 'cabinet');
  reg(grp(wall(-9.8, 7.6, 2.1, 2.8, 0x11161c),
          at(box(1.2,.38,.06, 0x3a2024), -9.8, 7.9, -13.78),
          at(box(.38,1.2,.06, 0x3a2024), -9.8, 7.9, -13.78)), 'poster');
  const nb = grp(wall(-6.9, 8.0, 2.0, 2.6, 0x161a14));
  nb.rotation.z = -0.05;
  reg(nb, 'notebook');
  reg(grp(wall(-3.9, 8.0, 2.4, 1.9, 0x101820),
          at(box(2.0,1.5,.06, 0x0b1419), -3.9, 8.0, -13.78)), 'photo');
  reg(grp(at(cyl(.95,.95,.22, 0x0d1218, 26), -0.9, 8.2, -13.85),
          at(box(.08,.7,.06, 0x56b6c2), -0.9, 8.5, -13.72)), 'timer');

  // 내려진 셔터
  const sh = grp(at(box(.3, 9, 7, 0x0c1116), 16.5, 5.2, -5));
  for (let i = 0; i < 8; i++) sh.add(at(box(.36,.1,6.8, 0x1b232c), 16.5, 1.4 + i*1.1, -5));
  reg(sh, 'shutter');

  // 동료 — 이 방의 시계
  const head = at(cyl(.5,.5,.46, 0xb98f6d, 20), -4.4, .56, -7.4); head.rotation.z = Math.PI/2;
  const body = at(box(2.6, .9, 1.35, 0xb98f6d), -2.7, .48, -7.4);
  const legs = at(box(2.4, .7, 1.05, 0x33302e), -.25, .38, -7.4);
  const arm  = at(box(1.2, .42, .42, 0xb98f6d), -3.1, 1.0, -6.85);
  patientSkin = [head.material, body.material, arm.material];
  reg(grp(head, body, legs, arm), 'patient');
}

function paint3d(st){
  for (const b of Object.keys(C.BOTTLES)){
    const pow = powderMesh[b];
    if (!pow) continue;
    const hit = Object.keys(STAIN).find(r =>
      S.tested[b+':'+r] && S.tested[b+':'+r] !== '아무 일도 일어나지 않는다');
    pow.material.color.setHex(hit ? STAIN[hit] : 0xe8eef4);
    const k = Math.max(.12, S.stock[b] / C.STOCK_G);
    pow.scale.y = k;
    pow.position.y = pow.userData.floor + .39 * k;
  }
  // 불꽃 시험은 가루가 아니라 불꽃이 물든다
  const naHit = Object.keys(C.BOTTLES).some(b =>
    S.tested[b+':flame'] && S.tested[b+':flame'] !== '아무 일도 일어나지 않는다');
  if (flameMesh) flameMesh.material.color.setHex(naHit ? FLAME_NA : 0xd8a634);
  patientSkin.forEach(m => m.color.setHex([0xb98f6d, 0xab8068, 0x95737f, 0x6f7784][st]));
  crystalMesh.visible = !!S.product;
}

const VIEW = {
patient(){
  const st = stage();
  return `<h2>동료</h2>
  <div class="doc">${C.STAGES[st]}</div>
  ${S.product ? `<div class="row"><label>먹일 양 <input id="mg" inputmode="numeric" value="300"> mg</label>
      <button class="go" id="dose">씹어 먹인다</button></div>
    <div class="note">가진 결정 <b class="mono">${(S.product.mass*1000).toFixed(0)} mg</b></div>`
   : `<div class="note bad">먹일 것이 없다.</div>`}`;
},
radio(){
  const h = nextHint();
  return `<h2>응급 통신기</h2>
  <div class="note">바깥 당직 약사. 남은 호출 <b>${S.hintsLeft}</b>회 — 묻는 동안 환자가 나빠진다.</div>
  ${S.hintShown.map(t => `<div class="doc">“${t}”</div>`).join('')}
  <div class="row">
    <button class="go" id="hint" ${S.hintsLeft && h ? '' : 'disabled'}>
      ${S.hintsLeft ? '묻는다' : '더는 못 묻는다'}</button></div>`;
},
cabinet(){
  return `<h2>상비약 캐비닛</h2>
  <div class="doc"><b>아스피린 칸만 비어 있다.</b> 유성펜으로 “재고 0”.</div>
  <table><tr><th>시약</th><td>무수초산 · 진한 황산 · 식초 · 에탄올</td></tr>
  <tr><th>가루</th><td class="dim">없음 — 작업대 위 병 넷이 전부</td></tr></table>`;
},
poster(){
  return `<h2>심근경색 응급처치</h2>
  <div class="doc"><b>증상</b>　가슴 압박감 · 식은땀 · <b>왼팔과 턱으로 뻗치는 통증</b></div>
  <div class="doc"><b>처치</b>　아스피린 <b class="big warn">${C.DOSE_MIN_MG}~${C.DOSE_MAX_MG} mg</b>　씹어서 복용</div>
  <div class="note">혈소판을 억제해 혈전이 커지는 것을 막는다.</div>`;
},
notebook(){
  const b = '<span class="blank">　　</span>';
  return `<h2>찢긴 실험 노트</h2>
  <div class="paper">아스피린 합성
  살리실산      ${b} g
  무수초산      ${b} mL
  진한 황산     다섯 방울
  ${b} °C 물중탕에서 ${b} 분
  찬물 ${C.QUENCH.coldWaterMl} mL에 붓고 얼음물 ${C.QUENCH.iceBathMin}분</div>
  <div class="note">여백에 급히 쓴 글씨 — <b>“먹일 것이다. 갓 나온 것을 그대로 쓰지 않는다.”</b></div>`;
},
photo(){
  return `<h2>벽 사진</h2>
  ${S.zoom
    ? `<div class="zoom"><div class="note">온도계 눈금</div>
        <div class="big warn">${C.RECIPE.tempC} °C</div></div>`
    : `<div class="note">물중탕 앞에서 찍었다. 오른쪽에 온도계가 보인다.</div>
       <div class="row"><button class="go" id="zoom">온도계를 확대한다</button></div>`}`;
},
timer(){
  return `<h2>멈춘 타이머</h2>
  <div class="doc">바늘이 멈춘 자리 — <b class="big warn">${C.RECIPE.timeMin}</b> 분</div>`;
},
bottles(){
  const b = S.selBottle;
  const seen = Object.keys(C.REAGENTS)
    .filter(r => S.tested[b+':'+r] && S.tested[b+':'+r] !== '아무 일도 일어나지 않는다')
    .map(r => `<div class="doc"><span class="${r==='fecl3'?'vio':'warn'}">${S.tested[b+':'+r]}</span></div>`)
    .join('');
  const none = Object.keys(C.REAGENTS).filter(r => S.tested[b+':'+r]).length;
  return `<h2>병 ${b}</h2>
  ${seen || `<div class="note">${none ? `${none}가지 찍어 봤지만 아무 일도 없었다.` : '흰 가루.'}</div>`}`;
},
balance(){
  const p = S.product;
  return `<h2>전자저울</h2>
  <div class="doc">접시에 눌린 종이쪽 —
    <span class="mono">“칭량 ${C.RECIPE.salicylicG.toFixed(1)} g — 매번 이만큼”</span></div>
  ${p ? `<div class="note">올려놓은 결정 <b class="mono">${(p.mass*1000).toFixed(0)} mg</b></div>` : ''}`;
},
cylinder(){
  return `<h2>눈금실린더</h2>
  <div class="doc">테이프가 붙은 눈금 — <b class="big warn">${C.RECIPE.anhydrideMl}</b> mL</div>`;
},
bath(){
  const p = S.product;
  return `<h2>물중탕 · 플라스크</h2>
  ${p ? `<div class="doc">결정 <b class="mono">${(p.mass*1000).toFixed(0)} mg</b>${
      p.crystal ? `　<span class="dim">${p.crystal}</span>` : ''}</div>
    ${S.fecl3 ? `<div class="doc">염화철 — <span class="${
        S.fecl3 === '색이 변하지 않는다.' ? 'ok' : 'vio'}">${S.fecl3}</span></div>` : ''}
    <div class="row">
      <button id="recryst-slow">뜨거운 물에 녹여 천천히 식힌다</button>
      <button id="recryst-fast">뜨거운 물에 녹여 빨리 식힌다</button></div>
    <div class="note">재결정하면 양이 줄고 시간이 간다.</div>
    <hr style="border:0;border-top:1px solid var(--line);margin:12px 0">` : ''}
  <div class="paper">아스피린 합성
  <select id="powder" aria-label="가루를 뜰 병"><option value="">—</option>${
    Object.keys(C.BOTTLES).map(b => `<option>${b}</option>`).join('')}</select> 병에서 <input id="sal" inputmode="decimal" aria-label="가루 질량 (g)"> g
  <select id="agent" aria-label="아세틸화제"><option value="">—</option><option value="anh">무수초산</option><option value="vin">식초</option></select> <input id="ml" inputmode="decimal" aria-label="아세틸화제 부피 (mL)"> mL
  진한 황산 <label><input type="checkbox" id="cat" aria-label="진한 황산 다섯 방울"> 다섯 방울</label>
  <input id="tp" inputmode="numeric" aria-label="물중탕 온도 (°C)"> °C 물중탕에서 <input id="tm" inputmode="numeric" aria-label="가열 시간 (분)"> 분
  찬물 ${C.QUENCH.coldWaterMl} mL에 붓고 얼음물 ${C.QUENCH.iceBathMin}분</div>
  <div class="row"><button class="go" id="run">가열한다</button></div>`;
},
mp(){
  if (!S.product) return `<h2>융점측정기</h2><div class="note dim">잴 것이 없다.</div>`;
  if (!S.mp) return `<h2>융점측정기</h2>
    <div class="row"><button class="go" id="melt">융점을 잰다</button></div>`;
  const m = S.mp;
  return `<h2>융점측정기</h2>
  <div class="doc"><b class="big">${m.sharp ? `${m.hi.toFixed(0)} °C` :
      `${m.lo.toFixed(0)} – ${m.hi.toFixed(0)} °C`}</b>에서 ${m.sharp ? '날카롭게' : '뭉개지며'} 녹았다.</div>
  <div class="note">측면에 붙은 표 — <span class="mono">아스피린 ${C.ASPIRIN.mp} °C</span></div>`;
},
shutter(){
  return `<h2>셔터</h2>
  <div class="note">열리지 않는다. 손잡이가 없다.</div>`;
},
};

const HINTS = {
  s1:['선반의 시약을 집어서 흰 가루 병 위에 끌어다 놓을 수 있다. 넷을 다 찍어 봐라.',
      '염화철을 떨어뜨려 진한 보라색이 되는 병, 그 하나가 네가 쓸 가루다. 살리실산이다.'],
  s2:['노트에 빠진 숫자가 넷이다. 네 숫자는 다 이 방 안에 적혀 있다.',
      '저울 접시의 종이쪽, 눈금실린더의 테이프, 벽 사진(확대할 수 있다), 멈춘 타이머의 바늘.'],
  s3:['노트의 네 숫자를 물중탕에 그대로 넣어라. 황산은 다섯 방울.',
      '식초로는 안 된다 — 물이 섞이면 반응이 죽는다. 무수초산이어야 한다.'],
  s4:['갓 만든 것을 그대로 쓰지 않는다고 노트에 적혀 있었다. 아까 쓴 시약을 결정에도 써 봐라.',
      '염화철이 보라색이면 살리실산이 남은 것이다. 뜨거운 물에 녹였다가 천천히 식혀라.'],
  s5:['포스터에 먹일 양이 적혀 있다. 저울로 달아서 씹어 먹인다.',
      `${C.DOSE_MG} mg을 달아 환자에게 먹여라.`],
};

function stuckAt(){
  if (!S.tested['A:fecl3']) return 's1';
  if (!S.product) return S.zoom ? 's3' : 's2';
  if (S.product.purity < C.MIN_PURITY) return 's4';
  return 's5';
}

function nextHint(){
  const k = stuckAt(), t = S.hintTier[k] || 0;
  return HINTS[k][Math.min(t, HINTS[k].length - 1)];
}

const INTRO = [
  {t:'3호 조제실. 바깥에서 셔터가 내려왔다.', pic:0},
  {who:'동료', t:'…어. 뭔가 이상한데.'},
  {who:'동료', t:'가슴 한가운데가… 조여. 숨이 안 쉬어져.'},
  {t:'동료가 작업대를 짚고 천천히 주저앉는다. 식은땀이 번진다.'},
  {who:'동료', t:'왼팔이 저려. 턱까지 당겨…'},
  {t:'봉쇄 중이다. 구급차는 들어오지 못한다.'},
  {who:'동료', t:'상비약… 캐비닛…'},
];

const STAGE_LINES = {
  1:[{who:'동료', t:'…아직 거기… 있어?', pic:1},
     {t:'숨이 얕아졌다. 입술에 핏기가 없다.'}],
  2:[{who:'동료', t:'…손이… 잘… 안 움직여.', pic:2},
     {t:'말이 느려졌다. 맥이 고르지 않다.'}],
  3:[{t:'불러도 대답이 없다.', pic:3}],
};

function dropOn(target, reagent){
  if (S.over) return;
  if (target === 'crystal') {
    if (!S.product) { S.msg = '플라스크에 결정이 없다.'; return; }
    if (reagent !== 'fecl3') { S.msg = '여기 쓸 시약이 아니다.'; return; }
    spend(C.COST.fecl3);
    S.fecl3 = C.fecl3Test(S.product.purity);
    S.sel = 'bath';
    S.msg = `결정에 염화철 — ${S.fecl3}`;
    return;
  }
  S.selBottle = target;
  const key = target + ':' + reagent;
  if (S.tested[key]) { S.msg = '이미 찍어 봤다.'; S.sel = 'bottles'; return; }
  spend(C.COST.test);
  S.tested[key] = C.spotTest(target, reagent);
  S.sel = 'bottles';
  S.msg = `${target}에 ${C.REAGENTS[reagent].name}을 ${C.REAGENTS[reagent].verb} — ${S.tested[key]}`;
}

function act(id){
  if (id === 'zoom') { S.zoom = true; S.msg = '온도계 눈금이 읽힌다.'; }


  else if (id === 'run') {
    const powder = $('powder').value, agent = $('agent').value;
    const sal = +$('sal').value, ml = +$('ml').value;
    const cat = $('cat').checked ? C.RECIPE.catalystDrops : 0;
    const tp = +$('tp').value, tm = +$('tm').value;
    if (!powder)            { S.msg = '어느 병에서 뜰지 고르지 않았다.'; }
    else if (!agent)        { S.msg = '무엇을 넣을지 고르지 않았다.'; }
    else if (!(sal > 0) || !(ml > 0) || !(tm > 0)) { S.msg = '비워 둔 칸이 있다.'; }
    else if (sal > S.stock[powder] + 1e-9) {
      S.msg = `${powder} 병에 ${S.stock[powder].toFixed(2)} g뿐이다.`;
    }
    else {
      spend(C.COST.react);
      S.stock[powder] -= sal;
      const r = C.react({powder, salicylicG:sal, anhydrideMl:ml, catalystDrops:cat,
                         tempC:tp, timeMin:tm, vinegar:agent === 'vin'});
      S.msg = r.sees;
      S.fecl3 = null; S.mp = null;
      S.product = r.mass > 0 ? {mass:r.mass, purity:r.purity, crystal:null} : null;
    }
  }

  else if (id === 'recryst-slow' || id === 'recryst-fast') {
    spend(C.COST.recryst);
    const r = C.recrystallize(S.product, id === 'recryst-slow');
    S.product = r; S.fecl3 = null; S.mp = null;
    S.msg = r.crystal;
  }

  else if (id === 'melt') { spend(C.COST.melt); S.mp = C.meltingPoint(S.product.purity); }

  else if (id === 'dose') {
    const mg = +$('mg').value, p = S.product;
    if (!C.doseOk(mg)) { S.msg = '그 양은 아니다. 포스터를 다시 봐라.'; }
    else if (mg > p.mass * 1000 + 0.5) { S.msg = '그만큼은 없다.'; }
    else if (p.purity < C.MIN_PURITY && !S.warned) {
      S.warned = true;
      S.msg = '결정이 뿌옇다. 이걸 먹여도 되는지 확인한 적이 없다.';
    }
    else {
      spend(C.COST.weigh + C.COST.dose);
      if (p.purity < C.MIN_PURITY)
        finish(false, `${mg} mg을 먹였다. 살리실산이 그대로 남아 있었다. 위가 타고, 통증은 가라앉지 않는다.`,
          '염화철은 보라색을 내고 있었다. 한 번 더 녹였다가 천천히 식혔어야 했다.');
      else
        finish(true, `${mg} mg을 씹어 먹였다. 식은땀이 잦아들고 숨이 깊어진다. 셔터 밖에서 사이렌이 들린다.`);
      return;
    }
  }
  draw();
}

function tick(t){ if (flameMesh) flameMesh.scale.y = 1 + Math.sin(t / 160) * .18; }

window.ROOM = {
  id:'aspirin', title:'3호 조제실', chem:C, next:'ors',
  name:'아스피린', situation:'심근경색',
  state: () => ({
    stock:Object.fromEntries(Object.keys(C.BOTTLES).map(b => [b, C.STOCK_G])),
    tested:{}, zoom:false, product:null, fecl3:null, mp:null,
    warned:false, selBottle:'A',
  }),
  build, paint3d, tick, VIEW, HINTS, stuckAt, nextHint, INTRO, STAGE_LINES,
  drop: dropOn, act,
  onSelect: ud => { if (ud.drop && C.BOTTLES[ud.drop]) S.selBottle = ud.drop; },
  DEATH: '맥이 잡히지 않는다. 더 이상 삼킬 수 없다.',
  DEATH_WHY: '행동 하나하나가 시간이었다. 벽에 붙은 것들을 먼저 읽었다면 덜 헤맸다.',
  WIN_WORD: '사이렌',
  WIN_NOTE: `살리실산을 무수초산으로 아세틸화해 아스피린을 만들었다.
    조생성물에 남은 살리실산은 염화철이 보라색으로 잡아냈고, 재결정으로 걷어냈다.
    순수한 아스피린은 ${C.ASPIRIN.mp} °C에서 날카롭게 녹는다.`,
};
})();
