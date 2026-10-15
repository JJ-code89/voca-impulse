"use strict";

// 한글 설명 주석: 이 파일은 단어 데이터 불러오기, 화면 전환, 퀴즈 채점, SRS 진도 저장을 담당해요.
// 한글 설명 주석: 상태 번호는 0(미학습), 1(오답/내일 복습), 2(4일 간격), 3(14일 간격), 4(마스터)를 뜻해요.

// 한글 설명 주석: 날짜 문자열을 로컬 시간 기준 YYYY-MM-DD로 만들면 날짜만 비교하기 쉬워요.
function getLocalDateKey(date = new Date()) {
  // 한글 설명 주석: 각 날짜 조각을 나누어 시각대가 섞이지 않는 날짜 키를 구성해요.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 한글 설명 주석: 기준 날짜에 일수를 더해 다음 복습일을 계산해요.
function addDays(dateKey, numberOfDays) {
  // 한글 설명 주석: YYYY-MM-DD 문자열을 숫자 연/월/일로 나누어 Date 객체를 만들어요.
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + numberOfDays);
  return getLocalDateKey(date);
}

// 한글 설명 주석: Fisher–Yates 방식으로 원본 배열을 바꾸지 않고 선택지 순서를 섞어요.
function shuffle(items) {
  const shuffledItems = [...items];
  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[index]];
  }
  return shuffledItems;
}

// 한글 설명 주석: 프로필 목록, 마지막 사용자, 예전 단일 사용자 기록에 사용하는 저장 키예요.
const USERS_STORAGE_KEY = "vocab_users";
const ACTIVE_USER_STORAGE_KEY = "vocab_active_user";
const USER_DATA_PREFIX = "vocab_data_";
const LEGACY_STORAGE_KEY = "wordstep-progress-v1";
// 한글 설명 주석: 자동 발음 설정은 학습 기록과 분리된 브라우저 설정 키에 저장해요.
const AUTO_SOUND_STORAGE_KEY = "vocab_auto_sound_enabled";
// 한글 설명 주석: 홈 화면 설치 안내의 닫힘 상태는 학습자 프로필과 분리해 기기 전체에 기억해요.
const INSTALL_GUIDE_STORAGE_KEY = "vocab_install_guide_dismissed";
// 한글 설명 주석: 피드백은 Web3Forms의 지정 이메일 수신자 연결 키를 HTML 설정 필드에서 읽어요.
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
// 한글 설명 주석: 덱 값과 이름은 단어 데이터에서 읽어 자동으로 구성해요.
const DECK_VALUES = ["all"];
const DECK_TITLES = { all: "전체 단어장" };
// 한글 설명 주석: 상태 1, 2, 3에서 정답을 맞힌 뒤 적용할 복습 간격(일)이에요.
const INTERVAL_DAYS = { 1: 1, 2: 4, 3: 14 };
// 한글 설명 주석: 저장 설정과 백업 검증, 세션 분량 선택 모달이 공통으로 허용하는 단어 수예요.
const SESSION_LENGTH_OPTIONS = [10, 15, 20, 25, 30, 50];
// 한글 설명 주석: 화면에서 데이터를 표시하거나 갱신할 때 사용하는 HTML 요소예요.
const appContent = document.querySelector("#app-content");
const startButton = document.querySelector("#start-button");
const sessionLengthSelect = document.querySelector("#session-length");
// 한글 설명 주석: 덱 서랍의 트리거, 오버레이, 닫기 버튼과 목록을 찾아 상호작용에 재사용해요.
const deckTriggerButton = document.querySelector("#deck-trigger-button");
const deckDrawerOverlay = document.querySelector("#deck-drawer-overlay");
const deckDrawerBackdrop = document.querySelector("#deck-drawer-backdrop");
const deckDrawerCloseButton = document.querySelector("#deck-drawer-close");
const deckOptionsContainer = document.querySelector("#deck-options");
// 한글 설명 주석: 설정 창의 소리 버튼은 자동 발음 설정을 표시하고 사용자의 클릭을 받아요.
const soundToggleButton = document.querySelector("#sound-toggle-button");
// 한글 설명 주석: 하나의 소리 버튼을 설정 창과 집중 도구막대 사이에서 이동해 설정 상태를 일관되게 유지해요.
const soundTogglePlaceholder = document.querySelector("#settings-sound-placeholder");
const focusToolbar = document.querySelector("#focus-toolbar");
// 한글 설명 주석: 설치 안내 배너와 닫기/설정에서 다시 보기 동작에 사용할 요소예요.
const installGuideBanner = document.querySelector("#install-guide-banner");
const installGuideCloseButton = document.querySelector("#install-guide-close");
const installGuideReopenButton = document.querySelector("#install-guide-reopen-button");
const todayLabel = document.querySelector("#today-label");
// 한글 설명 주석: 설정 버튼, 모달 배경, 닫기 버튼과 피드백 입력을 각각 찾아 이벤트에서 재사용해요.
const settingsTriggerButton = document.querySelector("#settings-trigger-button");
const settingsOverlay = document.querySelector("#settings-overlay");
const settingsBackdrop = document.querySelector("#settings-backdrop");
const settingsDialog = document.querySelector("#settings-dialog");
const settingsCloseButton = document.querySelector("#settings-close-button");
const settingsDoneButton = document.querySelector("#settings-done-button");
const settingsFeedbackForm = document.querySelector("#settings-feedback-form");
const settingsFeedbackMessage = document.querySelector("#settings-feedback-message");
const settingsFeedbackStatus = document.querySelector("#settings-feedback-status");
const web3FormsAccessKeyInput = document.querySelector("#web3forms-access-key");
// 한글 설명 주석: 대시보드에서 바로 여는 오늘 오답 복습과 추가 단어 버튼이에요.
const reviewMistakesButton = document.querySelector("#review-mistakes-button");
const studyExtraButton = document.querySelector("#study-extra-button");
// 한글 설명 주석: 오늘 세션에서 확인한 모든 단어를 참고용 플래시카드로 여는 버튼이에요.
const reviewTodayWordsButton = document.querySelector("#review-today-words-button");
// 한글 설명 주석: 레벨 진단 진입 버튼은 대시보드에서 테스트 시작 화면을 여는 데 사용해요.
const levelTestButton = document.querySelector("#level-test-button");
// 한글 설명 주석: 현재 덱 전체를 다시 보는 버튼과 빠른 동의어/빈칸 훈련 버튼이에요.
const reviewMasteredDeckButton = document.querySelector("#review-mastered-deck-button");
const synonymMatchButton = document.querySelector("#synonym-match-button");
const fillBlankButton = document.querySelector("#fill-blank-button");
// 한글 설명 주석: 분석 모달의 트리거, 배경과 닫기 버튼을 모달 상태 처리에 재사용해요.
const analyticsTriggerButton = document.querySelector("#analytics-trigger-button");
const analyticsOverlay = document.querySelector("#analytics-overlay");
const analyticsBackdrop = document.querySelector("#analytics-backdrop");
const analyticsCloseButton = document.querySelector("#analytics-close-button");
const analyticsDoneButton = document.querySelector("#analytics-done-button");
const analyticsModalContent = document.querySelector("#analytics-modal-content");
// 한글 설명 주석: 분석 모달의 백업 버튼, 가져오기 버튼, JSON 파일 입력과 결과 안내예요.
const backupExportButton = document.querySelector("#backup-export-button");
const backupImportButton = document.querySelector("#backup-import-button");
const backupFileInput = document.querySelector("#backup-file-input");
const backupStatus = document.querySelector("#backup-status");
// 한글 설명 주석: 로드맵 카드와 전체 단어장 선택 버튼은 단어 데이터에 맞춰 동적으로 갱신해요.
const chapterRoadmap = document.querySelector("#chapter-roadmap");
const roadmapAllButton = document.querySelector("#roadmap-all-button");
const selectedDeckLabel = document.querySelector("#selected-deck-label");
// 한글 설명 주석: 음성 재생 상태를 안내하고 현재 재생 중인 버튼을 관리하는 요소예요.
const speechStatus = document.querySelector("#speech-status");
// 한글 설명 주석: 프로필 모달과 이름 입력에 필요한 요소를 미리 찾아 재사용해요.
const profileOverlay = document.querySelector("#profile-overlay");
const profileList = document.querySelector("#profile-list");
const profileEmpty = document.querySelector("#profile-empty");
const profileForm = document.querySelector("#profile-form");
const profileNameInput = document.querySelector("#profile-name-input");
const profileError = document.querySelector("#profile-error");
const switchProfileButton = document.querySelector("#switch-profile-button");
const cancelProfileButton = document.querySelector("#cancel-profile-button");
const userGreeting = document.querySelector("#user-greeting");
// 한글 설명 주석: 브랜드 전체를 대시보드로 돌아가는 유일한 헤더 내비게이션으로 사용해요.
const brandHomeButton = document.querySelector("#brand-home-button");
// 한글 설명 주석: 집중 화면 닫기는 채점 중이면 종료 확인을, 읽기 전용 화면이면 즉시 대시보드 이동을 요청해요.
const focusExitButton = document.querySelector("#focus-exit-button");
// 한글 설명 주석: 진행 중 세션에서 나갈 때 확인할 모달, 마지막 포커스와 승인 후 실행할 작업이에요.
const sessionExitOverlay = document.querySelector("#session-exit-overlay");
const sessionExitBackdrop = document.querySelector("#session-exit-backdrop");
const sessionExitStayButton = document.querySelector("#session-exit-stay-button");
const sessionExitConfirmButton = document.querySelector("#session-exit-confirm-button");
// 한글 설명 주석: 세션 분량 선택 모달의 제목, 옵션, 닫기 동작에 필요한 요소예요.
const batchSizeOverlay = document.querySelector("#batch-size-overlay");
const batchSizeBackdrop = document.querySelector("#batch-size-backdrop");
const batchSizeDialog = document.querySelector("#batch-size-dialog");
const batchSizeTitle = document.querySelector("#batch-size-title");
const batchSizeDescription = document.querySelector("#batch-size-description");
const batchSizeOptions = document.querySelector("#batch-size-options");
const batchSizeAvailability = document.querySelector("#batch-size-availability");
const batchSizeCloseButton = document.querySelector("#batch-size-close");
let activeStudySession = false;
let pendingSessionExitAction = null;
let sessionExitReturnFocus = null;
let studyControlsLocked = false;
// 한글 설명 주석: 선택 창이 오늘 학습/추가 학습 중 어떤 세션을 시작할지 기억해요.
let batchSizeSelectionMode = "regular";
let batchSizeReturnFocus = null;
// 한글 설명 주석: 설정 모달의 닫힘 애니메이션과 마지막 포커스를 별도로 관리해 분석 모달과 섞이지 않게 해요.
let settingsCloseTimer = null;
// 한글 설명 주석: 중복 제출을 막고 요청 중 버튼/입력 상태를 한 번에 관리해요.
let feedbackSubmitting = false;
// 한글 설명 주석: 프로필 삭제 뒤에도 선택 창을 취소할 수 있는지 원래 상태를 기억해요.
let profilePickerCanCancel = false;
// 한글 설명 주석: 브라우저에서 사용할 수 있는 영어 음성을 찾아 전역에 보관해 재생마다 명시해요.
let selectedEnglishVoice = null;
// 한글 설명 주석: 자동 발음은 기본 켜짐이며, 저장된 문자열 값으로 다시 불러와요.
let autoSoundEnabled = true;
// 한글 설명 주석: 사용자 입력으로 오디오 컨텍스트를 깨우고, 음소거 시에는 같은 컨텍스트를 일시 중지해요.
let audioContext = null;
// 한글 설명 주석: 설치 안내를 한 번 닫았는지 기억해 초기 화면의 안내 노출 여부를 결정해요.
let installGuideDismissed = false;

// 한글 설명 주석: wordCatalog는 JSON 원본 단어를 보존해 사용자 전환 때 서로 다른 진도를 분리해요.
let wordCatalog = [];
// 한글 설명 주석: userProfiles와 activeUserName은 현재 브라우저의 학습자 목록과 선택된 이름이에요.
let userProfiles = [];
let activeUserName = null;

// 한글 설명 주석: words는 words.json과 저장된 학습 상태를 합친 전체 단어 목록이에요.
let words = [];
// 한글 설명 주석: currentDeck은 전체 단어장 또는 현재 학습할 한 챕터를 가리켜요.
let currentDeck = "all";
// 한글 설명 주석: history는 학습일, 세션 설정, 오늘 오답과 오늘 확인한 단어 ID 목록을 보관해요.
let history = {
  activeDates: [],
  sessionLength: 15,
  mistakeDate: getLocalDateKey(),
  todayMistakes: [],
  sessionDate: getLocalDateKey(),
  todaySessionWords: []
};
// 한글 설명 주석: currentSession은 이번 세션에서 플래시카드와 퀴즈에 사용할 단어들이에요.
let currentSession = [];
// 한글 설명 주석: 전체 선택 단어, 이번 라운드 큐, 오답 여부와 자동 이동 타이머를 따로 관리해요.
let sessionWordsById = new Map();
let currentRoundQueue = [];
let currentRoundNumber = 1;
let hadMistakeWordIds = new Set();
let quizAutoAdvanceTimer = null;
// 한글 설명 주석: 틀린 단어 ID는 재도전 대기열에 한 번만 보관해 세션 끝에 정답을 확인해요.
let retryWordIds = new Set();
// 한글 설명 주석: 단어별 단계, 최초 세션 단어와 3단계를 모두 통과한 단어 ID를 따로 추적해요.
let phaseByWordId = new Map();
let sessionWordIds = new Set();
let completedWordIds = new Set();
// 한글 설명 주석: 두 추가 훈련 모드의 현재 문항과 짝짓기 상태, 자동 이동 타이머를 각각 보관해요.
let synonymMatchRound = null;
let fillBlankRound = null;
let modeTransitionTimer = null;
// 한글 설명 주석: flashcardIndex와 quizIndex는 각 학습 단계에서 현재 단어의 위치예요.
let flashcardIndex = 0;
let quizIndex = 0;
// 한글 설명 주석: currentPhase는 현재 퀴즈 카드의 다각도 회상 단계(1~3)예요.
let currentPhase = 1;
// 한글 설명 주석: sessionMode에 따라 SRS 진도를 갱신할 일반/추가 학습인지 복습 재시험인지 구분해요.
let sessionMode = "regular";
// 한글 설명 주석: mistakeReviewIndex는 오늘 오답 복습 화면에서 보고 있는 카드 번호예요.
let mistakeReviewIndex = 0;
// 한글 설명 주석: correctAnswers는 요약 화면에 보여줄 이번 세션의 정답 수예요.
let correctAnswers = 0;
// 한글 설명 주석: answerSubmitted는 한 문제에서 중복 클릭/제출로 진도가 두 번 바뀌는 것을 막아요.
let answerSubmitted = false;
// 한글 설명 주석: 다음 버튼이 단계를 넘길지, 현재 단어를 마칠지 결정할 마지막 채점 결과예요.
let lastAnswerWasCorrect = false;
// 한글 설명 주석: 새 발음을 시작할 때 이전 발음 버튼의 상태를 복구하는 데 사용해요.
let activeSpeechButton = null;
// 한글 설명 주석: 레벨 테스트 문항, 진행 위치와 정답으로 확인된 단어 ID를 임시로 관리해요.
let levelTestState = null;
// 한글 설명 주석: 닫힘 애니메이션이 끝난 뒤 모달을 실제로 숨기는 타이머예요.
let analyticsCloseTimer = null;

// 한글 설명 주석: 앱 시작 시 날짜, 단어 데이터, 저장 기록, 대시보드와 이벤트 연결을 준비해요.
async function initializeApp() {
  // 한글 설명 주석: 브라우저 음성 목록은 늦게 준비될 수 있어 변경 이벤트와 즉시 조회를 함께 등록해요.
  initializeEnglishVoiceSelection();
  todayLabel.textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date());

  try {
    // 한글 설명 주석: 서버에서 최신 words.json을 가져오며, 오류는 사용자에게 표시해요.
    const response = await fetch("./words.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`단어 파일을 불러오지 못했어요 (HTTP ${response.status}).`);
    }

    // 한글 설명 주석: 받아온 JSON이 비어 있지 않은 배열인지 확인한 뒤 단어별 필수 항목을 검증해요.
    const sourceWords = await response.json();
    if (!Array.isArray(sourceWords) || sourceWords.length === 0) {
      throw new Error("words.json에 단어 목록이 없거나 형식이 올바르지 않아요.");
    }

    // 한글 설명 주석: 공통 단어 사전을 보관하고, 선택된 학습자별 저장 데이터를 나중에 적용해요.
    wordCatalog = sourceWords.map(validateWord);
    configureDecks();
    startButton.addEventListener("click", () => openBatchSizePicker("regular"));
    synonymMatchButton.addEventListener("click", startSynonymMatch);
    fillBlankButton.addEventListener("click", startFillBlankTraining);
    sessionLengthSelect.addEventListener("change", saveSessionLength);
    // 한글 설명 주석: 안내를 닫으면 기기에 기억하고, 설정 창에서 다시 열 수 있어요.
    installGuideCloseButton.addEventListener("click", dismissInstallGuide);
    installGuideReopenButton.addEventListener("click", reopenInstallGuide);
    // 한글 설명 주석: 설정 모달은 헤더, X, 닫기 버튼, 바깥 배경과 Escape 키로 제어해요.
    settingsTriggerButton.addEventListener("click", openSettingsModal);
    settingsBackdrop.addEventListener("click", closeSettingsModal);
    settingsCloseButton.addEventListener("click", closeSettingsModal);
    settingsDoneButton.addEventListener("click", closeSettingsModal);
    document.addEventListener("keydown", handleSettingsModalKeydown);
    settingsFeedbackForm.addEventListener("submit", handleFeedbackSubmit);
    settingsFeedbackMessage.addEventListener("input", () => {
      settingsFeedbackStatus.textContent = "";
    });
    // 한글 설명 주석: 헤더 버튼과 서랍 바깥/닫기 버튼, Escape 키로 덱 선택 패널을 조작해요.
    deckTriggerButton.addEventListener("click", openDeckDrawer);
    deckDrawerBackdrop.addEventListener("click", closeDeckDrawer);
    deckDrawerCloseButton.addEventListener("click", closeDeckDrawer);
    document.addEventListener("keydown", handleDeckDrawerKeydown);
    sessionExitBackdrop.addEventListener("click", dismissSessionExitWarning);
    sessionExitStayButton.addEventListener("click", dismissSessionExitWarning);
    sessionExitConfirmButton.addEventListener("click", confirmSessionExit);
    document.addEventListener("keydown", handleSessionExitKeydown, true);
    // 한글 설명 주석: 분량 선택 창은 X/배경/Escape로 닫고 선택한 버튼에서 바로 세션을 시작해요.
    batchSizeBackdrop.addEventListener("click", closeBatchSizePicker);
    batchSizeCloseButton.addEventListener("click", closeBatchSizePicker);
    document.addEventListener("keydown", handleBatchSizePickerKeydown);
    // 한글 설명 주석: 브랜드 클릭은 공통 세션 이탈 가드를 거쳐 대시보드로 이동해요.
    brandHomeButton.addEventListener("click", navigateHome);
    // 한글 설명 주석: 집중 화면의 닫기 버튼도 브랜드 이동과 같은 세션 이탈 확인 흐름을 사용해요.
    focusExitButton.addEventListener("click", navigateHome);
    // 한글 설명 주석: 분석 모달은 헤더 버튼, 배경, 닫기 버튼, ESC 키로 열고 닫아요.
    analyticsTriggerButton.addEventListener("click", openAnalyticsModal);
    analyticsBackdrop.addEventListener("click", closeAnalyticsModal);
    analyticsCloseButton.addEventListener("click", closeAnalyticsModal);
    analyticsDoneButton.addEventListener("click", closeAnalyticsModal);
    document.addEventListener("keydown", handleAnalyticsModalKeydown);
    backupExportButton.addEventListener("click", exportProgressBackup);
    backupImportButton.addEventListener("click", () => backupFileInput.click());
    backupFileInput.addEventListener("change", handleBackupFileSelection);
    soundToggleButton.addEventListener("click", toggleAutoSound);
    reviewMistakesButton.addEventListener("click", renderMistakeReview);
    studyExtraButton.addEventListener("click", () => openBatchSizePicker("extra"));
    reviewTodayWordsButton.addEventListener("click", renderTodaySessionReview);
    reviewMasteredDeckButton.addEventListener("click", renderDeckReview);
    roadmapAllButton.addEventListener("click", () => selectRoadmapDeck("all"));
    levelTestButton.addEventListener("click", renderLevelTestIntro);
    switchProfileButton.addEventListener("click", () => {
      requestSessionExit(() => {
        clearQuizAutoAdvanceTimer();
        closeSettingsModal(false);
        renderWelcome();
        showProfilePicker(true);
      });
    });
    cancelProfileButton.addEventListener("click", closeProfilePicker);
    profileForm.addEventListener("submit", handleProfileSubmit);

    // 한글 설명 주석: 저장된 소리 설정을 읽되 저장 공간 오류는 사용자에게 알리고 기본값으로 계속 진행해요.
    loadAutoSoundPreference();
    // 한글 설명 주석: 설치 상태와 이전 닫힘 기록을 읽어 배너 노출을 결정해요.
    loadInstallGuidePreference();

    // 한글 설명 주석: 이전 방문 때 사용한 프로필이 유효하면 바로 대시보드로 이동하고, 아니면 선택 화면을 열어요.
    userProfiles = readUserProfiles();
    const lastActiveUser = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (lastActiveUser && userProfiles.includes(lastActiveUser)) {
      activateProfile(lastActiveUser);
    } else {
      if (lastActiveUser) {
        localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      }
      showProfilePicker(false);
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : "앱을 시작하지 못했어요.");
  }
}

// 한글 설명 주석: localStorage의 프로필 배열을 검증해 유효한 이름만 사용하고 저장 데이터 손상은 명시해요.
function readUserProfiles() {
  const savedProfiles = localStorage.getItem(USERS_STORAGE_KEY);
  if (!savedProfiles) {
    return [];
  }

  let parsedProfiles;
  try {
    parsedProfiles = JSON.parse(savedProfiles);
  } catch {
    throw new Error("저장된 프로필 목록을 읽지 못했어요. 브라우저 저장 데이터를 확인해 주세요.");
  }
  if (!Array.isArray(parsedProfiles)) {
    throw new Error("저장된 프로필 목록 형식이 올바르지 않아요.");
  }

  return [...new Set(parsedProfiles.filter((name) =>
    typeof name === "string" && name.trim() && name.length <= 40
  ).map((name) => name.trim()))];
}

// 한글 설명 주석: 이름에 대응하는 개인별 저장 키를 만들어 SRS 진도가 다른 사람과 섞이지 않게 해요.
function getUserDataStorageKey(userName) {
  return `${USER_DATA_PREFIX}${userName}`;
}

// 한글 설명 주석: 기존 학습자의 목록을 버튼으로 그려 원하는 계정을 바로 고르게 해요.
function showProfilePicker(canCancel) {
  profilePickerCanCancel = canCancel;
  profileList.replaceChildren();
  profileError.textContent = "";
  cancelProfileButton.classList.toggle("hidden", !canCancel);
  profileEmpty.classList.toggle("hidden", userProfiles.length > 0);

  userProfiles.forEach((userName) => {
    const row = createElement("div", "profile-option-row");
    const option = createElement("button", "profile-option", `${userName}님으로 계속하기`);
    option.type = "button";
    option.addEventListener("click", () => activateProfile(userName));

    const deleteButton = createElement("button", "profile-delete-button", "삭제");
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `${userName} 프로필 삭제`);
    deleteButton.title = `${userName} 프로필 삭제`;
    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteProfile(userName);
    });
    row.append(option, deleteButton);
    profileList.append(row);
  });

  profileOverlay.hidden = false;
  window.setTimeout(() => profileNameInput.focus(), 0);
}

// 한글 설명 주석: 확인을 받은 프로필 이름과 전용 학습 기록을 지우고 활성 프로필이면 선택 화면으로 돌려요.
function deleteProfile(userName) {
  if (!window.confirm(`'${userName}' 프로필과 모든 학습 기록을 정말 삭제할까요?`)) {
    return;
  }

  const updatedProfiles = userProfiles.filter((profile) => profile !== userName);
  const wasActiveProfile = activeUserName === userName;
  try {
    // 한글 설명 주석: 프로필 목록과 이름별 학습 데이터 키를 함께 정리해 삭제한 기록이 남지 않게 해요.
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedProfiles));
    localStorage.removeItem(getUserDataStorageKey(userName));
    if (wasActiveProfile) {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    }

    userProfiles = updatedProfiles;
    profileError.textContent = "";
    if (wasActiveProfile) {
      // 한글 설명 주석: 삭제한 사용자의 메모리 상태와 예약 이동을 비우고 프로필 선택을 다시 요구해요.
      clearQuizAutoAdvanceTimer();
      activeUserName = null;
      currentSession = [];
      currentRoundQueue = [];
      sessionWordsById = new Map();
      currentDeck = "all";
      words = wordCatalog.map((word) => ({ ...word, synonyms: [...word.synonyms] }));
      history = createEmptyHistory();
      userGreeting.textContent = "안녕하세요!";
      renderWelcome();
      showProfilePicker(false);
      return;
    }

    // 한글 설명 주석: 현재 사용 중인 프로필은 유지하고 삭제된 계정 목록과 빈 상태 문구만 다시 그려요.
    showProfilePicker(profilePickerCanCancel);
  } catch (error) {
    console.error("Profile deletion error:", error);
    profileError.textContent = `프로필을 삭제하지 못했어요. 브라우저 저장 공간을 확인해 주세요. (${error.message})`;
  }
}

// 한글 설명 주석: 프로필 입력을 검증하고 새 사용자 또는 이미 등록된 이름의 학습 공간을 열어요.
function handleProfileSubmit(event) {
  event.preventDefault();
  const userName = profileNameInput.value.trim().replace(/\s+/g, " ");
  if (!userName || userName.length > 40 || /[\u0000-\u001f\u007f]/.test(userName)) {
    profileError.textContent = "이름은 1~40자 사이로 입력해 주세요.";
    profileNameInput.focus();
    return;
  }

  const matchingProfile = userProfiles.find((profile) => profile.toLocaleLowerCase() === userName.toLocaleLowerCase());
  activateProfile(matchingProfile || userName, !matchingProfile);
}

// 한글 설명 주석: 선택한 프로필을 활성화하고 해당 이름의 저장 키에서만 진도를 읽어 화면을 갱신해요.
function activateProfile(userName, isNewProfile = false) {
  try {
    const isFirstProfile = userProfiles.length === 0;
    if (isNewProfile) {
      const updatedProfiles = [...userProfiles, userName];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedProfiles));
      userProfiles = updatedProfiles;
    }

    // 한글 설명 주석: 구버전 단일 사용자 진도는 첫 프로필에만 복사해 기존 학습을 이어가게 해요.
    const userDataKey = getUserDataStorageKey(userName);
    if (isFirstProfile && !localStorage.getItem(userDataKey)) {
      const legacyProgress = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyProgress) {
        localStorage.setItem(userDataKey, legacyProgress);
      }
    }

    localStorage.setItem(ACTIVE_USER_STORAGE_KEY, userName);
    activeUserName = userName;
    words = wordCatalog.map((word) => ({ ...word, synonyms: [...word.synonyms] }));
    currentDeck = "all";
    history = createEmptyHistory();
    loadProgress();
    sessionLengthSelect.value = String(history.sessionLength);
    deckTriggerButton.disabled = false;
    userGreeting.textContent = `안녕하세요, ${userName}님!`;
    profileOverlay.hidden = true;
    profileNameInput.value = "";
    profileError.textContent = "";
    currentSession = [];
    renderWelcome();
  } catch (error) {
    profileError.textContent = error instanceof Error
      ? `프로필을 열지 못했어요: ${error.message}`
      : "프로필을 열지 못했어요. 브라우저 저장 공간을 확인해 주세요.";
  }
}

// 한글 설명 주석: 새 사용자나 날짜 기준 초기 상태로 전환할 때 기본 학습 이력을 새로 만들어요.
function createEmptyHistory() {
  return {
    activeDates: [],
    sessionLength: 15,
    mistakeDate: getLocalDateKey(),
    todayMistakes: [],
    sessionDate: getLocalDateKey(),
    todaySessionWords: []
  };
}

// 한글 설명 주석: 현재 학습을 계속한 채 프로필 선택 창을 닫는 전환 취소 동작이에요.
function closeProfilePicker() {
  if (activeUserName) {
    profileOverlay.hidden = true;
    profileError.textContent = "";
  }
}

// 한글 설명 주석: 단어 한 건의 필수 문장/뜻 정보와 진도 필드를 확인해 잘못된 데이터 사용을 막아요.
function validateWord(word, index) {
  const requiredFields = ["id", "word", "partOfSpeech", "meaning", "exampleEn", "exampleKo", "deck"];
  const missingField = requiredFields.find((field) => !(field in word));
  if (missingField || !Array.isArray(word.synonyms) || !/^Day \d+$/.test(word.deck)) {
    throw new Error(`words.json의 ${index + 1}번째 단어 데이터가 올바르지 않아요.`);
  }

  return {
    ...word,
    status: Number.isInteger(word.status) && word.status >= 0 && word.status <= 4 ? word.status : 0,
    dueDate: typeof word.dueDate === "string" ? word.dueDate : null,
    consecutiveCorrect: Number.isInteger(word.consecutiveCorrect) ? word.consecutiveCorrect : 0
  };
}

// 한글 설명 주석: words.json의 Day 번호를 읽어 덱 서랍 선택지를 순서대로 자동 생성해요.
function configureDecks() {
  const deckNames = [...new Set(wordCatalog.map((word) => word.deck))]
    .sort((first, second) => Number(first.slice(4)) - Number(second.slice(4)));
  DECK_VALUES.splice(0, DECK_VALUES.length, "all", ...deckNames);

  Object.keys(DECK_TITLES).forEach((deckName) => {
    if (deckName !== "all") {
      delete DECK_TITLES[deckName];
    }
  });
  deckNames.forEach((deckName) => {
    DECK_TITLES[deckName] = deckName;
  });
}

// 한글 설명 주석: 단어 ID와 철자를 해시해 다른 단어 사전의 오래된 진도와 ID가 섞이는 것을 막아요.
function getCatalogVersion(wordLimit = wordCatalog.length) {
  const catalogIdentity = wordCatalog.slice(0, wordLimit).map((word) => `${word.id}:${word.word}`).join("|");
  let hash = 2166136261;
  for (let index = 0; index < catalogIdentity.length; index += 1) {
    hash = Math.imul(hash ^ catalogIdentity.charCodeAt(index), 16777619);
  }
  return `catalog-${(hash >>> 0).toString(16)}`;
}

// 한글 설명 주석: localStorage의 단어 상태를 원본 words.json과 합쳐 새로고침 후에도 학습을 이어가요.
function loadProgress() {
  if (!activeUserName) {
    throw new Error("학습 프로필을 먼저 선택해 주세요.");
  }

  // 한글 설명 주석: 현재 이름의 네임스페이스 키만 읽어 다른 학습자의 진도에는 접근하지 않아요.
  const savedProgress = localStorage.getItem(getUserDataStorageKey(activeUserName));
  if (!savedProgress) {
    return;
  }

  // 한글 설명 주석: JSON 파싱 실패는 저장 기록 손상으로 판단해 안내 가능한 오류로 바꿔요.
  let parsedProgress;
  try {
    parsedProgress = JSON.parse(savedProgress);
  } catch {
    throw new Error("저장된 학습 기록을 읽지 못했어요. 브라우저 저장 데이터를 확인해 주세요.");
  }

  if (!parsedProgress || typeof parsedProgress !== "object") {
    throw new Error("저장된 학습 기록 형식이 올바르지 않아요.");
  }

  // 한글 설명 주석: 기존 500개 어휘가 그대로 앞부분에 있으면 그 진도는 보존하고 새 단어는 초기 상태로 시작해요.
  const catalogMatches = parsedProgress.catalogVersion === getCatalogVersion();
  const compatiblePreviousCatalog = wordCatalog.length === 1500 &&
    parsedProgress.catalogVersion === getCatalogVersion(500);
  const canRestoreWordProgress = catalogMatches || compatiblePreviousCatalog;

  // 한글 설명 주석: 프로필별 덱 선택을 복원하고 현재 데이터에 없는 덱 값은 전체 단어장으로 초기화해요.
  currentDeck = DECK_VALUES.includes(parsedProgress.currentDeck) ? parsedProgress.currentDeck : "all";

  // 한글 설명 주석: 학습일 목록의 날짜 형식과 문항 수를 검증한 뒤 안전한 기본값을 적용해요.
  history = {
    activeDates: Array.isArray(parsedProgress.activeDates)
      ? parsedProgress.activeDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
      : [],
    sessionLength: SESSION_LENGTH_OPTIONS.includes(parsedProgress.sessionLength) ? parsedProgress.sessionLength : 15,
    mistakeDate: canRestoreWordProgress && parsedProgress.mistakeDate === getLocalDateKey() ? parsedProgress.mistakeDate : getLocalDateKey(),
    todayMistakes: canRestoreWordProgress && parsedProgress.mistakeDate === getLocalDateKey() && Array.isArray(parsedProgress.todayMistakes)
      ? parsedProgress.todayMistakes.filter((id) => Number.isInteger(id))
      : [],
    sessionDate: canRestoreWordProgress && parsedProgress.sessionDate === getLocalDateKey() ? parsedProgress.sessionDate : getLocalDateKey(),
    todaySessionWords: canRestoreWordProgress && parsedProgress.sessionDate === getLocalDateKey() && Array.isArray(parsedProgress.todaySessionWords)
      ? [...new Set(parsedProgress.todaySessionWords.filter((id) => Number.isInteger(id)))]
      : []
  };

  // 한글 설명 주석: 현재 또는 검증된 500개 이전 버전의 진도만 기존 ID에 적용해 잘못된 상태 재사용을 막아요.
  const savedWords = canRestoreWordProgress && parsedProgress.words && typeof parsedProgress.words === "object"
    ? parsedProgress.words
    : {};

  words = words.map((word) => {
    const savedWord = savedWords[word.id];
    if (!savedWord || typeof savedWord !== "object") {
      return word;
    }

    return {
      ...word,
      status: Number.isInteger(savedWord.status) && savedWord.status >= 0 && savedWord.status <= 4
        ? savedWord.status
        : word.status,
      dueDate: typeof savedWord.dueDate === "string" ? savedWord.dueDate : null,
      consecutiveCorrect: Number.isInteger(savedWord.consecutiveCorrect) && savedWord.consecutiveCorrect >= 0
        ? savedWord.consecutiveCorrect
        : word.consecutiveCorrect
    };
  });

  // 한글 설명 주석: 확장 전 기록도 새 카탈로그 버전으로 저장해 이후에는 일반 복원 경로를 사용해요.
  if (!catalogMatches) {
    saveProgress();
  }
}

// 한글 설명 주석: 프로필의 SRS 상태와 복습 날짜, 오답/세션 기록을 저장과 백업에 공통으로 구성해요.
function createProgressSnapshot() {
  return {
    catalogVersion: getCatalogVersion(),
    words: Object.fromEntries(words.map((word) => [
      word.id,
      {
        status: word.status,
        dueDate: word.dueDate,
        consecutiveCorrect: word.consecutiveCorrect
      }
    ])),
    activeDates: history.activeDates,
    sessionLength: history.sessionLength,
    mistakeDate: history.mistakeDate,
    todayMistakes: history.todayMistakes,
    sessionDate: history.sessionDate,
    todaySessionWords: history.todaySessionWords,
    currentDeck
  };
}

// 한글 설명 주석: 단어별 SRS 상태와 학습 이력을 활성 프로필 전용 localStorage 키에 저장해요.
function saveProgress() {
  if (!activeUserName) {
    return false;
  }

  try {
    // 한글 설명 주석: 각 프로필의 상태, 복습 간격, 연속 학습일과 오늘 기록을 사용자별 키에 저장해요.
    localStorage.setItem(getUserDataStorageKey(activeUserName), JSON.stringify(createProgressSnapshot()));
    return true;
  } catch (error) {
    showStorageWarning(error);
    return false;
  }
}

// 한글 설명 주석: 현재 프로필의 학습 상태를 JSON Blob으로 만들어 날짜가 포함된 파일로 내려받아요.
function exportProgressBackup() {
  if (!activeUserName) {
    backupStatus.textContent = "먼저 학습 프로필을 선택해 주세요.";
    return;
  }

  try {
    const progress = createProgressSnapshot();
    const backup = {
      format: "wordstep-progress-backup",
      version: 1,
      profile: activeUserName,
      exportedAt: new Date().toISOString(),
      catalogVersion: progress.catalogVersion,
      progress
    };
    const jsonText = JSON.stringify(backup, null, 2);
    const backupBlob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(backupBlob);
    const safeProfileName = activeUserName.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").replace(/\s+/g, "_");
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    // 한글 설명 주석: VIP 로고의 새 브랜드를 파일명에 반영하되 내부 백업 식별자는 호환성을 위해 그대로 유지해요.
    downloadLink.download = `vocaimpulse_backup_${safeProfileName}_${getLocalDateKey()}.json`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    backupStatus.textContent = "현재 프로필의 학습 기록을 JSON 파일로 백업했어요.";
  } catch (error) {
    console.error("Backup export error:", error);
    backupStatus.textContent = `백업 파일을 만들지 못했어요. (${error.message})`;
  }
}

// 한글 설명 주석: 파일에서 읽은 데이터가 현재 어휘집과 같은 안전한 백업 구조인지 저장 전에 검증해요.
function validateProgressBackup(backup) {
  if (!backup || typeof backup !== "object" ||
      backup.format !== "wordstep-progress-backup" ||
      backup.version !== 1 ||
      typeof backup.profile !== "string" ||
      !backup.profile.trim() ||
      typeof backup.exportedAt !== "string" ||
      Number.isNaN(Date.parse(backup.exportedAt)) ||
      !backup.progress || typeof backup.progress !== "object") {
    throw new Error("Voca Impulse 백업 파일 형식이 올바르지 않아요.");
  }

  const progress = backup.progress;
  if (backup.catalogVersion !== getCatalogVersion() ||
      progress.catalogVersion !== getCatalogVersion()) {
    throw new Error("이 백업은 현재 단어집 버전과 달라서 불러올 수 없어요.");
  }

  const validDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const parsedDate = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value;
  };
  const validWordIds = new Set(words.map((word) => String(word.id)));
  if (!progress.words || typeof progress.words !== "object" || Array.isArray(progress.words) ||
      Object.keys(progress.words).length !== words.length ||
      !Object.keys(progress.words).every((id) => validWordIds.has(id))) {
    throw new Error("백업에 단어별 학습 기록이 없거나 형식이 올바르지 않아요.");
  }

  for (const word of words) {
    const savedWord = progress.words[word.id];
    if (!savedWord || typeof savedWord !== "object" ||
        !Number.isInteger(savedWord.status) || savedWord.status < 0 || savedWord.status > 4 ||
        !(savedWord.dueDate === null || validDate(savedWord.dueDate)) ||
        !Number.isInteger(savedWord.consecutiveCorrect) || savedWord.consecutiveCorrect < 0) {
      throw new Error(`"${word.word}"의 학습 기록이 올바르지 않아요.`);
    }
  }

  if (!Array.isArray(progress.activeDates) || !progress.activeDates.every(validDate) ||
      !Array.isArray(progress.todayMistakes) ||
      !progress.todayMistakes.every((id) => Number.isInteger(id) && validWordIds.has(String(id))) ||
      !Array.isArray(progress.todaySessionWords) ||
      !progress.todaySessionWords.every((id) => Number.isInteger(id) && validWordIds.has(String(id))) ||
      !validDate(progress.mistakeDate) || !validDate(progress.sessionDate) ||
      !SESSION_LENGTH_OPTIONS.includes(progress.sessionLength) ||
      !DECK_VALUES.includes(progress.currentDeck)) {
    throw new Error("백업의 날짜, 세션 설정 또는 학습 이력 형식이 올바르지 않아요.");
  }

  return progress;
}

// 한글 설명 주석: FileReader로 JSON을 읽고 검증을 통과한 경우에만 활성 프로필의 기록을 교체해요.
function handleBackupFileSelection(event) {
  const backupFile = event.currentTarget.files[0];
  if (!backupFile) {
    return;
  }

  if (backupFile.size > 2 * 1024 * 1024) {
    backupStatus.textContent = "백업 파일은 2MB 이하만 불러올 수 있어요.";
    backupFileInput.value = "";
    return;
  }

  backupStatus.textContent = "";
  const reader = new FileReader();
  reader.onload = () => {
    try {
      // 한글 설명 주석: 파일 읽기가 끝난 뒤 JSON을 파싱하고 모든 필수 데이터가 유효한지 먼저 확인해요.
      const backupData = JSON.parse(String(reader.result));
      const importedProgress = validateProgressBackup(backupData);
      localStorage.setItem(
        getUserDataStorageKey(activeUserName),
        JSON.stringify(importedProgress)
      );

      // 한글 설명 주석: 저장 완료 후 메모리의 단어/이력과 대시보드를 저장된 기록으로 다시 맞춰요.
      loadProgress();
      sessionLengthSelect.value = String(history.sessionLength);
      currentSession = [];
      currentRoundQueue = [];
      clearQuizAutoAdvanceTimer();
      setStudyControlsLocked(false);
      renderWelcome();
      backupStatus.textContent = "학습 기록을 성공적으로 불러왔어요!";
    } catch (error) {
      console.error("Backup import error:", error);
      backupStatus.textContent = `기록을 불러오지 못했어요. ${error.message}`;
    } finally {
      backupFileInput.value = "";
    }
  };
  reader.onerror = () => {
    console.error("Backup file read error:", reader.error);
    backupStatus.textContent = `파일을 읽지 못했어요. ${reader.error?.message || "다른 파일을 선택해 주세요."}`;
    backupFileInput.value = "";
  };
  reader.onabort = () => {
    backupStatus.textContent = "파일 읽기가 취소되었어요.";
    backupFileInput.value = "";
  };
  // 한글 설명 주석: FileReader API가 UTF-8 JSON 백업을 비동기로 읽도록 시작해요.
  reader.readAsText(backupFile, "UTF-8");
}

// 한글 설명 주석: 익힌 단어 수, 오늘 복습 예정 수, 오늘까지의 연속 학습 일수를 계산해 표시해요.
function renderDashboard() {
  const today = getLocalDateKey();
  resetMistakesForToday();
  // 한글 설명 주석: SRS 기억 분포는 현재 선택 덱에 관계없이 전체 단어집을 집계해요.
  const totalWords = words.length;
  const unlearnedCount = words.filter((word) => word.status === 0).length;
  const shortTermCount = words.filter((word) => word.status === 1).length;
  const midTermCount = words.filter((word) => word.status === 2).length;
  const longTermCount = words.filter((word) => word.status >= 3).length;
  const studiedCount = totalWords - unlearnedCount;
  const setRetentionTier = (tier, count) => {
    document.querySelector(`#retention-count-${tier}`).textContent = String(count);
    document.querySelector(`#retention-segment-${tier}`).style.width =
      `${totalWords === 0 ? 0 : (count / totalWords) * 100}%`;
  };
  setRetentionTier("new", unlearnedCount);
  setRetentionTier("learning", shortTermCount);
  setRetentionTier("reviewing", midTermCount);
  setRetentionTier("mastered", longTermCount);
  document.querySelector("#retention-total").textContent = `${studiedCount} / ${totalWords} 단어 학습 시작`;
  document.querySelector("#retention-bar").setAttribute(
    "aria-label",
    `전체 ${totalWords}개 단어: 미학습 ${unlearnedCount}, 단기 기억 ${shortTermCount}, 중기 기억 ${midTermCount}, 장기 기억 ${longTermCount}`
  );

  // 한글 설명 주석: 로드맵과 빠른 행동은 현재 선택 덱 기준으로 계산해요.
  const deckWords = getCurrentDeckWords();
  const dueCount = deckWords.filter((word) => word.dueDate && word.dueDate <= today).length;
  const masteredCount = deckWords.filter((word) => word.status === 4).length;
  const allDeckWordsMastered = deckWords.length > 0 && masteredCount === deckWords.length;
  const streakCount = calculateDailyStreak(history.activeDates);
  const mistakeCount = getTodayMistakeWords().length;
  const todayWordsCount = getTodaySessionWordList().length;
  // 한글 설명 주석: 미학습/복습 예정 단어가 있을 때 SRS 버튼을 활성화하고 나머지 행동은 덱에 맞춰 안내해요.
  const availableCount = deckWords.filter((word) =>
    word.status === 0 || (word.dueDate && word.dueDate <= today)
  ).length;
  const extraCount = deckWords.filter((word) => word.status === 0).length;

  // 한글 설명 주석: 현재 덱을 헤더, 빠른 학습 안내와 로드맵에 표시하고 선택된 카드를 강조해요.
  deckTriggerButton.textContent = `📑 덱: ${currentDeck === "all" ? "전체 단어장" : currentDeck} ▾`;
  renderDeckOptions();
  renderChapterRoadmap();
  selectedDeckLabel.textContent = `${currentDeck === "all" ? "전체 단어장" : currentDeck} · ${deckWords.length.toLocaleString("ko-KR")}개 단어`;
  document.querySelector("#due-count").textContent = String(dueCount);
  document.querySelector("#streak-count").textContent = String(streakCount);
  document.querySelector("#mistake-count").textContent = String(mistakeCount);
  reviewMistakesButton.disabled = mistakeCount === 0;
  reviewMistakesButton.textContent = allDeckWordsMastered
    ? `오답 집중 복습 (${mistakeCount})`
    : `오늘 틀린 단어 복습하기 (${mistakeCount})`;
  // 한글 설명 주석: 아직 배울 단어가 남으면 추가 세션을 제공하고, 모두 마스터한 Day에는 전체 카드 복습을 제안해요.
  studyExtraButton.disabled = extraCount === 0;
  studyExtraButton.textContent = `추가 단어 공부하기 (${extraCount})`;
  reviewTodayWordsButton.disabled = todayWordsCount === 0;
  reviewTodayWordsButton.textContent = `오늘 학습한 전체 단어 다시보기 (${todayWordsCount})`;
  reviewMasteredDeckButton.classList.toggle("hidden", !allDeckWordsMastered);
  reviewMasteredDeckButton.disabled = !allDeckWordsMastered;
  // 한글 설명 주석: 학습/진단 세션 중에는 로드맵의 전체 단어장 전환도 잠가 현재 세션 범위를 지켜요.
  roadmapAllButton.disabled = studyControlsLocked;
  analyticsTriggerButton.disabled = studyControlsLocked;
  startButton.disabled = availableCount === 0 || studyControlsLocked;
  startButton.textContent = "🔥 오늘의 학습 시작하기";
  synonymMatchButton.disabled = studyControlsLocked;
  fillBlankButton.disabled = studyControlsLocked;
  levelTestButton.disabled = studyControlsLocked;
  studyExtraButton.disabled = extraCount === 0 || studyControlsLocked;
  reviewMistakesButton.disabled = mistakeCount === 0 || studyControlsLocked;
  reviewTodayWordsButton.disabled = todayWordsCount === 0 || studyControlsLocked;
  reviewMasteredDeckButton.disabled = !allDeckWordsMastered || studyControlsLocked;
  installGuideReopenButton.hidden = isStandaloneApp() || !installGuideDismissed;
}

// 한글 설명 주석: 세션 중에는 새 학습 동작만 잠그고 덱 버튼은 이탈 확인을 거쳐 전환할 수 있게 열어 둬요.
function setStudyControlsLocked(isLocked) {
  studyControlsLocked = isLocked;
  deckTriggerButton.disabled = false;
  // 한글 설명 주석: 학습/진단 화면에 들어갈 때만 대시보드 요소를 숨기고 닫기 버튼을 보여줘요.
  document.body.classList.toggle("focus-mode", isLocked);
  if (isLocked) {
    focusToolbar.hidden = false;
    focusToolbar.insertBefore(soundToggleButton, focusExitButton);
  } else {
    soundTogglePlaceholder.before(soundToggleButton);
    focusToolbar.hidden = true;
  }
  focusExitButton.hidden = !isLocked;
  renderDashboard();
}

// 한글 설명 주석: 덱 선택을 적용해 프로필별로 저장한 뒤 서랍을 닫고 시작 화면을 갱신해요.
function saveCurrentDeck(deckValue) {
  if (activeStudySession) {
    requestSessionExit(() => saveCurrentDeck(deckValue));
    return;
  }
  currentDeck = DECK_VALUES.includes(deckValue) ? deckValue : "all";
  saveProgress();
  closeDeckDrawer();
  renderWelcome();
}

// 한글 설명 주석: 진행 중일 때만 확인 창을 열고, 요청한 이동 작업은 나가기 선택 뒤에 보관해 실행해요.
function requestSessionExit(onConfirm) {
  if (!activeStudySession) {
    onConfirm();
    return;
  }
  if (!sessionExitOverlay.hidden) {
    return;
  }

  pendingSessionExitAction = onConfirm;
  sessionExitReturnFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  sessionExitOverlay.hidden = false;
  sessionExitStayButton.focus({ preventScroll: true });
}

// 한글 설명 주석: 홈 이동도 공통 세션 가드를 사용해 진행 중인 학습을 실수로 잃지 않게 해요.
function navigateHome() {
  requestSessionExit(() => {
    clearCurrentStudySession();
    if (studyControlsLocked) {
      setStudyControlsLocked(false);
    }
    renderWelcome();
    startButton.focus({ preventScroll: true });
  });
}

// 한글 설명 주석: 계속 학습하기나 배경 클릭은 이동 작업을 버리고 원래 화면에 머물러요.
function dismissSessionExitWarning() {
  if (sessionExitOverlay.hidden) {
    return;
  }

  sessionExitOverlay.hidden = true;
  pendingSessionExitAction = null;
  if (sessionExitReturnFocus?.isConnected) {
    sessionExitReturnFocus.focus({ preventScroll: true });
  }
  sessionExitReturnFocus = null;
}

// 한글 설명 주석: 세션을 끝낼 때 플래시카드/퀴즈/진단의 임시 큐와 타이머를 한곳에서 초기화해요.
function clearCurrentStudySession() {
  activeStudySession = false;
  clearQuizAutoAdvanceTimer();
  clearModeTransitionTimer();
  levelTestState = null;
  synonymMatchRound = null;
  fillBlankRound = null;
  currentSession = [];
  currentRoundQueue = [];
  sessionWordsById = new Map();
  sessionWordIds = new Set();
  completedWordIds = new Set();
  hadMistakeWordIds = new Set();
  phaseByWordId = new Map();
  retryWordIds = new Set();
  sessionMode = "regular";
}

// 한글 설명 주석: 나가기를 확인하면 임시 퀴즈 상태와 타이머를 폐기한 뒤 요청한 화면으로 이동해요.
function confirmSessionExit() {
  const onConfirm = pendingSessionExitAction;
  dismissSessionExitWarning();
  if (!onConfirm) {
    return;
  }

  clearCurrentStudySession();
  setStudyControlsLocked(false);
  onConfirm();
}

// 한글 설명 주석: 최상단 확인 창에서 ESC를 누르면 나가지 않고 현재 학습을 계속해요.
function handleSessionExitKeydown(event) {
  if (event.key === "Escape" && !sessionExitOverlay.hidden) {
    event.preventDefault();
    event.stopImmediatePropagation();
    dismissSessionExitWarning();
  }
}

// 한글 설명 주석: Day 1부터 마지막 덱까지 현재 상태, 마스터 수와 진행 막대를 카드로 그려요.
function renderChapterRoadmap() {
  chapterRoadmap.replaceChildren();
  const deckNames = DECK_VALUES.filter((deckName) => deckName !== "all");

  deckNames.forEach((deckName) => {
    const deckWords = words.filter((word) => word.deck === deckName);
    const masteredCount = deckWords.filter((word) => word.status === 4).length;
    const startedCount = deckWords.filter((word) => word.status > 0).length;
    const completion = deckWords.length === 0 ? 0 : Math.round((masteredCount / deckWords.length) * 100);
    const isComplete = deckWords.length > 0 && masteredCount === deckWords.length;
    const isStarted = startedCount > 0;
    const dayNumber = Number(deckName.slice(4));
    const card = createElement("button", "chapter-card");
    card.type = "button";
    card.setAttribute("aria-current", String(currentDeck === deckName));
    card.setAttribute("aria-label", `${getDeckDisplayTitle(dayNumber)}, ${masteredCount}/${deckWords.length} 마스터, ${completion}% 완료`);
    card.disabled = studyControlsLocked;
    card.addEventListener("click", () => selectRoadmapDeck(deckName));

    const top = createElement("div", "chapter-card-top");
    const titleGroup = createElement("span", "");
    titleGroup.append(
      createElement("span", "chapter-card-title", getDeckDisplayTitle(dayNumber)),
      createElement("span", "chapter-card-subtitle", `${deckWords.length}개 단어 · ${getDeckBandSubtitle(dayNumber)}`)
    );
    const badge = createElement(
      "span",
      `chapter-status${isComplete ? " is-complete" : currentDeck === deckName ? " is-active" : ""}`,
      isComplete ? "완료 ★" : isStarted ? "학습 중" : "시작 전"
    );
    top.append(titleGroup, badge);

    const progressCopy = createElement("div", "chapter-card-progress-copy");
    progressCopy.append(
      createElement("strong", "", `${masteredCount} / ${deckWords.length}`),
      createElement("span", "", `${completion}%`)
    );
    const progressTrack = createElement("div", "chapter-progress-track");
    progressTrack.setAttribute("aria-hidden", "true");
    const progressFill = createElement("div", "chapter-progress-fill");
    progressFill.style.width = `${completion}%`;
    progressTrack.append(progressFill);
    card.append(top, progressCopy, progressTrack);
    chapterRoadmap.append(card);
  });
}

// 한글 설명 주석: 모든 Day 카드에 알아보기 쉬운 영어 챕터 제목을 붙여요.
function getDeckDisplayTitle(dayNumber) {
  const deckTitles = {
    1: "High Frequency Core",
    2: "Academic Foundations",
    3: "Academic Essentials",
    4: "Core Academic",
    5: "Research & Evidence",
    6: "Analysis & Change",
    7: "Advanced Academic",
    8: "High-Scoring Vocabulary",
    9: "Nuance & Precision",
    10: "Mastery Challenge"
  };
  return `Day ${dayNumber} - ${deckTitles[dayNumber] || "Vocabulary"}`;
}

// 한글 설명 주석: 덱을 Foundation/Core/Advanced 단계로 묶어 카드에 학습 흐름을 덧붙여요.
function getDeckBandSubtitle(dayNumber) {
  if (dayNumber <= 10) {
    return "기초 빈출";
  }
  if (dayNumber <= 20) {
    return "실전 핵심";
  }
  return "상위권 완성";
}

// 한글 설명 주석: 로드맵이나 전체 단어장 버튼에서 선택을 바꾸고 저장한 뒤 카드/액션을 함께 갱신해요.
function selectRoadmapDeck(deckName) {
  if (activeStudySession) {
    requestSessionExit(() => selectRoadmapDeck(deckName));
    return;
  }
  if (studyControlsLocked) {
    return;
  }

  closeAnalyticsModal();
  currentDeck = DECK_VALUES.includes(deckName) ? deckName : "all";
  saveProgress();
  renderWelcome();
}

// 한글 설명 주석: 분석 버튼을 누르면 최신 지표를 그린 뒤 모달을 열고 닫기 버튼으로 포커스를 옮겨요.
function openAnalyticsModal() {
  if (analyticsTriggerButton.disabled) {
    return;
  }

  if (analyticsCloseTimer !== null) {
    window.clearTimeout(analyticsCloseTimer);
    analyticsCloseTimer = null;
  }
  renderDashboard();
  analyticsOverlay.hidden = false;
  analyticsOverlay.setAttribute("aria-hidden", "false");
  analyticsTriggerButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("analytics-open");
  analyticsOverlay.classList.add("is-open");
  analyticsCloseButton.focus({ preventScroll: true });
  // 한글 설명 주석: 포커스 이동으로 스크롤이 바뀌지 않도록 모달을 연 뒤 최상단 위치를 확정해요.
  analyticsModalContent.scrollTop = 0;
}

// 한글 설명 주석: 닫기 애니메이션 동안 모달 상태와 배경 스크롤을 정리하고 포커스를 헤더로 돌려요.
function closeAnalyticsModal() {
  if (analyticsOverlay.hidden) {
    return;
  }

  analyticsOverlay.classList.remove("is-open");
  analyticsOverlay.setAttribute("aria-hidden", "true");
  analyticsTriggerButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("analytics-open");
  if (analyticsCloseTimer !== null) {
    window.clearTimeout(analyticsCloseTimer);
  }
  analyticsCloseTimer = window.setTimeout(() => {
    analyticsOverlay.hidden = true;
    analyticsCloseTimer = null;
  }, 250);
  analyticsTriggerButton.focus();
}

// 한글 설명 주석: 분석 모달이 열린 동안 ESC 키를 누르면 같은 닫기 흐름으로 대시보드에 돌아가요.
function handleAnalyticsModalKeydown(event) {
  if (event.key === "Escape" && !analyticsOverlay.hidden) {
    closeAnalyticsModal();
  }
}

// 한글 설명 주석: 설정을 열 때 최신 상태를 반영하고 닫기 버튼으로 키보드 포커스를 옮겨요.
function openSettingsModal() {
  if (studyControlsLocked || settingsTriggerButton.disabled) {
    return;
  }

  if (settingsCloseTimer !== null) {
    window.clearTimeout(settingsCloseTimer);
    settingsCloseTimer = null;
  }
  renderDashboard();
  settingsOverlay.hidden = false;
  settingsOverlay.setAttribute("aria-hidden", "false");
  settingsTriggerButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("settings-open");
  settingsOverlay.classList.add("is-open");
  settingsCloseButton.focus({ preventScroll: true });
}

// 한글 설명 주석: 닫힘 애니메이션 후 설정을 숨기고, 필요한 경우 헤더의 설정 버튼으로 포커스를 돌려요.
function closeSettingsModal(restoreFocus = true) {
  if (settingsOverlay.hidden) {
    return;
  }

  settingsOverlay.classList.remove("is-open");
  settingsOverlay.setAttribute("aria-hidden", "true");
  settingsTriggerButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("settings-open");
  if (settingsCloseTimer !== null) {
    window.clearTimeout(settingsCloseTimer);
  }
  settingsCloseTimer = window.setTimeout(() => {
    settingsOverlay.hidden = true;
    settingsCloseTimer = null;
  }, 250);
  if (restoreFocus) {
    settingsTriggerButton.focus({ preventScroll: true });
  }
}

// 한글 설명 주석: Escape는 모달을 닫고, Tab 키는 포커스가 설정 창 바깥으로 빠져나가지 않게 해요.
function handleSettingsModalKeydown(event) {
  if (settingsOverlay.hidden) {
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeSettingsModal();
    return;
  }
  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = [...settingsDialog.querySelectorAll(
    'button:not(:disabled), input:not(:disabled):not([type="file"]), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
  )].filter((element) => !element.hidden && element.getClientRects().length > 0);
  if (focusableElements.length === 0) {
    event.preventDefault();
    settingsDialog.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

// 한글 설명 주석: 사용자의 동의를 받은 의견만 Web3Forms로 보내고 서버가 성공을 확인한 뒤 입력을 비워요.
async function handleFeedbackSubmit(event) {
  event.preventDefault();
  if (feedbackSubmitting) {
    return;
  }

  const feedback = settingsFeedbackMessage.value.trim();
  const accessKey = web3FormsAccessKeyInput.value.trim();
  if (!feedback) {
    settingsFeedbackStatus.textContent = "의견을 입력한 뒤 보내 주세요.";
    settingsFeedbackMessage.focus();
    return;
  }

  if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
    settingsFeedbackStatus.textContent = "아직 의견 전송을 설정하지 않았어요. idjin1009@gmail.com에 연결된 Web3Forms access key를 등록해 주세요.";
    return;
  }

  feedbackSubmitting = true;
  const submitButton = settingsFeedbackForm.querySelector('button[type="submit"]');
  const originalButtonLabel = submitButton.textContent;
  settingsFeedbackForm.setAttribute("aria-busy", "true");
  settingsFeedbackMessage.disabled = true;
  submitButton.disabled = true;
  submitButton.textContent = "전송 중...";
  settingsFeedbackStatus.textContent = "의견을 전송하고 있어요...";

  try {
    // 한글 설명 주석: Web3Forms는 access_key에 연결된 수신 주소로 제목과 메시지를 이메일 전달해요.
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: "[Voca Impulse] 새로운 사용자 피드백",
        from_name: "Voca Impulse 사용자",
        message: feedback
      })
    });

    const result = await response.json();
    if (!response.ok || result.success !== true) {
      throw new Error(typeof result.message === "string"
        ? result.message
        : `Web3Forms 요청에 실패했어요 (HTTP ${response.status}).`);
    }

    settingsFeedbackMessage.value = "";
    settingsFeedbackStatus.textContent = "소중한 의견이 개발자에게 전송되었습니다! 감사합니다.";
  } catch (error) {
    console.error("Web3Forms feedback submission failed:", error);
    settingsFeedbackStatus.textContent = "의견을 전송하지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.";
  } finally {
    feedbackSubmitting = false;
    settingsFeedbackForm.removeAttribute("aria-busy");
    settingsFeedbackMessage.disabled = false;
    submitButton.disabled = false;
    submitButton.textContent = originalButtonLabel;
  }
}

// 한글 설명 주석: 마스터한 Day의 모든 단어를 SRS 변경 없이 참고 카드로 순서대로 복습해요.
function renderDeckReview() {
  const deckWords = getCurrentDeckWords();
  if (deckWords.length === 0) {
    renderWelcome();
    return;
  }

  // 한글 설명 주석: 덱 다시보기는 읽기 전용 카드이므로 대시보드 이동 확인을 띄우지 않아요.
  activeStudySession = false;
  setStudyControlsLocked(true);
  const reviewIndex = { current: 0 };
  const renderCard = () => {
    const word = deckWords[reviewIndex.current];
    const section = createElement("section", "panel-content");
    section.append(
      createProgressHeader(`${currentDeck} 전체 다시보기`, reviewIndex.current + 1, deckWords.length),
      createStudyReferenceCard(word)
    );
    const actions = createElement("div", "stage-actions");
    const previousButton = createElement("button", "button secondary", "← 이전 단어");
    previousButton.type = "button";
    previousButton.disabled = reviewIndex.current === 0;
    previousButton.addEventListener("click", () => {
      reviewIndex.current -= 1;
      renderCard();
    });
    const nextButton = createElement("button", "button secondary", "다음 단어 →");
    nextButton.type = "button";
    nextButton.disabled = reviewIndex.current === deckWords.length - 1;
    nextButton.addEventListener("click", () => {
      reviewIndex.current += 1;
      renderCard();
    });
    const backButton = createElement("button", "button", "대시보드로 돌아가기");
    backButton.type = "button";
    backButton.addEventListener("click", () => requestSessionExit(renderWelcome));
    actions.append(previousButton, nextButton, backButton);
    section.append(actions);
    appContent.replaceChildren(section);
  };
  renderCard();
}

// 한글 설명 주석: 각 덱의 전체 단어 수와 마스터 수를 배지로 보여주고 현재 덱을 강조해요.
function renderDeckOptions() {
  deckOptionsContainer.replaceChildren();

  DECK_VALUES.forEach((deckValue) => {
    const deckWords = deckValue === "all"
      ? words
      : words.filter((word) => word.deck === deckValue);
    const masteredCount = deckWords.filter((word) => word.status === 4).length;
    const option = createElement("button", "deck-option");
    option.type = "button";
    option.setAttribute("aria-current", String(currentDeck === deckValue));
    option.addEventListener("click", () => saveCurrentDeck(deckValue));

    option.append(
      createElement("span", "deck-option-name", DECK_TITLES[deckValue]),
      createElement("span", "deck-option-badge", `${deckWords.length}단어 · ${masteredCount} 마스터`)
    );
    deckOptionsContainer.append(option);
  });
}

// 한글 설명 주석: 트리거를 누르면 서랍을 열고 닫기 버튼에 키보드 포커스를 이동해요.
function openDeckDrawer() {
  if (activeStudySession) {
    requestSessionExit(() => {
      renderWelcome();
      openDeckDrawer();
    });
    return;
  }
  if (deckTriggerButton.disabled) {
    return;
  }

  renderDeckOptions();
  deckDrawerOverlay.classList.add("is-open");
  deckDrawerOverlay.setAttribute("aria-hidden", "false");
  deckTriggerButton.setAttribute("aria-expanded", "true");
  deckDrawerCloseButton.focus();
}

// 한글 설명 주석: 닫을 때는 전환 클래스를 제거하고 포커스를 트리거로 돌려보내요.
function closeDeckDrawer() {
  deckDrawerOverlay.classList.remove("is-open");
  deckDrawerOverlay.setAttribute("aria-hidden", "true");
  deckTriggerButton.setAttribute("aria-expanded", "false");
  deckTriggerButton.focus();
}

// 한글 설명 주석: Escape 키로도 덱 서랍을 닫아 키보드 사용자가 편하게 이동하게 해요.
function handleDeckDrawerKeydown(event) {
  if (event.key === "Escape" && deckDrawerOverlay.classList.contains("is-open")) {
    closeDeckDrawer();
  }
}

// 한글 설명 주석: 전체 단어장이면 모든 단어를, 특정 덱이면 그 덱에 속한 단어만 반환하는 공통 필터예요.
function getCurrentDeckWords() {
  return currentDeck === "all"
    ? words
    : words.filter((word) => word.deck === currentDeck);
}

// 한글 설명 주석: 날짜가 바뀌면 오늘 확인한 단어 ID 목록을 새 날짜의 빈 목록으로 초기화해요.
function resetTodaySessionWords() {
  const today = getLocalDateKey();
  if (history.sessionDate !== today) {
    history.sessionDate = today;
    history.todaySessionWords = [];
  }
}

// 한글 설명 주석: 오늘 기록된 단어 ID를 실제 단어 객체 목록으로 바꾸고 없는 ID는 자동으로 제외해요.
function getTodaySessionWordList() {
  resetTodaySessionWords();
  const sessionIds = new Set(history.todaySessionWords);
  return getCurrentDeckWords().filter((word) => sessionIds.has(word.id));
}

// 한글 설명 주석: 세션 단어 카드가 표시될 때 ID를 중복 없이 보관하고 버튼 개수와 저장 기록을 갱신해요.
function recordTodaySessionWord(word) {
  resetTodaySessionWords();
  if (!history.todaySessionWords.includes(word.id)) {
    history.todaySessionWords.push(word.id);
    saveProgress();
    renderDashboard();
  }
}

// 한글 설명 주석: 날짜가 바뀐 뒤에도 앱을 열어 둔 경우 오늘 오답 목록을 새 날짜에 맞춰 비워요.
function resetMistakesForToday() {
  const today = getLocalDateKey();
  if (history.mistakeDate !== today) {
    history.mistakeDate = today;
    history.todayMistakes = [];
  }
}

// 한글 설명 주석: 저장된 오답 ID 가운데 현재 단어 데이터에도 존재하는 단어만 복습 대상으로 반환해요.
function getTodayMistakeWords() {
  resetMistakesForToday();
  const mistakeIds = new Set(history.todayMistakes);
  return getCurrentDeckWords().filter((word) => mistakeIds.has(word.id));
}

// 한글 설명 주석: 가장 최근 학습 날짜가 오늘인지 확인하고 날짜를 거꾸로 세어 현재 연속 일수를 구해요.
function calculateDailyStreak(activeDates) {
  const uniqueDates = new Set(activeDates);
  let streak = 0;
  let dateKey = getLocalDateKey();
  while (uniqueDates.has(dateKey)) {
    streak += 1;
    dateKey = addDays(dateKey, -1);
  }
  return streak;
}

// 한글 설명 주석: 설정 드롭다운에서 선택한 세션 단어 수를 검증하고 학습 이력과 함께 저장해요.
function saveSessionLength() {
  const selectedLength = Number(sessionLengthSelect.value);
  if (!SESSION_LENGTH_OPTIONS.includes(selectedLength)) {
    sessionLengthSelect.value = String(history.sessionLength);
    return;
  }
  history.sessionLength = selectedLength;
  saveProgress();
}

// 한글 설명 주석: 오늘 복습 대상과 새 단어를 같은 규칙으로 모아 선택한 세션 크기만큼 정확히 잘라요.
function getAvailableLearningWords() {
  // 한글 설명 주석: 오늘보다 복습일이 같거나 이른 단어와 상태 0 단어가 세션 후보예요.
  const today = getLocalDateKey();
  // 한글 설명 주석: 오래 기다린 복습을 우선해 정렬하면 선택한 세션 크기를 먼저 오래된 복습에 써요.
  return getCurrentDeckWords()
    .filter((word) => word.status === 0 || (word.dueDate && word.dueDate <= today))
    .sort((first, second) => {
      const firstDueDate = first.dueDate || "0000-00-00";
      const secondDueDate = second.dueDate || "0000-00-00";
      return firstDueDate.localeCompare(secondDueDate) || first.id - second.id;
    });
}

// 한글 설명 주석: 사용자가 선택한 분량을 적용해 해당 크기 이하로 오늘 학습 세션을 구성해요.
function startLearning(sessionLength = history.sessionLength) {
  const availableWords = getAvailableLearningWords().slice(0, sessionLength);
  if (availableWords.length === 0) {
    renderNoWordsAvailable();
    return;
  }

  startSession(availableWords, "regular");
}

// 한글 설명 주석: 시작 직전에 원하는 분량을 고르게 해 설정값을 따르거나 이번 세션만 더 길게 공부할 수 있어요.
function openBatchSizePicker(mode) {
  batchSizeSelectionMode = mode === "extra" ? "extra" : "regular";
  batchSizeReturnFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  const isExtraSession = batchSizeSelectionMode === "extra";
  const candidateCount = isExtraSession
    ? getCurrentDeckWords().filter((word) => word.status === 0).length
    : getAvailableLearningWords().length;
  batchSizeTitle.textContent = isExtraSession ? "추가로 공부할 단어 수" : "오늘 학습 단어 수";
  batchSizeDescription.textContent = isExtraSession
    ? "미학습 단어 중 원하는 만큼 골라 이어서 공부해 보세요."
    : "복습 예정 단어와 새 단어를 선택한 분량만큼 공부해요.";
  batchSizeAvailability.textContent = `현재 선택한 덱에서 ${candidateCount.toLocaleString("ko-KR")}개를 학습할 수 있어요.`;
  batchSizeOptions.replaceChildren();

  SESSION_LENGTH_OPTIONS.forEach((length) => {
    const isSelected = !isExtraSession && length === history.sessionLength;
    const option = createElement(
      "button",
      `batch-size-option${isSelected ? " is-selected" : ""}`,
      `${isExtraSession ? "+" : ""}${length}단어`
    );
    option.type = "button";
    option.setAttribute("aria-pressed", String(isSelected));
    option.addEventListener("click", () => {
      closeBatchSizePicker(false);
      if (isExtraSession) {
        startExtraLearning(length);
        return;
      }

      history.sessionLength = length;
      sessionLengthSelect.value = String(length);
      saveProgress();
      startLearning(length);
    });
    batchSizeOptions.append(option);
  });

  batchSizeOverlay.hidden = false;
  batchSizeOverlay.setAttribute("aria-hidden", "false");
  batchSizeDialog.focus({ preventScroll: true });
}

// 한글 설명 주석: 분량 선택을 취소하면 이전 화면에 머물고, 시작하면 새 학습 화면으로 자연스럽게 이동해요.
function closeBatchSizePicker(restoreFocus = true) {
  if (batchSizeOverlay.hidden) {
    return;
  }
  batchSizeOverlay.hidden = true;
  batchSizeOverlay.setAttribute("aria-hidden", "true");
  if (restoreFocus && batchSizeReturnFocus?.isConnected) {
    batchSizeReturnFocus.focus({ preventScroll: true });
  }
  batchSizeReturnFocus = null;
}

// 한글 설명 주석: Escape로 분량 선택을 닫고 Tab 포커스가 모달 바깥으로 빠져나가지 않게 해요.
function handleBatchSizePickerKeydown(event) {
  if (batchSizeOverlay.hidden) {
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeBatchSizePicker();
    return;
  }
  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = [...batchSizeDialog.querySelectorAll("button:not(:disabled)")];
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  if (document.activeElement === batchSizeDialog) {
    event.preventDefault();
    (event.shiftKey ? lastElement : firstElement).focus();
  } else if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

// 한글 설명 주석: 진단 시작 전 목표 문항 수와 예상 시간을 안내하고 테스트 진입/취소를 제공해요.
function renderLevelTestIntro() {
  // 한글 설명 주석: 안내 화면에서는 아직 문항 풀이를 시작하지 않았으므로 이탈 경고를 잠그지 않아요.
  activeStudySession = false;
  setStudyControlsLocked(false);
  const section = createElement("section", "panel-content");
  const card = createElement("div", "level-test-card");
  card.append(
    createElement("div", "welcome-icon", "🎯"),
    createElement("h2", "", "어휘 레벨 테스트"),
    createElement("p", "", "총 15문항으로 나의 토플 어휘 레벨을 3분 만에 진단합니다."),
    createElement("p", "", "기초부터 고급까지 단어의 한국어 뜻을 골라 주세요. 테스트 중에는 정답 여부를 표시하지 않아요.")
  );

  const actions = createElement("div", "stage-actions");
  const startButton = createElement("button", "button", "테스트 시작");
  startButton.type = "button";
  startButton.addEventListener("click", startLevelTest);
  const cancelButton = createElement("button", "button secondary", "대시보드로 돌아가기");
  cancelButton.type = "button";
  cancelButton.addEventListener("click", exitLevelTest);
  actions.append(startButton, cancelButton);
  section.append(card, actions);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 30일 로드맵을 세 구간으로 나누고 각 구간에서 5개씩 무작위 추출해요.
function createLevelTestQuestions() {
  const difficultyBands = [
    { label: "기초 빈출", firstDay: 1, lastDay: 10 },
    { label: "실전 핵심", firstDay: 11, lastDay: 20 },
    { label: "상위권 완성", firstDay: 21, lastDay: 30 }
  ];

  // 한글 설명 주석: 각 구간을 독립적으로 섞어 다섯 문제씩 뽑아 특정 덱이나 ID 순서의 편향을 줄여요.
  return difficultyBands.flatMap((band) => {
    const bandWords = words.filter((word) => {
      const dayNumber = Number(word.deck.slice(4));
      return dayNumber >= band.firstDay && dayNumber <= band.lastDay;
    });
    if (bandWords.length < 5) {
      throw new Error(`${band.label} 구간에 레벨 테스트용 단어가 다섯 개보다 적어요.`);
    }

    return shuffle(bandWords).slice(0, 5).map((word) => ({
      word,
      difficultyLabel: band.label,
      choices: createLevelTestChoices(word)
    }));
  });
}

// 한글 설명 주석: 정답 뜻 하나에 서로 다른 오답 뜻 세 개를 더하고 선택지 순서를 다시 섞어요.
function createLevelTestChoices(targetWord) {
  const correctMeaning = targetWord.meaning;
  const distractorMeanings = [...new Set(
    shuffle(words)
      .filter((word) => word.id !== targetWord.id && word.meaning !== correctMeaning)
      .map((word) => word.meaning)
  )].slice(0, 3);

  if (distractorMeanings.length < 3) {
    throw new Error("레벨 테스트 선택지를 만들 만큼 서로 다른 단어 뜻이 충분하지 않아요.");
  }

  return shuffle([correctMeaning, ...distractorMeanings]);
}

// 한글 설명 주석: 난이도별 다섯 문항을 준비하고 정답 공개 없이 첫 문제부터 순서대로 보여줘요.
function startLevelTest() {
  // 한글 설명 주석: 실제 문항 풀이가 시작되는 순간부터 덱/프로필 전환 시 세션 이탈을 확인해요.
  activeStudySession = true;
  setStudyControlsLocked(true);
  try {
    levelTestState = {
      questions: createLevelTestQuestions(),
      currentIndex: 0,
      correctCount: 0,
      correctWordIds: new Set()
    };
    renderLevelTestQuestion();
  } catch (error) {
    activeStudySession = false;
    setStudyControlsLocked(false);
    showError(error instanceof Error ? error.message : "레벨 테스트를 준비하지 못했어요.");
  }
}

// 한글 설명 주석: 문항마다 진행도, 현재 단어와 네 가지 뜻만 보여주어 테스트 중 정답 피드백을 감춰요.
function renderLevelTestQuestion() {
  const state = levelTestState;
  if (!state) {
    return;
  }
  if (state.currentIndex >= state.questions.length) {
    renderLevelTestResult();
    return;
  }

  const question = state.questions[state.currentIndex];
  const section = createElement("section", "panel-content");
  section.append(createProgressHeader("어휘 레벨 테스트", state.currentIndex + 1, state.questions.length));

  const card = createElement("article", "level-test-card");
  card.append(
    createElement("p", "question-kicker", question.difficultyLabel),
    createElement("p", "level-test-prompt", "이 단어의 뜻으로 가장 알맞은 것을 골라 주세요."),
    createElement("h2", "level-test-word", question.word.word)
  );

  const choices = createElement("div", "level-test-choices");
  question.choices.forEach((meaning) => {
    const choice = createElement("button", "level-test-choice", meaning);
    choice.type = "button";
    choice.addEventListener("click", () => submitLevelTestAnswer(meaning));
    choices.append(choice);
  });

  card.append(choices);
  section.append(card);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 사용자가 뜻을 고르면 점수만 기록하고 즉시 다음 문제로 이동해 정오답을 노출하지 않아요.
function submitLevelTestAnswer(selectedMeaning) {
  const state = levelTestState;
  if (!state || state.currentIndex >= state.questions.length) {
    return;
  }

  const question = state.questions[state.currentIndex];
  if (selectedMeaning === question.word.meaning) {
    state.correctCount += 1;
    state.correctWordIds.add(question.word.id);
  }

  state.currentIndex += 1;
  renderLevelTestQuestion();
}

// 한글 설명 주석: 총점으로 배치 수준을 정하고, 맞힌 미학습 단어는 상태 1/내일 복습으로 저장해요.
function renderLevelTestResult() {
  const state = levelTestState;
  if (!state) {
    return;
  }

  // 한글 설명 주석: 정식 결과 화면에 도달하면 테스트가 끝난 상태이므로 이탈 경고를 해제해요.
  activeStudySession = false;
  setStudyControlsLocked(false);
  const score = state.correctCount;
  const placement = score <= 9
    ? {
      title: "초급 (Starter)",
      description: "Day 1부터 기초 어휘를 탄탄히 다져보세요!",
      deck: "Day 1",
      buttonLabel: "Day 1으로 시작하기"
    }
    : score <= 12
      ? {
        title: "중급 (Intermediate)",
        description: "실전 빈출 어휘 공략을 권장합니다!",
        deck: "Day 11",
        buttonLabel: "Day 11로 바로 이동하기"
      }
      : {
        title: "고급 (Advanced)",
        description: "고득점용 변별력 어휘를 집중 학습하세요!",
        deck: "Day 21",
        buttonLabel: "Day 21로 바로 이동하기"
      };

  // 한글 설명 주석: 아직 미학습 상태인 정답 단어만 내일 복습할 상태 1로 올려 기존 학습 이력은 보존해요.
  const tomorrow = addDays(getLocalDateKey(), 1);
  words.forEach((word) => {
    if (state.correctWordIds.has(word.id) && word.status === 0) {
      word.status = 1;
      word.dueDate = tomorrow;
      word.consecutiveCorrect = 0;
    }
  });
  history.activeDates = [...new Set([...history.activeDates, getLocalDateKey()])];
  saveProgress();
  renderDashboard();

  const percentage = Math.round((score / state.questions.length) * 100);
  const section = createElement("section", "panel-content");
  const card = createElement("div", "level-test-card");
  card.append(
    createElement("div", "welcome-icon", "🏁"),
    createElement("h2", "", "레벨 진단 결과"),
    createElement("p", "level-test-word", `${score} / ${state.questions.length}`),
    createElement("span", "level-test-level", `${placement.title} · ${percentage}%`),
    createElement("p", "", placement.description),
    createElement("p", "", `정답으로 확인된 단어 ${state.correctWordIds.size}개를 내일 복습할 목록에 반영했어요.`)
  );

  const actions = createElement("div", "stage-actions");
  const placementButton = createElement("button", "button", placement.buttonLabel);
  placementButton.type = "button";
  placementButton.addEventListener("click", () => {
    levelTestState = null;
    deckTriggerButton.disabled = false;
    saveCurrentDeck(placement.deck);
  });
  const dashboardButton = createElement("button", "button secondary", "대시보드로 돌아가기");
  dashboardButton.type = "button";
  dashboardButton.addEventListener("click", exitLevelTest);
  actions.append(placementButton, dashboardButton);
  section.append(card, actions);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 진단을 중단하거나 결과를 닫으면 임시 문항만 버리고 SRS 상태는 그대로 둔 채 대시보드로 돌아와요.
function exitLevelTest() {
  requestSessionExit(() => {
    levelTestState = null;
    renderWelcome();
  });
}

// 한글 설명 주석: 일반 학습과 추가 학습이 공유하는 세션 상태를 초기화하고 플래시카드로 이동해요.
function startSession(sessionWords, mode) {
  clearQuizAutoAdvanceTimer();
  // 한글 설명 주석: 플래시카드는 답을 제출하기 전 단계라 종료 경고 없이 나갈 수 있어요.
  activeStudySession = false;
  // 한글 설명 주석: 무작위 문항 순서는 앞선 단어의 맥락이 다음 답을 미리 알려 주는 것을 줄여 장기 기억을 도와요.
  // 한글 설명 주석: Fisher–Yates 섞기는 새 배열을 반환하므로 원본 단어 사전/선택 순서와 ID는 바뀌지 않아요.
  currentSession = shuffle(sessionWords);
  // 한글 설명 주석: 선택 당시 단어 목록을 보존하고, 퀴즈 대상은 플래시카드에서 건너뛸 때만 줄여요.
  sessionWordIds = new Set(currentSession.map((word) => word.id));
  sessionWordsById = new Map(currentSession.map((word) => [word.id, word]));
  completedWordIds = new Set();
  hadMistakeWordIds = new Set();
  currentRoundQueue = [];
  currentRoundNumber = 1;
  phaseByWordId = new Map();
  // 한글 설명 주석: 새 세션을 시작하면 이전 재도전 표시, 큐와 예약된 자동 이동을 초기화해요.
  retryWordIds = new Set();
  sessionMode = mode;
  // 한글 설명 주석: 세션 도중 덱이 바뀌어 카드와 퀴즈 범위가 달라지지 않도록 완료 때까지 선택을 잠가요.
  setStudyControlsLocked(true);
  flashcardIndex = 0;
  quizIndex = 0;
  currentPhase = 1;
  correctAnswers = 0;
  renderFlashcard();
}

// 한글 설명 주석: 상태 0 단어 중 선택한 개수만큼 골라 추가 미니 세션을 시작해요.
function startExtraLearning(batchSize = history.sessionLength) {
  const extraWords = getCurrentDeckWords()
    .filter((word) => word.status === 0)
    .slice(0, batchSize);
  if (extraWords.length === 0) {
    renderNoWordsAvailable();
    return;
  }
  startSession(extraWords, "extra");
}

// 한글 설명 주석: 현재 덱에서 서로 다른 동의어를 갖는 단어를 최대 5개 골라 짝짓기 게임을 시작해요.
function startSynonymMatch() {
  const usedSynonyms = new Set();
  const pairs = [];

  // 한글 설명 주석: 단어와 동의어를 무작위 순서로 살펴 같은 동의어가 중복된 타일로 나오지 않게 해요.
  for (const word of shuffle(getCurrentDeckWords())) {
    const synonym = shuffle(word.synonyms).find((candidate) =>
      !usedSynonyms.has(candidate.trim().toLocaleLowerCase())
    );
    if (!synonym) {
      continue;
    }

    usedSynonyms.add(synonym.trim().toLocaleLowerCase());
    pairs.push({ word, synonym });
    if (pairs.length === 5) {
      break;
    }
  }

  if (pairs.length < 4) {
    renderTrainingUnavailable("짝짓기 게임을 시작하려면 현재 덱에 서로 다른 동의어가 있는 단어가 4개 이상 필요해요.");
    return;
  }

  clearModeTransitionTimer();
  activeStudySession = true;
  synonymMatchRound = {
    pairs,
    shuffledSynonyms: shuffle(pairs),
    matchedWordIds: new Set(),
    selectedWordId: null,
    selectedSynonymWordId: null,
    mismatchWordIds: new Set(),
    attempts: 0,
    message: "단어와 알맞은 동의어를 차례로 선택해 보세요.",
    locked: false
  };
  fillBlankRound = null;
  sessionMode = "synonym-match";
  setStudyControlsLocked(true);
  renderSynonymMatch();
}

// 한글 설명 주석: 두 열의 타일을 그리고 현재 선택/정답/오답 상태를 다시 화면에 반영해요.
function renderSynonymMatch() {
  const round = synonymMatchRound;
  if (!round) {
    return;
  }

  const matchedCount = round.matchedWordIds.size;
  if (matchedCount === round.pairs.length) {
    renderSynonymMatchSummary();
    return;
  }

  const section = createElement("section", "panel-content");
  section.append(createProgressHeader("동의어 짝짓기", matchedCount, round.pairs.length));
  const card = createElement("div", "question-card");
  card.append(
    createElement("p", "question-kicker", "왼쪽 단어 하나와 오른쪽 동의어 하나를 골라 주세요.")
  );

  const board = createElement("div", "match-board");
  const wordColumn = createElement("div", "match-column");
  const synonymColumn = createElement("div", "match-column");
  wordColumn.append(createElement("h3", "match-column-title", "단어"));
  synonymColumn.append(createElement("h3", "match-column-title", "동의어"));

  // 한글 설명 주석: 타일은 button으로 만들어 터치와 키보드 Enter/Space 모두로 선택할 수 있어요.
  round.pairs.forEach(({ word }) => {
    wordColumn.append(createMatchTile("word", word.id, word.word));
  });
  round.shuffledSynonyms.forEach(({ word, synonym }) => {
    synonymColumn.append(createMatchTile("synonym", word.id, synonym));
  });

  board.append(wordColumn, synonymColumn);
  const status = createElement("p", "match-status", round.message);
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  if (round.message.startsWith("좋아요")) {
    status.classList.add("is-success");
  }
  card.append(board, status);

  const actions = createElement("div", "stage-actions");
  actions.append(createTrainingExitButton());
  section.append(card, actions);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 짝짓기 타일의 데이터 ID를 보존해 표시 문구가 아니라 실제 단어 쌍으로 채점해요.
function createMatchTile(side, wordId, label) {
  const round = synonymMatchRound;
  const isMatched = round.matchedWordIds.has(wordId);
  const isSelected = side === "word"
    ? round.selectedWordId === wordId
    : round.selectedSynonymWordId === wordId;
  const isMismatch = round.mismatchWordIds.has(wordId);
  const classes = [
    "match-tile",
    isMatched ? "is-matched" : "",
    isMismatch ? "is-mismatch" : ""
  ].filter(Boolean).join(" ");
  const tile = createElement("button", classes, label);
  tile.type = "button";
  tile.disabled = isMatched || round.locked;
  tile.setAttribute("aria-pressed", String(isSelected));
  tile.addEventListener("click", () => selectMatchTile(side, wordId));
  return tile;
}

// 한글 설명 주석: 왼쪽/오른쪽에서 하나씩 선택되면 ID를 비교하고 정답은 고정, 오답은 잠시 흔든 뒤 초기화해요.
function selectMatchTile(side, wordId) {
  const round = synonymMatchRound;
  if (!round || round.locked || round.matchedWordIds.has(wordId)) {
    return;
  }

  const selectedKey = side === "word" ? "selectedWordId" : "selectedSynonymWordId";
  round[selectedKey] = round[selectedKey] === wordId ? null : wordId;
  if (round.selectedWordId === null || round.selectedSynonymWordId === null) {
    round.message = "반대쪽 열에서 짝을 선택해 보세요.";
    renderSynonymMatch();
    return;
  }

  round.attempts += 1;
  if (round.selectedWordId === round.selectedSynonymWordId) {
    round.matchedWordIds.add(wordId);
    round.selectedWordId = null;
    round.selectedSynonymWordId = null;
    round.message = "좋아요! 알맞은 짝을 찾았어요.";
    renderSynonymMatch();
    if (round.matchedWordIds.size === round.pairs.length) {
      clearModeTransitionTimer();
      modeTransitionTimer = window.setTimeout(renderSynonymMatchSummary, 550);
    }
    return;
  }

  // 한글 설명 주석: 서로 다른 ID를 고르면 두 타일을 빨갛게 표시하고 짧은 애니메이션 후 다시 고르게 해요.
  round.locked = true;
  round.mismatchWordIds = new Set([round.selectedWordId, round.selectedSynonymWordId]);
  round.message = "아직 짝이 아니에요. 다시 찾아볼까요?";
  renderSynonymMatch();
  clearModeTransitionTimer();
  modeTransitionTimer = window.setTimeout(() => {
    if (!synonymMatchRound) {
      return;
    }
    synonymMatchRound.selectedWordId = null;
    synonymMatchRound.selectedSynonymWordId = null;
    synonymMatchRound.mismatchWordIds.clear();
    synonymMatchRound.locked = false;
    synonymMatchRound.message = "단어와 알맞은 동의어를 차례로 선택해 보세요.";
    renderSynonymMatch();
  }, 380);
}

// 한글 설명 주석: 모든 짝을 맞추면 시도 횟수와 정확도를 보여주고 새 라운드 또는 대시보드 이동을 제공해요.
function renderSynonymMatchSummary() {
  clearModeTransitionTimer();
  const round = synonymMatchRound;
  if (!round) {
    return;
  }

  // 한글 설명 주석: 짝짓기 완료 화면은 정상 종료이므로 이탈 확인을 요구하지 않아요.
  activeStudySession = false;
  setStudyControlsLocked(false);
  const accuracy = round.attempts === 0
    ? 100
    : Math.round((round.pairs.length / round.attempts) * 100);
  const section = createElement("section", "panel-content");
  const summary = createElement("div", "mode-summary");
  summary.append(
    createElement("div", "welcome-icon", "🎉"),
    createElement("h2", "", "짝짓기 완료!"),
    createElement("p", "", `${round.pairs.length}쌍 완료 · 시도 ${round.attempts}회 · 정확도 ${accuracy}%`)
  );
  const actions = createElement("div", "stage-actions");
  const playAgainButton = createElement("button", "button", "한 세트 더 하기");
  playAgainButton.type = "button";
  playAgainButton.addEventListener("click", startSynonymMatch);
  actions.append(playAgainButton, createTrainingExitButton());
  section.append(summary, actions);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 현재 덱에서 최대 10개 예문을 섞어 빈칸 타이핑 훈련을 시작해요.
function startFillBlankTraining() {
  const sessionWords = shuffle(getCurrentDeckWords()).slice(0, 10);
  if (sessionWords.length === 0) {
    renderTrainingUnavailable("현재 덱에 학습할 단어가 없어요. 다른 덱을 선택해 주세요.");
    return;
  }

  clearModeTransitionTimer();
  activeStudySession = true;
  synonymMatchRound = null;
  fillBlankRound = {
    words: sessionWords,
    index: 0,
    correctCount: 0,
    incorrectCount: 0,
    answerRevealed: false
  };
  sessionMode = "fill-blank";
  setStudyControlsLocked(true);
  renderFillBlankQuestion();
}

// 한글 설명 주석: 단어 길이에 따라 첫 1~3개 글자만 힌트로 남기고 나머지 알파벳을 정확한 수의 밑줄로 가려요.
function maskWordInSentence(sentence, targetWord) {
  const escapedWord = escapeRegExp(targetWord);
  const targetPattern = new RegExp(`\\b${escapedWord}\\b`, "i");
  const letterCount = (targetWord.match(/[a-z]/gi) || []).length;
  const hintLength = letterCount <= 4 ? 1 : letterCount <= 7 ? 2 : 3;
  let revealedLetters = 0;
  const blank = [...targetWord].map((character) => {
    if (!/[a-z]/i.test(character)) {
      return character;
    }
    revealedLetters += 1;
    return revealedLetters <= hintLength ? character : "_";
  }).join("");
  return sentence.replace(targetPattern, blank);
}

// 한글 설명 주석: 생성형 예문 데이터의 어색한 뜻 풀이 템플릿을 타이핑 퀴즈에서 자연스럽게 다듬어요.
function getFillBlankKoreanTranslation(word) {
  const translation = word.exampleKo.trim();
  const usesReportPhraseTemplate =
    /^연구진은 보고서에서 ["“].+?["”]라는 표현이 .+?라는 의미로 쓰인 방식을 살펴보았다[.!?]?$/u;
  if (usesReportPhraseTemplate.test(translation)) {
    return `연구진은 보고서에서 ‘${word.meaning}’의 쓰임을 살펴보았다.`;
  }

  const usesAcademicExampleTemplate =
    /^교재는 학술적 논증에서 .+?라는 의미로 쓰인 ["“].+?["”]의 예를 제시한다[.!?]?$/u;
  if (usesAcademicExampleTemplate.test(translation)) {
    return `교재는 학술적 논증에서 ‘${word.meaning}’의 예를 제시한다.`;
  }

  // 한글 설명 주석: 첫 문장 뒤에 자동으로 덧붙은 반복적인 단어 뜻 해설만 제거하고 원래 예문 해석은 보존해요.
  const roboticExplanation = /\s*(?:(?:여기서|이 문장에서)\s*.+?(?:라는 뜻으로 쓰였다|라는 뜻으로 사용된다|라는 의미로 쓰였다|라는 의미로 사용된다|라는 의미를 나타낸다)|여기서 사용된 표현은 .+?라는 의미다|이 문맥의 핵심 동사는 .+?라는 뜻이다|이는 .+?에 해당하는 결정이었다|이 행동은 .+?라는 뜻과 연결된다|["“].+?["”](?:은|는)\s*.+?라는 의미를 나타낸다)[.!?]?$/u;
  const cleanedTranslation = translation.replace(roboticExplanation, "").trim();
  return cleanedTranslation || translation;
}

// 한글 설명 주석: 빈칸 예문과 뜻/번역 단서를 표시하고 Enter 또는 버튼 제출로 답을 확인해요.
function renderFillBlankQuestion() {
  const round = fillBlankRound;
  if (!round) {
    return;
  }
  if (round.index >= round.words.length) {
    renderFillBlankSummary();
    return;
  }

  round.answerRevealed = false;
  const word = round.words[round.index];
  const section = createElement("section", "panel-content");
  section.append(createProgressHeader("예문 빈칸 쓰기", round.index + 1, round.words.length));
  const card = createElement("article", "typing-card");
  const titleRow = createElement("div", "question-title-row");
  titleRow.append(
    createElement("h2", "question-title", "빈칸에 알맞은 단어를 입력해 보세요."),
    createPronunciationButton(word.word, `${word.word} 발음 듣기`)
  );

  // 한글 설명 주석: 단어 길이별 첫 글자 힌트와 자연스럽게 정리한 한국어 예문 해석을 함께 보여줘요.
  const maskedExample = createElement("p", "example-en", maskWordInSentence(word.exampleEn, word.word));
  maskedExample.style.marginTop = "16px";
  const clues = createElement("div", "typing-context");
  const meaningClue = createElement("p", "typing-clue");
  meaningClue.append(createElement("strong", "", "뜻 힌트"), document.createTextNode(word.meaning));
  const translationClue = createElement("p", "typing-clue");
  translationClue.append(
    createElement("strong", "", "예문 해석"),
    document.createTextNode(getFillBlankKoreanTranslation(word))
  );
  clues.append(meaningClue, translationClue);

  const form = createElement("form", "answer-row");
  const input = createElement("input", "answer-input");
  input.type = "text";
  input.autocomplete = "off";
  input.autocapitalize = "none";
  input.spellcheck = false;
  input.setAttribute("aria-label", "빈칸에 들어갈 영어 단어");
  input.placeholder = "영어 단어 입력";
  const submitButton = createElement("button", "button", "정답 확인");
  submitButton.type = "submit";
  form.append(input, submitButton);

  const feedback = createElement("p", "typing-feedback");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  const revealButton = createElement("button", "button secondary typing-reveal hidden", "정답 확인하고 다음 단어");
  revealButton.type = "button";
  revealButton.addEventListener("click", () => {
    round.answerRevealed = true;
    feedback.textContent = `정답은 "${word.word}"예요. 다음 단어로 이동할게요.`;
    revealButton.disabled = true;
    clearModeTransitionTimer();
    modeTransitionTimer = window.setTimeout(advanceFillBlankQuestion, 450);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitFillBlankAnswer(word, input, submitButton, feedback, revealButton);
  });

  const actions = createElement("div", "stage-actions");
  actions.append(createTrainingExitButton());
  card.append(titleRow, maskedExample, clues, form, feedback, revealButton);
  section.append(card, actions);
  appContent.replaceChildren(section);
  window.setTimeout(() => input.focus(), 0);
}

// 한글 설명 주석: 입력을 대소문자와 앞뒤 공백을 무시해 확인하고 오답을 오늘 복습 기록에 남겨요.
function submitFillBlankAnswer(word, input, submitButton, feedback, revealButton) {
  const round = fillBlankRound;
  if (!round || round.answerRevealed) {
    return;
  }

  const isCorrect = input.value.trim().toLocaleLowerCase() === word.word.toLocaleLowerCase();
  if (isCorrect) {
    round.correctCount += 1;
    input.disabled = true;
    submitButton.disabled = true;
    feedback.className = "typing-feedback good";
    feedback.textContent = "정답이에요! 아주 잘 기억했어요.";
    // 한글 설명 주석: 정답 발음은 자동 소리 설정이 켜진 경우에만 재생해요.
    if (autoSoundEnabled) {
      const pronunciationButton = appContent.querySelector(".speaker-button");
      pronounceEnglish(word.word, pronunciationButton, `${word.word} 발음 듣기`);
    }
    clearModeTransitionTimer();
    modeTransitionTimer = window.setTimeout(advanceFillBlankQuestion, 700);
    return;
  }

  round.incorrectCount += 1;
  feedback.className = "typing-feedback bad";
  feedback.textContent = `아쉬워요. 정답은 "${word.word}"예요. 다시 입력하거나 정답 확인 후 다음으로 넘어가세요.`;
  revealButton.classList.remove("hidden");
  resetMistakesForToday();
  history.todayMistakes = [...new Set([...history.todayMistakes, word.id])];
  history.activeDates = [...new Set([...history.activeDates, getLocalDateKey()])];
  saveProgress();
  renderDashboard();
  input.focus();
  input.select();
}

// 한글 설명 주석: 입력 훈련의 답/정답 확인 처리 뒤 다음 문항을 렌더링해요.
function advanceFillBlankQuestion() {
  clearModeTransitionTimer();
  if (!fillBlankRound) {
    return;
  }
  fillBlankRound.index += 1;
  renderFillBlankQuestion();
}

// 한글 설명 주석: 입력 훈련 완료 후 정답/오답 수를 요약하고 한 세트 더 하거나 나갈 수 있게 해요.
function renderFillBlankSummary() {
  const round = fillBlankRound;
  if (!round) {
    return;
  }

  // 한글 설명 주석: 빈칸 훈련의 정상 결과 화면에서는 세션을 완료 상태로 표시해요.
  activeStudySession = false;
  setStudyControlsLocked(false);
  const section = createElement("section", "panel-content");
  const summary = createElement("div", "mode-summary");
  summary.append(
    createElement("div", "welcome-icon", "✍️"),
    createElement("h2", "", "빈칸 쓰기 완료!"),
    createElement("p", "", `${round.words.length}문제 중 ${round.correctCount}개 정답 · 오답 입력 ${round.incorrectCount}회`)
  );
  const actions = createElement("div", "stage-actions");
  const playAgainButton = createElement("button", "button", "한 세트 더 하기");
  playAgainButton.type = "button";
  playAgainButton.addEventListener("click", startFillBlankTraining);
  actions.append(playAgainButton, createTrainingExitButton());
  section.append(summary, actions);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 두 훈련 모드 어디서든 대시보드로 돌아갈 수 있는 공통 종료 버튼이에요.
function createTrainingExitButton() {
  const button = createElement("button", "button secondary", "나가기 / 대시보드로");
  button.type = "button";
  button.addEventListener("click", exitTrainingMode);
  return button;
}

// 한글 설명 주석: 나갈 때 자동 이동 타이머와 임시 라운드 상태를 지워 다른 세션에 영향을 주지 않게 해요.
function exitTrainingMode() {
  requestSessionExit(() => {
    clearModeTransitionTimer();
    synonymMatchRound = null;
    fillBlankRound = null;
    currentSession = [];
    sessionMode = "regular";
    renderWelcome();
  });
}

// 한글 설명 주석: 이전 라운드의 자동 이동 예약을 취소해 중복 전환이나 빠른 화면 이탈을 막아요.
function clearModeTransitionTimer() {
  if (modeTransitionTimer !== null) {
    window.clearTimeout(modeTransitionTimer);
    modeTransitionTimer = null;
  }
}

// 한글 설명 주석: 덱 단어가 부족한 경우 이유를 보여주고 대시보드로 돌아갈 수 있게 안내해요.
function renderTrainingUnavailable(message) {
  const section = createElement("section", "welcome");
  const inner = createElement("div", "welcome-inner");
  inner.append(
    createElement("div", "welcome-icon", "📚"),
    createElement("h2", "", "훈련을 시작할 수 없어요"),
    createElement("p", "", message)
  );
  const exitButton = createTrainingExitButton();
  inner.append(exitButton);
  section.append(inner);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 카드의 뜻과 예문을 확인한 뒤 다음 카드 또는 퀴즈로 자연스럽게 이어가요.
function renderFlashcard() {
  clearQuizAutoAdvanceTimer();
  if (currentSession.length === 0) {
    renderSummary();
    return;
  }

  const word = currentSession[flashcardIndex];
  const isLastCard = flashcardIndex === currentSession.length - 1;
  appContent.replaceChildren();

  const section = createElement("section", "panel-content");
  section.append(
    createProgressHeader("단어 카드", flashcardIndex + 1, currentSession.length),
    createWordCard(word)
  );

  // 한글 설명 주석: 카드마다 건너뛰기 없이 확인을 마친 뒤 다음 카드로 진행하고, 마지막 카드에서 Round 1을 시작해요.
  const actions = createElement("div", "stage-actions flashcard-actions");
  const nextButton = createElement(
    "button",
    "button flashcard-next-button",
    isLastCard ? "퀴즈 시작하기 →" : "다음 단어 →"
  );
  nextButton.type = "button";
  nextButton.addEventListener("click", () => {
    if (isLastCard) {
      startQuizRounds();
      return;
    }
    flashcardIndex += 1;
    renderFlashcard();
  });

  actions.append(nextButton);
  section.append(actions);
  appContent.append(section);
  // 한글 설명 주석: 실제로 학습 카드가 표시된 시점에 오늘 학습한 단어로 기록해요.
  recordTodaySessionWord(word);
  // 한글 설명 주석: 자동 발음이 켜져 있을 때에만 카드가 열리며 해당 단어를 자동으로 읽어요.
  if (autoSoundEnabled) {
    const pronunciationButton = section.querySelector(".speaker-button");
    pronounceEnglish(word.word, pronunciationButton, `${word.word} 발음 듣기`);
  }
}

// 한글 설명 주석: Round 1을 시작하고 이후 각 라운드에서도 남은 단어를 새 순서로 섞어요.
function startQuizRounds() {
  clearQuizAutoAdvanceTimer();
  if (currentSession.length === 0) {
    renderSummary();
    return;
  }
  // 한글 설명 주석: 답변과 SRS 상태가 바뀌는 채점 단계부터 진행 중 세션 종료 확인을 활성화해요.
  activeStudySession = true;
  currentRoundNumber = 1;
  currentRoundQueue = shuffle(currentSession);
  quizIndex = 0;
  currentPhase = 1;
  renderQuizQuestion();
}

// 한글 설명 주석: 화면을 벗어나거나 문제를 바꿀 때 예약된 0.6초 자동 이동을 안전하게 취소해요.
function clearQuizAutoAdvanceTimer() {
  if (quizAutoAdvanceTimer !== null) {
    window.clearTimeout(quizAutoAdvanceTimer);
    quizAutoAdvanceTimer = null;
  }
}

// 한글 설명 주석: 오늘 틀린 단어를 한 장씩 확인하고 뜻, 동의어, 예문을 모두 보여주는 복습 화면이에요.
function renderMistakeReview() {
  const mistakeWords = getTodayMistakeWords();
  if (mistakeWords.length === 0) {
    renderWelcome();
    return;
  }

  // 한글 설명 주석: 오답 단어 참고 카드는 채점 전 복습이므로 즉시 대시보드로 돌아갈 수 있어요.
  activeStudySession = false;
  setStudyControlsLocked(true);
  mistakeReviewIndex = Math.min(mistakeReviewIndex, mistakeWords.length - 1);
  const word = mistakeWords[mistakeReviewIndex];
  const section = createElement("section", "panel-content");
  section.append(
    createProgressHeader("오늘 틀린 단어 복습", mistakeReviewIndex + 1, mistakeWords.length),
    createStudyReferenceCard(word)
  );

  const actions = createElement("div", "stage-actions");
  const previousButton = createElement("button", "button secondary", "← 이전 단어");
  previousButton.type = "button";
  previousButton.disabled = mistakeReviewIndex === 0;
  previousButton.addEventListener("click", () => {
    mistakeReviewIndex -= 1;
    renderMistakeReview();
  });

  const nextButton = createElement("button", "button secondary", "다음 단어 →");
  nextButton.type = "button";
  nextButton.disabled = mistakeReviewIndex === mistakeWords.length - 1;
  nextButton.addEventListener("click", () => {
    mistakeReviewIndex += 1;
    renderMistakeReview();
  });

  const retestButton = createElement("button", "button", "오답 재시험");
  retestButton.type = "button";
  retestButton.addEventListener("click", () => startSession(mistakeWords, "mistake"));
  actions.append(previousButton, nextButton, retestButton);

  const backButton = createElement("button", "button secondary", "대시보드로 돌아가기");
  backButton.type = "button";
  backButton.addEventListener("click", () => requestSessionExit(renderWelcome));
  const footerActions = createElement("div", "stage-actions");
  footerActions.append(backButton);
  section.append(actions, footerActions);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 오늘 공부한 단어를 SRS 상태 변경 없이 훑어볼 수 있는 읽기 전용 카드 목록이에요.
function renderTodaySessionReview() {
  const sessionWords = getTodaySessionWordList();
  if (sessionWords.length === 0) {
    renderWelcome();
    return;
  }

  // 한글 설명 주석: 읽기 전용 다시보기는 답을 채점하거나 진도를 바꾸지 않으므로 종료 경고 대상이 아니에요.
  activeStudySession = false;
  setStudyControlsLocked(true);
  const reviewIndex = { current: 0 };
  renderTodaySessionReviewCard(sessionWords, reviewIndex);
}

// 한글 설명 주석: 현재 선택된 단어의 참고 카드와 이전/다음 이동을 렌더링해요.
function renderTodaySessionReviewCard(sessionWords, reviewIndex) {
  const word = sessionWords[reviewIndex.current];
  const section = createElement("section", "panel-content");
  section.append(
    createProgressHeader("오늘 학습한 전체 단어", reviewIndex.current + 1, sessionWords.length),
    createStudyReferenceCard(word)
  );

  const actions = createElement("div", "stage-actions");
  const previousButton = createElement("button", "button secondary", "← 이전 단어");
  previousButton.type = "button";
  previousButton.disabled = reviewIndex.current === 0;
  previousButton.addEventListener("click", () => {
    reviewIndex.current -= 1;
    renderTodaySessionReviewCard(sessionWords, reviewIndex);
  });

  const nextButton = createElement("button", "button secondary", "다음 단어 →");
  nextButton.type = "button";
  nextButton.disabled = reviewIndex.current === sessionWords.length - 1;
  nextButton.addEventListener("click", () => {
    reviewIndex.current += 1;
    renderTodaySessionReviewCard(sessionWords, reviewIndex);
  });

  const backButton = createElement("button", "button", "대시보드로 돌아가기");
  backButton.type = "button";
  backButton.addEventListener("click", () => requestSessionExit(renderWelcome));
  actions.append(previousButton, nextButton, backButton);
  section.append(actions);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 브라우저 내장 음성 합성으로 영어 문장이나 단어를 읽는 버튼을 만들어요.
function createPronunciationButton(text, accessibleLabel) {
  const button = createElement("button", "speaker-button", "🔊");
  button.type = "button";
  button.setAttribute("aria-label", accessibleLabel);
  button.setAttribute("aria-pressed", "false");
  button.title = accessibleLabel;
  button.addEventListener("click", () => pronounceEnglish(text, button, accessibleLabel));
  return button;
}

// 한글 설명 주석: 영어 음성이 도착하거나 변경될 때마다 우선순위에 맞춰 사용할 음성을 선택해요.
function initializeEnglishVoiceSelection() {
  if (!("speechSynthesis" in window)) {
    return;
  }

  // 한글 설명 주석: 첫 화면부터 가능한 경우 음성을 찾아두고, 비동기 로딩이 끝나면 다시 검색해요.
  selectEnglishVoice();
  // 한글 설명 주석: 음성 목록이 비동기로 준비되면 onvoiceschanged에서 영어 음성을 다시 찾아 캐시해요.
  window.speechSynthesis.onvoiceschanged = selectEnglishVoice;

  // 한글 설명 주석: 브라우저의 자동 재생 제한은 첫 사용자 입력에서 음성 엔진을 깨워야 풀릴 수 있어요.
  document.addEventListener("pointerdown", unlockAudioOnInteraction, { capture: true });
  document.addEventListener("keydown", unlockAudioOnInteraction, { capture: true });
}

// 한글 설명 주석: 고품질 미국 음성을 우선하고, en-US, 다른 영어 음성 순으로 캐시해요.
function selectEnglishVoice() {
  if (!("speechSynthesis" in window)) {
    selectedEnglishVoice = null;
    return null;
  }

  const availableVoices = window.speechSynthesis.getVoices();
  const englishVoices = availableVoices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const preferredVoice = englishVoices.find((voice) =>
    /Google US English|Microsoft Jenny|Microsoft Zira|Samantha|en-US/i.test(`${voice.name} ${voice.lang}`)
  );
  const usEnglishVoice = englishVoices.find((voice) => voice.lang.toLowerCase() === "en-us");

  // 한글 설명 주석: 음성 목록이 아직 비어도 null만 반환해요. 재생 시 en-US 언어 설정으로 기본 엔진을 사용해요.
  selectedEnglishVoice = preferredVoice || usEnglishVoice || englishVoices[0] || null;
  return selectedEnglishVoice;
}

// 한글 설명 주석: 클릭이나 키보드 입력을 받은 순간 일시 정지된 합성 엔진을 깨워 자동 재생 제한을 풀어요.
function unlockSpeechSynthesis() {
  if (!autoSoundEnabled || !("speechSynthesis" in window)) {
    return;
  }

  try {
    window.speechSynthesis.resume();
  } catch (error) {
    console.error("TTS unlock error:", error);
    speechStatus.textContent = "음성 재생을 준비하지 못했어요. 버튼을 다시 눌러 주세요.";
  }
}

// 한글 설명 주석: iOS가 지원하면 재생 세션으로 지정해 무음 스위치 영향을 줄이고, 지원하지 않는 브라우저는 건너뛰어요.
function configurePlaybackAudioSession() {
  const audioSession = navigator.audioSession;
  if (!audioSession || !("type" in audioSession)) {
    return;
  }

  try {
    audioSession.type = "playback";
  } catch (error) {
    console.warn("오디오 재생 세션을 설정하지 못했어요:", error);
  }
}

// 한글 설명 주석: 실제 사용자 입력 안에서 AudioContext와 음성 엔진을 깨워 모바일 자동 재생 제한을 해제해요.
function unlockAudioOnInteraction() {
  if (!autoSoundEnabled) {
    return;
  }

  configurePlaybackAudioSession();
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (AudioContextConstructor && !audioContext) {
    try {
      audioContext = new AudioContextConstructor();
    } catch (error) {
      console.error("오디오 컨텍스트를 만들지 못했어요:", error);
      speechStatus.textContent = "기기에서 오디오를 준비하지 못했어요. 발음 버튼을 다시 눌러 주세요.";
    }
  }

  if (audioContext && audioContext.state !== "running") {
    audioContext.resume().catch((error) => {
      console.error("오디오 컨텍스트를 활성화하지 못했어요:", error);
      speechStatus.textContent = "기기에서 오디오를 활성화하지 못했어요. 다시 시도해 주세요.";
    });
  }
  unlockSpeechSynthesis();
}

// 한글 설명 주석: 음소거를 선택하면 진행 중인 음성과 앱 오디오를 즉시 멈추고 스피커 버튼 상태도 복원해요.
function stopAudioPlayback() {
  if (activeSpeechButton) {
    const defaultLabel = activeSpeechButton.dataset.defaultLabel;
    activeSpeechButton.setAttribute("aria-label", defaultLabel);
    activeSpeechButton.title = defaultLabel;
    activeSpeechButton.setAttribute("aria-pressed", "false");
    activeSpeechButton = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  if (audioContext && audioContext.state !== "closed" && audioContext.state !== "suspended") {
    audioContext.suspend().catch((error) => {
      console.error("오디오 컨텍스트를 음소거하지 못했어요:", error);
      speechStatus.textContent = "오디오를 멈추지 못했어요. 페이지를 새로고침해 주세요.";
    });
  }
  speechStatus.textContent = "";
}

// 한글 설명 주석: 한글, 괄호, 장식 기호를 걸러내고 영어 알파벳과 공백만 음성 엔진에 전달해요.
function sanitizeSpeechText(text) {
  return String(text)
    .replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, " ")
    .replace(/[()[\]{}<>]/g, " ")
    .replace(/[^A-Za-z'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 한글 설명 주석: 문장 옆에 작은 스피커 버튼을 붙여 예문 전체를 바로 들을 수 있게 해요.
function createExampleAudioLine(example, targetWord) {
  const row = createElement("div", "example-audio-row");
  const sentence = createElement("p", "example-en");
  const targetPattern = targetWord
    ? new RegExp(`\\b${escapeRegExp(targetWord)}\\b`, "gi")
    : null;
  let lastIndex = 0;
  let match = targetPattern ? targetPattern.exec(example) : null;

  // 한글 설명 주석: 예문은 텍스트 노드로 유지하고 표제어만 mark로 감싸 안전하게 강조해요.
  while (match) {
    sentence.append(
      document.createTextNode(example.slice(lastIndex, match.index)),
      createElement("mark", "example-target", match[0])
    );
    lastIndex = targetPattern.lastIndex;
    match = targetPattern.exec(example);
  }
  sentence.append(document.createTextNode(example.slice(lastIndex)));
  row.append(
    sentence,
    createPronunciationButton(example, "영어 예문 발음 듣기")
  );
  return row;
}

// 한글 설명 주석: 영어 텍스트만 정리해 en-US 음성 객체를 지정한 뒤 브라우저 음성 엔진에 전달해요.
function pronounceEnglish(text, button, defaultLabel) {
  if (!autoSoundEnabled) {
    speechStatus.textContent = "소리가 꺼져 있어요. 설정에서 소리를 켜 주세요.";
    return;
  }
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    speechStatus.textContent = "이 브라우저에서는 음성 발음을 지원하지 않아요.";
    return;
  }

  // 한글 설명 주석: 재생 전에 iOS 오디오 경로와 음성 엔진을 사용자 입력 상태에서 활성화해요.
  unlockAudioOnInteraction();
  // 한글 설명 주석: 빠르게 여러 번 눌러도 음성이 겹치지 않도록 이전 재생을 중단하고 버튼 상태를 복구해요.
  if (activeSpeechButton) {
    activeSpeechButton.setAttribute("aria-label", activeSpeechButton.dataset.defaultLabel);
    activeSpeechButton.title = activeSpeechButton.dataset.defaultLabel;
    activeSpeechButton.setAttribute("aria-pressed", "false");
  }
  unlockSpeechSynthesis();
  window.speechSynthesis.cancel();
  // 한글 설명 주석: cancel() 뒤 엔진이 다시 멈춘 브라우저도 있으므로 새 음성 전에 다시 깨워요.
  unlockSpeechSynthesis();
  activeSpeechButton = null;

  // 한글 설명 주석: 괄호 안 번역이나 한글이 섞여 있어도 영문 알파벳만 남긴 텍스트를 읽게 해요.
  const sanitizedText = sanitizeSpeechText(text);
  if (!sanitizedText) {
    speechStatus.textContent = "읽을 수 있는 영어 문장이 없어요.";
    return;
  }

  // 한글 설명 주석: 음성 목록이 비어 있어도 중단하지 않아요. voice는 있을 때만 지정하고 en-US로 기본 엔진을 요청해요.
  const englishVoice = selectEnglishVoice();
  const utterance = new SpeechSynthesisUtterance(sanitizedText);
  utterance.lang = "en-US";
  if (englishVoice) {
    utterance.voice = englishVoice;
  }
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  button.dataset.defaultLabel = defaultLabel;
  button.setAttribute("aria-pressed", "true");
  button.setAttribute("aria-label", `${defaultLabel} 재생 중`);
  button.title = `${defaultLabel} 재생 중`;
  activeSpeechButton = button;
  speechStatus.textContent = "";

  // 한글 설명 주석: 시작 이벤트에서는 재생 상태를 안내하고, 종료 이벤트에서는 버튼을 원래 상태로 되돌려요.
  utterance.onstart = () => {
    console.info("TTS started:", {
      text: sanitizedText,
      voice: utterance.voice ? utterance.voice.name : "system default",
      lang: utterance.lang
    });
    speechStatus.textContent = "영어 발음을 재생하고 있어요.";
  };
  utterance.onend = () => {
    if (activeSpeechButton === button) {
      activeSpeechButton = null;
      button.setAttribute("aria-label", defaultLabel);
      button.title = defaultLabel;
      button.setAttribute("aria-pressed", "false");
      speechStatus.textContent = "";
    }
  };

  // 한글 설명 주석: 음성 엔진 오류는 화면에 알려주되 사용자가 재생 버튼을 다시 시도할 수 있게 해요.
  utterance.onerror = (event) => {
    console.error("TTS Error:", event);
    if (activeSpeechButton === button) {
      activeSpeechButton = null;
      button.setAttribute("aria-label", defaultLabel);
      button.title = defaultLabel;
      button.setAttribute("aria-pressed", "false");
    }
    if (event.error !== "canceled" && event.error !== "interrupted") {
      speechStatus.textContent = "발음을 재생하지 못했어요. 기기의 음성 설정을 확인해 주세요.";
    }
  };

  // 한글 설명 주석: 취소는 새 utterance를 만들기 전에 한 번만 하고, 재개한 엔진에 새 음성을 넣어요.
  unlockSpeechSynthesis();
  window.speechSynthesis.speak(utterance);
  // 한글 설명 주석: speak() 직후에도 재개를 요청해 브라우저가 대기열에 둔 발음을 바로 시작하게 해요.
  unlockSpeechSynthesis();
}

// 한글 설명 주석: 복습 모드에 품사, 뜻, 동의어, 영어 예문과 한국어 번역을 모두 펼쳐 보여줘요.
function createStudyReferenceCard(word) {
  const card = createElement("article", "word-card");
  const titleRow = createElement("div", "word-title-row");
  titleRow.append(
    createElement("h2", "word-title", word.word),
    createPronunciationButton(word.word, `${word.word} 발음 듣기`)
  );
  card.append(
    createElement("p", "word-type", word.partOfSpeech),
    titleRow,
    createElement("p", "word-meaning", word.meaning)
  );

  const synonymBox = createElement("div", "example-box");
  synonymBox.append(
    createElement("p", "example-en", `동의어: ${word.synonyms.join(", ")}`),
    createElement("p", "example-ko", "동의어를 함께 익히면 문맥에 맞는 표현을 고르는 데 도움이 돼요.")
  );

  const exampleBox = createElement("div", "example-box");
  exampleBox.append(
    createExampleAudioLine(word.exampleEn, word.word),
    createElement("p", "example-ko", word.exampleKo)
  );
  card.append(synonymBox, exampleBox);
  return card;
}

// 한글 설명 주석: 플래시카드에서 표제어, 뜻, 동의어와 예문을 바로 볼 수 있도록 카드 DOM을 만들어요.
function createWordCard(word) {
  const card = createElement("article", "word-card");
  const partOfSpeech = createElement("p", "word-type", word.partOfSpeech);
  const titleRow = createElement("div", "word-title-row");
  titleRow.append(
    createElement("h2", "word-title", word.word),
    createPronunciationButton(word.word, `${word.word} 발음 듣기`)
  );
  const meaning = createElement("p", "word-meaning", word.meaning);
  const synonymList = createElement("div", "synonym-badges");
  word.synonyms.forEach((synonym) => {
    synonymList.append(createElement("span", "synonym-badge", synonym));
  });
  const exampleBox = createElement("div", "example-box");
  exampleBox.append(
    createExampleAudioLine(word.exampleEn, word.word),
    createElement("p", "example-ko", word.exampleKo)
  );
  card.append(partOfSpeech, titleRow, meaning, synonymList, exampleBox);
  return card;
}

// 한글 설명 주석: 단어 전체를 세 라운드에 걸쳐 영어→한국어, 한국어→영어, 동의어→표제어로 확인해요.
function renderQuizQuestion() {
  clearQuizAutoAdvanceTimer();
  if (quizIndex >= currentRoundQueue.length) {
    finishQuizRound();
    return;
  }

  answerSubmitted = false;
  lastAnswerWasCorrect = false;
  const word = currentRoundQueue[quizIndex];
  currentPhase = currentRoundNumber;
  appContent.replaceChildren();

  const section = createElement("section", "panel-content");
  const quizTitle = sessionMode === "mistake" ? "오늘 오답 재시험" : "실력 확인 퀴즈";
  section.append(
    createProgressHeader(`${quizTitle} · Round ${currentRoundNumber}`, quizIndex + 1, currentRoundQueue.length),
    createQuizPhaseIndicator(currentPhase)
  );
  const card = createElement("div", "question-card");
  // 한글 설명 주석: 재도전 대기열에 등록된 단어는 문제 화면에 재도전 배지를 표시해요.
  if (retryWordIds.has(word.id)) {
    card.append(createElement("span", "retry-badge", "재도전!"));
  }
  const phasePrompt = [
    "이 단어의 뜻으로 가장 알맞은 것은 무엇일까요?",
    "이 한국어 뜻에 해당하는 영어 단어는 무엇일까요?",
    "이 유의어들과 어울리는 표제어는 무엇일까요?"
  ][currentPhase - 1];
  const questionText = currentPhase === 1
    ? word.word
    : currentPhase === 2
      ? word.meaning
      : word.synonyms.join(", ");
  const questionTitleRow = createElement("div", "question-title-row");
  const questionTitleClass = currentPhase === 1
    ? "question-title english-target-word"
    : currentPhase === 2
      ? "question-title korean-meaning"
      : "question-title";
  const questionTitle = createElement("h2", questionTitleClass, questionText);
  questionTitleRow.append(questionTitle);
  let pronunciationButton = null;
  if (currentPhase === 1) {
    pronunciationButton = createPronunciationButton(word.word, `${word.word} 발음 듣기`);
    questionTitleRow.append(pronunciationButton);
  }
  card.append(
    createElement("p", "question-kicker", `Phase ${currentPhase} · ${["EN → KO", "KO → EN", "Synonyms → EN"][currentPhase - 1]}`),
    questionTitleRow,
    createElement("p", "question-support", phasePrompt)
  );

  const feedback = createElement("p", "feedback");
  feedback.setAttribute("aria-live", "polite");
  const choices = createElement("div", "choices");
  // 한글 설명 주석: 1단계는 한국어 뜻을, 2·3단계는 영어 표제어를 정답 보기로 구성해요.
  const optionBuilder = currentPhase === 1 ? buildMeaningOptions : buildWordOptions;
  const options = optionBuilder(word);
  const correctAnswer = currentPhase === 1 ? word.meaning : word.word;
  options.forEach((option) => {
    const choice = createElement("button", "choice", option);
    choice.type = "button";
    choice.addEventListener("click", () => submitAnswer(word, option, correctAnswer, feedback, choices));
    choices.append(choice);
  });
  card.append(choices);

  card.append(feedback);
  section.append(card);
  appContent.append(section);

  // 한글 설명 주석: 1단계는 표제어가 처음 제시되므로 자동 발음을 재생해 기억과 소리를 연결해요.
  if (currentPhase === 1 && autoSoundEnabled && pronunciationButton) {
    pronounceEnglish(word.word, pronunciationButton, `${word.word} 발음 듣기`);
  }
}

// 한글 설명 주석: 현재 라운드의 다음 단어로 이동하고, 라운드가 끝나면 남은 단어를 새 순서로 섞어요.
function continueQuiz() {
  clearQuizAutoAdvanceTimer();
  quizIndex += 1;
  renderQuizQuestion();
}

// 한글 설명 주석: 라운드 큐가 비면 다음 회상 관점으로 이동하고 마지막 라운드에서만 SRS를 승급해요.
function finishQuizRound() {
  if (currentRoundNumber < 3) {
    currentRoundNumber += 1;
    currentPhase = currentRoundNumber;
    currentRoundQueue = shuffle(currentSession);
    quizIndex = 0;
    renderQuizQuestion();
    return;
  }

  // 한글 설명 주석: 실수한 단어는 내일 복습 상태로 유지하고, 세 라운드를 실수 없이 통과한 단어만 승급해요.
  currentSession.forEach((word) => {
    if (hadMistakeWordIds.has(word.id)) {
      return;
    }
    word.consecutiveCorrect += 1;
    advanceWordState(word);
    completedWordIds.add(word.id);
  });
  correctAnswers = completedWordIds.size;
  history.activeDates = [...new Set([...history.activeDates, getLocalDateKey()])];
  saveProgress();
  renderDashboard();
  renderSummary();
}

// 한글 설명 주석: 정답 하나와 단어집에서 고른 중복 없는 오답 세 개를 섞어 4지선다를 만들어요.
function buildQuizOptions(targetWord, valueForWord) {
  const correctAnswer = valueForWord(targetWord);
  const distractors = [...new Set(
    shuffle(words)
      .filter((candidate) => candidate.id !== targetWord.id)
      .map(valueForWord)
      .filter((value) => value !== correctAnswer)
  )].slice(0, 3);

  if (distractors.length < 3) {
    throw new Error("퀴즈 선택지를 만들 만큼 서로 다른 정답 후보가 부족해요.");
  }
  return shuffle([correctAnswer, ...distractors]);
}

// 한글 설명 주석: 1단계는 영어 표제어에 해당하는 한국어 뜻 네 개를 선택지로 보여줘요.
function buildMeaningOptions(word) {
  return buildQuizOptions(word, (candidate) => candidate.meaning);
}

// 한글 설명 주석: 2단계와 3단계는 단어 뜻이나 유의어를 보고 영어 표제어를 고르게 해요.
function buildWordOptions(word) {
  return buildQuizOptions(word, (candidate) => candidate.word);
}

// 한글 설명 주석: 세 점으로 현재 회상 단계를 보여주고 보조 기술에도 단계 이름을 전달해요.
function createQuizPhaseIndicator(phase) {
  const labels = ["뜻 맞추기", "단어 맞추기", "유의어로 맞추기"];
  const indicator = createElement("div", "phase-indicator");
  indicator.setAttribute("aria-label", `3단계 중 ${phase}단계: ${labels[phase - 1]}`);
  const dots = createElement("div", "phase-dots");

  labels.forEach((label, index) => {
    const stepNumber = index + 1;
    const dot = createElement(
      "span",
      `phase-dot${stepNumber <= phase ? " is-complete" : ""}${stepNumber === phase ? " is-current" : ""}`,
      stepNumber <= phase ? "●" : "○"
    );
    if (stepNumber === phase) {
      dot.setAttribute("aria-current", "step");
    }
    dots.append(dot);
  });

  indicator.append(dots, createElement("span", "phase-label", `Step ${phase}: ${labels[phase - 1]}`));
  return indicator;
}

// 한글 설명 주석: 답을 한 번만 채점하고 정오답에 따라 상태/복습일/연속 정답 수를 갱신해요.
function submitAnswer(word, answer, correctAnswer, feedback, answerContainer) {
  if (answerSubmitted) {
    return;
  }
  answerSubmitted = true;

  const normalizedAnswer = String(answer).trim().toLowerCase().replace(/[.!?,;:]+$/g, "");
  const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();
  // 한글 설명 주석: 답 문자열을 정규화하고 이번 라운드 정답과 비교해요.
  const isCorrect = normalizedAnswer === normalizedCorrectAnswer;
  lastAnswerWasCorrect = isCorrect;

  if (isCorrect) {
    feedback.textContent = "정답이에요! 잠시 후 다음 문제로 넘어갈게요.";
    feedback.classList.add("good");
    retryWordIds.delete(word.id);
    // 한글 설명 주석: 한국어 뜻이나 유의어를 맞힌 뒤 표제어가 드러나면 자동 발음 설정을 확인해요.
    if (currentPhase > 1) {
      pronounceRevealedQuizWord(word);
    }
  } else {
    // 한글 설명 주석: 어느 라운드에서든 오답이면 상태 1과 내일 복습일로 바꾸고 세션 오답으로 기록해요.
    word.status = 1;
    word.dueDate = addDays(getLocalDateKey(), 1);
    word.consecutiveCorrect = 0;
    hadMistakeWordIds.add(word.id);
    feedback.textContent = `아쉬워요. 정답은 "${correctAnswer}"예요. 현재 라운드 끝에서 다시 풀어요.`;
    feedback.classList.add("bad");
    // 한글 설명 주석: 현재 라운드 끝에 재시험 카드를 넣어 먼저 다른 단어들을 모두 풀게 해요.
    retryWordIds.add(word.id);
    currentRoundQueue.push(word);
    // 한글 설명 주석: 오늘의 오답 ID 목록을 중복 없이 갱신해 복습 화면과 대시보드에 표시해요.
    resetMistakesForToday();
    history.todayMistakes = [...new Set([...history.todayMistakes, word.id])];
  }

  if (answerContainer.classList.contains("choices")) {
    [...answerContainer.querySelectorAll("button")].forEach((button) => {
      button.disabled = true;
      if (button.textContent === correctAnswer) {
        button.classList.add("correct");
      } else if (button.textContent === answer && !isCorrect) {
        button.classList.add("incorrect");
      }
    });
  }

  history.activeDates = [...new Set([...history.activeDates, getLocalDateKey()])];
  saveProgress();
  renderDashboard();
  if (isCorrect) {
    const visibleQuestion = appContent.querySelector(".question-card");
    quizAutoAdvanceTimer = window.setTimeout(() => {
      quizAutoAdvanceTimer = null;
      if (visibleQuestion && appContent.contains(visibleQuestion)) {
        continueQuiz();
      }
    }, 600);
  } else {
    // 한글 설명 주석: 오답은 자동 이동하지 않고 정답 카드의 계속하기 버튼 입력을 기다려요.
    renderCorrectionFeedback(word);
  }
}

// 한글 설명 주석: 2·3단계 정답으로 표제어가 공개될 때 자동 발음 설정을 확인해요.
function pronounceRevealedQuizWord(word) {
  if (!autoSoundEnabled) {
    return;
  }

  const temporaryButton = createPronunciationButton(word.word, `${word.word} 발음 듣기`);
  pronounceEnglish(word.word, temporaryButton, `${word.word} 발음 듣기`);
}

// 한글 설명 주석: 틀린 직후 단어의 정답 정보와 예문을 공개하고 재도전 흐름의 TTS를 바로 시작해요.
function renderCorrectionFeedback(word) {
  const section = createElement("section", "correction-screen");
  section.setAttribute("aria-labelledby", "correction-title");
  section.append(
    createElement("p", "correction-heading", "정답을 확인해 볼까요?"),
    createElement("h2", "correction-title", "괜찮아요, 지금 바로 익히면 돼요")
  );

  const card = createElement("article", "word-card correction-card");
  const wordRow = createElement("div", "correction-word-row");
  const pronunciationButton = createPronunciationButton(word.word, `${word.word} 발음 듣기`);
  wordRow.append(
    createElement("h3", "word-title", word.word),
    pronunciationButton
  );
  card.append(
    createElement("p", "word-type", word.partOfSpeech),
    wordRow,
    createElement("p", "word-meaning", word.meaning),
    createElement("p", "correction-label", "주요 동의어"),
    createElement("p", "correction-synonyms", word.synonyms.join(", "))
  );

  const example = createElement("div", "example-box correction-example");
  example.append(
    createElement("p", "correction-label", "예문"),
    createExampleAudioLine(word.exampleEn, word.word),
    createElement("p", "correction-example-ko", word.exampleKo)
  );
  card.append(example);

  const continueButton = createElement("button", "button", "이해했어요 / 계속하기");
  continueButton.type = "button";
  continueButton.addEventListener("click", continueQuiz);
  const actions = createElement("div", "stage-actions");
  actions.append(continueButton);
  section.append(card, actions);
  appContent.replaceChildren(section);

  // 한글 설명 주석: 자동 발음이 켜져 있을 때만 오답 피드백을 연 순간 정답 단어를 읽어요.
  if (autoSoundEnabled) {
    pronounceEnglish(word.word, pronunciationButton, `${word.word} 발음 듣기`);
  }
}

// 한글 설명 주석: 저장된 소리 설정을 복원하고, 읽기 실패 시 명확히 안내한 뒤 기본 켜짐을 유지해요.
function loadAutoSoundPreference() {
  try {
    const savedPreference = localStorage.getItem(AUTO_SOUND_STORAGE_KEY);
    autoSoundEnabled = savedPreference === null || savedPreference === "true";
    updateSoundToggleButton();
    if (!autoSoundEnabled) {
      stopAudioPlayback();
    }
  } catch (error) {
    showStorageWarning(error);
    updateSoundToggleButton();
  }
}

// 한글 설명 주석: 버튼을 누르면 자동 발음 상태를 바꾸고 정확한 불리언 문자열을 브라우저에 저장해요.
function toggleAutoSound() {
  const previousPreference = autoSoundEnabled;
  autoSoundEnabled = !autoSoundEnabled;
  updateSoundToggleButton();
  // 한글 설명 주석: 켜기는 현재 클릭 안에서 오디오를 깨우고, 끄기는 저장을 기다리지 않고 재생을 중단해요.
  if (autoSoundEnabled) {
    unlockAudioOnInteraction();
  } else {
    stopAudioPlayback();
  }

  try {
    localStorage.setItem(AUTO_SOUND_STORAGE_KEY, String(autoSoundEnabled));
  } catch (error) {
    autoSoundEnabled = previousPreference;
    updateSoundToggleButton();
    if (autoSoundEnabled) {
      unlockAudioOnInteraction();
    } else {
      stopAudioPlayback();
    }
    showStorageWarning(error);
  }
}

// 한글 설명 주석: 아이콘, 버튼 문구, 툴팁과 접근성 상태를 현재 자동 발음 설정에 맞춰 함께 갱신해요.
function updateSoundToggleButton() {
  const label = autoSoundEnabled ? "🔊 소리 켜짐" : "🔇 음소거";
  const tooltip = autoSoundEnabled ? "자동 발음 켜짐" : "자동 발음 꺼짐";
  soundToggleButton.textContent = label;
  soundToggleButton.title = tooltip;
  soundToggleButton.setAttribute("aria-label", tooltip);
  soundToggleButton.setAttribute("aria-pressed", String(autoSoundEnabled));
}

// 한글 설명 주석: 정답 시 상태 0/1→2(4일), 2→3(14일), 3→4(졸업) 순서로 승급해요.
function advanceWordState(word) {
  // 한글 설명 주석: 첫 정답은 첫 통과 상태 2, 두 번째 통과는 상태 3, 세 번째 통과는 마스터예요.
  if (word.status < 2) {
    word.status = 2;
    word.dueDate = addDays(getLocalDateKey(), INTERVAL_DAYS[2]);
  } else if (word.status === 2) {
    word.status = 3;
    word.dueDate = addDays(getLocalDateKey(), INTERVAL_DAYS[3]);
  } else if (word.status === 3) {
    // 한글 설명 주석: 상태 3에서 다시 맞히면 상태 4로 졸업하며, 이후 예정 복습일은 없어요.
    word.status = 4;
    word.dueDate = null;
  } else {
    word.dueDate = null;
  }
}

// 한글 설명 주석: 정답 수와 단어별 다음 복습일 또는 마스터 상태를 요약 화면에 표시해요.
function renderSummary() {
  clearQuizAutoAdvanceTimer();
  // 한글 설명 주석: 세 단계 학습을 모두 마친 요약 화면에서는 세션을 정상 완료로 간주해요.
  activeStudySession = false;
  // 한글 설명 주석: 세션이 끝나면 덱 선택을 다시 허용해 다음 학습 범위를 고를 수 있어요.
  setStudyControlsLocked(false);
  const section = createElement("section", "panel-content");
  const summary = createElement("div", "summary-head");
  summary.append(
    createElement("div", "welcome-icon", "🎉"),
    createElement("h2", "", "오늘 학습 완료!"),
    createElement("p", "", "꾸준히 쌓은 단어가 실력이 돼요. 다음 복습 일정도 확인해 보세요.")
  );

  const score = createElement("div", "summary-score");
  score.append(
    createScorePill("완료", `${correctAnswers} / ${sessionWordIds.size}`),
    createScorePill("학습 연속", `${calculateDailyStreak(history.activeDates)}일`)
  );

  const reviewList = createElement("div", "review-list");
  const uniqueSessionWords = [...sessionWordsById.values()];
  uniqueSessionWords.forEach((word) => {
    const item = createElement("div", "review-item");
    item.append(
      createElement("span", "review-word", word.word),
      createElement("span", "review-detail", getReviewStatus(word))
    );
    reviewList.append(item);
  });

  const actions = createElement("div", "stage-actions");
  const reviewButton = createElement("button", "button secondary", "오늘 틀린 단어 복습하기");
  reviewButton.type = "button";
  reviewButton.disabled = getTodayMistakeWords().length === 0;
  reviewButton.addEventListener("click", renderMistakeReview);

  const todayWords = getTodaySessionWordList();
  const todayWordsButton = createElement(
    "button",
    "button secondary",
    `오늘 학습한 전체 단어 다시보기 (${todayWords.length})`
  );
  todayWordsButton.type = "button";
  todayWordsButton.disabled = todayWords.length === 0;
  todayWordsButton.addEventListener("click", renderTodaySessionReview);

  const extraButton = createElement("button", "button", "추가 단어 공부하기");
  extraButton.type = "button";
  extraButton.disabled = getCurrentDeckWords().every((word) => word.status !== 0);
  extraButton.addEventListener("click", () => openBatchSizePicker("extra"));

  const homeButton = createElement("button", "button", "대시보드로 돌아가기");
  homeButton.type = "button";
  homeButton.addEventListener("click", () => requestSessionExit(renderWelcome));
  actions.append(reviewButton, todayWordsButton, extraButton, homeButton);

  section.append(summary, score, reviewList, actions);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 완료된 단어 상태에 맞춰 마스터, 내일 복습, 예약된 날짜를 표시해요.
function getReviewStatus(word) {
  if (word.status === 4) {
    return "마스터 완료";
  }
  if (word.status === 1) {
    return "내일 다시 복습";
  }
  return `${word.dueDate} 복습`;
}

// 한글 설명 주석: 요약 숫자를 강조하는 작은 점수 표시 요소를 만들어요.
function createScorePill(label, value) {
  const pill = createElement("div", "score-pill");
  pill.append(document.createTextNode(`${label} `), createElement("strong", "", value));
  return pill;
}

// 한글 설명 주석: 오늘 할 수 있는 새 단어/복습이 없으면 가장 가까운 다음 복습일을 안내해요.
function renderNoWordsAvailable() {
  setStudyControlsLocked(false);
  const nextDueWord = getCurrentDeckWords()
    .filter((word) => word.dueDate)
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate))[0];
  const section = createElement("section", "welcome");
  const inner = createElement("div", "welcome-inner");
  inner.append(
    createElement("div", "welcome-icon", "🌿"),
    createElement("h2", "", "오늘은 복습할 단어가 없어요"),
    createElement("p", "", nextDueWord
      ? `아주 잘 하고 있어요! 다음 복습은 ${nextDueWord.dueDate}에 시작돼요.`
      : "새로 배울 단어가 모두 마스터됐어요. 정말 멋져요!")
  );
  const backButton = createElement("button", "button secondary", "대시보드로 돌아가기");
  backButton.type = "button";
  backButton.addEventListener("click", () => requestSessionExit(renderWelcome));
  inner.append(backButton);
  section.append(inner);
  appContent.replaceChildren(section);
}

// 한글 설명 주석: 긴 안내 대신 핵심 학습 CTA와 훈련 모드를 먼저 보여 즉시 학습에 들어가게 해요.
function renderWelcome() {
  clearQuizAutoAdvanceTimer();
  setStudyControlsLocked(false);
  appContent.replaceChildren();
  // 한글 설명 주석: 대시보드 화면에서만 안내를 콘텐츠 맨 위에 붙이고, 집중/결과 화면에는 포함하지 않아요.
  updateInstallGuideVisibility(true);
  const section = createElement("section", "study-cta-card");
  const selectedDeck = currentDeck === "all" ? "전체 단어장" : currentDeck;
  const deckCount = getCurrentDeckWords().length;
  const copy = createElement("div", "study-cta-copy");
  copy.append(
    createElement("p", "eyebrow", "CORE TRAINING"),
    createElement("h2", "", "오늘의 학습을 바로 시작해요"),
    createElement("p", "study-cta-subtitle", `${selectedDeck} · ${deckCount.toLocaleString("ko-KR")}개 단어`)
  );
  const actions = createElement("div", "core-training-actions");
  actions.append(startButton, synonymMatchButton, fillBlankButton);
  section.append(copy, actions);
  appContent.append(section);
}

// 한글 설명 주석: 설치 상태, 저장된 닫힘 값, 현재 화면 종류를 합쳐 배너와 다시 보기 버튼을 제어해요.
function updateInstallGuideVisibility(isDashboardVisible) {
  const isInstalled = isStandaloneApp();
  installGuideBanner.hidden = isInstalled || installGuideDismissed || !isDashboardVisible;
  installGuideReopenButton.hidden = isInstalled || !installGuideDismissed;
  if (isDashboardVisible && !installGuideBanner.hidden) {
    appContent.prepend(installGuideBanner);
  }
}

// 한글 설명 주석: iOS 홈 화면 실행과 표준 display-mode standalone 실행을 모두 설치 완료로 판단해요.
function isStandaloneApp() {
  const displayModeQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(display-mode: standalone)").matches
    : false;
  return navigator.standalone === true || displayModeQuery;
}

// 한글 설명 주석: 배너를 다시 표시할지 판단하기 위해 기기 전체에 저장된 닫힘 상태를 읽어요.
function loadInstallGuidePreference() {
  try {
    installGuideDismissed = localStorage.getItem(INSTALL_GUIDE_STORAGE_KEY) === "true";
    updateInstallGuideVisibility(false);
  } catch (error) {
    console.error("홈 화면 설치 안내 설정을 읽지 못했어요:", error);
    installGuideDismissed = false;
    updateInstallGuideVisibility(false);
    showStorageWarning(error);
  }
}

// 한글 설명 주석: 닫기 선택은 저장한 뒤 대시보드를 다시 그려 이후 방문에도 배너를 숨겨요.
function dismissInstallGuide() {
  const previousDismissedState = installGuideDismissed;
  installGuideDismissed = true;
  try {
    localStorage.setItem(INSTALL_GUIDE_STORAGE_KEY, "true");
  } catch (error) {
    installGuideDismissed = previousDismissedState;
    updateInstallGuideVisibility(true);
    showStorageWarning(error);
    return;
  }
  renderWelcome();
}

// 한글 설명 주석: 설정에서 다시 보기 누르면 저장된 닫힘 값을 지우고 설치 안내 배너를 대시보드에 표시해요.
function reopenInstallGuide() {
  const previousDismissedState = installGuideDismissed;
  installGuideDismissed = false;
  try {
    localStorage.removeItem(INSTALL_GUIDE_STORAGE_KEY);
  } catch (error) {
    installGuideDismissed = previousDismissedState;
    updateInstallGuideVisibility(true);
    showStorageWarning(error);
    return;
  }
  renderWelcome();
  closeSettingsModal(false);
}

// 한글 설명 주석: 플래시카드와 퀴즈에서 공유하는 단계 제목, 현재 번호, 진행 막대를 만들어요.
function createProgressHeader(label, current, total) {
  const wrapper = createElement("div", "");
  const top = createElement("div", "stage-top");
  top.append(
    createElement("span", "stage-label", label),
    createElement("span", "progress-text", `${current} / ${total}`)
  );
  const track = createElement("div", "progress-track");
  const fill = createElement("div", "progress-fill");
  fill.style.width = `${Math.round((current / total) * 100)}%`;
  track.append(fill);
  wrapper.append(top, track);
  return wrapper;
}

// 한글 설명 주석: 클래스 이름과 표시 문자열을 받아 동적으로 사용할 HTML 요소를 안전하게 만들어요.
function createElement(tagName, className, text = "") {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

// 한글 설명 주석: 정규식에서 의미가 있는 기호를 이스케이프해 예문에서 단어를 안전하게 찾게 해요.
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 한글 설명 주석: 단어 데이터나 초기 진도를 읽지 못하면 원인을 화면에 표시하고 시작 버튼을 막아요.
function showError(message) {
  const errorBox = createElement("div", "error-message");
  errorBox.textContent = `${message} index.html을 파일로 직접 열었다면, VS Code Live Server 같은 정적 웹 서버에서 열어 주세요.`;
  appContent.replaceChildren(errorBox);
  startButton.disabled = true;
}

// 한글 설명 주석: 브라우저 저장 실패를 숨기지 않고 사용자에게 알려 기록이 남지 않을 수 있음을 안내해요.
function showStorageWarning(error) {
  const existingWarning = appContent.querySelector(".status-message");
  if (existingWarning) {
    existingWarning.remove();
  }
  const warning = createElement(
    "p",
    "status-message",
    `학습은 계속할 수 있지만 기록을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요. (${error.message})`
  );
  appContent.prepend(warning);
}

// 한글 설명 주석: HTML이 준비된 다음 스크립트가 실행되며 앱의 초기화를 시작해요.
initializeApp();
