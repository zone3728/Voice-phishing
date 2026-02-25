// js/common.js
export function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

// 점수 구간: 안심(90~100), 양호(70~89), 보통(50~69), 주의(30~49), 위험(0~29)
export function gradeFromScore(score){
  const s = clamp(Math.round(score), 0, 100);
  if (s >= 90) return { key:"safe",   label:"안심", min:90, max:100 };
  if (s >= 70) return { key:"good",   label:"양호", min:70, max:89 };
  if (s >= 50) return { key:"normal", label:"보통", min:50, max:69 };
  if (s >= 30) return { key:"caution",label:"주의", min:30, max:49 };
  return            { key:"danger", label:"위험", min:0,  max:29 };
}

// 게이지는 왼쪽(-90deg) → 오른쪽(+90deg) 반원
export function angleFromScore(score){
  const s = clamp(score, 0, 100);
  return -90 + (s * 180 / 100);
}

// 배지 파일 매핑
export function badgeSrc(key){
  const map = {
    safe:   "images/badge_safe.png",
    good:   "images/badge_good.png",
    normal: "images/badge_normal.png",
    caution:"images/badge_caution.png",
    danger: "images/badge_danger.png"
  };
  return map[key] || map.normal;
}

// 상태 설명(예시 문구 — 너 스타일대로 수정 가능)
export function descFromGrade(key){
  const map = {
    safe:   "현재는 위험 징후가 낮습니다. 다만 ‘검찰/금감원/은행’ 사칭, 원격앱 설치 요구는 언제든지 의심하세요.",
    good:   "대체로 안전하지만, 개인정보·인증번호 요구가 나오면 통화를 즉시 종료하고 재확인하세요.",
    normal: "주의가 필요합니다. 상대가 조급하게 몰아붙이거나 앱 설치·계좌이체를 요구하면 의심하세요.",
    caution:"주의가 필요합니다. 개인정보/인증번호 요구 시 즉시 중단하고 차단·신고를 고려하세요.",
    danger:"위험 신호가 큽니다. 즉시 통화를 종료하고 차단, 가족/지인과 공유 후 신고를 권장합니다."
  };
  return map[key] || map.normal;
}