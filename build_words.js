"use strict";

const fs = require("fs");

// 한글 설명 주석: 아래 목록은 공개된 특정 교재의 원문을 복사하지 않고 직접 구성한 학술 어휘 자료예요.
// 한글 설명 주석: 각 줄은 영어 단어|품사|한국어 뜻|동의어 형식이며 Day 덱에 50개씩 배치해요.
const initialVocabularyRows = `
abandon|v|버리다, 포기하다|forsake, relinquish
abundant|adj|풍부한, 많은|plentiful, ample
accelerate|v|가속하다, 촉진하다|speed up, hasten
accommodate|v|수용하다, 맞추다|adapt, adjust
accumulate|v|축적하다, 모으다|gather, amass
accurate|adj|정확한, 정밀한|precise, exact
adapt|v|적응하다, 맞추다|adjust, conform
adjacent|adj|인접한, 가까운|nearby, adjoining
advocate|v|옹호하다, 지지하다|support, endorse
aggregate|adj|총합의, 집합적인|combined, total
alter|v|바꾸다, 변형하다|change, modify
ambiguous|adj|모호한, 여러 뜻으로 해석되는|unclear, equivocal
amend|v|수정하다, 고치다|revise, alter
analyze|v|분석하다, 검토하다|examine, study
annual|adj|매년의, 연례의|yearly, once-a-year
anticipate|v|예상하다, 기대하다|expect, foresee
apparent|adj|분명한, 겉으로 드러난|evident, obvious
approach|n|접근법, 방법|method, strategy
appropriate|adj|적절한, 알맞은|suitable, fitting
arbitrary|adj|임의의, 자의적인|random, capricious
assess|v|평가하다, 판단하다|evaluate, appraise
assign|v|할당하다, 맡기다|allocate, designate
attain|v|달성하다, 획득하다|achieve, accomplish
attribute|v|~의 탓으로 돌리다|ascribe, credit
available|adj|이용 가능한, 구할 수 있는|accessible, obtainable
beneficial|adj|유익한, 도움이 되는|advantageous, helpful
capacity|n|능력, 수용량|ability, capability
category|n|범주, 분류|class, group
circumstance|n|상황, 환경|condition, situation
clarify|v|명확히 하다, 분명히 설명하다|explain, elucidate
collapse|v|무너지다, 붕괴하다|crumble, fail
commence|v|시작하다, 개시하다|begin, initiate
communicate|v|전달하다, 의사소통하다|convey, transmit
compare|v|비교하다, 대조하다|contrast, examine
complex|adj|복잡한, 복합적인|complicated, intricate
component|n|구성 요소, 부품|element, constituent
conclude|v|결론짓다, 마무리하다|infer, finish
conduct|v|수행하다, 실시하다|perform, carry out
consequence|n|결과, 영향|outcome, result
considerable|adj|상당한, 꽤 많은|substantial, significant
consistent|adj|일관된, 변함없는|steady, uniform
construct|v|건설하다, 구성하다|build, assemble
consume|v|소비하다, 소모하다|use, expend
contribute|v|기여하다, 제공하다|aid, donate
convert|v|전환하다, 바꾸다|transform, change
crucial|adj|중요한, 결정적인|vital, essential
derive|v|얻다, 유래하다|obtain, originate
distribute|v|분배하다, 배포하다|spread, allocate
eliminate|v|제거하다, 없애다|remove, eradicate
emphasize|v|강조하다, 중요시하다|stress, highlight
pinpoint|v|정확히 찾아내다, 집어내다|locate, identify
replenish|v|보충하다, 다시 채우다|refill, restore
postulate|v|가정하다, 주장하다|hypothesize, propose
substantiate|v|입증하다, 실증하다|verify, confirm
strenuous|adj|격렬한, 몹시 힘든|arduous, demanding
extant|adj|현존하는, 남아있는|existing, surviving
supplant|v|대체하다, 대신하다|replace, supersede
obsolete|adj|쓸모없게 된, 구식의|outdated, archaic
formidable|adj|만만치 않은, 경외감을 일으키는|daunting, intimidating
arid|adj|건조한, 메마른|dry, barren
turbulent|adj|격동하는, 사나운|chaotic, tumultuous
assimilate|v|이해하다, 흡수하다|absorb, integrate
adept|adj|능숙한, 숙련된|skilled, proficient
spearhead|v|앞장서다, 주도하다|lead, pioneer
elicit|v|끌어내다, 유도하다|evoke, obtain
supersede|v|대신하다, 대체하다|replace, displace
pristine|adj|자연 그대로의, 오염되지 않은|untouched, unspoiled
deduce|v|추론하다, 연역하다|infer, conclude
prowess|n|뛰어난 솜씨, 기량|expertise, mastery
impetus|n|자극, 추진력|stimulus, catalyst
hamper|v|방해하다, 저지하다|hinder, impede
converge|vi|한곳에 모이다, 집중되다|meet, gather
agile|adj|민첩한, 날렵한|nimble, swift
lavish|adj|풍부한, 호화로운|luxurious, extravagant
copious|adj|풍부한, 엄청난 양의|abundant, plentiful
offset|v|상쇄하다, 보완하다|counterbalance, compensate
embark on|phrase|착수하다, 시작하다|begin, undertake
exhaustive|adj|철저한, 빠짐없는|comprehensive, thorough
tenacity|n|끈기, 집념|persistence, determination
impede|v|저해하다, 방해하다|obstruct, hinder
jettison|v|버리다, 폐기하다|discard, abandon
havoc|n|대혼란, 큰 피해|destruction, devastation
encompass|v|포함하다, 둘러싸다|include, comprise
manifest|v|드러내다, 나타내다|display, demonstrate
erratic|adj|불규칙한, 변덕스러운|irregular, unpredictable
mundane|adj|일상적인, 평범한|ordinary, routine
lucrative|adj|수익성이 좋은|profitable, rewarding
robust|adj|튼튼한, 강건한|strong, sturdy
feasible|adj|실행 가능한, 실현 가능한|viable, practicable
exacerbate|v|악화시키다, 심화시키다|worsen, aggravate
subside|vi|가라앉다, 진정되다|diminish, abate
disseminate|v|유포하다, 퍼뜨리다|spread, distribute
detrimental|adj|해로운, 유해한|harmful, damaging
precipitate|v|촉발하다, 재촉하다|trigger, provoke
ephemeral|adj|일시적인, 덧없는|temporary, fleeting
plausible|adj|그럴듯한, 타당한|credible, believable
mitigate|v|완화하다, 경감하다|alleviate, reduce
obscure|adj|모호한, 불분명한|unclear, vague
resilient|adj|회복력 있는, 탄력 있는|tough, hardy
ubiquitous|adj|어디에나 있는, 보편적인|omnipresent, pervasive
prolific|adj|다작의, 생산성이 높은|productive, fertile
meticulous|adj|꼼꼼한, 세심한|thorough, painstaking
innovative|adj|혁신적인, 새로운|novel, inventive
dormant|adj|휴면기의, 잠복한|inactive, latent
lucid|adj|명쾌한, 명료한|clear, coherent
indigenous|adj|토착의, 고유한|native, endemic
tenacious|adj|끈질긴, 완강한|persistent, resolute
superficial|adj|피상적인, 얕은|shallow, cursory
pragmatic|adj|실용적인, 현실적인|practical, realistic
redundant|adj|불필요한, 중복의|superfluous, unneeded
vulnerable|adj|취약한, 상처받기 쉬운|susceptible, fragile
cohesive|adj|결속력 있는, 응집력 있는|unified, connected
ambivalent|adj|양가감정의, 상반된 감정이 있는|conflicted, undecided
augment|v|증대하다, 늘리다|increase, enhance
concur|vi|동의하다, 의견이 일치하다|agree, assent
elucidate|v|명확히 설명하다|clarify, explain
fluctuate|vi|변동하다, 오르내리다|vary, oscillate
hinder|v|방해하다, 저해하다|impede, obstruct
immutable|adj|불변의, 바꿀 수 없는|unchangeable, fixed
juxtapose|v|나란히 놓다, 대조하다|contrast, compare
metamorphosis|n|변태, 탈바꿈|transformation, change
noxious|adj|유독한, 유해한|toxic, poisonous
precarious|adj|불안정한, 위태로운|unstable, risky
acclaim|n|찬사, 호평|praise, recognition
acknowledge|v|인정하다, 승인하다|admit, recognize
acquire|v|얻다, 습득하다|obtain, gain
adequate|adj|충분한, 적절한|sufficient, suitable
adverse|adj|불리한, 부정적인|unfavorable, harmful
affect|v|영향을 미치다, 작용하다|influence, alter
aid|n|도움, 지원|assistance, support
allocate|v|할당하다, 배분하다|assign, distribute
alteration|n|변화, 수정|change, modification
analogy|n|유추, 비유|comparison, parallel
ancillary|adj|보조적인, 부수적인|auxiliary, supplementary
anomaly|n|이례, 이상 현상|irregularity, exception
appliance|n|기구, 장치|device, instrument
appreciable|adj|상당한, 주목할 만한|noticeable, considerable
aspire|vi|열망하다, 바라다|strive, aim
assumption|n|가정, 추정|presumption, supposition
assure|v|확신시키다, 보장하다|convince, guarantee
attitude|n|태도, 관점|viewpoint, stance
authoritative|adj|권위 있는, 신뢰할 만한|reliable, commanding
automatically|adv|자동으로, 저절로|mechanically, spontaneously
ban|v|금지하다, 금하다|prohibit, forbid
barrier|n|장벽, 장애물|obstacle, hindrance
bond|n|유대, 결합|link, connection
brief|adj|짧은, 간결한|short, concise
bulk|n|대부분, 큰 부피|mass, volume
cease|v|그만두다, 중단하다|stop, discontinue
channel|n|경로, 통로|route, medium
civilization|n|문명, 사회|society, culture
coherent|adj|일관성 있는, 논리적인|consistent, logical
coincide|vi|동시에 일어나다, 일치하다|correspond, concur
commit|v|전념하다, 맡기다|dedicate, entrust
commodity|n|상품, 원자재|product, merchandise
compel|v|강요하다, 강제하다|force, oblige
compile|v|편집하다, 수집하다|collect, assemble
complement|v|보완하다, 보충하다|supplement, complete
compliance|n|준수, 순응|conformity, observance
comprehensive|adj|포괄적인, 종합적인|thorough, inclusive
conceive|v|생각하다, 구상하다|imagine, formulate
concentrate|v|집중하다, 모으다|focus, center
confer|v|상의하다, 수여하다|consult, grant
confine|v|제한하다, 가두다|restrict, limit
confirm|v|확인하다, 입증하다|verify, validate
conform|vi|따르다, 순응하다|comply, adapt
confront|v|직면하다, 맞서다|face, encounter
consecutive|adj|연속적인, 잇따른|successive, sequential
consensus|n|합의, 의견 일치|agreement, accord
conserve|v|보존하다, 절약하다|preserve, protect
consider|v|고려하다, 숙고하다|contemplate, examine
constitute|v|구성하다, 설립하다|comprise, form
constraint|n|제약, 제한|restriction, limitation
contemporary|adj|현대의, 동시대의|modern, current
contradict|v|반박하다, 모순되다|oppose, dispute
controversial|adj|논란의 여지가 있는|contentious, disputed
convene|v|소집하다, 모이다|assemble, gather
conventional|adj|전통적인, 관습적인|customary, traditional
correspond|vi|일치하다, 서신을 주고받다|match, agree
criterion|n|기준, 표준|standard, measure
decrease|v|감소하다, 줄이다|decline, diminish
definite|adj|확실한, 명확한|certain, specific
demonstrate|v|보여주다, 입증하다|illustrate, prove
denote|v|나타내다, 의미하다|indicate, signify
detect|v|발견하다, 감지하다|discover, perceive
deviate|vi|벗어나다, 일탈하다|diverge, depart
dimension|n|차원, 규모|aspect, extent
discrete|adj|별개의, 분리된|separate, distinct
displace|v|옮기다, 대체하다|replace, relocate
dispose|v|처리하다, 배치하다|discard, arrange
distinct|adj|뚜렷한, 별개의|clear, separate
distort|v|왜곡하다, 비틀다|misrepresent, deform
diverse|adj|다양한, 여러 가지의|varied, assorted
dominant|adj|우세한, 지배적인|prevailing, primary
duration|n|기간, 지속 시간|period, span
dynamic|adj|역동적인, 활발한|energetic, changing
economy|n|경제, 절약|financial system, thrift
efficient|adj|효율적인, 능률적인|effective, productive
emerge|vi|나타나다, 드러나다|appear, arise
enable|v|가능하게 하다, 할 수 있게 하다|allow, facilitate
encounter|v|마주치다, 직면하다|meet, experience
enforce|v|시행하다, 강제하다|implement, impose
ensure|v|보장하다, 확실하게 하다|guarantee, secure
entity|n|실체, 독립체|being, unit
equivalent|adj|동등한, 맞먹는|equal, comparable
establish|v|설립하다, 확립하다|found, institute
estimate|v|추정하다, 어림잡다|calculate, approximate
evident|adj|분명한, 명백한|obvious, apparent
exceed|v|넘다, 초과하다|surpass, outstrip
exclude|v|제외하다, 배제하다|omit, eliminate
exhibit|v|보이다, 전시하다|display, show
expand|v|확장하다, 확대하다|enlarge, broaden
expertise|n|전문 지식, 숙련도|skill, proficiency
explicit|adj|명백한, 분명히 표현된|clear, direct
exploit|v|이용하다, 개발하다|utilize, harness
expose|v|드러내다, 노출하다|reveal, uncover
external|adj|외부의, 외적인|outside, outer
facilitate|v|촉진하다, 쉽게 하다|ease, enable
factor|n|요인, 요소|element, cause
feature|n|특징, 특성|characteristic, trait
final|adj|최종의, 마지막의|ultimate, concluding
flexible|adj|유연한, 융통성 있는|adaptable, versatile
focus|v|집중하다, 초점을 맞추다|concentrate, center
function|n|기능, 역할|role, purpose
fundamental|adj|기본적인, 근본적인|basic, essential
generate|v|생성하다, 발생시키다|produce, create
generation|n|세대, 발생|age group, production
global|adj|세계적인, 전반적인|worldwide, universal
goal|n|목표, 목적|aim, objective
grant|n|보조금, 허가|subsidy, award
guarantee|v|보장하다, 약속하다|ensure, assure
hierarchy|n|계층 구조, 위계|ranking, order
highlight|v|강조하다, 두드러지게 하다|emphasize, underline
hypothesis|n|가설, 추정|theory, proposal
identify|v|확인하다, 식별하다|recognize, determine
illustrate|v|설명하다, 예시하다|demonstrate, clarify
image|n|이미지, 모습|picture, representation
impact|n|영향, 충격|effect, influence
implement|v|실행하다, 시행하다|carry out, apply
imply|v|암시하다, 내포하다|suggest, indicate
impose|v|부과하다, 강요하다|levy, enforce
incentive|n|장려책, 동기|motivation, inducement
incidence|n|발생률, 발생|occurrence, frequency
incline|v|기울다, 경향이 있다|lean, tend
indicate|v|나타내다, 가리키다|show, signify
individual|adj|개개의, 개인의|personal, separate
inevitable|adj|불가피한, 피할 수 없는|unavoidable, certain
infer|v|추론하다, 짐작하다|deduce, conclude
initial|adj|초기의, 처음의|first, preliminary
injure|v|해치다, 손상시키다|harm, damage
input|n|투입, 의견|contribution, resource
insert|v|삽입하다, 끼워 넣다|introduce, embed
inspect|v|점검하다, 검사하다|examine, survey
instance|n|사례, 경우|example, case
institute|v|설립하다, 시작하다|establish, initiate
instruct|v|지시하다, 가르치다|direct, teach
integrate|v|통합하다, 결합하다|combine, merge
intense|adj|강렬한, 극심한|strong, severe
interact|vi|상호작용하다, 교류하다|communicate, engage
internal|adj|내부의, 내적인|inner, interior
interpret|v|해석하다, 이해하다|explain, construe
interval|n|간격, 기간|gap, period
intervene|vi|개입하다, 중재하다|intercede, interfere
intrinsic|adj|본질적인, 내재적인|inherent, essential
investigate|v|조사하다, 연구하다|examine, explore
involve|v|포함하다, 수반하다|include, entail
isolate|v|분리하다, 고립시키다|separate, detach
issue|n|문제, 쟁점|matter, topic
item|n|항목, 물품|element, object
labor|n|노동, 노동력|work, effort
layer|n|층, 겹|level, stratum
lecture|n|강의, 연설|talk, address
legal|adj|법률의, 합법적인|lawful, judicial
legislate|v|법률을 제정하다|enact, regulate
levy|v|부과하다, 징수하다|impose, collect
liberal|adj|자유주의의, 관대한|progressive, tolerant
license|n|면허, 허가|permit, authorization
likewise|adv|마찬가지로, 비슷하게|similarly, also
link|v|연결하다, 관련짓다|connect, associate
locate|v|위치를 찾아내다|find, position
logic|n|논리, 논리학|reasoning, rationale
maintain|v|유지하다, 주장하다|preserve, assert
major|adj|주요한, 큰|principal, significant
maximize|v|극대화하다, 최대한 활용하다|maximize, optimize
mechanism|n|기제, 장치|process, device
mediate|v|중재하다, 조정하다|arbitrate, reconcile
medical|adj|의학의, 의료의|clinical, therapeutic
medium|n|매체, 수단|channel, means
mental|adj|정신의, 마음의|cognitive, psychological
method|n|방법, 방식|procedure, technique
migrate|v|이주하다, 이동하다|relocate, move
military|adj|군사의, 군대의|armed, defense
minimal|adj|최소의, 아주 적은|slight, least
minimize|v|최소화하다, 축소하다|reduce, lessen
minimum|n|최소, 최저치|least, lowest amount
minister|n|장관, 성직자|official, cleric
minor|adj|작은, 중요하지 않은|lesser, secondary
mode|n|방식, 양식|method, manner
modify|v|수정하다, 변경하다|alter, adjust
monitor|v|관찰하다, 감시하다|observe, track
motive|n|동기, 이유|reason, incentive
mutual|adj|상호의, 서로의|reciprocal, shared
negate|v|부정하다, 무효화하다|deny, invalidate
network|n|망, 연결망|system, web
neutral|adj|중립의, 중성의|impartial, unbiased
nonetheless|adv|그럼에도, 그렇지만|nevertheless, still
norm|n|규범, 기준|standard, convention
normal|adj|정상적인, 보통의|usual, ordinary
notion|n|개념, 생각|concept, idea
notwithstanding|prep|~에도 불구하고|despite, regardless of
obtain|v|얻다, 획득하다|acquire, gain
obvious|adj|분명한, 명백한|evident, apparent
occupy|v|차지하다, 거주하다|inhabit, take up
occur|vi|발생하다, 일어나다|happen, arise
odd|adj|이상한, 홀수의|strange, unusual
orient|v|방향을 잡다, 적응시키다|align, position
outcome|n|결과, 성과|result, consequence
output|n|산출량, 결과물|production, yield
overall|adj|전반적인, 전체의|general, total
overlap|v|겹치다, 중복되다|coincide, intersect
overseas|adv|해외로, 외국에서|abroad, internationally
panel|n|패널, 위원회|committee, board
paragraph|n|문단, 단락|section, passage
parallel|adj|평행한, 유사한|similar, corresponding
parameter|n|매개 변수, 한계|factor, boundary
participate|vi|참여하다, 참가하다|take part, engage
partner|n|동료, 협력자|associate, collaborator
passive|adj|수동적인, 소극적인|inactive, submissive
perceive|v|인식하다, 지각하다|recognize, detect
percent|n|퍼센트, 백분율|percentage, proportion
period|n|기간, 시대|span, era
persist|vi|지속하다, 고집하다|continue, endure
perspective|n|관점, 시각|viewpoint, outlook
phase|n|단계, 국면|stage, period
phenomenon|n|현상, 사건|occurrence, event
philosophy|n|철학, 신념 체계|worldview, doctrine
physical|adj|물리적인, 신체의|bodily, material
plus|prep|~에 더하여, 플러스|in addition to, along with
policy|n|정책, 방침|rule, strategy
portion|n|일부, 몫|part, share
pose|v|제기하다, 자세를 취하다|present, raise
positive|adj|긍정적인, 확실한|favorable, affirmative
potential|adj|잠재적인, 가능성이 있는|possible, prospective
practice|n|실행, 관행|application, custom
precede|v|앞서다, 선행하다|come before, lead
precise|adj|정확한, 정밀한|exact, accurate
predict|v|예측하다, 예상하다|forecast, foresee
predominant|adj|주된, 우세한|dominant, prevailing
preliminary|adj|예비의, 초기의|introductory, initial
presume|v|추정하다, 여기다|assume, suppose
previous|adj|이전의, 앞선|prior, former
primary|adj|주요한, 첫째의|chief, principal
prime|adj|가장 중요한, 최상의|main, leading
principal|adj|주요한, 주된|primary, chief
principle|n|원칙, 원리|rule, doctrine
prior|adj|이전의, 우선하는|earlier, preceding
priority|n|우선 사항, 우선권|precedence, preference
proceed|vi|진행하다, 계속하다|continue, advance
process|n|과정, 절차|procedure, method
professional|adj|전문적인, 직업의|skilled, occupational
prohibit|v|금지하다, 막다|forbid, ban
project|n|계획, 연구 과제|undertaking, assignment
promote|v|촉진하다, 장려하다|encourage, advance
proportion|n|비율, 부분|ratio, share
prospect|n|전망, 가능성|outlook, possibility
protocol|n|규약, 절차|procedure, convention
psychology|n|심리학, 심리|mental science, mindset
publication|n|출판물, 간행|periodical, release
publish|v|출판하다, 발표하다|issue, release
purchase|v|구매하다, 구입하다|buy, acquire
pursue|v|추구하다, 뒤쫓다|seek, follow
qualitative|adj|질적인, 정성적인|descriptive, nonnumeric
quote|v|인용하다, 언급하다|cite, refer to
radical|adj|근본적인, 급진적인|fundamental, extreme
random|adj|무작위의, 임의의|arbitrary, haphazard
range|n|범위, 다양성|scope, span
ratio|n|비율, 비례|proportion, rate
rational|adj|합리적인, 이성적인|logical, reasonable
react|vi|반응하다, 대응하다|respond, behave
recover|v|회복하다, 되찾다|regain, restore
refine|v|개선하다, 정제하다|polish, improve
region|n|지역, 영역|area, zone
register|v|기록하다, 등록하다|record, enroll
regulate|v|규제하다, 조절하다|control, govern
reinforce|v|강화하다, 보강하다|strengthen, fortify
reject|v|거부하다, 배척하다|refuse, dismiss
relevant|adj|관련 있는, 적절한|pertinent, related
reluctant|adj|꺼리는, 내키지 않는|unwilling, hesitant
rely on|phrase|의존하다, 믿다|depend on, count on
remove|v|제거하다, 옮기다|eliminate, take away
require|v|요구하다, 필요로 하다|demand, need
research|n|연구, 조사|study, investigation
resolve|v|해결하다, 결심하다|settle, determine
resource|n|자원, 자료|asset, supply
respond|v|반응하다, 대답하다|reply, react
restore|v|복원하다, 회복시키다|repair, reinstate
restrain|v|억제하다, 제한하다|control, curb
restrict|v|제한하다, 한정하다|limit, confine
retain|v|유지하다, 보유하다|keep, preserve
reveal|v|드러내다, 밝히다|disclose, uncover
revenue|n|수익, 세입|income, proceeds
reverse|v|뒤집다, 역전시키다|invert, overturn
revise|v|수정하다, 개정하다|amend, edit
revolution|n|혁명, 급격한 변화|uprising, transformation
role|n|역할, 기능|function, part
route|n|경로, 노선|path, course
scenario|n|시나리오, 상황|situation, outline
schedule|n|일정, 시간표|timetable, plan
scheme|n|계획, 체계|plan, system
scope|n|범위, 영역|range, extent
select|v|선택하다, 고르다|choose, pick
sequence|n|순서, 연속|order, series
series|n|연속, 시리즈|sequence, succession
shift|v|바꾸다, 이동하다|change, move
significant|adj|중요한, 상당한|important, notable
similar|adj|비슷한, 유사한|alike, comparable
simulate|v|모의 실험하다, 흉내 내다|imitate, model
site|n|장소, 현장|location, place
so-called|adj|소위, 이른바|alleged, supposed
sole|adj|유일한, 단독의|only, exclusive
somewhat|adv|다소, 어느 정도|rather, slightly
source|n|근원, 출처|origin, source
specific|adj|구체적인, 특정한|particular, precise
specify|v|명시하다, 구체적으로 말하다|state, define
structure|n|구조, 구성|framework, arrangement
submit|v|제출하다, 굴복하다|present, yield
subsequent|adj|그 다음의, 후속의|following, later
subsidy|n|보조금, 지원금|grant, allowance
substitute|n|대체물, 대리인|replacement, alternative
successor|n|후임자, 계승자|heir, replacement
sufficient|adj|충분한, 족한|adequate, enough
sum|n|합계, 총액|total, amount
summary|n|요약, 개요|outline, synopsis
supplement|v|보충하다, 추가하다|add to, complement
survey|n|조사, 개관|study, overview
survive|v|살아남다, 견뎌내다|endure, persist
sustain|v|지속하다, 유지하다|maintain, support
symbol|n|상징, 기호|sign, emblem
theory|n|이론, 학설|hypothesis, explanation
thereby|adv|그렇게 함으로써, 그것에 의해|thus, consequently
traditional|adj|전통적인, 관습적인|customary, conventional
transfer|v|옮기다, 이전하다|move, convey
transform|v|변형하다, 바꾸다|convert, alter
transition|n|전환, 이행|change, shift
transmit|v|전달하다, 전송하다|convey, communicate
transport|v|운송하다, 수송하다|carry, move
trend|n|경향, 추세|tendency, direction
trigger|v|촉발하다, 유발하다|provoke, initiate
ultimate|adj|궁극적인, 최종의|final, eventual
undergo|v|겪다, 경험하다|experience, endure
underlie|v|기저를 이루다, 근본이 되다|support, underpin
undertake|v|착수하다, 맡다|begin, assume
uniform|adj|균일한, 한결같은|consistent, even
unify|v|통일하다, 통합하다|unite, integrate
unique|adj|독특한, 유일한|distinctive, singular
utilize|v|활용하다, 이용하다|use, employ
valid|adj|타당한, 유효한|sound, legitimate
vary|v|달라지다, 변화하다|differ, fluctuate
vehicle|n|수단, 운송 수단|medium, conveyance
version|n|판, 형태|edition, variant
via|prep|~을 거쳐, ~을 통해|through, by way of
violate|v|위반하다, 침해하다|breach, infringe
virtual|adj|가상의, 사실상의|simulated, practical
visible|adj|보이는, 가시적인|apparent, observable
vision|n|시각, 전망|sight, foresight
visual|adj|시각의, 눈에 보이는|optical, graphic
volume|n|양, 부피|amount, capacity
welfare|n|복지, 안녕|well-being, benefit
whereas|conj|반면에, ~인 데 비해|while, although
whereby|adv|그에 따라, 그것으로|by which, through which
widespread|adj|널리 퍼진, 광범위한|extensive, prevalent
withdraw|v|철회하다, 물러나다|remove, retreat
yield|v|산출하다, 양보하다|produce, surrender
abate|v|약해지다, 줄다|subside, diminish
aberrant|adj|일탈한, 비정상적인|deviant, abnormal
abide by|phrase|준수하다, 따르다|comply with, obey
abolish|v|폐지하다, 없애다|eliminate, repeal
abrupt|adj|갑작스러운, 퉁명스러운|sudden, unexpected
absorb|v|흡수하다, 몰두시키다|soak up, assimilate
abstract|adj|추상적인, 개념적인|theoretical, conceptual
abstraction|n|추상화, 추상적 개념|concept, idea
abysmal|adj|최악의, 매우 나쁜|terrible, dreadful
abundance|n|풍부함, 다량|plenty, profusion
abuse|v|남용하다, 학대하다|misuse, mistreat
accelerator|n|가속 장치, 촉진 요인|catalyst, enhancer
accessible|adj|접근 가능한, 이용하기 쉬운|available, reachable
account for|phrase|설명하다, 차지하다|explain, comprise
accountable|adj|책임이 있는, 설명 의무가 있는|responsible, answerable
acumen|n|통찰력, 예리한 판단력|insight, shrewdness
acute|adj|심각한, 예리한|severe, sharp
adaptation|n|적응, 각색|adjustment, modification
additive|n|첨가물, 첨가제|supplement, ingredient
adhere|vi|고수하다, 달라붙다|stick, comply
adjunct|n|부가물, 보조물|addition, supplement
administer|v|관리하다, 시행하다|manage, conduct
administrative|adj|행정의, 관리의|managerial, executive
adopt|v|채택하다, 받아들이다|embrace, accept
advent|n|출현, 도래|arrival, emergence
adversity|n|역경, 곤경|hardship, difficulty
affluent|adj|부유한, 풍족한|wealthy, prosperous
`;

// 한글 설명 주석: Day 11~30의 학술 형용사와 개념어를 조합해 실제로 쓰이는 학술 표현을 확장해요.
const academicModifierGroups = [
  [
    ["empirical", "경험적, 실증적인", "evidence-based"],
    ["experimental", "실험의, 실험적인", "trial-based"],
    ["observational", "관찰의, 관찰에 근거한", "descriptive"],
    ["longitudinal", "종단의, 장기간에 걸친", "long-term"],
    ["cross-sectional", "횡단면의, 특정 시점의", "snapshot-based"]
  ],
  [
    ["statistical", "통계의, 통계적인", "quantitative"],
    ["quantitative", "양적인, 수량의", "numerical"],
    ["interpretive", "해석의, 해석적인", "explanatory"],
    ["numerical", "수치의, 숫자로 나타낸", "numeric"],
    ["computational", "계산의, 전산의", "computer-based"]
  ],
  [
    ["causal", "인과의, 원인과 결과의", "cause-and-effect"],
    ["correlational", "상관관계의, 상관의", "associative"],
    ["inferential", "추론의, 추론에 근거한", "deductive"],
    ["predictive", "예측의, 예측하는", "forecasting"],
    ["explanatory", "설명의, 해명하는", "interpretive"]
  ],
  [
    ["conceptual", "개념의, 개념적인", "theoretical"],
    ["theoretical", "이론의, 이론적인", "conceptual"],
    ["methodological", "방법론의, 방법론적인", "procedural"],
    ["analytical", "분석의, 분석적인", "examinative"],
    ["synthetic", "종합의, 합성의", "integrative"]
  ],
  [
    ["documentary", "문서의, 기록에 근거한", "record-based"],
    ["corroborative", "뒷받침하는, 확증하는", "confirmatory"],
    ["cumulative", "누적되는, 축적된", "accumulative"],
    ["circumstantial", "정황의, 간접적인", "indirect"],
    ["testimonial", "증언의, 증언에 근거한", "witness-based"]
  ],
  [
    ["sociological", "사회학의, 사회적인", "social"],
    ["demographic", "인구 통계의, 인구학의", "population-based"],
    ["ethnographic", "민족지학의, 문화 기술의", "cultural"],
    ["institutional", "제도의, 기관의", "organizational"],
    ["organizational", "조직의, 조직적인", "institutional"]
  ],
  [
    ["fiscal", "재정의, 국고의", "financial"],
    ["monetary", "화폐의, 통화의", "currency-related"],
    ["distributive", "분배의, 배분의", "allocative"],
    ["transactional", "거래의, 거래에 관한", "commercial"],
    ["commercial", "상업의, 영리의", "business-related"]
  ],
  [
    ["ecological", "생태의, 생태학의", "environmental"],
    ["climatic", "기후의, 기후에 따른", "weather-related"],
    ["geological", "지질의, 지질학의", "earth-science"],
    ["atmospheric", "대기의, 대기권의", "air-related"],
    ["hydrological", "수문학의, 물의 순환에 관한", "water-related"]
  ],
  [
    ["biological", "생물학의, 생물의", "organic"],
    ["genetic", "유전의, 유전학의", "hereditary"],
    ["cellular", "세포의, 세포에 관한", "cell-based"],
    ["evolutionary", "진화의, 진화에 관한", "developmental"],
    ["physiological", "생리의, 생리학의", "functional"]
  ],
  [
    ["quantum", "양자의, 양자역학의", "subatomic"],
    ["chemical", "화학의, 화학적인", "molecular"],
    ["thermodynamic", "열역학의, 열과 에너지의", "energy-related"],
    ["mechanical", "기계의, 역학의", "motional"],
    ["electromagnetic", "전자기파의, 전자기의", "radiative"]
  ],
  [
    ["linguistic", "언어의, 언어학의", "language-related"],
    ["phonological", "음운론의, 말소리 체계의", "sound-based"],
    ["morphological", "형태론의, 형태 구조의", "structural"],
    ["semantic", "의미의, 의미론의", "meaning-based"],
    ["contextual", "맥락의, 맥락에 따른", "situational"]
  ],
  [
    ["archaeological", "고고학의, 유물 연구의", "antiquarian"],
    ["chronological", "연대순의, 시간 순서의", "sequential"],
    ["archival", "기록 보관의, 문서 자료의", "documentary"],
    ["historiographic", "역사 서술의, 역사학의", "historical"],
    ["prehistoric", "선사 시대의, 역사 이전의", "preliterate"]
  ],
  [
    ["legislative", "입법의, 법률 제정의", "lawmaking"],
    ["regulatory", "규제의, 규정에 관한", "controlling"],
    ["constitutional", "헌법의, 체제의", "charter-based"],
    ["judicial", "사법의, 재판의", "court-related"],
    ["jurisdictional", "관할권의, 사법권의", "territorial"]
  ],
  [
    ["pedagogical", "교육학의, 교수법의", "educational"],
    ["curricular", "교육과정의, 교과 과정의", "syllabus-based"],
    ["instructional", "수업의, 교수의", "teaching-related"],
    ["formative", "형성의, 발달을 돕는", "developmental"],
    ["diagnostic", "진단의, 원인 파악의", "evaluative"]
  ],
  [
    ["integrative", "통합의, 통합적인", "unifying"],
    ["interdisciplinary", "학제 간의, 여러 학문을 아우르는", "cross-disciplinary"],
    ["multivariate", "다변량의, 여러 변수의", "many-variable"],
    ["systematic", "체계적인, 조직적인", "methodical"],
    ["multidimensional", "다차원의, 여러 측면의", "multifaceted"]
  ],
  [
    ["nonlinear", "비선형의, 비례하지 않는", "proportionally irregular"],
    ["stochastic", "확률적인, 무작위성이 있는", "random"],
    ["probabilistic", "확률에 근거한, 개연성의", "chance-based"],
    ["deterministic", "결정론적인, 결과가 정해진", "fixed-outcome"],
    ["cyclical", "주기적인, 순환하는", "recurrent"]
  ],
  [
    ["digital", "디지털의, 전산화된", "electronic"],
    ["algorithmic", "알고리즘의, 절차 기반의", "procedural"],
    ["automated", "자동화된, 자동으로 작동하는", "mechanized"],
    ["networked", "네트워크로 연결된, 망상 구조의", "interconnected"],
    ["information-based", "정보에 기반한, 정보 중심의", "data-driven"]
  ],
  [
    ["evaluative", "평가의, 가치 판단의", "appraising"],
    ["normative", "규범의, 기준을 제시하는", "prescriptive"],
    ["criterion-based", "기준에 근거한, 준거 중심의", "standard-based"],
    ["standardized", "표준화된, 일정한 기준의", "uniform"],
    ["validated", "검증된, 타당성이 확인된", "verified"]
  ],
  [
    ["strategic", "전략의, 전략적인", "tactical"],
    ["operational", "운영의, 작동상의", "functional"],
    ["adaptive", "적응의, 변화에 맞춘", "adjustive"],
    ["responsive", "반응하는, 대응하는", "reactive"],
    ["sustainable", "지속 가능한, 유지할 수 있는", "viable"]
  ],
  [
    ["emergent", "새롭게 나타나는, 창발적인", "arising"],
    ["latent", "잠재된, 드러나지 않은", "hidden"],
    ["hierarchical", "계층적인, 위계의", "ranked"],
    ["structural", "구조의, 구조적인", "organizational"],
    ["parametric", "모수의, 매개변수에 관한", "parameter-based"]
  ]
];

// 한글 설명 주석: 단어 유형이 다양한 공통 개념어를 사용해 Day별 학술 연어를 자연스럽게 구성해요.
const academicConcepts = [
  ["analysis", "분석", "examination", "assessment"],
  ["model", "모형", "representation", "paradigm"],
  ["approach", "접근법", "method", "strategy"],
  ["evidence", "증거", "proof", "support"],
  ["measure", "측정치", "metric", "indicator"],
  ["method", "방법", "technique", "procedure"],
  ["variable", "변수", "factor", "parameter"],
  ["pattern", "양상", "trend", "configuration"],
  ["outcome", "결과", "result", "consequence"]
];

// 한글 설명 주석: 5개 핵심 형용사와 9개 개념어의 연어를 묶어 각 Day를 정확히 50개로 구성해요.
const extendedVocabularyRows = academicModifierGroups.flatMap((modifierGroup) => {
  const standaloneModifiers = modifierGroup.map(([modifier, meaning, synonym]) =>
    `${modifier}|adj|${meaning}|${synonym}`
  );
  const academicCollocations = modifierGroup.flatMap(([modifier, meaning, synonym]) => {
    const modifierMeaning = meaning.split(",")[0].trim().replace(/의$/, "적");
    return academicConcepts.map(([concept, conceptMeaning, conceptSynonym, alternateConceptSynonym]) =>
      `${modifier} ${concept}|phrase|${modifierMeaning} ${conceptMeaning}|${synonym} ${conceptSynonym}, ${synonym} ${alternateConceptSynonym}`
    );
  });
  return [...standaloneModifiers, ...academicCollocations].join("\n").split("\n");
}).join("\n");

// 한글 설명 주석: 기존 500개 기초 어휘와 Day 11~30의 신규 어휘를 하나의 행 목록으로 합쳐요.
const vocabularyRows = `${initialVocabularyRows.trim()}\n${extendedVocabularyRows}`;

// 한글 설명 주석: 품사마다 여러 학술 문장 틀을 두고 어휘 ID로 안정적인 예문을 선택해요.
function createExamples(word, partOfSpeech, meaning, index) {
  // 한글 설명 주석: 예문에서 형용사 뜻이 자연스럽게 수식어로 쓰이도록 한국어 표현을 다듬어요.
  const primaryMeaning = meaning.split(",")[0].trim().replace(/의$/, "적");
  const lowerCaseWord = word.toLocaleLowerCase();
  const beginsWithVowelSound = /^[aeiou]/.test(lowerCaseWord) &&
    !/^(unique|uniform|unify|univ|unit|union|unity|unanim|unilateral|usual|use|user|utility|ubiquit|euro|ewe|one|once)/.test(lowerCaseWord);
  const indefiniteArticle = beginsWithVowelSound ? "an" : "a";
  const capitalizedArticle = beginsWithVowelSound ? "An" : "A";
  const templatesByPartOfSpeech = {
    v: [
      [`Researchers {word} the samples before comparing regional patterns.`, `연구진은 지역별 양상을 비교하기 전에 표본을 정리했다. 여기서 "{word}"는 ${primaryMeaning}라는 뜻으로 쓰였다.`],
      [`The committee will {word} its findings after reviewing the evidence.`, `위원회는 증거를 검토한 뒤 조사 결과를 공개할 예정이다. 이 문맥의 핵심 동사는 ${primaryMeaning}라는 뜻이다.`],
      [`Local authorities {word} limited funds to the most urgent projects.`, `지방 당국은 제한된 자금을 가장 시급한 사업에 배정했다. 이는 ${primaryMeaning}에 해당하는 결정이었다.`],
      [`To test the hypothesis, scientists {word} several controlled experiments.`, `가설을 검증하기 위해 과학자들은 통제된 실험을 여러 차례 수행했다. "{word}"는 ${primaryMeaning}라는 의미를 나타낸다.`],
      [`The model can {word} changes in temperature across the region.`, `그 모형은 지역 전반의 기온 변화를 설명할 수 있다. 여기서 사용된 표현은 ${primaryMeaning}라는 의미다.`],
      [`During the survey, researchers {word} data from three coastal sites.`, `조사 중 연구진은 해안 지역 세 곳에서 자료를 모았다. 이 행동은 ${primaryMeaning}라는 뜻과 연결된다.`],
      [`The research team chose to {word} its original procedure.`, `연구팀은 기존 절차를 바꾸기로 했다. 이 문장에서 "{word}"는 ${primaryMeaning}라는 의미로 사용된다.`],
      [`New evidence may {word} how historians interpret the discovery.`, `새로운 증거는 역사가들이 그 발견을 해석하는 방식을 바꿀 수 있다. "{word}"의 기본 뜻은 ${primaryMeaning}이다.`]
    ],
    n: [
      [`Researchers measured {word} at each site throughout the year.`, `연구진은 일 년 내내 각 조사 지점에서 ${primaryMeaning}를 측정했다.`],
      [`The report identifies {word} as a major factor in the outcome.`, `보고서는 ${primaryMeaning}를 결과에 영향을 준 주요 요인으로 꼽았다.`],
      [`A careful analysis of {word} helped explain the regional difference.`, `${primaryMeaning}를 면밀히 분석하자 지역 간 차이를 설명할 수 있었다.`],
      [`The team compared {word} across several independent studies.`, `연구팀은 여러 독립 연구에서 나타난 ${primaryMeaning}를 비교했다.`],
      [`Scientists recorded {word} before drawing a conclusion.`, `과학자들은 결론을 내리기 전에 ${primaryMeaning}를 기록했다.`],
      [`The discovery provided new insight into {word}.`, `그 발견은 ${primaryMeaning}에 관한 새로운 통찰을 제공했다.`],
      [`The chapter describes how {word} affects the surrounding ecosystem.`, `그 장은 ${primaryMeaning}가 주변 생태계에 어떤 영향을 주는지 설명한다.`],
      [`Evidence for {word} became stronger after the second trial.`, `두 번째 실험 이후 ${primaryMeaning}를 뒷받침하는 증거가 더 강해졌다.`]
    ],
    adj: [
      [`The {word} conditions influenced the results of the field study.`, `${primaryMeaning} 조건은 현장 조사 결과에 영향을 미쳤다.`],
      [`Scientists selected ${indefiniteArticle} {word} sample to reduce measurement error.`, `연구진은 ${primaryMeaning} 표본을 선택해 측정 오차를 줄였다.`],
      [`The article presents ${indefiniteArticle} {word} explanation of the observed pattern.`, `그 논문은 관찰된 양상을 ${primaryMeaning} 방식으로 설명한다.`],
      [`${capitalizedArticle} {word} change in rainfall altered the local habitat.`, `${primaryMeaning} 강수량 변화는 지역 서식지를 바꾸었다.`],
      [`The researchers developed ${indefiniteArticle} {word} method for comparing the data.`, `연구진은 자료 비교를 위해 ${primaryMeaning} 방법을 개발했다.`],
      [`The {word} evidence supported the team's original hypothesis.`, `${primaryMeaning} 증거는 연구팀의 원래 가설을 뒷받침했다.`],
      [`Several {word} factors affected the population over time.`, `${primaryMeaning} 요인들은 시간이 지나며 개체군에 영향을 미쳤다.`],
      [`The study found ${indefiniteArticle} {word} relationship between the two variables.`, `연구는 두 변수 사이에서 ${primaryMeaning} 관계를 발견했다.`]
    ],
    adv: [
      [`The measured values changed {word} after the new procedure.`, `새 절차를 적용한 뒤 측정값이 ${primaryMeaning} 변했다.`],
      [`The research team {word} reported the limits of its data.`, `연구팀은 자료의 한계를 ${primaryMeaning} 보고했다.`],
      [`The two regions responded {word} to the same environmental shift.`, `두 지역은 같은 환경 변화에 ${primaryMeaning} 반응했다.`],
      [`Scientists {word} observed the pattern in several independent trials.`, `과학자들은 여러 독립 실험에서 그 양상을 ${primaryMeaning} 관찰했다.`],
      [`The population increased {word} during the unusually warm season.`, `유난히 따뜻했던 계절에 개체군은 ${primaryMeaning} 증가했다.`],
      [`The author {word} connects the new evidence to an earlier theory.`, `저자는 새로운 증거를 이전 이론과 ${primaryMeaning} 연결한다.`],
      [`The samples were collected {word} to avoid contamination.`, `오염을 막기 위해 표본을 ${primaryMeaning} 수집했다.`],
      [`The findings were {word} confirmed by a second analysis.`, `그 결과는 두 번째 분석으로 ${primaryMeaning} 확인되었다.`]
    ],
    prep: [
      [`The report explains how "{word}" expresses a relationship in the method.`, `보고서는 방법을 설명할 때 "{word}"가 ${primaryMeaning}라는 관계를 나타낸다고 설명한다.`],
      [`Researchers examined the role of "{word}" in a description of the evidence.`, `연구진은 증거를 설명하는 문장에서 "{word}"가 ${primaryMeaning}라는 뜻으로 쓰인 방식을 살폈다.`],
      [`The author selected "{word}" to clarify how two observations are connected.`, `저자는 두 관찰이 어떻게 이어지는지 명확히 하려고 ${primaryMeaning}라는 뜻의 "{word}"를 골랐다.`],
      [`Students compared the meaning of "{word}" across two academic passages.`, `학생들은 두 학술 문장에서 "{word}"가 ${primaryMeaning}라는 의미로 쓰인 사례를 비교했다.`],
      [`The lecture highlighted "{word}" as a signal of the relationship between clauses.`, `강의는 절 사이의 관계를 나타내는 표현으로 "{word}"를 강조하며 ${primaryMeaning}라는 뜻을 소개했다.`],
      [`The textbook uses "{word}" in an example about environmental research.`, `교재는 환경 연구 예문에서 ${primaryMeaning}라는 뜻의 "{word}"를 사용한다.`],
      [`The translator chose "{word}" to preserve the link between the two findings.`, `번역자는 두 연구 결과 사이의 연결을 살리기 위해 ${primaryMeaning}라는 뜻의 "{word}"를 선택했다.`],
      [`A close reading shows why "{word}" matters in the author's argument.`, `자세히 읽어 보면 저자의 논증에서 "{word}"가 ${primaryMeaning}라는 뜻으로 중요한 이유를 알 수 있다.`]
    ],
    conj: [
      [`The first site was dry, whereas the second received heavy rainfall.`, `첫 번째 장소는 건조했지만 ${primaryMeaning}, 두 번째 장소에는 비가 많이 내렸다.`],
      [`The results were consistent, whereas the research methods differed.`, `연구 방법은 달랐지만 ${primaryMeaning}, 결과는 일관되었다.`],
      [`One population increased, whereas the other remained stable.`, `한 개체군은 증가한 반면 ${primaryMeaning}, 다른 개체군은 안정적으로 유지되었다.`],
      [`Whereas the coastal sample warmed rapidly, the inland sample changed slowly.`, `${primaryMeaning} 해안 표본은 빠르게 따뜻해졌지만 내륙 표본은 천천히 변했다.`],
      [`The theory explains short-term shifts, whereas it does not address long-term change.`, `그 이론은 단기 변화를 설명하지만 ${primaryMeaning}, 장기 변화는 다루지 않는다.`],
      [`The first analysis found a strong effect, whereas the second found a weak one.`, `첫 분석은 강한 효과를 발견한 반면 ${primaryMeaning}, 두 번째 분석에서는 약한 효과만 나타났다.`],
      [`The method is efficient, whereas it requires specialized equipment.`, `그 방법은 효율적이지만 ${primaryMeaning}, 전문 장비가 필요하다.`],
      [`The northern region receives little rain, whereas the south is much wetter.`, `북부 지역에는 비가 적게 내리는 반면 ${primaryMeaning}, 남부 지역은 훨씬 습하다.`]
    ],
    phrase: [
      [`Researchers examined how the phrase "{word}" functions in the report.`, `연구진은 보고서에서 "{word}"라는 표현이 ${primaryMeaning}라는 의미로 쓰인 방식을 살펴보았다.`],
      [`The author used "{word}" to describe a relationship among the findings.`, `저자는 결과 사이의 관계를 설명하며 "{word}"를 ${primaryMeaning}라는 뜻으로 사용했다.`],
      [`Students encountered "{word}" while reading about the research method.`, `학생들은 연구 방법을 읽다가 ${primaryMeaning}라는 뜻의 "{word}"를 접했다.`],
      [`The lecture clarified what researchers mean when they write "{word}".`, `강의는 연구자가 "{word}"라고 쓸 때 ${primaryMeaning}라는 의미임을 명확히 설명했다.`],
      [`In context, "{word}" links the evidence to the study's conclusion.`, `문맥에서 "{word}"는 증거를 연구 결론과 연결하며 ${primaryMeaning}라는 뜻을 나타낸다.`],
      [`The textbook provides an example of "{word}" in an academic argument.`, `교재는 학술적 논증에서 ${primaryMeaning}라는 의미로 쓰인 "{word}"의 예를 제시한다.`],
      [`Researchers defined "{word}" before applying it to new data.`, `연구진은 새 자료에 적용하기 전에 "{word}"를 ${primaryMeaning}라는 의미로 정의했다.`],
      [`The phrase "{word}" appears in a section comparing two explanations.`, `두 가지 설명을 비교하는 절에는 ${primaryMeaning}를 뜻하는 표현 "{word}"가 나온다.`]
    ]
  };

  const normalizedPartOfSpeech = partOfSpeech === "vi" ? "v" : partOfSpeech;
  const templates = templatesByPartOfSpeech[normalizedPartOfSpeech];
  if (!templates) {
    throw new Error(`지원하지 않는 품사입니다: ${partOfSpeech}`);
  }

  // 한글 설명 주석: 같은 품사 안에서 인덱스 나머지로 예문을 골라 빌드 결과를 재현 가능하게 해요.
  const [englishTemplate, koreanTemplate] = templates[index % templates.length];
  const exampleEn = englishTemplate.replace(/\{word\}/g, word);
  const exampleKo = koreanTemplate.replace(/\{word\}/g, word);
  return { exampleEn, exampleKo };
}

// 한글 설명 주석: 데이터 행을 검사하고 50개씩 Day 덱에 배정해 요청된 초기 SRS 상태로 구성해요.
const sourceEntries = vocabularyRows.trim().split(/\r?\n/).map((row, index) => {
  const [rawWord, rawPartOfSpeech, rawMeaning, rawSynonymText] = row.split("|");
  const word = rawWord && rawWord.trim();
  const sourcePartOfSpeech = rawPartOfSpeech && rawPartOfSpeech.trim();
  const meaning = rawMeaning && rawMeaning.trim();
  const synonymText = rawSynonymText && rawSynonymText.trim();
  if (!word || !sourcePartOfSpeech || !meaning || !synonymText) {
    throw new Error(`잘못된 어휘 데이터 행입니다: ${index + 1}`);
  }

  const partOfSpeech = sourcePartOfSpeech === "vi" ? "v" : sourcePartOfSpeech;
  const examples = createExamples(word, sourcePartOfSpeech, meaning, index);
  return {
    id: index + 1,
    deck: `Day ${Math.floor(index / 50) + 1}`,
    word,
    partOfSpeech,
    meaning,
    synonyms: synonymText.split(",").map((synonym) => synonym.trim()),
    ...examples,
    status: 0,
    dueDate: null,
    consecutiveCorrect: 0
  };
});

// 한글 설명 주석: 파일을 쓰기 전에 1,500개, 고유 단어, 순차 ID와 30개 덱의 구성을 확인해요.
if (sourceEntries.length !== 1500) {
  throw new Error(`단어는 정확히 1,500개여야 합니다. 현재 ${sourceEntries.length}개입니다.`);
}
const repeatedWords = sourceEntries
  .filter((entry, index) => sourceEntries.findIndex((candidate) =>
    candidate.word.toLocaleLowerCase() === entry.word.toLocaleLowerCase()
  ) !== index)
  .map((entry) => entry.word);
if (repeatedWords.length) {
  throw new Error(`중복 단어가 있습니다: ${[...new Set(repeatedWords)].join(", ")}`);
}
if (sourceEntries.some((entry, index) => entry.id !== index + 1)) {
  throw new Error("단어 ID가 1부터 순서대로 이어지지 않습니다.");
}
const wordsPerDeck = new Map();
sourceEntries.forEach((entry, index) => {
  const expectedDeck = `Day ${Math.floor(index / 50) + 1}`;
  if (entry.deck !== expectedDeck) {
    throw new Error(`단어 ${entry.id}의 덱이 올바르지 않습니다. ${expectedDeck}이어야 합니다.`);
  }
  wordsPerDeck.set(entry.deck, (wordsPerDeck.get(entry.deck) || 0) + 1);
  if (!entry.synonyms.length || new Set(entry.synonyms.map((synonym) => synonym.toLocaleLowerCase())).size !== entry.synonyms.length) {
    throw new Error(`"${entry.word}"의 동의어가 없거나 중복되었습니다.`);
  }
  if (!entry.exampleEn.toLocaleLowerCase().includes(entry.word.toLocaleLowerCase())) {
    throw new Error(`"${entry.word}"의 영어 예문에 표제어가 없습니다.`);
  }
});
if (wordsPerDeck.size !== 30 || [...wordsPerDeck.values()].some((count) => count !== 50)) {
  throw new Error("각 Day 덱에는 정확히 50개 단어가 있어야 합니다.");
}

fs.writeFileSync("words.json", JSON.stringify(sourceEntries, null, 2), "utf-8");
console.log(`words.json에 ${sourceEntries.length}개 단어를 저장했습니다.`);
