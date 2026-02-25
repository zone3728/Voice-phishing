/* ========== 점수/구간 로직 ========== */
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function getStatus(score){
  if(score >= 90) return { key:"safe",   label:"안심", badge:"./images/badge_safe.png" };
  if(score >= 70) return { key:"good",   label:"양호", badge:"./images/badge_good.png" };
  if(score >= 50) return { key:"normal", label:"보통", badge:"./images/badge_normal.png" };
  if(score >= 30) return { key:"caution",label:"주의", badge:"./images/badge_caution.png" };
  return             { key:"danger", label:"위험", badge:"./images/badge_danger.png" };
}

/* ✅ 게이지 이미지가 “완전 등분”이 아닐 수 있어서,
   각 구간 중심각을 고정(따로 노는 현상 방지) */
const CENTER_ANGLE = {
  safe:   -92,
  good:   -52,
  normal:  -5,
  caution:  45,
  danger:   92
};

/* 점수에 따라 구간 내부에서 약간 움직이게(자연스러움) */
function scoreToAngle(score){
  score = clamp(score, 0, 100);
  const st = getStatus(score);

  // 구간별 시작/끝
  const ranges = {
    safe:   [90,100],
    good:   [70,89],
    normal: [50,69],
    caution:[30,49],
    danger: [0,29]
  };

  const [a,b] = ranges[st.key];
  const t = (score - a) / (b - a || 1); // 0~1
  // 구간 내에서 +-10도 정도만 흔들어주기
  const wiggle = (t - 0.5) * 20; // -10~+10
  return CENTER_ANGLE[st.key] + wiggle;
}

function setRiskUI(score){
  const needle = document.getElementById("needle");
  const scoreValue = document.getElementById("scoreValue");
  const statusLeft = document.getElementById("statusLeft");
  const badgeImg = document.getElementById("badgeImg");
  const descMain = document.getElementById("descMain");

  score = clamp(Number(score) || 0, 0, 100);

  const st = getStatus(score);
  const angle = scoreToAngle(score);

  // 우측: 점수만
  scoreValue.textContent = String(score);

  // 좌측: 현재상태
  statusLeft.textContent = st.label;

  // 우측: 배지(안심/양호/보통/주의/위험 이미지)
  badgeImg.src = st.badge;
  badgeImg.alt = st.label;

  // 바늘 회전
  needle.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

  // 설명 문구(작게)
  const messageMap = {
    safe:   "현재는 위험 징후가 낮습니다. 다만 ‘검찰/금감원/은행’ 사칭, 원격앱 설치 요구는 언제든지 의심하세요.",
    good:   "전반적으로 양호합니다. 링크 클릭/앱 설치 유도 문구가 나오면 즉시 중단하고 주변에 확인하세요.",
    normal: "보통 수준입니다. 급한 송금 요구·본인확인(OTP/인증) 요구가 있으면 반드시 끊고 재확인하세요.",
    caution:"주의가 필요합니다. 전화로 개인정보/인증번호 요구 시 즉시 중단하고 차단·신고를 고려하세요.",
    danger: "위험 수준입니다. 송금/인증 유도 가능성이 높습니다. 즉시 통화 종료 후 가족/기관에 직접 확인하세요."
  };
  descMain.textContent = messageMap[st.key] || messageMap.normal;
}

/* ========== 데모 인터랙션(타일 클릭 시 점수 바뀌는 예시) ========== */
const demoScores = {
  voice: 60,       // 보통
  smishing: 80,    // 양호
  messenger: 35    // 주의
};

function wireUI(){
  // 초기값
  setRiskUI(95);

  // 타일 클릭 => 데모 점수 반영 (나중에 실제 로직으로 교체)
  document.querySelectorAll(".tile").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      setRiskUI(demoScores[mode] ?? 60);
    });
  });

  // 버튼 액션(지금은 예시)
  document.getElementById("btnShare").addEventListener("click", async () => {
    try{
      if(navigator.share){
        await navigator.share({ title:"전화금융사기 체험하기", text:"전화금융사기 예방 체험", url: location.href });
      }else{
        alert("공유 기능은 기기/브라우저에 따라 다를 수 있어요.");
      }
    }catch(e){}
  });

  document.getElementById("btnCenter").addEventListener("click", () => {
    alert("예방센터(돌아가기) 동작은 나중에 링크/화면 전환으로 연결하면 돼요.");
  });

  document.getElementById("btnHelp").addEventListener("click", () => {
    alert("도움말: 체험을 선택하면 점수에 따라 위험도가 표시됩니다.");
  });
}

document.addEventListener("DOMContentLoaded", wireUI);