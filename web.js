/* ===== NASTAVENÍ: tyhle tři hodnoty doplníme, až budou účty ===== */
var NASTAVENI = {
  metaPixelId: "DOPLNIT_PIXEL_ID",        // Meta pixel pro Nelu Varen
  mailerliteUcet: "2646388",   // z vložení formuláře MailerLite (číslo účtu)
  mailerliteFormular: "199052731921466767"   // z vložení formuláře MailerLite (číslo formuláře)
};
/* ================================================================= */

(function () {
  var KEY = "nv_cookies";
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Meta pixel se načte jen se souhlasem s marketingovými cookies.
  window.nvPixel = function () {};
  function loadPixel() {
    if (!/^\d+$/.test(NASTAVENI.metaPixelId)) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', NASTAVENI.metaPixelId);
    fbq('track', 'PageView');
    window.nvPixel = function (ev) { fbq('track', ev); };
    if (document.body && document.body.dataset.event) fbq('track', document.body.dataset.event);
  }

  function bar() {
    var el = document.getElementById("cookies");
    if (!el) return;
    var choice = read();
    if (choice === "ano") { loadPixel(); return; }
    if (choice === "ne") return;
    el.style.display = "block";
    el.querySelector(".yes").onclick = function () { save("ano"); el.style.display = "none"; loadPixel(); };
    el.querySelector(".no").onclick = function () { save("ne"); el.style.display = "none"; };
  }
  window.nvCookiesReset = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };

  // Formulář: odešle kontakt do MailerLite a přesměruje na poděkování.
  function form() {
    var f = document.getElementById("ukazka");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = f.querySelector(".err"); err.textContent = "";
      var email = f.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Zkontroluj prosím e-mail."; return; }
      if (!f.vek.checked) { err.textContent = "Kniha je jen pro čtenářky a čtenáře starší 18 let."; return; }
      if (!f.souhlas.checked) { err.textContent = "Bez souhlasu ti ukázku nemůžeme poslat e-mailem."; return; }
      if (!/^\d+$/.test(NASTAVENI.mailerliteUcet) || !/^\d+$/.test(NASTAVENI.mailerliteFormular)) { err.textContent = "Formulář se právě připravuje. Zkus to prosím za chvíli."; return; }
      var btn = f.querySelector("button"); btn.disabled = true; btn.textContent = "Odesílám…";
      var data = new FormData();
      data.append("fields[email]", email);
      data.append("fields[name]", f.jmeno.value.trim());
      data.append("ml-submit", "1");
      data.append("anticsrf", "true");
      var url = "https://assets.mailerlite.com/jsonp/" + NASTAVENI.mailerliteUcet +
                "/forms/" + NASTAVENI.mailerliteFormular + "/subscribe";
      fetch(url, { method: "POST", body: data, mode: "no-cors" })
        .then(function () { location.href = "dekujeme.html"; })
        .catch(function () {
          btn.disabled = false; btn.textContent = "Pošli mi ukázku";
          err.textContent = "Něco se nepovedlo. Zkus to prosím znovu za chvíli.";
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () { bar(); form(); });
})();
