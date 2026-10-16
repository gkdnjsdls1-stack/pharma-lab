// 방 3 — 퀴닌. 말라리아 발작.
// 화학 값은 전부 문헌값이다. 노드(자체점검)와 브라우저 양쪽에서 돈다.
const AW = {C:12.011, H:1.008, N:14.007, O:15.999};

// 뽑을 것 — 퀴닌. 400년 된 최초의 항말라리아약이고, 자외선 아래서 빛난다.
const QUININE = {name:'퀴닌', formula:'C20H24N2O2', mw:324.42, mp:177,
                 counts:{C:20, H:24, N:2, O:2}};

// 기나피 중 퀴닌은 5~8%. 중간값을 쓴다.
const BARK_YIELD = 0.07;
// 찢긴 약전이 가리키는 조건. 산성 추출 → 염기화 → 용매 추출 — 알칼로이드 추출의 교과서 순서.
// 봉지는 여기 적지 않는다 — 어느 봉지인지가 ①의 답이다.
const RECIPE = {barkG:10, acidMl:100, pH:9, tolueneMl:50};
// 봉지마다 20 g = 10 g 배치 두 번. 한 번 틀려서 영구히 막히면 함정이다.
const STOCK_G = 20;
// 톨루엔 d 0.867 — 물보다 가볍다. 노란 위층이 퀴닌을 들고 있다. 이게 ③의 답이다.
const TOLUENE_D = 0.867;
// 되뽑기 병의 눈금. 농도를 계산하지 않게 그릇이 대신 정해 준다.
const BACK_ML = 70;
// 표준 형광병 — 1 mL에 퀴닌 황산염 10 mg. ④의 자가 되는 밝기다.
const STD_MG_ML = 10;
// WHO 중증 말라리아 — 퀴닌 황산염 10 mg/kg 8시간마다. 60 kg 성인 1회분.
const DOSE_MG = 600;
// 표준병과 견준 밝기. 밝으면 신코니즘(이명·부정맥), 어두우면 발작을 못 멈춘다.
const FLUOR = {lo:0.7, hi:1.4};

// --- 자물쇠 ① 라벨 없는 약재 봉지 넷 ---------------------------------------
// 전부 실제 정성반응이다. 자외선에 빛나는 건 하나뿐이다.
const REAGENTS = {
  uv:         {name:'자외선 램프',       verb:'산에 적셔 비춘다'},
  dragendorff:{name:'드라겐도르프 시약', verb:'한 방울 떨어뜨린다'},
  fecl3:      {name:'염화철(III)',       verb:'한 방울 떨어뜨린다'},
};
// 알칼로이드가 둘이라 드라겐도르프만으로는 못 가른다. 자외선이 기나피만 집어낸다.
// C는 1번 방을 깬 사람을 낚는 덫이다 — 버드나무 껍질의 페놀류도 보라색을 낸다.
// (아스피린의 조상이 맞지만, 여기서 보라색은 답이 아니다)
const BAGS = {
  A:{what:'참나무 껍질',  hits:{fecl3:'검녹색으로 물든다'}},
  B:{what:'기나피',       hits:{dragendorff:'주황색 침전이 생긴다',
                                uv:'청백색으로 환하게 빛난다'}},
  C:{what:'버드나무 껍질', hits:{fecl3:'보라색이 번진다'}},
  D:{what:'생커피콩',     hits:{dragendorff:'주황색 침전이 생긴다'}},
};
const spotTest = (bag, reagent) =>
  (BAGS[bag].hits[reagent]) || '아무 일도 일어나지 않는다';
const QUININE_BAG = Object.keys(BAGS).find(b => BAGS[b].what === '기나피');

// --- 자물쇠 ③ 추출 --------------------------------------------------------
// 퀴닌은 염기다. 산에서는 물에 녹고, 염기로 바꾸면 톨루엔으로 넘어간다.
function extract({bag, barkG, acidMl, pH, tolueneMl, filtered, layer}) {
  if (!(barkG > 0))
    return {outcome:'empty', mg:0, sees:'깔때기가 비어 있다.'};
  if (bag !== QUININE_BAG)
    return {outcome:'nobark', mg:0, sees:'흔들어도 위층이 맑다. 아무것도 넘어오지 않았다.'};
  if (!(acidMl > 0))
    return {outcome:'noacid', mg:0, sees:'마른 껍질이 그대로 있다. 녹이지 않았다.'};
  // 찌꺼기를 안 걸러내면 유화가 생겨 층이 갈리지 않는다. 실제로 그렇다.
  if (!filtered)
    return {outcome:'emulsion', mg:0, sees:'껍질 찌꺼기 때문에 층이 갈리지 않는다. 흐린 덩어리뿐이다.'};
  if (pH < 8)
    return {outcome:'acidic', mg:0, sees:'위층이 맑다. 퀴닌이 아래 물층에 남아 있다.'};
  if (layer !== 'upper')
    return {outcome:'wronglayer', mg:0, sees:'받아 낸 물층은 맑다. 노란 톨루엔 층은 흘려버렸다.'};
  // 산과 용매가 적으면 덜 뽑힌다. 절벽이 아니라 경사로.
  const eff = Math.min(1, acidMl / RECIPE.acidMl) * Math.min(1, tolueneMl / RECIPE.tolueneMl);
  return {outcome:'ok', mg:barkG * BARK_YIELD * 1000 * eff,
          sees:'위층이 노랗게 물들었다. 받아 낸 톨루엔에서 쓴 냄새가 난다.'};
}

// --- 자물쇠 ④ 되뽑기 — 산을 고르는 자리 ------------------------------------
const ACIDS = {h2so4:'묽은 황산', hcl:'묽은 염산', water:'증류수'};
function backExtract(mg, acid) {
  if (acid === 'water')
    return {outcome:'nowater', mg:0, mgMl:0, quenched:false,
            sees:'흔들어도 물층이 맑다. 염기성 퀴닌은 맹물로 안 넘어온다.'};
  // 염화물은 퀴닌의 형광을 지운다. 약은 그대로 있는데 램프에만 안 보인다.
  const quenched = acid === 'hcl';
  return {outcome:'ok', mg, mgMl:mg / BACK_ML, quenched,
          sees:`아래 물층으로 넘어왔다. 눈금(${BACK_ML} mL)까지 받아 두었다.`};
}

// 너무 진하게 뽑았을 때의 길. 절반을 덜어 내고 눈금까지 산을 채우면 반으로 묽어진다.
// 막다른 길을 만들지 않으려고 둔 것이다 — 기나피를 다 써 버려도 되돌릴 수 있다.
const dilute = sol => ({...sol, mg:sol.mg / 2, mgMl:sol.mgMl / 2,
                        sees:'절반을 덜어 내고 눈금까지 산을 채웠다.'});

// ①에서 쓴 자외선이 다시 나온다 — 이번엔 "내가 뽑은 게 충분히 진한가"다
function uvOn(sol) {
  if (!sol || !(sol.mg > 0)) return {band:'none', label:'아무것도 빛나지 않는다'};
  if (sol.quenched) return {band:'quenched', label:'캄캄하다'};
  const r = sol.mgMl / STD_MG_ML;
  if (r < FLUOR.lo)  return {band:'faint',  label:'표준병보다 어둡다'};
  if (r > FLUOR.hi)  return {band:'bright', label:'표준병보다 밝다'};
  return {band:'match', label:'표준병과 같은 밝기다'};
}
// 램프가 캄캄해도 약은 들어 있다. 먹일 수 있는지는 농도가 정한다.
function doseCheck(sol) {
  if (!sol || !(sol.mg > 0)) return 'none';
  const r = sol.mgMl / STD_MG_ML;
  if (r < FLUOR.lo) return 'weak';
  if (r > FLUOR.hi) return 'strong';
  return 'ok';
}

// --- 시계 — 말라리아 발작. 중증 말라리아의 실제 경과다 ----------------------
const BUDGET = 70;
// 추출 한 번이 시약 한 번보다 훨씬 비싸다 — 그래서 ①을 하는 쪽이 늘 싸다
const COST = {look:0, test:2, extract:15, back:6, uv:2, dilute:3, dose:3, hint:8};
const STAGES = [
  '오한으로 이가 떨린다. 담요를 더 달라고 한다.',
  '열이 끓는다. 말이 헝클어진다.',
  '땀에 젖었다. 팔이 떨리고 숨이 가쁘다.',
  '의식이 없다.',
];
const STAGE_AT = [0, 26, 48, 68];
const stageOf = spent => STAGE_AT.reduce((n, at) => spent >= at ? n + 1 : n, 0) - 1;

const API = {AW, QUININE, BARK_YIELD, RECIPE, STOCK_G, TOLUENE_D, BACK_ML, STD_MG_ML,
             DOSE_MG, FLUOR, REAGENTS, BAGS, QUININE_BAG, spotTest, extract, ACIDS,
             backExtract, dilute, uvOn, doseCheck, BUDGET, COST, STAGES, STAGE_AT, stageOf};
if (typeof module !== 'undefined') module.exports = API;
if (typeof window !== 'undefined') window.QUIN = API;

// --- 자체 점검 ------------------------------------------------------------
if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert');
  const ok = (c, m) => assert.ok(c, m);

  // 분자량이 문헌값과 맞아야 나머지가 의미가 있다
  const mw = Object.entries(QUININE.counts).reduce((s, [e, n]) => s + AW[e] * n, 0);
  ok(Math.abs(mw - QUININE.mw) < 0.05, `퀴닌 MW ${mw.toFixed(2)} ≈ ${QUININE.mw}`);
  ok(TOLUENE_D < 1, '톨루엔은 물보다 가볍다 — 위층이다');
  assert.strictEqual(DOSE_MG / STD_MG_ML, 60, '1회분 눈금이 딱 떨어져야 한다 (계산 금지)');

  // ① 시약 하나로는 안 갈라진다 — 알칼로이드가 둘이다
  const drag = Object.keys(BAGS).filter(b => spotTest(b, 'dragendorff').includes('주황'));
  assert.deepStrictEqual(drag, ['B', 'D'], '알칼로이드가 둘이라 드라겐도르프만으로는 못 가른다');
  const glow = Object.keys(BAGS).filter(b => spotTest(b, 'uv').includes('빛난다'));
  assert.deepStrictEqual(glow, ['B'], '자외선에 빛나는 건 기나피뿐이다');
  // 덫 — 1번 방의 보라색이 여기서는 답이 아니다
  const violet = Object.keys(BAGS).filter(b => spotTest(b, 'fecl3').includes('보라'));
  assert.deepStrictEqual(violet, ['C'], '보라색은 버드나무 껍질이다');
  ok(!violet.includes(QUININE_BAG), '염화철 보라색을 따라가면 틀린 봉지다');
  const sig = b => Object.keys(REAGENTS).map(r => spotTest(b, r)).join('|');
  assert.strictEqual(new Set(Object.keys(BAGS).map(sig)).size, 4, '네 봉지가 서로 달라야 한다');

  // ③ 약전대로면 노란 위층이 나온다
  const good = extract({...RECIPE, bag:QUININE_BAG, filtered:true, layer:'upper'});
  assert.strictEqual(good.outcome, 'ok');
  ok(Math.abs(good.mg - 700) < 1, `기나피 10 g → 퀴닌 ${good.mg.toFixed(0)} mg`);

  // 틀리는 길마다 보이는 것이 다르다
  for (const [chg, out] of [
      [{filtered:false},      'emulsion'],
      [{pH:6},                'acidic'],
      [{layer:'lower'},       'wronglayer'],
      [{bag:'C'},             'nobark'],
      [{acidMl:0},            'noacid'],
      [{barkG:0},             'empty']])
    assert.strictEqual(
      extract({...RECIPE, bag:QUININE_BAG, filtered:true, layer:'upper', ...chg}).outcome, out,
      `${JSON.stringify(chg)} → ${out}`);

  // ④ 황산으로 되뽑으면 표준병과 같은 밝기, 그대로 먹일 수 있다
  const sol = backExtract(good.mg, 'h2so4');
  assert.strictEqual(uvOn(sol).band, 'match', `${sol.mgMl.toFixed(1)} mg/mL`);
  assert.strictEqual(doseCheck(sol), 'ok');

  // 염산으로 되뽑으면 램프는 캄캄하지만 약은 들어 있다 — 막다른 길이 아니다
  const quenched = backExtract(good.mg, 'hcl');
  assert.strictEqual(uvOn(quenched).band, 'quenched', '염화물이 형광을 지운다');
  assert.strictEqual(doseCheck(quenched), 'ok', '형광이 죽어도 약은 그대로다');
  assert.strictEqual(backExtract(good.mg, 'water').outcome, 'nowater');

  // 너무 묽으면 발작을 못 멈추고, 너무 진하면 신코니즘이다
  const half = extract({...RECIPE, bag:QUININE_BAG, filtered:true, layer:'upper', tolueneMl:20});
  assert.strictEqual(doseCheck(backExtract(half.mg, 'h2so4')), 'weak', '용매가 적으면 묽다');
  const both = extract({...RECIPE, bag:QUININE_BAG, barkG:STOCK_G, filtered:true, layer:'upper'});
  assert.strictEqual(doseCheck(backExtract(both.mg, 'h2so4')), 'strong', '한 번에 다 넣으면 진하다');
  ok(STOCK_G >= RECIPE.barkG * 2, '배치 두 번 분량은 있어야 한다');
  // 기나피를 한 번에 다 써서 진해져도 막다른 길은 아니다
  const thinned = dilute(backExtract(both.mg, 'h2so4'));
  assert.strictEqual(doseCheck(thinned), 'ok', '절반을 덜어 내면 먹일 수 있다');
  assert.strictEqual(uvOn(thinned).band, 'match');

  // 시간 예산 — 약전을 읽은 사람은 살리고, 두 번 망친 사람은 못 살린다
  const best = COST.test*6 + COST.extract + COST.back + COST.uv + COST.dose;
  const retry = COST.extract + COST.back + COST.uv;
  ok(best < STAGE_AT[3], `최적 경로 ${best}틱 < 사망 ${STAGE_AT[3]}틱`);
  ok(best + COST.hint*3 < STAGE_AT[3], `힌트 3회 다 써도(${best + COST.hint*3}틱) 살린다`);
  ok(best + retry < STAGE_AT[3], '한 번 망쳐도 살릴 수 있다');
  ok(best + retry*2 >= STAGE_AT[3], '두 번 망치면 못 살린다');
  ok(COST.extract > COST.test * Object.keys(REAGENTS).length,
     '봉지를 태워 보는 것보다 시약으로 찍는 쪽이 싸야 한다 — 안 그러면 ①이 장식이다');
  assert.strictEqual(COST.look, 0, '읽고 보는 건 공짜여야 한다');

  console.log('quinine self-check OK');
  console.log(`  퀴닌 ${QUININE.formula} MW ${mw.toFixed(2)} · mp ${QUININE.mp} °C`);
  console.log(`  기나피 ${RECIPE.barkG} g → ${good.mg.toFixed(0)} mg → ${sol.mgMl.toFixed(1)} mg/mL (표준 ${STD_MG_ML})`);
  console.log(`  1회분 ${DOSE_MG} mg = 눈금 ${DOSE_MG/STD_MG_ML} mL`);
  for (const b of Object.keys(BAGS))
    console.log(`  ${b} ${BAGS[b].what.padEnd(8)} ${Object.keys(REAGENTS)
      .filter(r => spotTest(b, r) !== '아무 일도 일어나지 않는다')
      .map(r => REAGENTS[r].name).join(' + ') || '—'}`);
  console.log(`  시간: 최적 ${best}틱 / 재시도 +${retry}틱 / 예산 ${BUDGET}틱`);
}
