(() => {
  "use strict";

  const STORAGE_KEY = "dictation-settings-v1";

  const LANG_KEY = "dictation-lang-v1";
  const I18N = {
    en: {
      docTitle: "Dictation Practice",
      appTitle: "Dictation",
      appSubtitle: "Paste a list · practice gaps",
      listLabel: "Word / sentence list",
      listPlaceholder: "Paste one item per line\napple\nbanana\nI like reading books.\n你好",
      listHint: "Delay rule: a line with <strong>spaces</strong> (or ending in .?!。！？) uses the <em>sentence</em> wait after speaking; a single token uses the <em>word</em> wait. Tap the <strong>▶</strong> button on any line to replay it right away.",
      wordGap: "Word gap (seconds)",
      sentenceGap: "Sentence gap (seconds)",
      voiceLabel: "Voice",
      speedLabel: "Pronunciation speed",
      randomize: "Randomize order",
      randomized: "List order randomized",
      loadingVoices: "Loading voices…",
      ready: "Ready",
      readyCount: "Ready · {n} item",
      readyCountPlural: "Ready · {n} items",
      playing: "Playing",
      paused: "Paused",
      wait: "Wait {s}s",
      pausedLeft: "Paused · {s}s left",
      speaking: "Speaking…",
      doneCount: "Done · {n} items",
      listMeta: "All {n} item · scroll to browse · ▶ to replay",
      listMetaPlural: "All {n} items · scroll to browse · ▶ to replay",
      start: "Start",
      pause: "Pause",
      resume: "Resume",
      skip: "Skip",
      stop: "Stop",
      playbackControls: "Playback controls",
      language: "Language",
      replay: "Replay",
      replayItem: "Replay item {n}",
      errEmpty: "Paste or type at least one word or sentence (one per line).",
      errNeedTwo: "Add at least two items to randomize the order.",
      errNoVoice: "No voice selected yet. Wait for voices to load, or pick one.",
      errPickVoiceReplay: "Pick a voice first, then tap ▶ to replay.",
      errReplayTts: "Replay TTS failed ({status})",
      errTts: "TTS failed ({status})",
      errVoices: "Could not load full voice list ({err}). Using fallbacks.",
      genderUnknown: "?",
    },
    "zh-Hant": {
      docTitle: "聽寫練習",
      appTitle: "聽寫",
      appSubtitle: "貼上清單 · 練習間隔",
      listLabel: "單字／句子清單",
      listPlaceholder: "每行貼上一個項目\napple\nbanana\nI like reading books.\n你好",
      listHint: "間隔規則：若該行含有<strong>空格</strong>（或以 .?!。！？結尾），朗讀後使用<em>句子</em>間隔；單一詞則使用<em>單字</em>間隔。點任一列的 <strong>▶</strong> 可立即重播。",
      wordGap: "單字間隔（秒）",
      sentenceGap: "句子間隔（秒）",
      voiceLabel: "語音",
      speedLabel: "發音速度",
      randomize: "隨機排序",
      randomized: "已隨機打亂順序",
      loadingVoices: "載入語音中…",
      ready: "準備就緒",
      readyCount: "準備就緒 · {n} 項",
      readyCountPlural: "準備就緒 · {n} 項",
      playing: "播放中",
      paused: "已暫停",
      wait: "等待 {s} 秒",
      pausedLeft: "已暫停 · 尚餘 {s} 秒",
      speaking: "朗讀中…",
      doneCount: "完成 · {n} 項",
      listMeta: "共 {n} 項 · 可捲動瀏覽 · ▶ 重播",
      listMetaPlural: "共 {n} 項 · 可捲動瀏覽 · ▶ 重播",
      start: "開始",
      pause: "暫停",
      resume: "繼續",
      skip: "跳過",
      stop: "停止",
      playbackControls: "播放控制",
      language: "語言",
      replay: "重播",
      replayItem: "重播第 {n} 項",
      errEmpty: "請至少貼上或輸入一個單字或句子（每行一項）。",
      errNeedTwo: "至少需要兩項才能隨機排序。",
      errNoVoice: "尚未選擇語音。請等待語音載入，或手動挑選。",
      errPickVoiceReplay: "請先選擇語音，再點 ▶ 重播。",
      errReplayTts: "重播語音失敗（{status}）",
      errTts: "語音合成失敗（{status}）",
      errVoices: "無法載入完整語音清單（{err}）。已改用備用語音。",
      genderUnknown: "?",
    },
  };

  let lang = "en";

  function detectBrowserLang() {
    const candidates = [
      ...(navigator.languages || []),
      navigator.language,
      navigator.userLanguage,
    ].filter(Boolean);
    for (const raw of candidates) {
      const code = String(raw).toLowerCase().replace("_", "-");
      if (
        code === "zh-hant" ||
        code.startsWith("zh-hant") ||
        code.startsWith("zh-tw") ||
        code.startsWith("zh-hk") ||
        code.startsWith("zh-mo") ||
        code === "zh"
      ) {
        // Prefer Traditional for generic zh / HK / TW / Hant
        return "zh-Hant";
      }
      // zh-CN / zh-Hans → English UI default? Requirement: if starts with zh use Traditional.
      if (code.startsWith("zh")) return "zh-Hant";
    }
    return "en";
  }

  function loadLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "zh-Hant") return saved;
    } catch {
      /* ignore */
    }
    return detectBrowserLang();
  }

  function saveLang(next) {
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
  }

  function t(key, vars = {}) {
    const table = I18N[lang] || I18N.en;
    let s = table[key] ?? I18N.en[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
    return s;
  }

  function applyI18n() {
    document.documentElement.lang = lang === "zh-Hant" ? "zh-Hant" : "en";
    document.title = t("docTitle");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (key) el.innerHTML = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", t(key));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (key) el.setAttribute("aria-label", t(key));
    });

    const switcher = document.querySelector(".lang-switch");
    if (switcher) switcher.setAttribute("aria-label", t("language"));
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const code = btn.getAttribute("data-lang");
      btn.setAttribute("aria-pressed", code === lang ? "true" : "false");
    });

  }

  function setLang(next) {
    if (next !== "en" && next !== "zh-Hant") return;
    lang = next;
    saveLang(lang);
    applyI18n();
    updateProgress();
    renderPreview();
  }

  const PREFERRED_VOICES = [
    "en-GB-SoniaNeural",
    "en-GB-RyanNeural",
    "en-GB-MaisieNeural",
    "en-US-JennyNeural",
    "en-US-AvaMultilingualNeural",
    "zh-HK-HiuMaanNeural",
    "zh-CN-XiaoxiaoNeural",
  ];

  const els = {
    listInput: document.getElementById("listInput"),
    wordGap: document.getElementById("wordGap"),
    sentenceGap: document.getElementById("sentenceGap"),
    voiceSelect: document.getElementById("voiceSelect"),
    speedRange: document.getElementById("speedRange"),
    speedValue: document.getElementById("speedValue"),
    btnRandomize: document.getElementById("btnRandomize"),
    progressLabel: document.getElementById("progressLabel"),
    countdownLabel: document.getElementById("countdownLabel"),
    currentItem: document.getElementById("currentItem"),
    previewList: document.getElementById("previewList"),
    errorBox: document.getElementById("errorBox"),
    player: document.getElementById("player"),
    replayPlayer: document.getElementById("replayPlayer"),
    btnStart: document.getElementById("btnStart"),
    btnPause: document.getElementById("btnPause"),
    btnResume: document.getElementById("btnResume"),
    btnSkip: document.getElementById("btnSkip"),
    btnStop: document.getElementById("btnStop"),
  };

  /** @type {"idle"|"running"|"paused"} */
  let state = "idle";
  /** @type {string[]} */
  let items = [];
  let index = 0;
  let generation = 0;
  let objectUrl = null;
  let audioUnlocked = false;
  let pauseGate = Promise.resolve();
  let releasePause = null;
  let abortWait = null;
  let waitRemainingMs = 0;
  let waitDeadline = 0;
  let countdownRaf = null;
  let sessionPromise = null;
  let replayUrl = null;
  let replayToken = 0;
  let sessionWasPlayingForReplay = false;

  function showError(message) {
    if (!message) {
      els.errorBox.hidden = true;
      els.errorBox.textContent = "";
      return;
    }
    els.errorBox.hidden = false;
    els.errorBox.textContent = message;
  }

  function getSpeechRate() {
    const n = Number(els.speedRange?.value);
    if (!Number.isFinite(n)) return 1;
    return Math.min(1.5, Math.max(0.5, Math.round(n * 100) / 100));
  }

  function formatSpeedLabel(rate) {
    const rounded = Math.round(rate * 100) / 100;
    const text = Number.isInteger(rounded * 10) || Math.abs(rounded * 10 - Math.round(rounded * 10)) < 1e-9
      ? rounded.toFixed(1)
      : String(rounded);
    return `${text}×`;
  }

  function updateSpeedLabel() {
    if (els.speedValue) {
      els.speedValue.textContent = formatSpeedLabel(getSpeechRate());
    }
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function onRandomize() {
    if (state !== "idle") {
      // If session is stuck, recover so the user can shuffle again.
      finishSession(false);
    }
    const list = parseItems(els.listInput.value);
    if (list.length < 2) {
      showError(t("errNeedTwo"));
      setControls();
      return;
    }
    showError("");
    shuffleInPlace(list);
    els.listInput.value = list.join("\n");
    items = list.slice();
    lastPreviewItemsKey = ""; // force preview rebuild
    saveSettings();
    setControls();
    updateProgress();
    renderPreview();
    els.progressLabel.textContent = t("randomized");
  }

    function parseItems(text) {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  function isSentence(line) {
    if (/\s/.test(line)) return true;
    return /[.?!。！？]$/.test(line);
  }

  function gapFor(line) {
    const wordSec = Math.max(0, Number(els.wordGap.value) || 0);
    const sentenceSec = Math.max(0, Number(els.sentenceGap.value) || 0);
    return (isSentence(line) ? sentenceSec : wordSec) * 1000;
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.wordGap === "number") els.wordGap.value = String(data.wordGap);
      if (typeof data.sentenceGap === "number") els.sentenceGap.value = String(data.sentenceGap);
      if (typeof data.speed === "number" && Number.isFinite(data.speed)) {
        els.speedRange.value = String(Math.min(1.5, Math.max(0.5, data.speed)));
      }
      if (typeof data.text === "string") els.listInput.value = data.text;
      if (typeof data.voice === "string") els.voiceSelect.dataset.savedVoice = data.voice;
    } catch {
      /* ignore */
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          wordGap: Number(els.wordGap.value) || 10,
          sentenceGap: Number(els.sentenceGap.value) || 30,
          speed: getSpeechRate(),
          voice: els.voiceSelect.value || "",
          text: els.listInput.value,
        })
      );
    } catch {
      /* ignore */
    }
  }

  function setControls() {
    const idle = state === "idle";
    const running = state === "running";
    const paused = state === "paused";
    els.btnStart.disabled = !idle;
    els.btnPause.disabled = !running;
    els.btnResume.disabled = !paused;
    els.btnSkip.disabled = idle;
    els.btnStop.disabled = idle;
    els.listInput.disabled = !idle;
    els.wordGap.disabled = !idle;
    els.sentenceGap.disabled = !idle;
    els.voiceSelect.disabled = !idle;
    if (els.speedRange) els.speedRange.disabled = !idle;
    if (els.btnRandomize) els.btnRandomize.disabled = !idle;
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  let lastPreviewItemsKey = "";
  let lastPreviewIndex = -1;
  let lastPreviewState = "";

  function itemClassFor(i) {
    if (state !== "idle" && i < index) return "done";
    if (state !== "idle" && i === index) return "current";
    return "";
  }

  function renderPreview(opts = {}) {
    const forceScroll = Boolean(opts.forceScroll);
    if (!items.length) {
      els.previewList.hidden = true;
      els.previewList.innerHTML = "";
      lastPreviewItemsKey = "";
      lastPreviewIndex = -1;
      lastPreviewState = state;
      const meta = document.getElementById("listMeta");
      if (meta) meta.textContent = "";
      return;
    }

    els.previewList.hidden = false;
    const itemsKey = items.join("\n");
    const itemsChanged = itemsKey !== lastPreviewItemsKey;
    const indexChanged = index !== lastPreviewIndex;
    const stateChanged = state !== lastPreviewState;

    const meta = document.getElementById("listMeta");
    if (meta) {
      meta.textContent =
        items.length === 1
          ? t("listMeta", { n: items.length })
          : t("listMetaPlural", { n: items.length });
    }

    if (itemsChanged) {
      const prevScroll = els.previewList.scrollTop;
      els.previewList.innerHTML = items
        .map((item, i) => {
          const cls = itemClassFor(i);
          return (
            `<li class="${cls}" data-index="${i}">` +
            `<button type="button" class="btn-replay" data-replay="${i}" aria-label="${escapeHtml(t("replayItem", { n: i + 1 }))}" title="${escapeHtml(t("replay"))}">▶</button>` +
            `<span class="item-text">${escapeHtml(item)}</span>` +
            `</li>`
          );
        })
        .join("");
      // Keep scroll unless this is a brand-new list
      if (lastPreviewItemsKey) {
        els.previewList.scrollTop = prevScroll;
      }
    } else if (indexChanged || stateChanged) {
      // Update classes in place so the full list stays mounted and scrollable
      els.previewList.querySelectorAll("li[data-index]").forEach((li) => {
        const i = Number(li.getAttribute("data-index"));
        li.classList.remove("done", "current");
        const cls = itemClassFor(i);
        if (cls) li.classList.add(cls);
      });
    }

    // Only auto-follow the current item when the active index changes (or forced),
    // so users can freely scroll the FULL list without being yanked back.
    if ((indexChanged || forceScroll) && state !== "idle") {
      const current = els.previewList.querySelector("li.current");
      if (current) {
        current.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    lastPreviewItemsKey = itemsKey;
    lastPreviewIndex = index;
    lastPreviewState = state;
  }

  function updateProgress(extra) {
    if (state === "idle") {
      els.progressLabel.textContent =
        extra ||
        (items.length
          ? items.length === 1
            ? t("readyCount", { n: items.length })
            : t("readyCountPlural", { n: items.length })
          : t("ready"));
      els.currentItem.textContent = "—";
      if (!extra) els.countdownLabel.textContent = "";
      renderPreview();
      return;
    }
    const n = items.length;
    const i = Math.min(index + 1, n);
    const label = state === "paused" ? t("paused") : t("playing");
    els.progressLabel.textContent = `${label} · ${i} / ${n}`;
    els.currentItem.textContent = items[index] ?? "—";
    renderPreview();
  }

  function stopCountdown() {
    if (countdownRaf) {
      cancelAnimationFrame(countdownRaf);
      countdownRaf = null;
    }
  }

  function tickCountdown() {
    if (!waitDeadline) return;
    const left = Math.max(0, waitDeadline - Date.now());
    waitRemainingMs = left;
    els.countdownLabel.textContent = t("wait", { s: (left / 1000).toFixed(1) });
    if (left > 0 && state === "running") {
      countdownRaf = requestAnimationFrame(tickCountdown);
    }
  }

  function ensurePauseGate() {
    if (state === "paused") {
      if (!releasePause) {
        pauseGate = new Promise((resolve) => {
          releasePause = resolve;
        });
      }
      return pauseGate;
    }
    return Promise.resolve();
  }

  async function waitGap(ms, gen) {
    waitRemainingMs = ms;
    while (waitRemainingMs > 0) {
      if (gen !== generation) return "stop";
      await ensurePauseGate();
      if (gen !== generation) return "stop";
      if (state === "idle") return "stop";

      const slice = waitRemainingMs;
      waitDeadline = Date.now() + slice;
      tickCountdown();

      const outcome = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve("done"), slice);
        abortWait = (reason) => {
          clearTimeout(timer);
          resolve(reason);
        };
      });
      abortWait = null;
      stopCountdown();

      if (outcome === "done") {
        waitRemainingMs = 0;
        waitDeadline = 0;
        els.countdownLabel.textContent = "";
        return "done";
      }
      if (outcome === "skip") {
        waitRemainingMs = 0;
        waitDeadline = 0;
        els.countdownLabel.textContent = "";
        return "skip";
      }
      if (outcome === "stop") {
        waitRemainingMs = 0;
        waitDeadline = 0;
        els.countdownLabel.textContent = "";
        return "stop";
      }
      if (outcome === "pause") {
        waitRemainingMs = Math.max(0, waitDeadline - Date.now());
        waitDeadline = 0;
        els.countdownLabel.textContent = t("pausedLeft", {
          s: (waitRemainingMs / 1000).toFixed(1),
        });
        // loop continues after resume via ensurePauseGate
      }
    }
    return "done";
  }

  function revokeReplayUrl() {
    if (replayUrl) {
      URL.revokeObjectURL(replayUrl);
      replayUrl = null;
    }
  }

  function flashItem(i) {
    const li = els.previewList.querySelector(`li[data-index="${i}"]`);
    if (!li) return;
    li.classList.remove("flash");
    // force reflow for retrigger
    void li.offsetWidth;
    li.classList.add("flash");
    setTimeout(() => li.classList.remove("flash"), 700);
  }

  async function replayItem(i, presetText) {
    // Works in idle (before Start) and during a session — no Start required.
    // Source of truth for idle: textarea. Capture text BEFORE any DOM rebuild
    // so we never speak the wrong line after a re-render.
    if (state === "idle") {
      items = parseItems(els.listInput.value);
    }

    const text =
      typeof presetText === "string" && presetText.length
        ? presetText
        : items[i];
    if (!text) {
      showError(t("errEmpty"));
      return;
    }

    // Keep in-memory list aligned for flash/highlight, but do not rebuild
    // before we've locked in `text` (that previously caused wrong-item bugs).
    if (state === "idle" && items[i] !== text) {
      // Index may be stale relative to textarea; still speak clicked text.
    }

    const voice = els.voiceSelect.value || "en-GB-SoniaNeural";
    if (!els.voiceSelect.value) {
      try {
        els.voiceSelect.value = voice;
      } catch {
        /* ignore */
      }
    }

    showError("");
    flashItem(i);
    // Must unlock on this tap gesture (especially iOS) — do not wait for Start.
    await unlockAudio();

    const token = ++replayToken;
    // Briefly pause session audio so replay is clear; resume after.
    sessionWasPlayingForReplay = false;
    try {
      if (state !== "idle" && !els.player.paused && !els.player.ended) {
        els.player.pause();
        sessionWasPlayingForReplay = true;
      }
    } catch {
      /* ignore */
    }

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, rate: getSpeechRate() }),
      });
      if (token !== replayToken) return;
      if (!res.ok) {
        let detail = t("errReplayTts", { status: res.status });
        try {
          const err = await res.json();
          if (err?.error?.message) detail = err.error.message;
        } catch {
          /* ignore */
        }
        throw new Error(detail);
      }
      const blob = await res.blob();
      if (token !== replayToken) return;
      revokeReplayUrl();
      replayUrl = URL.createObjectURL(blob);
      els.replayPlayer.src = replayUrl;
      try {
        await els.replayPlayer.play();
      } catch (playErr) {
        // One more unlock attempt then retry once (Safari quirks).
        audioUnlocked = false;
        await unlockAudio();
        await els.replayPlayer.play();
      }
      await new Promise((resolve) => {
        const done = () => {
          els.replayPlayer.removeEventListener("ended", done);
          els.replayPlayer.removeEventListener("error", done);
          resolve();
        };
        els.replayPlayer.addEventListener("ended", done);
        els.replayPlayer.addEventListener("error", done);
      });
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    } finally {
      if (token === replayToken && sessionWasPlayingForReplay && state === "running") {
        els.player.play().catch(() => {});
      }
      sessionWasPlayingForReplay = false;
    }
  }

  async function unlockAudio() {
    if (audioUnlocked) return;
    const silent =
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
    // Unlock BOTH elements on the same user gesture. Idle ▶ uses replayPlayer;
    // Start session uses player. iOS Safari gates each element separately.
    const unlockOne = async (audioEl) => {
      if (!audioEl) return;
      audioEl.src = silent;
      try {
        await audioEl.play();
        audioEl.pause();
        audioEl.currentTime = 0;
      } catch {
        /* continue */
      }
      try {
        audioEl.removeAttribute("src");
        audioEl.load();
      } catch {
        /* ignore */
      }
    };
    await unlockOne(els.player);
    await unlockOne(els.replayPlayer);
    audioUnlocked = true;
  }

  function revokeObjectUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function stopPlayer() {
    try {
      els.player.pause();
      els.player.removeAttribute("src");
      els.player.load();
    } catch {
      /* ignore */
    }
    revokeObjectUrl();
  }

  async function fetchAndPlay(text, gen) {
    const voice = els.voiceSelect.value;
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, rate: getSpeechRate() }),
    });
    if (gen !== generation) return "stop";
    if (!res.ok) {
      let detail = t("errTts", { status: res.status });
      try {
        const err = await res.json();
        if (err?.error?.message) detail = err.error.message;
      } catch {
        /* ignore */
      }
      throw new Error(detail);
    }
    const blob = await res.blob();
    if (gen !== generation) return "stop";
    revokeObjectUrl();
    objectUrl = URL.createObjectURL(blob);
    els.player.src = objectUrl;

    return await new Promise((resolve) => {
      const onEnded = () => {
        cleanup();
        resolve("done");
      };
      const onError = () => {
        cleanup();
        resolve("error");
      };
      const cleanup = () => {
        els.player.removeEventListener("ended", onEnded);
        els.player.removeEventListener("error", onError);
      };
      els.player.addEventListener("ended", onEnded);
      els.player.addEventListener("error", onError);

      const tryPlay = () => {
        const p = els.player.play();
        if (p && typeof p.then === "function") p.catch(onError);
      };

      // If paused before play starts, wait
      ensurePauseGate().then(() => {
        if (gen !== generation) {
          cleanup();
          resolve("stop");
          return;
        }
        tryPlay();
      });

      // Expose abort for skip/stop while playing
      abortWait = (reason) => {
        cleanup();
        try {
          els.player.pause();
        } catch {
          /* ignore */
        }
        resolve(reason);
      };
    }).finally(() => {
      abortWait = null;
    });
  }

  async function runSession(gen) {
    while (index < items.length && gen === generation) {
      await ensurePauseGate();
      if (gen !== generation) break;

      updateProgress();
      els.countdownLabel.textContent = t("speaking");

      let playResult;
      try {
        playResult = await fetchAndPlay(items[index], gen);
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
        playResult = "error";
        await waitGap(800, gen);
      }

      if (gen !== generation) break;
      if (playResult === "stop") break;
      if (playResult === "skip") {
        index += 1;
        continue;
      }

      const isLast = index >= items.length - 1;
      if (!isLast) {
        const gapResult = await waitGap(gapFor(items[index]), gen);
        if (gapResult === "stop") break;
        if (gapResult === "skip") {
          index += 1;
          continue;
        }
      }

      index += 1;
      updateProgress();
    }

    if (gen === generation) {
      finishSession(true);
    }
  }

  function finishSession(completed) {
    generation += 1;
    stopCountdown();
    waitDeadline = 0;
    waitRemainingMs = 0;
    if (abortWait) abortWait("stop");
    abortWait = null;
    if (releasePause) {
      releasePause();
      releasePause = null;
    }
    stopPlayer();
    state = "idle";
    index = 0;
    setControls();
    updateProgress(
      completed && items.length ? t("doneCount", { n: items.length }) : undefined
    );
    els.countdownLabel.textContent = "";
  }

  async function onStart() {
    try {
      // Recover if a prior session crashed without finishSession (Start stuck disabled).
      if (state !== "idle") {
        finishSession(false);
      }

      items = parseItems(els.listInput.value);
      if (!items.length) {
        showError(t("errEmpty"));
        setControls();
        return;
      }

      if (!els.voiceSelect.value) {
        try {
          els.voiceSelect.value = "en-GB-SoniaNeural";
        } catch {
          /* ignore */
        }
      }
      if (!els.voiceSelect.value) {
        showError(t("errNoVoice"));
        setControls();
        return;
      }

      saveSettings();
      showError("");
      await unlockAudio();
      generation += 1;
      const gen = generation;
      index = 0;
      state = "running";
      releasePause = null;
      pauseGate = Promise.resolve();
      setControls();
      updateProgress();
      renderPreview({ forceScroll: true });
      sessionPromise = runSession(gen).catch((err) => {
        console.error("runSession failed", err);
        showError(err instanceof Error ? err.message : String(err));
        if (gen === generation) finishSession(false);
      });
    } catch (err) {
      console.error("onStart failed", err);
      showError(err instanceof Error ? err.message : String(err));
      state = "idle";
      setControls();
    }
  }

  function onPause() {
    if (state !== "running") return;
    state = "paused";
    pauseGate = new Promise((resolve) => {
      releasePause = resolve;
    });
    try {
      els.player.pause();
    } catch {
      /* ignore */
    }
    // Only interrupt gap waits — keep the play promise alive so Resume can
    // continue the same audio clip via player.play().
    const waitingGap = waitDeadline > 0 || waitRemainingMs > 0;
    if (waitingGap && abortWait) abortWait("pause");
    setControls();
    updateProgress();
  }

  function onResume() {
    if (state !== "paused") return;
    state = "running";
    setControls();
    updateProgress();
    if (els.player.src && !els.player.ended && els.player.paused && els.player.currentTime > 0) {
      els.player.play().catch(() => {});
    }
    if (releasePause) {
      const r = releasePause;
      releasePause = null;
      r();
    }
  }

  function onSkip() {
    if (state === "idle") return;
    if (abortWait) abortWait("skip");
    else {
      // mark skip by bumping through wait/play via abort next time
      // force index advance if nothing pending
      index += 1;
      updateProgress();
    }
  }

  function onStop() {
    if (state === "idle") return;
    finishSession(false);
  }

  function pickDefaultVoice(voices) {
    const saved = els.voiceSelect.dataset.savedVoice;
    if (saved && voices.some((v) => v.ShortName === saved)) return saved;
    for (const pref of PREFERRED_VOICES) {
      if (voices.some((v) => v.ShortName === pref)) return pref;
    }
    const enGb = voices.find((v) => v.Locale === "en-GB");
    if (enGb) return enGb.ShortName;
    const enUs = voices.find((v) => v.Locale === "en-US");
    if (enUs) return enUs.ShortName;
    return voices[0]?.ShortName || "";
  }

  function populateVoices(voices) {
    const priorityLocales = new Set([
      "en-GB",
      "en-US",
      "en-AU",
      "zh-HK",
      "zh-CN",
      "zh-TW",
      "yue-CN",
    ]);
    const preferred = voices.filter((v) => priorityLocales.has(v.Locale));
    const rest = voices.filter((v) => !priorityLocales.has(v.Locale));
    const ordered = [...preferred, ...rest];
    els.voiceSelect.innerHTML = "";
    for (const v of ordered) {
      const opt = document.createElement("option");
      opt.value = v.ShortName;
      opt.textContent = `${v.ShortName} (${v.Gender || t("genderUnknown")})`;
      els.voiceSelect.appendChild(opt);
    }
    const def = pickDefaultVoice(voices);
    if (def) els.voiceSelect.value = def;
  }

  async function loadVoices() {
    try {
      const res = await fetch("/api/voices");
      if (!res.ok) throw new Error(`voices HTTP ${res.status}`);
      const data = await res.json();
      const voices = data.voices || [];
      if (!voices.length) throw new Error("No voices returned");
      populateVoices(voices);
      saveSettings();
      renderPreview();
    } catch (err) {
      els.voiceSelect.innerHTML = "";
      const fallback = [
        "en-GB-SoniaNeural",
        "en-US-JennyNeural",
        "en-US-AvaMultilingualNeural",
        "zh-CN-XiaoxiaoNeural",
      ];
      for (const name of fallback) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        els.voiceSelect.appendChild(opt);
      }
      const saved = els.voiceSelect.dataset.savedVoice;
      els.voiceSelect.value =
        saved && fallback.includes(saved) ? saved : fallback[0];
      showError(
        t("errVoices", { err: err instanceof Error ? err.message : err })
      );
      renderPreview();
    }
  }

  ["input", "change"].forEach((evt) => {
    els.listInput.addEventListener(evt, saveSettings);
    els.wordGap.addEventListener(evt, saveSettings);
    els.sentenceGap.addEventListener(evt, saveSettings);
    els.voiceSelect.addEventListener(evt, saveSettings);
    if (els.speedRange) {
      els.speedRange.addEventListener(evt, () => {
        updateSpeedLabel();
        saveSettings();
      });
    }
  });

  if (els.btnRandomize) {
    els.btnRandomize.addEventListener("click", onRandomize);
  }

  els.btnStart.addEventListener("click", onStart);
  els.btnPause.addEventListener("click", onPause);
  els.btnResume.addEventListener("click", onResume);
  els.btnSkip.addEventListener("click", onSkip);
  els.btnStop.addEventListener("click", onStop);

  els.listInput.addEventListener("input", () => {
    if (state === "idle") {
      items = parseItems(els.listInput.value);
      updateProgress();
      renderPreview();
    }
  });

  els.previewList.addEventListener("click", (event) => {
    const btn = event.target.closest("button.btn-replay");
    if (!btn || !els.previewList.contains(btn)) return;
    event.preventDefault();
    event.stopPropagation();
    const li = btn.closest("li[data-index]");
    const raw = btn.getAttribute("data-replay") ?? li?.getAttribute("data-index");
    const i = Number(raw);
    if (!Number.isFinite(i) || i < 0) return;

    // Prefer the visible line text from the clicked row (avoids speaking item 0
    // when indices are stale). Fall back to items[i] / textarea parse.
    const shown = li?.querySelector(".item-text")?.textContent ?? "";
    const listNow =
      state === "idle" ? parseItems(els.listInput.value) : items.slice();
    const text = shown || listNow[i] || "";
    if (state === "idle") items = listNow;
    replayItem(i, text);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLang(btn.getAttribute("data-lang"));
    });
  });

  lang = loadLang();
  loadSettings();
  updateSpeedLabel();
  items = parseItems(els.listInput.value);
  applyI18n();
  setControls();
  updateProgress();
  renderPreview();
  loadVoices();
})();
