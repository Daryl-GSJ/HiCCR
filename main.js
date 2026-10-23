(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* nav: border on scroll + active section */
  const nav = $("nav.top");
  const links = $$(".links-nav a");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 4);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$("main section[id]").forEach((s) => io.observe(s));
  }

  /* KaTeX */
  const renderMath = () => {
    if (!window.katex) return false;
    $$("[data-tex]").forEach((el) => {
      try { katex.render(el.dataset.tex, el, { displayMode: true, throwOnError: false }); }
      catch (e) { el.textContent = el.dataset.tex; }
    });
    return true;
  };
  const start = () => {
    if (!renderMath()) {
      let n = 0;
      const t = setInterval(() => { if (renderMath() || ++n > 80) clearInterval(t); }, 100);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  /* lightbox */
  const lb = $("#lb"), lbImg = $("img", lb);
  $$(".frame").forEach((f) => f.addEventListener("click", () => {
    const im = $("img", f);
    lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt;
    lb.classList.add("on");
  }));
  lb.addEventListener("click", () => lb.classList.remove("on"));
  addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("on"); });

  /* copy bibtex */
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
