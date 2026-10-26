(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav: border, progress, active section ---------- */
  const nav = $("nav.top"), prog = $("#progress");
  const links = $$(".links-nav a");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 4);
    const h = document.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const hasIO = "IntersectionObserver" in window;
  if (hasIO) {
    const sio = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$("main section[id]").forEach((s) => sio.observe(s));
  }

  /* ---------- reveal on scroll ---------- */
  const reveal = (el) => {
    if (el.classList.contains("in")) return;
    el.classList.add("in");
    el.dispatchEvent(new CustomEvent("revealed"));
  };
  if (hasIO && !reduce) {
    const rio = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { reveal(e.target); rio.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });
    setTimeout(() => $$(".rv").forEach((el) => rio.observe(el)), 0);
  } else {
    setTimeout(() => $$(".rv").forEach(reveal), 0);
  }

  /* ---------- video chapters ---------- */
  const vid = $("#explainer"), chs = $$("#chapters button");
  if (vid && chs.length) {
    const ts = chs.map((b) => parseFloat(b.dataset.t));
    chs.forEach((b, i) => b.addEventListener("click", () => {
      vid.currentTime = ts[i] + 0.01;
      vid.play().catch(() => {});
    }));
    vid.addEventListener("timeupdate", () => {
      let k = 0; ts.forEach((t, i) => { if (vid.currentTime >= t) k = i; });
      chs.forEach((b, i) => b.classList.toggle("on", i === k && (vid.currentTime > 0 || !vid.paused)));
    });
  }

  /* ---------- highlight counters ---------- */
  const hl = $(".highlights");
  if (hl) {
    hl.addEventListener("revealed", () => {
      if (reduce) return;
      $$("[data-count]", hl).forEach((el) => {
        const to = parseFloat(el.dataset.count), pre = el.dataset.pre || "", suf = el.dataset.suf || "";
        const t0 = performance.now(), dur = 1400;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
          el.textContent = pre + (to * e).toFixed(2) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { once: true });
  }

  /* ---------- KaTeX ---------- */
  const renderMath = () => {
    if (!window.katex) return false;
    $$("[data-tex]").forEach((el) => {
      try { katex.render(el.dataset.tex, el, { displayMode: true, throwOnError: false }); }
      catch (e) { el.textContent = el.dataset.tex; }
    });
    return true;
  };
  const startMath = () => {
    if (!renderMath()) {
      let n = 0;
      const t = setInterval(() => { if (renderMath() || ++n > 80) clearInterval(t); }, 100);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startMath);
  else startMath();

  /* ---------- credit lens ---------- */
  // [token, beta]. Approximate beta_t read from the appendix case study (Qwen3-VL-8B). "↵" marks a newline token.
  const LENS = [
    ["<", 1.33], ["thinking", 1.29], [">↵", 1.28], ["To", 1.25], ["determine", 1.19], ["which", 1.23], ["activity", 1.30], ["Lily", 1.27], ["did", 1.26], ["earlier", 1.27], [",", 1.32], ["I", 1.25], ["need", 1.14], ["to", 1.22], ["read", 1.24], ["the", 1.33], ["times", 1.38], ["shown", 1.29], ["on", 1.28], ["the", 1.27], ["two", 1.39], ["clocks", 1.40], ["and", 1.32], ["compare", 1.16], ["them", 1.25], [".↵", 1.22], ["First", 1.29], [",", 1.40], ["I", 1.25], ["look", 1.17],
    ["at", 1.27], ["the", 1.32], ["clock", 1.39], ["on", 1.31], ["the", 1.30], ["left", 1.32], [",", 1.34], ["which", 1.27], ["is", 1.27], ["associated", 1.28], ["with", 1.27], ["“", 1.35], ["watch", 1.30], ["ed", 1.45], ["a", 1.44], ["movie", 1.41], [".”↵", 1.26], ["On", 1.27], ["that", 1.28], ["clock", 1.34], [",", 1.27], ["the", 1.32], ["hour", 1.30], ["hand", 1.27], ["is", 1.27], ["pointing", 1.27], ["to", 1.27], ["the", 1.38], ["7", 1.41], [",", 1.29], ["and", 1.25], ["the", 1.26],
    ["minute", 1.29], ["hand", 1.27], ["is", 1.20], ["pointing", 1.15], ["to", 1.27], ["the", 1.29], ["1", 1.35], ["2", 1.34], [".↵", 1.25], ["That", 1.27], ["means", 1.21], ["the", 1.28], ["time", 1.27], ["is", 1.26], ["7", 1.25], [":", 1.33], ["0", 1.29], ["0", 1.25], [".↵", 1.33], ["Next", 1.07], [",", 1.19], ["I", 1.12], ["look", 1.15], ["at", 1.21], ["the", 1.25], ["clock", 1.30], ["on", 1.29], ["the", 1.27], ["right", 1.21], [",", 1.25], ["which", 1.21], ["is", 1.24], ["associated", 1.20],
    ["with", 1.27], ["“", 1.28], ["ate", 1.31], ["dinner", 1.45], [".”↵", 1.16], ["On", 1.17], ["that", 1.21], ["clock", 1.29], [",", 1.25], ["the", 1.25], ["hour", 1.26], ["hand", 1.15], ["is", 1.12], ["pointing", 1.15], ["to", 1.26], ["the", 1.34], ["9", 1.39], [",", 1.28], ["and", 1.14], ["the", 1.20], ["minute", 1.22], ["hand", 1.24], ["is", 1.10], ["pointing", 1.14], ["to", 1.27], ["the", 1.25], ["1", 1.28], ["2", 1.34], [".↵", 1.15], ["That", 1.08], ["means", 1.08], ["the", 1.25],
    ["time", 1.21], ["is", 1.22], ["9", 1.30], [":", 1.34], ["0", 1.33], ["0", 1.29], [".↵", 1.25], ["Now", 1.15], [",", 1.10], ["I", 1.10], ["compare", 1.08], ["the", 1.21], ["two", 1.21], ["times", 1.21], [":↵", 1.08], ["-", 1.25], ["Watch", 1.26], ["ed", 1.34], ["a", 1.31], ["movie", 1.31], [":", 1.27], ["7", 1.25], [":", 1.27], ["0", 1.25], ["0", 1.19], ["-", 1.15], ["A", 1.27], ["te", 1.32], ["dinner", 1.37], [":", 1.25], ["9", 1.13], [":", 1.22], ["0", 1.21], ["0", 1.20], ["Since", 1.20], ["7", 1.15], [":", 1.20], ["0", 1.21], ["0", 1.20], ["comes", 1.25],
    ["before", 1.08], ["9", 1.19], [":", 1.24], ["0", 1.15], ["0", 1.32], [",", 1.25], ["Lily", 1.27], ["watched", 1.28], ["a", 1.35], ["movie", 1.32], ["earlier", 1.21], [".↵", 1.21], ["Therefore", 1.10], [",", 1.14], ["the", 1.20], ["correct", 1.21], ["answer", 1.20], ["is", 1.08], ["(", 1.25], ["B", 1.27], [")", 1.25], ["watched", 1.25], ["a", 1.35], ["movie", 1.33], [".↵", 1.21], ["</", 1.14], ["thinking", 1.10], [">↵", 1.07], ["\\", 1.27], ["boxed", 1.16], ["{", 1.24], ["B", 1.20], ["}", 1.20]
  ];
  const LO = 1.05, HI = 1.45;
  const STOPS = [[0, [23, 64, 122]], [.2, [79, 134, 198]], [.4, [199, 219, 239]], [.5, [247, 245, 240]], [.62, [244, 198, 179]], [.8, [224, 123, 95]], [1, [168, 40, 31]]];
  const colorOf = (b) => {
    const t = Math.max(0, Math.min(1, (b - LO) / (HI - LO)));
    let i = 0;
    while (i < STOPS.length - 2 && t > STOPS[i + 1][0]) i++;
    const [p0, c0] = STOPS[i], [p1, c1] = STOPS[i + 1];
    const k = (t - p0) / (p1 - p0);
    const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
    return { bg: `rgb(${c.join(",")})`, fg: t < 0.2 || t > 0.79 ? "#fbfaf7" : "#1b1f27" };
  };

  const lens = $("#lens");
  if (lens) {
    const box = $("#lens-text"), read = $("#lens-read"), mark = $("#lg-mark");
    const frag = document.createDocumentFragment();
    LENS.forEach(([tok, b]) => {
      const s = document.createElement("span");
      s.className = "t" + (tok.includes("↵") ? " nl" : "") + (b >= 1.33 ? " hi" : "") + (b <= 1.15 ? " lo" : "");
      s.textContent = tok;
      s.dataset.b = b.toFixed(2);
      frag.appendChild(s);
      frag.appendChild(document.createTextNode(" "));
    });
    box.appendChild(frag);
    const spans = $$(".t", box);
    const HINT = "Hover a token to read its weight.";
    let mode = "hiccr", timers = [];

    const paint = (m, animate) => {
      mode = m;
      timers.forEach(clearTimeout); timers = [];
      spans.forEach((s, i) => {
        const apply = () => {
          if (m === "hiccr") {
            const c = colorOf(parseFloat(s.dataset.b));
            s.style.backgroundColor = c.bg; s.style.color = c.fg;
          } else {
            s.style.backgroundColor = "#e9ecf1"; s.style.color = "#444a55";
          }
        };
        if (animate && !reduce) timers.push(setTimeout(apply, 60 + i * 9));
        else apply();
      });
      $$(".seg button", lens).forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.mode === m)));
      if (m !== "hiccr") {
        box.classList.remove("f-hi", "f-lo");
        $$(".chips button", lens).forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.f === "all")));
      }
      read.innerHTML = m === "hiccr" ? HINT : "Uniform RLVR: every token receives the same advantage Â (β<sub>t</sub> = 1).";
    };
    const reset = () => {
      timers.forEach(clearTimeout); timers = [];
      spans.forEach((s) => { s.style.backgroundColor = "#f1f1ee"; s.style.color = "#6b717c"; });
    };

    // clock faces
    $$(".clock", lens).forEach((c) => {
      const g = $(".ticks", c);
      for (let k = 0; k < 12; k++) {
        const a = (k * 30) * Math.PI / 180, r1 = k % 3 === 0 ? 23 : 25.5, r2 = 28;
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", (40 + r1 * Math.sin(a)).toFixed(2)); l.setAttribute("y1", (40 - r1 * Math.cos(a)).toFixed(2));
        l.setAttribute("x2", (40 + r2 * Math.sin(a)).toFixed(2)); l.setAttribute("y2", (40 - r2 * Math.cos(a)).toFixed(2));
        if (k % 3 === 0) l.style.strokeWidth = "2";
        g.appendChild(l);
      }
    });
    const setHands = () => $$(".clock", lens).forEach((c) => { $(".hh", c).style.transform = `rotate(${c.dataset.h}deg)`; });

    reset();
    lens.addEventListener("revealed", () => {
      setHands();
      setTimeout(() => paint("hiccr", true), reduce ? 0 : 500);
    }, { once: true });

    $$(".seg button", lens).forEach((btn) => btn.addEventListener("click", () => paint(btn.dataset.mode, true)));
    $("#replay").addEventListener("click", () => {
      reset();
      $$(".clock", lens).forEach((c) => {
        [$(".mh", c), $(".hh", c)].forEach((h) => { h.style.transition = "none"; });
        $(".mh", c).style.transform = "rotate(-360deg)"; $(".hh", c).style.transform = "rotate(0deg)";
        void c.offsetWidth;
        [$(".mh", c), $(".hh", c)].forEach((h) => { h.style.transition = ""; });
        $(".mh", c).style.transform = ""; $(".hh", c).style.transform = `rotate(${c.dataset.h}deg)`;
      });
      setTimeout(() => paint("hiccr", true), 350);
    });
    $$(".chips button", lens).forEach((btn) => btn.addEventListener("click", () => {
      $$(".chips button", lens).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      box.classList.toggle("f-hi", btn.dataset.f === "hi");
      box.classList.toggle("f-lo", btn.dataset.f === "lo");
      if (mode !== "hiccr") paint("hiccr", false);
    }));

    const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    box.addEventListener("mouseover", (e) => {
      const s = e.target.closest(".t");
      if (!s || mode !== "hiccr") return;
      const b = parseFloat(s.dataset.b);
      read.innerHTML = `“<b>${esc(s.textContent.replace("↵", "\\n"))}</b>” &nbsp;β<sub>t</sub> = <b>${b.toFixed(2)}</b> &nbsp;→ advantage × ${b.toFixed(2)}`;
      mark.style.left = `${((b - LO) / (HI - LO)) * 100}%`;
      mark.classList.add("on");
    });
    box.addEventListener("mouseleave", () => {
      mark.classList.remove("on");
      if (mode === "hiccr") read.textContent = HINT;
    });
  }

  /* ---------- more cases ---------- */
  const cbtns = $$(".cases-nav button"), cfigs = $$(".case-stage figure");
  cbtns.forEach((b) => b.addEventListener("click", () => {
    cbtns.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    cfigs.forEach((f, i) => f.classList.toggle("on", i === +b.dataset.c));
  }));

  /* ---------- lightbox ---------- */
  const lb = $("#lb"), lbImg = $("img", lb);
  $$(".frame").forEach((f) => f.addEventListener("click", () => {
    const im = $("img", f);
    lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt;
    lb.classList.add("on");
  }));
  lb.addEventListener("click", () => lb.classList.remove("on"));
  addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("on"); });

  /* ---------- copy bibtex ---------- */
  const btn = $("#copy");
  btn.addEventListener("click", async () => {
    const txt = $("#bib").textContent;
    try { await navigator.clipboard.writeText(txt); }
    catch (e) {
      const r = document.createRange(); r.selectNodeContents($("#bib"));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); s.removeAllRanges();
    }
    btn.textContent = "Copied"; btn.classList.add("done");
    setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1600);
  });
})();
