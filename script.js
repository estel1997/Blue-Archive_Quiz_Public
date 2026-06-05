const MINI_EXAM_QUESTION_COUNT = 30;
const MINI_EXAM_PASS_SCORE = 27;
const EXAM_QUESTION_COUNT = 50;
const EXAM_PASS_SCORE = 45;
const PLAYER_NAME_MAX_LENGTH = 20;
const ENDLESS_INITIAL_SECONDS = 60;
const ENDLESS_MIN_SECONDS = 20;
const TITLE_CALL_VOLUME = 0.5;
const EXCLUDED_COLLAB_STUDENT_NAMES = ["初音ミク", "御坂美琴", "食蜂操祈", "佐天涙子"];
const RABBIT_SQUAD_PICKUP_CHOICES = ["ミヤコ", "サキ", "ミユ", "モエ"];
const FOX_SQUAD_PICKUP_CHOICES = ["ユキノ", "ニコ"];
const MEMOLOBBY_DIR = "クイズ-ジャンル別/メモロビのズームイン/normalized-16x10";
const ENABLE_MEMOLOBBY_QUESTIONS = true;
const ENABLE_HALO_QUESTIONS = false;
const MIN_PICKUP_BANNERS_FOR_GENRE = 12;
const PERFORMANCE_API_URL = "https://bluearchive-api.skyia.jp/api/students?limit=300";
const DATA_FETCH_TIMEOUT_MS = 2500;
const USE_REMOTE_QUIZ_DATA = true;
const TITLE_CALL_PATH_ALIASES = {
  hoshino_battle_dealer: ["ch0258_02", "hoshino_battle_tank"],
  reijo: ["reizyo", "reijyo"],
};
const TITLE_CALL_SKIP_SLUGS = new Set(["hoshino_battle_dealer", "hoshinobattledealer", "ch0258_01"]);
const QUIZ_ICON_BASE_PATH = "assets/Quiz-icon/processed";
const TITLE_THUMBNAILS = {
  practiceButton: "タイトル画像/ジャンル別練習.png",
  miniExamButton: "タイトル画像/小テスト.png",
  examButton: "タイトル画像/本番50問.png",
  endlessButton: "タイトル画像/エンドレスモード.png",
  examPassersButton: "タイトル画像/本番合格者.png",
  rankingButton: "タイトル画像/エンドレスモードランキング.png",
};
const GENRE_THUMBNAILS = {
  "生徒シルエット": "ジャンル別画像/シルエット.png",
  "生徒の名前": "ジャンル別画像/生徒の名前.png",
  "ガチャピックアップの名称": "ジャンル別画像/ピックアップ募集.png",
  "タイトルコール": "ジャンル別画像/タイトルコール.png",
  "戦闘スキル": "ジャンル別画像/戦闘スキル.png",
  "キャラ性能": "ジャンル別画像/キャラ性能.png",
  "ストーリー内容": "ジャンル別画像/ストーリー内容.png",
  "メモロビ・ズームイン": "ジャンル別画像/メモロビズームイン.png",
  "プロフィール内容": "ジャンル別画像/プロフィール内容.png",
  "ヘイロー": "ジャンル別画像/ヘイロー.png",
  "生徒の固有武器": "ジャンル別画像/固有武器.png",
  "ストーリー・イベント内容(小ネタ)": "ジャンル別画像/小ネタ.png",
};
const SEO_ENTRY_GENRES = {
  character: ["生徒シルエット", "生徒の名前", "プロフィール内容"],
  story: ["ストーリー内容", "ストーリー・イベント内容(小ネタ)"],
  "memory-lobby": ["メモロビ・ズームイン"],
  "title-call": ["タイトルコール"],
  skill: ["戦闘スキル", "キャラ性能"],
  weapon: ["生徒の固有武器"],
  halo: ["ヘイロー"],
};

function trackAnalyticsEvent(eventName, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", eventName, params);
}

function quizAnalyticsMode(mode = currentMode) {
  if (mode.type === "practice") return "practice";
  if (mode.type === "miniExam") return "mini_exam";
  if (mode.type === "endless") return "endless";
  return "full_exam";
}

function quizStartEventName(mode = currentMode) {
  if (mode.type === "practice") return "start_practice";
  if (mode.type === "miniExam") return "start_mini_exam";
  if (mode.type === "endless") return "start_endless";
  return "start_full_exam";
}

const LOCAL_PERFORMANCE_STUDENTS = [];
const SUPABASE_CONFIG = window.BLUE_ARCHIVE_SUPABASE || {
  url: "",
  anonKey: "",
};
const EXAM_GENRE_PLAN = [
  ["生徒シルエット", 2],
  ["生徒の名前", 5],
  ["ガチャピックアップの名称", 4],
  ["タイトルコール", 3],
  ["戦闘スキル", 4],
  ["キャラ性能", 5],
  ["ストーリー内容", 5],
  ["メモロビ・ズームイン", 5],
  ["プロフィール内容", 4],
  ["ヘイロー", 5],
  ["生徒の固有武器", 4],
  ["ストーリー・イベント内容(小ネタ)", 4],
];

const localMemolobby = [];

const PERFORMANCE_ICON_ASSETS = {
  roleClass: {
    タンク: {
      label: "T",
      urls: [
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Tank.png",
        "https://bluearchive.fandom.com/wiki/Special:Redirect/file/Tank.png",
      ],
    },
    アタッカー: {
      label: "A",
      urls: [
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Attacker.png",
        "https://bluearchive.fandom.com/wiki/Special:Redirect/file/Attacker.png",
      ],
    },
    ヒーラー: {
      label: "H",
      urls: [
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Healer.png",
        "https://bluearchive.fandom.com/wiki/Special:Redirect/file/Healer.png",
      ],
    },
    サポーター: {
      label: "S",
      urls: [
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Supporter.png",
        "https://bluearchive.fandom.com/wiki/Special:Redirect/file/Supporter.png",
      ],
    },
    "T.S": {
      label: "TS",
      urls: [
        "https://bluearchive.wiki/wiki/Special:Redirect/file/T.S.png",
        "https://bluearchive.fandom.com/wiki/Special:Redirect/file/T.S.png",
      ],
    },
  },
  attackType: {
    爆発: { label: "A", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Explosion.png"] },
    貫通: { label: "A", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Penetration.png"] },
    神秘: { label: "A", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Mystic.png"] },
    振動: { label: "A", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Sonic.png"] },
    分解: { label: "A", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Set_Damage.png"] },
  },
  defenseType: {
    軽装備: { label: "D", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Light_Armor.png"] },
    重装甲: { label: "D", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Heavy_Armor.png"] },
    特殊装甲: { label: "D", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Special_Armor.png"] },
    弾力装甲: { label: "D", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Elastic_Armor.png"] },
    複合装甲: { label: "D", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Composite_Armor.png"] },
  },
  terrain: {
    city: {
      label: "街",
      urls: [
        "https://static.miraheze.org/bluearchivewiki/thumb/1/13/Icon_location_city.png/24px-Icon_location_city.png",
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Icon_location_city.png",
      ],
    },
    outdoor: {
      label: "野",
      urls: [
        "https://static.miraheze.org/bluearchivewiki/thumb/6/6d/Icon_location_outdoors.png/24px-Icon_location_outdoors.png",
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Icon_location_outdoors.png",
      ],
    },
    indoor: {
      label: "屋",
      urls: [
        "https://static.miraheze.org/bluearchivewiki/thumb/c/c1/Icon_location_indoors.png/24px-Icon_location_indoors.png",
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Icon_location_indoors.png",
      ],
    },
  },
  mood: {
    SS: { label: "SS", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Icon_mood_ss.png"] },
    S: {
      label: "S",
      urls: [
        "https://static.miraheze.org/bluearchivewiki/thumb/e/e3/Icon_mood_s.png/20px-Icon_mood_s.png",
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Icon_mood_s.png",
      ],
    },
    A: { label: "A", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Icon_mood_a.png"] },
    B: {
      label: "B",
      urls: [
        "https://static.miraheze.org/bluearchivewiki/thumb/5/5f/Icon_mood_b.png/20px-Icon_mood_b.png",
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Icon_mood_b.png",
      ],
    },
    C: { label: "C", urls: ["https://bluearchive.wiki/wiki/Special:Redirect/file/Icon_mood_c.png"] },
    D: {
      label: "D",
      urls: [
        "https://static.miraheze.org/bluearchivewiki/thumb/8/81/Icon_mood_d.png/20px-Icon_mood_d.png",
        "https://bluearchive.wiki/wiki/Special:Redirect/file/Icon_mood_d.png",
      ],
    },
  },
};

let activePerformanceIconAssets = structuredClone(PERFORMANCE_ICON_ASSETS);

const students = [];
const haloAssets = [];
const pickupBanners = [];
const pickupTitleCorrections = [];

function normalizePickupTitle(title) {
  return String(title).replace(/[ \t\r\n　]/g, "");
}

function makePickupTitleCorrectionMap(corrections) {
  return corrections.reduce(
    (maps, correction) => {
      const titleKey = normalizePickupTitle(correction.title);
      if (correction.appliesToStudent) {
        maps.byTitleAndStudent.set(`${titleKey}|${correction.appliesToStudent}`, correction);
      } else {
        maps.byTitle.set(titleKey, correction);
      }
      return maps;
    },
    { byTitle: new Map(), byTitleAndStudent: new Map() },
  );
}

const pickupTitleCorrectionMap = makePickupTitleCorrectionMap(pickupTitleCorrections);
let activePickupTitleCorrectionMap = pickupTitleCorrectionMap;

function canonicalizePickupBanner(banner) {
  const titleKey = normalizePickupTitle(banner.title);
  const correction =
    activePickupTitleCorrectionMap.byTitleAndStudent.get(`${titleKey}|${banner.student}`) ||
    activePickupTitleCorrectionMap.byTitle.get(titleKey);
  if (!correction) {
    return banner;
  }

  return {
    ...banner,
    title: correction.displayTitle || correction.title,
    student: correction.student || banner.student,
  };
}

const storyQuestions = [];

const STORY_TRIVIA_PROMPTS_TO_MOVE = new Set();

for (const question of storyQuestions) {
  if (
    STORY_TRIVIA_PROMPTS_TO_MOVE.has(question.prompt) ||
    String(question.sourceTitle || "").startsWith("イベントストーリー")
  ) {
    question.genre = "ストーリー・イベント内容(小ネタ)";
  }
}

let activeStudents = students;
let activePickupBanners = pickupBanners;
let activeStoryQuestions = storyQuestions;
let activePerformanceStudents = [];
let activeHaloAssets = haloAssets;
let activeMemolobbyAssets = localMemolobby.map((memo) => ({
  name: memo.name,
  answer: memo.answer,
  image: `${MEMOLOBBY_DIR}/${memo.name}`,
  imageAlt: "メモロビの一部を切り抜いた画像",
}));
let activeMemolobbyAnswerAssets = [];
let activeCombatSkillQuestions = [];
let quizDataLoaded = false;

const titleScreen = document.querySelector("#titleScreen");
const genreScreen = document.querySelector("#genreScreen");
const quizScreen = document.querySelector("#quizScreen");
const resultScreen = document.querySelector("#resultScreen");
const reviewScreen = document.querySelector("#reviewScreen");
const practiceButton = document.querySelector("#practiceButton");
const miniExamButton = document.querySelector("#miniExamButton");
const examButton = document.querySelector("#examButton");
const endlessButton = document.querySelector("#endlessButton");
const rankingButton = document.querySelector("#rankingButton");
const examPassersButton = document.querySelector("#examPassersButton");
const adminRequestButton = document.querySelector("#adminRequestButton");
const backToTitleButton = document.querySelector("#backToTitleButton");
const nextButton = document.querySelector("#nextButton");
const retryButton = document.querySelector("#retryButton");
const homeButton = document.querySelector("#homeButton");
const quizHomeButton = document.querySelector("#quizHomeButton");
const reviewButton = document.querySelector("#reviewButton");
const backToResultButton = document.querySelector("#backToResultButton");
const genreMenuKicker = document.querySelector("#genreMenuKicker");
const genreMenuTitle = document.querySelector("#genreMenuTitle");
const genreMenuLead = document.querySelector("#genreMenuLead");
const genreList = document.querySelector("#genreList");
const questionCount = document.querySelector("#questionCount");
const scoreText = document.querySelector("#scoreText");
const timerPill = document.querySelector("#timerPill");
const timerText = document.querySelector("#timerText");
const progressBar = document.querySelector("#progressBar");
const genreText = document.querySelector("#genreText");
const questionMedia = document.querySelector("#questionMedia");
const questionImage = document.querySelector("#questionImage");
const audioPanel = document.querySelector("#audioPanel");
const audioButton = document.querySelector("#audioButton");
const titleCallAudio = document.querySelector("#titleCallAudio");
titleCallAudio.volume = TITLE_CALL_VOLUME;
const questionText = document.querySelector("#questionText");
const answerList = document.querySelector("#answerList");
const feedbackText = document.querySelector("#feedbackText");
const resultTitle = document.querySelector("#resultTitle");
const resultScore = document.querySelector("#resultScore");
const resultMessage = document.querySelector("#resultMessage");
const resultCompanion = document.querySelector("#resultCompanion");
const resultCompanionImage = document.querySelector("#resultCompanionImage");
const resultCompanionName = document.querySelector("#resultCompanionName");
const resultCompanionAffiliation = document.querySelector("#resultCompanionAffiliation");
const resultCompanionQuote = document.querySelector("#resultCompanionQuote");
const shareMessage = document.querySelector("#shareMessage");
const shareResultButton = document.querySelector("#shareResultButton");
const shareXButton = document.querySelector("#shareXButton");
const reviewList = document.querySelector("#reviewList");
const unlockText = document.querySelector("#unlockText");
const rankingSubmitForm = document.querySelector("#rankingSubmitForm");
const playerNameInput = document.querySelector("#playerNameInput");
const rankingSubmitButton = document.querySelector("#rankingSubmitButton");
const rankingSubmitMessage = document.querySelector("#rankingSubmitMessage");
const discardScoreButton = document.querySelector("#discardScoreButton");
const rankingModal = document.querySelector("#rankingModal");
const rankingCloseButton = document.querySelector("#rankingCloseButton");
const monthlyRankingButton = document.querySelector("#monthlyRankingButton");
const allRankingButton = document.querySelector("#allRankingButton");
const rankingList = document.querySelector("#rankingList");
const examPassersModal = document.querySelector("#examPassersModal");
const examPassersTitle = document.querySelector("#examPassersTitle");
const examPassersCloseButton = document.querySelector("#examPassersCloseButton");
const miniExamPassersTypeButton = document.querySelector("#miniExamPassersTypeButton");
const fullExamPassersTypeButton = document.querySelector("#fullExamPassersTypeButton");
const examPassersGenreFilter = document.querySelector("#examPassersGenreFilter");
const examPassersGenreSelect = document.querySelector("#examPassersGenreSelect");
const examPassersCurrentTabButton = document.querySelector("#examPassersCurrentTabButton");
const examPassersPastTabButton = document.querySelector("#examPassersPastTabButton");
const examPassersSummary = document.querySelector("#examPassersSummary");
const examPassersList = document.querySelector("#examPassersList");
const pastExamPassersList = document.querySelector("#pastExamPassersList");
const adminRequestModal = document.querySelector("#adminRequestModal");
const adminRequestCloseButton = document.querySelector("#adminRequestCloseButton");
const questionSuggestionForm = document.querySelector("#questionSuggestionForm");
const suggestionGenreInput = document.querySelector("#suggestionGenreInput");
const suggestionFormatInput = document.querySelector("#suggestionFormatInput");
const suggestionQuestionInput = document.querySelector("#suggestionQuestionInput");
const suggestionAnswerInput = document.querySelector("#suggestionAnswerInput");
const suggestionNotesInput = document.querySelector("#suggestionNotesInput");
const suggestionContactInput = document.querySelector("#suggestionContactInput");
const questionSuggestionSubmitButton = document.querySelector("#questionSuggestionSubmitButton");
const questionSuggestionMessage = document.querySelector("#questionSuggestionMessage");
const discardScoreModal = document.querySelector("#discardScoreModal");
const confirmDiscardScoreButton = document.querySelector("#confirmDiscardScoreButton");
const cancelDiscardScoreButton = document.querySelector("#cancelDiscardScoreButton");
const leaveQuizModal = document.querySelector("#leaveQuizModal");
const confirmLeaveQuizButton = document.querySelector("#confirmLeaveQuizButton");
const cancelLeaveQuizButton = document.querySelector("#cancelLeaveQuizButton");
const startModeModal = document.querySelector("#startModeModal");
const startModeKicker = document.querySelector("#startModeKicker");
const startModeTitle = document.querySelector("#startModeTitle");
const startModeDescription = document.querySelector("#startModeDescription");
const startModeCloseButton = document.querySelector("#startModeCloseButton");
const startModeButton = document.querySelector("#startModeButton");
const answerPopupModal = document.querySelector("#answerPopupModal");
const answerPopupKicker = document.querySelector("#answerPopupKicker");
const answerPopupTitle = document.querySelector("#answerPopupTitle");
const answerPopupFigure = document.querySelector("#answerPopupFigure");
const answerPopupImage = document.querySelector("#answerPopupImage");
const answerPopupText = document.querySelector("#answerPopupText");
const answerPopupNextButton = document.querySelector("#answerPopupNextButton");
const studentDirectoryButton = document.querySelector("#studentDirectoryButton");
const studentDirectoryModal = document.querySelector("#studentDirectoryModal");
const studentDirectoryCloseButton = document.querySelector("#studentDirectoryCloseButton");
const studentDirectoryTabs = document.querySelector("#studentDirectoryTabs");
const studentDirectoryGrid = document.querySelector("#studentDirectoryGrid");

let questions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let answerLog = [];
let audioSources = [];
let audioSourceIndex = 0;
let currentMode = { type: "exam", label: "本番50問", count: EXAM_QUESTION_COUNT };
let currentGenre = "";
let timerId = null;
let timeRemaining = ENDLESS_INITIAL_SECONDS;
let timerEndsAt = 0;
let rankingMode = "monthly";
let pendingStartMode = null;
let currentSubmitTarget = null;
let currentShareText = "";
let genreMenuMode = "practice";
let examPassersView = "current";
let examPassersType = "mini";
let examPassersGenre = "";
let questionStartedAt = 0;
let gameStartedAt = 0;
let currentSessionId = "";
let currentClientId = "";
let lastQuizStartAt = 0;
let quizHistoryGuardArmed = false;
let answerPopupAdvanceHandler = null;
let studentDirectorySchool = "";
const preloadedImageSources = new Set();

function randomId(prefix) {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return `${prefix}_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function getClientId() {
  const key = "blueArchiveQuizClientId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = randomId("client");
    localStorage.setItem(key, id);
  }
  return id;
}

function answerElapsedSeconds() {
  if (!questionStartedAt) return null;
  return Math.max(0, Math.round((performance.now() - questionStartedAt) / 10) / 100);
}

function answerTimingPayload() {
  return answerLog
    .filter((item) => item.timingCheck !== false)
    .map((item) => item.answerTimeSec)
    .filter((value) => Number.isFinite(value));
}

function endlessReviewTimingPayload(endlessScore) {
  if (endlessScore <= 50) return [];
  return answerLog
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => index >= 50 && item.isCorrect && Number.isFinite(item.answerTimeSec))
    .map(({ item, index }) => ({
      question_number: index + 1,
      answer_time_sec: item.answerTimeSec,
      genre: item.genre || "",
      input_mode: item.timingCheck === false ? "choice" : "text",
    }));
}

function preloadImage(src) {
  if (!src || preloadedImageSources.has(src)) return;
  preloadedImageSources.add(src);
  const image = new Image();
  image.src = src;
}

function preloadQuestionAssets(question) {
  if (!question) return;
  preloadImage(question.image);
  preloadImage(question.answerPopupImage);
  for (const answer of question.answers || []) {
    preloadImage(answer.image);
  }
}

function preloadUpcomingQuestionAssets(startIndex = currentIndex + 1, count = 3) {
  for (let index = startIndex; index < Math.min(questions.length, startIndex + count); index += 1) {
    preloadQuestionAssets(questions[index]);
  }
}

function portraitUrl(student) {
  return `https://schaledb.com/images/student/portrait/${student.id}.webp`;
}

function studentIconUrl(student) {
  return `https://schaledb.com/images/student/icon/${student.id}.webp`;
}

function weaponUrl(student) {
  return `https://schaledb.com/images/weapon/${student.weaponImg}.webp`;
}

function haloImageChoice(asset) {
  return {
    label: asset.name,
    image: asset.image,
    imageAlt: asset.imageAlt || `${asset.name}のヘイロー`,
    imageClass: "is-halo-choice",
  };
}

function audioUrl(student) {
  const dev = student.dev.toLowerCase();
  return `https://r2.schaledb.com/voice/jp_${dev}/${dev}_title.mp3`;
}

function titleCallUrl(slug) {
  return `https://r2.schaledb.com/voice/jp_${slug}/${slug}_title.mp3`;
}

function titleCallCandidate(slug) {
  if (!slug || TITLE_CALL_SKIP_SLUGS.has(slug.toLowerCase())) {
    return "";
  }
  return titleCallUrl(slug);
}

function titleCallSources(student) {
  const dev = student.dev.toLowerCase();
  const rawDev = student.dev;
  const path = student.path.replace(/_/g, "").toLowerCase();
  const rawPath = student.path.toLowerCase();
  const weaponSlug = String(student.weaponImg || "").replace(/^weapon_icon_/, "").toLowerCase();
  const aliases = [...(TITLE_CALL_PATH_ALIASES[path] || []), ...(TITLE_CALL_PATH_ALIASES[rawPath] || [])];
  return [
    titleCallCandidate(dev),
    TITLE_CALL_SKIP_SLUGS.has(dev) ? "" : `https://r2.schaledb.com/voice/jp_${rawDev}/${rawDev}_title.mp3`,
    titleCallCandidate(path),
    ...aliases.map(titleCallCandidate),
    titleCallCandidate(weaponSlug),
  ].filter(Boolean);
}

const STUDENT_DIRECTORY_SCHOOL_ORDER = [
  "アビドス",
  "ゲヘナ",
  "トリニティ",
  "ミレニアム",
  "百鬼夜行",
  "山海経",
  "レッドウィンター",
  "ヴァルキューレ",
  "SRT",
  "アリウス",
  "ワイルドハント",
  "オデュッセイア",
];

const STUDENT_DIRECTORY_SCHOOL_ALIASES = [
  [/アビドス/, "アビドス"],
  [/ゲヘナ/, "ゲヘナ"],
  [/トリニティ/, "トリニティ"],
  [/ミレニアム/, "ミレニアム"],
  [/百鬼夜行/, "百鬼夜行"],
  [/山海経/, "山海経"],
  [/レッドウィンター/, "レッドウィンター"],
  [/ヴァルキューレ/, "ヴァルキューレ"],
  [/SRT/, "SRT"],
  [/アリウス/, "アリウス"],
  [/ワイルドハント/, "ワイルドハント"],
  [/オデュッセイア/, "オデュッセイア"],
];

function studentDirectorySchoolFor(student) {
  const introLead = String(student?.profileIntro || "").split(/\n+/)[0] || "";
  const match = introLead.match(/^(.+?)所属/);
  const source = match?.[1] || introLead;
  return STUDENT_DIRECTORY_SCHOOL_ALIASES.find(([pattern]) => pattern.test(source))?.[1] || "";
}

function studentDirectoryGroups() {
  const groups = new Map();
  activeStudents
    .filter((student) => student.id && student.name && !isExcludedCollabStudentName(student.name))
    .forEach((student) => {
      const school = studentDirectorySchoolFor(student);
      if (!school) return;
      if (!groups.has(school)) {
        groups.set(school, []);
      }
      groups.get(school).push(student);
    });

  for (const studentsInSchool of groups.values()) {
    studentsInSchool.sort((left, right) =>
      displayStudentName(left.name).localeCompare(displayStudentName(right.name), "ja"),
    );
  }

  return STUDENT_DIRECTORY_SCHOOL_ORDER
    .filter((school) => groups.has(school))
    .map((school) => [school, groups.get(school)]);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = DATA_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchSupabaseTable(table, select) {
  const baseUrl = SUPABASE_CONFIG.url.replace(/\/$/, "");
  const url = `${baseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=5000`;
  const response = await fetchWithTimeout(url, {
    headers: {
      apikey: SUPABASE_CONFIG.anonKey,
      authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${table}: ${response.status}`);
  }

  return response.json();
}

async function fetchSupabaseTableOrEmpty(table, select) {
  try {
    return await fetchSupabaseTable(table, select);
  } catch (error) {
    console.warn(error);
    return [];
  }
}

async function fetchPerformanceStudents() {
  const response = await fetchWithTimeout(PERFORMANCE_API_URL, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`performance-api: ${response.status}`);
  }

  const result = await response.json();
  return Array.isArray(result.data) ? result.data : [];
}

function isUsablePerformanceStudent(student) {
  return (
    student.name &&
    student.weapon?.type &&
    student.role?.type &&
    student.role?.class &&
    student.role?.position &&
    student.combat?.attackType &&
    student.combat?.defenseType &&
    student.terrainAdaptation?.city &&
    student.terrainAdaptation?.outdoor &&
    student.terrainAdaptation?.indoor
  );
}

function mergePerformanceStudents(localStudents, remoteStudents) {
  const byName = new Map();
  [...localStudents, ...remoteStudents]
    .filter(isUsablePerformanceStudent)
    .forEach((student) => {
      byName.set(student.name, student);
    });
  return [...byName.values()];
}

function mergePerformanceIconAssets(rows) {
  activePerformanceIconAssets = structuredClone(PERFORMANCE_ICON_ASSETS);
  rows
    .filter((row) => row.group_key && row.icon_key && row.asset_url)
    .forEach((row) => {
      if (!activePerformanceIconAssets[row.group_key]) {
        activePerformanceIconAssets[row.group_key] = {};
      }
      const current = activePerformanceIconAssets[row.group_key][row.icon_key] || {};
      activePerformanceIconAssets[row.group_key][row.icon_key] = {
        label: current.label || row.label_jp || row.icon_key,
        urls: [row.asset_url, ...(current.urls || [])],
      };
    });
}

async function fetchCombatSkillQuestions() {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    return [];
  }

  const rows = await fetchSupabaseTable(
    "combat_skill_questions",
    "source_id,schaledb_id,student_name_jp,skill_group,display_title_jp,skills,source_url",
  );

  return rows
    .filter((row) => row.student_name_jp && !isExcludedCollabStudentName(row.student_name_jp))
    .filter((row) => Array.isArray(row.skills) && row.skills.length > 0)
    .map((row) => ({
      sourceId: row.source_id,
      schaledbId: row.schaledb_id,
      studentName: row.student_name_jp,
      skillGroup: row.skill_group,
      displayTitle: row.display_title_jp,
      skills: row.skills,
      sourceUrl: row.source_url,
    }));
}

async function loadQuizData() {
  if (quizDataLoaded) {
    return;
  }

  activePerformanceStudents = LOCAL_PERFORMANCE_STUDENTS.filter(isUsablePerformanceStudent);
  activeCombatSkillQuestions = await fetchCombatSkillQuestions().catch(() => []);

  if (!USE_REMOTE_QUIZ_DATA) {
    quizDataLoaded = true;
    return;
  }

  if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      const [
        studentRows,
        bannerRows,
        bannerStudentRows,
        correctionRows,
        storyRows,
        storyTriviaRows,
        iconRows,
        performanceRows,
        haloRows,
        memolobbyRows,
        memolobbyAnswerRows,
      ] = await Promise.all([
        fetchSupabaseTableOrEmpty(
          "students",
          "schaledb_id,name_jp,path_name,dev_name,weapon_name_jp,weapon_img,family_name_jp,personal_name_jp,profile_intro_jp",
        ),
        fetchSupabaseTableOrEmpty("pickup_banners", "source_id,title_jp,year,order_in_year"),
        fetchSupabaseTableOrEmpty(
          "pickup_banner_students",
          "banner_source_id,position,wiki_title,student_name_jp",
        ),
        fetchSupabaseTableOrEmpty(
          "pickup_title_corrections",
          "title_jp,display_title_jp,student_name_jp,applies_to_student_name_jp",
        ),
        fetchSupabaseTableOrEmpty(
          "story_questions",
          "source_title,genre,prompt,answer,distractors,distractor_mode,distractor_pattern,synthetic_names,distractor_pool,status",
        ),
        fetchSupabaseTableOrEmpty(
          "story_trivia_questions",
          "source_title,genre,prompt,answer,distractors,distractor_mode,distractor_pattern,synthetic_names,distractor_pool,status",
        ),
        fetchSupabaseTableOrEmpty(
          "performance_icon_assets",
          "icon_key,group_key,label_jp,asset_url",
        ),
        fetchSupabaseTableOrEmpty(
          "performance_students",
          "schaledb_id,name_jp,weapon,role,combat,terrain_adaptation",
        ),
        fetchSupabaseTableOrEmpty(
          "halo_assets",
          "name_jp,image_url,image_alt,source_url",
        ),
        fetchSupabaseTableOrEmpty(
          "memolobby_zoom_assets",
          "source_id,student_name_jp,file_name,storage_bucket,storage_path,image_url,image_alt",
        ),
        fetchSupabaseTableOrEmpty(
          "memolobby_answer_assets",
          "student_name_jp,display_name_jp,image_url,storage_bucket,storage_path,bond_level,source_url",
        ),
      ]);

  const studentsFromSupabase = studentRows
    .map((student) => ({
      id: student.schaledb_id,
      name: student.name_jp,
      path: student.path_name,
      dev: student.dev_name,
      weapon: student.weapon_name_jp,
      weaponImg: student.weapon_img,
      family: student.family_name_jp?.trim(),
      personal: student.personal_name_jp?.trim(),
      profileIntro: student.profile_intro_jp?.trim(),
    }))
    .filter((student) => student.id && student.name && student.path && student.dev && student.weaponImg);

  const bannerStudentsBySource = bannerStudentRows.reduce((grouped, row) => {
    if (!grouped[row.banner_source_id]) {
      grouped[row.banner_source_id] = [];
    }
    grouped[row.banner_source_id].push(row);
    return grouped;
  }, {});

  const bannersFromSupabase = bannerRows.flatMap((banner) =>
    (bannerStudentsBySource[banner.source_id] || [])
      .sort((left, right) => left.position - right.position)
      .map((student) =>
        canonicalizePickupBanner({
          student: student.student_name_jp || student.wiki_title,
          title: banner.title_jp,
        }),
      ),
  );

  const correctionsFromSupabase = correctionRows
    .map((correction) => ({
      title: correction.title_jp,
      displayTitle: correction.display_title_jp,
      student: correction.student_name_jp,
      appliesToStudent: correction.applies_to_student_name_jp,
    }))
    .filter((correction) => correction.title && (correction.displayTitle || correction.student));

  const storiesFromSupabase = [
    ...storyRows.map((question) => ({ ...question, source_table: "story_questions" })),
    ...storyTriviaRows.map((question) => ({ ...question, source_table: "story_trivia_questions" })),
  ]
    .map((question) => ({
      sourceTitle: question.source_title,
      genre:
        question.source_table === "story_trivia_questions"
          ? "ストーリー・イベント内容(小ネタ)"
          : question.genre || "ストーリー内容",
      prompt: question.prompt,
      answer: question.answer,
      distractors: question.distractors || [],
      distractorMode: question.distractor_mode,
      distractorPattern: question.distractor_pattern,
      syntheticNames: question.synthetic_names || [],
      distractorPool: question.distractor_pool || [],
      status: question.status || "approved",
    }))
    .filter((question) => question.sourceTitle && question.prompt && question.answer);

  const haloAssetsFromSupabase = haloRows
    .map((asset) => ({
      name: asset.name_jp,
      image: asset.image_url,
      imageAlt: asset.image_alt,
      sourceUrl: asset.source_url,
    }))
    .filter((asset) => asset.name && asset.image && asset.name !== "プラナ");

  const performanceStudentsFromSupabase = performanceRows
    .map((student) => ({
      id: student.schaledb_id,
      name: student.name_jp,
      weapon: student.weapon,
      role: student.role,
      combat: student.combat,
      terrainAdaptation: student.terrain_adaptation,
    }))
    .filter(isUsablePerformanceStudent);

  const knownStudentNames = new Set(studentsFromSupabase.length > 0 ? studentsFromSupabase.map((student) => student.name) : students.map((student) => student.name));
  const memolobbyAssetsFromSupabase = memolobbyRows
    .map((asset) => {
      const image =
        asset.image_url ||
        (asset.storage_bucket && asset.storage_path && SUPABASE_CONFIG.url
          ? `${SUPABASE_CONFIG.url.replace(/\/$/, "")}/storage/v1/object/public/${asset.storage_bucket}/${encodeURI(asset.storage_path)}`
          : "");
      return {
        name: asset.file_name,
        answer: asset.student_name_jp,
        image,
        imageAlt: asset.image_alt || `${asset.student_name_jp}のメモロビ・ズームイン`,
      };
    })
    .filter((asset) => asset.answer && asset.image && knownStudentNames.has(asset.answer));

  const memolobbyAnswerAssetsFromSupabase = memolobbyAnswerRows
    .map((asset) => {
      const image =
        asset.image_url ||
        (asset.storage_bucket && asset.storage_path && SUPABASE_CONFIG.url
          ? `${SUPABASE_CONFIG.url.replace(/\/$/, "")}/storage/v1/object/public/${asset.storage_bucket}/${encodeURI(asset.storage_path)}`
          : "");
      return {
        name: asset.student_name_jp,
        displayName: asset.display_name_jp || asset.student_name_jp,
        image,
        bondLevel: asset.bond_level,
        sourceUrl: asset.source_url,
      };
    })
    .filter((asset) => asset.name && asset.image);

  if (studentsFromSupabase.length > 0) {
    activeStudents = studentsFromSupabase;
  }

  activePickupTitleCorrectionMap = makePickupTitleCorrectionMap([
    ...pickupTitleCorrections,
    ...correctionsFromSupabase,
  ]);

  if (bannersFromSupabase.length >= MIN_PICKUP_BANNERS_FOR_GENRE) {
    activePickupBanners = bannersFromSupabase;
  }

      if (iconRows.length > 0) {
        mergePerformanceIconAssets(iconRows);
      }

      if (performanceStudentsFromSupabase.length > 0) {
        activePerformanceStudents = performanceStudentsFromSupabase;
      }

      if (haloAssetsFromSupabase.length > 0) {
        activeHaloAssets = haloAssetsFromSupabase;
      }

      const shouldUseRemoteMemolobbyZoom = window.location.protocol !== "file:" || localMemolobby.length === 0;
      if (shouldUseRemoteMemolobbyZoom && memolobbyAssetsFromSupabase.length > 0) {
        activeMemolobbyAssets = memolobbyAssetsFromSupabase;
      }

      if (memolobbyAnswerAssetsFromSupabase.length > 0) {
        activeMemolobbyAnswerAssets = memolobbyAnswerAssetsFromSupabase;
      }

      if (shouldUseRemoteMemolobbyZoom && memolobbyAssetsFromSupabase.length === 0 && memolobbyAnswerAssetsFromSupabase.length >= 200) {
        activeMemolobbyAssets = memolobbyAnswerAssetsFromSupabase
          .filter((asset) => knownStudentNames.has(asset.name))
          .map((asset) => ({
            name: asset.name,
            answer: asset.name,
            image: asset.image,
            imageAlt: `${displayStudentName(asset.displayName || asset.name)}のメモロビ`,
            imageClass: "is-memolobby-answer",
          }));
      }

      if (storiesFromSupabase.length > 0) {
        activeStoryQuestions = storiesFromSupabase;
      }
    } catch (error) {
      console.warn(error);
    }
  }

  if (activePerformanceStudents.length === 0) {
    activePerformanceStudents = LOCAL_PERFORMANCE_STUDENTS.filter(isUsablePerformanceStudent);
  }

  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    try {
      const performanceStudents = await fetchPerformanceStudents();
      activePerformanceStudents = mergePerformanceStudents(LOCAL_PERFORMANCE_STUDENTS, performanceStudents);
    } catch (error) {
      console.warn(error);
      activePerformanceStudents = LOCAL_PERFORMANCE_STUDENTS.filter(isUsablePerformanceStudent);
    }
  }

  quizDataLoaded = true;
}

function shuffle(items) {
  const copied = [...items];
  for (let index = copied.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
  }
  return copied;
}

function pickMany(pool, count, excluded = []) {
  const excludedSet = new Set(excluded);
  return shuffle(pool.filter((item) => !excludedSet.has(item))).slice(0, count);
}

function makeStoryDistractors(question) {
  if (question.distractors?.length) {
    return question.distractors;
  }

  if (question.distractorMode === "character-pool") {
    return pickMany(question.distractorPool || [], 3, [question.answer]);
  }

  if (question.distractorMode === "synthetic-title") {
    return pickMany(question.syntheticNames || [], 3, [question.answer]);
  }

  if (question.distractorMode === "synthetic-term") {
    const pattern = question.distractorPattern || "{name}";
    return pickMany(question.syntheticNames || [], 3, [question.answer]).map((name) =>
      pattern.replace("{name}", name),
    );
  }

  return [];
}

function baseStudentName(name) {
  return String(name).replace(/[（(][^）)]+[）)]/g, "").trim();
}

function studentVariant(name) {
  return String(name).match(/[（(]([^）)]+)[）)]/)?.[1] || "";
}

function isAlternateCostumeName(name) {
  return Boolean(studentVariant(name));
}

function normalizeTextAnswer(value) {
  return String(value)
    .toLowerCase()
    .replace(/[ぁ-ん]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60))
    .replace(/[ \t\r\n　・･＊*ーｰ\-()（）]/g, "");
}

function performanceAcceptedAnswers(name) {
  const rawName = String(name).trim();
  const variant = studentVariant(rawName);
  if (!variant) {
    return [rawName];
  }

  const base = baseStudentName(rawName);
  return [
    rawName,
    `${base}(${variant})`,
    `${base}${variant}`,
    `${variant}${base}`,
    ...(variant === "バニーガール" ? [`${base}バニー`, `バニー${base}`] : []),
  ];
}

function formatPerformancePrompt(student) {
  return "以下の性能の生徒は？";
}

function profileExcerpt(profileIntro) {
  const lines = String(profileIntro || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const body = lines[1] || "";
  return body.match(/^.+?。/)?.[0] || body;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function profileQuestionHint(student) {
  let hint = profileExcerpt(student.profileIntro);
  if (!hint) {
    return "";
  }

  const names = [...new Set([student.name, baseStudentName(student.name)].filter(Boolean))]
    .sort((left, right) => right.length - left.length);
  for (const name of names) {
    hint = hint.replace(new RegExp(escapeRegExp(name), "g"), "この生徒");
  }
  return hint;
}

function performanceDataForStudent(student) {
  return {
    roleType: student.role.type,
    roleClass: student.role.class,
    position: student.role.position,
    attackType: student.combat.attackType,
    defenseType: student.combat.defenseType,
    weaponType: student.weapon.type,
    cover: student.weapon.cover,
    terrain: student.terrainAdaptation,
  };
}

function performanceIcon(group, key) {
  return activePerformanceIconAssets[group]?.[key] || { label: String(key || "").slice(0, 2), urls: [] };
}

function performanceChipIcon(icon) {
  const mark = document.createElement("span");
  mark.className = "performance-chip-icon";

  const urls = typeof icon === "string" ? [] : icon?.urls || [];
  const fallbackText = typeof icon === "string" ? icon : icon?.label || "";
  if (urls.length > 0) {
    const image = document.createElement("img");
    image.src = urls[0];
    image.alt = "";
    image.loading = "lazy";
    image.dataset.fallbackIndex = "0";
    image.dataset.fallbackUrls = JSON.stringify(urls);
    image.addEventListener("error", () => {
      const candidates = JSON.parse(image.dataset.fallbackUrls || "[]");
      const nextIndex = Number(image.dataset.fallbackIndex || 0) + 1;
      if (candidates[nextIndex]) {
        image.dataset.fallbackIndex = String(nextIndex);
        image.src = candidates[nextIndex];
        return;
      }
      mark.textContent = fallbackText;
    });
    mark.append(image);
  } else {
    mark.textContent = fallbackText;
  }

  return mark;
}

function performanceChip(label, classNames = [], icon = "") {
  const chip = document.createElement("span");
  chip.className = ["performance-chip", ...classNames].filter(Boolean).join(" ");
  if (icon) {
    chip.append(performanceChipIcon(icon));
  }
  const text = document.createElement("span");
  text.textContent = label;
  chip.append(text);
  return chip;
}

function performanceSection(title, children) {
  const section = document.createElement("section");
  section.className = "performance-section";
  const heading = document.createElement("h3");
  heading.className = "performance-title";
  heading.textContent = title;
  const row = document.createElement("div");
  row.className = "performance-chip-row";
  row.append(...children);
  section.append(heading, row);
  return section;
}

function performanceTypeClass(value, prefix) {
  const keyMap = {
    爆発: "explosive",
    貫通: "piercing",
    神秘: "mystic",
    振動: "sonic",
    軽装備: "light",
    重装甲: "heavy",
    特殊装甲: "special",
    弾力装甲: "elastic",
  };
  return `${prefix}-${keyMap[value] || "neutral"}`;
}

function performanceStudentByName(name) {
  return activePerformanceStudents.find((student) => student.name === name) || null;
}

function combatSkillCardsForStudent(skills, studentName) {
  const attackType = performanceStudentByName(studentName)?.combat?.attackType || "";
  return (skills || []).map((skill) => ({
    ...skill,
    attackType,
  }));
}

function renderPerformanceCard(performance) {
  const card = document.createElement("div");
  card.className = "performance-card";

  const roleClass = performance.roleType === "SPECIAL" ? "role-special" : "role-striker";
  card.append(
    performanceSection("役割", [
      performanceChip(performance.roleType, ["is-role", roleClass]),
      performanceChip(performance.roleClass, ["is-dark"], performanceIcon("roleClass", performance.roleClass)),
    ]),
    performanceSection("攻撃タイプ", [
      performanceChip(
        performance.attackType,
        [performanceTypeClass(performance.attackType, "attack")],
        performanceIcon("attackType", performance.attackType),
      ),
    ]),
    performanceSection("防御タイプ", [
      performanceChip(
        performance.defenseType,
        [performanceTypeClass(performance.defenseType, "defense")],
        performanceIcon("defenseType", performance.defenseType),
      ),
    ]),
    performanceSection("ポジション", [
      performanceChip(performance.position, ["is-position"]),
    ]),
    performanceSection("武器種 / 遮蔽物", [
      performanceChip(performance.weaponType, ["is-weapon"], "W"),
      performanceChip(performance.cover ? "遮蔽物あり" : "遮蔽物なし", ["is-cover"], "C"),
    ]),
  );

  const terrain = document.createElement("section");
  terrain.className = "performance-section performance-terrain";
  const terrainHeading = document.createElement("h3");
  terrainHeading.className = "performance-title";
  terrainHeading.textContent = "地形別戦闘力";
  const terrainRows = document.createElement("div");
  terrainRows.className = "terrain-row-list";
  [
    ["市街地", "city", performance.terrain.city],
    ["屋外", "outdoor", performance.terrain.outdoor],
    ["屋内", "indoor", performance.terrain.indoor],
  ].forEach(([label, iconKey, grade]) => {
    const row = document.createElement("div");
    row.className = "terrain-row";
    row.append(
      performanceChip(label, ["is-terrain-label"], performanceIcon("terrain", iconKey)),
      performanceChip(
        grade,
        [`terrain-grade-${String(grade).toLowerCase()}`],
        performanceIcon("mood", grade),
      ),
    );
    terrainRows.append(row);
  });
  terrain.append(terrainHeading, terrainRows);
  card.append(terrain);
  return card;
}

function renderCombatSkillPanel(skills) {
  const panel = document.createElement("div");
  panel.className = "combat-skill-panel";

  skills.forEach((skill) => {
    const card = document.createElement("section");
    card.className = [
      "combat-skill-card",
      `is-${skill.type || "skill"}`,
      performanceTypeClass(skill.attackType, "attack"),
    ].filter(Boolean).join(" ");

    const iconWrap = document.createElement("div");
    iconWrap.className = "combat-skill-icon";
    if (skill.iconUrl) {
      const icon = document.createElement("img");
      icon.src = skill.iconUrl;
      icon.alt = "";
      icon.loading = "lazy";
      iconWrap.append(icon);
    } else {
      iconWrap.textContent = "S";
    }

    const body = document.createElement("div");
    body.className = "combat-skill-body";

    const header = document.createElement("div");
    header.className = "combat-skill-header";
    const title = document.createElement("h3");
    title.textContent = skill.name || "";
    const label = document.createElement("span");
    label.className = "combat-skill-label";
    label.textContent = skill.label || "";
    header.append(title, label);

    const desc = renderCombatSkillDescription(skill.description || "");

    const meta = document.createElement("div");
    meta.className = "combat-skill-meta";
    const maxBadge = document.createElement("span");
    maxBadge.textContent = "MAX";
    meta.append(maxBadge);
    if (skill.cost != null && skill.cost !== "") {
      const cost = document.createElement("span");
      cost.textContent = `COST: ${skill.cost}`;
      meta.append(cost);
    }

    body.append(header, desc, meta);
    card.append(iconWrap, body);
    panel.append(card);
  });

  return panel;
}

function renderCombatSkillDescription(description) {
  const desc = document.createElement("p");
  desc.className = "combat-skill-desc";
  const parts = String(description).split(/(\{\{(?:buff|debuff|cc|special):[^}]+\}\})/g);
  parts.forEach((part) => {
    const match = part.match(/^\{\{(buff|debuff|cc|special):([^}]+)\}\}$/);
    if (!match) {
      desc.append(document.createTextNode(part));
      return;
    }
    const badge = document.createElement("span");
    badge.className = `combat-effect is-${match[1]}`;
    badge.textContent = match[2];
    desc.append(badge);
  });
  return desc;
}

function choicePoolForStudentName(answer, blocked = []) {
  const variant = studentVariant(answer);
  const blockedSet = new Set([answer, ...blocked]);
  const sameVariant = activeStudents
    .map((student) => student.name)
    .filter((name) => !blockedSet.has(name))
    .filter((name) => !isExcludedCollabStudentName(name))
    .filter((name) => studentVariant(name) === variant);

  if (sameVariant.length >= 3) {
    return sameVariant;
  }

  return activeStudents
    .map((student) => student.name)
    .filter((name) => !blockedSet.has(name))
    .filter((name) => !isExcludedCollabStudentName(name));
}

function pickupStudentChoicesForBanner(banner, defaultChoices) {
  if (/RABBIT/i.test(banner.title)) {
    return RABBIT_SQUAD_PICKUP_CHOICES;
  }

  if (/FOX/i.test(banner.title)) {
    const fallback = defaultChoices.filter((name) => !FOX_SQUAD_PICKUP_CHOICES.includes(name));
    return [...FOX_SQUAD_PICKUP_CHOICES, ...pickMany(fallback, 2)];
  }

  return defaultChoices;
}

function pickupTitleChoicesForBanner(banner, defaultChoices, allBanners) {
  const rabbitTitles = [...new Set(allBanners.filter((item) => /RABBIT/i.test(item.title)).map((item) => item.title))];
  const foxTitles = [...new Set(allBanners.filter((item) => /FOX/i.test(item.title)).map((item) => item.title))];

  if (/RABBIT/i.test(banner.title)) {
    return rabbitTitles.length >= 4 ? rabbitTitles : [...rabbitTitles, ...defaultChoices];
  }

  if (/FOX/i.test(banner.title)) {
    return [...foxTitles, ...rabbitTitles];
  }

  return defaultChoices.filter((title) => !/RABBIT|FOX/i.test(title));
}

function choiceQuestion({
  genre,
  prompt,
  answer,
  choices,
  image,
  imageClass,
  imageAlt,
  audio,
  relationKey,
  relationKind,
  reviewStatus,
  inputMode,
  acceptedAnswers,
  performance,
  skillCards,
  answerPopupImage,
  answerPopupImageAlt,
}) {
  const uniqueChoices = [...new Set(choices)];
  const answers = inputMode === "text" ? [] : shuffle([answer, ...pickMany(uniqueChoices, 3, [answer])]);
  return {
    genre,
    question: prompt,
    image,
    imageClass,
    imageAlt,
    audio,
    relationKey,
    relationKind,
    reviewStatus,
    inputMode,
    acceptedAnswers,
    performance,
    skillCards,
    answerPopupImage,
    answerPopupImageAlt,
    correctText: answer,
    answers: answers.map((text) => ({ text, isCorrect: text === answer })),
  };
}

function imageChoiceQuestion({
  genre,
  prompt,
  answer,
  choices,
  relationKey,
  relationKind,
}) {
  const uniqueChoices = [...new Map(choices.map((choice) => [choice.image, choice])).values()].filter(
    (choice) => choice.image !== answer.image,
  );
  const answers = shuffle([answer, ...pickMany(uniqueChoices, 3)]);
  return {
    genre,
    question: prompt,
    relationKey,
    relationKind,
    correctText: answer.label,
    answers: answers.map((choice) => ({
      text: choice.label,
      image: choice.image,
      imageAlt: choice.imageAlt,
      imageClass: choice.imageClass,
      isCorrect: choice.image === answer.image,
    })),
  };
}

function makeGeneratedQuestionsByGenre() {
  const eligibleStudents = activeStudents.filter((student) => !isExcludedCollabStudentName(student.name));
  const eligiblePerformanceStudents = activePerformanceStudents.filter(
    (student) => !isExcludedCollabStudentName(student.name),
  );
  const nameChoices = [...new Set(eligibleStudents.map((student) => student.name))];
  const weaponChoices = [...new Set(eligibleStudents.map((student) => student.weapon))];
  const seenCharacterNames = new Set();
  const seenPerformanceNames = new Set();
  const identityStudentsByName = new Map();
  for (const student of eligibleStudents.filter((student) => student.family && student.personal)) {
    const key = `${student.family}|${student.personal}`;
    const current = identityStudentsByName.get(key);
    if (!current || (isAlternateCostumeName(current.name) && !isAlternateCostumeName(student.name))) {
      identityStudentsByName.set(key, student);
    }
  }
  const identityStudents = [...identityStudentsByName.values()];
  const familyChoices = [...new Set(identityStudents.map((student) => student.family))];
  const personalChoices = [...new Set(identityStudents.map((student) => student.personal))];
  const usablePickupBanners = [
    ...new Map(
      activePickupBanners
        .map(canonicalizePickupBanner)
        .filter((banner) => nameChoices.includes(banner.student))
        .filter((banner) => !containsExcludedCollabStudent(banner.title))
        .map((banner) => [`${banner.title}|${banner.student}`, banner]),
    ).values(),
  ];
  const usableHaloAssets = activeHaloAssets
    .filter((asset) => asset.name && asset.image && asset.name !== "プラナ")
    .filter((asset) => !isExcludedCollabStudentName(asset.name));
  const haloNameChoices = [...new Set(usableHaloAssets.map((asset) => asset.name))];
  const pickupStudentsByTitle = usablePickupBanners.reduce((grouped, banner) => {
    if (!grouped[banner.title]) {
      grouped[banner.title] = new Set();
    }
    grouped[banner.title].add(banner.student);
    return grouped;
  }, {});
  const pickupTitleChoices = [...new Set(usablePickupBanners.map((banner) => banner.title))];
  const familyCounts = identityStudents.reduce((counts, student) => {
    if (student.family) {
      counts[student.family] = (counts[student.family] || 0) + 1;
    }
    return counts;
  }, {});
  const personalAnswersByFamily = identityStudents.reduce((grouped, student) => {
    if (!grouped[student.family]) {
      grouped[student.family] = new Set();
    }
    grouped[student.family].add(student.personal);
    return grouped;
  }, {});
  const groups = {
    "生徒シルエット": [],
    "生徒の固有武器": [],
    "タイトルコール": [],
    "ヘイロー": [],
    "プロフィール内容": [],
    "生徒の名前": [],
    "ストーリー内容": [],
    "ストーリー・イベント内容(小ネタ)": [],
  };

  if (eligiblePerformanceStudents.length > 0) {
    groups["キャラ性能"] = [];
  }

  if (activeCombatSkillQuestions.length > 0) {
    groups["戦闘スキル"] = [];
  }

  if (usablePickupBanners.length >= MIN_PICKUP_BANNERS_FOR_GENRE) {
    groups["ガチャピックアップの名称"] = [];
  }

  if (ENABLE_MEMOLOBBY_QUESTIONS) {
    groups["メモロビ・ズームイン"] = [];
  }

  if (ENABLE_HALO_QUESTIONS) {
    groups["生徒のヘイロー"] = [];
  }

  for (const student of eligibleStudents) {
    const shouldMakeCharacterQuestion = !seenCharacterNames.has(student.name);
    if (shouldMakeCharacterQuestion) {
      seenCharacterNames.add(student.name);

      groups["生徒シルエット"].push(
        choiceQuestion({
          genre: "生徒シルエット",
          prompt: "このシルエットの生徒は？",
          answer: student.name,
          choices: nameChoices,
          image: portraitUrl(student),
          imageClass: "is-silhouette",
          imageAlt: "黒塗りにした生徒の立ち絵",
          answerPopupImage: portraitUrl(student),
          answerPopupImageAlt: `${student.name}の立ち絵`,
        }),
      );
    }

    groups["生徒の固有武器"].push(
      choiceQuestion({
        genre: "生徒の固有武器",
        prompt: "この固有武器の名前は？",
        answer: student.weapon,
        choices: weaponChoices,
        image: weaponUrl(student),
        imageClass: "is-weapon",
        imageAlt: "固有武器の画像",
        relationKind: "weapon-name",
      }),
    );

    const weaponImageAnswer = {
      label: student.weapon,
      image: weaponUrl(student),
      imageAlt: `${student.weapon}の画像`,
      imageClass: "is-weapon-choice",
    };

    groups["生徒の固有武器"].push(
      imageChoiceQuestion({
        genre: "生徒の固有武器",
        prompt: `「${student.weapon}」の画像は？`,
        answer: weaponImageAnswer,
        choices: eligibleStudents.map((choiceStudent) => ({
          label: choiceStudent.weapon,
          image: weaponUrl(choiceStudent),
          imageAlt: `${choiceStudent.weapon}の画像`,
          imageClass: "is-weapon-choice",
        })),
        relationKey: student.weapon,
        relationKind: "weapon-image-choice",
      }),
    );

    groups["生徒の固有武器"].push(
      choiceQuestion({
        genre: "生徒の固有武器",
        prompt: "この固有武器を使用する生徒は？",
        answer: student.name,
        choices: choicePoolForStudentName(student.name),
        image: weaponUrl(student),
        imageClass: "is-weapon",
        imageAlt: "固有武器の画像",
        relationKey: student.weapon,
        relationKind: "weapon-owner",
      }),
    );

    if (shouldMakeCharacterQuestion) {
      groups["タイトルコール"].push(
        choiceQuestion({
          genre: "タイトルコール",
          prompt: "このタイトルコールの生徒は？",
          answer: student.name,
          inputMode: "text",
          acceptedAnswers: [...performanceAcceptedAnswers(student.name), baseStudentName(student.name)],
          audio: titleCallSources(student),
        }),
      );

      const profileHint = profileQuestionHint(student);
      if (profileHint) {
        groups["プロフィール内容"].push(
          choiceQuestion({
            genre: "プロフィール内容",
            prompt: `このプロフィール内容の生徒は？\n${profileHint}`,
            answer: student.name,
            choices: choicePoolForStudentName(student.name),
            relationKey: student.id,
            relationKind: "profile-introduction",
          }),
        );
      }

      if (ENABLE_HALO_QUESTIONS) {
        groups["生徒のヘイロー"].push(
          choiceQuestion({
            genre: "生徒のヘイロー",
            prompt: "このヘイローの生徒は？",
            answer: student.name,
            choices: nameChoices,
            image: portraitUrl(student),
            imageClass: "is-halo-crop",
            imageAlt: "生徒のヘイロー付近を拡大した画像",
          }),
        );
      }
    }
  }

  for (const halo of usableHaloAssets) {
    groups["ヘイロー"].push(
      choiceQuestion({
        genre: "ヘイロー",
        prompt: "このヘイローの生徒は？",
        answer: halo.name,
        choices: haloNameChoices,
        image: halo.image,
        imageClass: "is-halo",
        imageAlt: halo.imageAlt || `${halo.name}のヘイロー`,
        relationKey: halo.name,
        relationKind: "halo-name",
      }),
    );

    groups["ヘイロー"].push(
      imageChoiceQuestion({
        genre: "ヘイロー",
        prompt: `「${halo.name}」のヘイローは？`,
        answer: haloImageChoice(halo),
        choices: usableHaloAssets.map(haloImageChoice),
        relationKey: halo.name,
        relationKind: "halo-image-choice",
      }),
    );
  }

  for (const student of eligiblePerformanceStudents) {
    if (seenPerformanceNames.has(student.name)) {
      continue;
    }
    seenPerformanceNames.add(student.name);

    groups["キャラ性能"]?.push(
      choiceQuestion({
        genre: "キャラ性能",
        prompt: formatPerformancePrompt(student),
        answer: student.name,
        inputMode: "text",
        acceptedAnswers: performanceAcceptedAnswers(student.name),
        performance: performanceDataForStudent(student),
        relationKey: student.id,
        relationKind: "character-performance",
      }),
    );
  }

  for (const skillQuestion of activeCombatSkillQuestions) {
    groups["戦闘スキル"]?.push(
      choiceQuestion({
        genre: "戦闘スキル",
        prompt: `${skillQuestion.displayTitle}から生徒名を答えてください。`,
        answer: skillQuestion.studentName,
        inputMode: "text",
        acceptedAnswers: performanceAcceptedAnswers(skillQuestion.studentName),
        skillCards: combatSkillCardsForStudent(skillQuestion.skills, skillQuestion.studentName),
        relationKey: skillQuestion.sourceId,
        relationKind: `combat-skill-${skillQuestion.skillGroup}`,
      }),
    );
  }

  for (const student of identityStudents) {
    if (student.family && student.personal && student.family !== student.personal) {
      groups["生徒の名前"].push(
        choiceQuestion({
          genre: "生徒の名前",
          prompt: `「${student.personal}」の苗字は？`,
          answer: student.family,
          choices: familyChoices,
          relationKey: `${student.family}|${student.personal}`,
          relationKind: "student-name",
        }),
      );

      const siblingPersonalAnswers = [...personalAnswersByFamily[student.family]].filter(
        (personalName) => personalName !== student.personal,
      );

      groups["生徒の名前"].push(
        choiceQuestion({
          genre: "生徒の名前",
          prompt: `「${student.family}」という苗字をもつ生徒の名前は？`,
          answer: student.personal,
          choices: personalChoices.filter((personalName) => !siblingPersonalAnswers.includes(personalName)),
          relationKey: `${student.family}|${student.personal}`,
          relationKind: "student-name",
        }),
      );
    }
  }

  for (const banner of usablePickupBanners) {
    if (!groups["ガチャピックアップの名称"]) {
      continue;
    }

    const siblingAnswers = [...pickupStudentsByTitle[banner.title]].filter(
      (studentName) => studentName !== banner.student,
    );
    const choices = choicePoolForStudentName(banner.student, siblingAnswers);
    const pickupStudentChoices = pickupStudentChoicesForBanner(banner, choices);

    groups["ガチャピックアップの名称"].push(
      choiceQuestion({
        genre: "ガチャピックアップの名称",
        prompt: `「${banner.title}」の対象生徒は？`,
        answer: banner.student,
        choices: pickupStudentChoices,
        relationKey: banner.title,
        relationKind: "pickup-title",
      }),
    );

    groups["ガチャピックアップの名称"].push(
      choiceQuestion({
        genre: "ガチャピックアップの名称",
        prompt: `「${banner.student}」のピックアップ募集名は？`,
        answer: banner.title,
        choices: pickupTitleChoicesForBanner(banner, pickupTitleChoices, usablePickupBanners),
        relationKey: banner.title,
        relationKind: "pickup-title",
      }),
    );
  }

  const rabbitBlankOptions = ["理想", "規範", "計算", "証明"];
  [
    { student: "ミヤコ", number: "1", answer: "理想", suffix: "眼" },
    { student: "サキ", number: "2", answer: "規範", suffix: "脚" },
    { student: "モエ", number: "3", answer: "計算", suffix: "胸" },
    { student: "ミユ", number: "4", answer: "証明", suffix: "手" },
  ].forEach((rabbit) => {
    if (!groups["ガチャピックアップの名称"]) {
      return;
    }
    groups["ガチャピックアップの名称"].push(
      choiceQuestion({
        genre: "ガチャピックアップの名称",
        prompt: `${rabbit.student}のピックアップ名称において空欄は何が入るでしょう？\n「こちらRABBIT${rabbit.number}、○○をこの${rabbit.suffix}に」`,
        answer: rabbit.answer,
        choices: shuffle(rabbitBlankOptions),
        relationKey: `RABBIT${rabbit.number}-${rabbit.answer}`,
        relationKind: "pickup-title-rabbit-blank",
      }),
    );
  });

  if (ENABLE_MEMOLOBBY_QUESTIONS) {
    const usableMemolobby = activeMemolobbyAssets.filter(
      (memo) => !isExcludedCollabStudentName(memo.answer) && memolobbyAnswerAssetFor(memo.answer),
    );
    const memoChoiceNames = [...new Set([...nameChoices, ...usableMemolobby.map((memo) => memo.answer)])];

    for (const memo of usableMemolobby) {
      const answerAsset = memolobbyAnswerAssetFor(memo.answer);
      groups["メモロビ・ズームイン"].push(
        choiceQuestion({
          genre: "メモロビ・ズームイン",
          prompt: "このメモロビの生徒は？",
          answer: memo.answer,
          choices: memoChoiceNames,
          inputMode: "text",
          acceptedAnswers: performanceAcceptedAnswers(memo.answer),
          image: memo.image,
          imageClass: memo.imageClass || "is-memolobby-local",
          imageAlt: memo.imageAlt || "メモロビの一部を切り抜いた画像",
          missingMessage: "メモロビ画像をフォルダに配置してください",
          answerPopupImage: answerAsset?.image,
          answerPopupImageAlt: answerAsset?.displayName || memo.answer,
        }),
      );
    }
  }

  for (const story of activeStoryQuestions) {
    if ((story.status || "approved") !== "approved") {
      continue;
    }
    if (
      [
        story.sourceTitle,
        story.prompt,
        story.answer,
        ...(story.distractors || []),
        ...(story.distractorPool || []),
      ].some(containsExcludedCollabStudent)
    ) {
      continue;
    }

    const choices = makeStoryDistractors(story);
    if (choices.length < 3) {
      continue;
    }

    const storyGenre = story.genre || "ストーリー内容";
    if (!groups[storyGenre]) {
      groups[storyGenre] = [];
    }

    groups[storyGenre].push(
      choiceQuestion({
        genre: storyGenre,
        prompt: `${story.sourceTitle}より出題\n${story.prompt}`,
        answer: story.answer,
        choices,
        relationKey: story.sourceTitle,
        relationKind: "story",
        reviewStatus: story.status || "approved",
      }),
    );
  }

  for (const genre of Object.keys(groups)) {
    groups[genre] = groups[genre].filter((question) => !questionTouchesExcludedCollab(question));
  }

  return groups;
}

function isQuestionAllowed(candidate, selectedQuestions) {
  return isQuestionAllowedWithOptions(candidate, selectedQuestions);
}

function questionIdentity(question) {
  return [
    question.genre,
    question.question,
    question.correctText,
    question.relationKind,
    question.relationKey,
  ].map((value) => String(value || "")).join("::");
}

function isQuestionAllowedWithOptions(candidate, selectedQuestions, options = {}) {
  if (!candidate) {
    return false;
  }

  if (
    !options.allowDuplicateQuestion &&
    selectedQuestions.some((question) => questionIdentity(question) === questionIdentity(candidate))
  ) {
    return false;
  }

  if (
    candidate.relationKind === "profile-introduction" &&
    selectedQuestions.some((question) => question.question === candidate.question)
  ) {
    return false;
  }

  const previousQuestion = selectedQuestions.at(-1);
  if (
    !options.allowSequentialStudentName &&
    previousQuestion?.relationKind === "student-name" &&
    candidate.relationKind === "student-name"
  ) {
    return false;
  }

  if (candidate.relationKind === "student-name") {
    return !selectedQuestions.some(
      (question) =>
        question.relationKind === "student-name" && question.relationKey === candidate.relationKey,
    );
  }

  if (candidate.relationKind === "pickup-title") {
    return !selectedQuestions.some(
      (question) =>
        question.relationKind === "pickup-title" && question.relationKey === candidate.relationKey,
    );
  }

  return true;
}

function takeNextQuestion(pool, selectedQuestions, options = {}) {
  const nextIndex = pool.findIndex((question) =>
    isQuestionAllowedWithOptions(question, selectedQuestions, options),
  );
  if (nextIndex === -1) {
    return null;
  }
  return pool.splice(nextIndex, 1)[0];
}

function fillExamQuestionShortfall(groups, selectedQuestions, targetCount) {
  if (selectedQuestions.length >= targetCount) {
    return;
  }

  const plannedGenres = EXAM_GENRE_PLAN.map(([genre]) => genre);
  const extraGenres = Object.keys(groups).filter((genre) => !plannedGenres.includes(genre));
  const fallbackPool = shuffle(
    [...plannedGenres, ...extraGenres].flatMap((genre) => groups[genre] || []),
  );

  while (selectedQuestions.length < targetCount && fallbackPool.length > 0) {
    const next = takeNextQuestion(fallbackPool, selectedQuestions);
    if (!next) {
      break;
    }
    selectedQuestions.push(next);
  }
}

function formatAnswerModeLabel(questionsForGenre) {
  const hasInput = questionsForGenre.some((question) => question.inputMode === "text");
  const hasChoice = questionsForGenre.some((question) => question.inputMode !== "text");
  if (hasInput && hasChoice) {
    return "混合";
  }
  return hasInput ? "入力" : "4択";
}

function inputAnswerHint(question) {
  if (question.genre === "タイトルコール") {
    return "タイトルコールは衣装違いでも、元の生徒名だけで正解です。\n例 :「ホシノ(水着)」→「ホシノ」でも正解";
  }
  return "表記ゆれの許容は以下の通りです。\n例: 水着ホシノ・ホシノ水着・ホシノ(水着)";
}

function displayStudentName(name) {
  return String(name).replace(/（/g, "(").replace(/）/g, ")");
}

function memolobbyAnswerAssetFor(name) {
  const normalized = normalizeTextAnswer(name);
  return activeMemolobbyAnswerAssets.find((asset) => normalizeTextAnswer(asset.name) === normalized);
}

function isExcludedCollabStudentName(name) {
  return EXCLUDED_COLLAB_STUDENT_NAMES.includes(baseStudentName(name));
}

function containsExcludedCollabStudent(value) {
  return EXCLUDED_COLLAB_STUDENT_NAMES.some((name) => String(value || "").includes(name));
}

function questionTouchesExcludedCollab(question) {
  return [
    question.genre,
    question.question,
    question.correctText,
    question.imageAlt,
    question.relationKey,
    ...(question.answers || []).map((answer) => answer.text),
  ].some(containsExcludedCollabStudent);
}

function prepareExamQuestions(groups) {
  const result = [];

  for (const [genre, requestedCount] of EXAM_GENRE_PLAN) {
    const source = groups[genre] || [];
    const pool = shuffle(source);
    let added = 0;

    while (added < requestedCount && pool.length > 0) {
      const next = takeNextQuestion(pool, result, {
        allowSequentialStudentName: genre === "生徒の名前",
      });
      if (!next) {
        break;
      }
      result.push(next);
      added += 1;
    }
  }

  fillExamQuestionShortfall(groups, result, EXAM_QUESTION_COUNT);

  return result;
}

function prepareQuestions({ count = EXAM_QUESTION_COUNT, genre = null, endless = false } = {}) {
  const groups = makeGeneratedQuestionsByGenre();
  const genreNames = Object.keys(groups).filter((name) => groups[name].length > 0 && (!genre || name === genre));
  const targetCount = count ?? (genre ? groups[genre]?.length || 0 : EXAM_QUESTION_COUNT);

  if (!endless && !genre && targetCount === EXAM_QUESTION_COUNT) {
    return prepareExamQuestions(groups);
  }

  if (endless && !genre) {
    const shuffledGroups = Object.fromEntries(
      genreNames.map((name) => [name, shuffle(groups[name])]),
    );
    const result = [];
    let genreCycle = shuffle(genreNames);

    while (result.length < targetCount && genreNames.length > 0) {
      if (genreCycle.length === 0) {
        genreCycle = shuffle(genreNames);
      }

      const nextGenre = genreCycle.shift();
      if (!nextGenre) {
        break;
      }

      if (shuffledGroups[nextGenre].length === 0) {
        shuffledGroups[nextGenre] = shuffle(groups[nextGenre]);
      }

      const next = takeNextQuestion(shuffledGroups[nextGenre], result);
      if (next) {
        result.push(next);
      }
    }
    return result;
  }

  const shuffledGroups = Object.fromEntries(
    genreNames.map((name) => [name, shuffle(groups[name])]),
  );
  const result = [];

  while (result.length < targetCount) {
    const countBeforePass = result.length;
    for (const genre of shuffle(genreNames)) {
      if (shuffledGroups[genre].length === 0 && endless) {
        shuffledGroups[genre] = shuffle(groups[genre]);
      }
      const next = takeNextQuestion(shuffledGroups[genre], result, {
        allowSequentialStudentName: genre === "生徒の名前",
      });
      if (next) {
        result.push(next);
      }
      if (result.length >= targetCount) {
        break;
      }
    }
    if (result.length === countBeforePass) {
      break;
    }
  }

  return result;
}

function showScreen(screen) {
  [titleScreen, genreScreen, quizScreen, resultScreen, reviewScreen].forEach((item) => {
    item.classList.toggle("is-active", item === screen);
  });
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function isQuizInProgress() {
  return quizScreen.classList.contains("is-active") && questions.length > 0;
}

function armQuizHistoryGuard() {
  if (!window.history?.pushState || quizHistoryGuardArmed) {
    return;
  }
  window.history.pushState({ quizGuard: true }, "", window.location.href);
  quizHistoryGuardArmed = true;
}

function disarmQuizHistoryGuard() {
  quizHistoryGuardArmed = false;
}

function showLeaveQuizModal() {
  leaveQuizModal.hidden = false;
}

function closeLeaveQuizModal() {
  leaveQuizModal.hidden = true;
}

function requestHomeNavigation() {
  if (isQuizInProgress()) {
    showLeaveQuizModal();
    return;
  }
  goHome();
}

async function ensureQuizData() {
  try {
    await loadQuizData();
  } catch (error) {
    console.warn(error);
    quizDataLoaded = true;
  }
}

function isEndlessUnlocked() {
  return true;
}

function setEndlessUnlocked() {
  updateHomeState();
}

function updateHomeState() {
  endlessButton.disabled = false;
  unlockText.textContent = "";
}

function setBusy(isBusy) {
  [practiceButton, miniExamButton, examButton, endlessButton, retryButton].forEach((button) => {
    button.disabled = isBusy;
  });
}

async function showGenreMenu(mode = "practice") {
  genreMenuMode = mode;
  const isMiniExam = mode === "miniExam";
  genreMenuKicker.textContent = isMiniExam ? "Mini Exam" : "Practice";
  genreMenuTitle.textContent = isMiniExam ? "本番小テスト" : "ジャンル別練習";
  genreMenuLead.textContent = isMiniExam
    ? `選んだジャンルから${MINI_EXAM_QUESTION_COUNT}問をランダム出題します。${MINI_EXAM_PASS_SCORE}問以上正解で本番小テスト合格者に登録できます。`
    : "選んだジャンルの問題をランダム順で全問出題します。";
  setBusy(true);
  await ensureQuizData();
  const groups = makeGeneratedQuestionsByGenre();
  genreList.replaceChildren();
  const genreOrder = [...EXAM_GENRE_PLAN.map(([genre]) => genre), ...Object.keys(groups).sort()];
  [...new Set(genreOrder)]
    .filter((genre) => groups[genre]?.length > 0)
    .forEach((genre) => {
      const button = document.createElement("button");
      button.className = "secondary-button";
      button.type = "button";
      renderGenreThumbnailButton(button, genre, groups[genre]);
      button.addEventListener("click", () => {
        if (genreMenuMode === "miniExam") {
          showStartModeModal({
            type: "miniExam",
            label: `${genre} 本番小テスト`,
            count: MINI_EXAM_QUESTION_COUNT,
            genre,
          });
          return;
        }
        const practiceMode = { type: "practice", label: `${genre} 練習`, count: groups[genre].length, genre };
        if (isSpoilerStoryGenre(genre)) {
          showStartModeModal(practiceMode);
          return;
        }
        startGame(practiceMode);
      });
      genreList.append(button);
    });
  setBusy(false);
  showScreen(genreScreen);
}

function normalizeEntryMode(value) {
  return value === "miniExam" || value === "mini" ? "miniExam" : "practice";
}

function preferredSeoEntryGenre(entry, groups) {
  const candidates = SEO_ENTRY_GENRES[entry] || [];
  return candidates.find((genre) => groups[genre]?.length > 0) || "";
}

async function openSeoEntryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const mode = normalizeEntryMode(params.get("mode"));
  const requestedGenre = params.get("genre") || "";
  const entry = params.get("entry") || "";
  if (!requestedGenre && !entry) return;

  setBusy(true);
  await ensureQuizData();
  const groups = makeGeneratedQuestionsByGenre();
  const genre = groups[requestedGenre]?.length > 0 ? requestedGenre : preferredSeoEntryGenre(entry, groups);
  setBusy(false);
  if (!genre) return;

  const targetMode =
    mode === "miniExam"
      ? {
          type: "miniExam",
          label: `${genre} 本番小テスト`,
          count: MINI_EXAM_QUESTION_COUNT,
          genre,
        }
      : {
          type: "practice",
          label: `${genre} 練習`,
          count: groups[genre].length,
          genre,
        };

  if (targetMode.type === "miniExam" || isSpoilerStoryGenre(genre)) {
    showStartModeModal(targetMode);
    return;
  }
  startGame(targetMode);
}

async function startGame(mode = currentMode) {
  const now = Date.now();
  if (lastQuizStartAt && now - lastQuizStartAt < 5000) {
    return;
  }
  lastQuizStartAt = now;
  gameStartedAt = now;
  currentSessionId = randomId("session");
  currentClientId = getClientId();
  currentMode = mode;
  currentGenre = mode.genre || "";
  setBusy(true);
  stopTimer();

  await ensureQuizData();
  const questionCount = mode.type === "endless" ? 300 : mode.count;
  questions = prepareQuestions({ count: questionCount, genre: mode.genre, endless: mode.type === "endless" });
  trackAnalyticsEvent(quizStartEventName(mode), {
    quiz_mode: quizAnalyticsMode(mode),
    genre: mode.genre || "",
    question_count: mode.type === "endless" ? null : questions.length,
  });
  currentIndex = 0;
  score = 0;
  answered = false;
  answerLog = [];
  scoreText.textContent = "0";
  rankingSubmitForm.hidden = true;
  rankingSubmitMessage.textContent = "";
  showQuestion();
  showScreen(quizScreen);
  armQuizHistoryGuard();
  setBusy(false);
}

function clearAudio() {
  titleCallAudio.pause();
  titleCallAudio.removeAttribute("src");
  titleCallAudio.load();
  audioPanel.hidden = true;
  audioButton.textContent = "タイトルコールを再生";
  audioSources = [];
  audioSourceIndex = 0;
}

function setAudioSources(sources) {
  audioSources = Array.isArray(sources) ? [...new Set(sources)] : [sources];
  audioSourceIndex = 0;
  titleCallAudio.volume = TITLE_CALL_VOLUME;
  titleCallAudio.src = audioSources[audioSourceIndex];
}

async function playTitleCallAudio() {
  for (let index = audioSourceIndex; index < audioSources.length; index += 1) {
    audioSourceIndex = index;
    titleCallAudio.pause();
    titleCallAudio.src = audioSources[audioSourceIndex];
    titleCallAudio.load();
    titleCallAudio.currentTime = 0;
    titleCallAudio.volume = TITLE_CALL_VOLUME;
    try {
      await titleCallAudio.play();
      return true;
    } catch (error) {
      console.warn("title call audio failed", audioSources[audioSourceIndex], error);
    }
  }
  audioSourceIndex = 0;
  return false;
}

function endlessTimeLimit() {
  return Math.max(ENDLESS_MIN_SECONDS, ENDLESS_INITIAL_SECONDS - Math.floor(score / 5) * 5);
}

function currentTimeLimit() {
  if (currentMode.type === "endless") {
    return endlessTimeLimit();
  }
  return null;
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  timerEndsAt = 0;
}

function formatTimerSeconds(seconds) {
  return Math.max(0, seconds).toFixed(1);
}

function startTimer() {
  stopTimer();
  timerPill.hidden = true;
  const limit = currentTimeLimit();
  if (!limit) {
    return;
  }

  timeRemaining = limit;
  timerEndsAt = performance.now() + limit * 1000;
  timerText.textContent = formatTimerSeconds(timeRemaining);
  timerPill.hidden = false;
  timerId = setInterval(() => {
    timeRemaining = (timerEndsAt - performance.now()) / 1000;
    timerText.textContent = formatTimerSeconds(timeRemaining);
    if (timeRemaining <= 0) {
      handleTimeoutAnswer();
    }
  }, 100);
}

function updateQuizStatusPills() {
  if (currentMode.type !== "endless") {
    timerPill.hidden = true;
  }
}

function ensureEndlessQuestionBuffer() {
  if (currentMode.type !== "endless") return;
  if (currentIndex < questions.length - 5) return;
  questions.push(...prepareQuestions({ count: 80, endless: true }));
}

function continueEndlessAfterCorrect() {
  window.setTimeout(() => {
    if (currentMode.type !== "endless" || !answered) return;
    clearAudio();
    currentIndex += 1;
    ensureEndlessQuestionBuffer();
    showQuestion();
  }, 450);
}

function finishEndlessAfterMiss() {
  window.setTimeout(() => {
    if (currentMode.type === "endless") {
      showResult();
    }
  }, 900);
}

function advanceAfterAnswerPopup(isCorrect) {
  answerPopupModal.hidden = true;
  if (currentMode.type === "endless") {
    if (isCorrect) {
      clearAudio();
      currentIndex += 1;
      ensureEndlessQuestionBuffer();
      showQuestion();
    } else {
      showResult();
    }
    return;
  }

  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    showQuestion();
    return;
  }

  showResult();
}

function showAnswerPopup({ isCorrect, correctText, image, imageAlt }) {
  preloadUpcomingQuestionAssets(currentIndex + 1, 4);
  answerPopupKicker.textContent = isCorrect ? "Correct" : "Incorrect";
  answerPopupTitle.textContent = isCorrect ? "正解です" : "不正解";
  answerPopupText.textContent = isCorrect
    ? `正解です。正解は「${displayStudentName(correctText)}」です。`
    : `不正解。正解は「${displayStudentName(correctText)}」です。`;

  if (image) {
    answerPopupImage.src = image;
    answerPopupImage.alt = imageAlt || displayStudentName(correctText);
    answerPopupFigure.hidden = false;
  } else {
    answerPopupImage.removeAttribute("src");
    answerPopupImage.alt = "";
    answerPopupFigure.hidden = true;
  }

  answerPopupAdvanceHandler = () => {
    const handler = answerPopupAdvanceHandler;
    answerPopupAdvanceHandler = null;
    if (handler) {
      advanceAfterAnswerPopup(isCorrect);
    }
  };
  answerPopupNextButton.onclick = answerPopupAdvanceHandler;
  answerPopupModal.hidden = false;
}

function handleTimeoutAnswer() {
  if (answered) return;
  stopTimer();

  const current = questions[currentIndex];
  const correctAnswer = current.answers?.find((answer) => answer.isCorrect);
  const correctText = current.correctText || correctAnswer?.text || "";
  answered = true;
  const elapsedSeconds = answerElapsedSeconds();
  feedbackText.textContent = `時間切れです。正解は「${correctText}」です。`;

  answerLog.push({
    genre: current.genre,
    question: current.question,
    selected: "時間切れ",
    correct: correctText,
    isCorrect: false,
    image: current.image,
    imageAlt: current.imageAlt,
    imageClass: current.imageClass,
    missingMessage: current.missingMessage,
    audio: current.audio,
    skillCards: current.skillCards,
    answerPopupImage: current.answerPopupImage,
    answerPopupImageAlt: current.answerPopupImageAlt,
    answerTimeSec: elapsedSeconds,
    timingCheck: current.inputMode === "text",
  });

  [...answerList.querySelectorAll("button")].forEach((button) => {
    button.disabled = true;
  });
  [...answerList.querySelectorAll("input")].forEach((input) => {
    input.disabled = true;
    input.classList.add("is-wrong");
  });

  if (currentMode.type === "endless") {
    if (current.answerPopupImage) {
      showAnswerPopup({
        isCorrect: false,
        correctText,
        image: current.answerPopupImage,
        imageAlt: current.answerPopupImageAlt,
      });
      return;
    }
    finishEndlessAfterMiss();
  } else {
    if (current.answerPopupImage) {
      showAnswerPopup({
        isCorrect: false,
        correctText,
        image: current.answerPopupImage,
        imageAlt: current.answerPopupImageAlt,
      });
      return;
    }
    nextButton.disabled = false;
  }
}

function showQuestion() {
  const current = questions[currentIndex];
  answered = false;
  questionStartedAt = performance.now();
  preloadUpcomingQuestionAssets(currentIndex + 1, 3);
  if (currentMode.type === "endless") {
    questionCount.textContent = `連続 ${score} 問`;
    progressBar.style.width = `${Math.min(100, ((score % 10) + 1) * 10)}%`;
  } else if (currentMode.type === "exam") {
    questionCount.textContent = `現在${questions.length}問中 ${currentIndex + 1}問目`;
    progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  } else if (currentMode.type === "miniExam") {
    questionCount.textContent = `現在${questions.length}問中 ${currentIndex + 1}問目`;
    progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  } else {
    questionCount.textContent = `現在${questions.length}問中 ${currentIndex + 1}問目`;
    progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  }
  updateQuizStatusPills();
  genreText.textContent = current.genre;
  feedbackText.textContent = "";
  nextButton.disabled = true;
  nextButton.hidden = false;
  nextButton.textContent = currentIndex === questions.length - 1 ? "結果を見る" : "次へ";
  if (currentMode.type === "endless") {
    nextButton.hidden = true;
  }
  answerList.replaceChildren();
  answerList.classList.remove("is-input");
  answerList.classList.remove("has-image-answers");

  questionMedia.classList.remove("is-missing");
  questionMedia.dataset.missingMessage = current.missingMessage || "画像を読み込めません";
  if (current.image) {
    questionImage.src = current.image;
    questionImage.alt = current.imageAlt || `${current.genre}の問題画像`;
    questionImage.className = current.imageClass || "";
    questionMedia.hidden = false;
  } else {
    questionImage.removeAttribute("src");
    questionImage.alt = "";
    questionImage.className = "";
    questionMedia.hidden = true;
  }

  clearAudio();
  if (current.audio) {
    setAudioSources(current.audio);
    audioPanel.hidden = false;
  }

  questionText.replaceChildren();
  const promptLine = document.createElement("p");
  promptLine.className = "question-prompt";
  promptLine.textContent = current.question;
  questionText.append(promptLine);
  if (current.performance) {
    questionText.append(renderPerformanceCard(current.performance));
  }
  if (current.skillCards) {
    questionText.append(renderCombatSkillPanel(current.skillCards));
  }

  if (current.inputMode === "text") {
    const form = document.createElement("form");
    form.className = "answer-input-form";

    const hint = document.createElement("p");
    hint.className = "answer-input-hint";
    hint.textContent = inputAnswerHint(current);

    const input = document.createElement("input");
    input.className = "answer-input";
    input.type = "text";
    input.autocomplete = "off";
    input.placeholder = "生徒名を入力";

    const submitButton = document.createElement("button");
    submitButton.className = "primary-button";
    submitButton.type = "submit";
    submitButton.textContent = "回答";

    form.append(hint, input, submitButton);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      chooseTextAnswer(input.value, input, submitButton);
    });
    answerList.classList.add("is-input");
    answerList.append(form);
    input.focus();
    startTimer();
    return;
  }

  answerList.classList.remove("is-input");
  answerList.classList.toggle("has-image-answers", current.answers.some((answer) => answer.image));
  current.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    if (answer.image) {
      const image = document.createElement("img");
      image.src = answer.image;
      image.alt = answer.imageAlt || answer.text;
      image.className = answer.imageClass || "";
      const label = document.createElement("span");
      label.textContent = answer.text;
      button.append(image, label);
    } else {
      button.textContent = answer.text;
    }
    button.addEventListener("click", () => chooseAnswer(button, answer));
    answerList.append(button);
  });
  startTimer();
}

function chooseTextAnswer(value, input, submitButton) {
  if (answered) return;

  stopTimer();
  const current = questions[currentIndex];
  const acceptedAnswers = current.acceptedAnswers || [current.correctText];
  const normalizedValue = normalizeTextAnswer(value);
  const isCorrect = acceptedAnswers.some(
    (answer) => normalizeTextAnswer(answer) === normalizedValue,
  );
  answered = true;
  const elapsedSeconds = answerElapsedSeconds();

  if (isCorrect) {
    score += 1;
    scoreText.textContent = String(score);
    if (current.genre === "タイトルコール" && studentVariant(current.correctText)) {
      feedbackText.textContent = `正解です。「${displayStudentName(current.correctText)}」のタイトルコールでした。`;
    } else {
      feedbackText.textContent = "正解です。";
    }
    input.classList.add("is-correct");
  } else {
    feedbackText.textContent = `不正解。正解は「${displayStudentName(current.correctText)}」です。`;
    input.classList.add("is-wrong");
  }

  answerLog.push({
    genre: current.genre,
    question: current.question,
    selected: value || "未入力",
    correct: current.correctText,
    isCorrect,
    image: current.image,
    imageAlt: current.imageAlt,
    imageClass: current.imageClass,
    missingMessage: current.missingMessage,
    audio: current.audio,
    skillCards: current.skillCards,
    answerPopupImage: current.answerPopupImage,
    answerPopupImageAlt: current.answerPopupImageAlt,
    answerTimeSec: elapsedSeconds,
    timingCheck: true,
  });

  input.disabled = true;
  submitButton.disabled = true;

  if (current.answerPopupImage) {
    showAnswerPopup({
      isCorrect,
      correctText: current.correctText,
      image: current.answerPopupImage,
      imageAlt: current.answerPopupImageAlt,
    });
    return;
  }

  if (currentMode.type === "endless") {
    if (isCorrect) {
      continueEndlessAfterCorrect();
    } else {
      finishEndlessAfterMiss();
    }
    return;
  }

  nextButton.disabled = false;
}

function chooseAnswer(selectedButton, selectedAnswer) {
  if (answered) return;

  stopTimer();
  const current = questions[currentIndex];
  const correctAnswer = current.answers.find((answer) => answer.isCorrect);
  answered = true;
  const elapsedSeconds = answerElapsedSeconds();

  if (selectedAnswer.isCorrect) {
    score += 1;
    scoreText.textContent = String(score);
    feedbackText.textContent = "正解です。";
  } else {
    feedbackText.textContent = `不正解。正解は「${correctAnswer.text}」です。`;
  }

  answerLog.push({
    genre: current.genre,
    question: current.question,
    selected: selectedAnswer.text,
    correct: correctAnswer.text,
    isCorrect: selectedAnswer.isCorrect,
    image: current.image,
    imageAlt: current.imageAlt,
    imageClass: current.imageClass,
    missingMessage: current.missingMessage,
    audio: current.audio,
    skillCards: current.skillCards,
    answerPopupImage: current.answerPopupImage,
    answerPopupImageAlt: current.answerPopupImageAlt,
    answerTimeSec: elapsedSeconds,
    timingCheck: false,
  });

  [...answerList.children].forEach((button) => {
    const answer = current.answers.find((item) => item.text === button.textContent || item.text === button.querySelector("span")?.textContent);
    button.disabled = true;
    if (answer.isCorrect) {
      button.classList.add("is-correct");
    } else if (button === selectedButton) {
      button.classList.add("is-wrong");
    }
  });

  if (current.answerPopupImage) {
    showAnswerPopup({
      isCorrect: selectedAnswer.isCorrect,
      correctText: correctAnswer.text,
      image: current.answerPopupImage,
      imageAlt: current.answerPopupImageAlt,
    });
    return;
  }

  if (currentMode.type === "endless") {
    if (selectedAnswer.isCorrect) {
      continueEndlessAfterCorrect();
    } else {
      finishEndlessAfterMiss();
    }
    return;
  }

  nextButton.disabled = false;
}

function nextQuestion() {
  if (!answered) return;

  stopTimer();
  clearAudio();
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    showQuestion();
    return;
  }

  showResult();
}

function siteShareUrl() {
  return window.location.origin && window.location.origin !== "null"
    ? window.location.origin
    : "https://blue-archive-quiz.pages.dev/";
}

function resultShareModeLabel() {
  if (currentMode.type === "endless") {
    return "ブルーアーカイブ エンドレスモード";
  }
  if (currentMode.type === "miniExam") {
    return currentMode.genre
      ? `ブルーアーカイブ 本番小テスト（${currentMode.genre}）`
      : "ブルーアーカイブ 本番小テスト";
  }
  if (currentMode.type === "exam") {
    return "ブルーアーカイブ 本番50問";
  }
  return currentMode.genre
    ? `ブルーアーカイブ ${currentMode.genre}`
    : "ブルーアーカイブ クイズ・テスト";
}

function buildResultShareText() {
  const url = siteShareUrl();
  const modeLabel = resultShareModeLabel();
  if (currentMode.type === "endless") {
    return `${modeLabel}\n${score}問連続正解しました！\n${url}\n#ブルアカ #ブルーアーカイブ #ブルアカクイズ`;
  }

  return `${modeLabel}\n${score}/${questions.length}点でした！\n${url}\n#ブルアカ #ブルーアーカイブ #ブルアカクイズ`;
}

function resultStudentIconUrl(studentId) {
  return `https://schaledb.com/images/student/icon/${studentId}.webp`;
}

function quizIconPath(relativePath) {
  return `${QUIZ_ICON_BASE_PATH}/${relativePath}`;
}

function createThumbnailButtonImage(relativePath, alt = "") {
  const image = document.createElement("img");
  image.className = "thumbnail-button__image";
  image.src = quizIconPath(relativePath);
  image.alt = alt;
  image.loading = "lazy";
  return image;
}

function createThumbnailText(lines) {
  const text = document.createElement("span");
  text.className = "thumbnail-button__text";
  for (const line of lines) {
    const span = document.createElement("span");
    span.textContent = line.text;
    if (line.className) {
      span.className = line.className;
    }
    text.append(span);
  }
  return text;
}

function setupTitleThumbnails() {
  [
    [practiceButton, TITLE_THUMBNAILS.practiceButton, [{ text: "ジャンル別練習" }]],
    [miniExamButton, TITLE_THUMBNAILS.miniExamButton, [{ text: "本番小テスト" }]],
    [examButton, TITLE_THUMBNAILS.examButton, [{ text: "本番50問" }]],
    [endlessButton, TITLE_THUMBNAILS.endlessButton, [{ text: "エンドレスモード" }]],
    [examPassersButton, TITLE_THUMBNAILS.examPassersButton, [{ text: "本番合格者" }]],
    [rankingButton, TITLE_THUMBNAILS.rankingButton, [{ text: "エンドレスモード" }, { text: "ランキング" }]],
  ].forEach(([button, thumbnail, lines]) => {
    button.classList.add("thumbnail-button");
    button.replaceChildren(createThumbnailButtonImage(thumbnail, lines.map((line) => line.text).join(" ")), createThumbnailText(lines));
  });
}

function renderGenreThumbnailButton(button, genre, questionsForGenre) {
  button.classList.add("thumbnail-button", "genre-button");
  const thumbnail = GENRE_THUMBNAILS[genre];
  button.replaceChildren(
    thumbnail ? createThumbnailButtonImage(thumbnail, genre) : createThumbnailText([{ text: genre }]),
    createThumbnailText([
      { text: genre, className: "genre-button__title" },
      {
        text: `${formatAnswerModeLabel(questionsForGenre)} / 収録${questionsForGenre.length}問`,
        className: "genre-button__meta",
      },
    ]),
  );
}

const RESULT_COMPANION_AFFILIATIONS = {
  10002: "美食研究会",
  10003: "補習授業部",
  10015: "ゲーム開発部",
  10016: "ゲーム開発部",
  10018: "ゲーム開発部",
  10020: "補習授業部",
  10052: "セミナー",
  13008: "アビドス対策委員会",
  13010: "セミナー",
  13011: "ゲーム開発部",
  20020: "ヴェリタス",
  23007: "補習授業部",
};

function resultStudentAffiliation(studentId) {
  if (RESULT_COMPANION_AFFILIATIONS[studentId]) {
    return RESULT_COMPANION_AFFILIATIONS[studentId];
  }
  const student = students.find((item) => item.id === studentId);
  const introLead = String(student?.profileIntro || "").split(/\n+/)[0] || "";
  const quotedClub = introLead.match(/「([^」]+)」/);
  if (quotedClub) {
    return quotedClub[1];
  }
  const afterSchool = introLead.match(/所属、(?:.+?、)?(.+?)(?:の|で|、|。)/);
  if (afterSchool) {
    return afterSchool[1]
      .replace(/^(?:生徒会|部活)\s*/, "")
      .replace(/^(?:現|元)/, "")
      .trim();
  }
  const schoolOnly = introLead.match(/^(.+?)所属/);
  return schoolOnly?.[1] || "";
}

function pickResultProfile(profiles) {
  return profiles[Math.floor(Math.random() * profiles.length)];
}

function resultRankProfile() {
  if (currentMode.type === "endless") {
    if (score >= 100) {
      return {
        student: "アリス",
        studentId: 10015,
        quote: "伝説級のスコアです！勇者の名を刻みます！",
      };
    }
    if (score >= 75) {
      return {
        student: "ユズ",
        studentId: 10018,
        quote: "高難度モードでも通用する記録です。",
      };
    }
    if (score >= 50) {
      return {
        student: "ヒマリ",
        studentId: 20020,
        quote: "凡人には到達しがたい領域ですね。",
      };
    }
    if (score >= 30) {
      return {
        student: "ハナコ",
        studentId: 23007,
        quote: "ふふっ、見事な知識量ですね。",
      };
    }
    if (score >= 20) {
      return {
        student: "ノア",
        studentId: 10052,
        quote: "ここまでの記録、かなり優秀です。",
      };
    }
    if (score >= 10) {
      return {
        student: "ユウカ",
        studentId: 13010,
        quote: "安定した成績です。この調子で続けましょう。",
      };
    }
    if (score >= 5) {
      return {
        student: "ミドリ",
        studentId: 10016,
        quote: "いい感じです。集中できています。",
      };
    }
    if (score >= 1) {
      return {
        student: "アリス",
        studentId: 10015,
        quote: "冒険は始まったばかりです！",
      };
    }
    return {
      student: "モモイ",
      studentId: 13011,
      quote: "えっ、開幕ゲームオーバー！？",
    };
  }

  const total = Math.max(1, questions.length);
  const rate = score / total;
  if (score === total) {
    return pickResultProfile([
      {
        student: "ユズ",
        studentId: 10018,
        quote: "完全クリア……これは最適解です。",
      },
      {
        student: "ヒマリ",
        studentId: 20020,
        quote: "当然ながら、極めて優秀な結果ですね。",
      },
    ]);
  }
  if (rate >= 0.95) {
    return {
      student: "ミドリ",
      studentId: 10016,
      quote: "すごいです。あと少しで満点でした。",
    };
  }
  if (rate >= 0.9) {
    return {
      student: "ユウカ",
      studentId: 13010,
      quote: "合格ラインを大きく超えています。よくできました。",
    };
  }
  if (rate >= 0.85) {
    return pickResultProfile([
      {
        student: "アリス",
        studentId: 10015,
        quote: "試練突破です！勇者は合格しました！",
      },
      {
        student: "モモイ",
        studentId: 13011,
        quote: "セーフ！勝てばよかろうなのだ！",
      },
    ]);
  }
  if (rate >= 0.7) {
    return pickResultProfile([
      {
        student: "ノア",
        studentId: 16011,
        quote: "記録上は惜しい結果です。復習で届きますよ。",
      },
      {
        student: "ミドリ",
        studentId: 10016,
        quote: "もう少し落ち着けば、合格できそうです。",
      },
    ]);
  }
  if (rate >= 0.5) {
    return pickResultProfile([
      {
        student: "コハル",
        studentId: 10020,
        quote: "ま、まだ補習で取り返せるから！",
      },
      {
        student: "ヒフミ",
        studentId: 10002,
        quote: "大丈夫です、次は一緒に頑張りましょう。",
      },
    ]);
  }
  if (rate > 0) {
    return pickResultProfile([
      {
        student: "モモイ",
        studentId: 13011,
        quote: "ぐぬぬ……これは再挑戦イベントだ！",
      },
      {
        student: "セリカ",
        studentId: 13008,
        quote: "ちょっと！ちゃんと復習しなさいよ！",
      },
    ]);
  }
  return {
    student: "セリカ",
    studentId: 13008,
    quote: "ちょっと！ちゃんと復習しなさいよ！",
  };
}

function updateResultCompanion() {
  const profile = resultRankProfile();
  resultCompanionName.textContent = profile.student;
  resultCompanionAffiliation.textContent = resultStudentAffiliation(profile.studentId);
  resultCompanionQuote.textContent = profile.quote;
  resultCompanionImage.src = resultStudentIconUrl(profile.studentId);
  resultCompanionImage.alt = profile.student;
  resultCompanion.hidden = false;
}

function updateShareResult() {
  currentShareText = buildResultShareText();
  shareMessage.hidden = true;
  shareMessage.textContent = "";
}

function drawCenteredText(context, text, x, y, maxWidth, lineHeight) {
  const normalized = String(text || "");
  const lines = [];
  let currentLine = "";
  for (const char of normalized) {
    const nextLine = `${currentLine}${char}`;
    if (context.measureText(nextLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = nextLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
  return lines.length;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
}

function loadImageElement(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function roundedRectPath(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

async function createResultShareImageFile() {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  const companionProfile = resultRankProfile();
  const companionIcon = await loadImageElement(resultStudentIconUrl(companionProfile.studentId));
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 390;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 600, 390);

  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillStyle = "#2f8dff";
  context.font = "900 12px 'Yu Gothic', 'Noto Sans JP', sans-serif";
  context.fillText("RESULT", 300, 16);

  context.fillStyle = "#172238";
  context.font = "900 40px 'Yu Gothic', 'Noto Sans JP', sans-serif";
  context.fillText(resultTitle.textContent || "結果発表", 300, 65);

  context.fillStyle = "#2f8dff";
  context.font = "950 70px 'Yu Gothic', 'Noto Sans JP', sans-serif";
  context.fillText(resultScore.textContent || "", 300, 155);

  context.fillStyle = "#5f6f8b";
  context.font = "800 15px 'Yu Gothic', 'Noto Sans JP', sans-serif";
  context.fillText(resultMessage.textContent || resultShareModeLabel(), 300, 230);

  roundedRectPath(context, 20, 274, 520, 105, 7);
  context.fillStyle = "#334158";
  context.fill();

  roundedRectPath(context, 36, 288, 76, 76, 8);
  const iconBackground = context.createLinearGradient(236, 500, 304, 568);
  iconBackground.addColorStop(0, "#dff3ff");
  iconBackground.addColorStop(1, "#ffffff");
  context.fillStyle = iconBackground;
  context.fill();
  if (companionIcon) {
    context.save();
    roundedRectPath(context, 36, 288, 76, 76, 8);
    context.clip();
    context.drawImage(companionIcon, 36, 288, 76, 76);
    context.restore();
  }

  context.textAlign = "left";
  context.fillStyle = "#ffffff";
  context.font = "900 15px 'Yu Gothic', 'Noto Sans JP', sans-serif";
  context.fillText(companionProfile.student, 136, 307);
  context.fillStyle = "#8fc5ff";
  context.font = "800 10px 'Yu Gothic', 'Noto Sans JP', sans-serif";
  context.fillText(resultStudentAffiliation(companionProfile.studentId), 190, 308);

  context.strokeStyle = "rgba(255, 255, 255, 0.28)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(136, 322);
  context.lineTo(522, 322);
  context.stroke();

  context.fillStyle = "#ffffff";
  context.font = "900 18px 'Yu Gothic', 'Noto Sans JP', sans-serif";
  context.fillText(companionProfile.quote, 136, 348);

  const blob = await canvasToBlob(canvas);
  return blob ? new File([blob], "blue-archive-quiz-result.png", { type: "image/png" }) : null;
}

async function shareResult() {
  const text = currentShareText || buildResultShareText();
  trackAnalyticsEvent("share_result", {
    quiz_mode: quizAnalyticsMode(currentMode),
    genre: currentMode.genre || "",
    score,
    question_count: currentMode.type === "endless" ? null : questions.length,
    share_method: navigator.share ? "native" : "x_fallback",
  });
  const shareData = {
    title: "ブルアカ クイズ・テスト",
    text,
  };

  try {
    if (navigator.share) {
      const imageFile = await createResultShareImageFile();
      if (imageFile && navigator.canShare?.({ files: [imageFile] })) {
        shareData.files = [imageFile];
      }
      await navigator.share(shareData);
      if (shareData.files?.length) {
        try {
          await navigator.clipboard.writeText(text);
          shareMessage.textContent = "共有文をコピーしました。画像だけ共有された場合はチャット欄に貼り付けてください。";
          shareMessage.hidden = false;
        } catch {
          shareMessage.hidden = true;
          shareMessage.textContent = "";
        }
      }
      return;
    }
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    if (error?.name === "AbortError") {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      shareMessage.textContent = "共有文をコピーしました。";
    } catch {
      shareMessage.textContent = "共有に失敗しました。共有文をコピーできる環境で再度お試しください。";
    }
    shareMessage.hidden = false;
  }
}

async function shareResultToX() {
  const text = currentShareText || buildResultShareText();
  trackAnalyticsEvent("share_result", {
    quiz_mode: quizAnalyticsMode(currentMode),
    genre: currentMode.genre || "",
    score,
    question_count: currentMode.type === "endless" ? null : questions.length,
    share_method: "x",
  });

  try {
    if (navigator.share) {
      const imageFile = await createResultShareImageFile();
      if (imageFile && navigator.canShare?.({ files: [imageFile] })) {
        await navigator.share({
          title: "ブルアカ クイズ・テスト",
          text,
          files: [imageFile],
        });
        try {
          await navigator.clipboard.writeText(text);
          shareMessage.textContent = "共有文をコピーしました。Xで画像だけが添付された場合は、投稿文へ貼り付けてください。";
          shareMessage.hidden = false;
        } catch {
          shareMessage.hidden = true;
          shareMessage.textContent = "";
        }
        return;
      }
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      return;
    }
    console.warn(error);
  }

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(xUrl, "_blank", "noopener,noreferrer");
  shareMessage.textContent = "ブラウザ版Xでは生成画像を自動添付できないため、テキスト共有で開きました。画像付きにする場合は「テスト結果を共有する」からXアプリを選んでください。";
  shareMessage.hidden = false;
}

function showResult() {
  stopTimer();
  clearAudio();
  rankingSubmitForm.hidden = true;
  rankingSubmitMessage.textContent = "";
  currentSubmitTarget = null;
  trackAnalyticsEvent("finish_exam", {
    quiz_mode: quizAnalyticsMode(currentMode),
    genre: currentMode.genre || "",
    score,
    question_count: currentMode.type === "endless" ? null : questions.length,
  });

  if (currentMode.type === "endless") {
    document.querySelector(".result-medal").textContent = "∞";
    resultTitle.textContent = "エンドレス終了";
    resultScore.textContent = `${score} 問連続正解`;
    resultMessage.textContent = score > 0
      ? "順位を確認中です..."
      : "1問以上正解するとランキングに登録できます。";
    rankingSubmitForm.hidden = score <= 0;
    rankingSubmitForm.querySelector("label").textContent = "ランキング名";
    playerNameInput.value = localStorage.getItem("blueArchivePlayerName") || "";
    currentSubmitTarget = "endless";
    updateResultCompanion();
    updateShareResult();
    showScreen(resultScreen);
    if (score > 0) {
      estimateEndlessRanks(score)
        .then((ranks) => {
          const allText = ranks.all <= 10000 ? `総合上位${ranks.all}位` : "総合保存範囲外";
          const monthlyText = ranks.monthly <= 1000 ? `月間上位${ranks.monthly}位` : "月間保存範囲外";
          resultMessage.textContent = `${allText} / ${monthlyText}です！スコアを保存できます。`;
        })
        .catch(() => {
          resultMessage.textContent = "スコアを保存できます。総合は10,000人、月間は1,000人まで保存されます。";
        });
    }
    return;
  }

  const rate = score / questions.length;
  let rank = "C";
  let title = "まだ伸びしろあり";
  let message = "解答一覧で苦手ジャンルを確認できます。";

  if (rate >= 0.9) {
    rank = "S";
    title = "キヴォトス上級者";
    message = "かなり幅広く覚えています。";
  } else if (rate >= 0.7) {
    rank = "A";
    title = "頼れる先生";
    message = "全体的に安定しています。";
  } else if (rate >= 0.45) {
    rank = "B";
    title = "あと少し";
    message = "画像・音声系に慣れると伸びそうです。";
  }

  if (currentMode.type === "exam" && score >= EXAM_PASS_SCORE) {
    title = "本番合格";
    message = `${EXAM_PASS_SCORE}点以上を達成しました。合格者一覧に登録できます。`;
    rankingSubmitForm.hidden = false;
    rankingSubmitForm.querySelector("label").textContent = "合格者名";
    playerNameInput.value = localStorage.getItem("blueArchivePlayerName") || "";
    currentSubmitTarget = "exam";
    trackAnalyticsEvent("pass_exam", {
      quiz_mode: "full_exam",
      score,
      question_count: questions.length,
      pass_score: EXAM_PASS_SCORE,
    });
  }

  if (currentMode.type === "miniExam" && score >= MINI_EXAM_PASS_SCORE) {
    title = `${currentMode.genre} 小テスト合格`;
    message = `${currentMode.genre}で${MINI_EXAM_PASS_SCORE}点以上を達成しました。本番小テスト合格者一覧に登録できます。`;
    rankingSubmitForm.hidden = false;
    rankingSubmitForm.querySelector("label").textContent = "合格者名";
    playerNameInput.value = localStorage.getItem("blueArchivePlayerName") || "";
    currentSubmitTarget = "miniExam";
    trackAnalyticsEvent("pass_exam", {
      quiz_mode: "mini_exam",
      genre: currentMode.genre || "",
      score,
      question_count: questions.length,
      pass_score: MINI_EXAM_PASS_SCORE,
    });
  } else if (currentMode.type === "miniExam") {
    title = `${currentMode.genre} 小テスト結果`;
  }

  document.querySelector(".result-medal").textContent = rank;
  resultTitle.textContent = title;
  resultScore.textContent = `${score} / ${questions.length}`;
  resultMessage.textContent = message;
  updateResultCompanion();
  updateShareResult();
  showScreen(resultScreen);
}

function goHome() {
  stopTimer();
  clearAudio();
  closeLeaveQuizModal();
  disarmQuizHistoryGuard();
  questions = [];
  updateHomeState();
  showScreen(titleScreen);
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_CONFIG.anonKey,
    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
    ...extra,
  };
}

function hasSupabaseRankingConfig() {
  return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
}

function currentMonthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function monthStartIso(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}

function nextMonthStartIso(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString();
}

function monthKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-01`;
}

function monthLabel(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function isCurrentMonth(date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function formatExamGenrePlan() {
  return EXAM_GENRE_PLAN.map(([genre, count]) => `${genre}: ${count}問`).join("<br>");
}

async function fetchCount(path) {
  if (!hasSupabaseRankingConfig()) return 0;
  const response = await fetchWithTimeout(`${SUPABASE_CONFIG.url}/rest/v1/${path}`, {
    method: "HEAD",
    headers: supabaseHeaders({
      Prefer: "count=exact",
    }),
  });
  if (!response.ok) {
    throw new Error(`Count fetch failed: ${response.status}`);
  }
  return Number(response.headers.get("content-range")?.split("/")?.[1] || 0);
}

async function estimateEndlessRanks(endlessScore) {
  const encodedScore = encodeURIComponent(`gt.${endlessScore}`);
  const monthlyStart = encodeURIComponent(`gte.${currentMonthStartIso()}`);
  const [allHigher, monthlyHigher] = await Promise.all([
    fetchCount(`endless_rankings?select=id&score=${encodedScore}`),
    fetchCount(`endless_rankings?select=id&score=${encodedScore}&created_at=${monthlyStart}`),
  ]);
  return {
    all: allHigher + 1,
    monthly: monthlyHigher + 1,
  };
}

async function fetchRankings(mode = rankingMode) {
  if (!hasSupabaseRankingConfig()) return [];
  const params = new URLSearchParams({
    select: "player_name,score,created_at",
    order: "score.desc,created_at.asc",
    limit: "100",
  });
  if (mode === "monthly") {
    params.set("created_at", `gte.${currentMonthStartIso()}`);
  }
  const response = await fetchWithTimeout(`${SUPABASE_CONFIG.url}/rest/v1/endless_rankings?${params}`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Ranking fetch failed: ${response.status}`);
  }
  return response.json();
}

async function submitEndlessScore(playerName, endlessScore) {
  if (!hasSupabaseRankingConfig()) {
    throw new Error("Supabase is not configured.");
  }
  const response = await fetchWithTimeout(`${SUPABASE_CONFIG.url}/rest/v1/rpc/submit_endless_score`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      p_player_name: playerName,
      p_score: endlessScore,
      p_answer_times: endlessReviewTimingPayload(endlessScore),
      p_client_id: currentClientId,
      p_session_id: currentSessionId,
      p_started_at: gameStartedAt ? new Date(gameStartedAt).toISOString() : null,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Ranking submit failed: ${response.status}`);
  }
  return response.json();
}

function examPasserTypeLabel(type = examPassersType) {
  return type === "mini" ? "本番小テスト" : "本番50問";
}

function examPasserTypeFilter(type = examPassersType) {
  return type === "mini" ? "mini" : "full";
}

async function fetchExamPassers(date = new Date(), type = examPassersType, genre = examPassersGenre) {
  if (!hasSupabaseRankingConfig()) return [];
  const params = new URLSearchParams({
    select: "player_name,score,genre,created_at",
    order: "score.desc,created_at.asc",
    limit: type === "mini" ? "10000" : "1000",
    exam_type: `eq.${examPasserTypeFilter(type)}`,
  });
  if (type === "mini" && genre) {
    params.set("genre", `eq.${genre}`);
  }
  params.set("created_at", `gte.${monthStartIso(date)}`);
  params.append("created_at", `lt.${nextMonthStartIso(date)}`);
  const response = await fetchWithTimeout(`${SUPABASE_CONFIG.url}/rest/v1/exam_passers?${params}`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Exam passers fetch failed: ${response.status}`);
  }
  return response.json();
}

async function fetchExamPasserCount(date = new Date(), type = examPassersType, genre = examPassersGenre) {
  if (!hasSupabaseRankingConfig()) return 0;
  const params = new URLSearchParams({
    select: "pass_count",
    month_start: `eq.${monthKey(date)}`,
    exam_type: `eq.${examPasserTypeFilter(type)}`,
    genre: `eq.${type === "mini" ? genre : ""}`,
    limit: "1",
  });
  const response = await fetchWithTimeout(`${SUPABASE_CONFIG.url}/rest/v1/exam_passer_monthly_counts?${params}`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Exam passer count fetch failed: ${response.status}`);
  }
  const rows = await response.json();
  return Number(rows[0]?.pass_count || 0);
}

async function fetchPastExamPasserCounts(type = examPassersType, genre = examPassersGenre) {
  if (!hasSupabaseRankingConfig()) return [];
  const currentKey = monthKey(new Date());
  const params = new URLSearchParams({
    select: "month_start,pass_count",
    month_start: `lt.${currentKey}`,
    exam_type: `eq.${examPasserTypeFilter(type)}`,
    genre: `eq.${type === "mini" ? genre : ""}`,
    order: "month_start.desc",
    limit: "11",
  });
  const response = await fetchWithTimeout(`${SUPABASE_CONFIG.url}/rest/v1/exam_passer_monthly_counts?${params}`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Past exam passer count fetch failed: ${response.status}`);
  }
  return response.json();
}

async function submitExamPasser(playerName, examScore, { type = "full", genre = "" } = {}) {
  if (!hasSupabaseRankingConfig()) {
    throw new Error("Supabase is not configured.");
  }
  const response = await fetchWithTimeout(`${SUPABASE_CONFIG.url}/rest/v1/rpc/submit_exam_passer`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      p_player_name: playerName,
      p_score: examScore,
      p_answer_times: [],
      p_client_id: currentClientId,
      p_session_id: currentSessionId,
      p_started_at: gameStartedAt ? new Date(gameStartedAt).toISOString() : null,
      p_exam_type: type,
      p_genre: genre,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Exam passer submit failed: ${response.status}`);
  }
  return response.json();
}

async function submitQuestionSuggestion(payload) {
  if (!hasSupabaseRankingConfig()) {
    throw new Error("Supabase is not configured.");
  }
  const response = await fetchWithTimeout(`${SUPABASE_CONFIG.url}/rest/v1/rpc/submit_question_suggestion`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      p_genre: payload.genre,
      p_answer_format: payload.answerFormat,
      p_question_text: payload.questionText,
      p_answer_text: payload.answerText,
      p_notes: payload.notes,
      p_contact: payload.contact,
      p_client_id: getClientId(),
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Question suggestion submit failed: ${response.status}`);
  }
  return response.json();
}

function suggestionSubmitErrorMessage(error) {
  const message = String(error?.message || "");
  if (message.includes("please wait before sending another suggestion")) {
    return "連続投稿を防ぐため、30秒ほど待ってから再度送信してください。";
  }
  if (message.includes("too many suggestions from this client")) {
    return "1時間あたりの投稿上限に達しました。少し時間を空けてから送信してください。";
  }
  if (message.includes("daily suggestion limit reached")) {
    return "1日あたりの投稿上限に達しました。また明日以降に送信してください。";
  }
  if (message.includes("suggestion form is temporarily busy")) {
    return "現在投稿が集中しています。時間を空けてから再度送信してください。";
  }
  if (message.includes("question suggestion is too short")) {
    return "問題文・作問ネタが短すぎます。内容を少し詳しく書いてください。";
  }
  if (message.includes("question suggestion is too long")) {
    return "問題文・作問ネタが長すぎます。少し短くしてから送信してください。";
  }
  if (message.includes("answer format must be")) {
    return "問題形式は4択または入力形式を選択してください。";
  }
  return "送信できませんでした。Supabaseの投稿用SQLが反映されているか確認してください。";
}

function rankingSubmitErrorMessage(error) {
  const message = String(error?.message || "");
  if (message.includes("player name must be 20 characters or less")) {
    return "登録者名は20文字以内で入力してください。";
  }
  if (message.includes("exam passer name already exists")) {
    return "今月の本番合格者には、同じ名前を登録できません。";
  }
  if (message.includes("monthly exam passer save limit")) {
    return "今月の本番合格者登録は、同じ端末・接続環境から月2回までです。";
  }
  if (message.includes("please wait")) {
    return "連続登録を防ぐため、少し待ってから再度登録してください。";
  }
  if (message.includes("already been saved")) {
    return "このテスト結果はすでに保存されています。もう一度遊ぶと新しく登録できます。";
  }
  if (
    message.includes("answer timing pattern") ||
    message.includes("not eligible for ranking")
  ) {
    return "登録できませんでした。回答が速すぎる、または一定すぎるため自動操作対策により保存対象外になりました。少し間隔を空けて再挑戦してください。";
  }
  return "登録できませんでした。SupabaseのSQLを反映してください。";
}

function formatRankingDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

async function renderRankingList(mode = rankingMode) {
  rankingMode = mode;
  monthlyRankingButton.classList.toggle("is-active", mode === "monthly");
  allRankingButton.classList.toggle("is-active", mode === "all");
  rankingList.innerHTML = '<li class="ranking-row"><span>読み込み中...</span></li>';
  try {
    const rows = await fetchRankings(mode);
    if (!rows.length) {
      rankingList.innerHTML = '<li class="ranking-row"><span>まだランキングがありません</span></li>';
      return;
    }
    rankingList.replaceChildren();
    rows.forEach((row, index) => {
      const item = document.createElement("li");
      item.className = "ranking-row";
      item.innerHTML = `
        <strong>${index + 1}</strong>
        <span>${escapeHtml(row.player_name)}</span>
        <b>${Number(row.score)}問</b>
        <small>${formatRankingDate(row.created_at)}</small>
      `;
      rankingList.append(item);
    });
  } catch (error) {
    console.warn(error);
    rankingList.innerHTML = '<li class="ranking-row"><span>ランキングを取得できませんでした</span></li>';
  }
}

function showRankingModal() {
  rankingModal.hidden = false;
  renderRankingList(rankingMode);
}

function showAdminRequestModal() {
  questionSuggestionMessage.textContent = "";
  adminRequestModal.hidden = false;
}

function closeAdminRequestModal() {
  adminRequestModal.hidden = true;
}

async function ensureExamPasserGenreOptions() {
  await ensureQuizData();
  const groups = makeGeneratedQuestionsByGenre();
  const genres = Object.keys(groups).filter((genre) => groups[genre].length > 0).sort();
  if (!genres.length) return;

  const currentValue = examPassersGenre || genres[0];
  examPassersGenreSelect.replaceChildren();
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    examPassersGenreSelect.append(option);
  });
  examPassersGenre = genres.includes(currentValue) ? currentValue : genres[0];
  examPassersGenreSelect.value = examPassersGenre;
}

async function renderExamPassersList() {
  const currentMonth = new Date();
  if (examPassersType === "mini") {
    await ensureExamPasserGenreOptions();
  }
  const typeLabel = examPasserTypeLabel();
  examPassersTitle.textContent = examPassersView === "current"
    ? `今月の${typeLabel}合格者`
    : `${typeLabel}の過去合格者数`;
  miniExamPassersTypeButton.classList.toggle("is-active", examPassersType === "mini");
  fullExamPassersTypeButton.classList.toggle("is-active", examPassersType === "full");
  examPassersModal.classList.toggle("is-mini-exam-passers", examPassersType === "mini");
  examPassersModal.classList.toggle("is-full-exam-passers", examPassersType === "full");
  examPassersGenreFilter.hidden = examPassersType !== "mini";
  examPassersCurrentTabButton.classList.toggle("is-active", examPassersView === "current");
  examPassersPastTabButton.classList.toggle("is-active", examPassersView === "past");
  examPassersSummary.textContent = "読み込み中...";
  examPassersList.innerHTML = '<li class="ranking-row"><span>読み込み中...</span></li>';
  pastExamPassersList.innerHTML = '<p>読み込み中...</p>';
  examPassersList.hidden = examPassersView !== "current";
  pastExamPassersList.hidden = examPassersView !== "past";
  try {
    const [rows, count, pastCounts] = await Promise.all([
      fetchExamPassers(currentMonth, examPassersType, examPassersGenre),
      fetchExamPasserCount(currentMonth, examPassersType, examPassersGenre),
      fetchPastExamPasserCounts(examPassersType, examPassersGenre),
    ]);
    const visibleCount = Math.max(count, rows.length);
    examPassersSummary.textContent = examPassersView === "current"
      ? `今月の合格者は${visibleCount}人です`
      : `${typeLabel}の過去月の合格者数です`;
    if (pastCounts.length) {
      pastExamPassersList.replaceChildren();
      pastCounts.forEach((row) => {
        const date = new Date(`${row.month_start}T00:00:00`);
        const item = document.createElement("p");
        item.textContent = `${monthLabel(date)}の合格者　${Number(row.pass_count)}人`;
        pastExamPassersList.append(item);
      });
    } else {
      pastExamPassersList.innerHTML = '<p>過去の合格者はまだありません</p>';
    }
    if (!rows.length) {
      examPassersList.innerHTML = '<li class="ranking-row"><span>まだ合格者がいません</span></li>';
      return;
    }
    examPassersList.replaceChildren();
    rows.forEach((row, index) => {
      const item = document.createElement("li");
      item.className = "ranking-row";
      item.innerHTML = `
        <strong>${index + 1}</strong>
        <span>${escapeHtml(row.player_name)}</span>
        <b>${Number(row.score)}点</b>
        <small>${examPassersType === "mini" ? `${escapeHtml(row.genre || examPassersGenre)} / ` : ""}${formatRankingDate(row.created_at)}</small>
      `;
      examPassersList.append(item);
    });
  } catch (error) {
    console.warn(error);
    examPassersList.innerHTML = '<li class="ranking-row"><span>合格者一覧を取得できませんでした</span></li>';
  }
}

function showExamPassersModal() {
  examPassersView = "current";
  examPassersModal.hidden = false;
  renderExamPassersList();
}

function renderStudentDirectory() {
  const groups = studentDirectoryGroups();
  studentDirectoryTabs.replaceChildren();
  studentDirectoryGrid.replaceChildren();

  if (!groups.length) {
    studentDirectoryGrid.innerHTML = '<p class="student-directory-empty">生徒一覧を読み込めませんでした。</p>';
    return;
  }

  if (!studentDirectorySchool || !groups.some(([school]) => school === studentDirectorySchool)) {
    studentDirectorySchool = groups[0][0];
  }

  groups.forEach(([school, studentsInSchool]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `secondary-button${school === studentDirectorySchool ? " is-active" : ""}`;
    button.textContent = `${school} ${studentsInSchool.length}`;
    button.addEventListener("click", () => {
      studentDirectorySchool = school;
      renderStudentDirectory();
    });
    studentDirectoryTabs.append(button);
  });

  const selectedStudents = groups.find(([school]) => school === studentDirectorySchool)?.[1] || [];
  selectedStudents.forEach((student) => {
    const card = document.createElement("article");
    card.className = "student-directory-card";
    card.innerHTML = `
      <img src="${studentIconUrl(student)}" alt="${escapeHtml(displayStudentName(student.name))}" loading="lazy" />
      <strong>${escapeHtml(displayStudentName(student.name))}</strong>
    `;
    studentDirectoryGrid.append(card);
  });
}

async function showStudentDirectoryModal() {
  studentDirectoryModal.hidden = false;
  studentDirectoryTabs.innerHTML = "";
  studentDirectoryGrid.innerHTML = '<p class="student-directory-empty">読み込み中...</p>';
  await ensureQuizData();
  renderStudentDirectory();
}

function closeStudentDirectoryModal() {
  studentDirectoryModal.hidden = true;
}

function closeStartModeModal() {
  startModeModal.hidden = true;
  pendingStartMode = null;
}

function reviewAudioHtml(audio, correctName) {
  const sources = [...new Set(Array.isArray(audio) ? audio : [audio])].filter(Boolean);
  if (!sources.length) return "";
  return `
      <div class="review-audio">
        <p>${escapeHtml(displayStudentName(correctName))}のタイトルコール</p>
        <audio controls preload="none" aria-label="${escapeHtml(displayStudentName(correctName))}のタイトルコール">
          ${sources.map((source) => `<source src="${escapeHtml(source)}" type="audio/mpeg" />`).join("")}
        </audio>
      </div>`;
}

function isSpoilerStoryGenre(genre = "") {
  return genre === "ストーリー内容" || genre === "ストーリー・イベント内容(小ネタ)";
}

function spoilerWarningHtml() {
  return '<p class="spoiler-warning"><strong>ネタバレ注意:</strong> ストーリー内容・イベント内容に関する問題が出題されます。未読のストーリーがある場合はご注意ください。</p>';
}

function showStartModeModal(mode) {
  pendingStartMode = mode;
  const isEndless = mode.type === "endless";
  const isMiniExam = mode.type === "miniExam";
  const isPractice = mode.type === "practice";
  const shouldShowSpoilerWarning =
    isEndless || mode.type === "exam" || isSpoilerStoryGenre(mode.genre);
  startModeKicker.textContent = isEndless ? "Endless" : isPractice ? "Practice" : "Exam";
  startModeTitle.textContent = isEndless ? "エンドレスモード" : isMiniExam ? "本番小テスト" : isPractice ? "ジャンル別練習" : "本番50問";
  const descriptionHtml = isEndless
    ? `
      <p><strong>時間制限:</strong> 最初は60秒です。5問連続正解するごとに5秒ずつ短くなり、最低20秒で固定されます。</p>
      <p><strong>エンドレスモード:</strong> 全ジャンルから完全ランダムに出題されます。不正解、または時間切れになるまで続き、連続正解数がランキング対象になります。</p>
    `
    : isMiniExam
    ? `
      <p><strong>時間制限:</strong> 本番小テストには時間制限はありません。落ち着いて回答できます。</p>
      <p><strong>本番小テスト:</strong> ${escapeHtml(mode.genre)}から${MINI_EXAM_QUESTION_COUNT}問をランダム出題します。${MINI_EXAM_PASS_SCORE}点以上で本番小テスト合格者一覧に登録できます。</p>
    `
    : isPractice
    ? `
      <p><strong>ジャンル別練習:</strong> ${escapeHtml(mode.genre)}の問題をランダム順で全問出題します。</p>
    `
    : `
      <p><strong>時間制限:</strong> 本番50問には時間制限はありません。落ち着いて回答できます。</p>
      <p><strong>本番50問:</strong> 複数ジャンルから決められた配分で50問を出題します。${EXAM_PASS_SCORE}点以上で合格者一覧に登録できます。</p>
      <p><strong>出題配分:</strong><br>${formatExamGenrePlan()}</p>
    `;
  startModeDescription.innerHTML = shouldShowSpoilerWarning
    ? `${descriptionHtml}${spoilerWarningHtml()}`
    : descriptionHtml;
  startModeModal.hidden = false;
}

function showReview() {
  reviewList.replaceChildren();

  answerLog.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = `review-item${item.isCorrect ? "" : " is-missed"}`;
    article.innerHTML = `
      <p class="review-genre">${escapeHtml(item.genre)}</p>
      ${
        item.image
          ? `<figure class="review-image"><img class="${escapeHtml(item.imageClass || "")}" src="${item.image}" alt="${escapeHtml(item.imageAlt || item.genre)}" /></figure>`
          : ""
      }
      ${item.audio ? reviewAudioHtml(item.audio, item.correct) : ""}
      ${
        item.answerPopupImage
          ? `<figure class="review-image"><img src="${item.answerPopupImage}" alt="${escapeHtml(item.answerPopupImageAlt || item.correct)}" /></figure>`
          : ""
      }
      <h3>Q${index + 1}. ${escapeHtml(item.question)}</h3>
      <p>あなたの答え: ${escapeHtml(item.selected)}</p>
      <p>正解: ${escapeHtml(item.correct)}</p>
    `;
    if (item.skillCards) {
      const heading = article.querySelector("h3");
      article.insertBefore(renderCombatSkillPanel(item.skillCards), heading);
    }
    reviewList.append(article);
  });

  showScreen(reviewScreen);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

questionImage.addEventListener("error", () => {
  questionMedia.classList.add("is-missing");
});

setupTitleThumbnails();

audioButton.addEventListener("click", async () => {
  audioButton.disabled = true;
  try {
    const played = await playTitleCallAudio();
    if (!played) {
      audioButton.textContent = "音声を読み込めません";
      return;
    }
    audioButton.textContent = "もう一度再生";
  } catch {
    audioButton.textContent = "音声を読み込めません";
  } finally {
    audioButton.disabled = false;
  }
});

titleCallAudio.addEventListener("error", () => {
  if (audioSourceIndex < audioSources.length - 1) {
    audioSourceIndex += 1;
    titleCallAudio.src = audioSources[audioSourceIndex];
    titleCallAudio.load();
    audioButton.textContent = "タイトルコールを再生";
    return;
  }
  audioButton.textContent = "音声を読み込めません";
});

practiceButton.addEventListener("click", () => showGenreMenu("practice"));
miniExamButton.addEventListener("click", () => showGenreMenu("miniExam"));
examButton.addEventListener("click", () => showStartModeModal({ type: "exam", label: "本番50問", count: EXAM_QUESTION_COUNT }));
endlessButton.addEventListener("click", () => {
  showStartModeModal({ type: "endless", label: "エンドレスモード", count: 300 });
});
rankingButton.addEventListener("click", showRankingModal);
examPassersButton.addEventListener("click", showExamPassersModal);
adminRequestButton.addEventListener("click", showAdminRequestModal);
studentDirectoryButton.addEventListener("click", showStudentDirectoryModal);
shareResultButton.addEventListener("click", shareResult);
shareXButton.addEventListener("click", shareResultToX);
backToTitleButton.addEventListener("click", goHome);
homeButton.addEventListener("click", requestHomeNavigation);
quizHomeButton.addEventListener("click", requestHomeNavigation);
nextButton.addEventListener("click", nextQuestion);
retryButton.addEventListener("click", () => startGame(currentMode));
reviewButton.addEventListener("click", showReview);
backToResultButton.addEventListener("click", () => showScreen(resultScreen));
rankingCloseButton.addEventListener("click", () => {
  rankingModal.hidden = true;
});
examPassersCloseButton.addEventListener("click", () => {
  examPassersModal.hidden = true;
});
adminRequestCloseButton.addEventListener("click", closeAdminRequestModal);
studentDirectoryCloseButton.addEventListener("click", closeStudentDirectoryModal);
startModeCloseButton.addEventListener("click", closeStartModeModal);
startModeButton.addEventListener("click", () => {
  if (!pendingStartMode) return;
  const mode = pendingStartMode;
  closeStartModeModal();
  startGame(mode);
});
rankingModal.addEventListener("click", (event) => {
  if (event.target === rankingModal) {
    rankingModal.hidden = true;
  }
});
examPassersModal.addEventListener("click", (event) => {
  if (event.target === examPassersModal) {
    examPassersModal.hidden = true;
  }
});
adminRequestModal.addEventListener("click", (event) => {
  if (event.target === adminRequestModal) {
    closeAdminRequestModal();
  }
});
studentDirectoryModal.addEventListener("click", (event) => {
  if (event.target === studentDirectoryModal) {
    closeStudentDirectoryModal();
  }
});
examPassersCurrentTabButton.addEventListener("click", () => {
  examPassersView = "current";
  renderExamPassersList();
});
examPassersPastTabButton.addEventListener("click", () => {
  examPassersView = "past";
  renderExamPassersList();
});
miniExamPassersTypeButton.addEventListener("click", () => {
  examPassersType = "mini";
  examPassersView = "current";
  renderExamPassersList();
});
fullExamPassersTypeButton.addEventListener("click", () => {
  examPassersType = "full";
  examPassersView = "current";
  renderExamPassersList();
});
examPassersGenreSelect.addEventListener("change", () => {
  examPassersGenre = examPassersGenreSelect.value;
  examPassersView = "current";
  renderExamPassersList();
});
startModeModal.addEventListener("click", (event) => {
  if (event.target === startModeModal) {
    closeStartModeModal();
  }
});
answerPopupModal.addEventListener("click", (event) => {
  if (event.target === answerPopupModal) {
    if (answerPopupAdvanceHandler) {
      answerPopupAdvanceHandler();
    }
  }
});
monthlyRankingButton.addEventListener("click", () => renderRankingList("monthly"));
allRankingButton.addEventListener("click", () => renderRankingList("all"));
questionSuggestionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    genre: suggestionGenreInput.value.trim(),
    answerFormat: suggestionFormatInput.value.trim(),
    questionText: suggestionQuestionInput.value.trim(),
    answerText: suggestionAnswerInput.value.trim(),
    notes: suggestionNotesInput.value.trim(),
    contact: suggestionContactInput.value.trim(),
  };
  if (!payload.questionText) {
    questionSuggestionMessage.textContent = "問題文・作問ネタを入力してください。";
    return;
  }
  questionSuggestionSubmitButton.disabled = true;
  questionSuggestionMessage.textContent = "送信中...";
  try {
    await submitQuestionSuggestion(payload);
    questionSuggestionForm.reset();
    questionSuggestionMessage.textContent = "送信しました。作問ネタありがとうございます。";
  } catch (error) {
    console.warn(error);
    questionSuggestionMessage.textContent = suggestionSubmitErrorMessage(error);
  } finally {
    questionSuggestionSubmitButton.disabled = false;
  }
});
rankingSubmitForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const playerName = playerNameInput.value.trim().slice(0, PLAYER_NAME_MAX_LENGTH);
  if (!playerName) {
    rankingSubmitMessage.textContent = "名前を入力してください。";
    return;
  }
  rankingSubmitButton.disabled = true;
  rankingSubmitMessage.textContent = "登録中...";
  try {
    if (currentSubmitTarget === "exam") {
      await submitExamPasser(playerName, score, { type: "full" });
    } else if (currentSubmitTarget === "miniExam") {
      await submitExamPasser(playerName, score, { type: "mini", genre: currentMode.genre });
    } else {
      const rows = await submitEndlessScore(playerName, score);
      const saved = Array.isArray(rows) ? rows[0] : rows;
      if (saved?.all_rank || saved?.monthly_rank) {
        resultMessage.textContent = `総合上位${saved.all_rank}位 / 月間上位${saved.monthly_rank}位で保存しました。`;
      }
    }
    localStorage.setItem("blueArchivePlayerName", playerName);
    trackAnalyticsEvent("register_passer", {
      quiz_mode:
        currentSubmitTarget === "exam"
          ? "full_exam"
          : currentSubmitTarget === "miniExam"
          ? "mini_exam"
          : "endless",
      genre: currentSubmitTarget === "miniExam" ? currentMode.genre || "" : "",
      score,
      question_count: currentSubmitTarget === "endless" ? null : questions.length,
    });
    rankingSubmitMessage.textContent = currentSubmitTarget === "exam" || currentSubmitTarget === "miniExam"
      ? "合格者一覧に登録しました。"
      : "ランキングに登録しました。";
    rankingSubmitForm.hidden = true;
    if (currentSubmitTarget === "exam" || currentSubmitTarget === "miniExam") {
      examPassersType = currentSubmitTarget === "miniExam" ? "mini" : "full";
      examPassersGenre = currentSubmitTarget === "miniExam" ? currentMode.genre : examPassersGenre;
      showExamPassersModal();
    } else {
      rankingMode = "monthly";
      showRankingModal();
    }
  } catch (error) {
    console.warn(error);
    rankingSubmitMessage.textContent = rankingSubmitErrorMessage(error);
  } finally {
    rankingSubmitButton.disabled = false;
  }
});

discardScoreButton.addEventListener("click", () => {
  discardScoreModal.hidden = false;
});

cancelDiscardScoreButton.addEventListener("click", () => {
  discardScoreModal.hidden = true;
});

confirmDiscardScoreButton.addEventListener("click", () => {
  discardScoreModal.hidden = true;
  rankingSubmitForm.hidden = true;
  currentSubmitTarget = null;
  goHome();
});

discardScoreModal.addEventListener("click", (event) => {
  if (event.target === discardScoreModal) {
    discardScoreModal.hidden = true;
  }
});

cancelLeaveQuizButton.addEventListener("click", closeLeaveQuizModal);
confirmLeaveQuizButton.addEventListener("click", goHome);
leaveQuizModal.addEventListener("click", (event) => {
  if (event.target === leaveQuizModal) {
    closeLeaveQuizModal();
  }
});

window.addEventListener("popstate", () => {
  if (!isQuizInProgress()) {
    disarmQuizHistoryGuard();
    return;
  }
  showLeaveQuizModal();
  window.history.pushState({ quizGuard: true }, "", window.location.href);
  quizHistoryGuardArmed = true;
});

window.addEventListener("beforeunload", (event) => {
  if (!isQuizInProgress()) {
    return;
  }
  event.preventDefault();
  event.returnValue = "";
});

updateHomeState();
openSeoEntryFromUrl();
