// pharma-lab v3 — 아스피린 방탈출의 화학과 시간.
// 화학 값은 전부 문헌값이다. 노드(자체점검)와 브라우저 양쪽에서 돈다.
const AW = {C:12.011, H:1.008, O:15.999};

// 만들 것 — 아스피린. 학부 교과서 실험 중 가장 잘 알려진 것.
const SALICYLIC = {name:'살리실산',  formula:'C7H6O3', mw:138.12, counts:{C:7,H:6,O:3}};
const ANHYDRIDE = {name:'무수초산',  formula:'C4H6O3', mw:102.09, density:1.08};
const ASPIRIN   = {name:'아스피린',  formula:'C9H8O4', mw:180.16, mp:135, counts:{C:9,H:8,O:4}};

// 찢긴 노트가 가리키는 조건. MiraCosta/J.Chem.Educ. 학부 프로토콜 그대로.
// 병은 여기 적지 않는다 — 어느 병인지가 ①의 답이다.
const RECIPE = {salicylicG:2.0, anhydrideMl:5.0, catalystDrops:5, tempC:85, timeMin:15};
// 식히는 법도 문헌값이다 — 찬물 50 mL를 붓고 얼음물에서 10분.
const QUENCH = {coldWaterMl:50, iceBathMin:10};

// 병마다 4.00 g = 2.0 g 배치 두 번. 한 번 실수로 영구히 막히면 방탈출이 아니라 함정이다.
// 엉뚱한 병을 쓰면 그 병의 가루만 줄어든다 — 살리실산은 그대로 남는다. 시간만 잃는다.
const STOCK_G = 4.00;

// 심근경색 의심 환자에게 아스피린을 씹어 먹이는 건 표준 응급지침 (160~325 mg).
const DOSE_MG = 300, DOSE_MIN_MG = 160, DOSE_MAX_MG = 325;
// 염화철 정색이 사라지는 지점. 먹일 약이니 높다.
const MIN_PURITY = 0.97;

// --- 자물쇠 ① 라벨 없는 흰 가루 넷 -----------------------------------------
// 전부 실제 정성분석이다. 색만 보면 읽힌다.
const REAGENTS = {
  fecl3:   {name:'염화철(III)',   verb:'한 방울 떨어뜨린다'},
  iodine:  {name:'요오드 용액',   verb:'한 방울 떨어뜨린다'},
  benedict:{name:'베네딕트 용액', verb:'붓고 가열한다'},
  flame:   {name:'불꽃',          verb:'백금선에 묻혀 넣는다'},
};
const BOTTLES = {
  A:{what:'살리실산', hit:'fecl3',    sees:'진한 보라색으로 물든다'},
  B:{what:'녹말',     hit:'iodine',   sees:'짙은 남색이 번진다'},
  C:{what:'포도당',   hit:'benedict', sees:'벽돌색 침전이 가라앉는다'},
  D:{what:'소금',     hit:'flame',    sees:'불꽃이 노랗게 물든다'},
};
const spotTest = (bottle, reagent) =>
  BOTTLES[bottle].hit === reagent ? BOTTLES[bottle].sees : '아무 일도 일어나지 않는다';

const mwOf = counts => Object.entries(counts).reduce((s,[e,n]) => s + AW[e]*n, 0);

// --- 자물쇠 ③ 반응 --------------------------------------------------------
// 조건 → 눈에 보이는 것. 수율 숫자는 플레이어에게 주지 않는다.
// 절벽이 아니라 경사다. 85°C/15분이 정답이고 70~95°C는 통과, 상온이나 100°C 이상은 실패.
function react({powder, salicylicG, anhydrideMl, catalystDrops, tempC, timeMin, vinegar}) {
  const nSal = salicylicG / SALICYLIC.mw;
  if (!(nSal > 0)) return {outcome:'empty', sees:'플라스크가 비어 있다.', mass:0, purity:0};

  // ①에서 찾은 그 병이어야 한다. 아스피린은 살리실산에서만 나온다.
  if (powder && BOTTLES[powder] && BOTTLES[powder].what !== SALICYLIC.name)
    return {outcome:'wrongpowder', mass:0, purity:0,
      sees:`아무리 식혀도 결정이 나오지 않는다. ${powder}의 가루는 이것이 아니다.`};

  // 물이 있으면 무수물이 가수분해된다. 식초로는 아세틸화가 안 된다.
  if (vinegar) return {outcome:'nothing', mass:0, purity:0,
    sees:'아무 일도 일어나지 않는다. 가루가 식초에 잠겨 가라앉아 있을 뿐이다.'};

  const nAnh = anhydrideMl * ANHYDRIDE.density / ANHYDRIDE.mw;
  if (!(nAnh > 0)) return {outcome:'nothing', mass:0, purity:0,
    sees:'아세틸기를 줄 것이 없다. 가루가 그대로 있다.'};

  if (tempC < 50) return {outcome:'cold', mass:0, purity:0,
    sees:'가루가 녹지 않고 그대로 가라앉아 있다. 맑아지지 않는다.'};

  const eq = nAnh / nSal;                               // 5 mL / 2.0 g → 약 3.7당량 (문헌은 과량)
  const theoretical = Math.min(nSal, nAnh) * ASPIRIN.mw;
  const fT    = Math.exp(-(((tempC  - RECIPE.tempC)  / 25) ** 2));
  const fTime = Math.exp(-(((timeMin - RECIPE.timeMin) / 12) ** 2));
  const fCat  = catalystDrops > 0 ? Math.min(1, 0.5 + 0.1 * catalystDrops) : 0.08;
  const yield_ = 0.88 * fT * fTime * fCat;

  // 조생성물에는 미반응 살리실산이 남는다 — 그래서 ④에서 염화철이 보라색을 낸다.
  // 실제 학부 실험에서도 crude aspirin은 염화철 양성이다. 재결정이 필요한 이유 전부.
  let purity = 0.93;
  if (tempC > 95)  purity -= (tempC - 95) * 0.012;      // 열분해·탄화
  if (timeMin < 10) purity -= (10 - timeMin) * 0.02;     // 미반응 살리실산 잔류
  if (eq < 1)      purity -= (1 - eq) * 0.25;            // 아세틸화가 덜 끝난다
  purity = Math.max(0.35, Math.min(0.99, purity));

  const mass = theoretical * yield_;
  if (tempC >= 100) return {outcome:'burnt', mass, purity, yield:yield_, eq, theoretical,
    sees:'플라스크 안이 갈색으로 변했다. 탄 냄새가 난다.'};
  if (catalystDrops === 0) return {outcome:'slow', mass, purity, yield:yield_, eq, theoretical,
    sees:'거의 변화가 없다. 맑아지는 데가 없고 가루만 조금 줄었다.'};
  return {outcome:'ok', mass, purity, yield:yield_, eq, theoretical,
    sees:`맑아졌다. 찬물 ${QUENCH.coldWaterMl} mL를 붓고 얼음물에 ${QUENCH.iceBathMin}분 두자 흰 결정이 쏟아진다.`};
}

// --- 자물쇠 ④ 재결정 ------------------------------------------------------
// 순도는 오르고 양은 잃는다. 천천히 식히면 바늘 결정이 자라고 순도가 더 오른다.
// 빨리 식히면 양은 더 남지만 결정이 잘고 뿌옇다 — 불순물이 갇힌다. 실제로 그렇다.
function recrystallize(p, slowCool) {
  const keep  = slowCool ? 0.76 : 0.88;
  const clean = slowCool ? 0.85 : 0.35;
  return {
    mass: p.mass * keep,
    purity: Math.min(0.998, p.purity + (1 - p.purity) * clean),
    crystal: slowCool ? '긴 바늘 모양 결정이 자랐다.' : '결정이 잘고 뿌옇다.',
  };
}

// 염화철 정색 — 페놀성 OH에 반응한다. 아스피린은 아세틸화돼 반응이 없다.
const fecl3Test = purity =>
  purity >= MIN_PURITY ? '색이 변하지 않는다.'
  : purity >= 0.90     ? '연한 보라색이 비친다.'
  :                      '진한 보라색이 번진다.';

// 융점 강하 — 불순물이 있으면 내려가고 구간이 넓어진다
function meltingPoint(purity) {
  const imp = Math.max(0, 1 - purity);
  const hi = ASPIRIN.mp - imp * 120;
  return {lo: hi - imp * 60, hi, sharp: imp * 60 < 2};
}

const doseOk = mg => mg >= DOSE_MIN_MG && mg <= DOSE_MAX_MG;

// --- 시계를 없앤다 --------------------------------------------------------
// 실시간 초를 돌리지 않는다. 생각하고 읽는 건 공짜고, 행동만 환자를 깎는다.
// (Gilbert 규칙 7 — 실시간 압박을 피하고 "할리우드 시간"을 써라)
const BUDGET = 70;
const COST = {look:0, test:2, weigh:2, react:15, recryst:10, fecl3:1, melt:3, hint:8, dose:1};
const STAGES = [
  '가슴을 움켜쥐고 있다. 식은땀이 흐른다. 말은 한다.',
  '통증이 심해진다. 숨이 얕고 입술이 창백하다.',
  '말이 느려진다. 맥이 불규칙하다.',
  '의식이 없다.',
];
const STAGE_AT = [0, 25, 45, 65];
const stageOf = spent => STAGE_AT.reduce((n, at) => spent >= at ? n + 1 : n, 0) - 1;

const API = {AW, SALICYLIC, ANHYDRIDE, ASPIRIN, RECIPE, QUENCH, STOCK_G,
             DOSE_MG, DOSE_MIN_MG, DOSE_MAX_MG, MIN_PURITY,
             REAGENTS, BOTTLES, spotTest, mwOf, react, recrystallize, fecl3Test,
             meltingPoint, doseOk, BUDGET, COST, STAGES, STAGE_AT, stageOf};
if (typeof module !== 'undefined') module.exports = API;
if (typeof window !== 'undefined') window.CHEM = API;

// --- 자체 점검 ------------------------------------------------------------
if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert');
  const ok = (c, m) => assert.ok(c, m);

  // 문헌값 검산
  ok(Math.abs(mwOf(SALICYLIC.counts) - SALICYLIC.mw) < 0.02, '살리실산 138.12');
  ok(Math.abs(mwOf(ASPIRIN.counts)   - ASPIRIN.mw)   < 0.02, '아스피린 180.16');
  assert.strictEqual(ASPIRIN.mp, 135, '순수 아스피린 융점 135 °C');

  // ① 정성분석 — 각 병은 자기 시약에만 반응한다
  for (const b of Object.keys(BOTTLES)) {
    for (const r of Object.keys(REAGENTS)) {
      const hit = BOTTLES[b].hit === r;
      assert.strictEqual(spotTest(b, r) !== '아무 일도 일어나지 않는다', hit,
        `${b} × ${r}`);
    }
  }
  ok(spotTest('A','fecl3').includes('보라'), '살리실산 + 염화철 = 보라색');

  // ③ 노트대로 하면 결정이 쏟아진다
  const good = react({...RECIPE, powder:'A'});
  assert.strictEqual(good.outcome, 'ok', '85 °C·15분·황산 = 성공');
  ok(good.mass * 1000 > DOSE_MAX_MG, `최적 수득 ${(good.mass*1000).toFixed(0)} mg > 325 mg`);

  // ④ 클라이맥스가 성립해야 한다 — 조생성물은 반드시 염화철 양성
  ok(good.purity < MIN_PURITY, '갓 만든 결정은 염화철 양성이어야 한다');
  ok(fecl3Test(good.purity).includes('보라'), '조생성물 = 보라색');
  const pure = recrystallize(good, true);
  ok(pure.purity >= MIN_PURITY, '천천히 식힌 재결정 한 번으로 염화철 음성');
  assert.strictEqual(fecl3Test(pure.purity), '색이 변하지 않는다.');
  ok(pure.crystal.includes('바늘'), '천천히 식히면 바늘 결정');

  // 재결정 트레이드오프 — 순도↑ 양↓, 빨리 식히면 양은 남고 순도는 덜 오른다
  ok(pure.mass < good.mass && pure.purity > good.purity, '재결정: 순도↑ 양↓');
  const fast = recrystallize(good, false);
  ok(fast.mass > pure.mass && fast.purity < pure.purity, '빨리 식히면 양↑ 순도↓');
  ok(fast.purity < MIN_PURITY, '빨리 식히면 한 번으로는 통과 못 한다');

  // 엉뚱한 병으로는 아무것도 안 나온다 — ①을 건너뛸 수 없어야 한다
  for (const b of ['B','C','D'])
    assert.strictEqual(react({...RECIPE, powder:b}).outcome, 'wrongpowder', `${b}로는 안 된다`);
  assert.strictEqual(react({...RECIPE, powder:'A'}).outcome, 'ok', 'A로는 된다');

  // 실패 조건 넷이 다 보여야 한다
  assert.strictEqual(react({...RECIPE, tempC:22}).outcome, 'cold', '상온은 녹지 않는다');
  assert.strictEqual(react({...RECIPE, tempC:110}).outcome, 'burnt', '110 °C는 탄다');
  assert.strictEqual(react({...RECIPE, vinegar:true}).outcome, 'nothing', '식초는 안 된다');
  assert.strictEqual(react({...RECIPE, catalystDrops:0}).outcome, 'slow', '촉매가 없으면 느리다');

  // 난이도 경계 — 노트를 읽으면 이기고 안 읽으면 진다
  ok(react({...RECIPE, tempC:70}).outcome === 'ok', '70 °C는 통과');
  ok(react({...RECIPE, tempC:95}).outcome === 'ok', '95 °C는 통과');
  const hot = react({...RECIPE, tempC:110});
  ok(hot.purity < 0.90, '과열은 순도 미달');
  let fix = hot, n = 0;
  while (fix.purity < MIN_PURITY && n < 6) { fix = recrystallize(fix, true); n++; }
  ok(n >= 2, `탄 것은 재결정 ${n}회가 필요하다 — 시간이 환자를 깎는다`);

  // 짧게 끓이면 결정은 나오지만 보라색이 진하다
  const short = react({...RECIPE, timeMin:5});
  assert.strictEqual(short.outcome, 'ok', '5분도 결정은 나온다');
  ok(short.purity < good.purity, '5분이면 살리실산이 더 남는다');

  // 융점 — 순수하면 135에 날카롭게, 불순하면 낮고 넓게
  const mpPure = meltingPoint(recrystallize(pure, true).purity);
  ok(mpPure.hi > 133 && mpPure.sharp, `순수 융점 ${mpPure.hi.toFixed(1)} °C 날카롭게`);
  const mpBad = meltingPoint(0.80);
  ok(mpBad.hi < 125 && !mpBad.sharp && mpBad.lo < mpBad.hi, '불순하면 낮고 넓다');

  // 투여량 — 실제 응급지침 범위
  ok(doseOk(DOSE_MG) && doseOk(160) && doseOk(325), '160~325 mg 통과');
  ok(!doseOk(100) && !doseOk(500), '범위 밖은 실패');

  // 시간 예산 — 최적 경로는 살리고, 두 번 망치면 못 살린다
  const C = COST;
  const best = C.test*4 + C.weigh + C.react + C.fecl3 + C.recryst + C.fecl3 + C.melt + C.dose;
  ok(best < STAGE_AT[3], `최적 경로 ${best}틱 < 사망 ${STAGE_AT[3]}틱`);
  ok(best + C.hint*3 < BUDGET, `힌트 3회 다 써도(${best + C.hint*3}틱) 살린다`);
  ok(best + C.react + C.recryst*2 >= STAGE_AT[3], '반응을 두 번 망치면 못 살린다');
  assert.strictEqual(C.look, 0, '읽고 보는 건 공짜여야 한다');
  assert.strictEqual(stageOf(0), 0);
  assert.strictEqual(stageOf(BUDGET - 1), 3, '예산 끝은 의식 없음');

  console.log('chem self-check OK');
  console.log(`  최적(85°C·15분): ${(good.mass*1000).toFixed(0)} mg, 순도 ${(good.purity*100).toFixed(1)}% → 염화철 ${fecl3Test(good.purity)}`);
  console.log(`  재결정(천천히):  ${(pure.mass*1000).toFixed(0)} mg, 순도 ${(pure.purity*100).toFixed(1)}% → 염화철 ${fecl3Test(pure.purity)}`);
  console.log(`  재결정(빨리):    ${(fast.mass*1000).toFixed(0)} mg, 순도 ${(fast.purity*100).toFixed(1)}% → 염화철 ${fecl3Test(fast.purity)}`);
  console.log(`  110°C:           순도 ${(hot.purity*100).toFixed(1)}% → 재결정 ${n}회 필요 (${n*COST.recryst}틱)`);
  console.log(`  융점: 순수 ${mpPure.lo.toFixed(1)}~${mpPure.hi.toFixed(1)} / 순도80% ${mpBad.lo.toFixed(1)}~${mpBad.hi.toFixed(1)}`);
  console.log(`  시간: 최적 ${best}틱 / 힌트3회 ${best + C.hint*3}틱 / 예산 ${BUDGET}틱`);
}
