(function () {
  const KEYS = {
    voice: "vp_voice_scores",
    smishing: "vp_smishing_scores",
    messenger: "vp_messenger_scores",
    risk: "riskScore",
  };

  function safeParse(json) { try { return JSON.parse(json); } catch { return null; } }

  function readScoreMap(key) {
    const raw = localStorage.getItem(key);
    const obj = raw ? safeParse(raw) : null;
    return (obj && typeof obj === "object") ? obj : {};
  }

  function writeScoreMap(key, mapObj) {
    localStorage.setItem(key, JSON.stringify(mapObj || {}));
  }

  function getAllScores() {
    const maps = [
      readScoreMap(KEYS.voice),
      readScoreMap(KEYS.smishing),
      readScoreMap(KEYS.messenger),
    ];
    const values = [];
    for (const m of maps) {
      for (const k of Object.keys(m)) {
        const v = Number(m[k]);
        if (Number.isFinite(v)) values.push(v);
      }
    }
    return values;
  }

  function computeOverallRiskScore() {
    const values = getAllScores();
    if (!values.length) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }

  function updateOverallRiskScore() {
    const avg = computeOverallRiskScore();
    if (avg === null) return null;
    localStorage.setItem(KEYS.risk, String(avg));
    return avg;
  }

  window.ScoreUtil = {
    KEYS,
    readScoreMap,
    writeScoreMap,
    computeOverallRiskScore,
    updateOverallRiskScore,
  };
})();