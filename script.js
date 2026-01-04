"use strict";

/**
 * 25 題整合測驗（人話版）
 * - 全部在瀏覽器本機計算，不上傳
 * - 支援即時計分、重測、複製結果、分享連結（可選）
 */

const SCALE = [
  { value: 1, label: "1 非常不同意" },
  { value: 2, label: "2 不同意" },
  { value: 3, label: "3 普通" },
  { value: 4, label: "4 同意" },
  { value: 5, label: "5 非常同意" },
];

const SECTIONS = [
  {
    id: "sst",
    title: "一、關係策略轉向（SST 模組）",
    items: [
      "我不再想認識很多人，只想好好珍惜少數重要的人",
      "關係品質比認識多少人更重要",
      "我會主動退出讓我感到消耗的關係",
      "維持關係不再是我人生的優先任務",
      "我對「擴展人脈」的渴望明顯下降",
    ],
  },
  {
    id: "airs",
    title: "二、真實自我關係（AIRS 模組）",
    items: [
      "和現在重要的人相處，我可以做自己",
      "我能說實話而不怕被排斥",
      "我不需要戴面具來維持關係",
      "關係讓我更像自己，而不是更不像",
      "我不會為了關係犧牲核心價值",
    ],
  },
  {
    id: "bai",
    title: "三、界線自動化（BAI 模組）",
    items: [
      "當我感到不舒服時，我會立刻拉開距離",
      "我能在沒有罪惡感的狀態下說不",
      "不舒服本身就是我是否靠近一個人的判斷依據",
      "我不想再撐任何讓我不像自己的互動",
      "退出關係對我來說已經變得自然",
    ],
  },
  {
    id: "em",
    title: "四、能量與意義優先權（EM 模組）",
    items: [
      "我會優先保護自己的時間與精神能量",
      "我不想再為了「看起來好看」而做違心的事",
      "對我來說，有意義比有掌聲更重要",
      "我開始對「值不值得」特別敏感",
      "我更在意心是否自由，而不是被看好",
    ],
  },
  {
    id: "id",
    title: "五、整合完成度（ID 模組）",
    items: [
      "我感覺自己正在進入人生的下一個版本",
      "我不想再過「撐著的日子」",
      "我知道什麼人不能進入我的人生",
      "我能清楚感覺到自己已經和過去不同",
      "我正在把舊的人生模式關機",
    ],
  },
];

const VERSION_BANDS = [
  {
    min: 25,
    max: 55,
    label: "v1.x 擴張探索期",
    desc:
      "你較偏向拓展連結、探索資源與位置的階段。此階段重點常在於經驗累積、社交範圍擴張與多元嘗試。",
  },
  {
    min: 56,
    max: 85,
    label: "v2.x 轉向臨界期",
    desc:
      "你正從『量』轉向『質』：開始更在意互動是否真實、是否消耗、是否符合價值。人際策略正在切換中。",
  },
  {
    min: 86,
    max: 110,
    label: "v3.0 成熟精選期",
    desc:
      "你更重視少而深、能做自己、能說真話的關係；界線更自然，能量與意義優先。人際圈可能變小但更穩更自由。",
  },
  {
    min: 111,
    max: 125,
    label: "v3.5 自我完成期",
    desc:
      "你的人際與價值策略已高度穩定：自我一致、界線自動化、關係極高真實度。你會很清楚『什麼值得、什麼不必』。",
  },
];

const els = {
  quizRoot: document.getElementById("quizRoot"),
  totalScore: document.getElementById("totalScore"),
  answeredCount: document.getElementById("answeredCount"),
  versionLabel: document.getElementById("versionLabel"),
  versionDesc: document.getElementById("versionDesc"),
  btnReset: document.getElementById("btnReset"),
  btnCopy: document.getElementById("btnCopy"),
  btnShareLink: document.getElementById("btnShareLink"),
  shareHint: document.getElementById("shareHint"),
  year: document.getElementById("year"),
  finalResult: document.getElementById("finalResult"),
  bgm: document.getElementById("bgm"),
  btnMusicToggle: document.getElementById("btnMusicToggle"),
  musicVolume: document.getElementById("musicVolume"),
  musicHint: document.getElementById("musicHint"),
  radar: document.getElementById("radar"),
  radarHint: document.getElementById("radarHint"),
};

els.year.textContent = String(new Date().getFullYear());

/** 建題目 */
function renderQuiz() {
  let qIndex = 0;
  for (const section of SECTIONS) {
    const fs = document.createElement("fieldset");
    fs.id = `sec-${section.id}`;

    const legend = document.createElement("legend");
    legend.textContent = section.title;
    fs.appendChild(legend);

    section.items.forEach((text) => {
      qIndex += 1;
      const qId = `q${qIndex}`;

      const wrap = document.createElement("div");
      wrap.className = "q";

      const p = document.createElement("p");
      p.className = "q-title";
      p.textContent = `${qIndex}. ${text}`;
      wrap.appendChild(p);

      const scale = document.createElement("div");
      scale.className = "scale";
      scale.setAttribute("role", "radiogroup");
      scale.setAttribute("aria-label", `第 ${qIndex} 題量表`);

      for (const opt of SCALE) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = qId;
        input.value = String(opt.value);
        input.addEventListener("change", onAnyChange);

        label.appendChild(input);
        const span = document.createElement("span");
        span.textContent = String(opt.value);
        label.appendChild(span);

        scale.appendChild(label);
      }

      wrap.appendChild(scale);
      fs.appendChild(wrap);
    });

    els.quizRoot.appendChild(fs);
  }
}

function getAnswers() {
  // 回傳：{ q1: 1..5, q2: 1..5, ... }（未答不出現）
  const answers = {};
  for (let i = 1; i <= 25; i++) {
    const name = `q${i}`;
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (checked) answers[name] = Number(checked.value);
  }
  return answers;
}

function compute(answers) {
  const answeredCount = Object.keys(answers).length;
  let total = 0;
  for (const v of Object.values(answers)) total += v;

  const band = VERSION_BANDS.find((b) => total >= b.min && total <= b.max) || null;

  return { answeredCount, total, band };
}

function computeSubtotals(answers) {
  // 題目分佈：每 5 題一模組，共 25 題
  const get = (from, to) => {
    let s = 0;
    for (let i = from; i <= to; i++) s += (answers[`q${i}`] ?? 0);
    return s;
  };

  return {
    SST:  get(1, 5),
    AIRS: get(6, 10),
    BAI:  get(11, 15),
    EM:   get(16, 20),
    ID:   get(21, 25),
  };
}

function drawRadar(canvas, subtotals) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const labels = ["SST", "AIRS", "BAI", "EM", "ID"];
  const values = labels.map((k) => subtotals[k] ?? 0);

  // 每模組分數範圍：5～25（但未作答時可能是 0）
  const min = 5;
  const max = 25;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 背景
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.55;
  const radius = Math.min(w, h) * 0.34;

  // 顏色（與你 CSS 的模組色一致概念）
  const colorMap = {
    SST:  "rgba(110,231,255,0.95)",
    AIRS: "rgba(167,139,250,0.95)",
    BAI:  "rgba(52,211,153,0.95)",
    EM:   "rgba(251,191,36,0.95)",
    ID:   "rgba(251,113,133,0.95)",
  };

  // 角度設定：從 -90 度（上方）開始
  const n = labels.length;
  const angle0 = -Math.PI / 2;

  // 畫同心多邊形（網格）
  const rings = 4;
  for (let r = 1; r <= rings; r++) {
    const rr = (radius * r) / rings;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = angle0 + (2 * Math.PI * i) / n;
      const x = cx + rr * Math.cos(a);
      const y = cy + rr * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(180,190,220,0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 軸線
  for (let i = 0; i < n; i++) {
    const a = angle0 + (2 * Math.PI * i) / n;
    const x = cx + radius * Math.cos(a);
    const y = cy + radius * Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(180,190,220,0.16)";
    ctx.stroke();
  }

  // 標籤
  ctx.font = "16px system-ui, -apple-system, Segoe UI, Noto Sans TC, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  labels.forEach((lab, i) => {
    const a = angle0 + (2 * Math.PI * i) / n;
    const tx = cx + (radius + 28) * Math.cos(a);
    const ty = cy + (radius + 28) * Math.sin(a);

    ctx.fillStyle = colorMap[lab] ?? "rgba(233,238,246,0.9)";
    ctx.fillText(lab, tx, ty);
  });

  // 將分數映射到半徑（5～25 -> 0～radius）
  const norm = (v) => {
    // 允許 0（未答）時不爆掉
    if (v <= 0) return 0;
    const t = (v - min) / (max - min);
    return Math.max(0, Math.min(1, t)) * radius;
  };

  // 雷達多邊形（填滿）
  ctx.beginPath();
  labels.forEach((lab, i) => {
    const a = angle0 + (2 * Math.PI * i) / n;
    const rr = norm(subtotals[lab] ?? 0);
    const x = cx + rr * Math.cos(a);
    const y = cy + rr * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(122,162,255,0.18)";
  ctx.strokeStyle = "rgba(122,162,255,0.65)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // 每個點加小圓，並用對應模組色
  labels.forEach((lab, i) => {
    const a = angle0 + (2 * Math.PI * i) / n;
    const rr = norm(subtotals[lab] ?? 0);
    const x = cx + rr * Math.cos(a);
    const y = cy + rr * Math.sin(a);
    ctx.beginPath();
    ctx.arc(x, y, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = colorMap[lab] ?? "rgba(233,238,246,0.9)";
    ctx.fill();
  });

  // 小字：分數提示
  ctx.font = "14px system-ui, -apple-system, Segoe UI, Noto Sans TC, Arial";
  ctx.fillStyle = "rgba(183,192,209,0.9)";
  const summary = labels.map((k) => `${k}:${subtotals[k] ?? 0}`).join("  ");
  ctx.fillText(summary, cx, h * 0.92);
}

function setResult({ answeredCount, total, band }) {
  els.answeredCount.textContent = String(answeredCount);
  els.totalScore.textContent = String(total);

  if (answeredCount < 25) {
    els.finalResult.classList.add("hidden");
    if (els.radarHint) els.radarHint.textContent = "完成 25 題後顯示雷達圖。";
    return;
  }

  els.finalResult.classList.remove("hidden");

  if (!band) {
    els.versionLabel.textContent = "無法判讀";
    els.versionDesc.textContent = "分數異常。";
    return;
  }

  els.versionLabel.textContent = band.label;
  els.versionDesc.textContent = band.desc;

  const answers = getAnswers();
  const subtotals = computeSubtotals(answers);
  drawRadar(els.radar, subtotals);
  if (els.radarHint) els.radarHint.textContent = "雷達圖已更新。";

  els.finalResult.scrollIntoView({ behavior: "smooth" });
}

function onAnyChange() {
  const answers = getAnswers();
  const res = compute(answers);
  setResult(res);
  els.shareHint.textContent = "";
}

/** 清空 */
function resetAll() {
  document.querySelectorAll('input[type="radio"]').forEach((r) => (r.checked = false));
  setResult({ answeredCount: 0, total: 0, band: null });
  els.shareHint.textContent = "已清空，可重新作答。";
}

/** 複製結果文字 */
async function copyResult() {
  const answers = getAnswers();
  const { answeredCount, total, band } = compute(answers);

  const lines = [];
  lines.push("人生關係策略版本｜自評整合測驗");
  lines.push(`總分：${total}/125`);
  lines.push(`已作答：${answeredCount}/25`);
  if (answeredCount === 25 && band) {
    lines.push(`版本：${band.label}`);
    lines.push(`說明：${band.desc}`);
  } else {
    lines.push("版本：尚未完成（完成 25 題後再判讀）");
  }
  lines.push("（本結果為自我覺察參考，非心理診斷。）");

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    els.shareHint.textContent = "已複製到剪貼簿。";
  } catch {
    els.shareHint.textContent = "複製失敗（瀏覽器限制）。你可以手動選取文字複製。";
  }
}

async function copyPageUrl() {
  // 固定複製乾淨的測驗首頁網址（不含 ?query / #hash）
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";

  try {
    await navigator.clipboard.writeText(url.toString());
    els.shareHint.textContent = "測驗頁網址已複製到剪貼簿，直接貼給朋友即可。";
  } catch {
    els.shareHint.textContent = `請手動複製此網址：${url.toString()}`;
  }
}

/** 若網址帶 score=xx，顯示判讀（不自動填題） */
function loadScoreFromUrl() {
  const url = new URL(window.location.href);
  const s = url.searchParams.get("score");
  if (!s) return;

  const score = Number(s);
  if (!Number.isFinite(score)) return;

  const band = VERSION_BANDS.find((b) => score >= b.min && score <= b.max) || null;
  els.answeredCount.textContent = "25";
  els.totalScore.textContent = String(score);
  if (band) {
    els.versionLabel.textContent = band.label;
    els.versionDesc.textContent = band.desc + "（此頁為『分享結果』模式：只顯示總分判讀。）";
  } else {
    els.versionLabel.textContent = "無法判讀";
    els.versionDesc.textContent = "此分享分數不在有效範圍。";
  }
  els.shareHint.textContent = "你可以向下重新作答，產生自己的結果。";
}

// init
renderQuiz();
setResult({ answeredCount: 0, total: 0, band: null });
els.btnReset.addEventListener("click", resetAll);
els.btnCopy.addEventListener("click", copyResult);
els.btnShareLink.addEventListener("click", copyPageUrl);
loadScoreFromUrl();

// ===== BGM controls =====
if (els.bgm && els.btnMusicToggle && els.musicVolume) {
  // 預設音量
  els.bgm.volume = Number(els.musicVolume.value) || 0.25;

  // 音量調整
  els.musicVolume.addEventListener("input", () => {
    els.bgm.volume = Number(els.musicVolume.value);
    try { localStorage.setItem("bgmVolume", String(els.bgm.volume)); } catch {}
  });

  // 讀取上次音量
  try {
    const savedVol = localStorage.getItem("bgmVolume");
    if (savedVol !== null) {
      const v = Math.min(1, Math.max(0, Number(savedVol)));
      if (Number.isFinite(v)) {
        els.bgm.volume = v;
        els.musicVolume.value = String(v);
      }
    }
  } catch {}

  // 播放/暫停切換
  els.btnMusicToggle.addEventListener("click", async () => {
    if (els.bgm.paused) {
      try {
        await els.bgm.play();
        els.btnMusicToggle.textContent = "暫停音樂";
        if (els.musicHint) els.musicHint.textContent = "音樂播放中（可調音量或暫停）。";
      } catch {
        if (els.musicHint) els.musicHint.textContent = "播放被瀏覽器阻擋，請再點一次或確認網站權限。";
      }
    } else {
      els.bgm.pause();
      els.btnMusicToggle.textContent = "播放音樂";
      if (els.musicHint) els.musicHint.textContent = "音樂已暫停。";
    }
  });

  // 如果使用者偏好減少動作/聲音，可選：預設不自動播放已符合
}