/* Example IT Solutions - shared site behavior (v2) */
(function () {
  "use strict";
  /* Paste your Google Apps Script web app URL here to also log every submission to your Google Sheet. */
  var SHEET_URL = "https://script.google.com/macros/s/AKfycbyK02JyTOIzE15qF-mveMX7peQ01v3bFbPA1A8FBd4hRqv-GW3mGKyjCmIzPGAp1t4e/exec";
  /* Google Analytics 4 Measurement ID (looks like G-XXXXXXXXXX). Loads only after a visitor clicks Accept. */
  var GA_ID = "G-XXXXXXXXXX";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Nav ---------- */
  var nav = $("#siteNav"), toggle = $(".nav-toggle"), links = $("#navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", links).forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); toggle.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
    });
  }
  $$(".sub-toggle").forEach(function (b) {
    b.addEventListener("click", function () {
      var li = b.closest("li"); var o = li.classList.toggle("open");
      b.setAttribute("aria-expanded", o ? "true" : "false");
    });
  });

  /* ---------- Call-or-text chooser ---------- */
  document.addEventListener("click", function (e) {
    $$("details.cot[open]").forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute("open"); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") $$("details.cot[open]").forEach(function (d) { d.removeAttribute("open"); });
  });

  /* ---------- Scroll reveal ---------- */
  var rv = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
    }, { threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("visible"); }); }

  /* ---------- Tabs (services page) ---------- */
  var tablist = $('[role="tablist"]');
  if (tablist) {
    var tabs = $$('[role="tab"]', tablist), panels = $$(".panel[data-cat]");
    var select = function (key, focus, pushHash) {
      var match = tabs.some(function (t) { return t.dataset.tab === key; });
      if (!match) key = "all";
      tabs.forEach(function (t) {
        var on = t.dataset.tab === key;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach(function (p) { p.hidden = !(key === "all" || p.dataset.cat === key); });
      if (pushHash) { try { history.replaceState(null, "", key === "all" ? location.pathname : "#" + key); } catch (e) {} }
      var live = $("#tabCount"); if (live) live.textContent = panels.filter(function (p) { return !p.hidden; }).length + " service group" + (panels.filter(function (p) { return !p.hidden; }).length === 1 ? "" : "s") + " shown";
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t.dataset.tab, false, true); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") n = tabs[0];
        else if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n.dataset.tab, true, true); }
      });
    });
    var fromHash = function () {
      var h = decodeURIComponent((location.hash || "").replace(/^#(cat=)?/, "")) || "all";
      select(h, false, false);
    };
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  /* ---------- FAQ accordion ---------- */
  $$(".faq-q").forEach(function (q) {
    q.setAttribute("aria-expanded", "false");
    q.addEventListener("click", function () {
      var it = q.parentElement, o = it.classList.toggle("open");
      q.setAttribute("aria-expanded", o ? "true" : "false");
    });
  });

  /* ---------- Web3Forms ---------- */
  var digits = function (s) { return (s || "").replace(/\D/g, ""); };
  $$("form[data-w3f]").forEach(function (f) {
    var ok = document.getElementById(f.dataset.ok), er = document.getElementById(f.dataset.ok + "Err");
    var btn = f.querySelector('button[type="submit"]'), btnHtml = btn ? btn.innerHTML : "";
    f.setAttribute("novalidate", "novalidate");
    var markBad = function (el, bad) { el.setAttribute("aria-invalid", bad ? "true" : "false"); el.style.borderColor = bad ? "#c2410c" : ""; };
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      ok.hidden = true; er.hidden = true;
      // Required: name, phone (10+ digits), email, message
      var bad = null;
      ["name", "phone", "email", "message", "device"].forEach(function (n) {
        var el = f.elements[n]; if (!el) return;
        var v = (el.value || "").trim(), invalid = false;
        if (el.required && !v) invalid = true;
        if (n === "phone" && digits(v).length < 10) invalid = true;
        if (n === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) invalid = true;
        markBad(el, invalid); if (invalid && !bad) bad = el;
      });
      if (bad) { bad.focus(); er.textContent = "Please complete name, a phone number (10 digits), a valid email and your message."; er.hidden = false; return; }
      if (f.elements.botcheck && f.elements.botcheck.checked) { ok.hidden = false; f.reset(); return; }
      var data = {}; new FormData(f).forEach(function (v, k) { data[k] = v; });
      delete data.botcheck;
      data.promo_email = f.elements.promo_email && f.elements.promo_email.checked ? "Yes" : "No";
      data.promo_sms = f.elements.promo_sms && f.elements.promo_sms.checked ? "Yes" : "No";
      var st = f.querySelector("[data-sms-text]");
      if (data.promo_sms === "Yes" && st) data.sms_consent_wording = st.textContent.trim();
      data.page = location.href; data.submitted_at = new Date().toISOString();
      data.subject = f.dataset.subject + " - " + data.name;
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.success, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            track("generate_lead", { form: f.dataset.subject });
            if (SHEET_URL) { try { fetch(SHEET_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) }); } catch (e2) {} }
            ok.hidden = false; f.reset(); ok.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
          else { er.hidden = false; }
        })
        .catch(function () { er.hidden = false; })
        .then(function () { if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; } });
    });
  });

  /* ---------- Prefill quote form from ?plan= / ?topic= / ?city= ---------- */
  try {
    var qp = new URLSearchParams(location.search), q = $("#quote form[data-w3f]") || $("form[data-w3f]");
    if (q && (qp.get("plan") || qp.get("topic") || qp.get("city"))) {
      var map = { phone: "iPhone", tablet: "iPad / Tablet", computers: "Windows Laptop", mac: "Mac / MacBook", gaming: "Gaming Console / Controller", setup: "Other", networking: "Home Network / WiFi", websites: "Website Project" };
      var dev = q.elements.device, topic = qp.get("topic"), plan = qp.get("plan"), city = qp.get("city");
      var note = [];
      if (plan) { note.push("Interested in: " + plan.replace(/^Website\s?/, "Website package: ")); if (dev) dev.value = /^Website/.test(plan) ? "Website Project" : "Business IT Support"; }
      if (topic && map[topic] && dev) dev.value = map[topic];
      if (city) note.push("Location: " + city.replace(/-/g, " "));
      var msg = q.elements.message;
      if (msg && note.length && !msg.value) msg.value = note.join(". ") + ". ";
    }
  } catch (e) {}

  /* ---------- Cookie banner ---------- */
  var KEY = "fox_consent_v2", banner = $("#cookieBanner");
  var get = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var set = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };
  var loadGA = function () {
    if (!GA_ID || window.__foxGA) return;
    window.__foxGA = true; window["ga-disable-" + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  };
  var stopGA = function () {
    if (!GA_ID) return;
    window["ga-disable-" + GA_ID] = true;
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (/^_ga/.test(n)) { var host = location.hostname.split("."); [location.hostname, "." + location.hostname, "." + host.slice(-2).join(".")].forEach(function (d) { document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + d; }); document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"; }
    });
  };
  var track = function (name, params) { try { if (window.gtag && window.__foxGA) window.gtag("event", name, params || {}); } catch (e) {} };
  window.foxTrack = track;
  if (get() === "accepted") loadGA();
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href^='tel:'],a[href^='sms:'],a[href^='mailto:']");
    if (a) track("contact_click", { method: a.getAttribute("href").split(":")[0] });
  });
  if (banner) {
    if (!get()) banner.hidden = false;
    $$("[data-cookie]", banner).forEach(function (b) {
      b.addEventListener("click", function () {
        var acc = b.dataset.cookie === "accept"; set(acc ? "accepted" : "essential"); banner.hidden = true;
        if (acc) loadGA(); else stopGA();
      });
    });
    $$("[data-cookie-settings]").forEach(function (b) { b.addEventListener("click", function () { banner.hidden = false; var x = $("[data-cookie='decline']", banner); if (x) x.focus(); }); });
  }

  /* ---------- Exit-intent popup (desktop only, once per visit) ---------- */
  var pop = $("#foxExit");
  if (pop) {
    var skip = /(contact|privacy|terms|cookies|website-policy|policies|404)\.html$/.test(location.pathname);
    var seen = function () { try { return sessionStorage.getItem("fox_exit_seen"); } catch (e) { return null; } };
    var mark = function () { try { sessionStorage.setItem("fox_exit_seen", "1"); } catch (e) {} };
    var opened = false, lastFocus = null, t0 = Date.now();
    var closePop = function () { pop.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); };
    var showPop = function () {
      if (opened || skip || seen()) return;
      if (window.innerWidth < 900 || (window.matchMedia && window.matchMedia("(hover: none)").matches)) return;
      if (Date.now() - t0 < 8000) return;
      var cb = $("#cookieBanner"); if (cb && !cb.hidden) return;
      if (document.querySelector("form[data-w3f] :focus")) return;
      opened = true; mark(); lastFocus = document.activeElement; pop.hidden = false;
      var x = $(".exit-x", pop); if (x) x.focus();
      track("exit_popup_shown");
    };
    document.addEventListener("mouseout", function (e) { if (!e.relatedTarget && e.clientY <= 0) showPop(); });
    $(".exit-x", pop).addEventListener("click", closePop);
    $(".exit-no", pop).addEventListener("click", closePop);
    pop.addEventListener("click", function (e) { if (e.target === pop) closePop(); });
    $$("a", pop).forEach(function (a) { a.addEventListener("click", function () { track("exit_popup_click"); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pop.hidden) closePop(); });
  }

  /* ---------- Live Google reviews: show only when real reviews load ---------- */
  var mount = $("[data-featurable-async]");
  if (mount) {
    var noRev = document.getElementById("noReviewsYet");
    mount.style.display = "none"; if (noRev) noRev.style.display = "block";
    var checkReal = function () {
      var txt = mount.innerText || "";
      $$("*", mount).forEach(function (el) {
        if (el.shadowRoot) $$("*", el.shadowRoot).forEach(function (n) {
          if (n.tagName !== "STYLE" && n.tagName !== "SCRIPT" && !n.children.length) txt += " " + (n.textContent || "");
        });
      });
      var real = txt.replace(/please enable javascript[^.]*\./i, "").replace(/\s/g, "");
      var demo = /this is an example|example review|demo review|sample review/i.test(txt);
      if (real.length > 120 && !demo) { mount.style.display = ""; if (noRev) noRev.style.display = "none"; return true; }
      return false;
    };
    var tries = 0, timer = setInterval(function () { if (checkReal() || ++tries > 55) clearInterval(timer); }, 700);
  }
})();
