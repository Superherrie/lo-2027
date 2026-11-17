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
