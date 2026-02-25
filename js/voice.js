// js/voice.js (FINAL + avg score + napchi intro overlap)
const $ = (id) => document.getElementById(id);

$("backHome")?.addEventListener("click", () => location.href = "index.html");

const scenarioRow = $("scenarioRow");
const pickScore = $("pickScore");
const applyScore = $("applyScore");

// overlay elements
const callOverlay = $("callOverlay");
const callScreen  = $("callScreen");
const callClose   = $("callClose");

const callerNumber = $("callerNumber");
const callTopTitle = $("callTopTitle");
const callTimerEl  = $("callTimer");
const callStatus   = $("callStatus");
const callProgressEl = $("callProgress");

const incomingBtns = $("incomingBtns");
const btnAnswer    = $("btnAnswer");
const btnDecline   = $("btnDecline");

const inCallArea   = $("inCallArea");
const callAudioEl  = $("callAudio");

const decisionPanel = $("decisionPanel");
const quizTitle     = $("quizTitle");
const quizOptions   = $("quizOptions");

const resultPanel   = $("resultPanel");
const resultTitle   = $("resultTitle");
const resultDesc    = $("resultDesc");
const resultActions = $("resultActions");
const resultFailActions = $("resultFailActions");

const btnPeek     = $("btnPeek");
const btnOther    = $("btnOther");
const btnRetry    = $("btnRetry");
const btnOther2   = $("btnOther2");

const peekPanel   = $("peekPanel");
const peekBody    = $("peekBody");
const btnPeekClose= $("btnPeekClose");

// =========================
// SCORE: 누적 평균 반영
// =========================
const VOICE_SCORE_MAP_KEY = "vp_voice_scores"; // {"1":30,"2":60,...}
const RISK_SCORE_KEY = "riskScore";

function loadVoiceScoreMap(){
  try { return JSON.parse(localStorage.getItem(VOICE_SCORE_MAP_KEY) || "{}"); }
  catch { return {}; }
}
function saveVoiceScoreMap(map){
  localStorage.setItem(VOICE_SCORE_MAP_KEY, JSON.stringify(map));
}
function updateOverallRiskScore(){
  const map = loadVoiceScoreMap();
  const vals = Object.values(map).filter(v => typeof v === "number" && !Number.isNaN(v));
  if (!vals.length) return;
  const avg = Math.round(vals.reduce((a,b)=>a+b,0) / vals.length);
  localStorage.setItem(RISK_SCORE_KEY, String(avg));
}
function persistVoiceScenarioScore(no, score){
  const map = loadVoiceScoreMap();
  map[String(no)] = Math.round(score);
  saveVoiceScoreMap(map);
  updateOverallRiskScore();
}

// =========================
// STATE
// =========================
let selectedScore = 95;
let selectedScenario = 1;
let baseScore = 95;

let ringAudio = null;

let cutIndex = 0;
let mistakes = 0;
const PENALTY_PER_MISTAKE = 15;

let pendingNextCut = -1;
let currentMaskedNumber = "";

// timer
let callTimer = null;
let elapsed = 0;

// napchi overlap용 보조 오디오
let auxAudio = null;

// =========================
// STATUS STYLE CONTROL (JS ONLY)
// (너가 적용해둔 상태 유지)
// =========================
function applyBigLowerStatusStyle(){
  if (!callScreen?.classList.contains("incall")) {
    if (callStatus){
      callStatus.style.fontSize = "";
      callStatus.style.marginTop = "";
      callStatus.style.fontWeight = "";
    }
    return;
  }
  if (callStatus){
    callStatus.style.fontSize = "24px";
    callStatus.style.marginTop = "86px";
    callStatus.style.fontWeight = "900";
  }
}

function startBlink(){ callStatus?.classList.add("blink"); }
function stopBlink(){ callStatus?.classList.remove("blink"); }

function setCallStatus(text, { blink=false } = {}){
  if (!callStatus) return;
  callStatus.textContent = text;
  applyBigLowerStatusStyle();
  if (blink) startBlink();
  else stopBlink();
}

// =========================
// MASKED NUMBER
// =========================
const MASK_SYMBOLS = ["X","○","□","△"];
function makeMaskedNumber(){
  const pick4 = () =>
    Array.from({length:4}, () => MASK_SYMBOLS[Math.floor(Math.random()*MASK_SYMBOLS.length)]).join("");
  return `010-${pick4()}-${pick4()}`;
}

// =========================
// TIMER
// =========================
function formatMMSS(sec){
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function startCallTimer(){
  stopCallTimer();
  elapsed = 0;
  if (callTimerEl){
    callTimerEl.hidden = false;
    callTimerEl.textContent = "00:00";
  }
  callTimer = setInterval(() => {
    elapsed += 1;
    if (callTimerEl) callTimerEl.textContent = formatMMSS(elapsed);
  }, 1000);
}
function stopCallTimer(){
  if (callTimer){
    clearInterval(callTimer);
    callTimer = null;
  }
  if (callTimerEl) callTimerEl.hidden = true;
}

// =========================
// PROGRESS
// =========================
function setProgress(idx, total){
  if (!callProgressEl) return;
  callProgressEl.hidden = false;
  callProgressEl.textContent = `${idx+1}/${total}`;
}
function hideProgress(){
  if (callProgressEl) callProgressEl.hidden = true;
}

// =========================
// SCENARIOS
// - 2번(납치) 1컷은 napchi → napchi1 (overlap 2초)
// =========================
const SCENARIOS = {
  1:{cuts:[
    {audio:"audio/susa1.mp3", q:"Q1. 이 질문에 어떻게 답하시겠습니까?",
     options:[
      {t:"아니오. 전화를 끊고 검찰청 대표번호(1301)로 사실을 확인한다.", outcome:"success"},
      {t:"\"우편으로 소환장 보내세요\"라고 말하고 끊는다.", outcome:"success"},
      {t:"\"제가 안 했는데요? 무슨 일이죠?\"(통화를 이어간다)", outcome:"progress"},
     ]},
    {audio:"audio/susa2.mp3", q:"Q2. 끊지 말고 이동하라는 요구에는?",
     options:[
      {t:"무시하고 즉시 전화를 끊는다.", outcome:"success"},
      {t:"주변 사람에게 메모나 손짓으로 도움을 청한다.", outcome:"success"},
      {t:"겁을 먹고 통화를 유지하며 조용한 곳으로 이동한다.", outcome:"progress"},
     ]},
    {audio:"audio/susa3.mp3", q:"Q3. 안전계좌로 이체하라는 말에는?",
     options:[
      {t:"즉시 끊고 112에 신고한다.", outcome:"success"},
      {t:"해당 은행에 지급정지를 요청한다.", outcome:"success"},
      {t:"계좌번호를 받아 적고 이체를 준비한다.", outcome:"fail"},
     ]},
  ]},

  2:{cuts:[
    {
      audio:["audio/napchi.mp3", "audio/napchi1.mp3"],
      overlap: 2,
      q:"Q1. 아이를 데리고 있다는 협박에는?",
      options:[
        {t:"일단 끊고 자녀·학교·학원에 전화해 위치를 확인한다.", outcome:"success"},
        {t:"배우자에게 연락해 상황을 공유한다.", outcome:"success"},
        {t:"\"돈 드릴게요\"라고 빌며 통화를 이어간다.", outcome:"progress"},
      ]
    },
    {audio:"audio/napchi2.mp3", q:"Q2. 신고를 막으며 은행으로 가라고 하면?",
     options:[
      {t:"다른 전화기로 112에 문자로 신고한다.", outcome:"success"},
      {t:"가는 척하며 시간을 끈다.", outcome:"success"},
      {t:"신고하지 않고 은행으로 달려간다.", outcome:"progress"},
     ]},
    {audio:"audio/napchi3.mp3", q:"Q3. 돈을 특정 장소에 두라고 하면?",
     options:[
      {t:"경찰이 도착할 때까지 시간을 끈다.", outcome:"success"},
      {t:"\"현금이 모자라다\"며 핑계를 댄다.", outcome:"success"},
      {t:"돈을 보관함에 넣거나 전달한다.", outcome:"fail"},
     ]},
  ]},

  3:{cuts:[
    {audio:"audio/bank1.mp3", q:"Q1. 대출 권유 전화에는?",
     options:[
      {t:"\"필요 없다\"고 하고 끊는다.", outcome:"success"},
      {t:"은행 공식 대표번호로 전화해 직원을 확인한다.", outcome:"success"},
      {t:"\"한도가 얼마나 되나요?\"라고 묻는다.", outcome:"progress"},
     ]},
    {audio:"audio/bank2.mp3", q:"Q2. 법 위반이라며 상환을 독촉하면?",
     options:[
      {t:"전화를 끊고 기존 대출 은행에 문의한다.", outcome:"success"},
      {t:"금융감독원(1332)에 문의한다.", outcome:"success"},
      {t:"당황하며 해결 방법을 묻는다.", outcome:"progress"},
     ]},
    {audio:"audio/bank3.mp3", q:"Q3. 법무팀/가상계좌로 입금하라고 하면?",
     options:[
      {t:"절대 입금하지 않고 차단한다.", outcome:"success"},
      {t:"계좌 예금주가 법인이 맞는지 확인한다.", outcome:"success"},
      {t:"급한 마음에 알려준 계좌로 송금한다.", outcome:"fail"},
     ]},
  ]},

  4:{cuts:[
    {audio:"audio/denggi1.mp3", q:"Q1. 등기 반송 전화에는?",
     options:[
      {t:"\"반송 처리하세요\"라고 하고 끊는다.", outcome:"success"},
      {t:"대한민국 법원 홈페이지에서 직접 조회한다.", outcome:"success"},
      {t:"\"내일 없는데요? 무슨 내용이죠?\"라고 묻는다.", outcome:"progress"},
     ]},
    {audio:"audio/denggi2.mp3", q:"Q2. 방문 대신 인터넷 확인을 제안하면?",
     options:[
      {t:"거절하고 전화를 끊는다.", outcome:"success"},
      {t:"포털에서 '대한민국 법원' 검색 후 접속한다.", outcome:"success"},
      {t:"\"네, 인터넷으로 확인할게요\"라고 응한다.", outcome:"progress"},
     ]},
    {audio:"audio/denggi3.mp3", q:"Q3. 링크 접속 및 앱 설치 요구는?",
     options:[
      {t:"링크를 절대 누르지 않는다.", outcome:"success"},
      {t:"앱 설치를 거부하고 차단한다.", outcome:"success"},
      {t:"링크를 눌러 정보를 입력한다.", outcome:"fail"},
     ]},
  ]},

  5:{cuts:[
    {audio:"audio/basong1.mp3", q:"Q1. 신청하지 않은 카드 배송 전화에는?",
     options:[
      {t:"\"반송해주세요\" 하고 끊는다.", outcome:"success"},
      {t:"카드사 공식 앱에서 발급 현황을 확인한다.", outcome:"success"},
      {t:"\"누가 신청했나요?\"라며 통화를 이어간다.", outcome:"progress"},
     ]},
    {audio:"audio/basong2.mp3", q:"Q2. 기사가 알려준 번호로 전화를 걸라고 하면?",
     options:[
      {t:"절대 걸지 않고, 카드사 대표번호를 검색해 건다.", outcome:"success"},
      {t:"카드사 앱으로 확인한다.", outcome:"success"},
      {t:"기사가 알려준 번호로 전화를 건다.", outcome:"progress"},
     ]},
    {audio:"audio/basong3.mp3", q:"Q3. 보안팀이라며 원격 제어를 요구하면?",
     options:[
      {t:"즉시 끊고 112에 신고한다.", outcome:"success"},
      {t:"원격 제어 앱 설치를 거부한다.", outcome:"success"},
      {t:"시키는 대로 원격 앱을 깐다.", outcome:"fail"},
     ]},
  ]},

  6:{cuts:[
    {audio:"audio/kook1.mp3", q:"Q1. 세금 압류 ARS 전화를 받으면?",
     options:[
      {t:"아무 버튼도 누르지 않고 끊는다.", outcome:"success"},
      {t:"국세청 홈택스 앱에서 체납 내역을 조회한다.", outcome:"success"},
      {t:"상담원 연결을 위해 0번을 누른다.", outcome:"progress"},
     ]},
    {audio:"audio/kook2.mp3", q:"Q2. 시간이 없다며 즉시 납부를 종용하면?",
     options:[
      {t:"\"고지서 다시 보내세요\" 하고 끊는다.", outcome:"success"},
      {t:"관할 세무서 민원실로 직접 전화해 확인한다.", outcome:"success"},
      {t:"\"지금 낼게요\"라며 방법을 묻는다.", outcome:"progress"},
     ]},
    {audio:"audio/kook3.mp3", q:"Q3. 문자로 온 계좌로 입금하라고 하면?",
     options:[
      {t:"절대 입금하지 않고 차단한다.", outcome:"success"},
      {t:"예금주가 '국세청'이 맞는지 확인한다.", outcome:"success"},
      {t:"알려준 계좌로 송금한다.", outcome:"fail"},
     ]},
  ]},
};

const PEEK_POINTS = {
  1:["‘대포통장 연루’로 겁을 줌","전화 끊지 말라며 고립시킴","‘안전계좌’ 이체 요구(100% 사기)"],
  2:["아이 울음 등으로 패닉 유도","신고/통화 종료 금지 협박","현금 인출·보관함 전달 지시"],
  3:["저금리/대환대출로 유혹","전산 경고·법 위반이라며 압박","가상계좌로 상환 유도"],
  4:["등기 반송 핑계로 접촉","가짜 사이트 접속 유도","‘전용 뷰어’ 앱 설치 요구"],
  5:["배송기사로 혼란 유발","‘직접 전화’ 유도(가짜 콜센터)","원격/보안취소 설치 유도"],
  6:["ARS로 압류/체납 협박","시간 압박(오늘 4시/10분)","가상계좌 납부 유도"],
};

// =========================
// RINGTONE
// =========================
function stopRingtone(){
  if (ringAudio){
    ringAudio.pause();
    ringAudio.currentTime = 0;
    ringAudio = null;
  }
}
function startRingtoneForScenario(no){
  stopRingtone();
  const ringPath = (no % 2 === 1) ? "audio/ring_galaxy.mp3" : "audio/ring_iphone.mp3";
  ringAudio = new Audio(ringPath);
  ringAudio.loop = true;
  ringAudio.volume = 0.9;
  ringAudio.play().catch(() => {});
}

// =========================
// AUDIO HELPERS (napchi overlap)
// =========================
function stopCallAudio(){
  if (callAudioEl){
    callAudioEl.pause();
    callAudioEl.currentTime = 0;
    callAudioEl.removeAttribute("src");
    callAudioEl.onended = null;
    callAudioEl.ontimeupdate = null;
  }
  if (auxAudio){
    auxAudio.pause();
    auxAudio.currentTime = 0;
    auxAudio = null;
  }
}

function playAudioSequence(files, overlapSec, onDone){
  const [a, b] = files;

  let startedB = false;
  let bFailed = false;

  auxAudio = new Audio(b);
  auxAudio.preload = "auto";
  auxAudio.volume = 1;

  const startB = () => {
    if (startedB) return;
    startedB = true;
    auxAudio.play().catch(() => { bFailed = true; });
  };

  callAudioEl.src = a;
  callAudioEl.play().catch(() => onDone?.());

  if (overlapSec > 0){
    callAudioEl.ontimeupdate = () => {
      if (startedB) return;
      if (Number.isFinite(callAudioEl.duration) &&
          callAudioEl.currentTime >= (callAudioEl.duration - overlapSec)){
        startB();
      }
    };
  }

  callAudioEl.onended = () => {
    callAudioEl.ontimeupdate = null;
    if (!startedB) startB(); // overlap 불가하면 즉시 이어서
    if (bFailed) onDone?.();
  };

  auxAudio.onended = () => onDone?.();
}

// =========================
// UI HELPERS
// =========================
function showOverlay(){
  document.body.classList.add("call-open");
  callOverlay?.classList.add("show");
  callOverlay?.setAttribute("aria-hidden","false");
}
function resetPanels(){
  if (incomingBtns) incomingBtns.hidden = false;
  if (inCallArea) inCallArea.hidden = true;
  if (decisionPanel) decisionPanel.hidden = true;
  if (resultPanel) resultPanel.hidden = true;
  if (peekPanel) peekPanel.hidden = true;
  if (resultActions) resultActions.hidden = false;
  if (resultFailActions) resultFailActions.hidden = true;
  if (quizOptions) quizOptions.innerHTML = "";
  pendingNextCut = -1;
}
function hideOverlay(){
  document.body.classList.remove("call-open");
  stopRingtone();
  stopCallAudio();
  stopCallTimer();
  hideProgress();
  stopBlink();

  callScreen?.classList.remove("ringing");
  callScreen?.classList.remove("incall");
  callScreen?.classList.add("incoming");

  callOverlay?.classList.remove("show");
  callOverlay?.setAttribute("aria-hidden","true");
  resetPanels();
}

// =========================
// FLOW
// =========================
function openIncoming(no){
  currentMaskedNumber = makeMaskedNumber();
  if (callerNumber) callerNumber.textContent = currentMaskedNumber;

  if (callTopTitle) callTopTitle.textContent = "수신전화";
  setCallStatus("전화 오는 중…", { blink:false });

  stopCallTimer();
  hideProgress();

  callScreen?.classList.add("incoming");
  callScreen?.classList.remove("incall");
  callScreen?.classList.add("ringing");

  resetPanels();
  showOverlay();
  startRingtoneForScenario(no);
}

function answerCall(){
  stopRingtone();
  callScreen?.classList.remove("ringing");

  callScreen?.classList.remove("incoming");
  callScreen?.classList.add("incall");

  if (callTopTitle) callTopTitle.textContent = "통화중";
  if (callerNumber) callerNumber.textContent = currentMaskedNumber || callerNumber.textContent;

  startCallTimer();
  if (incomingBtns) incomingBtns.hidden = true;

  setCallStatus("연결됨", { blink:false });
  playCut(selectedScenario, 0);
}

function playCut(no, idx){
  const s = SCENARIOS[no];
  const total = s?.cuts?.length ?? 0;
  if (!s || !s.cuts[idx]){
    endAsFail("진행 중 위험 선택이 누적되어 피해로 이어질 가능성이 큽니다.");
    return;
  }

  cutIndex = idx;
  setProgress(idx, total);

  if (inCallArea) inCallArea.hidden = false;
  if (decisionPanel) decisionPanel.hidden = true;
  if (resultPanel) resultPanel.hidden = true;
  if (peekPanel) peekPanel.hidden = true;

  setCallStatus(`CUT ${idx+1} 재생 중…`, { blink:true });

  const audioDef = s.cuts[idx].audio;
  const overlap = s.cuts[idx].overlap || 0;

  stopCallAudio();

  if (Array.isArray(audioDef)) {
    playAudioSequence(audioDef, overlap, () => showQuiz(no, idx));
  } else {
    callAudioEl.src = audioDef;
    callAudioEl.play().catch(() => showQuiz(no, idx));
    callAudioEl.onended = () => showQuiz(no, idx);
  }
}

function showQuiz(no, idx){
  const s = SCENARIOS[no];
  if (!s || !s.cuts[idx]) return;

  setCallStatus(`CUT ${idx+1} 종료 → 선택`, { blink:false });

  if (inCallArea) inCallArea.hidden = true;
  if (decisionPanel) decisionPanel.hidden = false;

  if (quizTitle) quizTitle.textContent = s.cuts[idx].q;

  if (quizOptions){
    quizOptions.innerHTML = "";
    s.cuts[idx].options.forEach((opt) => {
      const b = document.createElement("button");
      b.className = "sheet-btn";
      b.type = "button";
      b.dataset.outcome = opt.outcome;
      b.textContent = opt.t;
      quizOptions.appendChild(b);
    });
  }
}

// ===== RESULT =====
function endAsSuccess(){
  stopCallAudio();
  setCallStatus("선택 완료", { blink:false });

  // ✅ 점수: 실사용은 기존 로직 유지(성공 시 baseScore - mistakes*15)
  const score = Math.max(0, baseScore - mistakes * PENALTY_PER_MISTAKE);
  selectedScore = score;
  if (pickScore) pickScore.textContent = String(selectedScore);

  // ✅ 누적 평균 반영
  persistVoiceScenarioScore(selectedScenario, selectedScore);

  const total = SCENARIOS[selectedScenario]?.cuts?.length ?? 0;
  pendingNextCut = (cutIndex + 1 < total) ? (cutIndex + 1) : -1;

  if (decisionPanel) decisionPanel.hidden = true;
  if (inCallArea) inCallArea.hidden = true;
  if (resultPanel) resultPanel.hidden = false;
  if (peekPanel) peekPanel.hidden = true;

  if (resultTitle) resultTitle.textContent = "방어 성공";
  if (resultDesc){
    resultDesc.textContent =
      pendingNextCut >= 0
        ? "좋습니다. ‘수법 계속 엿보기’를 누르면 다음 단계(CUT)로 진행됩니다."
        : "완벽 방어! 더 이상 진행 단계가 없습니다. 핵심 포인트를 확인해보세요.";
  }

  if (resultActions) resultActions.hidden = false;
  if (resultFailActions) resultFailActions.hidden = true;

  // ✅ 버튼 문구(한 줄)
  if (btnOther) btnOther.textContent = "다른 시나리오 보기";
}

function endAsFail(msg){
  stopCallAudio();
  stopCallTimer();
  hideProgress();
  setCallStatus("통화 종료됨", { blink:false });

  // ✅ 실패 점수(기존 유지)
  selectedScore = Math.max(0, baseScore - 60);
  if (pickScore) pickScore.textContent = String(selectedScore);

  // ✅ 누적 평균 반영
  persistVoiceScenarioScore(selectedScenario, selectedScore);

  if (decisionPanel) decisionPanel.hidden = true;
  if (inCallArea) inCallArea.hidden = true;
  if (resultPanel) resultPanel.hidden = false;
  if (peekPanel) peekPanel.hidden = true;

  if (resultTitle) resultTitle.textContent = "방어 실패";
  if (resultDesc) resultDesc.textContent = msg || "잘못된 대처로 피해로 이어질 수 있습니다.";

  if (resultActions) resultActions.hidden = true;
  if (resultFailActions) resultFailActions.hidden = false;

  if (btnOther2) btnOther2.textContent = "다른 시나리오 보기";
}

// =========================
// EVENTS
// =========================
quizOptions?.addEventListener("click", (e) => {
  const btn = e.target.closest(".sheet-btn");
  if (!btn) return;

  const outcome = btn.dataset.outcome;
  if (outcome === "success"){ endAsSuccess(); return; }
  if (outcome === "fail"){ endAsFail("결정적인 함정(이체/링크/원격 등)에 넘어가 피해가 발생할 수 있습니다."); return; }

  mistakes += 1;
  if (decisionPanel) decisionPanel.hidden = true;
  if (inCallArea) inCallArea.hidden = false;
  playCut(selectedScenario, cutIndex + 1);
});

// 수법 계속 엿보기: 다음 CUT 있으면 다음으로, 없으면 핵심포인트
btnPeek?.addEventListener("click", () => {
  if (pendingNextCut >= 0){
    if (resultPanel) resultPanel.hidden = true;
    playCut(selectedScenario, pendingNextCut);
    return;
  }
  if (peekBody){
    peekBody.innerHTML = "";
    (PEEK_POINTS[selectedScenario] || []).forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      peekBody.appendChild(li);
    });
  }
  if (peekPanel) peekPanel.hidden = false;
});

btnPeekClose?.addEventListener("click", () => { if (peekPanel) peekPanel.hidden = true; });

function goOtherScenario(){
  hideOverlay();
  document.querySelector(".subcard")?.scrollIntoView({ behavior:"smooth", block:"start" });
}
btnOther?.addEventListener("click", goOtherScenario);
btnOther2?.addEventListener("click", goOtherScenario);

btnRetry?.addEventListener("click", () => {
  if (resultPanel) resultPanel.hidden = true;
  showQuiz(selectedScenario, cutIndex);
});

callClose?.addEventListener("click", hideOverlay);
btnAnswer?.addEventListener("click", answerCall);
btnDecline?.addEventListener("click", hideOverlay);

// 시나리오 선택 → 수신 화면
scenarioRow?.addEventListener("click", (e) => {
  const btn = e.target.closest(".scenario-item");
  if (!btn) return;

  scenarioRow.querySelectorAll(".scenario-item").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed","false");
  });
  btn.classList.add("active");
  btn.setAttribute("aria-pressed","true");

  const numEl = btn.querySelector(".scenario-num");
  selectedScenario = numEl ? Number(numEl.textContent) : 1;

  baseScore = Number(btn.dataset.score);
  selectedScore = baseScore;
  if (pickScore) pickScore.textContent = String(selectedScore);

  cutIndex = 0;
  mistakes = 0;
  pendingNextCut = -1;

  openIncoming(selectedScenario);
});

// 메인 위험도 갱신 버튼: 지금은 “평균 점수”를 이미 저장하므로, 그냥 메인으로 이동
applyScore?.addEventListener("click", () => {
  updateOverallRiskScore();
  location.href = "index.html";
});

// ✅ 하단 터치 영역: 수신/거절/통화종료
callScreen?.addEventListener("click", (e) => {
  if (!callOverlay?.classList.contains("show")) return;
  if (e.target.closest("#callClose")) return;

  // ✅ 시트/버튼 클릭은 제외(버튼 먹힘 방지)
  if (e.target.closest("button")) return;
  if (e.target.closest(".decision-sheet, .result-sheet, .peek-sheet")) return;

  const rect = callScreen.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 수신 화면: 하단 35% / 좌=수신, 우=거절
  if (callScreen.classList.contains("incoming") && !callScreen.classList.contains("incall")){
    if (y >= rect.height * 0.65){
      if (x < rect.width / 2) answerCall();
      else hideOverlay();
    }
    return;
  }

  // 통화중: 하단 중앙 터치 → 종료
  if (callScreen.classList.contains("incall")){
    const isBottom = y >= rect.height * 0.70;
    const isCenter = x >= rect.width * 0.30 && x <= rect.width * 0.70;
    if (isBottom && isCenter){
      hideOverlay();
    }
  }
});