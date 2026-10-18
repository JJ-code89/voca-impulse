"use strict";

const fs = require("fs");
const path = require("path");

const datasetPath = path.join(__dirname, "words.json");
const words = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
const occupied = new Set(words
  .filter((entry) => !/[\s-]/.test(entry.word))
  .map((entry) => entry.word.toLocaleLowerCase()));

const lexicon = [];
function add(group, partOfSpeech, rows) {
  rows.trim().split(/\r?\n/).forEach((row) => {
    const [word, meaning, synonymText] = row.split("|");
    lexicon.push({
      word,
      meaning,
      synonyms: synonymText.split(","),
      partOfSpeech,
      semanticGroup: group,
      curated: true
    });
  });
}

// 한글 주석: 학술 연구와 논증에서 자주 쓰이는 단일 표제어를 의미 범주별로 보충해요.
add("research_method", "v", `
corroborate|실증적으로 뒷받침하다, 확증하다|confirm, substantiate
scrutinize|면밀히 검토하다, 정밀 조사하다|examine, inspect
extrapolate|자료를 바탕으로 추론하다, 외삽하다|infer, project
operationalize|조작적으로 정의하다, 측정 가능하게 만들다|define, specify
replicate|재현하다, 반복 실험하다|reproduce, repeat
triangulate|다각도로 교차 검증하다|verify, crosscheck
quantify|수량화하다, 정량적으로 나타내다|measure, calculate
sample|표본을 추출하다, 표집하다|select, survey
calibrate|보정하다, 기준에 맞추다|adjust, standardize
aggregate|집계하다, 총합을 내다|compile, combine
disaggregate|세분화하다, 항목별로 분해하다|separate, divide
tabulate|표로 정리하다, 도표화하다|chart, list
code|분류 부호를 부여하다, 코딩하다|classify, label
interrogate|비판적으로 조사하다, 심문하다|question, examine
construe|해석하다, 의미를 파악하다|interpret, understand
extrapose|뒤로 이동시키다, 외치하다|transpose, relocate
elicit|끌어내다, 반응을 유도하다|evoke, draw
standardize|표준화하다, 기준을 통일하다|normalize, regularize
validate|타당성을 검증하다, 유효성을 확인하다|verify, confirm
operationalize|조작적으로 정의하다, 측정 가능하게 만들다|define, specify
`);
add("logic_evidence", "v", `
substantiate|근거로 입증하다, 실증적으로 뒷받침하다|corroborate, verify
repudiate|공식적으로 부인하다, 논박하다|reject, disavow
refute|반증하다, 논리적으로 논박하다|disprove, rebut
rebut|반론을 제기하다, 반박하다|counter, refute
deduce|전제로부터 연역하다, 논리적으로 도출하다|infer, derive
induce|사례에서 일반 원리를 귀납하다|infer, conclude
presuppose|전제하다, 미리 가정하다|assume, posit
conjecture|추측하다, 근거가 불충분한 가설을 세우다|speculate, surmise
infer|증거에서 추론하다, 함축을 도출하다|deduce, conclude
demonstrate|논증으로 입증하다, 명백히 보여주다|prove, establish
verify|사실 여부를 검증하다, 확인하다|confirm, validate
falsify|반증하다, 거짓임을 입증하다|disprove, invalidate
correlate|상관관계를 보이다, 연관 짓다|associate, relate
disconfirm|가설을 반박하다, 부정적 증거를 제시하다|contradict, refute
entail|논리적으로 수반하다, 필연적으로 포함하다|necessitate, imply
impute|원인이나 책임을 귀속시키다|attribute, ascribe
postulate|가정하다, 공리로 설정하다|assume, posit
concede|일부 주장을 인정하다, 양보하다|admit, grant
qualify|주장의 범위를 한정하다, 단서를 달다|restrict, modify
corroborate|독립된 자료로 확증하다, 뒷받침하다|confirm, substantiate
`);
add("change_degree", "v", `
ameliorate|상태를 개선하다, 악화를 완화하다|improve, enhance
exacerbate|문제를 악화시키다, 심화하다|worsen, aggravate
attenuate|강도나 효과를 약화시키다, 희석하다|lessen, diminish
alleviate|고통이나 부담을 경감하다, 완화하다|ease, mitigate
proliferate|급속히 증식하다, 광범위하게 확산하다|multiply, spread
decelerate|속도를 늦추다, 둔화시키다|slow, retard
intensify|강도나 정도를 높이다, 심화하다|strengthen, heighten
diminish|양이나 중요성을 줄이다, 감소하다|decrease, lessen
augment|규모나 힘을 증대하다, 늘리다|increase, enlarge
curtail|범위나 기간을 축소하다, 삭감하다|reduce, restrict
supersede|기존 것을 대체하다, 대신하다|replace, displace
transmute|성질을 근본적으로 바꾸다, 변형하다|transform, convert
stagnate|정체하다, 발전이 멈추다|plateau, stall
rejuvenate|활력을 되찾게 하다, 새롭게 하다|revitalize, renew
mitigate|부정적 영향을 완화하다, 경감하다|alleviate, attenuate
consolidate|분산된 것을 통합하다, 강화하다|unify, strengthen
deplete|자원이나 양을 고갈시키다, 소진하다|exhaust, drain
protract|시간이나 과정을 늘이다, 연장하다|prolong, extend
compress|부피나 기간을 압축하다, 줄이다|condense, contract
fluctuate|수치가 불규칙하게 오르내리다, 변동하다|vary, oscillate
`);
add("ambiguity_clarity", "v", `
obfuscate|의미를 의도적으로 모호하게 만들다|obscure, confuse
elucidate|복잡한 내용을 명료하게 설명하다|clarify, explain
disambiguate|중의성을 제거하다, 의미를 명확히 구분하다|clarify, specify
equivocate|모호하게 말하다, 확답을 피하다|prevaricate, hedge
delineate|경계나 특징을 명확히 규정하다|define, outline
articulate|생각을 조리 있게 표현하다|express, formulate
obscure|의미나 사실을 흐리다, 불분명하게 하다|conceal, cloud
qualify|단정적 표현을 제한하다, 유보하다|temper, restrict
conflate|서로 다른 개념을 혼동하여 하나로 취급하다|confuse, merge
distinguish|미묘한 차이를 식별하다, 구별하다|differentiate, discern
explicate|개념을 상세히 풀어 설명하다|interpret, elucidate
misconstrue|의미를 잘못 해석하다, 오해하다|misinterpret, distort
clarify|모호함을 없애 명확히 하다|elucidate, explain
specify|조건이나 범위를 구체적으로 명시하다|define, stipulate
veil|의도나 의미를 가리다, 감추다|mask, conceal
`);
add("system_structure", "n", `
dichotomy|상호 배타적인 이분법, 양자 대립|dualism, division
paradigm|사고의 틀, 지배적 이론 모형|model, framework
idiosyncrasy|개인이나 체계의 독특한 특성, 특이성|peculiarity, quirk
hierarchy|상하 위계 구조, 계층 체계|ranking, order
taxonomy|원리에 따른 분류 체계, 분류학|classification, system
architecture|구성 요소 간의 구조, 설계 체계|structure, design
infrastructure|기능을 뒷받침하는 기반 시설, 하부 구조|framework, foundation
mechanism|작동 원리, 인과적 기제|process, apparatus
configuration|요소들의 배열 방식, 구성 형태|arrangement, structure
constituent|구성 요소, 구성 성분|component, element
stratification|층위화, 사회적 계층 분화|layering, ranking
substrate|작용이 일어나는 바탕, 기질|base, foundation
continuum|불연속 구분이 없는 연속체|spectrum, range
polarity|양극성, 대립하는 두 극의 관계|opposition, duality
interdependence|상호 의존 관계, 상호 종속성|dependence, reciprocity
`);
add("behavior_attitude", "v", `
acquiesce|마지못해 동의하다, 묵인하다|consent, comply
recalcitrate|완강히 저항하다, 권위에 반항하다|resist, rebel
capitulate|압력에 굴복하다, 항복하다|surrender, yield
eschew|의식적으로 피하다, 삼가다|avoid, shun
exhort|강하게 촉구하다, 권고하다|urge, encourage
defer|판단이나 행동을 미루다, 연기하다|postpone, delay
contemplate|신중히 고려하다, 깊이 생각하다|consider, ponder
provoke|반응을 유발하다, 자극하다|incite, elicit
prevaricate|진실을 회피하며 얼버무리다|equivocate, evade
disavow|관계나 책임을 부인하다, 철회하다|deny, repudiate
reconcile|대립을 조정하다, 화해시키다|mediate, harmonize
coerce|위협이나 압력으로 강제하다|compel, force
placate|상대의 분노를 누그러뜨리다, 달래다|appease, pacify
persevere|어려움에도 끈기 있게 지속하다|persist, endure
capitulate|저항을 포기하고 굴복하다|yield, surrender
`);
add("behavior_attitude", "adj", `
recalcitrant|권위에 완강히 저항하는, 다루기 힘든|defiant, obstinate
perfidious|신뢰를 저버리는, 배신적인|treacherous, disloyal
fastidious|세부에 지나치게 까다로운, 꼼꼼한|meticulous, exacting
capricious|변덕스럽고 예측하기 어려운|fickle, erratic
pragmatic|실제 효과와 조건을 중시하는, 실용적인|practical, realistic
idiosyncratic|개인이나 집단 특유의, 독특한|peculiar, distinctive
refractory|통제나 치료에 잘 반응하지 않는, 완고한|resistant, stubborn
intransigent|타협을 거부하는, 비타협적인|unyielding, uncompromising
complacent|자기만족에 빠져 경계심이 느슨한|self-satisfied, smug
dispassionate|감정에 치우치지 않는, 냉정한|impartial, detached
scrupulous|원칙과 세부를 엄격히 지키는, 양심적인|conscientious, meticulous
tenuous|근거나 연결이 빈약한, 미약한|weak, flimsy
`);
add("logic_evidence", "adj", `
equivocal|둘 이상의 해석이 가능한, 모호한|ambiguous, uncertain
ostensible|겉으로 표방되는, 실제와 다를 수 있는|apparent, purported
concomitant|다른 현상과 동시에 수반되는|accompanying, attendant
empirical|관찰이나 실험 자료에 근거한, 실증적인|observational, evidence-based
anomalous|규칙이나 예상에서 벗어난, 이례적인|aberrant, atypical
inconclusive|결론을 확정하기에 증거가 불충분한|indeterminate, unresolved
corroborative|독립된 증거로 주장을 뒷받침하는|confirmatory, supportive
ostensible|표면상 그러한, 명목상의|apparent, purported
`);
add("ambiguity_clarity", "adj", `
ambiguous|해석이 하나로 확정되지 않는, 모호한|equivocal, unclear
esoteric|소수의 전문가만 이해하는, 난해한|arcane, abstruse
inchoate|아직 충분히 형성되지 않은, 초기의|undeveloped, nascent
perfunctory|형식만 갖추고 세심함이 결여된, 피상적인|cursory, superficial
lucid|논리와 표현이 명료한, 이해하기 쉬운|clear, intelligible
opaque|의미나 작동 원리가 불투명한, 이해하기 어려운|obscure, impenetrable
explicit|의미나 조건을 분명히 진술한, 명시적인|unequivocal, definite
nuanced|미묘한 차이와 맥락을 반영하는, 섬세한|subtle, refined
`);
add("change_degree", "adj", `
ephemeral|지속 시간이 매우 짧은, 덧없는|transient, fleeting
ubiquitous|사실상 모든 곳에 존재하는, 만연한|pervasive, omnipresent
superfluous|필요 이상으로 남는, 불필요한|redundant, excessive
intractable|해결하거나 통제하기 극히 어려운|unmanageable, stubborn
incremental|작은 단계가 누적되는, 점진적인|gradual, phased
protracted|예상보다 오래 계속되는, 장기화된|prolonged, extended
negligible|영향이나 크기가 무시할 정도로 작은|trivial, insignificant
pervasive|광범위하게 퍼져 영향을 미치는, 만연한|ubiquitous, prevalent
`);
add("system_structure", "adj", `
intrinsic|대상의 본질에 내재한, 고유한|inherent, essential
extrinsic|대상의 외부 조건에서 비롯된, 외재적인|external, incidental
discrete|서로 분리되어 개별적으로 구별되는|separate, distinct
convergent|여러 경로나 관점이 한곳으로 모이는|coalescent, merging
divergent|서로 다른 방향으로 갈라지는, 발산하는|deviating, branching
holistic|개별 요소보다 전체 상호작용을 중시하는|integrated, comprehensive
structural|구성 요소 간의 관계에 관한, 구조적인|organizational, systemic
hierarchical|상하 위계로 조직된, 계층적인|ranked, graded
`);
add("research_method", "n", `
paradigm|연구를 조직하는 이론적 틀, 패러다임|framework, model
methodology|연구 방법의 원리와 체계, 방법론|procedure, technique
heuristic|탐색과 발견을 돕는 경험적 전략, 발견법|rule, strategy
protocol|절차와 조건을 명시한 연구 규약, 프로토콜|procedure, standard
replication|결과의 재현, 반복 검증|reproduction, duplication
inference|증거에서 도출한 추론, 추리|deduction, conclusion
variance|관측값이 평균에서 흩어진 정도, 분산|dispersion, deviation
covariate|결과와 함께 변화를 보정하는 공변량|factor, variable
confounder|인과 관계를 왜곡하는 교란 변수|distorter, bias
criterion|판단이나 평가의 기준, 준거|standard, benchmark
artifact|측정이나 절차가 만들어 낸 인공적 흔적|distortion, anomaly
sampling|모집단에서 표본을 추출하는 과정, 표집|selection, survey
`;
add("logic_evidence", "n", `
dichotomy|상호 배타적인 두 범주로 나눈 이분법|dualism, division
corollary|전제에서 필연적으로 따라 나오는 결과, 추론|consequence, inference
premise|논증의 출발점이 되는 전제, 가정|assumption, proposition
fallacy|논증의 형식이나 내용에 있는 오류, 궤변|error, sophistry
implication|주장이나 증거가 내포하는 함의, 시사점|inference, consequence
corroboration|독립 자료에 의한 추가 입증, 확증|confirmation, verification
counterexample|일반 명제를 반박하는 반례, 반증 사례|exception, contradiction
conjecture|충분한 증명 전의 추정이나 가설|speculation, hypothesis
inconsistency|주장이나 자료 사이의 논리적 불일치|contradiction, discrepancy
presupposition|주장에 앞서 암묵적으로 받아들인 전제|assumption, premise
`);
add("system_structure", "n", `
taxonomy|원리와 기준에 따른 분류 체계, 분류학|classification, system
architecture|체계를 이루는 요소와 관계의 설계, 구조|structure, design
substrate|작용이나 변화가 일어나는 물질적 바탕, 기질|matrix, base
continuum|단절 없이 이어지는 범위나 연속체|spectrum, sequence
stratification|계층이나 층위로 나누는 구조화, 층위화|layering, ranking
configuration|요소들이 특정 방식으로 배열된 구성|arrangement, structure
constituency|구성원이나 지지 기반을 이루는 집단, 선거구|membership, electorate
interdependence|각 요소가 서로 의존하는 관계, 상호 의존성|reciprocity, dependence
modularity|체계를 독립적인 구성 단위로 나눈 특성, 모듈성|segmentation, partitioning
polarity|서로 대립하는 두 극이나 방향의 관계, 양극성|duality, opposition
`);

function koreanGroup(meaning) {
  const lastMeaning = meaning.split(",").at(-1).trim();
  if (/다$/.test(lastMeaning)) return "verb";
  if (/(?:한|적인|의|없는|있는|운|른)$/.test(lastMeaning)) return "adjective";
  return "noun";
}

function semanticGroup(entry) {
  if (entry.semanticGroup) return entry.semanticGroup;
  const source = `${entry.word} ${entry.meaning}`.toLocaleLowerCase();
  if (/evidence|infer|proof|논증|증거|추론|입증|가설|전제|반증/.test(source)) return "logic_evidence";
  if (/method|research|sample|measure|data|실험|연구|측정|표본|조사|방법/.test(source)) return "research_method";
  if (/ambig|obscur|clear|lucid|vague|모호|명료|불분명|명확|해석/.test(source)) return "ambiguity_clarity";
  if (/system|struct|model|framework|hierarch|network|체계|구조|모형|계층|구성/.test(source)) return "system_structure";
  if (/attitude|behav|resist|comply|협력|저항|태도|행동|완강|동의/.test(source)) return "behavior_attitude";
  if (/change|increase|decrease|alter|mitig|exacerb|변화|증가|감소|완화|악화|확대|축소/.test(source)) return "change_degree";
  return ["research_method", "logic_evidence", "change_degree", "ambiguity_clarity", "system_structure", "behavior_attitude"][
    entry.word.charCodeAt(0) % 6
  ];
}

function createExample(entry) {
  if (entry.partOfSpeech === "v" || entry.partOfSpeech === "vi") {
    return {
      exampleEn: `Researchers ${entry.word} the evidence before drawing a conclusion.`,
      exampleKo: `연구진은 결론을 내리기 전에 근거를 ${entry.meaning.split(",")[0]} 살폈다.`
    };
  }
  if (entry.partOfSpeech === "adj") {
    return {
      exampleEn: `The study presents a ${entry.word} account of the observed pattern.`,
      exampleKo: `그 연구는 관찰된 양상을 설명하며 ${entry.meaning.split(",")[0]} 특성을 보였다.`
    };
  }
  return {
    exampleEn: `The researchers treated ${entry.word} as a central concept in the analysis.`,
    exampleKo: `연구진은 분석에서 ${entry.word}을 핵심 개념으로 다루었다.`
  };
}

const replacements = new Map();
words.forEach((entry) => {
  if (/[\s-]/.test(entry.word)) return;
  entry.semanticGroup = semanticGroup(entry);
  entry.difficultyTier = 1;
  for (const synonym of entry.synonyms) {
    if (!/^[a-z]+$/i.test(synonym)) continue;
    const key = synonym.toLocaleLowerCase();
    if (occupied.has(key) || replacements.has(key) || !["v", "vi", "adj", "n"].includes(entry.partOfSpeech)) continue;
    replacements.set(key, {
      word: synonym,
      partOfSpeech: entry.partOfSpeech === "vi" ? "v" : entry.partOfSpeech,
      meaning: entry.meaning,
      synonyms: entry.synonyms.filter((candidate) => candidate.toLocaleLowerCase() !== key),
      semanticGroup: entry.semanticGroup
    });
  }
});

const standaloneConcepts = [
  ["analysis", "n", "분석, 체계적 검토", "examination, assessment", "research_method"],
  ["model", "n", "현상을 설명하는 모형, 이론적 표상", "framework, representation", "system_structure"],
  ["evidence", "n", "주장을 뒷받침하는 증거, 실증 자료", "proof, support", "logic_evidence"],
  ["measure", "n", "측정 기준, 정량적 지표", "metric, indicator", "research_method"],
  ["variable", "n", "변수, 변화하는 요인", "factor, parameter", "research_method"],
  ["pattern", "n", "반복적으로 관찰되는 양상, 규칙성", "trend, configuration", "logic_evidence"]
].map(([word, partOfSpeech, meaning, synonymText, group]) => ({
  word,
  partOfSpeech,
  meaning,
  synonyms: synonymText.split(", "),
  semanticGroup: group
}));

const availableLexicon = [
  ...replacements.values(),
  ...standaloneConcepts,
  ...lexicon
].filter((entry, index, all) => {
  const key = entry.word.toLocaleLowerCase();
  return /^[a-z]+$/.test(key) && !occupied.has(key) &&
    all.findIndex((candidate) => candidate.word.toLocaleLowerCase() === key) === index;
});

const phraseSlots = words
  .map((entry, index) => ({ entry, index }))
  .filter(({ entry }) => /[\s-]/.test(entry.word));
if (availableLexicon.length < phraseSlots.length) {
  throw new Error(`고유 단일어가 부족합니다: ${availableLexicon.length}/${phraseSlots.length}`);
}

const complexityScore = (entry) => {
  const word = entry.word.toLocaleLowerCase();
  const syllables = (word.match(/[aeiouy]+/g) || []).length;
  const advancedBoost = entry.curated ? 1.5 : 0;
  return word.length + syllables * 1.2 + advancedBoost;
};
availableLexicon.sort((first, second) =>
  complexityScore(first) - complexityScore(second) || first.word.localeCompare(second.word)
);
const selectedReplacements = availableLexicon.slice(0, phraseSlots.length);

phraseSlots.forEach(({ entry, index }, replacementIndex) => {
  const replacement = selectedReplacements[replacementIndex];
  const examples = createExample(replacement);
  words[index] = {
    ...entry,
    word: replacement.word,
    partOfSpeech: replacement.partOfSpeech === "vi" ? "v" : replacement.partOfSpeech,
    meaning: replacement.meaning,
    synonyms: replacement.synonyms.length >= 2 ? replacement.synonyms.slice(0, 2) : [...replacement.synonyms, replacement.word],
    semanticGroup: replacement.semanticGroup || semanticGroup(replacement),
    ...examples
  };
});

const uniqueWords = new Set();
words.forEach((entry, index) => {
  const normalizedWord = entry.word.toLocaleLowerCase();
  if (/[\s-]/.test(entry.word)) {
    throw new Error(`단일어가 아닌 표제어가 남았습니다: ${entry.word}`);
  }
  if (uniqueWords.has(normalizedWord)) {
    throw new Error(`중복 표제어가 있습니다: ${entry.word}`);
  }
  uniqueWords.add(normalizedWord);
  entry.id = index + 1;
  entry.deck = `Day ${Math.floor(index / 50) + 1}`;
  entry.semanticGroup = semanticGroup(entry);
});

// 한글 주석: 어휘 길이와 발음 복잡도를 기준으로 100개씩 나누어 난이도 1~15를 부여해요.
const tieredWords = [...words].sort((first, second) =>
  complexityScore(first) - complexityScore(second) || first.word.localeCompare(second.word)
);
tieredWords.forEach((entry, index) => {
  entry.difficultyTier = Math.min(15, Math.floor(index * 15 / tieredWords.length) + 1);
});

fs.writeFileSync(datasetPath, `${JSON.stringify(words, null, 2)}\n`, "utf8");
console.log(`words.json 정리 완료: ${words.length}개 단일어, 제거한 복합 표제어 ${phraseSlots.length}개.`);
