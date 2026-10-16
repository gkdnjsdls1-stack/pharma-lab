// 방 3 — 퀴닌. 말라리아 발작.
// 화학은 quinine.js, 공통 엔진은 engine.js.
(function(){
const C = window.QUIN;

let patientSkin = [], lampTube, upperLayer, lowerLayer, murk, solLiquid;
const barkMesh = {};
// ①의 결과를 약재에 칠한다. 기록은 표가 아니라 방이 들고 있는다.
// 받침 없는 이름 뒤에는 '를'. '자외선 램프을'로 적히면 거기서 읽다 멈춘다.
const ko = n => /[가-힣]$/.test(n) && (n.charCodeAt(n.length - 1) - 0xAC00) % 28 === 0 ? '를' : '을';
const stainOf = t => /청백/.test(t) ? 0x9fd8ff : /주황/.test(t) ? 0xd98a3a
                   : /보라/.test(t) ? 0x8e6fc0 : /검녹/.test(t) ? 0x2d4636 : null;

function build(K){
  const {reg, box, cyl, glass, at, grp, scene} = K;

  // 작업대
  scene.add(grp(at(box(22, .5, 3.4, 0x1d2630), 1, 3.1, -11.6),
                at(box(21, 2.9, 3.0, 0x141b23), 1, 1.6, -11.6)));

  // ① 라벨 없는 약재 봉지 넷 — 전부 갈색 껍질이다
  Object.keys(C.BAGS).forEach((b, i) => {
    const x = -9.5 + i * 2.0;
    const jar = at(glass(.46, 1.5, 0xd6eaf0), x, 4.1, -11.4);
    const bark = at(cyl(.38,.38,.86, 0x7a5a3c), x, 3.78, -11.4);
    const cap = at(cyl(.21,.21,.24, 0x2a3b45), x, 4.9, -11.4);
    barkMesh[b] = bark;
    reg(grp(jar, bark, cap), 'bags', {drop:b});
  });

  // 저울 · 눈금 실린더
  reg(grp(at(box(1.9,.3,1.5, 0x1e2832), -1.2, 3.5, -11.5),
          at(box(1.5,.5,1.1, 0x0d1218), -1.2, 3.6, -11.9),
          at(box(.9,.05,.5,  0x0a1a1e), -1.2, 3.9, -11.3)), 'balance');
  reg(grp(at(glass(.34, 2.4, 0xd6eaf0), 1.0, 4.55, -11.5),
          at(cyl(.5,.5,.2, 0x20303a), 1.0, 3.45, -11.5),
          at(box(.5,.06,.06, 0xc8b068), 1.3, 4.6, -11.5)), 'cylinder');

  // 분액 깔때기 — 이 방의 중심. 층이 갈리는 걸 봐야 한다
  const cone = at(glass(1.05, 2.3, 0xd6eaf0), 3.6, 6.1, -11.5);
  cone.scale.set(1, 1, 1);
  upperLayer = at(cyl(.92,.62,.8, 0xd8b43c), 3.6, 6.35, -11.5);
  lowerLayer = at(cyl(.62,.3,.7,  0x8fb9c8), 3.6, 5.6, -11.5);
  murk       = at(cyl(.92,.3,1.5, 0x6b5a46), 3.6, 6.0, -11.5);
  upperLayer.visible = lowerLayer.visible = murk.visible = false;
  reg(grp(cone, upperLayer, lowerLayer, murk,
          at(cyl(.1,.1,.9, 0x9aa6b4), 3.6, 4.6, -11.5),
          at(cyl(.18,.18,.2, 0x2a3b45), 3.6, 7.4, -11.5),
          at(box(.26,2.8,.26, 0x263040), 2.2, 4.8, -11.5),
          at(box(1.4,.2,1.0,  0x263040), 2.7, 3.5, -11.5)), 'funnel');

  // 되뽑기 병 — ④에서 램프를 여기 비춘다
  solLiquid = at(cyl(.62,.62,.9, 0x9fd8ff), 6.2, 3.9, -11.5);
  solLiquid.visible = false;
  reg(grp(at(glass(.7, 2.0, 0xd6eaf0), 6.2, 4.35, -11.5), solLiquid,
          at(cyl(.22,.22,.24, 0x2a3b45), 6.2, 5.45, -11.5)), 'back', {drop:'sol'});
  // 표준 형광병 — 밝기의 자
  reg(grp(at(glass(.4, 1.5, 0xd6eaf0), 8.4, 4.1, -11.5),
          at(cyl(.33,.33,.8, 0x9fd8ff), 8.4, 3.78, -11.5),
          at(box(.5,.3,.04, 0xd6d2c4), 8.4, 4.3, -11.1)), 'standard');
  // 톨루엔 병 — 라벨이 층의 답을 들고 있다
  reg(grp(at(glass(.42, 1.6, 0xd6d0c0), 10.6, 4.15, -11.5),
          at(cyl(.35,.35,.9, 0xe8e2cc), 10.6, 3.82, -11.5),
          at(box(.55,.4,.04, 0xd6d2c4), 10.6, 4.3, -11.07)), 'toluene');

  // 시약 선반 — 집어서 약재 위에 올려놓는다
  scene.add(at(box(9,.26,1.5, 0x1a222c), 6.0, 6.6, -13.2));
  [['dragendorff',0x9aa6b4,0xd98a3a], ['fecl3',0x8a9aa6,0xc8a23a]]
    .forEach(([k, g, liq], i) => {
      const x = 3.2 + i * 2.2;
      reg(grp(at(glass(.3, 1.2, g), x, 7.35, -13.2),
              at(cyl(.26,.26,.6, liq), x, 7.1, -13.2),
              at(cyl(.12,.12,.3, 0x2a3b45), x, 8.1, -13.2)), null, {grab:k});
    });
  lampTube = at(cyl(.1,.1,1.3, 0x7b6fd8, 10), 8.6, 7.1, -13.2);
  lampTube.rotation.z = Math.PI/2;
  reg(grp(at(box(1.7,.5,.6, 0x1b2430), 8.6, 7.5, -13.2), lampTube), null, {grab:'uv'});

  // 벽
  const wall = (x, y, w, h, c) => at(box(w, h, .18, c), x, y, -13.9);
  reg(grp(wall(-13, 8.4, 2.6, 1.8, 0x0d1218),
          at(box(1.3,.8,.06, 0x0a1a1e), -13.4, 8.6, -13.78),
          at(cyl(.12,.12,.08, 0x59c46a), -12.1, 8.9, -13.78)), 'radio');
  const pg = grp(wall(-9.6, 7.9, 2.4, 3.0, 0x1e2218),
                 at(box(1.6,.1,.06, 0x47503a), -9.6, 8.6, -13.78),
                 at(box(1.6,.1,.06, 0x47503a), -9.6, 8.2, -13.78));
  pg.rotation.z = -.03;
  reg(pg, 'pharm');
  reg(grp(wall(-6.2, 8.0, 2.4, 2.4, 0x11161c),
          ...[0,1,2,3].map(i => at(box(.44,.44,.06,
            [0xd84a3a, 0xd8b43c, 0x6bbf5a, 0x4a7fd8][i]), -7.0 + i*.52, 8.0, -13.78))),
      'phchart');

  // 문
  reg(grp(at(box(.3, 9, 7, 0x0c1116), 16.5, 5.2, -5),
          at(box(.36, 2.4, 2.0, 0x16303a), 16.3, 7.2, -5)), 'door');

  // 조사원 — 이 방의 시계
  const head = at(cyl(.5,.5,.46, 0xc9a07c, 20), -4.6, .56, -7.2);
  head.rotation.z = Math.PI/2;
  const body = at(box(2.6, .9, 1.3, 0x3b4a3c), -2.9, .48, -7.2);
  const legs = at(box(2.4, .7, 1.0, 0x2e3340), -.4, .4, -7.2);
  const blanket = at(box(3.4, .3, 1.7, 0x5a4440), -1.9, .9, -7.2);
  patientSkin = [head.material];
  reg(grp(head, body, legs, blanket), 'patient');
}

function paint3d(st){
  for (const b of Object.keys(C.BAGS)){
    const hit = Object.keys(C.REAGENTS)
      .map(r => S.tested[b+':'+r]).filter(Boolean).map(stainOf).find(Boolean);
    if (barkMesh[b]) barkMesh[b].material.color.setHex(hit || 0x7a5a3c);
  }
  const e = S.ext;
  if (upperLayer){
    murk.visible = !!e && e.outcome === 'emulsion';
    const split = !!e && e.outcome !== 'emulsion' && e.outcome !== 'empty';
    upperLayer.visible = lowerLayer.visible = split;
    if (split) upperLayer.material.color.setHex(e.outcome === 'ok' ? 0xd8b43c : 0xcfd8dd);
  }
  if (solLiquid){
    solLiquid.visible = !!S.sol && S.sol.mg > 0;
    const glow = S.uvRead && S.uvRead.band !== 'quenched' && S.uvRead.band !== 'none';
    solLiquid.material.color.setHex(glow ? 0x9fd8ff : 0xb6c3cc);
  }
  patientSkin.forEach(m => m.color.setHex([0xc9a07c, 0xd09070, 0xcf8e84, 0x8e8a8c][st]));
}
function tick(t){ if (lampTube) lampTube.material.color.setHex(
  Math.sin(t / 220) > 0 ? 0x8d82e4 : 0x7b6fd8); }

// --- 사물별 화면 ----------------------------------------------------------
const VIEW = {
patient(){
  const st = stage();
  return `<h2>조사원</h2>
  <div class="doc">${C.STAGES[st]}</div>
  ${S.sol ? `<div class="row"><button class="go" id="dose">1회분을 먹인다 (컵 눈금까지)</button></div>`
          : `<div class="note bad">먹일 것이 없다.</div>`}`;
},
radio(){
  return `<h2>무전기</h2>
  <div class="note">바깥 보건소. 남은 호출 <b>${S.hintsLeft}</b>회 — 묻는 동안 열이 오른다.</div>
  ${S.hintShown.map(t => `<div class="doc">“${t}”</div>`).join('')}
  <div class="row">
    <button class="go" id="hint" ${S.hintsLeft ? '' : 'disabled'}>
      ${S.hintsLeft ? '묻는다' : '더는 못 묻는다'}</button></div>`;
},
bags(){
  const b = S.selBag;
  const seen = Object.keys(C.REAGENTS)
    .filter(r => S.tested[b+':'+r] && S.tested[b+':'+r] !== '아무 일도 일어나지 않는다')
    .map(r => `<div class="doc"><span class="warn">${S.tested[b+':'+r]}</span></div>`).join('');
  const tried = Object.keys(C.REAGENTS).filter(r => S.tested[b+':'+r]).length;
  return `<h2>봉지 ${b}</h2>
  ${seen || `<div class="note">${tried ? `${tried}가지 써 봤지만 아무 일도 없었다.` : '마른 갈색 껍질.'}</div>`}
  <div class="note dim">남은 양 ${S.bark[b].toFixed(0)} g</div>`;
},
pharm(){
  return `<h2>찢긴 약전</h2>
  <div class="paper">기나피에서 퀴닌 뽑기
  기나피        <span class="blank">[ ]</span> g
  묽은 황산     <span class="blank">[ ]</span> mL 에 녹인다
  찌꺼기를 거른다
  암모니아로 pH <span class="blank">[ ]</span> 로 올린다
  톨루엔        <span class="blank">[ ]</span> mL 로 흔들어 뽑는다
  묽은 산으로 되뽑아 눈금까지 받는다

  * 염화물은 퀴닌의 형광을 지운다. 되뽑기는 황산으로.</div>`;
},
phchart(){
  return `<h2>pH 색표</h2>
  <div class="doc">암모니아 칸 — <b class="big warn">${C.RECIPE.pH}</b></div>`;
},
balance(){
  return `<h2>전자저울</h2>
  <div class="doc">접시에 눌린 종이쪽 —
    <span class="mono">“기나피 ${C.RECIPE.barkG} g씩”</span></div>`;
},
cylinder(){
  return `<h2>눈금 실린더</h2>
  <div class="doc">빛바랜 테이프 — <span class="mono">묽은 황산 ${C.RECIPE.acidMl} mL</span></div>`;
},
toluene(){
  return `<h2>톨루엔</h2>
  <div class="doc">라벨 — <span class="mono">한 번에 ${C.RECIPE.tolueneMl} mL · 물에 뜬다</span></div>`;
},
standard(){
  return `<h2>표준 형광병</h2>
  <div class="doc">라벨 — <span class="mono">퀴닌 황산염 표준액</span></div>
  <div class="note">자외선 아래 이 밝기가 먹일 수 있는 농도다.</div>`;
},
funnel(){
  const e = S.ext;
  return `<h2>분액 깔때기</h2>
  ${e ? `<div class="doc">${e.sees}</div>` : ''}
  ${S.org ? `<div class="doc ok">노란 톨루엔 층을 받아 두었다.</div>` : ''}
  <div class="paper">기나피 <select id="bg" aria-label="봉지">${opts()}</select>
  <input id="bk" inputmode="decimal" aria-label="기나피 (g)"> g
  묽은 황산 <input id="ac" inputmode="decimal" aria-label="묽은 황산 (mL)"> mL
  <label><input type="checkbox" id="fl">찌꺼기를 거른다</label>
  암모니아로 pH <input id="ph" inputmode="decimal" aria-label="pH">
  톨루엔 <input id="tl" inputmode="decimal" aria-label="톨루엔 (mL)"> mL
  받을 층 <select id="ly" aria-label="받을 층">
    <option value="">—</option><option value="upper">위층</option>
    <option value="lower">아래층</option></select></div>
  <div class="row"><button class="go" id="shake">흔든다</button></div>`;
},
back(){
  if (!S.org && !S.sol) return `<h2>되뽑기 병</h2><div class="note dim">받아 둔 것이 없다.</div>`;
  const u = S.uvRead;
  return `<h2>되뽑기 병</h2>
  ${S.sol ? `<div class="doc">${S.sol.sees}</div>` : ''}
  ${u ? `<div class="doc">자외선 — <span class="${u.band === 'match' ? 'ok' : 'bad'}">${u.label}</span></div>` : ''}
  ${S.sol ? `<div class="row">
    <button id="dilute">절반을 덜어 내고 눈금까지 채운다</button></div>` : ''}
  ${S.org ? `<div class="row">되뽑기 산
    <select id="aq" aria-label="되뽑는 산"><option value="">—</option>
      ${Object.entries(C.ACIDS).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}
    </select>
    <button class="go" id="back">되뽑는다</button></div>` : ''}`;
},
door(){
  return `<h2>표본실 문</h2>
  <div class="note">바깥에서 잠겼다. 봉쇄 중이다.</div>`;
},
};
const opts = () => '<option value="">—</option>' +
  Object.keys(C.BAGS).map(b => `<option>${b}</option>`).join('');

// --- 힌트 -----------------------------------------------------------------
const HINTS = {
  s1:['선반의 시약과 램프를 집어서 봉지 위에 끌어다 놓을 수 있다.',
      '주황색 침전이 둘이라 그것만으로는 못 가른다. 램프에 빛나는 건 하나뿐이다.'],
  s2:['뽑는 순서와 숫자가 벽의 약전에 적혀 있다. 빈 칸 넷은 방 안에 흩어져 있다.',
      '저울 쪽지, 실린더 테이프, pH 색표, 톨루엔 병 라벨.'],
  s3:['산으로 녹이고, 거르고, 염기로 올린 다음 톨루엔으로 뽑는다. 하나라도 빠지면 층이 안 갈린다.',
      '톨루엔은 물에 뜬다. 받아야 할 건 노란 위층이다.'],
  s4:['받아 낸 톨루엔에서 산으로 되뽑아야 먹일 수 있다.',
      '약전 각주를 봐라 — 염산으로 되뽑으면 램프가 캄캄해진다. 약이 없어서가 아니다.'],
  s5:['먹이기 전에 밝기를 견준 적이 없다. 램프를 되뽑기 병에 비춰 봐라.',
      '표준병보다 밝으면 절반을 덜어 내고 눈금까지 다시 채운다. 어두우면 다시 뽑는 수밖에 없다.'],
};
function stuckAt(){
  const named = Object.keys(C.BAGS).filter(b =>
    Object.keys(C.REAGENTS).some(r => S.tested[b+':'+r])).length;
  if (named < 2) return 's1';
  if (!S.org && !S.sol) return S.seenNumbers ? 's3' : 's2';
  if (!S.sol) return 's4';
  return S.uvRead ? 's5' : 's4';
}
function nextHint(){
  const k = stuckAt(), t = S.hintTier[k] || 0;
  return HINTS[k][Math.min(t, HINTS[k].length - 1)];
}

// --- 대사 -----------------------------------------------------------------
const INTRO = [
  {t:'약재 표본실. 선반마다 라벨이 떨어진 봉지다.', pic:0},
  {t:'조사원이 숲에서 돌아온 지 이레째다. 어제부터 오한이 왔다.'},
  {who:'조사원', t:'…추워요… 담요… 더…'},
  {t:'이마는 끓는데 이가 떨린다. 클로로퀸은 지난달에 다 나갔다.'},
  {t:'기나나무 껍질이 이 방 어딘가에 있다. 어느 봉지인지는 모른다.'},
];
const STAGE_LINES = {
  1:[{who:'조사원', t:'…여기… 숲이에요…?', pic:1},
     {t:'열이 끓는다. 말이 헝클어진다.'}],
  2:[{t:'땀에 젖었다. 팔이 떨린다.', pic:2},
     {who:'조사원', t:'………'}],
  3:[{t:'불러도 반응이 없다.', pic:3}],
};

// --- 동작 -----------------------------------------------------------------
function drop(target, reagent){
  if (S.over) return;
  if (target === 'sol'){
    if (!S.sol) { S.msg = '되뽑기 병이 비어 있다.'; return; }
    if (reagent !== 'uv') { S.msg = '여기 쓸 시약이 아니다.'; return; }
    spend(C.COST.uv);
    S.uvRead = C.uvOn(S.sol);
    S.msg = `되뽑기 병에 자외선 — ${S.uvRead.label}`;
    return;
  }
  S.selBag = target;
  const key = target + ':' + reagent;
  if (S.tested[key]) { S.msg = '이미 써 봤다.'; return; }
  spend(C.COST.test);
  S.tested[key] = C.spotTest(target, reagent);
  const r = C.REAGENTS[reagent];
  S.msg = `${target}에 ${r.name}${ko(r.name)} ${r.verb} — ${S.tested[key]}`;
}

function act(id){
  if (id === 'shake'){
    const bag = $('bg').value, barkG = +$('bk').value;
    const cond = {bag, barkG, acidMl:+$('ac').value, pH:+$('ph').value,
                  tolueneMl:+$('tl').value, filtered:$('fl').checked, layer:$('ly').value};
    if (!bag || !(barkG > 0))   S.msg = '어느 봉지에서 얼마나 뜰지 넣지 않았다.';
    else if (!cond.layer)       S.msg = '어느 층을 받을지 정하지 않았다.';
    else if (S.bark[bag] < barkG) S.msg = `봉지 ${bag}에 그만큼 남아 있지 않다.`;
    else {
      spend(C.COST.extract);
      S.bark[bag] -= barkG;
      S.ext = C.extract(cond);
      S.org = S.ext.mg > 0 ? S.ext.mg : null;
      S.msg = S.ext.sees;
    }
  }
  else if (id === 'back'){
    const acid = $('aq').value;
    if (!acid) S.msg = '어느 산으로 되뽑을지 정하지 않았다.';
    else {
      spend(C.COST.back);
      const r = C.backExtract(S.org, acid);
      S.msg = r.sees;
      if (r.outcome === 'ok'){ S.sol = r; S.uvRead = null; }
      S.org = null;
    }
  }
  else if (id === 'dilute'){
    spend(C.COST.dilute);
    S.sol = C.dilute(S.sol);
    S.uvRead = null;
    S.msg = S.sol.sees;
  }
  else if (id === 'dose'){
    const v = C.doseCheck(S.sol);
    if (v !== 'ok' && !S.warned){
      S.warned = true;
      S.msg = '먹여도 되는 농도인지 견줘 본 적이 없다.';
    } else if (v !== 'ok'){
      spend(C.COST.dose);
      finish(false, v === 'strong'
        ? '진한 것을 먹였다. 귀가 울린다더니 맥이 흐트러진다.'
        : '묽은 것을 먹였다. 열이 다시 오르고 발작이 돌아온다.',
        '표준 형광병과 같은 밝기여야 했다.');
      return;
    } else {
      spend(C.COST.dose);
      finish(true, '쓴 물을 삼켰다. 한 시간 뒤 떨림이 멎고, 이마의 열이 내려간다.');
      return;
    }
  }
  draw();
}

window.ROOM = {
  id:'quinine', title:'약재 표본실', chem:C, next:'penicillin',
  name:'퀴닌', situation:'말라리아 발작',
  state: () => ({tested:{}, selBag:'A', ext:null, org:null, sol:null, uvRead:null,
                 warned:false, seenNumbers:false,
                 bark:Object.fromEntries(Object.keys(C.BAGS).map(b => [b, C.STOCK_G]))}),
  build, paint3d, tick, VIEW, HINTS, stuckAt, nextHint, INTRO, STAGE_LINES,
  drop, act,
  onSelect: ud => { if (ud.drop && C.BAGS[ud.drop]) S.selBag = ud.drop;
                    if (['pharm','phchart','balance','cylinder','toluene'].includes(ud.o))
                      S.seenNumbers = true; },
  DEATH: '경련이 지나가고 숨이 멎는다.',
  DEATH_WHY: '행동 하나하나가 시간이었다. 벽의 약전을 먼저 읽었다면 한 번에 끝났다.',
  WIN_WORD: '해열',
  WIN_NOTE: `기나피에서 퀴닌을 뽑는 순서 그대로다 — 산으로 녹이고, 염기로 올리고,
    톨루엔으로 뽑아 다시 산으로 되뽑는다. 알칼로이드를 뽑는 교과서 방법이다.
    퀴닌은 묽은 황산 속에서 자외선을 받으면 청백색으로 빛난다. 토닉워터가 빛나는 이유다.
    단 염화물이 그 빛을 지운다 — 염산으로 되뽑으면 약은 그대로인데 램프만 캄캄해진다.
    투여량은 WHO 기준 퀴닌 황산염 ${C.DOSE_MG} mg, 8시간마다.`,
};
})();
