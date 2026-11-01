/* Example IT Solutions, site assistant (rule-based, no backend, no cost).
   Answers common questions about the business + a few easy tech issues,
   and always points to the owner for anything specific. */
(function () {
  "use strict";

  var PHONE_DISP = "(555) 010-0100";
  var PHONE_TEL = "+15550100100";
  var SMS = "sms:+15550100100?body=Hi%20the owner%2C%20I%20have%20a%20question%3A%20";
  var QUOTE = "contact.html#quote";
  var contactLine =
    'For anything specific, reach the owner directly: ' +
    '<a href="tel:' + PHONE_TEL + '">Call</a> or <a href="' + SMS + '">Text ' + PHONE_DISP + '</a>, ' +
    'or <a href="' + QUOTE + '">request a free quote</a>.';

  /* ---------- Knowledge base: each intent has keywords + a reply ---------- */
  var KB = [
    { k: ["service", "what do you do", "offer", "fix", "repair list", "help with"],
      a: "We handle phone, tablet, laptop, desktop, Mac & gaming repairs, plus custom PC builds, tech setup, networking/security, and <b>website design</b>. We're fully <b>mobile &amp; remote</b>, we come to you or work remotely." },
    { k: ["price", "cost", "how much", "quote", "estimate", "charge", "rate"],
      a: "Every job is custom-quoted (no surprise fees), so pricing depends on your exact device and issue. Tell the owner what you've got and you'll get a clear quote fast, usually within 1 business day. <a href='" + QUOTE + "'>Request a free quote →</a>" },
    { k: ["mobile", "remote", "location", "store", "shop", "address", "come to", "where are you", "in person"],
      a: "We don't have a storefront, that's the point! Example IT is <b>mobile &amp; remote</b>: we come to your home or business, or fix many issues remotely. You can also mail a device in." },
    { k: ["hour", "open", "availability", "appointment", "schedule", "when"],
      a: "We work <b>by appointment</b>: Monday to Friday 9-5, closed Saturday and Sunday. We reply to most requests within <b>1 business day</b>." },
    { k: ["area", "serve", "near", "anytown", "tampa", "st pete", "riverton", "example-county", "fairview"],
      a: "We serve all of <b>Example County</b>, including Anytown, Riverton, Lakeview, Fairview, Brookside and Maple Park. On-site mobile service is Example County only; remote support is available anywhere." },
    { k: ["warranty", "guarantee", "guaranteed"],
      a: "All our repairs come with a <b>60-day warranty</b> on parts and labor." },
    { k: ["pay", "payment", "deposit", "cash", "card", "credit"],
      a: "We take cash and credit or debit card, invoiced by Square. You approve the quote before any work begins. We do not accept checks or payment apps." },
    { k: ["turnaround", "how long", "how fast", "time", "same day", "ready"],
      a: "Turnaround is fast, many repairs are quick, and we'll give you a realistic timeline with your quote." },
    { k: ["owner", "about", "who"],
      a: "Example IT is locally owned and owner-operated. When you call, you deal directly with the owner, straight answers, fair prices." },
    { k: ["discount", "deal", "coupon", "student", "senior", "first"],
      a: "Ask about current offers when you request your quote and we will confirm the details in writing." },
    { k: ["website", "web design", "web site", "build a site", "web dev", "online store", "ecommerce"],
      a: "Yes, we design and build custom, mobile-friendly websites: business sites, e-commerce, booking, SEO, analytics, plus domain/hosting setup and maintenance plans. <a href='business.html'>See For Business →</a> or <a href='" + QUOTE + "'>get a quote</a>." },
    { k: ["business", "company", "managed", "maintenance plan", "msp", "commercial"],
      a: "We support small businesses with managed IT, maintenance plans, employee device setup, network security, and websites. <a href='business.html'>See our For Business page →</a>" },
    { k: ["contact", "reach", "phone", "number", "call", "text", "email", "talk"],
      a: "You can reach the owner at <a href='tel:" + PHONE_TEL + "'>" + PHONE_DISP + "</a> (call or <a href='" + SMS + "'>text</a>), email <a href='mailto:info@example.com'>info@example.com</a>, or <a href='" + QUOTE + "'>request a quote</a>." },

    /* ---- easy tech questions ---- */
    { k: ["won't charge", "wont charge", "not charging", "charge", "charging"],
      a: "Charging trouble is often (1) a dirty charging port, gently clean out lint, (2) a bad cable/charger, try another, or (3) a worn battery or port that needs replacing. If a new cable + cleaning doesn't do it, we can fix the port or battery. " + contactLine },
    { k: ["slow", "lagging", "freezing", "running slow"],
      a: "A slow computer is usually too many startup programs, low storage, malware, or an aging hard drive. A tune-up, malware scan, or an SSD/RAM upgrade usually brings it back to life. Want us to take a look? " + contactLine },
    { k: ["crack", "broken screen", "shattered", "screen"],
      a: "Cracked screens are one of our most common repairs, phones, tablets, and laptops. We can replace it and it'll look brand new. " + contactLine },
    { k: ["water", "liquid", "spill", "wet", "dropped in"],
      a: "Power it OFF right away, don't charge it, and don't use rice. The sooner it's treated the better the odds. We do water-damage treatment on a best-effort basis. " + contactLine },
    { k: ["battery", "dying", "drain", "won't hold"],
      a: "If your battery drains fast or won't hold a charge, it likely needs replacement, that's a quick fix for most phones and laptops. " + contactLine },
    { k: ["virus", "malware", "popup", "pop-up", "hacked", "scam"],
      a: "Pop-ups and weird behavior usually mean malware. Don't call any 'support' number in a pop-up. We do full virus/malware removal and can secure your device. " + contactLine },
    { k: ["wifi", "wi-fi", "internet", "router", "network", "connection"],
      a: "WiFi issues often come down to router placement, settings, or needing a mesh/extender. We do home WiFi, router setup, and network security checks. " + contactLine },
    { k: ["password", "locked out", "forgot password", "unlock"],
      a: "Lockouts depend on the device and account, and we never bypass security illegally, but we can often help you recover access the right way. " + contactLine },
    { k: ["data", "recover", "lost files", "backup", "deleted"],
      a: "We do best-effort data recovery and can set up reliable backups so it doesn't happen again. Stop using the drive to avoid overwriting data. " + contactLine },
    { k: ["pc build", "custom pc", "gaming pc", "build a pc"],
      a: "Yes, we build custom PCs (gaming and work builds), do GPU/PSU upgrades, and tune everything. Tell us your budget and goals. <a href='" + QUOTE + "'>Get a quote →</a>" }
  ];

  var GREETING =
    "Hi! I'm the Example IT assistant I can answer questions about our services, areas, warranty, or basic tech issues. What can I help you with?";
  var FALLBACK =
    "Good question, I want to get you a straight answer rather than guess. " + contactLine;

  var QUICK = [
    "What services do you offer?",
    "Are you mobile/remote?",
    "How much does it cost?",
    "Do you build websites?",
    "My phone won't charge"
  ];

  /* ---------- Styles ---------- */
  var css = document.createElement("style");
  css.textContent =
    "#fox-bot-btn{position:fixed;right:1.2rem;bottom:1.2rem;z-index:9997;width:60px;height:60px;border-radius:50%;background:var(--orange,#ff6a00);border:none;cursor:pointer;box-shadow:0 8px 26px rgba(255,106,0,0.45);display:flex;align-items:center;justify-content:center;transition:transform 0.15s,filter 0.2s}" +
    "#fox-bot-btn:hover{filter:brightness(1.08);transform:translateY(-2px)}" +
    "#fox-bot-btn img{width:38px;height:38px}" +
    "#fox-bot-btn .badge{position:absolute;top:-3px;right:-3px;background:#13161a;color:#ff6a00;border:1px solid #ff6a00;border-radius:10px;font:700 10px/1 'Barlow Condensed',sans-serif;letter-spacing:.08em;padding:3px 6px;text-transform:uppercase}" +
    "#fox-bot{position:fixed;right:1.2rem;bottom:1.2rem;z-index:9998;width:370px;max-width:calc(100vw - 2rem);height:560px;max-height:calc(100vh - 2rem);background:#0d0f12;border:1px solid #1f242c;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.6);display:none;flex-direction:column;overflow:hidden}" +
    "#fox-bot.open{display:flex}" +
    ".fb-head{background:#13161a;border-bottom:1px solid #1f242c;padding:0.9rem 1rem;display:flex;align-items:center;gap:0.7rem}" +
    ".fb-head img{width:34px;height:34px}" +
    ".fb-head .t{font:700 1rem/1 'Rajdhani',sans-serif;color:#f0f2f5;letter-spacing:.04em}" +
    ".fb-head .s{font:600 0.6rem/1.2 'Barlow Condensed',sans-serif;color:#7a8494;letter-spacing:.12em;text-transform:uppercase;margin-top:3px}" +
    ".fb-head .x{margin-left:auto;background:none;border:none;color:#7a8494;font-size:1.5rem;cursor:pointer;line-height:1}" +
    ".fb-head .x:hover{color:#ff6a00}" +
    ".fb-body{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.7rem;background:#0d0f12}" +
    ".fb-msg{max-width:85%;padding:0.7rem 0.9rem;border-radius:10px;font:400 0.9rem/1.5 'Barlow',sans-serif}" +
    ".fb-bot{align-self:flex-start;background:#1a1e24;color:#d8dde6;border-top-left-radius:2px}" +
    ".fb-user{align-self:flex-end;background:#ff6a00;color:#070809;font-weight:500;border-top-right-radius:2px}" +
    ".fb-msg a{color:#ff8c00;font-weight:600}" +
    ".fb-user a{color:#070809}" +
    ".fb-quick{display:flex;flex-wrap:wrap;gap:0.4rem;padding:0 1rem 0.6rem}" +
    ".fb-chip{background:#13161a;border:1px solid #1f242c;color:#9aa4b2;font:600 0.74rem/1 'Barlow Condensed',sans-serif;letter-spacing:.04em;padding:0.45rem 0.7rem;border-radius:20px;cursor:pointer;transition:color .2s,border-color .2s}" +
    ".fb-chip:hover{color:#ff6a00;border-color:rgba(255,106,0,.5)}" +
    ".fb-input{display:flex;gap:0.5rem;padding:0.7rem;border-top:1px solid #1f242c;background:#13161a}" +
    ".fb-input input{flex:1;background:#0d0f12;border:1px solid #1f242c;border-radius:20px;padding:0.6rem 0.9rem;color:#f0f2f5;font:400 0.9rem 'Barlow',sans-serif;outline:none}" +
    ".fb-input input:focus{border-color:#ff6a00}" +
    ".fb-input button{background:#ff6a00;color:#070809;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.1rem;flex-shrink:0}" +
    ".fb-disclaimer{font:400 0.66rem/1.3 'Barlow',sans-serif;color:#4a5568;text-align:center;padding:0 1rem 0.6rem}";
  document.head.appendChild(css);

  /* ---------- Markup ---------- */
  var logo = "assets/example-logo.png";
  var btn = document.createElement("button");
  btn.id = "fox-bot-btn";
  btn.setAttribute("aria-label", "Open chat assistant");
  btn.innerHTML = '<img src="' + logo + '" alt=""><span class="badge">Ask</span>';

  var panel = document.createElement("div");
  panel.id = "fox-bot";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Example IT assistant");
  panel.innerHTML =
    '<div class="fb-head"><img src="' + logo + '" alt="">' +
      '<div><div class="t">Example IT Assistant</div><div class="s">Usually replies in seconds</div></div>' +
      '<button class="x" aria-label="Close">&times;</button></div>' +
    '<div class="fb-body" id="fbBody"></div>' +
    '<div class="fb-quick" id="fbQuick"></div>' +
    '<form class="fb-input" id="fbForm"><input id="fbInput" type="text" autocomplete="off" placeholder="Type your question..." aria-label="Type your question"><button type="submit" aria-label="Send">&rsaquo;</button></form>' +
    '<div class="fb-disclaimer">Automated assistant. For specifics, ' + PHONE_DISP + '.</div>';

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var body = panel.querySelector("#fbBody");
  var quick = panel.querySelector("#fbQuick");
  var form = panel.querySelector("#fbForm");
  var input = panel.querySelector("#fbInput");
  var greeted = false;

  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function addMsg(html, who) {
    var d = document.createElement("div");
    d.className = "fb-msg " + (who === "user" ? "fb-user" : "fb-bot");
    d.innerHTML = html;
    body.appendChild(d);
    scrollDown();
  }
  function renderQuick() {
    quick.innerHTML = "";
    QUICK.forEach(function (q) {
      var c = document.createElement("button");
      c.className = "fb-chip";
      c.type = "button";
      c.textContent = q;
      c.addEventListener("click", function () { handle(q); });
      quick.appendChild(c);
    });
  }
  function answer(text) {
    var t = text.toLowerCase();
    for (var i = 0; i < KB.length; i++) {
      for (var j = 0; j < KB[i].k.length; j++) {
        if (t.indexOf(KB[i].k[j]) !== -1) return KB[i].a;
      }
    }
    if (/(hi|hello|hey|yo|sup)\b/.test(t)) return "Hey! Ask me about our services, pricing, areas we cover, warranty, or a tech issue you're having.";
    if (/(thank|thanks|appreciate)/.test(t)) return "You're welcome! Anything else I can help with? " + contactLine;
    return FALLBACK;
  }
  function handle(text) {
    addMsg(text.replace(/</g, "&lt;"), "user");
    setTimeout(function () { addMsg(answer(text), "bot"); }, 250);
  }

  function open() {
    panel.classList.add("open");
    btn.style.display = "none";
    if (!greeted) {
      greeted = true;
      addMsg(GREETING, "bot");
      renderQuick();
    }
    setTimeout(function () { input.focus(); }, 100);
  }
  function close() {
    panel.classList.remove("open");
    btn.style.display = "flex";
  }

  btn.addEventListener("click", open);
  panel.querySelector(".x").addEventListener("click", close);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = "";
    handle(v);
  });
})();
