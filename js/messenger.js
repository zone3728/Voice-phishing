// js/messenger.js
(() => {
  const MAP_KEY = "vp_messenger_scores";
  const ALL_MAP_KEYS = ["vp_voice_scores", "vp_smishing_scores", "vp_messenger_scores"];

  const $ = (id) => document.getElementById(id);

  const el = {
    backHome: $("backHome"),

    viewThemeList: $("viewThemeList"),
    viewRoomList: $("viewRoomList"),
    viewChat: $("viewChat"),

    themeList: $("themeList"),
    roomList: $("roomList"),
    backToThemes: $("backToThemes"),

    riskScoreNow: $("riskScoreNow"),
    roomRiskScore: $("roomRiskScore"),
    roomThemeName: $("roomThemeName"),

    chatTitle: $("chatTitle"),
    chatShell: $("chatShell"),
    chatBack: $("chatBack"),
    chatBody: $("chatBody"),
    peerName: $("peerName"),
    peerSub: $("peerSub"),
    phaseChip: $("phaseChip"),
    chatBanner: $("chatBanner"),

    choiceSheet: $("choiceSheet"),
    choiceTitle: $("choiceTitle"),
    choiceBtns: $("choiceBtns"),

    overlay: $("overlay"),
    overlayCard: $("overlayCard"),
  };

  const state = {
    data: null,

    currentTheme: null, // theme object
    currentRoom: null,  // room object

    phase: 1,
    rendered: [], // rendered messages (with id)

    timeouts: [],
    inputLocked: false,

    blockedRooms: new Set(), // session-only block
  };

  // ----------------------------
  // score helpers
  // ----------------------------
  function safeParse(json) { try { return JSON.parse(json); } catch { return null; } }

  function setMapValue(mapKey, id, score) {
    const obj = safeParse(localStorage.getItem(mapKey)) || {};
    obj[id] = Number(score);
    localStorage.setItem(mapKey, JSON.stringify(obj));
    return obj;
  }

  function collectAllScores() {
    const values = [];
    for (const key of ALL_MAP_KEYS) {
      const obj = safeParse(localStorage.getItem(key));
      if (!obj || typeof obj !== "object") continue;
      for (const v of Object.values(obj)) {
        const n = Number(v);
        if (Number.isFinite(n)) values.push(n);
      }
    }
    return values;
  }

  function avg(nums) {
    if (!nums.length) return null;
    const s = nums.reduce((a, b) => a + b, 0);
    return Math.round(s / nums.length);
  }

  function recomputeRiskScore() {
    const a = avg(collectAllScores());
    if (a !== null) localStorage.setItem("riskScore", String(a));
    return a;
  }

  function getRiskScore() {
    const v = Number(localStorage.getItem("riskScore"));
    return Number.isFinite(v) ? v : null;
  }

  function updateRiskScoreUI() {
    const v = getRiskScore();
    if (el.riskScoreNow) el.riskScoreNow.textContent = v === null ? "-" : String(v);
    if (el.roomRiskScore) el.roomRiskScore.textContent = v === null ? "-" : String(v);
  }

  // ----------------------------
  // timer helpers
  // ----------------------------
  function schedule(fn, ms) {
    const id = setTimeout(fn, ms);
    state.timeouts.push(id);
    return id;
  }
  function clearAllTimers() {
    state.timeouts.forEach(clearTimeout);
    state.timeouts = [];
  }

  // ----------------------------
  // UI helpers
  // ----------------------------
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function randAmount() {
    const arr = ["30만 원", "50만 원", "90만 원", "100만 원", "200만 원", "300만 원", "500만 원"];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function fillPlaceholders(text) {
    return String(text || "")
      .replaceAll("[[AMOUNT]]", randAmount())
      .replaceAll("[[BANK]]", "은행")
      .replaceAll("[[ACCOUNT]]", "000-0000-0000 (예금주: ○○○)");
  }

  function show(viewName) {
    el.viewThemeList.hidden = true;
    el.viewRoomList.hidden = true;
    el.viewChat.hidden = true;

    if (viewName === "THEME") el.viewThemeList.hidden = false;
    if (viewName === "ROOM") el.viewRoomList.hidden = false;
    if (viewName === "CHAT") el.viewChat.hidden = false;
  }

  function showChoice(title, choices, onPick) {
    el.choiceTitle.textContent = title;
    el.choiceBtns.innerHTML = "";
    state.inputLocked = false;

    for (const c of choices) {
      const btn = document.createElement("button");
      btn.className = "choice-btn" + (c.danger ? " danger" : "");
      btn.textContent = c.text;

      btn.addEventListener("click", () => {
        if (state.inputLocked) return;
        state.inputLocked = true;

        [...el.choiceBtns.querySelectorAll("button")].forEach(b => (b.disabled = true));
        hideChoice();

        onPick(c);
      }, { once: true });

      el.choiceBtns.appendChild(btn);
    }

    el.choiceSheet.setAttribute("aria-hidden", "false");
  }

  function hideChoice() {
    el.choiceSheet.setAttribute("aria-hidden", "true");
    el.choiceBtns.innerHTML = "";
  }

  function showOverlay(html) {
    el.overlayCard.innerHTML = html;
    el.overlay.setAttribute("aria-hidden", "false");
  }
  function hideOverlay() {
    el.overlay.setAttribute("aria-hidden", "true");
    el.overlayCard.innerHTML = "";
  }

  // ----------------------------
  // render: Theme list (8)
  // ----------------------------
  function renderThemeList() {
    clearAllTimers();
    hideChoice();
    hideOverlay();
    updateRiskScoreUI();

    state.currentTheme = null;
    state.currentRoom = null;
    state.blockedRooms = new Set();

    show("THEME");
    el.themeList.innerHTML = "";

    state.data.themes.forEach((t, idx) => {
      const num = String(idx + 1).padStart(2, "0");

      const li = document.createElement("li");
      li.innerHTML = `
        <button type="button" class="scenario-item" aria-pressed="false" data-theme="${escapeHtml(t.id)}">
          <span class="scenario-left">
            <span class="scenario-num">${num}</span>
            <span class="scenario-ico" aria-hidden="true">${escapeHtml(t.icon || "💬")}</span>
            <span class="scenario-text">
              <span class="scenario-title">
                <span class="t1">${escapeHtml(t.name)}</span>
                <span class="t2">- ${escapeHtml((t.rooms?.[0]?.preview) || "3개 방(A/B/C)로 진행")}</span>
              </span>
            </span>
          </span>
          <span class="scenario-right" aria-hidden="true">›</span>
        </button>
      `;
      li.querySelector("button").addEventListener("click", () => {
        state.currentTheme = t;
        renderRoomList();
      });
      el.themeList.appendChild(li);
    });
  }

  // ----------------------------
  // render: Room list (A/B/C)
  // ----------------------------
  function renderRoomList() {
    clearAllTimers();
    hideChoice();
    hideOverlay();
    updateRiskScoreUI();

    show("ROOM");
    el.roomThemeName.textContent = state.currentTheme?.name || "-";

    el.roomList.innerHTML = "";
    const rooms = state.currentTheme.rooms || [];

    rooms.forEach((r, idx) => {
      if (state.blockedRooms.has(r.id)) return;
      const num = ["A", "B", "C"][idx] ? `${state.currentTheme.id}-${["A","B","C"][idx]}` : r.id;

      const li = document.createElement("li");
      li.innerHTML = `
        <button type="button" class="scenario-item" aria-pressed="false" data-room="${escapeHtml(r.id)}">
          <span class="scenario-left">
            <span class="scenario-num">${escapeHtml(num)}</span>
            <span class="scenario-ico" aria-hidden="true">💬</span>
            <span class="scenario-text">
              <span class="scenario-title">
                <span class="t1">${escapeHtml(r.title)}</span>
                <span class="t2">- ${escapeHtml(r.preview || "")}</span>
              </span>
            </span>
          </span>
          <span class="scenario-right" aria-hidden="true">›</span>
        </button>
      `;

      const btn = li.querySelector("button");
      attachLongPress(btn, () => openRoomLongPress(r));
      btn.addEventListener("click", () => {
        if (btn.dataset.lpFired === "1") return; // long-press guard
        openRoom(r);
      });

      el.roomList.appendChild(li);
    });
  }

  function attachLongPress(target, onLong) {
    let timer = null;
    target.dataset.lpFired = "0";

    const start = () => {
      target.dataset.lpFired = "0";
      timer = setTimeout(() => {
        target.dataset.lpFired = "1";
        onLong();
      }, 1000);
    };
    const cancel = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };

    target.addEventListener("pointerdown", start);
    target.addEventListener("pointerup", cancel);
    target.addEventListener("pointercancel", cancel);
    target.addEventListener("pointerleave", cancel);
  }

  function openRoomLongPress(room) {
    showOverlay(`
      <div class="ov-title">이 채팅방</div>
      <div class="ov-text">롱프레스 메뉴입니다.</div>
      <div class="ov-actions">
        <button id="ovLeave">나가기</button>
        <button class="danger" id="ovBlock">차단(방어 성공)</button>
        <button id="ovCancel">취소</button>
      </div>
    `);

    $("ovCancel").onclick = () => hideOverlay();
    $("ovLeave").onclick = () => hideOverlay();
    $("ovBlock").onclick = () => {
      hideOverlay();
      state.blockedRooms.add(room.id);
      // 롱프레스 차단 성공 점수: 95 (요구사항 A)
      finish(room, "SUCCESS", 95, "롱프레스 차단으로 방어 성공");
    };
  }

  function openRoom(room) {
    state.currentRoom = room;
    startChatPhase1();
  }

  // ----------------------------
  // CHAT
  // ----------------------------
  function setChatTheme(platformTheme) {
    // 최소 4테마: kakao/telegram/insta/line
    // 지금은 색감만 간단히 변경(추후 고도화 가능)
    const shell = el.chatShell;
    shell.dataset.theme = platformTheme || "kakao";

    if (platformTheme === "kakao") {
      document.documentElement.style.setProperty("--chat-bg", "#b2c7d9");
      document.documentElement.style.setProperty("--chat-op-bg", "#ffffff");
      document.documentElement.style.setProperty("--chat-op-text", "#111");
      document.documentElement.style.setProperty("--chat-me-bg", "#fef01b");
      document.documentElement.style.setProperty("--chat-me-text", "#111");
      document.documentElement.style.setProperty("--chat-head-bg", "rgba(255,255,255,.35)");
      el.chatBanner.hidden = false;
      el.peerSub.textContent = "대화 중";
    } else if (platformTheme === "telegram") {
      document.documentElement.style.setProperty("--chat-bg", "#0f172a");
      document.documentElement.style.setProperty("--chat-op-bg", "#1e293b");
      document.documentElement.style.setProperty("--chat-op-text", "#eef2ff");
      document.documentElement.style.setProperty("--chat-me-bg", "#3b82f6");
      document.documentElement.style.setProperty("--chat-me-text", "#fff");
      document.documentElement.style.setProperty("--chat-head-bg", "rgba(15,18,30,.70)");
      el.chatBanner.hidden = true;
      el.peerSub.textContent = "접속 중";
    } else if (platformTheme === "insta") {
      document.documentElement.style.setProperty("--chat-bg", "#000");
      document.documentElement.style.setProperty("--chat-op-bg", "#262626");
      document.documentElement.style.setProperty("--chat-op-text", "#f7f7fb");
      document.documentElement.style.setProperty("--chat-me-bg", "#833ab4");
      document.documentElement.style.setProperty("--chat-me-text", "#fff");
      document.documentElement.style.setProperty("--chat-head-bg", "rgba(0,0,0,.65)");
      el.chatBanner.hidden = true;
      el.peerSub.textContent = "@dm";
    } else if (platformTheme === "line") {
      document.documentElement.style.setProperty("--chat-bg", "#749db7");
      document.documentElement.style.setProperty("--chat-op-bg", "#ffffff");
      document.documentElement.style.setProperty("--chat-op-text", "#111");
      document.documentElement.style.setProperty("--chat-me-bg", "#85e249");
      document.documentElement.style.setProperty("--chat-me-text", "#111");
      document.documentElement.style.setProperty("--chat-head-bg", "rgba(15,18,30,.35)");
      el.chatBanner.hidden = true;
      el.peerSub.textContent = "읽음";
    }
  }

  function startChatPhase1() {
    clearAllTimers();
    hideChoice();
    hideOverlay();
    state.rendered = [];
    state.phase = 1;

    show("CHAT");
    updateRiskScoreUI();

    const theme = state.currentTheme;
    const room = state.currentRoom;

    setChatTheme(theme.platformTheme);
    el.chatTitle.textContent = `${theme.name} · ${room.id} · PHASE 1`;
    el.phaseChip.textContent = "PHASE 1";
    el.peerName.textContent = room.title;

    el.chatBody.innerHTML = "";

    const p1 = room.phase1;

    // (진입 시) 첫 메시지 즉시
    pushMessage(p1.messages[0]);

    // 나머지: 1초 간격(세 줄 구조)
    // p1에 system 포함되어 4개일 수 있으니, 두 번째부터 순차로 스케줄
    let t = 1000;
    for (let i = 1; i < p1.messages.length; i++) {
      const msg = p1.messages[i];
      schedule(() => pushMessage(msg), t);
      t += 1000;
    }

    // 선택지 노출: 마지막 메시지 출력 이후 1초 뒤
    schedule(() => {
      showChoice("선택 (PHASE 1)", p1.choices.map((c) => ({
        text: c.text,
        action: c.action,
        danger: c.action !== "DEFENSE"
      })), onPickPhase1);
    }, t);

    el.chatBack.onclick = () => {
      clearAllTimers();
      renderRoomList();
    };
  }

  function onPickPhase1(choice) {
    clearAllTimers();
    if (choice.action === "DEFENSE") {
      // PHASE1 성공 점수(권장): 85
      finish(state.currentRoom, "SUCCESS", 85, "PHASE 1에서 방어 성공");
      return;
    }

    // 실패: user 말풍선 출력 후 PHASE2
    pushMessage({ id: `u-${Date.now()}`, type: "user", text: choice.text });
    startChatPhase2();
  }

  function startChatPhase2() {
    clearAllTimers();
    hideChoice();
    state.phase = 2;

    const theme = state.currentTheme;
    const room = state.currentRoom;
    const p2 = room.phase2;

    el.chatTitle.textContent = `${theme.name} · ${room.id} · PHASE 2`;
    el.phaseChip.textContent = "PHASE 2";

    // 1초 간격 3개
    schedule(() => pushMessage(p2.messages[0]), 1000);
    schedule(() => pushMessage(p2.messages[1]), 2000);
    schedule(() => pushMessage(p2.messages[2]), 3000);

    // 최종 선택지: 4초
    schedule(() => {
      showChoice("최종 선택 (PHASE 2)", p2.choices.map((c) => ({
        text: c.text,
        action: c.action,
        danger: c.action === "CRITICAL_FAIL"
      })), onPickPhase2);
    }, 4000);
  }

  function onPickPhase2(choice) {
    clearAllTimers();

    if (choice.action === "DEFENSE") {
      // PHASE2 성공 점수(권장): 70
      finish(state.currentRoom, "SUCCESS", 70, "PHASE 2에서 방어 성공");
      return;
    }

    // 치명 실패 → CUT3
    openCut3(state.currentRoom.cut3Type || "TRANSFER");
  }

  function pushMessage(msg) {
    const m = {
      ...msg,
      text: fillPlaceholders(msg.text),
    };
    state.rendered.push(m);

    let html = "";
    if (m.type === "system") {
      html = `<div class="msg op" data-mid="${escapeHtml(m.id)}"><div class="bubble">${escapeHtml(m.text)}</div></div>`;
    } else if (m.type === "opponent") {
      html = `
        <div class="msg op" data-mid="${escapeHtml(m.id)}">
          <div class="bubble">${escapeHtml(m.text)}${m.isRedFlag ? `<span class="flag">🚩</span>` : ""}</div>
        </div>`;
    } else if (m.type === "user") {
      html = `
        <div class="msg me" data-mid="${escapeHtml(m.id)}">
          <div class="bubble">${escapeHtml(m.text)}</div>
        </div>`;
    } else if (m.type === "fake_button") {
      html = `
        <div class="msg op" data-mid="${escapeHtml(m.id)}">
          <div class="bubble">
            ${escapeHtml(m.text)}
            <span class="fake-btn">▶️ ${escapeHtml(m.text)}</span>
            ${m.isRedFlag ? `<span class="flag">🚩</span>` : ""}
          </div>
        </div>`;
    }

    el.chatBody.insertAdjacentHTML("beforeend", html);
    el.chatBody.scrollTop = el.chatBody.scrollHeight;
  }

  // ----------------------------
  // CUT3
  // ----------------------------
  function openCut3(type) {
    const title =
      type === "TRANSFER" ? "가짜 송금 화면(훈련)" :
      type === "LOGIN" ? "가짜 로그인 화면(훈련)" :
      "가짜 설치 화면(훈련)";

    const desc =
      type === "TRANSFER" ? "‘진행’ 버튼을 누르면 피해가 확정되는 상황을 재현합니다." :
      type === "LOGIN" ? "‘진행’ 버튼을 누르면 계정 탈취 상황을 재현합니다." :
      "‘진행’ 버튼을 누르면 악성앱 설치 상황을 재현합니다.";

    showOverlay(`
      <div class="ov-title">💀 ${escapeHtml(title)}</div>
      <div class="ov-text">
        ${escapeHtml(desc)}<br><br>
        ※ 실제 정보 입력은 받지 않습니다.
      </div>
      <div class="ov-actions">
        <button class="danger" id="cut3Go">진행(피해 확정)</button>
        <button id="cut3Back">돌아가기</button>
      </div>
    `);

    $("cut3Back").onclick = () => {
      hideOverlay();
      renderRoomList();
    };
    $("cut3Go").onclick = () => {
      hideOverlay();
      finish(state.currentRoom, "FAIL", 30, "최종 실패(피해 발생)");
    };
  }

  // ----------------------------
  // RESULT + REVIEW
  // ----------------------------
  function finish(room, outcome, score, reason) {
    // 점수 저장
    setMapValue(MAP_KEY, room.id, score);
    const newAvg = recomputeRiskScore();
    updateRiskScoreUI();

    const title = outcome === "SUCCESS" ? "✅ 방어 성공" : "🚨 방어 실패 / 피해 발생";
    const dangerBtn = outcome === "FAIL" ? "danger" : "";

    showOverlay(`
      <div class="ov-title">${escapeHtml(title)}</div>
      <div class="ov-text">
        ${escapeHtml(reason)}<br>
        점수: <b>${score}</b><br>
        통합 평균(riskScore): <b>${newAvg ?? "-"}</b>
      </div>
      <div class="ov-actions">
        <button id="btnReview">복기 보기(🚩)</button>
        <button id="btnOther">다른 방 보기</button>
        <button class="${dangerBtn}" id="btnHome">메인으로</button>
      </div>
    `);

    $("btnHome").onclick = () => location.href = "index.html";
    $("btnOther").onclick = () => { hideOverlay(); renderRoomList(); };
    $("btnReview").onclick = () => { hideOverlay(); openReview(); };
  }

  function openReview() {
    // 채팅 DOM이 있어야 하이라이트가 보인다.
    if (el.viewChat.hidden) {
      showOverlay(`
        <div class="ov-title">🚩 복기</div>
        <div class="ov-text">복기는 채팅 화면에서 단서를 강조합니다. 방에 다시 들어가 확인해 주세요.</div>
        <div class="ov-actions">
          <button id="rvBack">돌아가기</button>
        </div>
      `);
      $("rvBack").onclick = () => { hideOverlay(); renderRoomList(); };
      return;
    }

    // red flag 메시지 전부 강조 + 툴팁
    const nodes = [...el.chatBody.querySelectorAll("[data-mid]")];
    let cnt = 0;

    nodes.forEach((n) => {
      const mid = n.getAttribute("data-mid");
      const m = state.rendered.find(x => x.id === mid);
      if (m?.isRedFlag) {
        n.classList.add("hl");
        cnt++;
        const tip = document.createElement("div");
        tip.className = "tip";
        tip.textContent = `해설: ${m.redFlagText || "주의가 필요한 단서입니다."}`;
        n.appendChild(tip);
      }
    });

    showOverlay(`
      <div class="ov-title">🚩 레드 플래그 복기</div>
      <div class="ov-text">
        강조된 단서: <b>${cnt}개</b><br>
        “시간 압박 / 링크 / 제3자 요구 / 설치 유도”는 핵심 위험 신호입니다.
      </div>
      <div class="ov-actions">
        <button id="rvClose">닫기</button>
        <button id="rvList">다른 방 보기</button>
      </div>
    `);

    $("rvClose").onclick = () => hideOverlay();
    $("rvList").onclick = () => { hideOverlay(); renderRoomList(); };
  }

  // ----------------------------
  // init / events
  // ----------------------------
  async function loadData() {
    const res = await fetch("data/messenger_scripts.json", { cache: "no-store" });
    if (!res.ok) throw new Error("messenger_scripts.json load fail");
    return await res.json();
  }

  function bindStaticButtons() {
    el.backHome.onclick = () => location.href = "index.html";
    el.backToThemes.onclick = () => renderThemeList();
  }

  async function init() {
    bindStaticButtons();
    state.data = await loadData();
    updateRiskScoreUI();
    renderThemeList();
  }

  window.addEventListener("beforeunload", clearAllTimers);
  window.addEventListener("focus", updateRiskScoreUI);

  init().catch((e) => {
    console.error(e);
    showOverlay(`
      <div class="ov-title">데이터 로드 실패</div>
      <div class="ov-text">data/messenger_scripts.json 경로/대소문자를 확인하세요.</div>
      <div class="ov-actions"><button id="errHome">메인으로</button></div>
    `);
    $("errHome").onclick = () => location.href = "index.html";
  });
})();