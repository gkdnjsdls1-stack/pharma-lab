// 플레이테스트 하네스 — v1에서 가져온 질문을 방마다 그대로 묻는다.
// "단서를 읽은 사람과 찍은 사람의 성적이 같으면 게임이 아니다."
// 방마다 전략을 400개 시드에 돌려 성공률 차이를 숫자로 본다.  node playtest.js
const C = require('./chem.js');
const O = require('./ors.js');
const Q = require('./quinine.js');
const P = require('./penicillin.js');
const M = require('./methanol.js');
const BL = require('./blood.js');
const H = require('./bleach.js');
const E = require('./ether.js');

const SEEDS = 400;
const mulberry32 = a => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const pick = (rnd, xs) => xs[Math.floor(rnd() * xs.length)];
// 순서를 고르게 섞는다. 비교함수에 난수를 넣는 방식은 앞자리가 더 자주 걸린다.
const shuffle = (rnd, xs) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const BOTTLES = Object.keys(C.BOTTLES);
const fresh = () => ({spent:0, product:null,
  stock:Object.fromEntries(BOTTLES.map(b => [b, C.STOCK_G]))});
const alive = st => st.spent < C.BUDGET;

function heat(st, cond){
  if (st.stock[cond.powder] < cond.salicylicG - 1e-9) return null;
  st.spent += C.COST.react;
  st.stock[cond.powder] -= cond.salicylicG;
  const r = C.react(cond);
  st.product = r.mass > 0 ? {mass:r.mass, purity:r.purity} : null;
  return r;
}
// 염화철 → 보라색이면 천천히 식혀 재결정. 색이 사라질 때까지. 시간이 환자를 깎는다.
function purify(st, slow = true){
  st.spent += C.COST.fecl3;
  while (st.product.purity < C.MIN_PURITY && alive(st)) {
    st.spent += C.COST.recryst;
    st.product = C.recrystallize(st.product, slow);
    st.spent += C.COST.fecl3;
  }
}
function give(st){
  st.spent += C.COST.weigh + C.COST.dose;
  return alive(st)
      && st.product.purity >= C.MIN_PURITY
      && st.product.mass * 1000 >= C.DOSE_MG;
}

const STRATEGIES = {
  // 노트를 다 읽고 그대로 한다
  '노트를 읽는다': rnd => {
    const st = fresh();
    st.spent += C.COST.test * 4;                       // 병 넷을 다 찍어 본다
    heat(st, {...C.RECIPE, powder:'A'});               // 보라색이던 병
    if (!st.product) return false;
    purify(st);
    st.spent += C.COST.melt;                           // 융점으로 확인
    return alive(st) && give(st);
  },

  // 노트는 읽었지만 ④를 모른다 — 갓 만든 걸 그대로 먹인다
  '순도 검사를 건너뛴다': rnd => {
    const st = fresh();
    st.spent += C.COST.test * 4;
    heat(st, {...C.RECIPE, powder:'A'});
    if (!st.product) return false;
    return give(st);
  },

  // 아무것도 안 읽고 찍는다. 결정이 나오면 바로 먹인다
  '찍는다': rnd => {
    const st = fresh();
    st.spent += C.COST.test * (1 + Math.floor(rnd() * 3));
    for (let i = 0; i < 3 && alive(st); i++) {
      const sal = pick(rnd, [1, 2, 3]);
      if (st.stock < sal) break;
      heat(st, {powder:pick(rnd, BOTTLES), salicylicG:sal, anhydrideMl:pick(rnd, [1, 5, 10]),
                catalystDrops:Math.floor(rnd() * 9), tempC:20 + Math.floor(rnd() * 110),
                timeMin:Math.floor(rnd() * 40), vinegar:rnd() < 0.3});
      if (st.product) return give(st);
    }
    return false;
  },

  // 조건은 찍지만 ④는 안다 — 보라색이 사라질 때까지 재결정한다
  '찍고 재결정으로 버틴다': rnd => {
    const st = fresh();
    st.spent += C.COST.test * (1 + Math.floor(rnd() * 3));
    for (let i = 0; i < 3 && alive(st); i++) {
      const sal = pick(rnd, [1, 2, 3]);
      if (st.stock < sal) break;
      heat(st, {powder:pick(rnd, BOTTLES), salicylicG:sal, anhydrideMl:pick(rnd, [1, 5, 10]),
                catalystDrops:Math.floor(rnd() * 9), tempC:20 + Math.floor(rnd() * 110),
                timeMin:Math.floor(rnd() * 40), vinegar:rnd() < 0.3});
      if (st.product) { purify(st); return alive(st) && give(st); }
    }
    return false;
  },

  // 노트는 다 읽었지만 ①을 건너뛰었다 — 어느 병인지 모르니 하나씩 태워 본다
  '\u2460을 건너뛴다': rnd => {
    const st = fresh();
    const order = [...BOTTLES].sort(() => rnd() - 0.5);
    for (const b of order) {
      if (!alive(st)) return false;
      heat(st, {...C.RECIPE, powder:b});
      if (st.product) { purify(st); return alive(st) && give(st); }
    }
    return false;
  },

  // 막혀서 호출을 세 번 다 쓴다
  '힌트를 다 쓴다': rnd => {
    const st = fresh();
    st.spent += C.COST.hint * 3;
    st.spent += C.COST.test * 4;
    heat(st, {...C.RECIPE, powder:'A'});
    if (!st.product) return false;
    purify(st);
    return alive(st) && give(st);
  },
};

// --- 방 2 — 경구수액 ----------------------------------------------------
const O_STRAT = {
  '처방을 읽는다': rnd => {
    let t = O.COST.test*8 + O.COST.mix + O.COST.meter + O.COST.benedict
          + O.COST.sip*O.SIPS_NEEDED;
    const m = O.mix({...O.RECIPE, tempC:25});
    return t < O.BUDGET && m.outcome === 'ok';
  },
  '힌트를 다 쓴다': rnd => {
    let t = O.COST.hint*3 + O.COST.test*8 + O.COST.mix + O.COST.meter
          + O.COST.benedict + O.COST.sip*O.SIPS_NEEDED;
    return t < O.BUDGET && O.mix({...O.RECIPE, tempC:25}).outcome === 'ok';
  },
  // 가루는 가렸지만 양과 물을 눈대중으로 한다
  '눈대중으로 탄다': rnd => {
    let t = O.COST.test*8;
    for (let i = 0; i < 3 && t < O.BUDGET; i++){
      t += O.COST.mix + O.COST.meter;
      const m = O.mix({
        NaCl:pick(rnd,[1,2.6,5]), glucose:pick(rnd,[5,13.5,25]),
        KCl:pick(rnd,[0.5,1.5,3]), citrate3Na:pick(rnd,[1,2.9,6]),
        waterL:pick(rnd,[0.5,1,1.5,2]), tempC:pick(rnd,[25,25,100])});
      // 염도계를 보니 다시 탄다
      if (m.outcome === 'ok'){ t += O.COST.benedict + O.COST.sip*O.SIPS_NEEDED;
        return t < O.BUDGET; }
    }
    return false;
  },
  // 설탕을 빼먹는다 — 짠물만 먹이면 더 나빠진다
  '포도당을 빼먹는다': rnd => {
    const m = O.mix({...O.RECIPE, glucose:0, tempC:25});
    return m.outcome === 'ok';
  },
  // 염도계를 안 보고 바로 먹인다
  '확인 없이 먹인다': rnd => {
    const m = O.mix({NaCl:2.6, glucose:13.5, KCl:1.5, citrate3Na:2.9,
                     waterL:pick(rnd,[0.5,1,1.5,2]), tempC:25});
    return m.outcome === 'ok';
  },
};

// --- 방 3 — 퀴닌 --------------------------------------------------------
const QBAGS = Object.keys(Q.BAGS);
const QGOOD = {...Q.RECIPE, bag:Q.QUININE_BAG, filtered:true, layer:'upper'};
const qfresh = () => ({spent:0, bark:Object.fromEntries(QBAGS.map(b => [b, Q.STOCK_G]))});
const qlive = st => st.spent < Q.STAGE_AT[3];
function qextract(st, cond){
  if (st.bark[cond.bag] < cond.barkG - 1e-9) return null;
  st.spent += Q.COST.extract;
  st.bark[cond.bag] -= cond.barkG;
  const e = Q.extract(cond);
  return e.mg > 0 ? e : null;
}
function qback(st, mg, acid){
  st.spent += Q.COST.back;
  const s = Q.backExtract(mg, acid);
  return s.outcome === 'ok' ? s : null;
}
function qgive(st, sol){
  st.spent += Q.COST.dose;
  return qlive(st) && Q.doseCheck(sol) === 'ok';
}
const qwild = (rnd, bag) => ({bag, barkG:pick(rnd, [5, 10, 20]),
  acidMl:pick(rnd, [20, 100, 200]), pH:pick(rnd, [4, 7, 9, 11]),
  tolueneMl:pick(rnd, [10, 50, 100]), filtered:rnd() < 0.5,
  layer:pick(rnd, ['upper', 'lower'])});

const Q_STRAT = {
  '약전을 읽는다': rnd => {
    const st = qfresh();
    st.spent += Q.COST.test * 6;                       // 봉지 넷을 시약으로 훑는다
    const e = qextract(st, QGOOD);
    if (!e) return false;
    const sol = qback(st, e.mg, 'h2so4');
    if (!sol) return false;
    st.spent += Q.COST.uv;                             // 표준병과 밝기를 견준다
    return qgive(st, sol);
  },
  '힌트를 다 쓴다': rnd => {
    const st = qfresh();
    st.spent += Q.COST.hint * 3 + Q.COST.test * 6;
    const e = qextract(st, QGOOD);
    const sol = e && qback(st, e.mg, 'h2so4');
    if (!sol) return false;
    st.spent += Q.COST.uv;
    return qgive(st, sol);
  },
  // 약전은 읽었지만 ①을 건너뛰었다 — 봉지를 하나씩 뽑아 본다
  '\u2460을 건너뛴다': rnd => {
    const st = qfresh();
    for (const b of shuffle(rnd, QBAGS)){
      if (!qlive(st)) return false;
      const e = qextract(st, {...QGOOD, bag:b});
      if (!e) continue;
      const sol = qback(st, e.mg, 'h2so4');
      if (!sol) return false;
      st.spent += Q.COST.uv;
      return qgive(st, sol);
    }
    return false;
  },
  // 각주를 안 읽고 염산으로 되뽑았다. 램프가 캄캄해서 처음부터 다시 한다
  '염산으로 되뽑고 다시 뽑는다': rnd => {
    const st = qfresh();
    st.spent += Q.COST.test * 6;
    const e1 = qextract(st, QGOOD);
    if (!e1) return false;
    qback(st, e1.mg, 'hcl');
    st.spent += Q.COST.uv;
    const e2 = qextract(st, QGOOD);
    const sol = e2 && qback(st, e2.mg, 'h2so4');
    if (!sol) return false;
    st.spent += Q.COST.uv;
    return qgive(st, sol);
  },
  // 봉지는 가렸지만 조건을 눈대중으로 한다. 램프를 보고 다시 뽑는다
  '눈대중으로 뽑는다': rnd => {
    const st = qfresh();
    st.spent += Q.COST.test * 6;
    for (let i = 0; i < 3 && qlive(st); i++){
      const e = qextract(st, qwild(rnd, Q.QUININE_BAG));
      if (!e) continue;
      const sol = qback(st, e.mg, pick(rnd, ['h2so4', 'h2so4', 'hcl']));
      if (!sol) continue;
      st.spent += Q.COST.uv;
      if (Q.uvOn(sol).band === 'match') return qgive(st, sol);
    }
    return false;
  },
  // 밝기를 안 보고 먹인다 — 진하면 신코니즘, 묽으면 발작이 돌아온다
  '밝기를 안 보고 먹인다': rnd => {
    const st = qfresh();
    st.spent += Q.COST.test * 6;
    const e = qextract(st, {...QGOOD, barkG:pick(rnd, [5, 10, 20])});
    const sol = e && qback(st, e.mg, 'h2so4');
    return !!sol && qgive(st, sol);
  },
  '찍는다': rnd => {
    const st = qfresh();
    for (let i = 0; i < 3 && qlive(st); i++){
      const e = qextract(st, qwild(rnd, pick(rnd, QBAGS)));
      if (!e) continue;
      const sol = qback(st, e.mg, pick(rnd, Object.keys(Q.ACIDS)));
      if (sol) return qgive(st, sol);
    }
    return false;
  },
};

// --- 방 4 — 페니실린 ----------------------------------------------------
const PFLASKS = Object.keys(P.FLASKS);
const plive = st => st.spent < P.STAGE_AT[3];
// 검정 접시와 무균 접시는 같은 밤에 들어간다. 헛짚은 플라스크 하나가 하룻밤이다.
function ptry(st, k, freezeWeak){
  st.spent += P.COST.filter;
  let b = P.filterBroth(P.FLASKS[k]);
  st.spent += P.COST.assay + P.COST.sterile;
  if (!P.assay(b).pass && freezeWeak && P.assay(b).mm > 0){
    st.spent += P.COST.freeze + P.COST.assay;
    b = P.freeze(b);
  }
  return P.assay(b).pass && !/콜로니/.test(P.sterility(b)) ? b : null;
}
function pgive(st, b){
  st.spent += P.COST.dose * P.DOSES_NEEDED;
  return plive(st) && P.doseCheck(b) === 'ok' && b.ml >= P.DOSE_ML * P.DOSES_NEEDED;
}
const PNUMS = PFLASKS.filter(k => {
  const f = P.FLASKS[k];
  return f.tempC === P.RECIPE.tempC && f.days === P.RECIPE.days && f.pH === P.RECIPE.pH;
});

const P_STRAT = {
  '기록을 읽는다': rnd => {
    const st = {spent:P.COST.swab * 4};                // 접시 넷에 검체를 긋는다
    const b = ptry(st, '1', true);
    return !!b && pgive(st, b);
  },
  '힌트를 다 쓴다': rnd => {
    const st = {spent:P.COST.hint * 3 + P.COST.swab * 4};
    const b = ptry(st, '1', true);
    return !!b && pgive(st, b);
  },
  // 숫자만 맞춰 플라스크를 고른다 — 어느 곰팡이가 약을 만드는지는 모른다
  '\u2460을 건너뛴다': rnd => {
    const st = {spent:0};
    for (const k of shuffle(rnd, PNUMS)){
      if (!plive(st)) return false;
      const b = ptry(st, k, true);
      if (b) return pgive(st, b);
    }
    return false;
  },
  // 역가가 모자라서 졸인다 — 열에 깨진다
  '졸여서 진하게 한다': rnd => {
    const st = {spent:P.COST.swab * 4 + P.COST.filter};
    let b = P.filterBroth(P.FLASKS[pick(rnd, ['1', '5'])]);
    st.spent += P.COST.heat;
    b = P.boilDown(b);
    st.spent += P.COST.assay;
    return P.assay(b).pass && pgive(st, b);
  },
  // 검정도 무균 검사도 없이 바로 넣는다
  '검정 없이 넣는다': rnd => {
    const st = {spent:P.COST.swab * 4 + P.COST.filter};
    return pgive(st, P.filterBroth(P.FLASKS[pick(rnd, PFLASKS)]));
  },
  '찍는다': rnd => {
    const st = {spent:0};
    for (let i = 0; i < 2 && plive(st); i++){
      st.spent += P.COST.filter;
      let b = P.filterBroth(P.FLASKS[pick(rnd, PFLASKS)]);
      if (rnd() < 0.5){ st.spent += P.COST.heat; b = P.boilDown(b); }
      if (rnd() < 0.5){ st.spent += P.COST.freeze; b = P.freeze(b); }
      if (rnd() < 0.5) return pgive(st, b);
    }
    return false;
  },
};

// --- 방 5 — 메탄올 중독 --------------------------------------------------
const MB = Object.keys(M.BOTTLES);
const mlive = st => st.spent < M.STAGE_AT[3];
function mdistill(st, src, headMl, cutC, cups){
  st.spent += M.COST.distill;
  const d = M.distill({source:src, headMl, cutC});
  if (!(d.abv > 0)) return null;
  st.spent += M.COST.mix;
  return {...d, abv:M.dilute(d.abv, cups)};
}
const mgive = (st, sol) => {
  st.spent += M.COST.dose;
  return mlive(st) && M.doseCheck(sol) === 'ok';
};

const M_STRAT = {
  '지침을 읽는다': rnd => {
    const st = {spent:M.COST.test * 6};
    const sol = mdistill(st, M.WASH_BOTTLE, M.RECIPE.headMl, M.RECIPE.cutC, M.RECIPE.waterCups);
    if (!sol) return false;
    st.spent += M.COST.schiff + M.COST.hydro;       // 쉬프와 비중계로 확인한다
    return mgive(st, sol);
  },
  '힌트를 다 쓴다': rnd => {
    const st = {spent:M.COST.hint * 3 + M.COST.test * 6};
    const sol = mdistill(st, M.WASH_BOTTLE, M.RECIPE.headMl, M.RECIPE.cutC, M.RECIPE.waterCups);
    if (!sol) return false;
    st.spent += M.COST.schiff + M.COST.hydro;
    return mgive(st, sol);
  },
  // 지침은 읽었지만 어느 병이 밀주인지 모른다 — 하나씩 올려 본다
  '①을 건너뛴다': rnd => {
    const st = {spent:0};
    for (const b of shuffle(rnd, MB)){
      if (!mlive(st)) return false;
      const sol = mdistill(st, b, M.RECIPE.headMl, M.RECIPE.cutC, M.RECIPE.waterCups);
      if (!sol) continue;
      st.spent += M.COST.schiff + M.COST.hydro;
      return mgive(st, sol);
    }
    return false;
  },
  // 머리를 안 버리고 그대로 먹인다
  '머리를 안 버린다': rnd => {
    const st = {spent:M.COST.test * 6};
    const sol = mdistill(st, M.WASH_BOTTLE, 0, M.RECIPE.cutC, M.RECIPE.waterCups);
    return !!sol && mgive(st, sol);
  },
  // 물을 안 타고 본류를 그대로 먹인다
  '물을 안 탄다': rnd => {
    const st = {spent:M.COST.test * 6};
    const sol = mdistill(st, M.WASH_BOTTLE, M.RECIPE.headMl, M.RECIPE.cutC, 0);
    return !!sol && mgive(st, sol);
  },
  '찍는다': rnd => {
    const st = {spent:0};
    for (let i = 0; i < 3 && mlive(st); i++){
      const sol = mdistill(st, pick(rnd, MB), pick(rnd, [0, 20, 50]),
                           pick(rnd, [60, 66, 78, 95]), pick(rnd, [0, 1, 2]));
      if (sol) return mgive(st, sol);
    }
    return false;
  },
};

// --- 방 6 — 수혈 ---------------------------------------------------------
const BBAGS = Object.keys(BL.BAGS);
const blive = st => st.spent < BL.STAGE_AT[3];
// 천천히 달면 오한에서 멈출 수 있다. 다만 한 번뿐이고, 멈춰도 환자는 깎인다.
function bhang(st, bag, warmC){
  st.spent += BL.COST.warm + BL.COST.unit;
  const r = BL.transfuse({bag, warmC, slow:true});
  if (r.outcome === 'ok') return 'ok';
  if ((r.outcome === 'rh' || r.outcome === 'abo') && !st.warned){
    st.warned = true; st.spent += BL.COST.reaction; return 'stopped';
  }
  return 'dead';
}
function brun(st, order, warmC){
  let units = 0;
  for (const b of order){
    if (!blive(st)) return false;
    const r = bhang(st, b, warmC);
    if (r === 'dead') return false;
    if (r === 'ok' && ++units >= BL.UNITS_NEEDED) return blive(st);
  }
  return false;
}

const B_STRAT = {
  '항D까지 본다': rnd => {
    const st = {spent:BL.COST.type * 3 + BL.COST.type * BBAGS.length};
    const fit = BBAGS.filter(b => BL.typeTest(BL.BAGS[b], 'antiD') === BL.SMOOTH);
    st.spent += BL.COST.cross * fit.length;          // 좁힌 둘만 교차시험한다
    return brun(st, fit, BL.RECIPE.warmC);
  },
  '힌트를 다 쓴다': rnd => {
    const st = {spent:BL.COST.hint * 3 + BL.COST.type * (3 + BBAGS.length)};
    const fit = BBAGS.filter(b => BL.typeTest(BL.BAGS[b], 'antiD') === BL.SMOOTH);
    st.spent += BL.COST.cross * fit.length;
    return brun(st, fit, BL.RECIPE.warmC);
  },
  // 교차시험만 믿는다 — 통과한 주머니를 순서대로 단다
  '교차시험만 믿는다': rnd => {
    const st = {spent:0};
    const order = [];
    for (const b of shuffle(rnd, BBAGS)){
      st.spent += BL.COST.cross;
      if (BL.crossmatch(BL.BAGS[b]).ok) order.push(b);
      if (order.length >= BL.UNITS_NEEDED && rnd() < 0.7) break;   // 둘 찾으면 대개 멈춘다
    }
    return brun(st, order, BL.RECIPE.warmC);
  },
  // 찬 피를 그대로 단다
  '가온을 안 한다': rnd => {
    const st = {spent:BL.COST.type * 3 + BL.COST.cross * 2};
    return brun(st, ['D', 'E'], BL.RECIPE.keepC);
  },
  '찍는다': rnd => {
    const st = {spent:0};
    return brun(st, shuffle(rnd, BBAGS).slice(0, 3), pick(rnd, [4, 37, 50]));
  },
};

// --- 방 7 — 소독액 -------------------------------------------------------
const hlive = st => st.spent < H.STAGE_AT[3];
function htitrate(st, sampleMl, starchEarly){
  st.spent += H.COST.titrate;
  return H.titrate({jug:H.BLEACH_JUG, ...H.RECIPE, sampleMl, starchEarly});
}
function hmix(st, cups){
  st.spent += H.COST.mix;
  st.cups = (st.cups || 0) + 1;
  return st.cups <= H.STOCK_CUPS ? H.diluteTo(H.STOCK_PCT, cups) : null;
}
const hsoak = (st, made) => {
  st.spent += H.COST.soak;
  return hlive(st) && H.soakCheck(made) === 'ok';
};

const H_STRAT = {
  '약전을 읽는다': rnd => {
    const st = {spent:H.COST.test * 6};
    const t = htitrate(st, H.RECIPE.sampleMl, false);
    if (!t.ml) return false;
    const made = hmix(st, H.CUPS_FOR(H.pctOf(t.ml)));
    st.spent += H.COST.strip;
    return hsoak(st, made);
  },
  '힌트를 다 쓴다': rnd => {
    const st = {spent:H.COST.hint * 3 + H.COST.test * 6};
    const t = htitrate(st, H.RECIPE.sampleMl, false);
    if (!t.ml) return false;
    const made = hmix(st, H.CUPS_FOR(H.pctOf(t.ml)));
    st.spent += H.COST.strip;
    return hsoak(st, made);
  },
  // 녹말을 처음부터 넣어 종말점을 뭉갠다 — 다시 적정하면 된다
  '녹말을 처음부터 넣는다': rnd => {
    const st = {spent:H.COST.test * 6};
    htitrate(st, H.RECIPE.sampleMl, true);
    const t = htitrate(st, H.RECIPE.sampleMl, false);
    if (!t.ml || !hlive(st)) return false;
    const made = hmix(st, H.CUPS_FOR(H.pctOf(t.ml)));
    st.spent += H.COST.strip;
    return hsoak(st, made);
  },
  // 시료 양을 눈대중으로 — 표에서 엉뚱한 줄을 읽는다. 전분지를 보면 고칠 기회가 있다
  '시료를 눈대중으로 한다': rnd => {
    const st = {spent:H.COST.test * 6};
    const t = htitrate(st, pick(rnd, [1, 2, 4]), false);
    if (!t.ml) return false;
    let cups = H.CUPS_FOR(H.pctOf(t.ml));
    let made = hmix(st, cups);
    st.spent += H.COST.strip;
    for (let i = 0; i < 2 && hlive(st) && H.stripOn(made).band !== 'ok'; i++){
      cups = H.stripOn(made).band === 'over' ? cups + 2 : Math.max(0, cups - 2);
      made = hmix(st, cups);
      if (made === null) return false;
      st.spent += H.COST.strip;
    }
    return hsoak(st, made);
  },
  // 전분지로 견주지 않고 그대로 담근다
  '견주지 않고 담근다': rnd => {
    const st = {spent:H.COST.test * 6};
    const t = htitrate(st, pick(rnd, [1, 2, 4]), false);
    if (!t.ml) return false;
    return hsoak(st, hmix(st, H.CUPS_FOR(H.pctOf(t.ml))));
  },
  '찍는다': rnd => {
    const st = {spent:0};
    const t = htitrate(st, pick(rnd, [1, 2, 4]), rnd() < 0.5);
    if (!t.ml) return false;
    const made = hmix(st, pick(rnd, [0, 1, 3, 7]));
    return made !== null && hsoak(st, made);
  },
};

// --- 방 8 — 마취 ---------------------------------------------------------
const EB = Object.keys(E.BOTTLES);
const elive = st => st.spent < E.STAGE_AT[3];
function eprep(st, aluminaG, cutC, leaveMl){
  st.spent += E.COST.column;
  const feed = E.column(E.BATCH_ML, aluminaG);
  st.spent += E.COST.distill;
  const d = E.distill({feed, cutC, leaveMl});
  if (d.outcome === 'boom' || d.outcome === 'dry') return 'dead';
  return d.outcome === 'ok' ? d : null;
}
const emask = (st, product, pct) => {
  st.spent += E.COST.anes;
  return elive(st) && E.anesthetize({product, pct}) === 'ok';
};

const E_STRAT = {
  '기록을 읽는다': rnd => {
    const st = {spent:E.COST.test * 8};
    const p = eprep(st, E.RECIPE.aluminaG, E.RECIPE.cutC, E.RECIPE.leaveMl);
    if (!p || p === 'dead') return false;
    st.spent += E.COST.iron;
    return emask(st, p, E.RECIPE.anesPct);
  },
  '힌트를 다 쓴다': rnd => {
    const st = {spent:E.COST.hint * 3 + E.COST.test * 8};
    const p = eprep(st, E.RECIPE.aluminaG, E.RECIPE.cutC, E.RECIPE.leaveMl);
    if (!p || p === 'dead') return false;
    st.spent += E.COST.iron;
    return emask(st, p, E.RECIPE.anesPct);
  },
  // 붉은 수칙을 안 읽고 바닥까지 졸인다
  '바닥까지 졸인다': rnd => {
    const st = {spent:E.COST.test * 8};
    const p = eprep(st, 0, E.RECIPE.cutC, 0);
    return p !== 'dead' && p !== null && emask(st, p, E.RECIPE.anesPct);
  },
  // 안 거르고 조심해서 증류한 뒤 그대로 씌운다
  '거르지 않고 씌운다': rnd => {
    const st = {spent:E.COST.test * 8};
    const p = eprep(st, 0, E.RECIPE.cutC, E.RECIPE.leaveMl);
    return p !== 'dead' && p !== null && emask(st, p, E.RECIPE.anesPct);
  },
  // 철 시약이 다시 붉어지는 걸 보고 한 번 더 거른다
  '붉은색을 보고 다시 거른다': rnd => {
    const st = {spent:E.COST.test * 8};
    let p = eprep(st, 0, E.RECIPE.cutC, E.RECIPE.leaveMl);
    if (p === 'dead' || !p) return false;
    st.spent += E.COST.iron;
    if (E.ironOn(p).includes('붉은색')){
      p = eprep(st, E.RECIPE.aluminaG, E.RECIPE.cutC, E.RECIPE.leaveMl);
      if (p === 'dead' || !p) return false;
      st.spent += E.COST.iron;
    }
    return emask(st, p, E.RECIPE.anesPct);
  },
  '찍는다': rnd => {
    const st = {spent:0};
    for (let i = 0; i < 2 && elive(st); i++){
      const p = eprep(st, pick(rnd, [0, 5, 20]), pick(rnd, [20, 35, 60]), pick(rnd, [0, 10]));
      if (p === 'dead') return false;
      if (p) return emask(st, p, pick(rnd, [1, 5, 12]));
    }
    return false;
  },
};

const rate = {};
for (const [name, play] of Object.entries(STRATEGIES)) {
  let won = 0;
  for (let s = 0; s < SEEDS; s++) if (play(mulberry32(s + 1))) won++;
  rate[name] = won / SEEDS;
}

const run = strat => {
  const r = {};
  for (const [name, play] of Object.entries(strat)) {
    let won = 0;
    for (let s = 0; s < SEEDS; s++) if (play(mulberry32(s + 1))) won++;
    r[name] = won / SEEDS;
  }
  return r;
};
const orate = run(O_STRAT), qrate = run(Q_STRAT), prate = run(P_STRAT);
const mrate = run(M_STRAT), brate = run(B_STRAT), hrate = run(H_STRAT), erate = run(E_STRAT);

const pct = x => (x * 100).toFixed(1).padStart(5) + '%';
console.log(`플레이테스트 — 시드 ${SEEDS}개\n`);
console.log('  [1] 아스피린');
for (const [name, r] of Object.entries(rate))
  console.log(`  ${pct(r)}  ${name}`);
for (const [no, title, t] of [[2, '경구수액', orate], [3, '퀴닌', qrate], [4, '페니실린', prate],
                              [5, '메탄올 중독', mrate], [6, '수혈', brate],
                              [7, '소독액', hrate], [8, '마취', erate]]) {
  console.log(`\n  [${no}] ${title}`);
  for (const [name, r] of Object.entries(t))
    console.log(`  ${pct(r)}  ${name}`);
}

const gap = rate['노트를 읽는다'] - rate['찍는다'];
console.log(`\n  읽은 사람 − 찍은 사람 = ${(gap * 100).toFixed(1)} 포인트`);

// --- 설계가 깨졌는지 보는 자리 ---------------------------------------------
const assert = require('assert');
assert.ok(rate['노트를 읽는다'] >= 0.95,
  `노트를 읽으면 이겨야 한다 (${pct(rate['노트를 읽는다'])})`);
assert.ok(rate['찍는다'] <= 0.15,
  `찍어서 이기면 게임이 아니다 (${pct(rate['찍는다'])})`);
assert.ok(gap >= 0.5,
  `읽은 사람과 찍은 사람의 차이가 50포인트는 나야 한다 (${(gap*100).toFixed(1)})`);
assert.strictEqual(rate['순도 검사를 건너뛴다'], 0,
  '조생성물을 그대로 먹이면 반드시 실패해야 한다 — ④가 클라이맥스인 이유');
assert.ok(rate['힌트를 다 쓴다'] >= 0.95,
  `힌트를 다 써도 살릴 수는 있어야 한다 (${pct(rate['힌트를 다 쓴다'])})`);
assert.ok(rate['찍고 재결정으로 버틴다'] > rate['찍는다'],
  '④를 알면 찍어도 성적이 올라야 한다');
assert.ok(rate['찍고 재결정으로 버틴다'] < rate['노트를 읽는다'],
  '④만 알고 ②를 모르면 노트를 읽은 사람을 못 따라와야 한다');
assert.ok(rate['①을 건너뛴다'] < rate['노트를 읽는다'],
  `①을 건너뛰면 성적이 떨어져야 한다 — 안 그러면 ①이 장식이다 (${pct(rate['①을 건너뛴다'])})`);
assert.ok(rate['①을 건너뛴다'] > 0,
  '다만 운이 좋으면 되긴 해야 한다 — 막다른 길은 만들지 않는다');

// --- 방 2도 같은 질문을 통과해야 한다 -------------------------------------
assert.strictEqual(orate['처방을 읽는다'], 1, '처방을 읽으면 살린다');
assert.strictEqual(orate['힌트를 다 쓴다'], 1, '힌트를 다 써도 살린다');
assert.strictEqual(orate['포도당을 빼먹는다'], 0,
  '포도당 없이는 반드시 실패해야 한다 — 그게 ORS의 전부다');
assert.ok(orate['눈대중으로 탄다'] < 0.5,
  `눈대중으로 타면 대체로 실패해야 한다 (${pct(orate['눈대중으로 탄다'])})`);
assert.ok(orate['확인 없이 먹인다'] < 0.5,
  `물 양을 안 맞추면 대체로 실패해야 한다 (${pct(orate['확인 없이 먹인다'])})`);
assert.ok(orate['처방을 읽는다'] - orate['눈대중으로 탄다'] >= 0.5,
  '읽은 사람과 눈대중한 사람의 차이가 50포인트는 나야 한다');

// --- 방 3도 같은 질문을 통과해야 한다 -------------------------------------
assert.strictEqual(qrate['약전을 읽는다'], 1, '약전을 읽으면 살린다');
assert.strictEqual(qrate['힌트를 다 쓴다'], 1, '힌트를 다 써도 살린다');
assert.ok(qrate['찍는다'] <= 0.15, `찍어서 이기면 게임이 아니다 (${pct(qrate['찍는다'])})`);
assert.ok(qrate['약전을 읽는다'] - qrate['찍는다'] >= 0.5, '읽은 사람과 찍은 사람이 갈려야 한다');
assert.ok(qrate['밝기를 안 보고 먹인다'] < 0.5,
  `밝기를 안 견주면 대체로 실패해야 한다 (${pct(qrate['밝기를 안 보고 먹인다'])})`);
assert.ok(qrate['눈대중으로 뽑는다'] < qrate['약전을 읽는다'], '눈대중은 약전을 못 따라온다');
assert.strictEqual(qrate['염산으로 되뽑고 다시 뽑는다'], 1,
  '형광이 죽어도 막다른 길은 아니어야 한다 — 다시 뽑으면 된다');
assert.ok(qrate['①을 건너뛴다'] < qrate['약전을 읽는다'] && qrate['①을 건너뛴다'] > 0,
  `①을 건너뛰면 벌점이되 사형은 아니다 (${pct(qrate['①을 건너뛴다'])})`);

// --- 방 4도 마찬가지다 ----------------------------------------------------
assert.strictEqual(prate['기록을 읽는다'], 1, '기록을 읽으면 살린다');
assert.strictEqual(prate['힌트를 다 쓴다'], 1, '힌트를 다 써도 살린다');
assert.strictEqual(prate['졸여서 진하게 한다'], 0, '가열하면 역가가 사라진다');
assert.ok(prate['찍는다'] <= 0.15, `찍어서 이기면 게임이 아니다 (${pct(prate['찍는다'])})`);
assert.ok(prate['기록을 읽는다'] - prate['찍는다'] >= 0.5, '읽은 사람과 찍은 사람이 갈려야 한다');
assert.ok(prate['검정 없이 넣는다'] < 0.5,
  `역가를 안 재면 대체로 실패해야 한다 (${pct(prate['검정 없이 넣는다'])})`);
assert.ok(prate['①을 건너뛴다'] < prate['기록을 읽는다'] && prate['①을 건너뛴다'] > 0,
  `①을 건너뛰면 벌점이되 사형은 아니다 (${pct(prate['①을 건너뛴다'])})`);

// --- 방 5~8도 같은 질문을 통과해야 한다 -----------------------------------
const gate = (name, t, readKey, guessKey) => {
  assert.strictEqual(t[readKey], 1, `[${name}] 읽으면 살린다`);
  assert.strictEqual(t['힌트를 다 쓴다'], 1, `[${name}] 힌트를 다 써도 살린다`);
  assert.ok(t[guessKey] <= 0.15, `[${name}] 찍어서 이기면 게임이 아니다 (${pct(t[guessKey])})`);
  assert.ok(t[readKey] - t[guessKey] >= 0.5, `[${name}] 읽은 사람과 찍은 사람이 갈려야 한다`);
};
gate('메탄올', mrate, '지침을 읽는다', '찍는다');
assert.strictEqual(mrate['머리를 안 버린다'], 0, '메탄올이 남은 것을 먹이면 반드시 진다');
assert.strictEqual(mrate['물을 안 탄다'], 0, '희석하지 않으면 반드시 진다');
assert.ok(mrate['①을 건너뛴다'] < mrate['지침을 읽는다'] && mrate['①을 건너뛴다'] > 0,
  `①을 건너뛰면 벌점이되 사형은 아니다 (${pct(mrate['①을 건너뛴다'])})`);

gate('수혈', brate, '항D까지 본다', '찍는다');
assert.strictEqual(brate['가온을 안 한다'], 0, '찬 피를 그대로 넣으면 반드시 진다');
assert.ok(brate['교차시험만 믿는다'] < 0.5,
  `교차시험만 믿으면 대체로 실패해야 한다 — Rh는 못 잡는다 (${pct(brate['교차시험만 믿는다'])})`);

gate('소독액', hrate, '약전을 읽는다', '찍는다');
assert.strictEqual(hrate['견주지 않고 담근다'] < 0.5, true,
  `전분지로 안 견주면 대체로 실패해야 한다 (${pct(hrate['견주지 않고 담근다'])})`);
assert.ok(hrate['녹말을 처음부터 넣는다'] > 0 && hrate['녹말을 처음부터 넣는다'] <= 1,
  '종말점을 뭉개도 다시 적정할 수 있다');
assert.ok(hrate['시료를 눈대중으로 한다'] < hrate['약전을 읽는다'],
  '눈대중은 약전을 못 따라온다');

gate('마취', erate, '기록을 읽는다', '찍는다');
assert.strictEqual(erate['바닥까지 졸인다'], 0, '거르지 않고 졸이면 반드시 터진다');
assert.strictEqual(erate['거르지 않고 씌운다'], 0, '과산화물이 남은 것을 씌우면 반드시 진다');
assert.ok(erate['붉은색을 보고 다시 거른다'] > 0.9,
  `④를 알면 되돌릴 수 있어야 한다 (${pct(erate['붉은색을 보고 다시 거른다'])})`);

console.log('\nplaytest OK — 여덟 방 다 설계 경계가 살아 있다');
