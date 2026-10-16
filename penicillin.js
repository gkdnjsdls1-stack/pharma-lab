// 방 4 — 페니실린. 패혈증.
// 사람이 합성하지 않는다. 곰팡이가 만들고, 사람은 고르고 거르고 역가를 잰다.
// 화학·미생물 값은 전부 문헌값이다.
const AW = {C:12.011, H:1.008, N:14.007, O:15.999, S:32.06};

const PENG = {name:'페니실린 G', formula:'C16H18N2O4S', mw:334.39,
              counts:{C:16, H:18, N:2, O:4, S:1}};
// 1 옥스퍼드 단위 = 페니실린 G 나트륨 0.6 µg. 플로리 연구실이 정한 그 단위다.
const UNIT_UG = 0.6;
const UNITS_PER_MG = 1000 / UNIT_UG;

// 전임자의 배양 지침. P. chrysogenum 표면 정지배양 — 문헌 조건 그대로.
// 어느 곰팡이인지는 여기 적지 않는다 — 그게 ①의 답이다.
const RECIPE = {tempC:24, days:7, pH:6.5, keepC:4};
const MAX_POTENCY = 20000;        // 고역가 균주의 배양액 역가 (단위/mL)
const FLASK_ML = 400;

// --- 자물쇠 ① 어느 곰팡이가 약을 만드나 ------------------------------------
// 플레밍이 1928년에 본 그대로다. 억제대가 생기는 접시는 하나뿐이다.
const REAGENTS = {
  swab:    {name:'검체 면봉',   verb:'한천에 그어 본다'},
  filtrate:{name:'여과액 피펫', verb:'디스크에 묻힌다'},
};
const DISHES = {
  A:{what:'검은곰팡이', makes:false, sees:'검은 가루가 덮였다. 세균이 접시 끝까지 자랐다'},
  B:{what:'푸른곰팡이', makes:true,  sees:'집락 둘레로 세균이 비어 있다. 맑은 띠가 생겼다'},
  C:{what:'빵곰팡이',   makes:false, sees:'흰 솜털이 번졌다. 세균이 그 밑까지 자랐다'},
  D:{what:'효모',       makes:false, sees:'크림색 집락이다. 세균이 바로 옆까지 자랐다'},
};
const DRUG_DISH = Object.keys(DISHES).find(d => DISHES[d].makes);

// --- 자물쇠 ② 전임자가 걸어 둔 배양 플라스크 넷 ------------------------------
// 숫자가 다 맞는 플라스크가 셋이다. 곰팡이까지 봐야 하나로 좁혀진다 —
// 그래서 ①을 건너뛰면 평균 한 번은 헛되이 하룻밤을 쓴다.
const FLASKS = {
  1:{dish:'B', tempC:24, days:7, pH:6.5},
  2:{dish:'B', tempC:37, days:3, pH:6.5},
  3:{dish:'A', tempC:24, days:7, pH:6.5},
  4:{dish:'C', tempC:24, days:7, pH:6.5},
  5:{dish:'B', tempC:24, days:7, pH:4.5},
};
// 30 °C가 넘으면 곰팡이보다 세균이 이긴다 — 실제 표면배양이 24~25 °C인 이유다
const contaminated = f => f.tempC >= 30;
function potencyOf(f){
  if (!DISHES[f.dish].makes) return 0;
  const warmth = f.tempC <= 10 ? 0 : f.tempC >= 30 ? 0.25 : 1;   // 4 °C면 안 자란다
  const grown  = Math.min(1, f.days / RECIPE.days);              // 절벽이 아니라 경사로
  const acid   = f.pH < 5.5 ? 0.3 : 1;                           // β-락탐은 산에서 깨진다
  return MAX_POTENCY * warmth * grown * acid;
}
const brothSees = f => {
  const p = potencyOf(f);
  if (contaminated(f)) return '누렇게 흐리다. 시큼한 냄새가 난다';
  if (p === 0 && f.tempC <= 10) return '맑다. 아무것도 자라지 않았다';
  if (p === 0) return '매트는 덮였는데 아래 배양액이 탁한 갈색이다';
  if (p < MAX_POTENCY * 0.5) return '청록색 매트가 얇고 가장자리가 삭았다';
  return '청록색 매트가 두껍게 덮였다. 아래 배양액은 맑은 노란색이다';
};

// --- 자물쇠 ③ 거르고 모으기 ------------------------------------------------
// 페니실린은 열에 깨진다. 졸이면 역가가 사라진다 — 플로리 팀이 가장 애먹은 지점.
const HEAT_KILLS_C = 60;
const filterBroth = f => ({potency:potencyOf(f), ml:FLASK_ML,
                           contaminated:contaminated(f), filtered:true});
// 얼려서 얼음을 걷어내면 두 배로 진해진다. 열을 안 쓰는 유일한 길이다.
const freeze = b => ({...b, potency:b.potency * 2, ml:b.ml / 2});
const boilDown = b => ({...b, potency:0, ml:b.ml / 2});

// --- 자물쇠 ④ 역가 — ①의 억제대가 다시 나온다 -------------------------------
// 디스크 확산. 억제대 지름은 농도의 로그에 비례한다 (옥스퍼드 역가 검정).
const DISC_ML = 0.02;             // 디스크 하나에 20 µL
const STD_UNITS = 200;            // 표준 디스크 — 이만큼은 나와야 한 번 분이 된다
const STD_ZONE = 30;              // mm
const ZONE_SLOPE = 6;             // 10배 진하면 6 mm 넓어진다
const MIC_UNITS = 2;              // 이보다 묽으면 띠가 아예 안 생긴다
const zoneMm = units => units < MIC_UNITS ? 0
  : STD_ZONE + ZONE_SLOPE * Math.log10(units / STD_UNITS);

// 1회 10만 단위를 3시간마다 다섯 번. 앨버트 알렉산더가 받던 간격 그대로다.
const DOSE_UNITS = 100000, DOSE_ML = 10, DOSES_NEEDED = 5;
const assay = b => {
  const z = zoneMm((b ? b.potency : 0) * DISC_ML);
  return {mm:z, std:STD_ZONE, pass:z >= STD_ZONE,
          sees:z === 0 ? '디스크 둘레에 아무 띠도 없다. 세균이 디스크까지 덮었다'
             : `디스크 둘레에 맑은 띠 — 지름 ${z.toFixed(0)} mm (표준 ${STD_ZONE} mm)`};
};
const sterility = b => b && b.contaminated
  ? '하룻밤 만에 콜로니가 점점이 자랐다. 세균이 들어 있다'
  : '아무것도 자라지 않았다. 깨끗하다';
function doseCheck(b){
  if (!b || !(b.ml > 0)) return 'empty';
  if (!b.filtered) return 'nofilter';
  if (b.contaminated) return 'dirty';
  if (b.potency * DOSE_ML < DOSE_UNITS) return 'weak';
  return 'ok';
}

// --- 시계 — 패혈증. 붉은 줄이 올라오는 그 속도다 -----------------------------
// 한천 접시는 하룻밤을 기다려야 읽힌다. 검정과 무균 검사가 이 방에서 가장 비싼 행동이다.
const BUDGET = 90;
const COST = {look:0, swab:2, filter:4, assay:10, sterile:10, freeze:8, heat:4, dose:5, hint:8};
const STAGES = [
  '손등이 붓고 뜨겁다. 붉은 줄이 팔로 올라온다.',
  '오한이 온다. 열이 오르고 숨이 가쁘다.',
  '헛소리를 한다. 손목 맥이 빠르고 약하다.',
  '의식이 없다.',
];
const STAGE_AT = [0, 34, 62, 88];
const stageOf = spent => STAGE_AT.reduce((n, at) => spent >= at ? n + 1 : n, 0) - 1;

const API = {AW, PENG, UNIT_UG, UNITS_PER_MG, RECIPE, MAX_POTENCY, FLASK_ML, REAGENTS,
             DISHES, DRUG_DISH, FLASKS, contaminated, potencyOf, brothSees, HEAT_KILLS_C,
             filterBroth, freeze, boilDown, DISC_ML, STD_UNITS, STD_ZONE, zoneMm, assay,
             sterility, DOSE_UNITS, DOSE_ML, DOSES_NEEDED, doseCheck,
             BUDGET, COST, STAGES, STAGE_AT, stageOf};
if (typeof module !== 'undefined') module.exports = API;
if (typeof window !== 'undefined') window.PEN = API;

// --- 자체 점검 ------------------------------------------------------------
if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert');
  const ok = (c, m) => assert.ok(c, m);

  const mw = Object.entries(PENG.counts).reduce((s, [e, n]) => s + AW[e] * n, 0);
  ok(Math.abs(mw - PENG.mw) < 0.05, `페니실린 G MW ${mw.toFixed(2)} ≈ ${PENG.mw}`);
  ok(Math.abs(UNITS_PER_MG - 1667) < 1, `1 mg = ${UNITS_PER_MG.toFixed(0)} 단위`);

  // ① 억제대가 생기는 접시는 하나뿐이다 — 플레밍이 본 것
  const zoned = Object.keys(DISHES).filter(d => DISHES[d].makes);
  assert.deepStrictEqual(zoned, ['B'], '푸른곰팡이만 세균을 비운다');

  // ② 기록표의 숫자 셋이 다 맞는 플라스크는 1번과 3번 — 곰팡이까지 봐야 하나로 좁혀진다
  const byNumbers = Object.keys(FLASKS).filter(k => {
    const f = FLASKS[k];
    return f.tempC === RECIPE.tempC && f.days === RECIPE.days && f.pH === RECIPE.pH;
  });
  assert.deepStrictEqual(byNumbers, ['1', '3', '4'], '숫자만 보면 셋이 남는다');
  const good = byNumbers.filter(k => DISHES[FLASKS[k].dish].makes);
  assert.deepStrictEqual(good, ['1'], '①을 해야 하나로 좁혀진다 — 3·4번은 곰팡이가 틀렸다');
  for (const k of ['3', '4'])
    assert.strictEqual(potencyOf(FLASKS[k]), 0, `${k}번 곰팡이는 페니실린을 안 만든다`);

  // ③④ 1번만 표준 디스크를 넘는다
  const B = Object.fromEntries(Object.keys(FLASKS).map(k => [k, filterBroth(FLASKS[k])]));
  ok(assay(B[1]).pass, `1번 ${assay(B[1]).mm.toFixed(1)} mm`);
  for (const k of ['2', '3', '4', '5'])
    ok(!assay(B[k]).pass, `${k}번은 표준에 못 미친다 (${assay(B[k]).mm.toFixed(1)} mm)`);
  assert.strictEqual(doseCheck(B[1]), 'ok');
  assert.strictEqual(doseCheck(B[2]), 'dirty', '37 °C 배양은 세균이 들어 있다');
  ok(sterility(B[2]).includes('콜로니'), '먹이기 전에 오염을 볼 수 있어야 한다');
  ok(sterility(B[1]).includes('깨끗'), '1번은 깨끗하다');
  assert.strictEqual(doseCheck(B[5]), 'weak', '산성 배양은 역가가 모자란다');
  assert.strictEqual(doseCheck({...B[1], filtered:false}), 'nofilter');

  // 열에 깨진다 — 졸이면 띠가 사라진다
  assert.strictEqual(assay(boilDown(B[1])).mm, 0, '가열하면 역가가 0이 된다');
  ok(HEAT_KILLS_C > 4, '보관은 차게');

  // 막다른 길이 아니다 — 모자란 4번도 한 번 얼리면 넘어선다
  const rescued = freeze(B[5]);
  ok(assay(rescued).pass, `5번은 한 번 얼리면 쓴다 (${assay(rescued).mm.toFixed(1)} mm)`);
  assert.strictEqual(doseCheck(rescued), 'ok');
  ok(rescued.ml >= DOSE_ML * DOSES_NEEDED, '얼려서 줄어도 다섯 번 분은 남는다');
  ok(B[1].ml >= DOSE_ML * DOSES_NEEDED + 2, '검정에 쓰고도 다섯 번 분이 남는다');

  // 역가와 억제대가 같은 말이어야 한다 — 표준 디스크가 곧 1회분의 자다
  assert.strictEqual(STD_UNITS / DISC_ML, DOSE_UNITS / DOSE_ML,
    '표준 지름을 넘으면 1회분이 된다 — 플레이어는 계산하지 않는다');

  // 시간 예산
  const best = COST.swab*4 + COST.filter + COST.assay + COST.sterile + COST.dose*DOSES_NEEDED;
  const retry = COST.filter + COST.assay + COST.sterile;   // 헛짚은 플라스크 하나를 버리는 값
  ok(best < STAGE_AT[3], `최적 경로 ${best}틱 < 사망 ${STAGE_AT[3]}틱`);
  ok(best + COST.hint*3 < STAGE_AT[3], `힌트 3회 다 써도(${best + COST.hint*3}틱) 살린다`);
  ok(best + retry < STAGE_AT[3], '한 번 헛짚어도 살릴 수 있다');
  ok(best + retry*2 >= STAGE_AT[3], '두 번 헛짚으면 못 살린다');
  ok(best + COST.freeze + COST.assay < STAGE_AT[3], '모자란 배양액을 얼려 되살리는 길은 열려 있다');
  assert.strictEqual(COST.look, 0, '읽고 보는 건 공짜여야 한다');

  console.log('penicillin self-check OK');
  console.log(`  ${PENG.formula} MW ${mw.toFixed(2)} · 1 단위 = ${UNIT_UG} µg`);
  for (const k of Object.keys(FLASKS)){
    const f = FLASKS[k], a = assay(B[k]);
    console.log(`  ${k}번 접시${f.dish} ${f.tempC} °C ${f.days}일 pH ${f.pH}` +
      ` → ${potencyOf(f).toFixed(0).padStart(5)} 단위/mL · 억제대 ${a.mm.toFixed(1)} mm` +
      `${a.pass ? ' ✔' : ''}${contaminated(f) ? ' (오염)' : ''}`);
  }
  console.log(`  1회 ${DOSE_UNITS/10000}만 단위 = ${DOSE_ML} mL × ${DOSES_NEEDED}회`);
  console.log(`  시간: 최적 ${best}틱 / 재시도 +${retry}틱 / 예산 ${BUDGET}틱`);
}
