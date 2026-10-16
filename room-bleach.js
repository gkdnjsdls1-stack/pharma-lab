// 방 7 — 수술 전 소독액. 아이오딘 적정으로 유효염소를 잰다.
// 화학은 bleach.js, 공통 엔진은 engine.js.
(function(){
const C = window.BLEACH;

let patientSkin = [], flaskLiquid, buretLiquid, soakLiquid, stripMesh, bubbles;
const jugLiquid = {};
const ko = n => /[가-힣]$/.test(n) && (n.charCodeAt(n.length - 1) - 0xAC00) % 28 === 0 ? '를' : '을';
const stainOf = t => /남색/.test(t) ? 0x2b3c8c : /불꽃/.test(t) ? 0xd8a634 : null;

function build(K){
  const {reg, box, cyl, glass, at, grp, scene} = K;

  scene.add(grp(at(box(23, .5, 3.4, 0x1d2630), 1, 3.1, -11.6),
                at(box(22, 2.9, 3.0, 0x141b23), 1, 1.6, -11.6)));

  // ① 라벨 없는 통 넷
  Object.keys(C.JUGS).forEach((j, i) => {
    const x = -9.6 + i * 2.0;
    const liq = at(cyl(.42,.42,.9, 0xd8e4ea), x, 3.85, -11.4);
    jugLiquid[j] = liq;
    reg(grp(at(glass(.5, 1.7, 0xd6eaf0), x, 4.2, -11.4), liq,
            at(cyl(.22,.22,.26, 0x2a3b45), x, 5.1, -11.4)), 'jugs', {drop:j});
  });

  // 적정대 — 뷰렛과 삼각플라스크. 색이 사라지는 그 한 방울을 본다
  buretLiquid = at(cyl(.12,.12,3.0, 0xcfe0e8), -0.8, 7.4, -11.5);
  flaskLiquid = at(cyl(.7,.3,.8, 0xcfe0e8), -0.8, 3.8, -11.5);
  flaskLiquid.visible = false;
  reg(grp(at(glass(.2, 3.6, 0xd6eaf0), -0.8, 7.4, -11.5), buretLiquid,
          at(cyl(.1,.1,.4, 0x9aa6b4), -0.8, 5.4, -11.5),
          at(glass(.95, 1.4, 0xd6eaf0), -0.8, 4.1, -11.5), flaskLiquid,
          at(box(.24,4.4,.24, 0x263040), -2.2, 5.4, -11.5),
          at(box(1.4,.2,1.0, 0x263040), -1.8, 3.45, -11.5)), 'buret');

  // 희석 양동이와 물주전자
  soakLiquid = at(cyl(1.0,1.0,.8, 0xcfe0e8), 2.6, 3.9, -11.5);
  soakLiquid.visible = false;
  reg(grp(at(glass(1.1, 1.8, 0xd6eaf0), 2.6, 4.25, -11.5), soakLiquid,
          at(cyl(.9,1.0,1.4, 0x20303a), 4.4, 4.05, -12.2)), 'bucket', {drop:'soak'});
  // 수술 기구 쟁반
  reg(grp(at(box(2.4,.18,1.4, 0x8a95a3), 6.6, 3.45, -11.5),
          at(box(1.6,.1,.1, 0xcfd8dd), 6.4, 3.6, -11.3),
          at(box(1.2,.1,.1, 0xcfd8dd), 6.7, 3.6, -11.7)), 'tray');
  // 색 비교표 받침에 꽂힌 전분지
  stripMesh = at(box(.3,1.2,.04, 0xe8e2d4), 9.0, 4.1, -11.4);
  reg(grp(at(box(1.6,.9,1.0, 0x263040), 9.0, 3.6, -11.5), stripMesh), 'colorcard');

  // 시약 선반
  scene.add(at(box(8,.26,1.5, 0x1a222c), 4.4, 6.6, -13.2));
  bubbles = at(cyl(.3,.3,.4, 0xe8f4f8), 3.0, 7.3, -13.2);
  bubbles.visible = false;
  [['strip',0xe8e2d4], ['mno2',0x2b2622], ['flame',0xd8a634]].forEach(([k, col], i) => {
    const x = 2.2 + i * 2.2;
    reg(grp(at(glass(.3, 1.2, 0x9aa6b4), x, 7.35, -13.2),
            at(cyl(.26,.26,.6, col), x, 7.1, -13.2),
            at(cyl(.12,.12,.3, 0x2a3b45), x, 8.1, -13.2)), null, {grab:k});
  });

  // 벽 — 숫자 넷
  const wall = (x, y, w, h, c) => at(box(w, h, .18, c), x, y, -13.9);
  reg(grp(wall(-13, 8.4, 2.6, 1.8, 0x0d1218),
          at(box(1.3,.8,.06, 0x0a1a1e), -13.4, 8.6, -13.78),
          at(cyl(.12,.12,.08, 0x59c46a), -12.1, 8.9, -13.78)), 'radio');
  const pg = grp(wall(-9.8, 7.9, 2.4, 3.0, 0x1e2218),
                 at(box(1.6,.1,.06, 0x47503a), -9.8, 8.6, -13.78));
  pg.rotation.z = -.03;
  reg(pg, 'method');
  reg(grp(wall(-6.4, 8.0, 2.4, 2.6, 0x11161c),
          ...[0,1,2,3].map(i => at(box(1.6,.1,.06, 0x3a4654), -6.4, 8.6 - i*.4, -13.78))),
      'table');
  reg(grp(wall(-3.2, 8.0, 2.2, 2.4, 0x1a2230),
          at(box(1.3,.1,.06, 0x47536a), -3.2, 8.3, -13.78)), 'who');

  reg(grp(at(box(.3, 9, 7, 0x0c1116), 16.5, 5.2, -5),
          at(box(.36, 2.4, 2.0, 0x16303a), 16.3, 7.2, -5)), 'door');

  // 소년 — 이 방의 시계
  const head = at(cyl(.46,.46,.44, 0xc9a07c, 20), -5.0, .54, -6.6);
  head.rotation.z = Math.PI/2;
  const body = at(box(2.4, .85, 1.2, 0xd8d2c0), -3.4, .46, -6.6);
  const legs = at(box(2.0, .62, .95, 0x2e3340), -1.2, .38, -6.6);
  patientSkin = [head.material];
  reg(grp(head, body, legs), 'patient');
}

function paint3d(st){
  for (const j of Object.keys(C.JUGS)){
    const hit = Object.keys(C.REAGENTS)
      .map(r => S.tested[j+':'+r]).filter(Boolean).map(stainOf).find(Boolean);
    if (jugLiquid[j]) jugLiquid[j].material.color.setHex(hit || 0xd8e4ea);
  }
  if (bubbles) bubbles.visible = Object.keys(C.JUGS).some(j => /거품/.test(S.tested[j+':mno2'] || ''));
  if (flaskLiquid){
    flaskLiquid.visible = !!S.titr;
    // 적정이 끝나면 무색, 뭉개지면 남색이 그대로 남는다
    flaskLiquid.material.color.setHex(
      S.titr && S.titr.outcome === 'smeared' ? 0x2b3c8c : 0xe4eef2);
  }
  if (buretLiquid && S.titr && S.titr.ml)
    buretLiquid.scale.y = Math.max(.2, 1 - S.titr.ml / 40);
  if (soakLiquid){
    soakLiquid.visible = S.made !== null;
    const b = S.made !== null ? C.stripOn(S.made).band : 'none';
    soakLiquid.material.color.setHex(b === 'ok' ? 0xbfe4d8 : 0xcfe0e8);
  }
  if (stripMesh) stripMesh.material.color.setHex(
    !S.stripRead ? 0xe8e2d4
    : S.stripRead.band === 'ok' ? 0x2b3c8c
    : S.stripRead.band === 'weak' ? 0x9aa8d0 : 0xf0f0ec);
  patientSkin.forEach(m => m.color.setHex([0xc9a07c, 0xcf9a84, 0xc49090, 0x9aa6b4][st]));
}
function tick(t){ if (bubbles && bubbles.visible) bubbles.scale.y = 1 + Math.sin(t / 180) * .3; }

// --- 사물별 화면 ----------------------------------------------------------
const VIEW = {
patient(){
  const st = stage();
  return `<h2>소년</h2>
  <div class="doc">${C.STAGES[st]}</div>
  <div class="note">${S.soaked ? '기구는 소독됐다.' : '기구가 소독되기 전에는 손댈 수 없다.'}</div>`;
},
radio(){
  return `<h2>무전기</h2>
  <div class="note">바깥 보건소. 남은 호출 <b>${S.hintsLeft}</b>회 — 묻는 동안 배가 더 굳는다.</div>
  ${S.hintShown.map(t => `<div class="doc">“${t}”</div>`).join('')}
  <div class="row">
    <button class="go" id="hint" ${S.hintsLeft ? '' : 'disabled'}>
      ${S.hintsLeft ? '묻는다' : '더는 못 묻는다'}</button></div>`;
},
jugs(){
  const j = S.selJug;
  const seen = Object.keys(C.REAGENTS)
    .filter(r => S.tested[j+':'+r] && S.tested[j+':'+r] !== '아무 일도 일어나지 않는다')
    .map(r => `<div class="doc"><span class="warn">${S.tested[j+':'+r]}</span></div>`).join('');
  const tried = Object.keys(C.REAGENTS).filter(r => S.tested[j+':'+r]).length;
  return `<h2>통 ${j}</h2>
  ${seen || `<div class="note">${tried ? `${tried}가지 해 봤지만 아무 일도 없었다.` : '맑은 액체.'}</div>`}`;
},
method(){
  return `<h2>찢긴 약전</h2>
  <div class="paper">유효염소 적정
  시료        <span class="blank">[ ]</span> mL
  요오드화칼륨 <span class="blank">[ ]</span> g
  묽은 아세트산 <span class="blank">[ ]</span> mL
  0.1 N 티오황산으로 떨어뜨린다
  갈색이 옅어진 뒤에 녹말을 넣는다
  남색이 사라지는 눈금을 읽는다</div>`;
},
table(){
  return `<h2>환산표</h2>
  <div class="paper">눈금 mL   유효염소
  ${C.TABLE_ML.map(m => `${m.toFixed(1).padStart(5)}      ${C.pctOf(m).toFixed(1)} %`).join('\n  ')}</div>
  <div class="note">아래쪽에 희석표가 이어져 있다 — <span class="mono">원액 1컵 : 물 (유효염소 ÷ 0.5 − 1)컵</span></div>`;
},
who(){
  return `<h2>소독 지침</h2>
  <div class="doc">기구·표면 — <b class="big warn">${C.RECIPE.targetPct}</b> % 차아염소산나트륨, ${C.SOAK_MIN}분 담근다</div>`;
},
buret(){
  const t = S.titr;
  return `<h2>적정대</h2>
  ${t ? `<div class="doc">${t.sees}</div>
    ${t.ml ? `<div class="doc">눈금 — <b class="big warn">${t.ml.toFixed(1)}</b> mL</div>` : ''}` : ''}
  <div class="paper">통 <select id="jg" aria-label="통">${opts()}</select> 에서
  시료 <input id="sm" inputmode="decimal" aria-label="시료 (mL)"> mL
  요오드화칼륨 <input id="ki" inputmode="decimal" aria-label="요오드화칼륨 (g)"> g
  묽은 아세트산 <input id="ac" inputmode="decimal" aria-label="아세트산 (mL)"> mL
  <label><input type="checkbox" id="se">녹말을 처음부터 넣는다</label></div>
  <div class="row"><button class="go" id="run">떨어뜨린다</button></div>`;
},
bucket(){
  if (!S.titr || !S.titr.ml) return `<h2>희석 양동이</h2><div class="note dim">원액 농도를 아직 모른다.</div>`;
  return `<h2>희석 양동이</h2>
  ${S.made !== null ? `<div class="note">타 놓은 것이 있다.</div>` : ''}
  ${S.stripRead ? `<div class="doc">전분지 — <span class="${
    S.stripRead.band === 'ok' ? 'ok' : 'bad'}">${S.stripRead.label}</span></div>` : ''}
  <div class="row">원액 한 컵에 물
    <input id="cp" inputmode="decimal" aria-label="물 (컵)"> 컵
    <button class="go" id="mix">탄다</button></div>
  <div class="note dim">남은 원액 ${S.stockCups}컵</div>`;
},
colorcard(){
  if (S.made === null) return `<h2>색 비교표</h2>
    <div class="note">전분지를 담가 색을 견주는 표다. <span class="dim">담글 것이 없다.</span></div>`;
  return `<h2>색 비교표</h2>
  ${S.stripRead ? `<div class="doc"><span class="${S.stripRead.band === 'ok' ? 'ok' : 'bad'}">${S.stripRead.label}</span></div>`
    : `<div class="note">전분지를 집어 양동이에 담가 본다.</div>`}`;
},
tray(){
  return `<h2>수술 기구</h2>
  ${S.soaked ? `<div class="doc ok">${C.SOAK_MIN}분을 담갔다 꺼냈다.</div>`
   : `<div class="note">아직 소독하지 않았다.</div>
      ${S.made !== null ? `<div class="row"><button class="go" id="soak">${C.SOAK_MIN}분 담근다</button></div>` : ''}`}`;
},
door(){
  return `<h2>준비실 문</h2><div class="note">바깥에서 잠겼다. 봉쇄 중이다.</div>`;
},
};
const opts = () => '<option value="">—</option>' +
  Object.keys(C.JUGS).map(j => `<option>${j}</option>`).join('');

// --- 힌트 -----------------------------------------------------------------
const HINTS = {
  s1:['선반의 것을 집어서 통 위에 끌어다 놓을 수 있다.',
      '전분지가 남색이 되는 통이 둘이다. 이산화망간에 거품이 이는 쪽은 소독약이 아니다.'],
  s2:['벽의 약전에 빈 칸이 셋, 지침에 목표 농도가 하나 있다.',
      '녹말은 처음부터 넣으면 안 된다 — 색이 질질 끌려 끝을 못 본다.'],
  s3:['통의 농도를 모르면 희석할 수 없다. 적정해서 눈금을 읽어라.',
      '읽은 눈금은 벽의 환산표에서 농도로 바꾼다. 곱할 필요 없다.'],
  s4:['환산표 아래 희석표대로 물을 타라.',
      '타 놓은 것에 전분지를 담가 색표와 견줘라. 하얗게 바래면 너무 진한 것이다.'],
  s5:[`기구를 ${C.SOAK_MIN}분 담갔다 꺼내야 수술할 수 있다.`,
      '농도가 맞아야 소독이 된다. 묽으면 담가도 소용없다.'],
};
function stuckAt(){
  const named = Object.keys(C.JUGS).filter(j =>
    Object.keys(C.REAGENTS).some(r => S.tested[j+':'+r])).length;
  if (named < 2) return 's1';
  if (!S.titr || !S.titr.ml) return S.seenNumbers ? 's3' : 's2';
  if (S.made === null) return 's4';
  if (!S.stripRead) return 's4';
  return 's5';
}
function nextHint(){
  const k = stuckAt(), t = S.hintTier[k] || 0;
  return HINTS[k][Math.min(t, HINTS[k].length - 1)];
}

// --- 대사 -----------------------------------------------------------------
const INTRO = [
  {t:'수술 준비실. 멸균기는 지난주부터 불이 안 들어온다.', pic:0},
  {t:'소년이 어제부터 오른쪽 아랫배를 안고 있다.'},
  {who:'소년', t:'…여기… 누르면… 더 아파요…'},
  {t:'터지기 전에 열어야 한다. 기구는 아직 맨 쇠다.'},
  {t:'구석에 라벨 없는 통이 넷. 하나는 소독약이고, 얼마나 남았는지는 모른다.'},
];
const STAGE_LINES = {
  1:[{who:'소년', t:'…손 떼지 마세요… 뗄 때가 더…', pic:1},
     {t:'배가 단단하다.'}],
  2:[{t:'토한다. 열이 높고 맥이 빠르다.', pic:2},
     {who:'소년', t:'………'}],
  3:[{t:'배 전체가 굳었다. 불러도 반응이 느리다.', pic:3}],
};

// --- 동작 -----------------------------------------------------------------
function drop(target, reagent){
  if (S.over) return;
  if (target === 'soak'){
    if (S.made === null) { S.msg = '양동이가 비어 있다.'; return; }
    if (reagent !== 'strip') { S.msg = '여기 쓸 것이 아니다.'; return; }
    spend(C.COST.strip);
    S.stripRead = C.stripOn(S.made);
    S.msg = `양동이에 전분지 — ${S.stripRead.label}`;
    return;
  }
  S.selJug = target;
  const key = target + ':' + reagent;
  if (S.tested[key]) { S.msg = '이미 해 봤다.'; return; }
  spend(C.COST.test);
  S.tested[key] = C.spotTest(target, reagent);
  const r = C.REAGENTS[reagent];
  S.msg = `${target}에 ${r.name}${ko(r.name)} ${r.verb} — ${S.tested[key]}`;
}

function act(id){
  if (id === 'run'){
    const jug = $('jg').value;
    if (!jug) S.msg = '어느 통을 적정할지 정하지 않았다.';
    else {
      spend(C.COST.titrate);
      S.titr = C.titrate({jug, sampleMl:+$('sm').value, kiG:+$('ki').value,
                          acidMl:+$('ac').value, starchEarly:$('se').checked});
      S.msg = S.titr.sees;
    }
  }
  else if (id === 'mix'){
    const cups = +$('cp').value;
    if ($('cp').value === '' || !(cups >= 0)) S.msg = '물을 몇 컵 탈지 넣지 않았다.';
    else if (S.stockCups < 1) S.msg = '원액이 남지 않았다.';
    else {
      spend(C.COST.mix);
      S.stockCups--;
      S.made = C.diluteTo(C.STOCK_PCT, cups);
      S.stripRead = null; S.soaked = false;
      S.msg = `원액 한 컵에 물 ${cups}컵을 탔다.`;
    }
  }
  else if (id === 'soak'){
    const v = C.soakCheck(S.made);
    if (v !== 'ok' && !S.warned){
      S.warned = true;
      S.msg = '이 농도로 소독이 되는지 견줘 본 적이 없다.';
    } else if (v !== 'ok'){
      spend(C.COST.soak);
      finish(false, v === 'over'
        ? '너무 진한 액에 담갔다. 기구가 뿌옇게 상하고 날이 무뎌졌다.'
        : '묽은 액에 담갔다 꺼냈다. 수술 자리가 이틀 뒤 곪는다.',
        '전분지가 색표의 0.5% 칸에 와야 했다.');
      return;
    } else {
      spend(C.COST.soak);
      S.soaked = true;
      finish(true, `${C.SOAK_MIN}분을 담갔다 꺼냈다. 날이 그대로다. 이제 열 수 있다.`);
      return;
    }
  }
  draw();
}

window.ROOM = {
  id:'bleach', title:'수술 준비실', chem:C, next:'ether',
  name:'소독액', situation:'충수염. 기구가 소독되지 않았다',
  state: () => ({tested:{}, selJug:'A', titr:null, made:null, stripRead:null,
                 soaked:false, warned:false, seenNumbers:false, stockCups:C.STOCK_CUPS}),
  build, paint3d, tick, VIEW, HINTS, stuckAt, nextHint, INTRO, STAGE_LINES,
  drop, act,
  onSelect: ud => { if (ud.drop && C.JUGS[ud.drop]) S.selJug = ud.drop;
                    if (['method','table','who'].includes(ud.o)) S.seenNumbers = true; },
  DEATH: '배 전체가 굳었다. 열 수 있는 때를 놓쳤다.',
  DEATH_WHY: '행동 하나하나가 시간이었다. 약전과 환산표를 먼저 읽었다면 한 번에 끝났다.',
  WIN_WORD: '무균',
  WIN_NOTE: `아이오딘 적정 그대로다 — 차아염소산염이 요오드화칼륨에서 요오드를 밀어내고,
    그 요오드를 티오황산나트륨으로 되돌린다. 0.1 N 티오황산 1 mL가 유효염소 ${C.CL_PER_ML} mg이다.
    녹말을 종말점 가까이에서 넣는 이유는 일찍 넣으면 요오드가 녹말에 갇혀
    색이 질질 끌리기 때문이다.
    기구·표면 소독은 WHO 기준 ${C.RECIPE.targetPct}% 차아염소산나트륨에 ${C.SOAK_MIN}분이다.
    오래된 표백제는 라벨 농도를 믿을 수 없어서, 쓰기 전에 재는 것이 원칙이다.`,
};
})();
