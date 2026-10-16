// 방 5 — 메탄올 중독. 해독제는 에탄올이다.
// 화학은 methanol.js, 공통 엔진은 engine.js.
(function(){
const C = window.MEOH_ROOM;

let patientSkin = [], burner, cutLiquid, mixLiquid, floatMesh, drip;
const liqMesh = {};
const ko = n => /[가-힣]$/.test(n) && (n.charCodeAt(n.length - 1) - 0xAC00) % 28 === 0 ? '를' : '을';
// ①의 정색을 병 안 액체에 칠한다. 기록은 표가 아니라 방이 들고 있는다.
const stainOf = t => /자주/.test(t) ? 0x9c4a8c : /노란/.test(t) ? 0xd8c23c
                   : /초록/.test(t) ? 0x3f9e6a : null;

function build(K){
  const {reg, box, cyl, glass, at, grp, scene} = K;

  scene.add(grp(at(box(24, .5, 3.4, 0x1d2630), 1, 3.1, -11.6),
                at(box(23, 2.9, 3.0, 0x141b23), 1, 1.6, -11.6)));

  // ① 라벨 없는 병 넷 — 전부 맑은 액체다
  Object.keys(C.BOTTLES).forEach((b, i) => {
    const x = -9.5 + i * 2.0;
    const liq = at(cyl(.35,.35,.8, 0xcfe0e8), x, 3.76, -11.4);
    liqMesh[b] = liq;
    reg(grp(at(glass(.42, 1.5, 0xd6eaf0), x, 4.1, -11.4), liq,
            at(cyl(.2,.2,.24, 0x2a3b45), x, 4.9, -11.4)), 'bottles', {drop:b});
  });

  // 증류기 — 솥·기둥·응축기·받이. 이 방의 중심
  burner = at(cyl(.001,.3,.9, 0xd8a634, 10), -0.6, 3.9, -11.5);
  drip = at(cyl(.06,.06,.3, 0xbcd8e4), 1.9, 5.2, -11.5);
  drip.visible = false;
  reg(grp(at(cyl(1.0,1.2,1.8, 0x7a6a52), -0.6, 5.3, -11.5),
          at(cyl(.3,.3,2.6, 0x8a7a60), -0.6, 7.4, -11.5),
          at(box(2.6,.26,.26, 0x8a7a60), .7, 8.6, -11.5),
          at(cyl(.22,.22,2.2, 0x9aa6b4), 1.9, 7.3, -11.5),
          at(box(.5,.3,.04, 0xd6d2c4), -0.6, 6.0, -11.0),
          burner, drip), 'still');

  // 받은 액 병 — ④에서 쉬프를 여기 떨어뜨린다
  cutLiquid = at(cyl(.5,.5,.8, 0xcfe0e8), 3.6, 3.85, -11.5);
  cutLiquid.visible = false;
  reg(grp(at(glass(.58, 1.8, 0xd6eaf0), 3.6, 4.25, -11.5), cutLiquid,
          at(cyl(.2,.2,.22, 0x2a3b45), 3.6, 5.25, -11.5)), 'cut', {drop:'cut'});
  // 희석병과 물주전자
  mixLiquid = at(cyl(.7,.7,.9, 0xcfe0e8), 5.9, 3.9, -11.5);
  mixLiquid.visible = false;
  reg(grp(at(glass(.8, 2.0, 0xd6eaf0), 5.9, 4.35, -11.5), mixLiquid,
          at(cyl(.9,1.0,1.4, 0x20303a), 7.2, 4.05, -12.2)), 'mixjar');
  // 비중계
  floatMesh = at(cyl(.1,.16,1.6, 0xe8e2d4), 8.6, 4.4, -11.5);
  reg(grp(at(glass(.36, 2.6, 0xd6eaf0), 8.6, 4.65, -11.5), floatMesh,
          at(cyl(.45,.45,.18, 0x20303a), 8.6, 3.45, -11.5)), 'hydro');
  // 투여컵
  reg(grp(at(glass(.54, 1.0, 0xd6eaf0), 10.8, 3.85, -11.5),
          at(box(.5,.06,.06, 0xc8b068), 11.1, 3.9, -11.1)), 'cup');

  // 시약 선반
  scene.add(at(box(9,.26,1.5, 0x1a222c), 5.0, 6.6, -13.2));
  [['schiff',0x9aa6b4,0xd8bcd0], ['iodoform',0x8a9aa6,0xc8a23a],
   ['dichromate',0x9aa6b4,0xd87a3a]].forEach(([k, g, liq], i) => {
    const x = 2.0 + i * 2.2;
    reg(grp(at(glass(.3, 1.2, g), x, 7.35, -13.2),
            at(cyl(.26,.26,.6, liq), x, 7.1, -13.2),
            at(cyl(.12,.12,.3, 0x2a3b45), x, 8.1, -13.2)), null, {grab:k});
  });

  // 벽 — 숫자 넷이 흩어져 있다
  const wall = (x, y, w, h, c) => at(box(w, h, .18, c), x, y, -13.9);
  reg(grp(wall(-13, 8.4, 2.6, 1.8, 0x0d1218),
          at(box(1.3,.8,.06, 0x0a1a1e), -13.4, 8.6, -13.78),
          at(cyl(.12,.12,.08, 0x59c46a), -12.1, 8.9, -13.78)), 'radio');
  const nt = grp(wall(-9.6, 7.9, 2.2, 2.6, 0x1e2218));
  nt.rotation.z = -.04;
  reg(nt, 'note');
  reg(grp(wall(-6.4, 8.0, 2.4, 2.6, 0x11161c),
          at(box(1.6,.1,.06, 0x3a4654), -6.4, 8.5, -13.78),
          at(box(1.6,.1,.06, 0x3a4654), -6.4, 8.1, -13.78)), 'bptable');
  reg(grp(wall(-3.4, 8.1, 2.0, 2.2, 0x1a2230),
          at(box(1.2,.1,.06, 0x47536a), -3.4, 8.3, -13.78)), 'dilutechart');

  reg(grp(at(box(.3, 9, 7, 0x0c1116), 16.5, 5.2, -5),
          at(box(.36, 2.4, 2.0, 0x16303a), 16.3, 7.2, -5)), 'door');

  // 정비공 — 이 방의 시계
  const head = at(cyl(.52,.52,.48, 0xc9a07c, 20), -5.0, .58, -7.2);
  head.rotation.z = Math.PI/2;
  const body = at(box(2.8, .95, 1.4, 0x3c4a5a), -3.1, .5, -7.2);
  const legs = at(box(2.4, .7, 1.1, 0x2e3340), -.5, .4, -7.2);
  patientSkin = [head.material];
  reg(grp(head, body, legs), 'patient');
}

function paint3d(st){
  for (const b of Object.keys(C.BOTTLES)){
    const hit = Object.keys(C.REAGENTS)
      .map(r => S.tested[b+':'+r]).filter(Boolean).map(stainOf).find(Boolean);
    if (liqMesh[b]) liqMesh[b].material.color.setHex(hit || 0xcfe0e8);
  }
  if (cutLiquid){
    cutLiquid.visible = !!S.cut;
    // 쉬프가 자주색을 내면 방에 그대로 남는다
    cutLiquid.material.color.setHex(
      S.schiffRead && /자주색/.test(S.schiffRead) ? 0x9c4a8c : 0xcfe0e8);
  }
  if (mixLiquid) mixLiquid.visible = !!(S.cut && S.mixed);
  if (floatMesh) floatMesh.position.y = 4.4 - (S.cut ? (60 - S.cut.abv) * .012 : 0);
  if (drip) drip.visible = !!S.cut;
  patientSkin.forEach(m => m.color.setHex([0xc9a07c, 0xc09a86, 0xb09098, 0x8e8a8c][st]));
}
function tick(t){ if (burner) burner.scale.y = 1 + Math.sin(t / 150) * .2; }

// --- 사물별 화면 ----------------------------------------------------------
const VIEW = {
patient(){
  const st = stage();
  return `<h2>정비공</h2>
  <div class="doc">${C.STAGES[st]}</div>
  ${S.cut ? `<div class="row"><button class="go" id="dose">컵 눈금까지 먹인다 (${C.RECIPE.doseMl} mL)</button></div>`
          : `<div class="note bad">먹일 것이 없다.</div>`}`;
},
radio(){
  return `<h2>무전기</h2>
  <div class="note">바깥 보건소. 남은 호출 <b>${S.hintsLeft}</b>회 — 묻는 동안 눈이 더 어두워진다.</div>
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
  ${seen || `<div class="note">${tried ? `${tried}가지 찍어 봤지만 아무 일도 없었다.` : '맑은 액체.'}</div>`}`;
},
note(){
  return `<h2>밀주꾼의 쪽지</h2>
  <div class="paper">처음 나오는 <span class="big warn">${C.RECIPE.headMl}</span> mL는 버린다
  눈이 머는 건 그것 때문이다</div>`;
},
bptable(){
  return `<h2>끓는점 표</h2>
  <div class="paper">아세톤   ${C.ACETONE.bp} °C
  메탄올   ${C.MEOH.bp} °C
  에탄올   ${C.ETOH.bp} °C
  물       100 °C</div>`;
},
dilutechart(){
  return `<h2>희석표</h2>
  <div class="doc">본류 두 컵에 물 <b class="big warn">${C.RECIPE.waterCups}</b> 컵</div>
  <div class="note">비중계가 초록 칸에 와야 먹일 수 있다.</div>`;
},
cup(){
  return `<h2>투여컵</h2>
  <div class="doc">눈금 — <span class="mono">1회분 ${C.RECIPE.doseMl} mL</span></div>`;
},
still(){
  const c = S.cut;
  return `<h2>증류기</h2>
  ${c ? `<div class="doc">${c.sees}</div>` : ''}
  <div class="paper">증류
  통에서 <select id="bg" aria-label="통">${opts()}</select> 를 올린다
  처음 <input id="hd" inputmode="decimal" aria-label="버릴 머리 (mL)"> mL 는 버린다
  <input id="ct" inputmode="decimal" aria-label="받을 온도 (°C)"> °C 에서 받는다</div>
  <div class="row"><button class="go" id="run">불을 올린다</button></div>`;
},
cut(){
  const c = S.cut;
  if (!c) return `<h2>받은 액</h2><div class="note dim">받아 둔 것이 없다.</div>`;
  return `<h2>받은 액</h2>
  <div class="doc">${c.sees}</div>
  ${S.schiffRead ? `<div class="doc"><span class="${
    /자주색/.test(S.schiffRead) ? 'bad' : 'ok'}">${S.schiffRead}</span></div>` : ''}
  ${S.hydroRead ? `<div class="doc">비중계 — <span class="${
    S.hydroRead.band === 'ok' ? 'ok' : 'bad'}">${S.hydroRead.label}</span></div>` : ''}`;
},
mixjar(){
  if (!S.cut) return `<h2>희석병</h2><div class="note dim">탈 것이 없다.</div>`;
  return `<h2>희석병</h2>
  ${S.mixed ? `<div class="note">물을 탔다.</div>` : ''}
  <div class="row">본류 두 컵에 물
    <input id="cp" inputmode="decimal" aria-label="물 (컵)"> 컵
    <button class="go" id="mix">탄다</button></div>`;
},
hydro(){
  if (!S.cut) return `<h2>비중계</h2><div class="note dim">잴 것이 없다.</div>`;
  if (!S.hydroRead) return `<h2>비중계</h2>
    <div class="row"><button class="go" id="read">띄워서 읽는다</button></div>`;
  return `<h2>비중계</h2>
  <div class="doc">눈금이 <b class="big ${S.hydroRead.band === 'ok' ? 'ok' : 'bad'}">${S.hydroRead.label}</b></div>`;
},
door(){
  return `<h2>창고 문</h2><div class="note">바깥에서 잠겼다. 봉쇄 중이다.</div>`;
},
};
const opts = () => '<option value="">—</option>' +
  Object.keys(C.BOTTLES).map(b => `<option>${b}</option>`).join('');

// --- 힌트 -----------------------------------------------------------------
const HINTS = {
  s1:['선반의 시약을 집어서 병 위에 끌어다 놓을 수 있다.',
      '시약 하나로는 안 갈라진다. 자주색을 내는 병이 독이고, 남은 알코올이 약이다.'],
  s2:['벽에 쪽지와 표가 셋 붙어 있다. 버릴 양, 받을 온도, 탈 물의 양이 거기 있다.',
      '끓는점 표에서 에탄올 줄을 봐라. 거기가 받을 자리다.'],
  s3:['통째로 먹이면 안 된다. 증류해서 앞부분을 버려야 한다.',
      '너무 일찍 받으면 메탄올이 따라오고, 너무 늦게 받으면 물이 따라온다.'],
  s4:['먹이기 전에 확인한 적이 없다. 쉬프 시약을 받은 액에 떨어뜨려 봐라.',
      '자주색이 돌면 메탄올이 남은 것이다. 비중계도 초록 칸에 와야 한다.'],
  s5:['희석표대로 물을 타라. 그대로는 너무 독하다.',
      '컵 눈금까지 한 번 먹이면 된다.'],
};
function stuckAt(){
  const named = Object.keys(C.BOTTLES).filter(b =>
    Object.keys(C.REAGENTS).some(r => S.tested[b+':'+r])).length;
  if (named < 2) return 's1';
  if (!S.cut) return S.seenNumbers ? 's3' : 's2';
  if (!S.schiffRead || !S.hydroRead) return 's4';
  return 's5';
}
function nextHint(){
  const k = stuckAt(), t = S.hintTier[k] || 0;
  return HINTS[k][Math.min(t, HINTS[k].length - 1)];
}

// --- 대사 -----------------------------------------------------------------
const INTRO = [
  {t:'밀주 창고. 라벨 없는 병이 넷, 구석에 낡은 증류기가 있다.', pic:0},
  {t:'어젯밤 넷이 나눠 마셨다. 둘은 멀쩡하고, 하나는 병원으로 갔다.'},
  {who:'정비공', t:'…눈앞이… 뿌예요…'},
  {t:'해독제는 바깥에 있고, 길은 막혔다.'},
  {t:'이 방에도 약이 될 만한 것이 하나 있다. 그대로는 못 쓴다.'},
];
const STAGE_LINES = {
  1:[{who:'정비공', t:'…하얘요… 아무것도…', pic:1},
     {t:'숨이 깊고 빨라졌다.'}],
  2:[{t:'숨소리가 거칠다. 말이 느리다.', pic:2},
     {who:'정비공', t:'………'}],
  3:[{t:'불러도 반응이 없다.', pic:3}],
};

// --- 동작 -----------------------------------------------------------------
function drop(target, reagent){
  if (S.over) return;
  if (target === 'cut'){
    if (!S.cut) { S.msg = '받아 둔 것이 없다.'; return; }
    if (reagent !== 'schiff') { S.msg = '여기 쓸 시약이 아니다.'; return; }
    spend(C.COST.schiff);
    S.schiffRead = C.schiffOn(S.cut);
    S.msg = `받은 액에 쉬프 시약 — ${S.schiffRead}`;
    return;
  }
  S.selBottle = target;
  const key = target + ':' + reagent;
  if (S.tested[key]) { S.msg = '이미 찍어 봤다.'; return; }
  spend(C.COST.test);
  S.tested[key] = C.spotTest(target, reagent);
  const r = C.REAGENTS[reagent];
  S.msg = `${target}에 ${r.name}${ko(r.name)} ${r.verb} — ${S.tested[key]}`;
}

function act(id){
  if (id === 'run'){
    const src = $('bg').value, headMl = +$('hd').value, cutC = +$('ct').value;
    if (!src)            S.msg = '어느 통을 올릴지 정하지 않았다.';
    else if (!(cutC > 0)) S.msg = '몇 도에서 받을지 넣지 않았다.';
    else if (S.washL < C.BATCH_L && src === C.WASH_BOTTLE) S.msg = '통이 비었다.';
    else {
      spend(C.COST.distill);
      if (src === C.WASH_BOTTLE) S.washL -= C.BATCH_L;
      const d = C.distill({source:src, headMl, cutC});
      S.cut = d.abv > 0 ? d : null;
      S.schiffRead = null; S.hydroRead = null; S.mixed = false;
      S.msg = d.sees;
    }
  }
  else if (id === 'mix'){
    const cups = +$('cp').value;
    if (!(cups >= 0) || $('cp').value === '') S.msg = '물을 몇 컵 탈지 넣지 않았다.';
    else {
      spend(C.COST.mix);
      S.cut = {...S.cut, abv:C.dilute(S.cut.abv, cups)};
      S.mixed = true; S.hydroRead = null;
      S.msg = `물 ${cups}컵을 탔다.`;
    }
  }
  else if (id === 'read'){ spend(C.COST.hydro); S.hydroRead = C.hydrometer(S.cut.abv); }
  else if (id === 'dose'){
    const v = C.doseCheck(S.cut);
    if (v !== 'ok' && !S.warned){
      S.warned = true;
      S.msg = '먹여도 되는 것인지 확인한 적이 없다.';
    } else if (v !== 'ok'){
      spend(C.COST.dose);
      finish(false,
        v === 'poison' ? '메탄올이 남은 것을 먹였다. 숨이 더 깊어지고, 곧 멎는다.'
      : v === 'high'   ? '너무 독한 것을 먹였다. 그대로 잠들어 깨지 않는다.'
                       : '너무 묽었다. 메탄올이 그대로 폼산으로 넘어간다.',
        '쉬프 시약이 색을 내지 않고, 비중계가 초록 칸에 와야 했다.');
      return;
    } else {
      spend(C.COST.dose);
      finish(true, '컵 눈금까지 먹였다. 한 시간 뒤 숨이 가라앉고, 빛이 보인다고 한다.');
      return;
    }
  }
  draw();
}

window.ROOM = {
  id:'methanol', title:'밀주 창고', chem:C, next:'blood',
  name:'메탄올 중독', situation:'밀주를 마시고 눈이 흐려졌다',
  state: () => ({tested:{}, selBottle:'A', cut:null, schiffRead:null, hydroRead:null,
                 mixed:false, warned:false, seenNumbers:false, washL:C.WASH_L}),
  build, paint3d, tick, VIEW, HINTS, stuckAt, nextHint, INTRO, STAGE_LINES,
  drop, act,
  onSelect: ud => { if (ud.drop && C.BOTTLES[ud.drop]) S.selBottle = ud.drop;
                    if (['note','bptable','dilutechart','cup'].includes(ud.o))
                      S.seenNumbers = true; },
  DEATH: '숨이 깊고 느려지다가 멎는다.',
  DEATH_WHY: '행동 하나하나가 시간이었다. 벽의 쪽지와 표를 먼저 읽었다면 한 번에 끝났다.',
  WIN_WORD: '시야',
  WIN_NOTE: `메탄올 중독에 에탄올을 먹이는 건 실제 해독법이다. 두 알코올이 같은 효소를
    두고 다투는데, 효소가 에탄올 쪽에 붙어 있는 동안 메탄올은 폼산으로 바뀌지 못하고
    그대로 빠져나간다. 포메피졸이 없을 때의 표준이고, 혈중 에탄올을 유지하려면
    실제로는 몇 시간마다 다시 먹인다.
    밀주꾼이 처음 ${C.RECIPE.headMl} mL를 버리는 이유도 같다 —
    메탄올(${C.MEOH.bp} °C)이 에탄올(${C.ETOH.bp} °C)보다 먼저 끓어 나온다.`,
};
})();
