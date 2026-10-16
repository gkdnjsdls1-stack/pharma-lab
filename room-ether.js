// 방 8 — 마취. 오래된 에터의 과산화물을 걸러 낸다.
// 화학은 ether.js, 공통 엔진은 engine.js.
(function(){
const C = window.ETHER_ROOM;

let patientSkin = [], colMesh, potLiquid, recvLiquid, dialNeedle, maskMesh;
const liqMesh = {};
const ko = n => /[가-힣]$/.test(n) && (n.charCodeAt(n.length - 1) - 0xAC00) % 28 === 0 ? '를' : '을';
// ①의 결과를 병 안 액체에 칠한다. 붉은색이 이 방의 신호다.
const stainOf = t => /붉은/.test(t) ? 0xb03a3a : /초록/.test(t) ? 0x3f9e6a
                   : /끓는다/.test(t) ? 0xbfe4ee : null;

function build(K){
  const {reg, box, cyl, glass, at, grp, scene} = K;

  scene.add(grp(at(box(23, .5, 3.4, 0x1d2630), 1, 3.1, -11.6),
                at(box(22, 2.9, 3.0, 0x141b23), 1, 1.6, -11.6)));

  // ① 라벨 없는 갈색 병 넷
  Object.keys(C.BOTTLES).forEach((b, i) => {
    const x = -9.6 + i * 2.0;
    const liq = at(cyl(.36,.36,.84, 0xcfe0e8), x, 3.8, -11.4);
    liqMesh[b] = liq;
    reg(grp(at(glass(.44, 1.6, 0x8a7a4a), x, 4.15, -11.4), liq,
            at(cyl(.2,.2,.24, 0x2a3b45), x, 5.0, -11.4)), 'bottles', {drop:b});
  });

  // 알루미나 컬럼 — 과산화물이 여기 걸린다
  colMesh = at(cyl(.3,.3,1.8, 0xd8d2c0), -1.0, 5.6, -11.5);
  reg(grp(at(glass(.38, 2.8, 0xd6eaf0), -1.0, 5.9, -11.5), colMesh,
          at(cyl(.1,.1,.5, 0x9aa6b4), -1.0, 4.3, -11.5),
          at(box(.22,3.4,.22, 0x263040), -2.1, 5.4, -11.5),
          at(box(1.2,.2,.9, 0x263040), -1.7, 3.45, -11.5),
          at(box(.5,.3,.04, 0xd6d2c4), -1.0, 6.9, -11.15)), 'column');

  // 증류 장치 — 솥과 받이
  potLiquid = at(cyl(.75,.75,.7, 0xcfe0e8), 1.6, 4.0, -11.5);
  potLiquid.visible = false;
  recvLiquid = at(cyl(.45,.45,.6, 0xcfe0e8), 4.4, 3.8, -11.5);
  recvLiquid.visible = false;
  reg(grp(at(glass(.85, 1.9, 0xd6eaf0), 1.6, 4.3, -11.5), potLiquid,
          at(cyl(.18,.18,1.4, 0xd6eaf0), 1.6, 5.9, -11.5),
          at(box(2.2,.2,.2, 0x9aa6b4), 2.8, 6.4, -11.5),
          at(cyl(.001,.26,.7, 0xd8a634, 10), 1.6, 3.5, -11.5)), 'still');
  reg(grp(at(glass(.52, 1.5, 0xd6eaf0), 4.4, 4.05, -11.5), recvLiquid,
          at(cyl(.2,.2,.22, 0x2a3b45), 4.4, 4.95, -11.5)), 'receiver', {drop:'cut'});

  // 마취기 — 다이얼과 마스크
  dialNeedle = at(box(.5,.06,.06, 0xd8a634), 7.2, 4.6, -11.0);
  maskMesh = at(cyl(.3,.5,.4, 0x3a4654), 8.8, 3.8, -10.8);
  reg(grp(at(box(2.4,2.0,1.6, 0x18202a), 7.2, 4.15, -11.5),
          at(cyl(.4,.4,.1, 0x0a1a1e), 7.2, 4.6, -10.72), dialNeedle,
          at(cyl(.06,.06,2.2, 0x6a7482), 8.4, 3.9, -11.0), maskMesh), 'machine');

  // 시약·도구 선반
  scene.add(at(box(9.6,.26,1.5, 0x1a222c), 5.0, 6.8, -13.2));
  [['iron',0xb03a3a], ['copper',0xb87333], ['warmth',0xbfe4ee], ['match',0xd8a634]]
    .forEach(([k, col], i) => {
      const x = 1.4 + i * 2.4;
      reg(grp(at(glass(.3, 1.2, 0x9aa6b4), x, 7.55, -13.2),
              at(cyl(.26,.26,.6, col), x, 7.3, -13.2),
              at(cyl(.12,.12,.3, 0x2a3b45), x, 8.3, -13.2)), null, {grab:k});
    });

  // 벽 — 숫자 넷
  const wall = (x, y, w, h, c) => at(box(w, h, .18, c), x, y, -13.9);
  reg(grp(wall(-13, 8.4, 2.6, 1.8, 0x0d1218),
          at(box(1.3,.8,.06, 0x0a1a1e), -13.4, 8.6, -13.78),
          at(cyl(.12,.12,.08, 0x59c46a), -12.1, 8.9, -13.78)), 'radio');
  const rec = grp(wall(-9.8, 7.9, 2.4, 3.0, 0x1e2218),
                  at(box(1.6,.1,.06, 0x47503a), -9.8, 8.6, -13.78));
  rec.rotation.z = -.03;
  reg(rec, 'record');
  reg(grp(wall(-6.4, 8.0, 2.4, 2.6, 0x11161c),
          ...[0,1,2,3].map(i => at(box(1.6,.1,.06, 0x3a4654), -6.4, 8.6 - i*.4, -13.78))),
      'bptable');
  reg(grp(wall(-3.2, 8.0, 2.2, 2.4, 0x2a1a1a),
          at(box(1.3,.1,.06, 0xc0493d), -3.2, 8.3, -13.78)), 'safety');

  reg(grp(at(box(.3, 9, 7, 0x0c1116), 16.5, 5.2, -5),
          at(box(.36, 2.4, 2.0, 0x16303a), 16.3, 7.2, -5)), 'door');

  // 소년 — 방 7에서 이어진 그 환자
  const head = at(cyl(.46,.46,.44, 0xc9a07c, 20), -5.0, .54, -6.6);
  head.rotation.z = Math.PI/2;
  const body = at(box(2.4, .85, 1.2, 0xd8d2c0), -3.4, .46, -6.6);
  const legs = at(box(2.0, .62, .95, 0x2e3340), -1.2, .38, -6.6);
  patientSkin = [head.material];
  reg(grp(head, body, legs), 'patient');
}

function paint3d(st){
  for (const b of Object.keys(C.BOTTLES)){
    const hit = Object.keys(C.REAGENTS)
      .map(r => S.tested[b+':'+r]).filter(Boolean).map(stainOf).find(Boolean);
    if (liqMesh[b]) liqMesh[b].material.color.setHex(hit || 0xcfe0e8);
  }
  // 젖은 알루미나는 색이 변한다 — 거른 흔적이 방에 남는다
  if (colMesh) colMesh.material.color.setHex(
    !S.feed ? 0xd8d2c0 : S.feed.peroxide ? 0xc9b06a : 0xb6c8d0);
  if (potLiquid) potLiquid.visible = !!S.feed && !S.cut;
  if (recvLiquid){
    recvLiquid.visible = !!S.cut;
    recvLiquid.material.color.setHex(
      S.ironRead && /붉은색/.test(S.ironRead) ? 0xb03a3a : 0xcfe0e8);
  }
  if (dialNeedle) dialNeedle.rotation.z = -(S.dial || 0) * .18;
  if (maskMesh) maskMesh.material.color.setHex(S.cut ? 0x4a6474 : 0x3a4654);
  patientSkin.forEach(m => m.color.setHex([0xc9a07c, 0xcf9a84, 0xc49090, 0x9aa6b4][st]));
}
function tick(){}

// --- 사물별 화면 ----------------------------------------------------------
const VIEW = {
patient(){
  const st = stage();
  return `<h2>소년</h2>
  <div class="doc">${C.STAGES[st]}</div>
  <div class="note">재우지 않으면 열 수 없다.</div>`;
},
radio(){
  return `<h2>무전기</h2>
  <div class="note">바깥 보건소. 남은 호출 <b>${S.hintsLeft}</b>회 — 묻는 동안 배가 더 굳는다.</div>
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
  return `<h2>갈색 병 ${b}</h2>
  ${seen || `<div class="note">${tried ? `${tried}가지 해 봤지만 아무 일도 없었다.` : '맑은 액체.'}</div>`}`;
},
record(){
  return `<h2>찢긴 마취 기록</h2>
  <div class="paper">에터 정제
  활성 알루미나 <span class="blank">[ ]</span> g 에 통과시킨다
  <span class="blank">[ ]</span> °C 에서 받는다
  바닥에 <span class="blank">[ ]</span> mL 는 남긴다
  마취기 다이얼 <span class="blank">[ ]</span> %</div>`;
},
bptable(){
  return `<h2>끓는점 표</h2>
  <div class="paper">${C.ETHER.name}  ${C.ETHER.bp} °C
  ${C.ACETONE.name}        ${C.ACETONE.bp} °C
  ${C.CHLOROFORM.name}      ${C.CHLOROFORM.bp} °C
  물              100 °C</div>`;
},
safety(){
  return `<h2>붉은 안전 수칙</h2>
  <div class="doc"><b>에터를 바닥까지 졸이지 말 것.</b> 남는 것이 과산화물이다</div>
  <div class="doc">오래된 병은 걸러 쓴다. 거르지 않은 것을 졸이면 <b class="bad">터진다</b></div>`;
},
column(){
  return `<h2>알루미나 컬럼</h2>
  ${S.feed ? `<div class="doc">${S.feed.sees}</div>` : ''}
  <div class="row">병 <select id="bt" aria-label="병">${opts()}</select>
    알루미나 <input id="al" inputmode="decimal" aria-label="알루미나 (g)"> g
    <button class="go" id="pass">통과시킨다</button></div>
  <div class="note dim">남은 에터 ${S.etherMl} mL</div>`;
},
still(){
  const d = S.dist;
  return `<h2>증류 장치</h2>
  ${d ? `<div class="doc">${d.sees}</div>` : ''}
  ${!S.feed ? `<div class="note dim">올릴 것이 없다.</div>` : `
  <div class="paper">받는 온도 <input id="ct" inputmode="decimal" aria-label="받는 온도 (°C)"> °C
  바닥에 남길 양 <input id="lv" inputmode="decimal" aria-label="남길 양 (mL)"> mL</div>
  <div class="row"><button class="go" id="run">불을 올린다</button></div>`}`;
},
receiver(){
  if (!S.cut) return `<h2>받이</h2><div class="note dim">받아 둔 것이 없다.</div>`;
  return `<h2>받이</h2>
  <div class="doc">맑은 액. 병이 차갑다.</div>
  ${S.ironRead ? `<div class="doc"><span class="${
    /붉은색/.test(S.ironRead) ? 'bad' : 'ok'}">${S.ironRead}</span></div>` : ''}`;
},
machine(){
  if (!S.cut) return `<h2>마취기</h2><div class="note dim">기화기가 비어 있다.</div>`;
  return `<h2>마취기</h2>
  <div class="row">다이얼 <input id="pc" inputmode="decimal" aria-label="농도 (%)"> %
    <button class="go" id="anes">마스크를 씌운다</button></div>`;
},
door(){
  return `<h2>수술실 문</h2><div class="note">바깥에서 잠겼다. 봉쇄 중이다.</div>`;
},
};
const opts = () => '<option value="">—</option>' +
  Object.keys(C.BOTTLES).map(b => `<option>${b}</option>`).join('');

// --- 힌트 -----------------------------------------------------------------
const HINTS = {
  s1:['선반의 것을 집어서 병 위에 끌어다 놓을 수 있다. 넷을 다 써 봐라.',
      '불이 붙는 병이 둘이다. 미지근한 물에서 끓는 쪽이 마취제다.'],
  s2:['그 병은 오래됐다. 철 시약이 왜 붉어졌는지가 이 방의 전부다.',
      '벽의 기록에 빈 칸이 넷 있다. 끓는점 표와 붉은 수칙이 나머지를 들고 있다.'],
  s3:['그대로 증류하면 안 된다. 알루미나에 먼저 통과시켜야 과산화물이 걸린다.',
      '바닥까지 졸이지 마라. 남는 것이 과산화물이고, 그게 터진다.'],
  s4:['재우기 전에 확인한 적이 없다. 철 시약을 받이에 떨어뜨려 봐라.',
      '다시 붉어지면 과산화물이 남은 것이다. 다시 걸러야 한다.'],
  s5:['마취기 다이얼을 기록의 숫자에 맞춰라.',
      '얕으면 못 재우고, 깊으면 숨이 멎는다.'],
};
function stuckAt(){
  const named = Object.keys(C.BOTTLES).filter(b =>
    Object.keys(C.REAGENTS).some(r => S.tested[b+':'+r])).length;
  if (named < 2) return 's1';
  if (!S.feed) return S.seenNumbers ? 's3' : 's2';
  if (!S.cut) return 's3';
  if (!S.ironRead) return 's4';
  return 's5';
}
function nextHint(){
  const k = stuckAt(), t = S.hintTier[k] || 0;
  return HINTS[k][Math.min(t, HINTS[k].length - 1)];
}

// --- 대사 -----------------------------------------------------------------
const INTRO = [
  {t:'수술실. 기구는 쟁반에 널려 있고 날이 성하다.', pic:0},
  {t:'소년의 배는 지금 열어야 한다. 재우지 않고는 못 연다.'},
  {who:'소년', t:'…아저씨… 저 자는 거예요…?'},
  {t:'약장에 갈색 병이 넷. 어느 것이 마취제인지는 라벨이 알려 주지 않는다.'},
  {t:'마취기 옆 벽에 붉은 종이가 한 장 붙어 있다.'},
];
const STAGE_LINES = {
  1:[{who:'소년', t:'…더 아파요…', pic:1},
     {t:'열이 오르고 배가 더 단단하다.'}],
  2:[{t:'토한다. 맥이 빠르다.', pic:2},
     {who:'소년', t:'………'}],
  3:[{t:'불러도 반응이 없다.', pic:3}],
};

// --- 동작 -----------------------------------------------------------------
function drop(target, reagent){
  if (S.over) return;
  if (target === 'cut'){
    if (!S.cut) { S.msg = '받아 둔 것이 없다.'; return; }
    if (reagent !== 'iron') { S.msg = '여기 쓸 시약이 아니다.'; return; }
    spend(C.COST.iron);
    S.ironRead = C.ironOn(S.cut);
    S.msg = `받이에 철 시약 — ${S.ironRead}`;
    return;
  }
  S.selBottle = target;
  const key = target + ':' + reagent;
  if (S.tested[key]) { S.msg = '이미 해 봤다.'; return; }
  spend(C.COST.test);
  S.tested[key] = C.spotTest(target, reagent);
  const r = C.REAGENTS[reagent];
  S.msg = `${target}에 ${r.name}${ko(r.name)} ${r.verb} — ${S.tested[key]}`;
}

function act(id){
  if (id === 'pass'){
    const b = $('bt').value, al = +$('al').value;
    if (!b)                       S.msg = '어느 병을 통과시킬지 정하지 않았다.';
    else if (b !== C.ETHER_BOTTLE) S.msg = '컬럼을 그냥 흘러 나왔다. 걸릴 것이 없다.';
    else if (S.etherMl < C.BATCH_ML) S.msg = '병이 비었다.';
    else {
      spend(C.COST.column);
      S.etherMl -= C.BATCH_ML;
      S.feed = C.column(C.BATCH_ML, al);
      S.cut = null; S.ironRead = null; S.dist = null;
      S.msg = S.feed.sees;
    }
  }
  else if (id === 'run'){
    const cutC = +$('ct').value, leaveMl = +$('lv').value;
    if (!($('ct').value) || !($('lv').value)) S.msg = '받는 온도와 남길 양을 넣지 않았다.';
    else {
      spend(C.COST.distill);
      const d = C.distill({feed:S.feed, cutC, leaveMl});
      S.dist = d;
      S.msg = d.sees;
      if (d.outcome === 'boom'){
        finish(false, d.sees, '거르지 않은 에터를 바닥까지 졸였다. 붉은 수칙이 그 말이었다.');
        return;
      }
      if (d.outcome === 'dry'){ S.feed = null; }
      else if (d.outcome === 'ok'){ S.cut = d; S.ironRead = null; }
    }
  }
  else if (id === 'anes'){
    const pct = +$('pc').value;
    S.dial = pct;
    const v = C.anesthetize({product:S.cut, pct});
    if (v !== 'ok' && !S.warned){
      S.warned = true;
      S.msg = '이대로 씌워도 되는지 확인한 적이 없다.';
    } else if (v !== 'ok'){
      spend(C.COST.anes);
      finish(false,
        v === 'peroxide' ? '숨을 들이켜자 기침이 터지고, 입술이 파래진다.'
      : v === 'deep'     ? '너무 깊이 재웠다. 숨이 멎는다.'
                         : '얕아서 깨어 있다. 배를 열 수 없다.',
        '철 시약이 색을 내지 않고, 다이얼이 기록의 숫자여야 했다.');
      return;
    } else {
      spend(C.COST.anes);
      finish(true, '숨이 고르게 깊어진다. 눈꺼풀이 내려앉고, 손에서 힘이 빠진다. 이제 열 수 있다.');
      return;
    }
  }
  draw();
}

window.ROOM = {
  id:'ether', title:'수술실', chem:C, next:null,
  name:'마취', situation:'재우지 않으면 열 수 없다',
  state: () => ({tested:{}, selBottle:'A', feed:null, dist:null, cut:null,
                 ironRead:null, dial:0, warned:false, seenNumbers:false,
                 etherMl:C.BOTTLE_ML}),
  build, paint3d, tick, VIEW, HINTS, stuckAt, nextHint, INTRO, STAGE_LINES,
  drop, act,
  onSelect: ud => { if (ud.drop && C.BOTTLES[ud.drop]) S.selBottle = ud.drop;
                    if (['record','bptable','safety'].includes(ud.o)) S.seenNumbers = true; },
  DEATH: '열 수 있는 때를 놓쳤다.',
  DEATH_WHY: '행동 하나하나가 시간이었다. 붉은 수칙과 기록을 먼저 읽었다면 한 번에 끝났다.',
  WIN_WORD: '잠',
  WIN_NOTE: `오래된 에터에 과산화물이 생기는 건 실제이고, 실험실에서 가장 조용한 사고의 원인이다.
    철(II)과 티오시안산으로 붉은색을 보는 것이 그 표준 검출법이고,
    활성 알루미나에 통과시키는 것이 표준 제거법이다.
    바닥까지 졸이지 않는 이유도 하나다 — 끓는점 ${C.ETHER.bp} °C인 에터가 다 날아가면
    남는 것은 과산화물뿐이다.
    에터 마취 유지 농도는 ${C.ANES.lo}~${C.ANES.hi}%, 기록의 다이얼이 ${C.RECIPE.anesPct}%였다.`,
};
})();
