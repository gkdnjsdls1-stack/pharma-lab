// 방 2 — 경구수액(ORS). 콜레라성 탈수.
// 화학은 ors.js, 공통 엔진은 engine.js.
(function(){
const C = window.ORS;

let patientSkin = [], flameMesh, brothMesh;
const powderMesh = {};
// ①의 정색 결과를 가루에 칠한다. 불꽃은 가루가 아니라 불꽃이 물든다.
const STAIN = {benedict:0xcc5a22, agno3:0xd8dde2, cacl2:0xe6ecf2};
const FLAME = {B:0xffc23d, C:0xffc23d, D:0xc08ae0};   // 나트륨 노랑 · 칼륨 연보라

function build(K){
  const {reg, box, cyl, glass, at, grp, scene} = K;

  // 작업대
  scene.add(grp(at(box(22, .5, 3.4, 0x1d2630), 1, 3.1, -11.6),
                at(box(21, 2.9, 3.0, 0x141b23), 1, 1.6, -11.6)));

  // ① 라벨 없는 흰 가루 넷
  Object.keys(C.BOTTLES).forEach((b, i) => {
    const x = -9.4 + i * 1.9;
    const jar = at(glass(.44, 1.4, 0xd6eaf0), x, 4.05, -11.4);
    const pow = at(cyl(.37,.37,.78, 0xe8eef4), x, 3.74, -11.4);
    const cap = at(cyl(.2,.2,.22, 0x2a3b45), x, 4.78, -11.4);
    powderMesh[b] = pow;
    reg(grp(jar, pow, cap), 'bottles', {drop:b});
  });

  // 저울 · 계량 주전자 · 조제 비커 · 염도계
  reg(grp(at(box(1.9,.3,1.5, 0x1e2832), -1.3, 3.5, -11.5),
          at(box(1.5,.5,1.1, 0x0d1218), -1.3, 3.6, -11.9),
          at(box(.9,.05,.5,  0x0a1a1e), -1.3, 3.9, -11.3)), 'balance');
  reg(grp(at(cyl(.8,.9,1.6, 0x202a33), 1.1, 4.1, -11.5),
          at(box(.9,.12,.12, 0x2a3b45), 2.0, 4.5, -11.5)), 'kettle');
  const beakerGlass = at(glass(1.1, 2.2, 0xd6eaf0), 3.9, 4.4, -11.5);
  brothMesh = at(cyl(1.0,1.0,1.2, 0x2a4a5a), 3.9, 3.9, -11.5);
  brothMesh.visible = false;
  reg(grp(beakerGlass, brothMesh, at(cyl(.08,.08,2.6, 0x8a95a3), 4.9, 5.0, -11.5)),
      'beaker', {drop:'mixture'});
  reg(grp(at(box(2.2,1.5,1.6, 0x0d1218), 7.8, 4.05, -11.5),
          at(box(1.2,.6,.08,  0x0a1a1e), 7.7, 4.4, -10.65),
          at(cyl(.06,.06,1.1, 0x20303a), 8.9, 4.7, -11.3)), 'meter');

  // 시약 선반
  scene.add(at(box(11,.26,1.5, 0x1a222c), 5.6, 6.6, -13.2));
  const RE = [['agno3',0x9aa6b4,0xcfd6de], ['benedict',0x3a6a7a,0x1a6a7a],
              ['cacl2',0x8a9aa6,0xe0e6ea]];
  RE.forEach(([k, g, liq], i) => {
    const x = 1.6 + i * 2.6;
    reg(grp(at(glass(.3, 1.2, g), x, 7.35, -13.2),
            at(cyl(.26,.26,.6, liq), x, 7.1, -13.2),
            at(cyl(.12,.12,.3, 0x2a3b45), x, 8.1, -13.2)), null, {grab:k});
  });
  flameMesh = at(cyl(.001,.22,.8, 0xd8a634, 10), 9.4, 8.0, -13.2);
  reg(grp(at(cyl(.28,.36,1.0, 0x20282f), 9.4, 7.25, -13.2), flameMesh), null, {grab:'flame'});

  // 벽 — 숫자 넷이 흩어져 있다
  const wall = (x, y, w, h, c) => at(box(w, h, .18, c), x, y, -13.9);
  reg(grp(wall(-13, 8.4, 2.6, 1.8, 0x0d1218),
          at(box(1.3,.8,.06, 0x0a1a1e), -13.4, 8.6, -13.78),
          at(cyl(.12,.12,.08, 0x59c46a), -12.1, 8.9, -13.78)), 'radio');
  const sa = grp(wall(-9.8, 7.8, 2.2, 2.6, 0x1a2a22));
  sa.rotation.z = .04;
  reg(sa, 'sachet');
  reg(grp(wall(-6.6, 8.0, 2.2, 2.8, 0x11161c),
          at(box(1.4,.1,.06, 0x3a4654), -6.6, 8.6, -13.78),
          at(box(1.4,.1,.06, 0x3a4654), -6.6, 8.2, -13.78)), 'poster');
  reg(grp(at(cyl(.34,.34,1.2, 0x16202a), -3.6, 8.0, -13.6),
          at(box(.7,.5,.06, 0xd6d2c4), -3.6, 8.0, -13.25)), 'vial');

  // 병동 문
  const dr = grp(at(box(.3, 9, 7, 0x0c1116), 16.5, 5.2, -5),
                 at(box(.36, 2.4, 2.0, 0x16303a), 16.3, 7.2, -5));
  reg(dr, 'door');

  // 아이 — 이 방의 시계
  const head = at(cyl(.45,.45,.42, 0xc49a78, 20), -4.2, .52, -7.4);
  head.rotation.z = Math.PI/2;
  const body = at(box(2.2, .8, 1.2, 0xc49a78), -2.8, .44, -7.4);
  const legs = at(box(2.0, .64, .95, 0x33302e), -.6, .36, -7.4);
  patientSkin = [head.material, body.material];
  reg(grp(head, body, legs), 'patient');
}

function paint3d(st){
  for (const b of Object.keys(C.BOTTLES)){
    const pow = powderMesh[b];
    if (!pow) continue;
    const hit = Object.keys(STAIN).find(r =>
      S.tested[b+':'+r] && S.tested[b+':'+r] !== '아무 일도 일어나지 않는다');
    pow.material.color.setHex(hit ? STAIN[hit] : 0xe8eef4);
  }
  const lit = Object.keys(C.BOTTLES).find(b =>
    S.tested[b+':flame'] && S.tested[b+':flame'] !== '아무 일도 일어나지 않는다');
  if (flameMesh) flameMesh.material.color.setHex(lit ? FLAME[lit] : 0xd8a634);
  if (brothMesh) brothMesh.visible = !!S.mixture;
  patientSkin.forEach(m => m.color.setHex([0xc49a78, 0xb89070, 0x9c8a84, 0x74787e][st]));
}
function tick(t){ if (flameMesh) flameMesh.scale.y = 1 + Math.sin(t / 160) * .18; }

// --- 사물별 화면 ----------------------------------------------------------
const g = n => n.toFixed(1);
const VIEW = {
patient(){
  const st = stage(), m = S.mixture;
  const left = C.SIPS_NEEDED - S.sips;
  return `<h2>아이</h2>
  <div class="doc">${C.STAGES[st]}</div>
  ${S.sips ? `<div class="note">${S.sips}모금 먹였다. ${left > 0 ? `${left}모금 더.` : ''}</div>` : ''}
  ${m ? `<div class="row"><button class="go" id="sip">한 모금 먹인다 (${C.SIP_ML} mL)</button></div>`
      : `<div class="note bad">먹일 것이 없다.</div>`}`;
},
radio(){
  return `<h2>무전기</h2>
  <div class="note">바깥 보건소. 남은 호출 <b>${S.hintsLeft}</b>회 — 묻는 동안 아이가 나빠진다.</div>
  ${S.hintShown.map(t => `<div class="doc">“${t}”</div>`).join('')}
  <div class="row">
    <button class="go" id="hint" ${S.hintsLeft ? '' : 'disabled'}>
      ${S.hintsLeft ? '묻는다' : '더는 못 묻는다'}</button></div>`;
},
bottles(){
  const b = S.selBottle;
  const seen = Object.keys(C.REAGENTS)
    .filter(r => S.tested[b+':'+r] && S.tested[b+':'+r] !== '아무 일도 일어나지 않는다')
    .map(r => `<div class="doc"><span class="warn">${S.tested[b+':'+r]}</span></div>`).join('');
  const tried = Object.keys(C.REAGENTS).filter(r => S.tested[b+':'+r]).length;
  return `<h2>병 ${b}</h2>
  ${seen || `<div class="note">${tried ? `${tried}가지 찍어 봤지만 아무 일도 없었다.` : '흰 가루.'}</div>`}`;
},
sachet(){
  return `<h2>빈 WHO 봉지</h2>
  <div class="paper">경구수액염  1 L용
  포도당 무수물   ${g(C.RECIPE.glucose)} g
  …젖어서 나머지가 번졌다…</div>`;
},
balance(){
  return `<h2>전자저울</h2>
  <div class="doc">접시에 눌린 종이쪽 —
    <span class="mono">“소금 ${g(C.RECIPE.NaCl)} g”</span></div>`;
},
vial(){
  return `<h2>약병</h2>
  <div class="doc">라벨 — <span class="mono">염화칼륨 1 L당 ${g(C.RECIPE.KCl)} g</span></div>`;
},
poster(){
  return `<h2>탈수 처치 지침</h2>
  <div class="doc"><b>징후</b>　눈이 꺼진다 · 피부가 천천히 돌아온다 · 소변이 없다</div>
  <div class="doc"><b>구연산삼나트륨</b>　1 L당 <b class="big warn">${g(C.RECIPE.citrate3Na)} g</b></div>
  <div class="doc"><b>먹이는 법</b>　한 번에 들이켜면 토한다. <b>한 모금씩 나눠서.</b></div>`;
},
kettle(){
  return `<h2>계량 주전자</h2>
  <div class="doc">눈금 — <b class="big warn">${C.RECIPE.waterL.toFixed(1)}</b> L　<span class="dim">끓인 뒤 식혀 둔 물</span></div>`;
},
beaker(){
  const m = S.mixture;
  return `<h2>조제 비커</h2>
  ${m ? `<div class="doc">${m.sees}</div>
    ${S.meterRead ? `<div class="doc">염도계 — <span class="${
      S.meterRead.band === 'ok' ? 'ok' : 'bad'}">${S.meterRead.label}</span></div>` : ''}
    ${S.benedictRead ? `<div class="doc"><span class="${
      /들어 있다/.test(S.benedictRead) ? 'ok' : 'bad'}">${S.benedictRead}</span></div>` : ''}
    <hr style="border:0;border-top:1px solid var(--line);margin:12px 0">` : ''}
  <div class="paper">경구수액  물 <input id="w" inputmode="decimal" aria-label="물 (L)"> L
  <select id="p0" aria-label="첫째 가루">${opts()}</select> <input id="g0" inputmode="decimal" aria-label="첫째 가루 질량 (g)"> g
  <select id="p1" aria-label="둘째 가루">${opts()}</select> <input id="g1" inputmode="decimal" aria-label="둘째 가루 질량 (g)"> g
  <select id="p2" aria-label="셋째 가루">${opts()}</select> <input id="g2" inputmode="decimal" aria-label="셋째 가루 질량 (g)"> g
  <select id="p3" aria-label="넷째 가루">${opts()}</select> <input id="g3" inputmode="decimal" aria-label="넷째 가루 질량 (g)"> g
  물 온도 <input id="t" inputmode="numeric" aria-label="물 온도 (°C)" value="25"> °C</div>
  <div class="row"><button class="go" id="mix">녹인다</button></div>`;
},
meter(){
  if (!S.mixture) return `<h2>염도계</h2><div class="note dim">잴 것이 없다.</div>`;
  if (!S.meterRead) return `<h2>염도계</h2>
    <div class="row"><button class="go" id="read">담가서 잰다</button></div>`;
  return `<h2>염도계</h2>
  <div class="doc">바늘이 <b class="big ${S.meterRead.band==='ok'?'ok':'bad'}">${S.meterRead.label}</b>를 가리킨다.</div>
  <div class="note">기기에 붙은 표 — <span class="mono">초록 칸이 먹일 수 있는 농도</span></div>`;
},
door(){
  return `<h2>병동 문</h2>
  <div class="note">바깥에서 잠겼다. 격리 중이다.</div>`;
},
};
const opts = () => '<option value="">—</option>' +
  Object.keys(C.BOTTLES).map(b => `<option>${b}</option>`).join('');

// --- 힌트 -----------------------------------------------------------------
const HINTS = {
  s1:['선반의 시약을 집어서 흰 가루 위에 끌어다 놓을 수 있다. 넷을 다 써야 한다.',
      '시약 하나로는 안 갈라진다. 불꽃이 노란 병이 둘이니, 질산은을 겹쳐 써 봐라.'],
  s2:['네 가루의 양이 방 안에 흩어져 있다. 물은 몇 L인지도 어딘가 적혀 있다.',
      'WHO 봉지, 저울 접시의 종이쪽, 약병 라벨, 벽 지침서. 물은 주전자 눈금.'],
  s3:['비커에 가루 넷을 다 넣고 물에 녹여라. 하나라도 빠지면 안 된다.',
      '끓는 물에 타지 마라. 포도당이 상한다. 식힌 물이어야 한다.'],
  s4:['먹이기 전에 농도를 확인한 적이 없다. 염도계가 초록 칸을 가리켜야 한다.',
      '포도당이 들어갔는지도 확인해라 — ①에서 쓴 베네딕트를 비커에 떨어뜨려 봐라.'],
  s5:['한 번에 들이켜면 토한다. 한 모금씩 나눠 먹인다.',
      `${C.SIPS_NEEDED}모금을 먹여야 한다.`],
};
function stuckAt(){
  const named = Object.keys(C.BOTTLES).filter(b =>
    Object.keys(C.REAGENTS).some(r => S.tested[b+':'+r])).length;
  if (named < 4) return 's1';
  if (!S.mixture) return S.seenNumbers ? 's3' : 's2';
  if (!S.meterRead || !S.benedictRead) return 's4';
  return 's5';
}
function nextHint(){
  const k = stuckAt(), t = S.hintTier[k] || 0;
  return HINTS[k][Math.min(t, HINTS[k].length - 1)];
}

// --- 대사 -----------------------------------------------------------------
const INTRO = [
  {t:'격리 병동. 문은 바깥에서 잠겼다.', pic:0},
  {t:'아이가 사흘째 설사를 한다. 수액 봉지는 어제 다 썼다.'},
  {who:'아이', t:'…물… 주세요…'},
  {t:'입술이 말랐다. 눈이 조금 꺼져 있다.'},
  {t:'맹물만 먹이면 더 빠진다. 선반에 라벨 없는 흰 가루가 넷 있다.'},
];
const STAGE_LINES = {
  1:[{who:'아이', t:'…어지러워…', pic:1},
     {t:'피부를 집었다 놓으면 천천히 돌아온다.'}],
  2:[{t:'눈이 움푹하다. 맥이 빠르고 약하다.', pic:2},
     {who:'아이', t:'………'}],
  3:[{t:'불러도 반응이 없다.', pic:3}],
};

// --- 동작 -----------------------------------------------------------------
function drop(target, reagent){
  if (S.over) return;
  if (target === 'mixture'){
    if (!S.mixture) { S.msg = '비커가 비어 있다.'; return; }
    if (reagent !== 'benedict') { S.msg = '여기 쓸 시약이 아니다.'; return; }
    spend(C.COST.benedict);
    S.benedictRead = C.benedictOn(S.mixture);
    S.msg = `조제액에 베네딕트 — ${S.benedictRead}`;
    return;
  }
  S.selBottle = target;
  const key = target + ':' + reagent;
  if (S.tested[key]) { S.msg = '이미 찍어 봤다.'; return; }
  spend(C.COST.test);
  S.tested[key] = C.spotTest(target, reagent);
  S.msg = `${target}에 ${C.REAGENTS[reagent].name}을 ${C.REAGENTS[reagent].verb} — ${S.tested[key]}`;
}

function act(id){
  if (id === 'mix'){
    const waterL = +$('w').value, tempC = +$('t').value;
    const amt = {NaCl:0, glucose:0, KCl:0, citrate3Na:0};
    let blank = false;
    for (let i = 0; i < 4; i++){
      const b = $('p'+i).value, v = +$('g'+i).value;
      if (!b || !(v > 0)) { blank = true; continue; }
      amt[keyOf(b)] += v;
    }
    if (!(waterL > 0)) { S.msg = '물을 얼마나 쓸지 넣지 않았다.'; }
    else if (blank)    { S.msg = '비워 둔 칸이 있다.'; }
    else {
      spend(C.COST.mix);
      S.mixture = Object.assign({}, amt, {waterL},
        C.mix(Object.assign({}, amt, {waterL, tempC})));
      S.meterRead = null; S.benedictRead = null; S.sips = 0;
      S.msg = S.mixture.sees;
    }
  }
  else if (id === 'read'){ spend(C.COST.meter); S.meterRead = C.meter(S.mixture.mOsm); }

  else if (id === 'sip'){
    const m = S.mixture;
    const safe = m.outcome === 'ok';
    if (!safe && !S.warned){
      S.warned = true;
      S.msg = '먹여도 되는지 확인한 적이 없다.';
    } else if (!safe){
      spend(C.COST.sip);
      finish(false, m.outcome === 'strong'
        ? '너무 진한 물을 먹였다. 아이가 더 목말라 하고, 눈이 더 꺼진다.'
        : m.outcome === 'noglucose'
        ? '짠물만 먹였다. 포도당이 없으면 나트륨이 장에서 흡수되지 않는다.'
        : m.outcome === 'burnt'
        ? '상한 물을 먹였다. 아이가 토한다.'
        : '묽은 물을 먹였다. 빠져나간 염이 채워지지 않는다.',
        '염도계가 초록 칸을 가리켜야 했다. 베네딕트로 포도당도 확인했어야 했다.');
      return;
    } else {
      spend(C.COST.sip);
      S.sips++;
      if (S.sips >= C.SIPS_NEEDED){
        finish(true, `${C.SIPS_NEEDED}모금을 나눠 먹였다. 입술에 물기가 돌고, 아이가 눈을 뜬다.`);
        return;
      }
      S.msg = `한 모금 먹였다. ${C.SIPS_NEEDED - S.sips}모금 더.`;
    }
  }
  draw();
}
const keyOf = b => ({'소금':'NaCl', '포도당':'glucose', '염화칼륨':'KCl',
                     '구연산삼나트륨':'citrate3Na'})[C.BOTTLES[b].what];

window.ROOM = {
  id:'ors', title:'격리 병동', chem:C, next:'quinine',
  name:'경구수액', situation:'콜레라성 탈수',
  state: () => ({tested:{}, mixture:null, meterRead:null, benedictRead:null,
                 sips:0, warned:false, selBottle:'A', seenNumbers:false}),
  build, paint3d, tick, VIEW, HINTS, stuckAt, nextHint, INTRO, STAGE_LINES,
  drop, act,
  onSelect: ud => { if (ud.drop && C.BOTTLES[ud.drop]) S.selBottle = ud.drop;
                    if (ud.o === 'sachet' || ud.o === 'poster') S.seenNumbers = true; },
  DEATH: '맥이 잡히지 않는다. 더 이상 삼키지 못한다.',
  DEATH_WHY: '행동 하나하나가 시간이었다. 벽에 붙은 것들을 먼저 읽었다면 덜 헤맸다.',
  WIN_WORD: '물기',
  WIN_NOTE: `WHO 경구수액 처방 그대로다 — 1 L에 소금 ${g(C.RECIPE.NaCl)} g,
    포도당 ${g(C.RECIPE.glucose)} g, 염화칼륨 ${g(C.RECIPE.KCl)} g,
    구연산삼나트륨 ${g(C.RECIPE.citrate3Na)} g. 삼투압 ${C.TARGET_MOSM} mOsm/L.
    포도당이 있어야 나트륨이 장에서 흡수된다 — 이 한 가지가 수백만 명을 살렸다.`,
};
})();
