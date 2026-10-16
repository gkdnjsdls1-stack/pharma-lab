// 방 6 — 대량 출혈. 혈액형 판정과 교차시험.
// 값과 판정은 blood.js, 공통 엔진은 engine.js.
(function(){
const C = window.BLOOD;

let patientSkin = [], warmLamp, lineMesh, crossTube;
const dotMesh = {};          // 판정 자리 — 뭉치면 알갱이로, 아니면 매끈한 면으로
const KEYS = ['antiA', 'antiB', 'antiD'];

function build(K){
  const {reg, box, cyl, glass, at, grp, scene} = K;

  scene.add(grp(at(box(22, .5, 3.4, 0x1d2630), 1, 3.1, -11.6),
                at(box(21, 2.9, 3.0, 0x141b23), 1, 1.6, -11.6)));

  // 판정 자리 셋을 올린 유리판. 같은 모양을 주머니마다 하나씩 더 둔다.
  const dots = (owner, x, z, y) => KEYS.map((k, i) => {
    const d = at(cyl(.2,.2,.07, 0x2a2024), x - .5 + i * .5, y, z);
    d.visible = false; dotMesh[owner + ':' + k] = d; return d;
  });
  reg(grp(at(box(2.2,.1,1.4, 0xcfd8dd), -9.0, 3.42, -11.4),
          ...dots('slide', -9.0, -11.4, 3.5),
          at(cyl(.1,.1,1.1, 0xb9c3cc), -9.9, 3.9, -10.9)), 'slide', {drop:'slide'});

  // 교차시험 시험관대
  crossTube = at(cyl(.22,.22,1.0, 0xc0493d), -6.2, 4.0, -11.5);
  crossTube.visible = false;
  reg(grp(at(glass(.28, 1.8, 0xd6eaf0), -6.2, 4.25, -11.5), crossTube,
          at(box(1.4,.3,.9, 0x263040), -6.2, 3.45, -11.5)), 'cross');

  // 가온기 · 냉장고
  warmLamp = at(cyl(.12,.12,.08, 0xd8a634), -2.6, 4.6, -10.9);
  warmLamp.rotation.x = Math.PI/2;
  reg(grp(at(box(2.6,1.6,1.6, 0x18202a), -3.0, 4.15, -11.5),
          at(box(1.4,.7,.06, 0x0a1a1e), -3.1, 4.3, -10.68), warmLamp), 'warmer');
  reg(grp(at(box(2.6, 6.0, 2.6, 0x1b232c), -13.6, 3.0, -8.6),
          at(box(.1, 4.6, 2.0, 0x101820), -12.28, 3.4, -8.6),
          at(box(.5,.4,.04, 0xd6d2c4), -12.26, 4.6, -8.0)), 'fridge');

  // 라벨이 떨어진 혈액 주머니 넷 — 걸이에 걸려 있다
  scene.add(at(box(13,.26,1.2, 0x1a222c), 4.8, 8.2, -12.8));
  Object.keys(C.BAGS).forEach((b, i) => {
    const x = .2 + i * 2.3;
    reg(grp(at(box(1.3, 1.9, .5, 0x7a1f28), x, 6.9, -12.8),
            at(cyl(.07,.07,1.2, 0x9aa6b4), x, 8.0, -12.8),
            at(box(1.0,.5,.06, 0xd6d2c4), x, 6.3, -12.52),
            ...dots(b, x, -12.5, 7.3)), 'bags', {drop:b});
  });

  // 시약 선반
  scene.add(at(box(7.4,.26,1.5, 0x1a222c), 3.6, 4.9, -13.2));
  [['antiA',0xc0493d], ['antiB',0x4a7fd8], ['antiD',0xd8d2c0]].forEach(([k, liq], i) => {
    const x = 1.4 + i * 2.2;
    reg(grp(at(glass(.3, 1.2, 0x9aa6b4), x, 5.65, -13.2),
            at(cyl(.26,.26,.6, liq), x, 5.4, -13.2),
            at(cyl(.12,.12,.3, 0x2a3b45), x, 6.4, -13.2)), null, {grab:k});
  });

  // 벽
  const wall = (x, y, w, h, c) => at(box(w, h, .18, c), x, y, -13.9);
  reg(grp(wall(-13, 8.4, 2.6, 1.8, 0x0d1218),
          at(box(1.3,.8,.06, 0x0a1a1e), -13.4, 8.6, -13.78),
          at(cyl(.12,.12,.08, 0x59c46a), -12.1, 8.9, -13.78)), 'radio');
  reg(grp(wall(-9.6, 7.9, 2.4, 2.8, 0x11161c),
          at(box(1.6,.1,.06, 0x3a4654), -9.6, 8.5, -13.78),
          at(box(1.6,.1,.06, 0x3a4654), -9.6, 8.1, -13.78)), 'poster');
  reg(grp(wall(-6.4, 8.0, 2.2, 2.4, 0x1a2230),
          at(box(1.3,.1,.06, 0x47536a), -6.4, 8.3, -13.78)), 'shock');
  const ch = grp(wall(-3.4, 8.1, 2.2, 2.6, 0x1e2218));
  ch.rotation.z = .03;
  reg(ch, 'chart');

  reg(grp(at(box(.3, 9, 7, 0x0c1116), 16.5, 5.2, -5),
          at(box(.36, 2.4, 2.0, 0x16303a), 16.3, 7.2, -5)), 'door');

  // 수혈 스탠드 — 여기에 주머니를 단다
  lineMesh = at(cyl(.05,.05,3.2, 0x7a1f28), -6.6, 3.2, -7.2);
  lineMesh.visible = false;
  reg(grp(at(cyl(.12,.12,6.4, 0x8a95a3), -6.6, 3.2, -7.2),
          at(cyl(.5,.5,.14, 0x263040), -6.6, .1, -7.2),
          at(box(.5,.14,.5, 0x8a95a3), -6.6, 6.3, -7.0), lineMesh), 'line');

  // 환자 — 이 방의 시계
  const head = at(cyl(.52,.52,.48, 0xc9a07c, 20), -5.0, .58, -6.0);
  head.rotation.z = Math.PI/2;
  const body = at(box(2.8, .95, 1.4, 0x9aa6b4), -3.1, .5, -6.0);
  const legs = at(box(2.4, .7, 1.1, 0x2e3340), -.5, .4, -6.0);
  const pool = at(cyl(1.6,1.6,.06, 0x5a1a1c, 12), -2.0, .06, -4.6);
  patientSkin = [head.material];
  reg(grp(head, body, legs, pool), 'patient');
}

function paint3d(st){
  for (const key of Object.keys(dotMesh)){
    const seen = S.tested[key], d = dotMesh[key];
    d.visible = !!seen;
    if (!seen) continue;
    // 뭉치면 알갱이, 아니면 매끈한 면 — 결과가 방에 남는다
    const clumped = seen === C.CLUMP;
    d.material.color.setHex(clumped ? 0x7a1f28 : 0xc0493d);
    d.scale.set(clumped ? .55 : 1, 1, clumped ? .55 : 1);
  }
  if (crossTube){
    const r = S.crossed[S.selBag];
    crossTube.visible = !!r;
    if (r) crossTube.material.color.setHex(r === C.CLUMP ? 0x7a1f28 : 0xc0493d);
  }
  if (lineMesh) lineMesh.visible = S.units > 0;
  patientSkin.forEach(m => m.color.setHex([0xc9a07c, 0xd8c0a8, 0xe0d2c4, 0x9aa6b4][st]));
}
function tick(t){ if (warmLamp) warmLamp.material.color.setHex(
  Math.sin(t / 500) > 0 ? 0xd8a634 : 0x6b5520); }

// --- 사물별 화면 ----------------------------------------------------------
const read = (owner) => KEYS.filter(k => S.tested[owner+':'+k]).length
  ? `<div class="doc">${KEYS.map(k => `${C.REAGENTS[k].name} — <span class="${
      S.tested[owner+':'+k] === C.CLUMP ? 'warn' : 'dim'}">${
      S.tested[owner+':'+k] || '아직'}</span>`).join('<br>')}</div>`
  : '';

const VIEW = {
patient(){
  const st = stage(), left = C.UNITS_NEEDED - S.units;
  return `<h2>환자</h2>
  <div class="doc">${C.STAGES[st]}</div>
  ${S.units ? `<div class="note">${S.units}단위 들어갔다. ${left > 0 ? `${left}단위 더.` : ''}</div>` : ''}`;
},
radio(){
  return `<h2>무전기</h2>
  <div class="note">바깥 혈액원. 남은 호출 <b>${S.hintsLeft}</b>회 — 묻는 동안 환자가 더 샌다.</div>
  ${S.hintShown.map(t => `<div class="doc">“${t}”</div>`).join('')}
  <div class="row">
    <button class="go" id="hint" ${S.hintsLeft ? '' : 'disabled'}>
      ${S.hintsLeft ? '묻는다' : '더는 못 묻는다'}</button></div>`;
},
slide(){
  return `<h2>판정 유리판</h2>
  <div class="note">환자 피 한 방울씩이 세 자리에 놓여 있다.</div>
  ${read('slide')}`;
},
bags(){
  const b = S.selBag;
  return `<h2>주머니 ${b}</h2>
  <div class="note">라벨이 떨어졌다.</div>
  ${read(b)}
  ${S.crossed[b] ? `<div class="doc">교차시험 — <span class="${
    S.crossed[b] === C.CLUMP ? 'bad' : 'ok'}">${S.crossed[b]}</span></div>`
    : `<div class="row"><button class="go" id="cross">환자 혈청과 섞어 본다</button></div>`}`;
},
cross(){
  const done = Object.keys(S.crossed);
  return `<h2>교차시험대</h2>
  ${done.length ? done.map(b => `<div class="doc">주머니 ${b} — <span class="${
    S.crossed[b] === C.CLUMP ? 'bad' : 'ok'}">${S.crossed[b]}</span></div>`).join('')
    : `<div class="note dim">아직 섞어 본 것이 없다. 주머니를 눌러서 시작한다.</div>`}`;
},
chart(){
  return `<h2>환자 기록</h2>
  <div class="paper">외상 · 대량 출혈
  수혈력  ${C.PATIENT.transfused ? '지난해 1회' : '없음'}
  혈액형  (지워져 있다)</div>`;
},
poster(){
  return `<h2>수혈 지침</h2>
  <div class="doc"><b>처음 ${C.RECIPE.slowMin}분</b>은 한 방울씩 천천히 — 이상반응은 그때 나온다</div>
  <div class="doc"><b>수혈력이 있으면 Rh까지 맞춘다.</b> 식염수 교차시험은 Rh 항체를 못 잡는다</div>`;
},
shock(){
  return `<h2>쇼크 평가표</h2>
  <div class="paper">맥 빠름 · 손끝 차다 · 말은 한다
  → 농축적혈구 <span class="big warn">${C.RECIPE.units}</span> 단위</div>`;
},
warmer(){
  return `<h2>가온기</h2>
  <div class="doc">다이얼이 <b class="big warn">${C.RECIPE.warmC}</b> °C에 맞춰져 있다.</div>`;
},
fridge(){
  return `<h2>혈액 냉장고</h2>
  <div class="doc">문에 붙은 스티커 — <span class="mono">${C.RECIPE.keepC} °C</span></div>`;
},
line(){
  return `<h2>수혈 세트</h2>
  ${S.units ? `<div class="note">${S.units}단위 들어갔다.</div>` : ''}
  <div class="paper">주머니 <select id="bg" aria-label="주머니">${opts()}</select>
  가온 <input id="wt" inputmode="numeric" aria-label="가온 온도 (°C)"> °C
  <label><input type="checkbox" id="sl">처음은 천천히 떨어뜨린다</label></div>
  <div class="row"><button class="go" id="hang">단다</button></div>`;
},
door(){
  return `<h2>응급실 문</h2><div class="note">바깥에서 잠겼다. 봉쇄 중이다.</div>`;
},
};
const opts = () => '<option value="">—</option>' +
  Object.keys(C.BAGS).map(b => `<option>${b}</option>`).join('');

// --- 힌트 -----------------------------------------------------------------
const HINTS = {
  s1:['선반의 항혈청을 집어서 유리판의 환자 피에 끌어다 놓을 수 있다. 셋 다 써라.',
      '뭉치면 그 항원이 있는 것이다. 항D가 안 뭉치면 Rh 음성이다.'],
  s2:['주머니에도 같은 항혈청을 떨어뜨릴 수 있다. 라벨이 없으니 그게 유일한 이름표다.',
      '환자와 같은 자리에서 뭉쳐야 넣을 수 있다. 항D 자리는 특히 그렇다.'],
  s3:['주머니를 눌러 환자 혈청과 섞어 봐라. 뭉치면 못 넣는다.',
      '교차시험을 통과해도 끝이 아니다. 벽의 지침 둘째 줄을 읽어라.'],
  s4:['찬 피를 그대로 넣으면 안 된다. 가온기 다이얼이 답을 들고 있다.',
      '너무 올리면 적혈구가 깨진다. 다이얼 눈금 그대로 맞춰라.'],
  s5:['처음은 천천히 떨어뜨려야 이상반응을 알아챈다.',
      `${C.RECIPE.units}단위를 넣어야 맥이 돌아온다.`],
};
function stuckAt(){
  if (KEYS.filter(k => S.tested['slide:'+k]).length < 3) return 's1';
  const typed = Object.keys(C.BAGS).filter(b => KEYS.some(k => S.tested[b+':'+k])).length;
  if (!typed) return 's2';
  if (!Object.keys(S.crossed).length) return 's3';
  if (!S.seenNumbers) return 's4';
  return 's5';
}
function nextHint(){
  const k = stuckAt(), t = S.hintTier[k] || 0;
  return HINTS[k][Math.min(t, HINTS[k].length - 1)];
}

// --- 대사 -----------------------------------------------------------------
const INTRO = [
  {t:'응급실. 바닥에 피가 고였다.', pic:0},
  {t:'트럭이 넘어졌다. 안에 있던 사람이 여기까지 왔다.'},
  {who:'환자', t:'…추워요… 손이…'},
  {t:'혈액 냉장고에 주머니가 넷 남았는데, 라벨이 다 떨어져 있다.'},
  {t:'환자 혈액형도 기록에서 지워졌다.'},
];
const STAGE_LINES = {
  1:[{who:'환자', t:'…목말라요…', pic:1},
     {t:'손끝이 차고 축축하다.'}],
  2:[{t:'숨이 얕다. 불러야 겨우 눈을 뜬다.', pic:2},
     {who:'환자', t:'………'}],
  3:[{t:'맥이 잡히지 않는다.', pic:3}],
};

// --- 동작 -----------------------------------------------------------------
function drop(target, reagent){
  if (S.over) return;
  const key = target + ':' + reagent;
  if (target !== 'slide') S.selBag = target;
  if (S.tested[key]) { S.msg = '이미 떨어뜨렸다.'; return; }
  spend(C.COST.type);
  const who = target === 'slide' ? C.PATIENT : C.BAGS[target];
  S.tested[key] = C.typeTest(who, reagent);
  S.msg = `${target === 'slide' ? '환자 피' : '주머니 ' + target}에 ${
    C.REAGENTS[reagent].name} — ${S.tested[key]}`;
}

function act(id){
  if (id === 'cross'){
    spend(C.COST.cross);
    S.crossed[S.selBag] = C.crossmatch(C.BAGS[S.selBag]).sees;
    S.msg = `주머니 ${S.selBag}을 환자 혈청과 섞었다 — ${S.crossed[S.selBag]}`;
  }
  else if (id === 'hang'){
    const bag = $('bg').value, warmC = +$('wt').value, slow = $('sl').checked;
    if (!bag)             { S.msg = '어느 주머니를 달지 정하지 않았다.'; draw(); return; }
    if (!($('wt').value)) { S.msg = '가온 온도를 넣지 않았다.'; draw(); return; }
    spend(C.COST.warm + C.COST.unit);
    const r = C.transfuse({bag, warmC, slow});
    if (r.outcome === 'ok'){
      S.units++;
      if (S.units >= C.UNITS_NEEDED){
        finish(true, `${C.UNITS_NEEDED}단위가 다 들어갔다. 손끝에 온기가 돌고 맥이 잡힌다.`);
        return;
      }
      S.msg = `${r.sees} ${C.UNITS_NEEDED - S.units}단위 더.`;
    } else if (r.outcome !== 'ok' && slow && !S.warned && (r.outcome === 'rh' || r.outcome === 'abo')){
      // 천천히 달면 오한에서 멈출 기회가 있다. 어디가 틀렸는지는 알려주지 않는다.
      S.warned = true;
      spend(C.COST.reaction);          // 멈춰도 환자는 그만큼 깎인다
      S.msg = `${r.sees} 바늘을 뺐다. 지금 멈추면 아직 늦지 않았다.`;
    } else {
      finish(false, r.sees,
        r.outcome === 'rh'   ? '교차시험은 Rh 항체를 못 잡는다. 수혈력이 있는 환자였다.'
      : r.outcome === 'abo'  ? '교차시험에서 이미 뭉쳤던 주머니였다.'
      : r.outcome === 'cold' ? '찬 피를 그대로 넣었다. 가온기 다이얼이 답이었다.'
                             : '너무 뜨겁게 데웠다. 42 °C를 넘기면 적혈구가 깨진다.');
      return;
    }
  }
  draw();
}

window.ROOM = {
  id:'blood', title:'응급실', chem:C, next:'bleach',
  name:'수혈', situation:'사고로 대량 출혈',
  state: () => ({tested:{}, crossed:{}, selBag:'A', units:0,
                 warned:false, seenNumbers:false}),
  build, paint3d, tick, VIEW, HINTS, stuckAt, nextHint, INTRO, STAGE_LINES,
  drop, act,
  onSelect: ud => { if (ud.drop && C.BAGS[ud.drop]) S.selBag = ud.drop;
                    if (['poster','shock','warmer','fridge','chart'].includes(ud.o))
                      S.seenNumbers = true; },
  DEATH: '맥이 잡히지 않는다. 더 넣을 시간이 없었다.',
  DEATH_WHY: '행동 하나하나가 시간이었다. 항D로 후보를 먼저 좁혔다면 교차시험을 두 번만 해도 됐다.',
  WIN_WORD: '맥박',
  WIN_NOTE: `항A·항B·항D 한 방울로 혈액형을 읽는 건 실제 슬라이드 판정 그대로다.
    교차시험(식염수법)은 ABO 부적합만 잡는다 — Rh 항체는 못 잡는다.
    그래서 수혈력이 있는 Rh 음성 환자에게는 교차시험을 통과한 Rh 양성 피도 위험하다.
    가온은 ${C.RECIPE.warmC} °C까지, ${C.WARM.hi} °C를 넘기면 적혈구가 깨진다.
    처음 ${C.RECIPE.slowMin}분을 천천히 떨어뜨리는 이유도 하나다 — 이상반응이 그때 나온다.`,
};
})();
