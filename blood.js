// 방 6 — 대량 출혈. 라벨 없는 혈액 주머니 넷 중 넣어도 되는 것을 고른다.
// 값은 전부 문헌값(수혈 지침)이다. 노드(자체점검)와 브라우저 양쪽에서 돈다.

// 환자는 지난해 수혈을 한 번 받았다. 그래서 항D 항체가 생겼을 수 있고,
// 식염수 교차시험은 그걸 못 잡는다 — 이 방의 덫이 거기 있다.
const PATIENT = {abo:'A', rh:'-', transfused:true};
const UNITS_NEEDED = 2;
const RECIPE = {keepC:4, warmC:37, slowMin:15, units:UNITS_NEEDED};
// 혈액 보관은 1~6 °C, 가온은 체온까지. 42 °C를 넘기면 적혈구가 깨진다.
const WARM = {lo:32, hi:42};

// --- 자물쇠 ① 항혈청 세 방울 ----------------------------------------------
const REAGENTS = {
  antiA:{name:'항A 혈청', verb:'한 방울 떨어뜨린다'},
  antiB:{name:'항B 혈청', verb:'한 방울 떨어뜨린다'},
  antiD:{name:'항D 혈청', verb:'한 방울 떨어뜨린다'},
};
const CLUMP = '붉은 알갱이가 덩어리로 뭉친다', SMOOTH = '고르게 퍼진 채 그대로다';
const agglutinates = (type, reagent) =>
  reagent === 'antiA' ? type.abo === 'A' || type.abo === 'AB'
: reagent === 'antiB' ? type.abo === 'B' || type.abo === 'AB'
                      : type.rh === '+';
const typeTest = (type, reagent) => agglutinates(type, reagent) ? CLUMP : SMOOTH;

// --- 주머니 넷. 라벨이 떨어졌다 ---------------------------------------------
// 교차시험을 통과하는 주머니가 넷인데 넣어도 되는 건 둘뿐이다.
// 둘이 아니라 넷으로 둔 이유: 교차시험만 믿고 아무거나 둘을 뽑으면
// 둘 다 맞을 확률이 여섯에 하나다. 그래야 ①이 장식이 안 된다.
const BAGS = {
  A:{abo:'A',  rh:'+'},
  B:{abo:'O',  rh:'+'},
  C:{abo:'B',  rh:'+'},
  D:{abo:'O',  rh:'-'},
  E:{abo:'A',  rh:'-'},
};
// 주교차(식염수법) — 환자 혈청에 공혈자 적혈구를 섞는다. ABO만 잡는다.
const crossmatch = bag =>
  (PATIENT.abo === 'A' && (bag.abo === 'B' || bag.abo === 'AB')) ||
  (PATIENT.abo === 'B' && (bag.abo === 'A' || bag.abo === 'AB')) ||
  (PATIENT.abo === 'O' && bag.abo !== 'O')
    ? {ok:false, sees:CLUMP} : {ok:true, sees:SMOOTH};
// 실제로 넣어도 되는가 — ABO와 Rh를 둘 다 본다
function compatible(bag){
  if (!crossmatch(bag).ok) return 'abo';
  if (PATIENT.rh === '-' && bag.rh === '+') return PATIENT.transfused ? 'rh' : 'rh';
  return 'ok';
}

// --- 자물쇠 ④ 달기 --------------------------------------------------------
function transfuse({bag, warmC, slow}){
  const fit = compatible(BAGS[bag]);
  if (warmC < WARM.lo) return {outcome:'cold', fit,
    sees:'찬 피가 그대로 들어간다. 몸이 떨리고 맥이 느려진다.'};
  if (warmC > WARM.hi) return {outcome:'burnt', fit,
    sees:'주머니 속이 검붉게 흐려졌다. 적혈구가 깨졌다.'};
  if (fit !== 'ok') return {outcome:fit, slow, fit,
    sees:slow ? '한 방울씩 떨어지는 동안 환자가 오한을 호소한다. 등이 아프다고 한다.'
              : '빠르게 다 들어갔다. 소변주머니가 붉게 물든다.'};
  return {outcome:'ok', fit, sees:'한 단위가 다 들어갔다. 맥이 조금 힘을 얻는다.'};
}

// --- 시계 — 출혈성 쇼크의 실제 경과 -----------------------------------------
const BUDGET = 86;
// 부적합을 달면 오한에서 멈추더라도 환자가 그만큼 깎인다. 한 번은 버티고 두 번은 못 버틴다.
const COST = {look:0, type:2, cross:10, warm:3, unit:6, reaction:20, hint:8};
const STAGE_AT = [0, 30, 56, 84];
const STAGES = [
  '얼굴이 하얗다. 맥이 빠르다. 말은 한다.',
  '손끝이 차고 축축하다. 맥이 가늘어진다.',
  '숨이 얕다. 불러야 겨우 눈을 뜬다.',
  '의식이 없다. 맥이 잡히지 않는다.',
];
const stageOf = spent => STAGE_AT.reduce((n, at) => spent >= at ? n + 1 : n, 0) - 1;

const API = {PATIENT, UNITS_NEEDED, RECIPE, WARM, REAGENTS, CLUMP, SMOOTH,
             agglutinates, typeTest, BAGS, crossmatch, compatible, transfuse,
             BUDGET, COST, STAGES, STAGE_AT, stageOf};
if (typeof module !== 'undefined') module.exports = API;
if (typeof window !== 'undefined') window.BLOOD = API;

// --- 자체 점검 ------------------------------------------------------------
if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert');
  const ok = (c, m) => assert.ok(c, m);

  // ① 환자는 A형 Rh 음성 — 항A에만 뭉친다
  assert.strictEqual(typeTest(PATIENT, 'antiA'), CLUMP);
  assert.strictEqual(typeTest(PATIENT, 'antiB'), SMOOTH);
  assert.strictEqual(typeTest(PATIENT, 'antiD'), SMOOTH, '항D가 안 뭉치면 Rh 음성이다');

  // 항D 한 방울이 Rh 음성 둘을 바로 집어낸다 — 그게 이 방의 지름길이다
  const rhNeg = Object.keys(BAGS).filter(b => typeTest(BAGS[b], 'antiD') === SMOOTH);
  assert.deepStrictEqual(rhNeg, ['D', 'E'], '항D가 안 뭉치는 주머니는 둘뿐이다');

  // ③ 교차시험은 ABO만 잡는다 — Rh 양성 둘도 통과한다
  assert.strictEqual(crossmatch(BAGS.A).ok, true, 'A형 주머니는 교차시험을 통과한다');
  assert.strictEqual(crossmatch(BAGS.C).ok, false, 'B형 주머니는 뭉친다');
  for (const b of ['B', 'D', 'E']) assert.strictEqual(crossmatch(BAGS[b]).ok, true);

  // ④ 그런데 넣어도 되는 건 Rh 음성 둘뿐이다 — 이게 이 방의 전부다
  assert.deepStrictEqual(Object.keys(BAGS).filter(b => compatible(BAGS[b]) === 'ok'),
    ['D', 'E'], 'Rh 음성 둘만 적합하다');
  assert.strictEqual(compatible(BAGS.A), 'rh', '교차시험을 통과해도 Rh가 다르면 안 된다');
  assert.strictEqual(compatible(BAGS.C), 'abo');
  const passCross = Object.keys(BAGS).filter(b => crossmatch(BAGS[b]).ok);
  assert.strictEqual(passCross.length, 4,
    '교차시험만 보면 넷이 통과한다 — 그중 둘을 찍으면 여섯에 하나다');
  assert.strictEqual(Object.keys(BAGS).filter(b => compatible(BAGS[b]) === 'ok').length,
    UNITS_NEEDED, '적합한 주머니가 필요한 단위 수와 같다');

  // 가온 — 차가워도 뜨거워도 안 된다
  const good = {bag:'E', warmC:RECIPE.warmC, slow:true};
  assert.strictEqual(transfuse(good).outcome, 'ok');
  assert.strictEqual(transfuse({...good, warmC:10}).outcome, 'cold');
  assert.strictEqual(transfuse({...good, warmC:50}).outcome, 'burnt');
  ok(WARM.lo < RECIPE.warmC && RECIPE.warmC < WARM.hi, '가온기 다이얼이 안전 범위 안에 있다');
  ok(RECIPE.keepC < WARM.lo, '보관 온도와 가온 온도는 다른 숫자다');

  // 천천히 달면 반응을 알아채고 멈출 수 있다 — 죽어야 배우게 하지 않는다
  const slowBad = transfuse({bag:'A', warmC:RECIPE.warmC, slow:true});
  assert.strictEqual(slowBad.outcome, 'rh');
  ok(slowBad.sees.includes('오한'), '천천히 달면 오한에서 멈출 기회가 있다');
  ok(transfuse({bag:'A', warmC:RECIPE.warmC, slow:false}).sees.includes('붉게'),
     '빠르게 달면 다 들어간 뒤에 안다');

  // 시간 예산 — 항D로 후보를 좁히고 둘만 교차시험하는 것이 최적이다
  const best = COST.type*3 + COST.type*Object.keys(BAGS).length
             + COST.cross*UNITS_NEEDED + (COST.warm + COST.unit)*UNITS_NEEDED;
  ok(best < STAGE_AT[3], `최적 경로 ${best}틱 < 사망 ${STAGE_AT[3]}틱`);
  ok(best + COST.hint*3 < STAGE_AT[3], `힌트 3회 다 써도(${best + COST.hint*3}틱) 살린다`);
  ok(best + COST.cross*2 < STAGE_AT[3], '교차시험을 두 번 더 해도 살릴 수 있다');
  ok(best + COST.reaction + COST.warm + COST.unit < STAGE_AT[3],
     '부적합을 한 번 달고 멈춰도 되돌릴 수 있다');
  ok(best + (COST.reaction + COST.warm + COST.unit)*2 >= STAGE_AT[3],
     '두 번 틀리면 못 살린다');
  assert.strictEqual(COST.look, 0, '읽고 보는 건 공짜여야 한다');

  console.log('blood self-check OK');
  console.log(`  환자 ${PATIENT.abo}형 Rh${PATIENT.rh} · 수혈력 ${PATIENT.transfused ? '있음' : '없음'} · ${UNITS_NEEDED}단위 필요`);
  for (const b of Object.keys(BAGS)){
    const x = BAGS[b], f = compatible(x);
    console.log(`  ${b} ${x.abo}형 Rh${x.rh}  교차시험 ${crossmatch(x).ok ? '통과' : '응집'}` +
      `  → ${f === 'ok' ? '적합 ✔' : f === 'rh' ? 'Rh 부적합(덫)' : 'ABO 부적합'}`);
  }
  console.log(`  가온 ${RECIPE.warmC} °C (${WARM.lo}~${WARM.hi}) · 보관 ${RECIPE.keepC} °C · 처음 ${RECIPE.slowMin}분 천천히`);
  console.log(`  시간: 최적 ${best}틱 / 예산 ${BUDGET}틱`);
}
