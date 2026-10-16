// 방 5 — 메탄올 중독. 해독제는 에탄올이다.
// 화학 값은 전부 문헌값이다. 노드(자체점검)와 브라우저 양쪽에서 돈다.

// 메탄올은 몸에서 폼산으로 바뀌어 시신경을 죽인다. 에탄올이 그 길목을 먼저 차지한다 —
// 포메피졸이 없을 때의 표준 해독법이고, 술을 약으로 쓰는 몇 안 되는 경우다.
const MEOH = {name:'메탄올', bp:64.7, d:0.792};
const ETOH = {name:'에탄올', bp:78.37, d:0.789};
const ACETONE = {name:'아세톤', bp:56.1};

// 찢긴 해독 지침이 가리키는 조건.
const RECIPE = {headMl:20, cutC:78, waterCups:1, doseMl:60};
const WASH_L = 4.0;              // 밀주 통 — 2 L 배치 두 번
const BATCH_L = 2.0;
// 비중계(알코올 도수계)의 초록 칸. 너무 독하면 급성 중독, 묽으면 길목을 못 막는다.
const ABV = {target:40, lo:35, hi:45};
const CUT = {lo:74, hi:82};      // 본류. 에탄올 끓는점 78.4 °C 둘레
const HEAD_CUT_C = 70;           // 이 아래로 받으면 메탄올 유분이다

// --- 자물쇠 ① 라벨 없는 병 넷 ---------------------------------------------
// 전부 맑은 액체다. 시약 하나로는 안 갈라진다.
const REAGENTS = {
  schiff:    {name:'쉬프 시약',   verb:'달군 구리선에 묻혀 떨어뜨린다'},
  iodoform:  {name:'아이오도폼 시약', verb:'넣고 데운다'},
  dichromate:{name:'중크로뮴산 용액', verb:'한 방울 떨어뜨린다'},
};
// 쉬프는 폼알데하이드에만 자주색을 낸다 — 메탄올을 집어내는 한 가지.
// 아이오도폼은 에탄올과 아세톤 둘 다 노란 침전을 준다.
// 중크로뮴산은 알코올을 초록으로 바꾼다(음주측정기와 같은 화학). 케톤은 그대로다.
const BOTTLES = {
  A:{what:'아세톤',  hits:{iodoform:'노란 침전이 가라앉는다'}},
  B:{what:'메탄올',  hits:{schiff:'자주색이 피어오른다',
                           dichromate:'주황색이 초록으로 바뀐다'}},
  C:{what:'밀주',    hits:{iodoform:'노란 침전이 가라앉는다',
                           dichromate:'주황색이 초록으로 바뀐다'}},
  D:{what:'물',      hits:{}},
};
const spotTest = (bottle, reagent) =>
  (BOTTLES[bottle].hits[reagent]) || '아무 일도 일어나지 않는다';
const WASH_BOTTLE = Object.keys(BOTTLES).find(b => BOTTLES[b].what === '밀주');

// --- 자물쇠 ③ 증류 --------------------------------------------------------
// 메탄올이 먼저 끓어 나온다. 그래서 밀주꾼은 머리를 버린다 — 실제로 그 이유다.
function distill({source, headMl, cutC}) {
  if (source !== WASH_BOTTLE)
    return {outcome:'wrong', abv:0, methanol:BOTTLES[source].what === '메탄올',
            sees:BOTTLES[source].what === '물' ? '김만 오른다. 받을 것이 없다.'
               : '뭔가 넘어왔지만 통 안의 것이 그대로 옮겨졌을 뿐이다.'};
  if (cutC <= HEAD_CUT_C)
    return {outcome:'head', abv:60, methanol:true,
            sees:'일찍부터 받았다. 받은 액이 맑다.'};
  if (cutC > CUT.hi)
    return {outcome:'tail', abv:20, methanol:headMl < RECIPE.headMl,
            sees:'늦게까지 받았다. 물까지 따라 넘어왔다.'};
  if (cutC < CUT.lo)
    return {outcome:'early', abv:55, methanol:true,
            sees:'받은 액이 맑다. 머리와 본류가 섞였다.'};
  // 머리를 안 버리면 앞부분의 메탄올이 그대로 들어온다
  return {outcome:'ok', abv:60, methanol:headMl < RECIPE.headMl,
          sees:'본류가 고르게 떨어진다. 받은 액이 맑다.'};
}
// 벽의 희석표 — 본류 두 컵에 물 한 컵. 비례식이 아니라 표다.
const dilute = (abv, cups) => abv * 2 / (2 + cups);
const hydrometer = abv =>
  abv < ABV.lo ? {band:'low',  label:'묽다'}
: abv > ABV.hi ? {band:'high', label:'독하다'}
               : {band:'ok',   label:'초록 칸'};
// ①에서 메탄올을 집어낸 쉬프가 ④에서 다시 나온다
const schiffOn = sol => sol && sol.methanol
  ? '자주색이 피어오른다. 메탄올이 남아 있다.'
  : '색이 변하지 않는다.';
const doseCheck = sol =>
  !sol ? 'empty' : sol.methanol ? 'poison' : hydrometer(sol.abv).band === 'ok' ? 'ok'
  : hydrometer(sol.abv).band;

// --- 시계 — 메탄올 중독의 실제 경과 -----------------------------------------
const BUDGET = 64;
const COST = {look:0, test:2, distill:14, schiff:2, hydro:2, mix:3, dose:3, hint:8};
const STAGES = [
  '눈앞이 흐리다고 한다. 속이 메스껍다.',
  '눈이 안 보인다고 한다. 숨이 깊고 빨라졌다.',
  '숨소리가 거칠다. 말이 느리다.',
  '의식이 없다.',
];
const STAGE_AT = [0, 24, 44, 62];
const stageOf = spent => STAGE_AT.reduce((n, at) => spent >= at ? n + 1 : n, 0) - 1;

const API = {MEOH, ETOH, ACETONE, RECIPE, WASH_L, BATCH_L, ABV, CUT, HEAD_CUT_C,
             REAGENTS, BOTTLES, WASH_BOTTLE, spotTest, distill, dilute, hydrometer,
             schiffOn, doseCheck, BUDGET, COST, STAGES, STAGE_AT, stageOf};
if (typeof module !== 'undefined') module.exports = API;
if (typeof window !== 'undefined') window.MEOH_ROOM = API;

// --- 자체 점검 ------------------------------------------------------------
if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert');
  const ok = (c, m) => assert.ok(c, m);

  ok(MEOH.bp < ETOH.bp, '메탄올이 먼저 끓는다 — 머리를 버리는 이유다');
  ok(CUT.lo < ETOH.bp && ETOH.bp < CUT.hi, `본류가 에탄올 끓는점(${ETOH.bp} °C)을 감싼다`);
  ok(HEAD_CUT_C > MEOH.bp, '메탄올 끓는점은 머리 구간 안에 있다');

  // ① 시약 하나로는 안 갈라진다
  const iod = Object.keys(BOTTLES).filter(b => spotTest(b, 'iodoform').includes('노란'));
  assert.deepStrictEqual(iod, ['A', 'C'], '아이오도폼은 아세톤과 밀주를 둘 다 집는다');
  const dic = Object.keys(BOTTLES).filter(b => spotTest(b, 'dichromate').includes('초록'));
  assert.deepStrictEqual(dic, ['B', 'C'], '중크로뮴산은 알코올 둘을 집는다');
  const sch = Object.keys(BOTTLES).filter(b => spotTest(b, 'schiff').includes('자주'));
  assert.deepStrictEqual(sch, ['B'], '쉬프는 메탄올만 집는다');
  const sig = b => Object.keys(REAGENTS).map(r => spotTest(b, r)).join('|');
  assert.strictEqual(new Set(Object.keys(BOTTLES).map(sig)).size, 4, '네 병이 서로 달라야 한다');

  // ③ 지침대로 받으면 본류가 나오고, 물 한 컵에 초록 칸이 된다
  const good = distill({source:WASH_BOTTLE, ...RECIPE});
  assert.strictEqual(good.outcome, 'ok');
  assert.strictEqual(good.methanol, false, '머리를 버리면 메탄올이 없다');
  const cut = {...good, abv:dilute(good.abv, RECIPE.waterCups)};
  assert.strictEqual(hydrometer(cut.abv).band, 'ok', `${cut.abv.toFixed(0)}% → 초록 칸`);
  assert.strictEqual(doseCheck(cut), 'ok');

  // 머리를 안 버리면 받은 액에서 쉬프가 자주색을 낸다 — ①의 시약이 ④에서 다시
  const nohead = distill({source:WASH_BOTTLE, headMl:0, cutC:RECIPE.cutC});
  assert.strictEqual(nohead.methanol, true);
  ok(schiffOn(nohead).includes('자주색'), '④ 쉬프 양성');
  ok(schiffOn(cut).includes('변하지 않는다'), '④ 쉬프 음성');
  assert.strictEqual(doseCheck(nohead), 'poison');

  // 일찍 받으면 메탄올 유분이고, 늦게 받으면 물이 따라온다
  assert.strictEqual(distill({source:WASH_BOTTLE, headMl:20, cutC:66}).methanol, true);
  assert.strictEqual(distill({source:WASH_BOTTLE, headMl:20, cutC:95}).outcome, 'tail');
  assert.strictEqual(hydrometer(dilute(20, 1)).band, 'low', '후류는 희석하면 더 묽다');

  // 엉뚱한 병을 증류해도 밀주는 그대로 남는다 — 막다른 길이 아니다
  for (const b of ['A', 'B', 'D'])
    assert.strictEqual(distill({source:b, ...RECIPE}).outcome, 'wrong');
  assert.strictEqual(doseCheck({abv:60, methanol:true}), 'poison', '메탄올을 먹이면 끝이다');
  ok(WASH_L >= BATCH_L * 2, '증류 두 번 분량은 있어야 한다');

  // 물을 안 타면 독하고, 두 컵 타면 묽다 — 둘 다 되돌릴 수 있다
  assert.strictEqual(hydrometer(dilute(60, 0)).band, 'high');
  assert.strictEqual(hydrometer(dilute(60, 2)).band, 'low');
  assert.strictEqual(hydrometer(dilute(60, 1)).band, 'ok');

  // 시간 예산
  const best = COST.test*6 + COST.distill + COST.mix + COST.schiff + COST.hydro + COST.dose;
  const retry = COST.distill + COST.mix + COST.schiff + COST.hydro;
  ok(best < STAGE_AT[3], `최적 경로 ${best}틱 < 사망 ${STAGE_AT[3]}틱`);
  ok(best + COST.hint*3 < STAGE_AT[3], `힌트 3회 다 써도(${best + COST.hint*3}틱) 살린다`);
  ok(best + retry < STAGE_AT[3], '한 번 망쳐도 살릴 수 있다');
  ok(best + retry*2 >= STAGE_AT[3], '두 번 망치면 못 살린다');
  ok(COST.distill > COST.test * Object.keys(REAGENTS).length,
     '병을 하나씩 증류해 보는 것보다 시약으로 찍는 쪽이 싸야 한다');
  assert.strictEqual(COST.look, 0, '읽고 보는 건 공짜여야 한다');

  console.log('methanol self-check OK');
  console.log(`  메탄올 ${MEOH.bp} °C · 에탄올 ${ETOH.bp} °C · 본류 ${CUT.lo}~${CUT.hi} °C`);
  console.log(`  본류 ${good.abv}% → 물 ${RECIPE.waterCups}컵 → ${cut.abv.toFixed(0)}% (초록 칸 ${ABV.lo}~${ABV.hi}%)`);
  for (const b of Object.keys(BOTTLES))
    console.log(`  ${b} ${BOTTLES[b].what.padEnd(6)} ${Object.keys(REAGENTS)
      .filter(r => spotTest(b, r) !== '아무 일도 일어나지 않는다')
      .map(r => REAGENTS[r].name).join(' + ') || '—'}`);
  console.log(`  시간: 최적 ${best}틱 / 재시도 +${retry}틱 / 예산 ${BUDGET}틱`);
}
