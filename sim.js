// pharma-lab core sim. 노드(자체점검)와 브라우저 양쪽에서 돈다.
// 실제 치환기 상수: Hammett sigma(para), Hansch pi. 문헌값.
const SUBS = {
  H:    {label:'H',    sigma: 0.00, pi:  0.00, mr: 1.03, dmw:  0.00, hbd:0, hba:0, cost:0},
  CH3:  {label:'CH₃',  sigma:-0.17, pi:  0.56, mr: 5.65, dmw: 14.03, hbd:0, hba:0, cost:1},
  OCH3: {label:'OCH₃', sigma:-0.27, pi: -0.02, mr: 7.87, dmw: 30.03, hbd:0, hba:1, cost:2},
  OH:   {label:'OH',   sigma:-0.37, pi: -0.67, mr: 2.85, dmw: 16.00, hbd:1, hba:1, cost:1},
  NH2:  {label:'NH₂',  sigma:-0.66, pi: -1.23, mr: 5.42, dmw: 15.01, hbd:2, hba:1, cost:2},
  F:    {label:'F',    sigma: 0.06, pi:  0.14, mr: 0.92, dmw: 17.99, hbd:0, hba:0, cost:3},
  Cl:   {label:'Cl',   sigma: 0.23, pi:  0.71, mr: 6.03, dmw: 34.44, hbd:0, hba:0, cost:1},
  Br:   {label:'Br',   sigma: 0.23, pi:  0.86, mr: 8.88, dmw: 78.90, hbd:0, hba:0, cost:2},
  CF3:  {label:'CF₃',  sigma: 0.54, pi:  0.88, mr: 5.02, dmw: 68.00, hbd:0, hba:0, cost:5},
  CN:   {label:'CN',   sigma: 0.66, pi: -0.57, mr: 6.33, dmw: 25.01, hbd:0, hba:1, cost:3},
  NO2:  {label:'NO₂',  sigma: 0.78, pi: -0.28, mr: 7.36, dmw: 45.00, hbd:0, hba:2, cost:1},
  tBu:  {label:'t-Bu', sigma:-0.20, pi:  1.98, mr:19.62, dmw: 56.10, hbd:0, hba:0, cost:4},
};
const KEYS = Object.keys(SUBS);

// 리드 화합물 골격. 실제 프로젝트가 그렇듯 이미 리핀스키 한계 근처에서 출발한다.
// mw 400은 의도적이다. 분자량 상한 500까지 치환기 여유가 100밖에 없어서
// 무거운 치환기(Br 79, CF3 68, t-Bu 56)를 두 개 붙이면 바로 탈락한다.
// 실제 리드 화합물이 겪는 '분자 비만' 문제가 그대로 제약이 된다.
const SCAFFOLD = {name:'JS-114', mw:400.4, logP:3.10, hbd:2, hba:5};
const NPOS = 3;                          // 치환기 자리 R1·R2·R3 → 12^3 = 1728개
const LOGP_MID = 4.0;                    // 회귀 중심화 기준 (다중공선성 방지)
const POCKET_SIZES = [4.0, 8.5, 21.0];   // 자리별 입체 허용량(MR). 좁은/중간/열린 포켓

const ASSAY_FEE = 4;      // 합성+측정 기본료
const RETEST_FEE = 2;     // 재측정(합성 안 하고 다시 재기)
const XRAY_FEE = 15;      // X선 공동결정 구조 — 숨은 포켓 상호작용을 알려준다
const BUDGET = 150;      // 플레이테스트로 정함: 100은 전략이 숨막히고 200은 하위 전략 격차가 뭉개진다
const FLOOR = 3.0;        // pAct 측정 하한. 이 아래는 전부 '비활성'
                          // 4.0이면 진단용 치환기가 죄다 바닥을 쳐서 정보가 사라진다
const NOISE = 0.15;       // 실제 효소 assay 재현성 수준

// r = ['Cl','NO2','H'] 형태
function props(r) {
  const s = r.map(k => SUBS[k]);
  const sum = f => s.reduce((t, x) => t + x[f], 0);
  return {
    mw:   SCAFFOLD.mw   + sum('dmw'),
    logP: SCAFFOLD.logP + sum('pi'),
    hbd:  SCAFFOLD.hbd  + sum('hbd'),
    hba:  SCAFFOLD.hba  + sum('hba'),
    sigma: sum('sigma'),
    cost: ASSAY_FEE + sum('cost'),
  };
}
const label = r => r.map(k => SUBS[k].label).join('/');

// 리핀스키 5의 법칙
function lipinski(p) {
  const v = [];
  if (p.mw   > 500) v.push(`분자량 ${p.mw.toFixed(0)} > 500`);
  if (p.logP > 5)   v.push(`logP ${p.logP.toFixed(2)} > 5`);
  if (p.hbd  > 5)   v.push(`수소결합 주는자리 ${p.hbd} > 5`);
  if (p.hba  > 10)  v.push(`수소결합 받는자리 ${p.hba} > 10`);
  return {pass: v.length === 0, violations: v};
}

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// 타깃마다 결합 부위의 성질이 숨어 있다. 플레이어가 실험으로 알아내야 하는 지형.
//
//   pAct = c0
//        + Σ(자리별 소수성 기여 wpi·pi + 자리별 전자 기여 wsig·sigma)
//        - a·(logP − 최적logP)²            전체 분자 소수성 봉우리
//        - Σ(입체 충돌 벌점)                포켓보다 큰 치환기 → 활성 절벽
//        + 포켓 보너스                      X선을 사야 알 수 있는 특이 상호작용
//
// 자리 세 개가 서로 다르다는 게 핵심이다. 하나는 좁고, 하나는 전자효과에 민감하고,
// 하나는 용매에 노출돼서 뭘 붙여도 거의 영향이 없다. 전역 Hansch 식 하나로는
// 설명이 안 되고, 자리별로 따로 읽어야 한다. 실제 SAR이 이렇다.
function makeTarget(seed) {
  const r = mulberry32(seed);
  const shuffle = arr => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i+1)); [a[i],a[j]] = [a[j],a[i]]; }
    return a;
  };
  const maxMR = shuffle(POCKET_SIZES);
  // 자리별 가중치. 한 자리는 용매 노출(거의 0)로 고정 — "여긴 건드려도 소용없다"를 배우게.
  // 무효 자리가 좁은 포켓과 겹치면 한 자리가 이중으로 죽어서 퍼즐이 얕아진다
  const open = [0,1,2].filter(i => maxMR[i] > 4.0);
  const dud = open[Math.floor(r() * open.length)];
  const wpi = [], wsig = [];
  for (let i = 0; i < NPOS; i++) {
    if (i === dud) { wpi.push(r() * 0.12); wsig.push((r() - 0.5) * 0.2); }
    else { wpi.push(r() * 1.1); wsig.push((r() < 0.5 ? -1 : 1) * (0.5 + r() * 1.3)); }
  }
  let pocketSub = KEYS[1 + Math.floor(r() * (KEYS.length - 1))];
  let pocketPos = Math.floor(r() * NPOS);
  // 들어가지도 못하는 치환기를 포켓 보너스로 주면 의미가 없다
  if (SUBS[pocketSub].mr > maxMR[pocketPos]) pocketSub = 'Cl';
  return {
    seed, maxMR, wpi, wsig, dud,
    a: 0.18 + r() * 0.22,                // 2차항이 너무 세면 한 자리만 바꿔도 비활성이 된다
    optLogP: 4.4 + r() * 1.2,            // 리핀스키 상한(5)에 걸친다 — 핵심 긴장
    steric: 0.35 + r() * 0.35,           // 입체 충돌 벌점 기울기
    c0: 6.0 + r() * 0.8,
    pocket: {pos: pocketPos, sub: pocketSub, bonus: 0.5 + r() * 0.5},
  };
}

function trueActivity(t, r) {
  const p = props(r);
  let v = t.c0;
  for (let i = 0; i < NPOS; i++) {
    const s = SUBS[r[i]];
    v += t.wpi[i] * s.pi + t.wsig[i] * s.sigma;
    if (s.mr > t.maxMR[i]) v -= t.steric * (s.mr - t.maxMR[i]);   // 활성 절벽
  }
  const d = p.logP - t.optLogP;
  v -= t.a * d * d;
  if (r[t.pocket.pos] === t.pocket.sub) v += t.pocket.bonus;
  return Math.max(v, FLOOR);   // 실제 assay도 바닥을 친다: "비활성, 측정한계 이하"
}

function assay(t, r, rng) {
  // Box-Muller
  const u = Math.max(rng(), 1e-9), v = rng();
  const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return trueActivity(t, r) + g * NOISE;
}

function everyMol() {
  const out = [];
  for (const a of KEYS) for (const b of KEYS) for (const c of KEYS) out.push([a, b, c]);
  return out;
}

// 1728개뿐이므로 진짜 정답을 전수조사로 구할 수 있다. 채점 기준이 된다.
function oracle(t) {
  let bestAny = null, bestOk = null;
  for (const r of everyMol()) {
    const act = trueActivity(t, r);
    if (!bestAny || act > bestAny.act) bestAny = {r, act};
    if (lipinski(props(r)).pass && (!bestOk || act > bestOk.act)) bestOk = {r, act};
  }
  return {bestAny, bestOk};
}

// 등급 경계도 플레이테스트 기준: 감각만으로 =C/D, 체계적으로 =B, 자리별 분석 =A, 숙련 =S
function grade(regret) {
  if (regret < 0.20) return 'S';
  if (regret < 0.50) return 'A';
  if (regret < 1.00) return 'B';
  if (regret < 1.75) return 'C';
  return 'D';
}

const API = {SUBS, KEYS, SCAFFOLD, NPOS, LOGP_MID, BUDGET, ASSAY_FEE, RETEST_FEE, XRAY_FEE, NOISE, FLOOR, POCKET_SIZES,
             props, label, lipinski, mulberry32, makeTarget, trueActivity, assay,
             everyMol, oracle, grade};
if (typeof module !== 'undefined') module.exports = API;
if (typeof window !== 'undefined') window.SIM = API;

// --- 자체 점검 -------------------------------------------------------------
if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert');
  // 기획서의 아스피린 계산이 맞는지 (합성 기둥 들어올 때 쓸 화학량론)
  const mol = 2.00 / 138.12;
  assert.ok(Math.abs(mol - 0.014480) < 1e-5, 'mol 계산');
  assert.ok(Math.abs(mol * 180.16 - 2.609) < 0.01, '이론수율 2.61 g');
  // 리핀스키가 실제로 작동하는지
  assert.ok(lipinski(props(['H','H','H'])).pass, '무치환은 통과해야 함');
  assert.ok(!lipinski(props(['Br','Br','H'])).pass, 'Br/Br은 분자량 초과');
  assert.ok(!lipinski(props(['tBu','tBu','H'])).pass, 'tBu/tBu은 logP 초과');
  assert.ok(!lipinski(props(['NH2','NH2','NH2'])).pass, 'NH2 세 개는 수소결합 주는자리 초과');
  assert.strictEqual(everyMol().length, 1728, '탐색공간 12^3');
  // 같은 시드는 같은 지형
  assert.strictEqual(trueActivity(makeTarget(7),['Cl','OH','H']), trueActivity(makeTarget(7),['Cl','OH','H']));
  // 활성 최적점이 실제로 봉우리인지
  const t = makeTarget(7), o = oracle(t);
  assert.ok(o.bestAny.act > trueActivity(t,['H','H','H']), '최적이 무치환보다 활성이 높아야 함');
  // 입체 절벽이 실제로 작동하는지: 좁은 포켓에 t-Bu를 넣으면 비활성이어야 한다
  const tight = makeTarget(1).maxMR.indexOf(4.0);
  const dead = ['H','H','H']; dead[tight] = 'tBu';
  assert.ok(trueActivity(makeTarget(1), dead) <= trueActivity(makeTarget(1), ['H','H','H']),
            '좁은 포켓에 큰 치환기 → 활성이 떨어져야 함');
  console.log('self-check OK');
  console.log(`seed 7: 포켓크기 ${t.maxMR.join('/')}, 무효자리 R${t.dud+1}, 최적logP ${t.optLogP.toFixed(2)}, 포켓 R${t.pocket.pos+1}=${t.pocket.sub}`);
  console.log(`  전체 최적       ${label(o.bestAny.r)} pAct ${o.bestAny.act.toFixed(2)}`);
  console.log(`  약물성 통과 최적 ${label(o.bestOk.r)} pAct ${o.bestOk.act.toFixed(2)}`);
}
