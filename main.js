(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- color mapping for credit ---------- */
  // c in [-1, 1] : -1 = strong blue, 0 = neutral, 1 = strong red
  const creditColor = (c) => {
    const a = Math.min(1, Math.abs(c));
    if (c >= 0) {
      const L = 95 - a * 38, C = 0.03 + a * 0.16;
      return { bg: `oklch(${L}% ${C} 30)`, fg: a > 0.62 ? "oklch(98% 0.01 80)" : "oklch(23% 0.022 55)" };
    }
    const L = 94 - a * 44, C = 0.025 + a * 0.1;
    return { bg: `oklch(${L}% ${C} 245)`, fg: a > 0.6 ? "oklch(98% 0.01 80)" : "oklch(23% 0.022 55)" };
  };

  /* ---------- hero title tokens ---------- */
  const lightTitle = () => {
    $$(".title .tk").forEach((el, i) => {
      const { bg, fg } = creditColor(parseFloat(el.dataset.c));
      el.style.setProperty("--bg", bg);
      el.style.setProperty("--fg", fg);
      setTimeout(() => el.classList.add("lit"), reduce ? 0 : 700 + i * 140);
    });
  };

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
        e.target.dispatchEvent(new CustomEvent("revealed"));
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  const initReveal = () => {
    $$(".hero .rv").forEach((el, i) => { el.style.transitionDelay = `${i * 90}ms`; });
    $$(".tldr .rv").forEach((el, i) => { el.style.transitionDelay = `${200 + i * 80}ms`; });
    $$(".axes, .theorems").forEach((g) => $$(":scope > *", g).forEach((el, i) => { el.style.transition = `opacity .9s ${i * 120}ms var(--ease-out), transform .9s ${i * 120}ms var(--ease-out)`; }));
    $$(".rv").forEach((el) => io.observe(el));
  };

  /* ---------- top bar ---------- */
  const initBar = () => {
    const bar = $("#bar"), prog = $("#progress");
    const links = $$(".bar nav a");
    const onScroll = () => {
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      bar.classList.toggle("scrolled", y > 8);
      prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const secIO = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("section.sec").forEach((s) => secIO.observe(s));
  };

  /* ---------- noise experiment ---------- */
  const initNoise = () => {
    const uni = $("#nr-uni"), rnd = $("#nr-rand");
    if (!uni) return;
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const gauss = () => { const u = rand() || 1e-6, v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const n = 26;
    for (let i = 0; i < n; i++) {
      const a = document.createElement("i"); uni.appendChild(a);
      const b = document.createElement("i");
      const w = Math.max(0.45, Math.min(1.55, 1 + 0.2 * gauss()));
      b.style.transform = `scaleY(${(w / 1.55).toFixed(3)})`;
      a.style.transform = `scaleY(${(1 / 1.55).toFixed(3)})`;
      b.style.transition = `transform .8s ${i * 25}ms var(--ease-out)`;
      rnd.appendChild(b);
      b.dataset.w = w;
    }
  };

  /* ---------- credit lens ---------- */
  // [token, beta] — approximate values read from the paper's case study 1 (Qwen3-VL-8B)
  const LENS = [
    ["<thinking>", 1.36], ["To", 1.24], ["determine", 1.14], ["which", 1.24], ["activity", 1.33], ["Lily", 1.27], ["did", 1.26], ["earlier", 1.22], [",", 1.28], ["I", 1.24], ["need", 1.1], ["to", 1.16], ["read", 1.22], ["the", 1.27], ["times", 1.31], ["on", 1.26], ["the", 1.24], ["clocks", 1.33], [".", 1.2],
    ["The", 1.28], ["clock", 1.43], ["on", 1.33], ["the", 1.34], ["left", 1.35], [",", 1.16], ["which", 1.31], ["is", 1.25], ["associated", 1.26], ["with", 1.24], ["“", 1.35], ["watch", 1.4], ["ed", 1.37], ["a", 1.29], ["movie", 1.44], ["”", 1.26], [",", 1.24],
    ["has", 1.25], ["its", 1.24], ["hour", 1.32], ["hand", 1.18], ["at", 1.26], ["7", 1.37], ["and", 1.22], ["its", 1.23], ["minute", 1.27], ["hand", 1.18], ["is", 1.17], ["pointing", 1.09], ["to", 1.24], ["the", 1.27], ["12", 1.33], [".", 1.18],
    ["That", 1.25], ["means", 1.17], ["the", 1.32], ["time", 1.26], ["is", 1.24], ["7:00", 1.34], [".", 1.2],
    ["The", 1.25], ["clock", 1.33], ["with", 1.26], ["“", 1.34], ["ate", 1.36], ["dinner", 1.46], ["”", 1.33], [".", 1.2], ["On", 1.13], ["that", 1.2], ["clock", 1.3], [",", 1.25], ["the", 1.24], ["hour", 1.27], ["hand", 1.13], ["is", 1.07], ["pointing", 1.18], ["to", 1.25], ["the", 1.33], ["9", 1.36], [".", 1.2],
    ["So", 1.22], ["the", 1.26], ["time", 1.2], ["is", 1.2], ["9:00", 1.33], [".", 1.18],
    ["Now", 1.05], [",", 1.08], ["I", 1.04], ["compare", 1.03], ["the", 1.17], ["two", 1.19], ["times", 1.21], [":", 1.1],
    ["Watched", 1.32], ["a", 1.3], ["movie", 1.38], ["at", 1.24], ["7:00", 1.26], [",", 1.2], ["which", 1.18], ["is", 1.16], ["before", 1.04], ["9:00", 1.24], [".", 1.2],
    ["Lily", 1.24], ["watched", 1.27], ["a", 1.37], ["movie", 1.3], ["earlier", 1.2], [".", 1.15], ["Therefore", 1.03], [",", 1.06], ["the", 1.17], ["correct", 1.2], ["answer", 1.22], ["is", 1.2], ["B", 1.28], [".", 1.18]
  ];
  const initLens = () => {
    const box = $("#lens-text");
    if (!box) return;
    const frag = document.createDocumentFragment();
    LENS.forEach(([t, b], i) => {
      const s = document.createElement("span");
      s.className = "t";
      s.textContent = t;
      s.dataset.b = b.toFixed(2);
      frag.appendChild(s);
      frag.appendChild(document.createTextNode(" "));
    });
    box.appendChild(frag);
    const spans = $$(".t", box);
    const paint = (mode) => {
      spans.forEach((s, i) => {
        const b = parseFloat(s.dataset.b);
        let c = mode === "hiccr" ? (b - 1.25) / 0.19 : 0;
        const col = mode === "hiccr" ? creditColor(c) : { bg: "oklch(93% 0.012 80)", fg: "oklch(40% 0.02 60)" };
        s.style.transitionDelay = reduce ? "0ms" : `${i * 6}ms`;
        s.style.backgroundColor = col.bg;
        s.style.color = col.fg;
        if (mode !== "hiccr") s.dataset.b = s.dataset.b; // keep tooltip value
      });
      box.dataset.mode = mode;
    };
    paint("uniform");
    $("#lens").addEventListener("revealed", () => setTimeout(() => paint("hiccr"), reduce ? 0 : 450), { once: true });
    $$("#lens .seg button").forEach((btn) => btn.addEventListener("click", () => {
      $$("#lens .seg button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      paint(btn.dataset.mode);
    }));
  };

  /* ---------- Table 1 data ---------- */
  const COLS = ["Geo3K", "MVerse", "MVista", "WeMath", "MV-V", "MathAvg", "MMK12", "Clevr", "Logic", "MMMU", "GenAvg", "AVG"];
  const T1 = {
    "4b": [
      ["Base (Instruct)", "base", [45.42, 43.39, 65.80, 53.39, 40.90, 49.78, 39.44, 90.00, 42.73, 20.52, 48.17, 49.07]],
      ["SAPO", "o", [40.47, 54.17, 48.70, 62.99, 52.80, 51.83, 54.02, 63.50, 50.43, 42.89, 52.71, 52.22]],
      ["GSPO", "o", [59.07, 70.69, 74.90, 74.89, 67.13, 69.34, 56.86, 91.00, 53.47, 41.04, 60.59, 65.45]],
      ["CISPO", "o", [54.08, 64.72, 70.20, 68.51, 59.10, 63.32, 51.38, 88.50, 50.11, 41.33, 57.83, 60.88]],
      ["Reinforce++", "o", [55.24, 71.19, 69.00, 74.66, 66.13, 67.24, 67.37, 83.00, 54.81, 42.54, 61.93, 64.88]],
      ["PAPO", "o", [52.94, 69.29, 68.60, 73.97, 64.13, 65.80, 65.28, 83.00, 53.20, 41.87, 60.84, 63.59]],
      ["DVRP", "o", [59.43, 73.18, 70.80, 75.42, 69.13, 69.60, 61.35, 90.00, 54.17, 43.26, 61.95, 66.20]],
      ["VPPO", "o", [57.08, 70.31, 70.20, 73.12, 66.44, 67.39, 58.22, 90.50, 53.17, 42.06, 60.99, 64.19]],
      ["GRPO", "pair", [53.41, 67.16, 68.70, 68.45, 63.15, 64.17, 55.97, 87.50, 52.35, 40.87, 59.17, 61.95]],
      ["HiCCR-G (Ours)", "g", [61.73, 77.34, 71.70, 78.62, 73.85, 72.65, 68.64, 94.00, 57.05, 46.53, 66.55, 69.94]],
      ["DAPO", "pair", [60.57, 74.40, 72.30, 79.48, 70.26, 71.40, 60.56, 92.00, 54.59, 44.05, 62.80, 67.58]],
      ["HiCCR-D (Ours)", "d", [63.23, 73.21, 73.50, 75.69, 71.18, 71.36, 65.54, 91.50, 60.40, 46.30, 65.93, 68.95]]
    ],
    "8b": [
      ["Base (Instruct)", "base", [51.58, 53.99, 65.70, 60.29, 50.08, 56.33, 45.91, 89.50, 47.87, 36.47, 54.94, 55.71]],
      ["SAPO", "o", [53.35, 60.21, 57.20, 63.47, 56.62, 58.17, 50.36, 72.05, 52.11, 41.84, 54.09, 56.35]],
      ["GSPO", "o", [65.22, 76.10, 76.70, 78.97, 72.40, 73.88, 63.61, 90.50, 57.49, 47.86, 64.86, 69.87]],
      ["CISPO", "o", [57.57, 66.15, 67.70, 69.89, 62.23, 64.71, 53.76, 91.50, 52.35, 45.26, 60.72, 62.93]],
      ["Reinforce++", "o", [65.89, 76.59, 72.80, 79.20, 77.22, 74.94, 70.23, 90.50, 63.98, 50.08, 69.95, 72.32]],
      ["PAPO", "o", [63.23, 76.03, 71.40, 75.84, 75.06, 72.31, 70.75, 89.00, 60.98, 50.01, 67.68, 70.25]],
      ["DVRP", "o", [64.42, 76.15, 72.30, 78.06, 74.41, 73.06, 69.53, 89.00, 59.45, 48.54, 66.63, 70.20]],
      ["VPPO", "o", [60.41, 69.28, 72.00, 73.66, 67.52, 68.17, 60.73, 90.50, 55.38, 47.21, 63.46, 65.58]],
      ["GRPO", "pair", [56.74, 65.23, 68.40, 68.91, 61.93, 64.24, 54.81, 90.50, 52.57, 43.35, 60.31, 62.49]],
      ["HiCCR-G (Ours)", "g", [58.40, 72.29, 73.50, 76.49, 68.27, 69.79, 62.11, 90.00, 57.49, 46.18, 63.94, 67.19]],
      ["DAPO", "pair", [64.23, 73.39, 71.10, 77.13, 68.88, 70.95, 63.99, 89.00, 57.49, 49.36, 64.96, 68.29]],
      ["HiCCR-D (Ours)", "d", [68.39, 78.94, 75.70, 81.03, 75.99, 76.01, 70.58, 92.00, 60.63, 51.56, 68.69, 72.76]]
    ]
  };
  const AVG_IDX = [5, 10, 11];

  const renderTable = (bk) => {
    const rows = T1[bk], tb = $("#t1 tbody");
    const best = COLS.map((_, j) => Math.max(...rows.map((r) => r[2][j])));
    const html = [];
    rows.forEach((r, i) => {
      const [name, kind, v] = r;
      if (i === 0) html.push(`<tr class="group"><td colspan="13">Qwen3-VL-${bk.toUpperCase()} backbone</td></tr>`);
      if (i === 1) html.push(`<tr class="group"><td colspan="13">Other RLVR baselines</td></tr>`);
      if (i === 8) html.push(`<tr class="group"><td colspan="13">Matched pairs: base RL → + HiCCR</td></tr>`);
      const cls = kind === "g" ? "ours" : kind === "d" ? "ours d" : kind === "pair" ? "paired" : "";
      const prev = (kind === "g" || kind === "d") ? rows[i - 1][2] : null;
      const cells = v.map((x, j) => {
        let c = [];
        if (AVG_IDX.includes(j)) c.push("avg");
        if (x === best[j]) c.push("best");
        let g = "";
        if (prev && AVG_IDX.includes(j)) {
          const d = +(x - prev[j]).toFixed(2);
          g = `<small class="${d >= 0 ? "g" : "l"}">${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(2)}</small>`;
        }
        return `<td class="${c.join(" ")}">${x.toFixed(2)}${g}</td>`;
      }).join("");
      html.push(`<tr class="${cls}"><td>${name}</td>${cells}</tr>`);
    });
    tb.innerHTML = html.join("");
  };

  const renderBars = (bk) => {
    const rows = T1[bk];
    const lo = 45, hi = 75;
    const others = rows.filter((r) => r[1] === "o" || r[1] === "base").sort((a, b) => a[2][11] - b[2][11]);
    const pairs = rows.filter((r) => ["pair", "g", "d"].includes(r[1]));
    const box = $("#bars");
    const row = (r, extra = "", gain = null) => {
      const v = r[2][11];
      const w = Math.max(0, (v - lo) / (hi - lo) * 100);
      const cls = r[1] === "g" ? "ours" : r[1] === "d" ? "ours d" : r[1] === "pair" ? "pair" : r[1] === "base" ? "base" : "";
      return `<div class="barrow ${cls} ${extra}"><span class="lab">${r[0].replace(" (Ours)", "")}</span><span class="track"><span class="fill" style="width:0" data-w="${w.toFixed(2)}"></span></span><span class="val">${v.toFixed(2)}${gain !== null ? `<span class="gain">+${gain.toFixed(2)}</span>` : ""}</span></div>`;
    };
    let html = others.map((r) => row(r)).join("");
    pairs.forEach((r, i) => {
      const gain = (r[1] === "g" || r[1] === "d") ? r[2][11] - pairs[i - 1][2][11] : null;
      html += row(r, i % 2 === 0 ? "sep" : "", gain);
    });
    box.innerHTML = html;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$(".fill", box).forEach((f, i) => {
        f.style.transitionDelay = reduce ? "0ms" : `${i * 35}ms`;
        f.style.width = f.dataset.w + "%";
      });
    }));
  };

  const initResults = () => {
    let cur = "8b", shown = false;
    const show = (bk) => { cur = bk; renderTable(bk); if (shown) renderBars(bk); };
    $$("#results .tabs[aria-label='Backbone'] button").forEach((b) => b.addEventListener("click", () => {
      $$("#results .tabs[aria-label='Backbone'] button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      show(b.dataset.bk);
    }));
    renderTable(cur);
    $("#bars").addEventListener("revealed", () => { shown = true; renderBars(cur); }, { once: true });
  };

  /* ---------- Table 7 comparison ---------- */
  const CMP = [
    ["HiCCR-D · 8B", 72.76, "ours", true],
    ["Qwen2.5-VL-72B", 61.65, "open"],
    ["RACRO-7B", 61.43, "reasoning"],
    ["Gemini-2.0-flash", 61.40, "proprietary"],
    ["GPT-4o", 60.95, "proprietary"],
    ["VL-Rethinker-7B", 58.48, "reasoning"],
    ["LLaVA-Critic-R1-7B", 58.01, "reasoning"],
    ["MM-Eureka-7B-CPGD", 57.94, "reasoning"],
    ["InternVL2.5-78B", 55.26, "open"],
    ["GPT-4o-mini", 53.19, "proprietary"],
    ["LLaVA-OV-72B", 49.66, "open"]
  ];
  const initCmp = () => {
    const ul = $("#cmp");
    if (!ul) return;
    const lo = 40, hi = 75;
    ul.innerHTML = CMP.map(([n, v, tag, me]) => {
      const w = ((v - lo) / (hi - lo) * 100).toFixed(1);
      return `<li class="${me ? "me" : ""}"><span class="bg" style="width:${w}%"></span><span>${n}<em>${tag}</em></span><span>${v.toFixed(2)}</span></li>`;
    }).join("");
  };

  /* ---------- Table 2 ladder ---------- */
  const LADDER = [
    ["Uniform", "Same Â for every token", [61.95, 67.58, 62.49, 68.29]],
    ["Random", "w<sub>t</sub> ∼ 𝒩(1, 0.2²)", [62.63, 68.58, 62.72, 71.40]],
    ["Time-decay", "w<sub>t</sub> = γ<sup>T−t</sup>", [63.04, 64.00, 63.02, 68.51]],
    ["Entropy-mask", "Top-20% high-entropy tokens", [63.50, 66.67, 63.74, 70.28]],
    ["HiCCR-T", "Same formula, text context", [61.50, 67.19, 64.62, 69.18]],
    ["Raw Energy", "logsumexp over 𝒱, no normalization", [66.61, 68.67, 65.50, 72.08]],
    ["HiCCR", "Intra-visual concentration", [69.94, 68.95, 67.19, 72.76], true]
  ];
  const initLadder = () => {
    const box = $("#ladder");
    if (!box) return;
    const range = [-4, 8.5]; // delta range
    const pos = (d) => (d - range[0]) / (range[1] - range[0]) * 100;
    box.innerHTML = LADDER.map(([n, s, , top]) => `<div class="rung ${top ? "top" : ""}"><span class="nm"><b>${n}</b><small>${s}</small></span><span class="tr"><span class="zero" style="left:${pos(0)}%"></span><span class="d"></span></span><span class="v"></span></div>`).join("");
    const draw = (k) => {
      const base = LADDER[0][2][k];
      $$(".rung", box).forEach((el, i) => {
        const v = LADDER[i][2][k], d = v - base;
        const bar = $(".d", el);
        const a = pos(Math.min(0, d)), b = pos(Math.max(0, d));
        bar.style.left = a + "%";
        bar.style.width = Math.max(0.4, b - a) + "%";
        bar.classList.toggle("neg", d < 0);
        $(".v", el).innerHTML = `${v.toFixed(2)}<small>${i === 0 ? "baseline" : (d >= 0 ? "+" : "−") + Math.abs(d).toFixed(2)}</small>`;
      });
    };
    draw(0);
    $$("#ladder-tabs button").forEach((b) => b.addEventListener("click", () => {
      $$("#ladder-tabs button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      draw(+b.dataset.k);
    }));
  };

  /* ---------- cost ---------- */
  const COST = [
    ["GRPO", 619, 115.8, ""],
    ["HiCCR-G", 636, 121.0, "ours"],
    ["DAPO", 634, 118.1, ""],
    ["HiCCR-D", 651, 123.4, "ours"],
    ["PAPO", 782, 129.7, "papo"]
  ];
  const initCost = () => {
    const box = $("#cost");
    if (!box) return;
    box.innerHTML = COST.map(([n, s, m, c]) => `<div class="cost-row ${c}"><span>${n}</span><span class="tracks"><span class="t1" style="width:${(s / 900 * 100).toFixed(1)}%"><span>${s} s</span></span><span class="t2" style="width:${(m / 150 * 100).toFixed(1)}%"><span>${m} GB</span></span></span></div>`).join("");
  };

  /* ---------- noise reveal ---------- */
  const noiseReveal = () => {
    const viz = $(".noise-viz");
    if (!viz) return;
    const rand = $$("#nr-rand i");
    rand.forEach((b) => { b.dataset.t = b.style.transform; b.style.transform = `scaleY(${(1 / 1.55).toFixed(3)})`; });
    const nio = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        setTimeout(() => rand.forEach((b) => { b.style.transform = b.dataset.t; }), reduce ? 0 : 300);
        nio.disconnect();
      }
    }, { threshold: 0.4 });
    nio.observe(viz);
  };

  /* ---------- cases ---------- */
  const initCases = () => {
    const btns = $$(".cases-nav button"), figs = $$(".case-stage figure");
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      figs.forEach((f, i) => f.classList.toggle("on", i === +b.dataset.c));
    }));
  };

  /* ---------- lightbox ---------- */
  const initLightbox = () => {
    const lb = $("#lb"), img = $("img", lb);
    $$(".frame").forEach((f) => f.addEventListener("click", () => {
      const src = $("img", f);
      img.src = src.currentSrc || src.src; img.alt = src.alt;
      lb.classList.add("on");
    }));
    const close = () => lb.classList.remove("on");
    lb.addEventListener("click", close);
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  };

  /* ---------- KaTeX ---------- */
  const initMath = () => {
    const go = () => {
      if (!window.katex) return false;
      $$("[data-tex]").forEach((el) => {
        try {
          katex.render(el.dataset.tex, el, { displayMode: el.classList.contains("d") || el.classList.contains("eq"), throwOnError: false });
        } catch (e) { el.textContent = el.dataset.tex; }
      });
      return true;
    };
    if (!go()) {
      let n = 0;
      const t = setInterval(() => { if (go() || ++n > 60) clearInterval(t); }, 100);
    }
  };

  /* ---------- copy bibtex ---------- */
  const initCopy = () => {
    const b = $("#copy");
    if (!b) return;
    b.addEventListener("click", async () => {
      const txt = $("#bibtex").textContent;
      try { await navigator.clipboard.writeText(txt); }
      catch (e) {
        const r = document.createRange(); r.selectNodeContents($("#bibtex"));
        const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); s.removeAllRanges();
      }
      b.textContent = "Copied"; b.classList.add("done");
      setTimeout(() => { b.textContent = "Copy"; b.classList.remove("done"); }, 1800);
    });
  };

  const init = () => {
    initNoise(); noiseReveal();
    initLens(); initResults(); initCmp(); initLadder(); initCost(); initCases();
    initReveal(); initBar(); initLightbox(); initMath(); initCopy();
    lightTitle();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
