// 방 4 — 페니실린. 패혈증.
// 화학·미생물은 penicillin.js, 공통 엔진은 engine.js.
(function(){
const C = window.PEN;

let patientSkin = [], streak, brothLiquid, assayZone, assayDisc, colonies = [], incLamp;
const lawn = {};

const MOLD = {A:0x2b2622, B:0x5f9e86, C:0xe4e0d6, D:0xd8c79a};

function build(K){
  const {reg, box, cyl, glass, at, grp, scene} = K;

  // 작업대
  scene.add(grp(at(box(22, .5, 3.4, 0x1d2630), 1, 3.1, -11.6),
                at(box(21, 2.9, 3.0, 0x141b23), 1, 1.6, -11.6)));

  // ① 곰팡이를 그어 둔 한천 접시 넷. 세균은 아직 안 깔렸다.
  Object.keys(C.DISHES).forEach((d, i) => {
    const x = -9.5 + i * 2.0;
    const dish = at(cyl(.78,.78,.18, 0x1b232c), x, 3.5, -11.4);
    const agar = at(cyl(.72,.72,.14, 0xc9c6a8), x, 3.58, -11.4);
    const mold = at(cyl(.2,.2,.16, MOLD[d]), x, 3.64, -11.4);
    const lw = at(cyl(.7,.7,.1, 0xd9cfae), x, 3.62, -11.4);
    lw.visible = false; lawn[d] = lw;
    reg(grp(dish, agar, lw, mold), 'dishes', {drop:d});
  });

  // 여과기 · 여과액 병
  reg(grp(at(cyl(.7,.12,1.1, 0xb9c3cc), -1.2, 4.3, -11.5),
          at(cyl(.5,.5,.12, 0x9aa6b4), -1.2, 4.5, -11.5),
          at(box(.22,2.2,.22, 0x263040), -2.1, 4.4, -11.5),
          at(box(1.2,.2,.9, 0x263040), -1.8, 3.45, -11.5)), 'filter');
  brothLiquid = at(cyl(.56,.56,.9, 0xd8c23c), 1.4, 3.9, -11.5);
  brothLiquid.visible = false;
  reg(grp(at(glass(.64, 1.9, 0xd6eaf0), 1.4, 4.3, -11.5), brothLiquid,
          at(cyl(.2,.2,.22, 0x2a3b45), 1.4, 5.35, -11.5)), 'broth');

  // ④ 검정 접시 — ①의 억제대가 다시 나오는 자리
  const ap = at(cyl(.8,.8,.18, 0x1b232c), 3.9, 3.5, -11.4);
  const aa = at(cyl(.74,.74,.14, 0xc9c6a8), 3.9, 3.58, -11.4);
  assayZone = at(cyl(.7,.7,.1, 0xd9cfae), 3.9, 3.62, -11.4);
  assayDisc = at(cyl(.16,.16,.12, 0xeceae2), 3.9, 3.68, -11.4);
  assayZone.visible = assayDisc.visible = false;
  reg(grp(ap, aa, assayZone, assayDisc), 'assayplate', {drop:'assay'});
  // 무균 검사 접시
  const sp = at(cyl(.8,.8,.18, 0x1b232c), 6.1, 3.5, -11.4);
  const sa = at(cyl(.74,.74,.14, 0xc9c6a8), 6.1, 3.58, -11.4);
  colonies = [0,1,2,3,4].map(i => {
    const c = at(cyl(.07,.07,.1, 0xe8e2c4), 6.1 + Math.cos(i*1.3)*.42,
                 3.66, -11.4 + Math.sin(i*1.3)*.42);
    c.visible = false; return c;
  });
  reg(grp(sp, sa, ...colonies), 'sterileplate', {drop:'sterile'});
  // 배지 봉지
  reg(grp(at(box(1.3,1.6,.5, 0x2a3326), 8.5, 4.15, -11.5),
          at(box(.9,.5,.04, 0xd6d2c4), 8.5, 4.4, -11.23)), 'medium');

  // ② 전임자가 걸어 둔 배양 플라스크 넷
  scene.add(at(box(12.6,.26,1.6, 0x1a222c), 4.8, 6.5, -13.1));
  Object.keys(C.FLASKS).forEach((k, i) => {
    const f = C.FLASKS[k], p = C.potencyOf(f);
    const col = C.contaminated(f) ? 0xb0a24a : p === 0 ? 0xcfd8dd : 0xd8c23c;
    const mat = C.contaminated(f) ? 0x8a7f3c
              : p === 0 ? (f.tempC <= 10 ? 0xcfd8dd : MOLD[f.dish])
              : p < C.MAX_POTENCY * .5 ? 0x6f9e7a : 0x5f9e86;
    const x = .2 + i * 2.3;
    reg(grp(at(glass(1.0, 1.9, 0xd6eaf0), x, 7.55, -13.1),
            at(cyl(.86,.86,.7, col), x, 7.1, -13.1),
            at(cyl(.8,.8,.16, mat), x, 7.5, -13.1),
            at(cyl(.22,.22,.9, 0xd6eaf0), x, 8.8, -13.1),
            at(box(.6,.4,.04, 0xd6d2c4), x, 7.2, -12.55)), 'flasks', {flask:k});
  });

  // 집는 것 둘 — 검체 면봉과 여과액 피펫
  reg(grp(at(cyl(.07,.07,1.4, 0xd8d2c0), -11.6, 4.2, -11.5),
          at(cyl(.14,.14,.3, 0xe8e2d4), -11.6, 4.95, -11.5)), null, {grab:'swab'});
  reg(grp(at(cyl(.1,.1,1.6, 0xb9c3cc), -13.8, 4.3, -11.5),
          at(cyl(.2,.2,.5, 0x56b6c2), -13.8, 5.3, -11.5)), null, {grab:'filtrate'});

  // 인큐베이터 · 냉장고
  incLamp = at(cyl(.12,.12,.08, 0xd8a634), 13.6, 5.4, -10.3);
  incLamp.rotation.x = Math.PI/2;
  reg(grp(at(box(3.0, 5.0, 3.0, 0x18202a), 14.2, 2.5, -11.4),
          at(box(.1, 2.0, 2.0, 0x0a1a1e), 12.65, 3.4, -11.0),
          at(cyl(.3,.3,.14, 0x9aa6b4), 13.6, 4.6, -10.3), incLamp), 'incubator');
  reg(grp(at(box(2.6, 6.0, 2.6, 0x1b232c), -13.6, 3.0, -8.6),
          at(box(.1, 4.6, 2.0, 0x101820), -12.28, 3.4, -8.6),
          at(box(.5,.4,.04, 0xd6d2c4), -12.26, 4.6, -8.0)), 'fridge');

  // 벽
  const wall = (x, y, w, h, c) => at(box(w, h, .18, c), x, y, -13.9);
  reg(grp(wall(-13, 8.4, 2.6, 1.8, 0x0d1218),
          at(box(1.3,.8,.06, 0x0a1a1e), -13.4, 8.6, -13.78),
          at(cyl(.12,.12,.08, 0x59c46a), -12.1, 8.9, -13.78)), 'radio');
  const rec = grp(wall(-9.6, 7.9, 2.4, 3.0, 0x11161c),
                  at(box(1.6,.1,.06, 0x3a4654), -9.6, 8.6, -13.78),
                  at(box(1.6,.1,.06, 0x3a4654), -9.6, 8.2, -13.78));
  rec.rotation.z = .03;
  reg(rec, 'record');
  reg(grp(wall(-6.2, 8.1, 2.2, 2.6, 0x1a2230),
          at(box(1.4,.1,.06, 0x47536a), -6.2, 8.5, -13.78)), 'log');

  // 문
  reg(grp(at(box(.3, 9, 7, 0x0c1116), 16.5, 5.2, -5),
          at(box(.36, 2.4, 2.0, 0x16303a), 16.3, 7.2, -5)), 'door');

  // 벌목공 — 이 방의 시계. 붉은 줄이 팔을 타고 올라온다
  const head = at(cyl(.52,.52,.48, 0xc9a07c, 20), -5.0, .58, -7.2);
  head.rotation.z = Math.PI/2;
  const body = at(box(2.8, .95, 1.4, 0x6a4a34), -3.1, .5, -7.2);
  const legs = at(box(2.4, .7, 1.1, 0x2e3340), -.5, .4, -7.2);
  const arm  = at(box(2.4, .45, .45, 0xc9a07c), -3.2, .9, -6.2);
  streak = at(box(.4, .12, .12, 0xc0493d), -4.2, 1.14, -6.2);
  patientSkin = [head.material, arm.material];
  reg(grp(head, body, legs, arm, streak), 'patient');
}

function paint3d(st){
  for (const d of Object.keys(C.DISHES)){
    const swabbed = !!S.swabbed[d];
    lawn[d].visible = swabbed;
    // 푸른곰팡이 둘레만 세균이 비어 있다 — 억제대가 눈에 보이는 자리
    if (swabbed) lawn[d].scale.setScalar(C.DISHES[d].makes ? .55 : 1);
  }
  if (brothLiquid){
    brothLiquid.visible = !!S.broth;
    if (S.broth){
      brothLiquid.scale.y = Math.max(.25, S.broth.ml / C.FLASK_ML);
      brothLiquid.material.color.setHex(S.broth.contaminated ? 0xb0a24a : 0xd8c23c);
    }
  }
  if (assayZone){
    assayZone.visible = assayDisc.visible = !!S.assay;
    if (S.assay) assayZone.scale.setScalar(
      S.assay.mm === 0 ? 1 : Math.max(.3, 1 - S.assay.mm / 60));
  }
  colonies.forEach(c => { c.visible = !!S.sterile && /콜로니/.test(S.sterile); });
  if (streak){ streak.scale.x = 1 + st * 1.4; streak.position.x = -4.2 + st * .28; }
  patientSkin.forEach(m => m.color.setHex([0xc9a07c, 0xcf9a84, 0xc48e8e, 0x8e8a8c][st]));
}
function tick(t){ if (incLamp) incLamp.material.color.setHex(
  Math.sin(t / 700) > 0 ? 0xd8a634 : 0x6b5520); }

// --- 사물별 화면 ----------------------------------------------------------
const VIEW = {
patient(){
  const st = stage(), left = C.DOSES_NEEDED - S.doses;
  return `<h2>벌목공</h2>
  <div class="doc">${C.STAGES[st]}</div>
  ${S.doses ? `<div class="note">${S.doses}회 넣었다. ${left > 0 ? `${left}회 더.` : ''}</div>` : ''}
  ${S.broth ? `<div class="row"><button class="go" id="dose">한 번 분을 넣는다 (${C.DOSE_ML} mL)</button></div>`
            : `<div class="note bad">넣을 것이 없다.</div>`}`;
},
radio(){
  return `<h2>무전기</h2>
  <div class="note">바깥 보건소. 남은 호출 <b>${S.hintsLeft}</b>회 — 묻는 동안 열이 오른다.</div>
  ${S.hintShown.map(t => `<div class="doc">“${t}”</div>`).join('')}
  <div class="row">
    <button class="go" id="hint" ${S.hintsLeft ? '' : 'disabled'}>
      ${S.hintsLeft ? '묻는다' : '더는 못 묻는다'}</button></div>`;
},
dishes(){
  const d = S.selDish;
  return `<h2>접시 ${d}</h2>
  ${S.swabbed[d] ? `<div class="doc"><span class="warn">${S.swabbed[d]}</span></div>`
                 : `<div class="note">곰팡이를 그어 둔 한천 접시. 세균은 아직 없다.</div>`}`;
},
flasks(){
  const k = S.selFlask, f = C.FLASKS[k];
  return `<h2>배양 플라스크 ${k}</h2>
  <div class="paper">접종 접시  ${f.dish}
  배양 온도  ${f.tempC} °C
  배양 일수  ${f.days} 일
  배지 pH    ${f.pH}</div>
  <div class="doc">${C.brothSees(f)}.</div>
  ${S.flask === k ? `<div class="note ok">이걸 쓰기로 했다.</div>`
    : `<div class="row"><button class="go" id="take">이 플라스크를 쓴다</button></div>`}`;
},
record(){
  return `<h2>찢긴 배양 기록</h2>
  <div class="paper">페니실린 배양과 수확
  접종 접시  <span class="blank">[ ]</span>
  배양 온도  <span class="blank">[ ]</span> °C
  배양 일수  <span class="blank">[ ]</span> 일
  배지 pH    <span class="blank">[ ]</span>
  균사를 걸러 내고
  <span class="blank">[ ]</span> °C 이하에 둔다 — 열에 깨진다</div>`;
},
log(){
  return `<h2>접종 일지</h2>
  <div class="doc">마지막 줄 — <span class="mono">“접종. ${C.RECIPE.days}일째 수확할 것”</span></div>`;
},
incubator(){
  return `<h2>배양기</h2>
  <div class="doc">다이얼이 <b class="big warn">${C.RECIPE.tempC}</b> °C에 맞춰져 있다.</div>`;
},
medium(){
  return `<h2>배지 봉지</h2>
  <div class="doc">라벨 — <span class="mono">녹인 뒤 pH ${C.RECIPE.pH}로 맞출 것</span></div>`;
},
fridge(){
  return `<h2>냉장고</h2>
  <div class="doc">문에 붙은 스티커 — <span class="mono">${C.RECIPE.keepC} °C</span></div>`;
},
filter(){
  return `<h2>여과기</h2>
  ${S.flask ? (S.broth ? `<div class="note">이미 걸렀다.</div>`
      : `<div class="row"><button class="go" id="filterit">${S.flask}번을 거른다</button></div>`)
    : `<div class="note dim">어느 플라스크를 쓸지 정하지 않았다.</div>`}`;
},
broth(){
  const b = S.broth;
  if (!b) return `<h2>여과액 병</h2><div class="note dim">비어 있다.</div>`;
  return `<h2>여과액 병</h2>
  <div class="doc">맑은 노란 액체. ${b.ml.toFixed(0)} mL 남았다.</div>
  ${S.assay ? `<div class="doc">검정 — <span class="${S.assay.pass ? 'ok' : 'bad'}">${S.assay.sees}</span></div>` : ''}
  ${S.sterile ? `<div class="doc"><span class="${/깨끗/.test(S.sterile) ? 'ok' : 'bad'}">${S.sterile}</span></div>` : ''}
  <div class="row">
    <button id="freeze">얼려서 얼음을 걷어낸다</button>
    <button id="boil">끓여서 졸인다</button></div>`;
},
assayplate(){
  return `<h2>검정 접시</h2>
  ${S.assay ? `<div class="doc">${S.assay.sees}</div>
    <div class="note">표준 디스크보다 띠가 넓어야 한 번 분이 된다.</div>`
    : `<div class="note">세균을 깔아 둔 한천. 가운데 표준 디스크가 하나 놓여 있다.</div>`}`;
},
sterileplate(){
  return `<h2>무균 검사 접시</h2>
  ${S.sterile ? `<div class="doc">${S.sterile}</div>`
              : `<div class="note">빈 한천. 아무것도 묻히지 않았다.</div>`}`;
},
door(){
  return `<h2>배양실 문</h2>
  <div class="note">바깥에서 잠겼다. 봉쇄 중이다.</div>`;
},
};

// --- 힌트 -----------------------------------------------------------------
const HINTS = {
  s1:['검체 면봉을 집어서 한천 접시에 끌어다 놓을 수 있다. 넷을 다 그어 봐라.',
      '세균이 비어 있는 접시가 하나 있다. 그 곰팡이가 약을 만든다.'],
  s2:['선반의 플라스크마다 꼬리표가 붙어 있다. 벽의 기록이 어느 조건이 맞는지 말해 준다.',
      '숫자가 다 맞는 플라스크가 둘이다. 접종 접시까지 봐라 — 하나는 곰팡이가 틀렸다.'],
  s3:['균사가 든 채로는 못 넣는다. 여과기로 걸러라.',
      '졸이지 마라. 기록대로 열에 깨진다. 진하게 하려면 얼려서 얼음을 걷어낸다.'],
  s4:['넣기 전에 역가를 잰 적이 없다. 여과액 피펫을 검정 접시에 끌어다 놓아라.',
      '무균 접시에도 묻혀 봐라. 세균이 든 액을 넣으면 더 빨리 나빠진다.'],
  s5:['한 번에 다 넣어도 소용없다. 세 시간마다 나눠 넣는다.',
      `${C.DOSES_NEEDED}회를 다 넣어야 한다. 중간에 끊기면 균이 되살아난다.`],
};
function stuckAt(){
  if (Object.keys(S.swabbed).length < 2) return 's1';
  if (!S.flask) return 's2';
  if (!S.broth) return 's3';
  if (!S.assay || !S.sterile) return 's4';
  return 's5';
}
function nextHint(){
  const k = stuckAt(), t = S.hintTier[k] || 0;
  return HINTS[k][Math.min(t, HINTS[k].length - 1)];
}

// --- 대사 -----------------------------------------------------------------
const INTRO = [
  {t:'배양실. 선반에 전임자가 걸어 둔 플라스크가 다섯 남아 있다.', pic:0},
  {t:'벌목공이 사흘 전 톱에 손등을 베었다.'},
  {who:'벌목공', t:'…줄이… 올라와요… 여기까지…'},
  {t:'손등이 붓고 뜨겁다. 붉은 줄이 팔꿈치 쪽으로 번진다.'},
  {t:'항생제 상자는 비었다. 곰팡이는 이 방에 있다.'},
];
const STAGE_LINES = {
  1:[{who:'벌목공', t:'…추운데… 땀이 나요…', pic:1},
     {t:'오한이 왔다. 숨이 가쁘다.'}],
  2:[{t:'헛소리를 한다. 손목 맥이 빠르고 약하다.', pic:2},
     {who:'벌목공', t:'………'}],
  3:[{t:'불러도 반응이 없다.', pic:3}],
};

// --- 동작 -----------------------------------------------------------------
function drop(target, reagent){
  if (S.over) return;
  if (C.DISHES[target]){
    if (reagent !== 'swab') { S.msg = '접시에 묻힐 것이 아니다.'; return; }
    S.selDish = target;
    if (S.swabbed[target]) { S.msg = '이미 그어 봤다.'; return; }
    spend(C.COST.swab);
    S.swabbed[target] = C.DISHES[target].sees;
    S.msg = `접시 ${target}에 검체를 그었다 — ${S.swabbed[target]}`;
    return;
  }
  if (reagent !== 'filtrate') { S.msg = '여기 쓸 것이 아니다.'; return; }
  if (!S.broth) { S.msg = '여과액이 없다.'; return; }
  if (target === 'assay'){
    spend(C.COST.assay);
    S.broth = {...S.broth, ml:S.broth.ml - 1};
    S.assay = C.assay(S.broth);
    S.msg = `검정 접시에 묻혔다 — ${S.assay.sees}`;
  } else {
    spend(C.COST.sterile);
    S.broth = {...S.broth, ml:S.broth.ml - 1};
    S.sterile = C.sterility(S.broth);
    S.msg = `무균 접시에 묻혔다 — ${S.sterile}`;
  }
}

function act(id){
  if (id === 'take'){ S.flask = S.selFlask; S.msg = `${S.flask}번을 내렸다.`; }
  else if (id === 'filterit'){
    spend(C.COST.filter);
    S.broth = C.filterBroth(C.FLASKS[S.flask]);
    S.assay = null; S.sterile = null;
    S.msg = '균사를 걸러 냈다. 맑은 노란 액체가 받아졌다.';
  }
  else if (id === 'freeze'){
    spend(C.COST.freeze);
    S.broth = C.freeze(S.broth);
    S.assay = null; S.sterile = null;
    S.msg = '얼려서 얼음을 걷어냈다. 남은 액이 절반으로 줄었다.';
  }
  else if (id === 'boil'){
    spend(C.COST.heat);
    S.broth = C.boilDown(S.broth);
    S.assay = null; S.sterile = null;
    S.msg = '끓여서 졸였다. 단내가 난다.';
  }
  else if (id === 'dose'){
    const v = C.doseCheck(S.broth);
    if (v !== 'ok' && !S.warned){
      S.warned = true;
      S.msg = '넣어도 되는 것인지 확인한 적이 없다.';
    } else if (v !== 'ok'){
      spend(C.COST.dose);
      finish(false,
        v === 'dirty' ? '세균이 든 액을 혈관에 넣었다. 열이 치솟고 혈압이 떨어진다.'
      : v === 'nofilter' ? '균사가 든 채로 밀어 넣었다.'
      : v === 'empty' ? '남은 액이 없다.'
      : '역가가 모자랐다. 하루 뒤 붉은 줄이 다시 올라온다.',
        '검정 접시의 띠가 표준 디스크보다 넓어야 했다. 무균 검사도 했어야 했다.');
      return;
    } else {
      spend(C.COST.dose);
      S.broth = {...S.broth, ml:S.broth.ml - C.DOSE_ML};
      S.doses++;
      if (S.doses >= C.DOSES_NEEDED){
        finish(true, `세 시간마다 ${C.DOSES_NEEDED}회를 다 넣었다. 붉은 줄이 손등까지 물러나고, 열이 내린다.`);
        return;
      }
      S.msg = `한 번 분을 넣었다. ${C.DOSES_NEEDED - S.doses}회 더.`;
    }
  }
  draw();
}

window.ROOM = {
  id:'penicillin', title:'배양실', chem:C, next:'methanol',
  name:'페니실린', situation:'상처가 곪았다',
  state: () => ({swabbed:{}, selDish:'A', selFlask:'1', flask:null, broth:null,
                 assay:null, sterile:null, doses:0, warned:false}),
  build, paint3d, tick, VIEW, HINTS, stuckAt, nextHint, INTRO, STAGE_LINES,
  drop, act,
  onSelect: ud => { if (ud.drop && C.DISHES[ud.drop]) S.selDish = ud.drop;
                    if (ud.flask) S.selFlask = ud.flask; },
  DEATH: '숨이 얕아지다가 멎는다.',
  DEATH_WHY: '행동 하나하나가 시간이었다. 벽의 기록과 꼬리표를 먼저 맞춰 봤다면 한 번에 골랐다.',
  WIN_WORD: '퇴치',
  WIN_NOTE: `플레밍이 1928년에 본 것이 바로 그 억제대다 — 푸른곰팡이 둘레만 세균이 비어 있었다.
    역가는 지름으로 잰다. 1 옥스퍼드 단위는 페니실린 G 나트륨 ${C.UNIT_UG} µg이다.
    페니실린은 열과 산에 깨진다 — 졸이면 사라지고, 산성 배지에서는 애초에 덜 모인다.
    1941년 첫 환자 앨버트 알렉산더는 나아지다가 약이 떨어져 죽었다.
    그래서 ${C.DOSES_NEEDED}회를 끝까지 넣는다.`,
};
})();
