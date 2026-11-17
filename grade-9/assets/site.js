// Learner website: slide viewer, self-marking quiz, mobile menu, tab highlight. No tracking, nothing is stored or sent.
(function () {
  // mobile menu
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // slide viewer
  document.querySelectorAll(".viewer").forEach(function (v) {
    var imgs = JSON.parse(v.dataset.imgs), i = 0, img = v.querySelector("img"),
      prev = v.querySelector(".prev"), next = v.querySelector(".next"), count = v.querySelector(".count");
    function show(n) {
      i = Math.max(0, Math.min(imgs.length - 1, n));
      img.src = imgs[i]; img.alt = "Lesson slide " + (i + 1) + " of " + imgs.length;
      count.textContent = (i + 1) + " / " + imgs.length;
      prev.disabled = i === 0; next.disabled = i === imgs.length - 1;
    }
    prev.addEventListener("click", function () { show(i - 1); });
    next.addEventListener("click", function () { show(i + 1); });
    v.tabIndex = 0;
    v.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });
    show(0);

    // tap-to-enlarge: full-screen view with arrows, swipe, Esc to close
    var zoom = document.createElement("button");
    zoom.type = "button"; zoom.className = "zoom"; zoom.textContent = "⤢ Full screen";
    zoom.setAttribute("aria-label", "Show the slides full screen");
    v.querySelector(".viewer-bar").appendChild(zoom);
    var lb = document.createElement("div");
    lb.className = "lightbox"; lb.hidden = true;
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Lesson slides, full screen");
    lb.innerHTML = '<p class="lb-hint">Turn your phone sideways for a bigger slide.</p>' +
      '<button type="button" class="lb-close" aria-label="Close">✕</button><img alt="">' +
      '<div class="lb-bar"><button type="button" class="lb-prev" aria-label="Previous slide">&larr;</button>' +
      '<span class="lb-count"></span><button type="button" class="lb-next" aria-label="Next slide">&rarr;</button></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img"), lbCount = lb.querySelector(".lb-count"),
      lbPrev = lb.querySelector(".lb-prev"), lbNext = lb.querySelector(".lb-next");
    function lbShow(n) {
      show(n);                                   // keep the page viewer in step
      lbImg.src = imgs[i]; lbImg.alt = img.alt; lbCount.textContent = count.textContent;
      lbPrev.disabled = i === 0; lbNext.disabled = i === imgs.length - 1;
    }
    function open() {
      lb.hidden = false; document.body.classList.add("lb-open"); lbShow(i); lb.querySelector(".lb-close").focus();
      try {                                      // phones: real full screen, landscape where the browser allows it
        var r = lb.requestFullscreen ? lb.requestFullscreen() : null;
        if (r && r.then) r.then(function () {
          if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function () {});
        }).catch(function () {});
      } catch (e) { /* not supported: the overlay still fills the window */ }
    }
    function close() {
      lb.hidden = true; document.body.classList.remove("lb-open");
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
      zoom.focus();
    }
    img.addEventListener("click", open);
    zoom.addEventListener("click", open);
    lb.querySelector(".lb-close").addEventListener("click", close);
    lbPrev.addEventListener("click", function () { lbShow(i - 1); });
    lbNext.addEventListener("click", function () { lbShow(i + 1); });
    lbImg.addEventListener("click", function () { lbShow(i + 1); });
    document.addEventListener("fullscreenchange", function () { if (!document.fullscreenElement && !lb.hidden) close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") lbShow(i - 1);
      if (e.key === "ArrowRight") lbShow(i + 1);
    });
    var x0 = null;                               // swipe left / right
    lb.addEventListener("touchstart", function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) lbShow(dx < 0 ? i + 1 : i - 1);
    });
  });

  // self-marking quiz
  document.querySelectorAll(".quiz").forEach(function (box) {
    var qs = JSON.parse(box.dataset.quiz), body = box.querySelector(".qbody"),
      score = box.querySelector(".score"), retry = box.querySelector(".retry");
    function render() {
      body.innerHTML = ""; score.textContent = ""; retry.hidden = true;
      var answered = 0, right = 0;
      qs.forEach(function (q, n) {
        var wrap = document.createElement("div"); wrap.className = "q";
        var p = document.createElement("p"); p.textContent = (n + 1) + ". " + q.q; wrap.appendChild(p);
        var why = document.createElement("p"); why.className = "why";
        q.options.forEach(function (o, k) {
          var b = document.createElement("button"); b.type = "button"; b.className = "opt";
          b.textContent = String.fromCharCode(65 + k) + "   " + o;
          b.addEventListener("click", function () {
            wrap.querySelectorAll(".opt").forEach(function (x) { x.disabled = true; });
            wrap.querySelectorAll(".opt")[q.answer].classList.add("right");
            if (k !== q.answer) b.classList.add("wrong"); else right++;
            why.textContent = (k === q.answer ? "Correct! " : "Not quite. ") + (q.why || "");
            answered++;
            if (answered === qs.length) {
              score.textContent = "You got " + right + " out of " + qs.length + "." +
                (right === qs.length ? " Excellent!" : " Check the Notes for the ones you missed, then try again.");
              retry.hidden = false;
            }
          });
          wrap.appendChild(b);
        });
        wrap.appendChild(why); body.appendChild(wrap);
      });
    }
    retry.addEventListener("click", render);
    render();
  });

  // highlight the tab of the section in view
  var tabs = document.querySelectorAll(".tabs a");
  if (tabs.length && "IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) tabs.forEach(function (t) { t.classList.toggle("on", t.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { obs.observe(s); });
  }
})();
