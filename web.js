/* ===== NASTAVENÍ ===== */
var NASTAVENI = {
  gaId: "G-X1VMYFFG0E",                      // Google Analytics 4
  capiUrl: "https://capi.nikolasvaren.cz/udalost",  // server pro Meta Conversions API (Cloudflare Worker)
  mailerliteUcet: "2646388",                 // číslo účtu MailerLite
  mailerliteFormular: "199052731921466767"   // číslo formuláře MailerLite
};
/* ===================== */

(function () {
  var KEY = "nv_cookies";
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function cookie(n) {
    var m = document.cookie.match("(^|; )" + n + "=([^;]*)");
    return m ? decodeURIComponent(m[2]) : "";
  }
  function setCookie(n, v, dnu) {
    var d = new Date(Date.now() + dnu * 864e5).toUTCString();
    document.cookie = n + "=" + encodeURIComponent(v) + "; expires=" + d + "; path=/; SameSite=Lax; Secure";
  }
  function nahodneId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  /* ---------- Google Analytics 4 (až po souhlasu) ---------- */
  var gaNactene = false;
  function loadGA() {
    if (gaNactene || !/^G-[A-Z0-9]+$/.test(NASTAVENI.gaId)) return;
    gaNactene = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + NASTAVENI.gaId;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", NASTAVENI.gaId, { anonymize_ip: true });
  }

  /* ---------- Meta Conversions API (server, bez pixelu) ---------- */
  function identifikace() {
    // fbc z odkazu z reklamy, fbp si držíme sami (pixel na webu není)
    var fbc = cookie("_fbc");
    var fbclid = new URLSearchParams(location.search).get("fbclid");
    if (!fbc && fbclid) {
      fbc = "fb.1." + Date.now() + "." + fbclid;
      setCookie("_fbc", fbc, 90);
    }
    var fbp = cookie("_fbp");
    if (!fbp) {
      fbp = "fb.1." + Date.now() + "." + Math.floor(Math.random() * 1e10);
      setCookie("_fbp", fbp, 90);
    }
    var ext = "";
    try {
      ext = localStorage.getItem("nv_id") || "";
      if (!ext) { ext = nahodneId(); localStorage.setItem("nv_id", ext); }
    } catch (e) {}
    return { fbc: fbc, fbp: fbp, external_id: ext };
  }

  // odkud návštěvník přišel – zapamatujeme si to na celou návštěvu
  function puvod() {
    var p = new URLSearchParams(location.search);
    var ulozeny = {};
    try { ulozeny = JSON.parse(sessionStorage.getItem("nv_puvod") || "{}"); } catch (e) {}
    if (!ulozeny.ulozeno) {
      ulozeny = {
        ulozeno: 1,
        utm_source: p.get("utm_source") || "",
        utm_medium: p.get("utm_medium") || "",
        utm_campaign: p.get("utm_campaign") || "",
        odkud: document.referrer || ""
      };
      try { sessionStorage.setItem("nv_puvod", JSON.stringify(ulozeny)); } catch (e) {}
    }
    return ulozeny;
  }

  // vlastní návštěvy do statistik nepatří:
  // otevři https://nikolasvaren.cz/?nemerit=1 na každém svém zařízení (zapnout)
  // a https://nikolasvaren.cz/?nemerit=0 (vypnout)
  (function () {
    var p = new URLSearchParams(location.search).get("nemerit");
    if (p === null) return;
    try { p === "0" ? localStorage.removeItem("nv_nemerit") : localStorage.setItem("nv_nemerit", "1"); } catch (e) {}
  })();
  function nemerit() {
    try { return localStorage.getItem("nv_nemerit") === "1"; } catch (e) { return false; }
  }

  window.nvUdalost = function (nazev, extra) {
    if (nemerit()) return;                        // tohle zařízení se nepočítá
    if (read() !== "ano") return;                 // bez souhlasu neposíláme nic
    var i = identifikace();
    var p = puvod();
    var telo = {
      event_name: nazev,
      event_id: nahodneId(),
      event_source_url: location.href,
      user_agent: navigator.userAgent,
      fbc: i.fbc, fbp: i.fbp, external_id: i.external_id,
      utm_source: p.utm_source, utm_medium: p.utm_medium, utm_campaign: p.utm_campaign,
      odkud: p.odkud
    };
    if (extra) { for (var k in extra) telo[k] = extra[k]; }
    try {
      fetch(NASTAVENI.capiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telo),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  };

  function mereniStart() {
    if (nemerit()) return;                        // tohle zařízení se nepočítá nikde
    loadGA();
    nvUdalost("PageView");
    var ev = document.body && document.body.dataset.event;   // dekujeme.html má data-event="Lead"
    if (ev) nvUdalost(ev);
  }

  /* ---------- Lišta se souhlasem ---------- */
  function bar() {
    var el = document.getElementById("cookies");
    var choice = read();
    if (choice === "ano") { mereniStart(); if (el) el.style.display = "none"; return; }
    if (choice === "ne") { if (el) el.style.display = "none"; return; }
    if (!el) return;
    el.style.display = "block";
    el.querySelector(".yes").onclick = function () { save("ano"); el.style.display = "none"; mereniStart(); };
    el.querySelector(".no").onclick = function () { save("ne"); el.style.display = "none"; };
  }
  window.nvCookiesReset = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };

  /* ---------- Formulář ---------- */
  function form() {
    var f = document.getElementById("ukazka");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = f.querySelector(".err"); err.textContent = "";
      var email = f.email.value.trim();
      var jmeno = f.jmeno.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Zkontroluj prosím e-mail."; return; }
      if (!f.vek.checked) { err.textContent = "Kniha je jen pro čtenářky a čtenáře starší 18 let."; return; }
      if (!f.souhlas.checked) { err.textContent = "Bez souhlasu ti ukázku nemůžeme poslat e-mailem."; return; }
      if (!/^\d+$/.test(NASTAVENI.mailerliteUcet) || !/^\d+$/.test(NASTAVENI.mailerliteFormular)) { err.textContent = "Formulář se právě připravuje. Zkus to prosím za chvíli."; return; }
      var btn = f.querySelector("button"); btn.disabled = true; btn.textContent = "Odesílám…";
      var data = new FormData();
      data.append("fields[email]", email);
      data.append("fields[name]", jmeno);
      data.append("ml-submit", "1");
      data.append("anticsrf", "true");
      var url = "https://assets.mailerlite.com/jsonp/" + NASTAVENI.mailerliteUcet +
                "/forms/" + NASTAVENI.mailerliteFormular + "/subscribe";
      fetch(url, { method: "POST", body: data, mode: "no-cors" })
        .then(function () {
          if (window.gtag) gtag("event", "generate_lead", { method: "formular_ukazka" });
          nvUdalost("Lead", { email: email, jmeno: jmeno, custom_data: { content_name: "Ukazka zdarma" } });
          setTimeout(function () { location.href = "dekujeme.html"; }, 250);
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = "Chci ukázku zdarma";
          err.textContent = "Něco se nepovedlo. Zkus to prosím znovu za chvíli.";
        });
    });
  }

  /* ---------- Sdílení ---------- */
  function share() {
    var btns = document.querySelectorAll("[data-share]");
    Array.prototype.forEach.call(btns, function (b) {
      var puvodni = b.textContent;
      b.addEventListener("click", function () {
        if (window.gtag) gtag("event", "share", { method: "tlacitko" });
        var data = { title: "Tři noci v bouři – ukázka zdarma",
                     text: "Čtu novou knihu Tři noci v bouři. První dvě kapitoly jsou zdarma, mrkni:",
                     url: "https://nikolasvaren.cz/" };
        if (navigator.share) { navigator.share(data).catch(function () {}); return; }
        var t = data.text + " " + data.url;
        var hotovo = function () { b.textContent = "Odkaz je zkopírovaný"; setTimeout(function () { b.textContent = puvodni; }, 2500); };
        if (navigator.clipboard) { navigator.clipboard.writeText(t).then(hotovo, function () { prompt("Zkopíruj odkaz:", data.url); }); }
        else { prompt("Zkopíruj odkaz:", data.url); }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () { bar(); form(); share(); });
})();
