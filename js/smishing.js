(() => {
  // 타이밍 설정
  const MSG_GAP = 2500;        

  // 오디오 파일 설정
  const audioGalaxy = new Audio('audio/samsung.mp3'); 
  const audioIphone = new Audio('audio/iphone.mp3');

  const $ = (id) => document.getElementById(id);

  // main elements
  const backHome = $("backHome");
  const scenarioRow = $("scenarioRow");
  const applyScore = $("applyScore");
  const pickScore = $("pickScore"); 

  // overlay elements
  const smsOverlay = $("smsOverlay");
  const smsClose = $("smsClose");
  const screenOff = $("screenOff");

  const noti = $("noti");
  const notiPreview = $("notiPreview");
  const notiTime = $("notiTime");

  const smsTop = $("smsTop");
  const btnBackToScenario = $("btnBackToScenario");
  const themeChip = $("themeChip"); 
  const topTitle = $("topTitle");
  const topSub = $("topSub");

  const viewThread = $("viewThread");
  const viewWeb = $("viewWeb");
  const smsThread = $("smsThread");

  const btnWebBack = $("btnWebBack");
  const webTitle = $("webTitle");
  const webStage = $("webStage");
  const webAddr = $("webAddr");
  const webBody = $("webBody");

  const hint = $("hint");

  const sheetBackdrop = $("sheetBackdrop");
  const sheet = $("sheet");
  const sheetCancel = $("sheetCancel");

  const modalBackdrop = $("modalBackdrop");
  const modal = $("modal");
  const modalTitle = $("modalTitle");
  const modalBody = $("modalBody");
  const modalActions = $("modalActions");

  const toast = $("toast");

  // state
  let current = null;
  let currentMsg = null; 
  let locked = false;
  let chosenMsgId = null;
  let hintTimer = null;
  let msgTimers = [];
  let lpTimer = null;
  let lpMoved = false;

  const SCORE = { base: 50, preempt: 55, clickStop: 50, clickFail: 40 };

  // icons
  const ICON = { 1: svgBox(), 2: svgRibbon(), 3: svgCard(), 4: svgBuilding(), 5: svgSiren(), 6: svgCar() };
  function svgBox(){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 8l-9-5-9 5 9 5 9-5Z" stroke="currentColor" stroke-width="2"/><path d="M3 8v10l9 5 9-5V8" stroke="currentColor" stroke-width="2"/><path d="M12 13v10" stroke="currentColor" stroke-width="2"/></svg>`; }
  function svgRibbon(){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2c2.2 0 4 1.8 4 4 0 2.2-1.8 4-4 4s-4-1.8-4-4c0-2.2 1.8-4 4-4Z" stroke="currentColor" stroke-width="2"/><path d="M8.5 9.5 7 22l5-3 5 3-1.5-12.5" stroke="currentColor" stroke-width="2"/></svg>`; }
  function svgCard(){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 10h18" stroke="currentColor" stroke-width="2"/><path d="M7 15h5" stroke="currentColor" stroke-width="2"/></svg>`; }
  function svgBuilding(){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 21V7l8-4 8 4v14" stroke="currentColor" stroke-width="2"/><path d="M9 21v-8h6v8" stroke="currentColor" stroke-width="2"/><path d="M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" stroke-width="2"/></svg>`; }
  function svgSiren(){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 21h8" stroke="currentColor" stroke-width="2"/><path d="M12 3c-3 0-5 2-5 5v6h10V8c0-3-2-5-5-5Z" stroke="currentColor" stroke-width="2"/><path d="M5 14h14" stroke="currentColor" stroke-width="2"/><path d="M4 7l2 1M20 7l-2 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`; }
  function svgCar(){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 16v-3l2-5h14l2 5v3" stroke="currentColor" stroke-width="2"/><path d="M5 16h14" stroke="currentColor" stroke-width="2"/><path d="M7 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM17 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" stroke="currentColor" stroke-width="2"/></svg>`; }

  const nowLabel = () => {
    const d = new Date();
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2,"0");
    const pm = h >= 12;
    const hh = (h % 12) === 0 ? 12 : (h % 12);
    return `${pm ? "오후" : "오전"} ${hh}:${m}`;
  };

  function esc(s){ return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(()=>toast.classList.add("hidden"), 1200);
  }

  function openModal({title, body, actions}){
    if(!modal) return;
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modalActions.innerHTML = "";
    (actions||[]).forEach(a=>{
      const b = document.createElement("button");
      b.className = `btn${a.primary ? " primary" : ""}`;
      b.textContent = a.label;
      b.addEventListener("click", ()=>{ closeModal(); a.onClick && a.onClick(); });
      modalActions.appendChild(b);
    });
    modalBackdrop.classList.remove("hidden");
    modal.classList.remove("hidden");
  }
  function closeModal(){ 
    if(modalBackdrop) modalBackdrop.classList.add("hidden"); 
    if(modal) modal.classList.add("hidden"); 
  }

  function openSheet(msgId){
    chosenMsgId = msgId;
    if(sheetBackdrop) sheetBackdrop.classList.remove("hidden");
    if(sheet) sheet.classList.remove("hidden");
  }
  function closeSheet(){
    chosenMsgId = null;
    if(sheetBackdrop) sheetBackdrop.classList.add("hidden");
    if(sheet) sheet.classList.add("hidden");
  }

  function clearTimers(){
    msgTimers.forEach(t=>clearTimeout(t));
    msgTimers = [];
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = null;
    if (lpTimer) clearTimeout(lpTimer);
    lpTimer = null;
  }

  function dismissHint(){
    if(hint) hint.classList.add("hidden");
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = null;
  }

  function showOverlay(){
    if(!smsOverlay) return;
    smsOverlay.classList.add("show");
    smsOverlay.setAttribute("aria-hidden","false");
  }
  function hideOverlay(){
    if(!smsOverlay) return;
    smsOverlay.classList.remove("show");
    smsOverlay.setAttribute("aria-hidden","true");
  }

  function showScreenOff(){
    if(!screenOff) return;
    screenOff.classList.remove("hidden");
    requestAnimationFrame(()=>screenOff.classList.add("show"));
  }
  function hideScreenOff(){
    if(!screenOff) return;
    screenOff.classList.remove("show");
    setTimeout(()=>screenOff.classList.add("hidden"), 220);
  }

  function showNoti(preview){
    if(!noti) return;
    notiPreview.textContent = preview || "미리보기…";
    notiTime.textContent = "지금";
    noti.classList.remove("hidden");
  }
  function hideNoti(){ 
    if(noti) noti.classList.add("hidden"); 
  }

  function showThread(){
    if(smsTop) smsTop.classList.remove("hidden");
    if(viewThread) viewThread.classList.remove("hidden");
    if(viewWeb) viewWeb.classList.add("hidden");
  }
  function showWeb(){
    if(smsTop) smsTop.classList.add("hidden");
    if(viewWeb) viewWeb.classList.remove("hidden");
    if(viewThread) viewThread.classList.add("hidden");
  }

  function dimAll(){ 
    if(smsThread) [...smsThread.querySelectorAll(".msg")].forEach(el=> el.classList.add("dimmed")); 
  }

  function safeScoreGet(sid) {
    try {
      if(typeof ScoreUtil !== 'undefined') {
        const map = ScoreUtil.readScoreMap(ScoreUtil.KEYS.smishing);
        return map[String(sid)] !== undefined ? Number(map[String(sid)]) : SCORE.base;
      }
    } catch(e) {}
    return SCORE.base;
  }
  function safeScoreSave(sid, val) {
    try {
      if(typeof ScoreUtil !== 'undefined') {
        const m = ScoreUtil.readScoreMap(ScoreUtil.KEYS.smishing);
        m[String(sid)] = val;
        ScoreUtil.writeScoreMap(ScoreUtil.KEYS.smishing, m);
        ScoreUtil.updateOverallRiskScore();
      }
    } catch(e) {}
    if(pickScore) pickScore.textContent = String(val);
  }

  function setTheme(theme){
    document.body.dataset.os = theme;
    if(themeChip) themeChip.style.display = 'none'; 
  }

  function renderList(){
    if(!scenarioRow) return;
    scenarioRow.innerHTML = "";
    SMISHING_SCENARIOS.forEach(sc=>{
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "scenario-item";
      btn.dataset.sid = String(sc.id);
      btn.setAttribute("aria-pressed","false");

      btn.innerHTML = `
        <span class="scenario-left">
          <span class="scenario-num">${String(sc.id).padStart(2,"0")}</span>
          <span class="scenario-ico" aria-hidden="true">${ICON[sc.id] || ICON[1]}</span>
          <span class="scenario-text">
            <span class="scenario-title">
              <span class="t1">${sc.title.t1}</span>
              <span class="t2">${sc.title.t2}</span>
            </span>
          </span>
        </span>
        <span class="scenario-right" aria-hidden="true">›</span>
      `;
      btn.addEventListener("click", ()=> startScenario(sc.id));
      li.appendChild(btn);
      scenarioRow.appendChild(li);
    });
  }

  function setActiveScenario(sid){
    if(!scenarioRow) return;
    [...scenarioRow.querySelectorAll(".scenario-item")].forEach(b=>{
      const on = b.dataset.sid === String(sid);
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function beginLongPress(msgId) {
    lpMoved = false;
    lpTimer = setTimeout(() => {
      if (!lpMoved) openSheet(msgId);
    }, 600);
  }

  function cancelLongPress() {
    if (lpTimer) clearTimeout(lpTimer);
    lpTimer = null;
  }

  function appendMsg(m){
    try {
      if(!smsThread || !m) return;
      
      const wrap = document.createElement("div");
      wrap.className = "msg in";
      wrap.dataset.msgId = m.id;

      const bubble = document.createElement("div");
      bubble.className = "bubble";

      const text = document.createElement("div");
      text.className = "text";
      text.textContent = m.text || "";

      const link = document.createElement("div");
      link.className = "link";
      link.textContent = m.urlText || "";

      link.addEventListener("click", (e)=>{
        e.preventDefault();
        e.stopPropagation();
        if (locked) return;
        currentMsg = m; 
        enterCut2(m);
      });

      bubble.appendChild(text);
      bubble.appendChild(link);

      bubble.addEventListener("pointerdown", (e)=>{
        if (locked) return;
        if (e.target && e.target.classList && e.target.classList.contains("link")) return;
        beginLongPress(m.id);
      });
      bubble.addEventListener("pointerup", cancelLongPress);
      bubble.addEventListener("pointercancel", cancelLongPress);
      bubble.addEventListener("pointermove", ()=>{ lpMoved = true; });

      // ★ 스마트폰의 기본 우클릭/메뉴 뜨는 것을 강제 차단합니다.
      bubble.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = nowLabel();

      wrap.appendChild(bubble);
      wrap.appendChild(meta);
      smsThread.appendChild(wrap);
      
      smsThread.scrollTop = smsThread.scrollHeight;
    } catch(e) {
      console.warn("Message append error", e);
    }
  }

  function playAudioSafe() {
    try {
      const audio = (current && current.theme === 'galaxy') ? audioGalaxy : audioIphone;
      audio.currentTime = 0;
      audio.play().catch(()=>{}); 
    } catch(e) {}
  }

  function resetOverlayViews(){
    hideNoti();
    hideScreenOff();
    if(smsTop) smsTop.classList.add("hidden");
    if(viewThread) viewThread.classList.add("hidden");
    if(viewWeb) viewWeb.classList.add("hidden");
    if(hint) hint.classList.add("hidden");
    closeSheet();
    closeModal();
  }

  function startScenario(sid){
    try {
      clearTimers();
      resetOverlayViews();

      current = SMISHING_SCENARIOS.find(s=>String(s.id)===String(sid));
      if(!current) return;

      locked = false;
      currentMsg = null;

      setActiveScenario(sid);
      if(pickScore) pickScore.textContent = String(safeScoreGet(sid));

      if(topTitle) topTitle.textContent = "메시지";
      if(topSub) topSub.textContent = "지금";
      if(smsThread) smsThread.innerHTML = "";

      setTheme(current.theme);
      showOverlay();
      showScreenOff(); 

      setTimeout(()=>{
        playAudioSafe(); 
        const previewText = (current.messages && current.messages[0]) ? current.messages[0].text : "";
        const preview = previewText.length > 25 ? previewText.slice(0, 25) + "..." : previewText;
        showNoti(preview);
      }, 1000);
    } catch(e) {}
  }

  if(noti) {
    noti.onclick = () => {
      try {
        hideNoti();
        hideScreenOff();
        if(smsTop) smsTop.classList.remove("hidden");
        showThread();
        
        if(!current || !current.messages) return;

        msgTimers.push(setTimeout(()=> { try { appendMsg(current.messages[0]); }catch(e){} }, 0));
        
        msgTimers.push(setTimeout(()=> { 
          playAudioSafe();
          try { appendMsg(current.messages[1]); }catch(e){}
        }, MSG_GAP));
        
        msgTimers.push(setTimeout(()=> { 
          playAudioSafe();
          try { appendMsg(current.messages[2]); }catch(e){}
        }, MSG_GAP * 2));

        hintTimer = setTimeout(()=>{
          if(hint) hint.classList.remove("hidden");
        }, (MSG_GAP * 2) + 2000);
      } catch(e) {}
    };
  }

  // =========================================================
  // ★ 컷 2 (가짜 사이트 접속 및 1차 방어 퀴즈 노출)
  // =========================================================
  function enterCut2(msgData) {
    try {
      dismissHint();
      showWeb();
      if(webStage) webStage.textContent = "가짜 사이트 접속";
      if(webTitle) webTitle.textContent = msgData.cut2.title || "가짜 사이트";
      if(webAddr) webAddr.textContent = msgData.cut2.addr || msgData.urlText;
      if(webBody) webBody.innerHTML = "";

      // 컷 2 안내 블록
      (msgData.cut2.blocks || []).forEach(b=>{
        const card = document.createElement("div");
        card.className = "web-card";
        if(b.html) {
          card.innerHTML = b.html;
        } else {
          card.innerHTML = `<div class="web-h1">${esc(b.h)}</div><div class="web-p">${esc(b.p)}</div>`;
        }
        webBody.appendChild(card);
      });

      // 컷 2 전용 선택지(퀴즈) 생성
      const quiz = document.createElement("div");
      quiz.className = "quiz";
      quiz.innerHTML = `
        <div class="quiz-q">Q. 화면에서 요구하는 사항을 따르시겠습니까?</div>
        <div class="quiz-desc">가짜 사이트일 수 있습니다. 신중히 선택해 주세요.</div>
        <div class="quiz-opts" id="cut2Opts"></div>
      `;
      webBody.appendChild(quiz);

      const opts = quiz.querySelector("#cut2Opts");

      // [방어 성공] 버튼: 요구를 거부하고 창을 닫음
      const btnSafe = document.createElement("button");
      btnSafe.className = "quiz-btn";
      btnSafe.textContent = "요구를 무시하고 즉시 창을 닫는다.";
      btnSafe.addEventListener("click", () => onCut2Success());
      opts.appendChild(btnSafe);

      // [방어 실패] 버튼: 다운로드/진행 요구를 따름 (누르면 컷3로 이동)
      const trapText = msgData.cut2.trapBtn || "진행하기";
      const btnTrap = document.createElement("button");
      btnTrap.className = "quiz-btn bad";
      btnTrap.textContent = `[진행] ${esc(trapText)}`;
      btnTrap.addEventListener("click", () => enterCut3(msgData));
      opts.appendChild(btnTrap);

    } catch(e) { console.error("Cut 2 error", e); }
  }

  // 컷2 방어 성공 시 호출되는 함수
  function onCut2Success() {
    safeScoreSave(current.id, SCORE.clickStop);
    openModal({
      title: "🛡️ 1차 방어 성공!",
      body: "훌륭합니다! 수상한 앱 설치나 요구를 거부하고 잘 멈추셨습니다.\n\n만약 무심코 사기꾼의 요구를 따랐다면 어떤 일이 벌어졌을지, '수법 엿보기'를 통해 확인해 보세요.",
      actions: [
        { label: "수법 엿보기", primary: true, onClick: () => showCut3Result() },
        { label: "다른 시나리오 해보기", onClick: () => hideOverlay() }
      ]
    });
  }

  // =========================================================
  // ★ 컷 3 (컷2에서 방어 실패 시 넘어오는 치명적 정보/권한 요구 화면)
  // =========================================================
  function enterCut3(msgData) {
    try {
      if(webStage) webStage.textContent = "권한/정보 요구";
      if(webTitle) webTitle.textContent = msgData.cut3.title || "정보 입력";
      if(webBody) webBody.innerHTML = "";

      (msgData.cut3.blocks || []).forEach(b=>{
        const card = document.createElement("div");
        card.className = "web-card";
        if(b.html) {
          card.innerHTML = b.html;
        } else {
          card.innerHTML = `<div class="web-h1">${esc(b.h)}</div><div class="web-p">${esc(b.p)}</div>`;
        }
        webBody.appendChild(card);
      });

      // 컷 3 전용(원래 있던) 퀴즈 노출
      const q = msgData.cut3.quiz;
      if(q) {
        const quiz = document.createElement("div");
        quiz.className = "quiz";
        quiz.innerHTML = `
          <div class="quiz-q">Q. ${esc(q.q)}</div>
          <div class="quiz-desc">${esc(q.desc)}</div>
          <div class="quiz-opts" id="quizOpts"></div>
        `;
        webBody.appendChild(quiz);

        const opts = quiz.querySelector("#quizOpts");

        q.ok.forEach((t) => {
          const btn = document.createElement("button");
          btn.className = "quiz-btn";
          btn.textContent = t;
          btn.addEventListener("click", () => onQuizAnswer(true));
          opts.appendChild(btn);
        });

        const bad = document.createElement("button");
        bad.className = "quiz-btn bad";
        bad.textContent = q.bad;
        bad.addEventListener("click", () => onQuizAnswer(false));
        opts.appendChild(bad);
      }
    } catch(e) { console.error("Cut 3 error", e); }
  }

  // ---------- 컷3 결과 판정 ----------
  function onQuizAnswer(isSafe) {
    if (isSafe) {
      safeScoreSave(current.id, SCORE.clickStop);
      openModal({
        title: "🛡️ 최종 방어 성공! (위기 모면)",
        body: "위험한 단계까지 진입했지만, 다행히 치명적인 정보를 넘기기 직전에 멈추셨습니다.\n\n사기꾼의 최종 목적이 무엇이었는지 '피해 결과 엿보기'를 눌러 확인해 보세요.",
        actions: [
          { label: "피해 결과 엿보기", primary: true, onClick: () => showCut3Result() },
          { label: "다른 시나리오 해보기", onClick: () => hideOverlay() },
        ],
      });
      return;
    }

    safeScoreSave(current.id, SCORE.clickFail);
    showCut3Result();
    setTimeout(() => {
      openModal({
        title: "🚨 방어 실패 (치명적 피해 발생)",
        body: [
          "사기꾼의 함정에 완벽히 빠졌습니다. 의심 없이 정보를 넘겨주거나 앱을 설치했습니다.",
          "",
          "💡 핵심 예방 수칙:",
          ...((currentMsg && currentMsg.explain) || []).map(x => `• ${x}`),
        ].join("\n"),
        actions: [
          { label: "피해 내용 확인", primary: true, onClick: () => { /* 모달 닫기(자동 수행) 후 배경의 showCut3Result 내용 확인 */ } },
          { label: "메인으로 이동", onClick: () => hideOverlay() },
        ],
      });
    }, 1500); 
  }

  // ---------- 피해 결과 화면 ----------
  function showCut3Result() {
    if(!webBody) return;
    if(webStage) webStage.textContent = "피해 결과 (수법 엿보기)";
    if(webTitle) webTitle.textContent = "스미싱 피해 안내";
    webBody.innerHTML = "";

    const explainData = (currentMsg && currentMsg.explain) ? currentMsg.explain : ["피해 정보가 없습니다."];
    
    explainData.forEach(text => {
      const card = document.createElement("div");
      card.className = "web-card";
      
      if(text.includes("🚨")) {
        card.style.background = "#fff1f2";
        card.style.borderColor = "#fecdd3";
        card.innerHTML = `<div class="web-h1" style="color:#e11d48;">치명적 피해 시뮬레이션</div><div class="web-p" style="color:#be123c; font-weight:800;">${esc(text)}</div>`;
      } else {
        card.innerHTML = `<div class="web-h1">💡 예방 수칙</div><div class="web-p">${esc(text)}</div>`;
      }
      webBody.appendChild(card);
    });
  }

  function onPreemptSuccess() {
    safeScoreSave(current.id, SCORE.preempt);
    locked = true;
    dimAll();

    openModal({
      title: "🛡️ 완벽 방어 성공!",
      body: "아주 훌륭합니다. 의심스러운 문자는 링크를 누르지 않고 삭제/신고하는 것이 100점짜리 정답입니다.",
      actions: [
        { label: "다른 시나리오 해보기", primary: true, onClick: () => hideOverlay() },
      ],
    });
  }

  function onSheetAction(action) {
    if (!chosenMsgId) return;

    if (action === "copy") {
      const msg = current.messages.find(m=>m.id===chosenMsgId);
      const txt = `${msg?.text||""}\n${msg?.urlText||""}`.trim();
      navigator.clipboard?.writeText(txt).then(()=>showToast("복사됨")).catch(()=>showToast("복사 실패"));
      closeSheet();
      return;
    }
    if (action === "share") { showToast("공유(연출)"); closeSheet(); return; }
    if (action === "reply") { showToast("답장(연출)"); closeSheet(); return; }

    if (action === "delete" || action === "spam") {
      const el = smsThread.querySelector(`[data-msg-id="${chosenMsgId}"]`);
      if (el) el.remove();
      closeSheet();
      onPreemptSuccess();
      return;
    }

    closeSheet();
  }

  // Event Listeners
  if(backHome) backHome.addEventListener("click", ()=> location.href="index.html");
  if(applyScore) applyScore.addEventListener("click", ()=>{
    if(typeof ScoreUtil !== 'undefined') ScoreUtil.updateOverallRiskScore();
    location.href = "index.html";
  });

  if(smsClose) smsClose.addEventListener("click", ()=>{
    clearTimers();
    resetOverlayViews();
    hideOverlay();
  });

  if(btnBackToScenario) btnBackToScenario.addEventListener("click", ()=>{
    clearTimers();
    resetOverlayViews();
    hideOverlay();
  });

  if(btnWebBack) btnWebBack.addEventListener("click", ()=> showThread());
  if(sheetBackdrop) sheetBackdrop.addEventListener("click", closeSheet);
  if(sheetCancel) sheetCancel.addEventListener("click", closeSheet);

  if(sheet) [...sheet.querySelectorAll(".sheet-btn")].forEach(b=>{
    b.addEventListener("click", ()=> onSheetAction(b.dataset.action));
  });

  if(modalBackdrop) modalBackdrop.addEventListener("click", closeModal);
  document.addEventListener("pointerdown", dismissHint, { passive:true });

  renderList();
})();