// 방 2 — 경구수액(ORS). 콜레라성 탈수.
// 처방은 WHO 저삼투압 경구수액(2002) 1 L 기준 그대로다. 난이도 때문에 바꾸지 않는다.
const MW = {NaCl:58.44, glucose:180.16, KCl:74.55, citrate3Na:294.10};

// WHO ORS — 1 L에 녹이는 양 (g)
const RECIPE = {NaCl:2.6, glucose:13.5, KCl:1.5, citrate3Na:2.9, waterL:1.0};
const TARGET_MOSM = 245;              // 문헌값: 245 mOsm/L
// 등장 범위를 벗어나면 환자가 더 나빠진다. 너무 진하면 고나트륨혈증.
const SAFE_MOSM = {lo:200, hi:310};
const BOIL_C = 100;                   // 끓는 물에 타면 포도당이 상한다

// --- 자물쇠 ① 라벨 없는 흰 가루 넷 -----------------------------------------
// 넷 다 필요하고, 시약 하나로는 안 갈라진다. 나트륨이 둘이기 때문이다.
const REAGENTS = {
  flame:   {name:'불꽃',        verb:'백금선에 묻혀 넣는다'},
  agno3:   {name:'질산은',      verb:'한 방울 떨어뜨린다'},
  benedict:{name:'베네딕트 용액', verb:'붓고 가열한다'},
  cacl2:   {name:'염화칼슘',    verb:'넣고 끓인다'},
};
const BOTTLES = {
  A:{what:'포도당',       hits:{benedict:'벽돌색 침전이 가라앉는다'}},
  B:{what:'소금',         hits:{flame:'불꽃이 노랗게 물든다',
                                agno3:'흰 침전이 뿌옇게 생긴다'}},
  C:{what:'구연산삼나트륨', hits:{flame:'불꽃이 노랗게 물든다',
                                cacl2:'끓이자 흰 침전이 떠오른다'}},
  D:{what:'염화칼륨',     hits:{flame:'불꽃이 연보라로 물든다',
                                agno3:'흰 침전이 뿌옇게 생긴다'}},
};
const spotTest = (bottle, reagent) =>
  (BOTTLES[bottle].hits[reagent]) || '아무 일도 일어나지 않는다';

// --- 자물쇠 ③ 조제 --------------------------------------------------------
// 삼투압은 녹은 입자 수로 정해진다. 계산은 내부에서만 하고 눈금으로만 보여준다.
function osmolarity({NaCl, glucose, KCl, citrate3Na, waterL}) {
  if (!(waterL > 0)) return 0;
  const mmol = g => 1000 * g;
  const na  = mmol(NaCl) / MW.NaCl;              // Na⁺ + Cl⁻
  const k   = mmol(KCl) / MW.KCl;                // K⁺ + Cl⁻
  const cit = mmol(citrate3Na) / MW.citrate3Na;  // 3Na⁺ + 구연산³⁻
  const glu = mmol(glucose) / MW.glucose;        // 비전해질
  const particles = na*2 + k*2 + cit*4 + glu;
  return particles / waterL;
}

function mix({NaCl, glucose, KCl, citrate3Na, waterL, tempC}) {
  const any = NaCl + glucose + KCl + citrate3Na;
  if (!(any > 0) || !(waterL > 0))
    return {outcome:'empty', mOsm:0, sees:'물만 담겨 있다.'};

  if (tempC >= BOIL_C)
    return {outcome:'burnt', mOsm:0, sees:'끓는 물에 붓자 누렇게 변했다. 단내가 난다.'};

  const mOsm = osmolarity({NaCl, glucose, KCl, citrate3Na, waterL});

  // 포도당이 없으면 나트륨이 장에서 흡수되지 않는다. 실제 기전이고, 이게 ORS의 전부다.
  if (glucose <= 0)
    return {outcome:'noglucose', mOsm,
      sees:'맑게 녹았다. 짠맛만 난다.'};

  if (mOsm > SAFE_MOSM.hi)
    return {outcome:'strong', mOsm, sees:`맑게 녹았다. 염도계 바늘이 눈금 끝까지 올라간다.`};
  if (mOsm < SAFE_MOSM.lo)
    return {outcome:'weak', mOsm, sees:'맑게 녹았다. 염도계 바늘이 거의 움직이지 않는다.'};
  return {outcome:'ok', mOsm, sees:'맑게 녹았다. 염도계 바늘이 초록 칸에 들어와 있다.'};
}

// ④ ①에서 쓴 베네딕트가 다시 나온다 — 포도당이 들어갔는지 확인한다
const benedictOn = mixture =>
  mixture.glucose > 0 ? '벽돌색 침전이 가라앉는다. 포도당이 들어 있다.'
                      : '색이 변하지 않는다. 포도당이 없다.';

// 염도계 눈금 — 숫자가 아니라 칸으로 보여준다
function meter(mOsm) {
  if (mOsm < SAFE_MOSM.lo) return {band:'low',  label:'묽다'};
  if (mOsm > SAFE_MOSM.hi) return {band:'high', label:'진하다'};
  return {band:'ok', label:'초록 칸'};
}

// 한 번에 들이켜면 토한다. WHO 지침도 조금씩 자주다.
const SIP_ML = 50, SIPS_NEEDED = 5;
const sipOk = ml => ml > 0 && ml <= SIP_ML + 1e-9;

// --- 시계 — 탈수 징후. WHO 탈수 평가 그대로 ---------------------------------
// 방 1보다 예산이 크다. ①에서 시약을 엮어야 해서 찍어 볼 일이 두 배다.
const BUDGET = 80;
const COST = {look:0, test:2, weigh:2, mix:12, meter:2, benedict:2, hint:8, sip:2};
const STAGES = [
  '목이 마르다고 한다. 눈이 조금 꺼졌다.',
  '피부를 집으면 천천히 돌아온다. 소변이 없다.',
  '눈이 움푹하다. 맥이 빠르고 약하다. 축 늘어진다.',
  '의식이 없다.',
];
const STAGE_AT = [0, 28, 52, 74];
const stageOf = spent => STAGE_AT.reduce((n, at) => spent >= at ? n + 1 : n, 0) - 1;

const API = {MW, RECIPE, TARGET_MOSM, SAFE_MOSM, BOIL_C, REAGENTS, BOTTLES, spotTest,
             osmolarity, mix, benedictOn, meter, SIP_ML, SIPS_NEEDED, sipOk,
             BUDGET, COST, STAGES, STAGE_AT, stageOf};
if (typeof module !== 'undefined') module.exports = API;
if (typeof window !== 'undefined') window.ORS = API;

// --- 자체 점검 ------------------------------------------------------------
if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert');
  const ok = (c, m) => assert.ok(c, m);

  // WHO 처방이 실제로 245 mOsm/L인지 — 이게 맞아야 나머지가 의미가 있다
  const m = osmolarity(RECIPE);
  ok(Math.abs(m - TARGET_MOSM) < 8, `WHO 처방 삼투압 ${m.toFixed(0)} ≈ 245 mOsm/L`);

  // 성분별 mmol/L도 문헌값과 맞아야 한다 (Na 75, Cl 65, K 20, 구연산 10, 포도당 75)
  const na = 1000*RECIPE.NaCl/MW.NaCl + 3*1000*RECIPE.citrate3Na/MW.citrate3Na;
  const cl = 1000*RECIPE.NaCl/MW.NaCl + 1000*RECIPE.KCl/MW.KCl;
  const k  = 1000*RECIPE.KCl/MW.KCl;
  const ci = 1000*RECIPE.citrate3Na/MW.citrate3Na;
  const gl = 1000*RECIPE.glucose/MW.glucose;
  ok(Math.abs(na-75)<2, `Na ${na.toFixed(0)} mmol/L`);
  ok(Math.abs(cl-65)<2, `Cl ${cl.toFixed(0)} mmol/L`);
  ok(Math.abs(k -20)<1, `K ${k.toFixed(0)} mmol/L`);
  ok(Math.abs(ci-10)<1, `구연산 ${ci.toFixed(0)} mmol/L`);
  ok(Math.abs(gl-75)<2, `포도당 ${gl.toFixed(0)} mmol/L`);

  // ① 시약 하나로는 안 갈라져야 한다 — 그게 이 방의 퍼즐이다
  const flameYellow = Object.keys(BOTTLES).filter(b => spotTest(b,'flame').includes('노랗게'));
  assert.deepStrictEqual(flameYellow, ['B','C'], '나트륨이 둘이라 불꽃만으로는 못 가른다');
  const silver = Object.keys(BOTTLES).filter(b => spotTest(b,'agno3').includes('침전'));
  assert.deepStrictEqual(silver, ['B','D'], '염화물이 둘이라 질산은만으로도 못 가른다');
  // 두 시약을 엮으면 넷이 다 갈라진다. 불꽃은 색까지 봐야 한다 — 노랑과 연보라는 다른 답이다.
  const sig = b => Object.keys(REAGENTS).map(r => spotTest(b,r)).join('|');
  assert.strictEqual(new Set(Object.keys(BOTTLES).map(sig)).size, 4,
    '네 병의 반응 결과가 서로 달라야 한다');
  // 있음/없음만 보면 소금과 염화칼륨이 겹친다 — 색을 봐야 갈린다는 뜻이다
  const crude = b => Object.keys(REAGENTS).map(r =>
    spotTest(b,r) === '아무 일도 일어나지 않는다' ? '0' : '1').join('');
  assert.strictEqual(crude('B'), crude('D'),
    '소금과 염화칼륨은 반응 패턴이 같다 — 불꽃 색으로만 갈린다');
  ok(spotTest('D','flame').includes('연보라'), '칼륨은 연보라 불꽃');

  // ③ 처방대로면 초록 칸
  const good = mix({...RECIPE, tempC:25});
  assert.strictEqual(good.outcome, 'ok', 'WHO 처방 = 초록 칸');
  assert.strictEqual(meter(good.mOsm).band, 'ok');

  // 물을 반만 쓰면 두 배로 진해진다 — 고나트륨혈증
  const half = mix({...RECIPE, waterL:0.5, tempC:25});
  assert.strictEqual(half.outcome, 'strong', '물 0.5 L는 너무 진하다');
  ok(half.mOsm > 2*TARGET_MOSM - 20, `${half.mOsm.toFixed(0)} mOsm/L`);

  // 물을 두 배 쓰면 묽다
  assert.strictEqual(mix({...RECIPE, waterL:2.0, tempC:25}).outcome, 'weak');

  // 포도당을 빼면 맑게 녹지만 소용이 없다 — 나트륨 흡수가 포도당에 업혀 간다
  const noglu = mix({...RECIPE, glucose:0, tempC:25});
  assert.strictEqual(noglu.outcome, 'noglucose', '포도당 없이는 안 된다');
  ok(benedictOn({glucose:0}).includes('색이 변하지 않는다'), '④ 베네딕트 음성');
  ok(benedictOn(RECIPE).includes('벽돌색'), '④ 베네딕트 양성');

  // 끓는 물에 타면 상한다
  assert.strictEqual(mix({...RECIPE, tempC:100}).outcome, 'burnt', '끓는 물은 안 된다');

  // 한 번에 들이켜면 토한다
  ok(sipOk(SIP_ML) && !sipOk(SIP_ML*3), '한 모금은 50 mL까지');

  // 시간 예산 — 처방을 읽은 사람은 살리고, 헤맨 사람은 못 살린다
  const best = COST.test*8 + COST.weigh*4 + COST.mix + COST.meter + COST.benedict
             + COST.sip*SIPS_NEEDED;
  ok(best < STAGE_AT[3], `최적 경로 ${best}틱 < 사망 ${STAGE_AT[3]}틱`);
  ok(best + COST.hint*3 < BUDGET, `힌트 3회 다 써도(${best + COST.hint*3}틱) 살린다`);
  ok(best + COST.mix*2 >= STAGE_AT[3], '조제를 두 번 망치면 못 살린다');
  assert.strictEqual(COST.look, 0, '읽고 보는 건 공짜여야 한다');

  console.log('ors self-check OK');
  console.log(`  WHO 처방: ${m.toFixed(0)} mOsm/L (문헌 245)`);
  console.log(`  Na ${na.toFixed(0)} · Cl ${cl.toFixed(0)} · K ${k.toFixed(0)} · 구연산 ${ci.toFixed(0)} · 포도당 ${gl.toFixed(0)} mmol/L`);
  console.log(`  물 0.5 L: ${half.mOsm.toFixed(0)} mOsm/L → ${meter(half.mOsm).label}`);
  for (const b of Object.keys(BOTTLES))
    console.log(`  ${b} ${BOTTLES[b].what.padEnd(8)} ${Object.keys(REAGENTS)
      .filter(r => spotTest(b,r) !== '아무 일도 일어나지 않는다')
      .map(r => REAGENTS[r].name).join(' + ') || '—'}`);
  console.log(`  시간: 최적 ${best}틱 / 힌트3회 ${best+COST.hint*3}틱 / 예산 ${BUDGET}틱`);
}
