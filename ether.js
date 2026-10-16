// 방 8 — 마취. 오래된 에터에는 과산화물이 생긴다.
// 화학 값은 전부 문헌값이다. 노드(자체점검)와 브라우저 양쪽에서 돈다.

// 다이에틸에터 — 끓는점이 체온보다 낮다. 손에 쥐면 끓는다.
const ETHER = {name:'다이에틸에터', formula:'C4H10O', bp:34.6, d:0.713};
const CHLOROFORM = {name:'클로로폼', bp:61.2};
const ACETONE = {name:'아세톤', bp:56.1};

// 찢긴 마취 기록이 가리키는 조건.
const RECIPE = {aluminaG:20, cutC:35, leaveMl:10, anesPct:5};
const BOTTLE_ML = 500;           // 두 번 할 분량
const BATCH_ML = 200;
// 에터 마취 — 유지 농도 3~5%. 더 올리면 호흡이 멎는다.
const ANES = {lo:3, hi:7};
const CUT = {lo:30, hi:45};      // 끓는점 34.6 °C 둘레
// 바닥까지 졸이면 과산화물만 남아 터진다. 실험실 안전수칙 1번이다.
const MIN_LEAVE_ML = 10;

// --- 자물쇠 ① 라벨 없는 갈색 병 넷 -----------------------------------------
const REAGENTS = {
  iron:   {name:'철(II)-티오시안산 시약', verb:'흔들어 섞는다'},
  copper: {name:'달군 구리선',            verb:'적셔 불에 넣는다'},
  warmth: {name:'미지근한 물중탕',        verb:'병을 담가 본다'},
  match:  {name:'성냥',                   verb:'한 방울에 불을 댄다'},
};
// 철(II)이 과산화물에 산화돼 티오시안산과 붉은색을 낸다 — 과산화물 검출의 표준이다.
// 구리선 초록 불꽃은 할로젠(바일슈타인 시험).
// 끓는점이 체온 아래인 건 에터뿐이라, 미지근한 물에서 그것만 끓는다.
const BOTTLES = {
  A:{what:'오래된 에터', hits:{iron:'핏빛 붉은색이 돈다',
                               warmth:'담그자마자 보글보글 끓는다',
                               match:'확 타오른다'}},
  B:{what:'클로로폼',    hits:{copper:'불꽃이 초록으로 물든다'}},
  C:{what:'아세톤',      hits:{match:'파랗게 탄다'}},
  D:{what:'물',          hits:{}},
};
const spotTest = (bottle, reagent) =>
  (BOTTLES[bottle].hits[reagent]) || '아무 일도 일어나지 않는다';
const ETHER_BOTTLE = Object.keys(BOTTLES).find(b => BOTTLES[b].what === '오래된 에터');

// --- 자물쇠 ③ 정제 --------------------------------------------------------
// 활성 알루미나에 과산화물이 걸린다. 실험실에서 실제로 쓰는 방법이다.
const column = (ml, aluminaG) => ({ml, peroxide:aluminaG < RECIPE.aluminaG,
  sees:aluminaG < RECIPE.aluminaG
    ? '통과는 했지만 알루미나가 금세 젖었다. 양이 모자랐다.'
    : '맑은 액이 천천히 떨어진다.'});

function distill({feed, cutC, leaveMl}) {
  if (!feed) return {outcome:'empty', sees:'플라스크가 비어 있다.'};
  // 과산화물이 든 채로 졸이면 그것만 남아 농축된다. 그게 터진다.
  if (feed.peroxide && leaveMl < MIN_LEAVE_ML)
    return {outcome:'boom', sees:'바닥에 노란 기름이 얇게 남더니, 소리 없이 번쩍했다.'};
  if (leaveMl < MIN_LEAVE_ML)
    return {outcome:'dry', sees:'바닥이 말랐다. 플라스크가 갈라졌다.'};
  if (cutC < CUT.lo || cutC > CUT.hi)
    return {outcome:'misscut', ml:0, peroxide:feed.peroxide,
            sees:cutC < CUT.lo ? '아무것도 넘어오지 않는다.'
                               : '넘어오긴 하는데 받이에 거의 안 고인다.'};
  return {outcome:'ok', ml:feed.ml - leaveMl, peroxide:feed.peroxide,
          sees:'받이에 맑은 액이 고인다. 손이 시리다.'};
}
// ①에서 쓴 철 시약이 ④에서 다시 나온다 — 이번엔 "내가 거른 것이 아직 붉은가"다
const ironOn = p => p && p.peroxide
  ? '다시 붉은색이 돈다. 과산화물이 남았다.'
  : '색이 돌지 않는다.';
// 마취기 다이얼. 재우는 건 농도지 양이 아니다.
function anesthetize({product, pct}){
  if (!product) return 'empty';
  if (product.peroxide) return 'peroxide';
  if (pct < ANES.lo) return 'light';
  if (pct > ANES.hi) return 'deep';
  return 'ok';
}

// --- 시계 — 터지기 직전의 충수염. 방 7에서 이어진다 --------------------------
const BUDGET = 76;
const COST = {look:0, test:2, column:8, distill:12, iron:2, anes:6, hint:8};
const STAGES = [
  '소년이 배를 안고 있다. 기구는 쟁반에 준비됐다.',
  '열이 오른다. 배가 더 단단하다.',
  '토한다. 맥이 빠르다. 눈을 겨우 뜬다.',
  '배 전체가 굳었다. 의식이 없다.',
];
const STAGE_AT = [0, 28, 50, 74];
const stageOf = spent => STAGE_AT.reduce((n, at) => spent >= at ? n + 1 : n, 0) - 1;

const API = {ETHER, CHLOROFORM, ACETONE, RECIPE, BOTTLE_ML, BATCH_ML, ANES, CUT,
             MIN_LEAVE_ML, REAGENTS, BOTTLES, ETHER_BOTTLE, spotTest, column, distill,
             ironOn, anesthetize, BUDGET, COST, STAGES, STAGE_AT, stageOf};
if (typeof module !== 'undefined') module.exports = API;
if (typeof window !== 'undefined') window.ETHER_ROOM = API;

// --- 자체 점검 ------------------------------------------------------------
if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert');
  const ok = (c, m) => assert.ok(c, m);

  ok(ETHER.bp < 37, `에터 끓는점 ${ETHER.bp} °C는 체온보다 낮다 — 미지근한 물에서 끓는다`);
  ok(ACETONE.bp > 37 && CHLOROFORM.bp > 37, '나머지는 물중탕에서 안 끓는다');
  ok(CUT.lo < ETHER.bp && ETHER.bp < CUT.hi, '받는 구간이 끓는점을 감싼다');

  // ① 도구 하나로는 안 갈라진다
  const burns = Object.keys(BOTTLES).filter(b => spotTest(b, 'match') !== '아무 일도 일어나지 않는다');
  assert.deepStrictEqual(burns, ['A', 'C'], '타는 것이 둘이라 성냥만으로는 못 가른다');
  const boils = Object.keys(BOTTLES).filter(b => spotTest(b, 'warmth').includes('끓는다'));
  assert.deepStrictEqual(boils, ['A'], '미지근한 물에서 끓는 건 에터뿐이다');
  const green = Object.keys(BOTTLES).filter(b => spotTest(b, 'copper').includes('초록'));
  assert.deepStrictEqual(green, ['B'], '초록 불꽃은 할로젠이다');
  const red = Object.keys(BOTTLES).filter(b => spotTest(b, 'iron').includes('붉은'));
  assert.deepStrictEqual(red, ['A'], '붉은색은 과산화물 — 오래된 에터만 낸다');
  const sig = b => Object.keys(REAGENTS).map(r => spotTest(b, r)).join('|');
  assert.strictEqual(new Set(Object.keys(BOTTLES).map(sig)).size, 4, '네 병이 서로 달라야 한다');

  // ③ 알루미나를 지침대로 쓰면 과산화물이 걸린다
  const clean = column(BATCH_ML, RECIPE.aluminaG);
  assert.strictEqual(clean.peroxide, false);
  assert.strictEqual(column(BATCH_ML, 5).peroxide, true, '알루미나가 모자라면 그대로 남는다');

  // 걸러 낸 뒤 지침대로 증류하면 받이에 고인다
  const good = distill({feed:clean, cutC:RECIPE.cutC, leaveMl:RECIPE.leaveMl});
  assert.strictEqual(good.outcome, 'ok');
  ok(ironOn(good).includes('돌지 않는다'), '④ 철 시약 음성');
  assert.strictEqual(anesthetize({product:good, pct:RECIPE.anesPct}), 'ok');

  // 안 거르고 바닥까지 졸이면 터진다 — 이 방에서 가장 오래된 안전수칙
  const dirty = column(BATCH_ML, 0);
  assert.strictEqual(distill({feed:dirty, cutC:RECIPE.cutC, leaveMl:0}).outcome, 'boom');
  assert.strictEqual(distill({feed:clean, cutC:RECIPE.cutC, leaveMl:0}).outcome, 'dry');
  // 안 거르고 조심해서 증류하면 터지지는 않지만 과산화물이 따라온다 — 막다른 길이 아니다
  const still = distill({feed:dirty, cutC:RECIPE.cutC, leaveMl:RECIPE.leaveMl});
  assert.strictEqual(still.outcome, 'ok');
  ok(ironOn(still).includes('붉은색'), '④ 철 시약 양성 — ①의 붉은색이 다시 나온다');
  assert.strictEqual(anesthetize({product:still, pct:RECIPE.anesPct}), 'peroxide');

  // 받는 온도가 어긋나면 받이가 빈다
  for (const t of [20, 60])
    assert.strictEqual(distill({feed:clean, cutC:t, leaveMl:RECIPE.leaveMl}).outcome, 'misscut');

  // 다이얼 — 얕으면 못 재우고 깊으면 숨이 멎는다
  assert.strictEqual(anesthetize({product:good, pct:1}), 'light');
  assert.strictEqual(anesthetize({product:good, pct:12}), 'deep');
  ok(ANES.lo <= RECIPE.anesPct && RECIPE.anesPct <= ANES.hi, '지침 농도가 안전 범위 안에 있다');
  ok(BOTTLE_ML >= BATCH_ML * 2, '두 번 할 분량은 있어야 한다');
  ok(good.ml > 0, '받은 양이 남는다');

  // 시간 예산
  const best = COST.test*8 + COST.column + COST.distill + COST.iron + COST.anes;
  const retry = COST.column + COST.distill + COST.iron;
  ok(best < STAGE_AT[3], `최적 경로 ${best}틱 < 사망 ${STAGE_AT[3]}틱`);
  ok(best + COST.hint*3 < STAGE_AT[3], `힌트 3회 다 써도(${best + COST.hint*3}틱) 살린다`);
  ok(best + retry < STAGE_AT[3], '한 번 다시 해도 살릴 수 있다');
  ok(best + retry*2 >= STAGE_AT[3], '두 번 망치면 못 살린다');
  assert.strictEqual(COST.look, 0, '읽고 보는 건 공짜여야 한다');

  console.log('ether self-check OK');
  console.log(`  에터 ${ETHER.formula} bp ${ETHER.bp} °C · 받는 구간 ${CUT.lo}~${CUT.hi} °C`);
  console.log(`  알루미나 ${RECIPE.aluminaG} g · 바닥에 ${RECIPE.leaveMl} mL · 다이얼 ${RECIPE.anesPct}% (${ANES.lo}~${ANES.hi})`);
  for (const b of Object.keys(BOTTLES))
    console.log(`  ${b} ${BOTTLES[b].what.padEnd(9)} ${Object.keys(REAGENTS)
      .filter(r => spotTest(b, r) !== '아무 일도 일어나지 않는다')
      .map(r => REAGENTS[r].name).join(' + ') || '—'}`);
  console.log(`  시간: 최적 ${best}틱 / 재시도 +${retry}틱 / 예산 ${BUDGET}틱`);
}
