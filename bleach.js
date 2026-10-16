// 방 7 — 수술 전 소독액. 오래된 표백제의 유효염소를 적정으로 잰다.
// 화학 값은 전부 문헌값이다. 노드(자체점검)와 브라우저 양쪽에서 돈다.

// 아이오딘 적정 — 차아염소산염이 요오드화칼륨에서 요오드를 밀어내고(갈색),
// 그 요오드를 티오황산나트륨으로 되돌린다. 끝은 색으로만 안다.
// 0.1 N 티오황산 1 mL = 유효염소 3.545 mg. 약전 환산값 그대로다.
const CL_PER_ML = 3.545;
const NORMALITY = 0.1;
const RECIPE = {sampleMl:2, kiG:2, acidMl:5, targetPct:0.5};
// 오래된 통. 라벨은 5%지만 빛과 더위에 반이 넘게 날아갔다.
const STOCK_PCT = 2.0;
const STOCK_CUPS = 2;            // 원액 두 컵 — 고쳐 탈 기회가 한 번뿐이다
// WHO: 기구·표면 소독은 0.5%(5000 ppm), 접촉 10분.
const SOAK_MIN = 10;
const SAFE_PCT = {lo:0.4, hi:0.6};

// --- 자물쇠 ① 라벨 없는 통 넷 ----------------------------------------------
const REAGENTS = {
  strip:{name:'요오드화칼륨 전분지', verb:'적셔 본다'},
  mno2: {name:'이산화망간',         verb:'한 숟갈 넣는다'},
  flame:{name:'불꽃',               verb:'성냥을 가까이 댄다'},
};
// 전분지는 산화제 둘을 다 집는다. 이산화망간이 그 둘을 가른다 —
// 과산화수소만 산소를 뿜는다(상처에 닿으면 거품이 이는 그 반응이다).
const JUGS = {
  A:{what:'알코올',    hits:{flame:'파란 불꽃이 붙는다'}},
  B:{what:'표백제',    hits:{strip:'대자마자 짙은 남색이 번진다'}},
  C:{what:'과산화수소', hits:{strip:'천천히 남색이 돈다',
                             mno2:'거품이 끓어오른다'}},
  D:{what:'식염수',    hits:{}},
};
const spotTest = (jug, reagent) =>
  (JUGS[jug].hits[reagent]) || '아무 일도 일어나지 않는다';
const BLEACH_JUG = Object.keys(JUGS).find(j => JUGS[j].what === '표백제');

// --- 자물쇠 ③ 적정 --------------------------------------------------------
// 녹말은 종말점 가까이에서 넣는다. 처음부터 넣으면 요오드가 녹말에 갇혀
// 색이 질질 끌리고 끝이 어디인지 알 수 없게 된다. 실제로 그렇다.
function titrate({jug, sampleMl, kiG, acidMl, starchEarly}) {
  if (jug !== BLEACH_JUG)
    return {outcome:'nocolor', ml:0,
            sees:'요오드화칼륨을 넣어도 갈색이 돌지 않는다. 적정할 것이 없다.'};
  if (!(kiG > 0))
    return {outcome:'noki', ml:0, sees:'아무 색도 나오지 않는다.'};
  if (!(acidMl > 0))
    return {outcome:'noacid', ml:0, sees:'색이 더디게 돈다. 끝까지 가지 않는다.'};
  if (!(sampleMl > 0))
    return {outcome:'nosample', ml:0, sees:'플라스크가 비어 있다.'};
  if (starchEarly)
    return {outcome:'smeared', ml:0,
            sees:'처음부터 남색이 짙다. 한 방울씩 떨어뜨려도 어디가 끝인지 모르겠다.'};
  // 뷰렛 눈금은 시료 양에 그대로 따라간다. 지침과 다른 양을 쓰면 환산표에 없는 눈금이 나온다.
  const mgCl = STOCK_PCT * 10 * sampleMl;
  return {outcome:'ok', ml:mgCl / CL_PER_ML,
          sees:'갈색이 옅어진 뒤 녹말을 넣자 남색이 되고, 한 방울에 색이 사라진다.'};
}
// 벽의 환산표 — 플레이어는 눈금을 읽어 표에서 찾는다. 곱하지 않는다.
const TABLE_ML = [5.6, 11.3, 16.9, 28.2];
const pctOf = ml => ml * CL_PER_ML / (RECIPE.sampleMl * 10);
const inTable = ml => TABLE_ML.some(t => Math.abs(t - ml) < 0.3);
// 희석표 — 원액 한 컵에 물 몇 컵. 비례식이 아니라 표다.
const CUPS_FOR = pct => Math.round(pct / RECIPE.targetPct) - 1;
const diluteTo = (pct, cups) => pct / (1 + cups);
// ①에서 쓴 전분지가 ④에서 다시 나온다.
// 너무 진하면 요오드가 더 산화돼 색이 도로 바랜다 — 실제 현상이고, 그게 눈금이 된다.
function stripOn(pct){
  if (!(pct > 0)) return {band:'none',  label:'아무 색도 안 난다'};
  if (pct < SAFE_PCT.lo) return {band:'weak', label:'연한 남색에서 멈춘다'};
  if (pct > SAFE_PCT.hi) return {band:'over', label:'남색이 돌다가 하얗게 바랜다'};
  return {band:'ok', label:'짙은 남색 — 색표의 0.5% 칸'};
}
const soakCheck = pct => !(pct > 0) ? 'empty' : stripOn(pct).band === 'ok' ? 'ok'
                                              : stripOn(pct).band;

// --- 시계 — 충수염은 터지기 전까지 조용하다 ---------------------------------
const BUDGET = 70;
const COST = {look:0, test:2, titrate:12, mix:4, strip:2, soak:8, hint:8};
const STAGES = [
  '오른쪽 아랫배를 누르면 아파한다. 열이 조금 있다.',
  '배가 단단하다. 손을 떼면 더 아프다고 한다.',
  '토한다. 맥이 빠르고 열이 높다.',
  '배 전체가 굳었다. 의식이 흐리다.',
];
const STAGE_AT = [0, 26, 48, 68];
const stageOf = spent => STAGE_AT.reduce((n, at) => spent >= at ? n + 1 : n, 0) - 1;

const API = {CL_PER_ML, NORMALITY, RECIPE, STOCK_PCT, STOCK_CUPS, SOAK_MIN, SAFE_PCT,
             REAGENTS, JUGS, BLEACH_JUG, spotTest, titrate, TABLE_ML, pctOf, inTable,
             CUPS_FOR, diluteTo, stripOn, soakCheck,
             BUDGET, COST, STAGES, STAGE_AT, stageOf};
if (typeof module !== 'undefined') module.exports = API;
if (typeof window !== 'undefined') window.BLEACH = API;

// --- 자체 점검 ------------------------------------------------------------
if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert');
  const ok = (c, m) => assert.ok(c, m);

  // ① 전분지 하나로는 안 갈라진다
  const st = Object.keys(JUGS).filter(j => spotTest(j, 'strip').includes('남색'));
  assert.deepStrictEqual(st, ['B', 'C'], '산화제가 둘이라 전분지만으로는 못 가른다');
  const mn = Object.keys(JUGS).filter(j => spotTest(j, 'mno2').includes('거품'));
  assert.deepStrictEqual(mn, ['C'], '거품은 과산화수소만 낸다');
  const sig = j => Object.keys(REAGENTS).map(r => spotTest(j, r)).join('|');
  assert.strictEqual(new Set(Object.keys(JUGS).map(sig)).size, 4, '네 통이 서로 달라야 한다');

  // ③ 지침대로 적정하면 환산표에 있는 눈금이 나온다
  const good = titrate({jug:BLEACH_JUG, ...RECIPE, starchEarly:false});
  assert.strictEqual(good.outcome, 'ok');
  ok(inTable(good.ml), `눈금 ${good.ml.toFixed(1)} mL는 환산표에 있다`);
  ok(Math.abs(pctOf(good.ml) - STOCK_PCT) < 0.05,
     `${good.ml.toFixed(1)} mL → ${pctOf(good.ml).toFixed(1)}% (문헌 환산 ${CL_PER_ML} mg/mL)`);

  // 시료 양이 다르면 표에서 엉뚱한 줄을 읽게 된다 — 그리고 ④의 전분지가 그걸 잡는다
  const half = titrate({jug:BLEACH_JUG, ...RECIPE, sampleMl:1, starchEarly:false});
  ok(Math.abs(pctOf(half.ml) - STOCK_PCT / 2) < 0.05,
     `시료 1 mL는 표에서 ${pctOf(half.ml).toFixed(1)}%로 읽힌다 — 실제의 절반이다`);
  assert.strictEqual(stripOn(diluteTo(STOCK_PCT, CUPS_FOR(pctOf(half.ml)))).band, 'over',
    '절반으로 읽고 희석하면 진하게 나오고, 전분지가 바래면서 알려준다');

  // 틀리는 길마다 보이는 것이 다르다
  for (const [chg, out] of [
      [{starchEarly:true}, 'smeared'],
      [{kiG:0},            'noki'],
      [{acidMl:0},         'noacid'],
      [{jug:'C'},          'nocolor']])
    assert.strictEqual(
      titrate({jug:BLEACH_JUG, ...RECIPE, starchEarly:false, ...chg}).outcome, out,
      `${JSON.stringify(chg)} → ${out}`);

  // ④ 희석표대로 타면 0.5% 칸에 들어온다
  const cups = CUPS_FOR(STOCK_PCT);
  assert.strictEqual(cups, 3, '2.0% 원액은 한 컵에 물 세 컵이다');
  const made = diluteTo(STOCK_PCT, cups);
  ok(Math.abs(made - RECIPE.targetPct) < 1e-9, `${made}% = 목표 ${RECIPE.targetPct}%`);
  assert.strictEqual(stripOn(made).band, 'ok');
  assert.strictEqual(soakCheck(made), 'ok');

  // 묽으면 소독이 안 되고, 진하면 전분지가 도로 바랜다
  assert.strictEqual(stripOn(diluteTo(STOCK_PCT, 7)).band, 'weak');
  assert.strictEqual(stripOn(diluteTo(STOCK_PCT, 1)).band, 'over');
  assert.strictEqual(stripOn(STOCK_PCT).band, 'over', '원액 그대로는 진하다');
  ok(STOCK_CUPS >= 2, '희석 두 번 분량은 있어야 한다 — 막다른 길을 만들지 않는다');

  // 시간 예산
  const best = COST.test*6 + COST.titrate + COST.mix + COST.strip + COST.soak;
  const retry = COST.titrate + COST.mix + COST.strip;
  ok(best < STAGE_AT[3], `최적 경로 ${best}틱 < 사망 ${STAGE_AT[3]}틱`);
  ok(best + COST.hint*3 < STAGE_AT[3], `힌트 3회 다 써도(${best + COST.hint*3}틱) 살린다`);
  ok(best + COST.mix + COST.strip < STAGE_AT[3], '희석을 한 번 다시 해도 살린다');
  ok(best + retry*2 >= STAGE_AT[3], '두 번 망치면 못 살린다');
  ok(COST.titrate > COST.test * Object.keys(REAGENTS).length,
     '통을 하나씩 적정해 보는 것보다 시약으로 찍는 쪽이 싸야 한다');
  assert.strictEqual(COST.look, 0, '읽고 보는 건 공짜여야 한다');

  console.log('bleach self-check OK');
  console.log(`  0.1 N 티오황산 1 mL = 유효염소 ${CL_PER_ML} mg (약전 환산값)`);
  console.log(`  시료 ${RECIPE.sampleMl} mL → 눈금 ${good.ml.toFixed(1)} mL → 원액 ${pctOf(good.ml).toFixed(1)}%`);
  console.log(`  희석표: 원액 1컵 + 물 ${cups}컵 → ${made}% (WHO 기구 소독 ${RECIPE.targetPct}%, 접촉 ${SOAK_MIN}분)`);
  for (const j of Object.keys(JUGS))
    console.log(`  ${j} ${JUGS[j].what.padEnd(7)} ${Object.keys(REAGENTS)
      .filter(r => spotTest(j, r) !== '아무 일도 일어나지 않는다')
      .map(r => REAGENTS[r].name).join(' + ') || '—'}`);
  console.log(`  시간: 최적 ${best}틱 / 재시도 +${retry}틱 / 예산 ${BUDGET}틱`);
}
