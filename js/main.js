// js/main.js  (모듈 X / import X)

function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

function gradeFromScore(score){
  const s = clamp(Math.round(score), 0, 100);
  if (s >= 90) return { key:"safe",   label:"안심" };
  if (s >= 70) return { key:"good",   label:"양호" };
  if (s >= 50) return { key:"normal", label:"보통" };
  if (s >= 30) return { key:"caution",label:"주의" };
  return            { key:"danger", label:"위험" };
}

// ✅ 상태별 바늘 각도(요청값)
const NEEDLE_ANGLE_BY_GRADE = {
  safe:   285,
  good:   315,
  normal: 0,
  caution:30,
  danger: 15
};

function badgeSrc(key){
  const map = {
    safe:   "images/badge_safe.png",
    good:   "images/badge_good.png",
    normal: "images/badge_normal.png",
    caution:"images/badge_caution.png",
    danger: "images/badge_danger.png"
  };
  return map[key] || map.normal;
}

function descFromGrade(key){
  const map = {
    safe:   "현재는 위험 징후가 낮습니다. 다만 사칭·원격앱 설치 요구는 언제든지 의심하세요.",
    good:   "대체로 안전하지만, 개인정보·인증번호 요구가 나오면 즉시 종료하고 재확인하세요.",
    normal: "주의가 필요합니다. 조급하게 몰아붙이거나 앱 설치·이체를 요구하면 의심하세요.",
    caution:"주의가 필요합니다. 개인정보/인증번호 요구 시 즉시 중단하고 차단·신고를 고려하세요.",
    danger:"위험 신호가 큽니다. 즉시 통화를 종료하고 차단, 가족/지인과 공유 후 신고를 권장합니다."
  };
  return map[key] || map.normal;
}

function $(id){ return document.getElementById(id); }

// ✅ voice 점수 맵이 있으면 평균 계산(backup)
const VOICE_SCORE_MAP_KEY = "vp_voice_scores";
function calcAvgFromMap(){
  try{
    const map = JSON.parse(localStorage.getItem(VOICE_SCORE_MAP_KEY) || "{}");
    const vals = Object.values(map).filter(v => typeof v === "number" && !Number.isNaN(v));
    if (!vals.length) return null;
    return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length);
  }catch{
    return null;
  }
}

window.addEventListener("DOMContentLoaded", () => {

  // ===== 네비게이션 =====
  $("go-voice")?.addEventListener("click", () => location.href = "voice.html");
  $("go-smishing")?.addEventListener("click", () => location.href = "smishing.html");
  $("go-messenger")?.addEventListener("click", () => location.href = "messenger.html");

  $("go-share")?.addEventListener("click", () => location.href = "share.html");
  $("go-center")?.addEventListener("click", () => location.href = "center.html");
  $("go-help")?.addEventListener("click", () => location.href = "help.html");

  // ===== 위험도 점수 =====
  const stored = localStorage.getItem("riskScore");
  let score = stored ? Number(stored) : null;

  if (!Number.isFinite(score)){
    const avg = calcAvgFromMap();
    score = Number.isFinite(avg) ? avg : 95;
    localStorage.setItem("riskScore", String(Math.round(score)));
  }

  score = clamp(score, 0, 100);

  const g = gradeFromScore(score);

  // ✅ 바늘: 상태별 고정 각도 적용
  const needle = $("needle");
  if (needle){
    const angle = NEEDLE_ANGLE_BY_GRADE[g.key] ?? 0;
    needle.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  }

  $("statusText") && ($("statusText").textContent = g.label);
  $("scoreText")  && ($("scoreText").textContent  = String(Math.round(score)));

  const badge = $("badge");
  if (badge){
    badge.src = badgeSrc(g.key);
    badge.alt = g.label;
  }

  $("descMain") && ($("descMain").textContent = descFromGrade(g.key));
});