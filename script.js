(function () {
  "use strict";

  var WHATSAPP = "923008906067";

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // Header shadow on scroll
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Reveal on scroll
  var revealEls = document.querySelectorAll(".card, .service, .steps li, .why-list li, .faq details, .section-head");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  // Fan calculator
  // Rule of thumb: circulation fans spaced ~10x their diameter apart in a row,
  // one row for roughly every 24 ft of shed width.
  var MOTOR_KW = { 36: 0.55, 50: 1.1, 56: 1.5 };
  var form = document.getElementById("calc-form");
  var out = {
    fans: document.getElementById("r-fans"),
    rows: document.getElementById("r-rows"),
    perRow: document.getElementById("r-perrow"),
    spacing: document.getElementById("r-spacing"),
    load: document.getElementById("r-load"),
    solar: document.getElementById("r-solar"),
    wa: document.getElementById("r-whatsapp")
  };

  function num(id, min, max, fallback) {
    var v = parseFloat(document.getElementById(id).value);
    if (!isFinite(v)) return fallback;
    return Math.min(max, Math.max(min, v));
  }

  function calculate() {
    var length = num("c-length", 10, 2000, 120);
    var width = num("c-width", 10, 500, 40);
    var size = parseInt(document.getElementById("c-size").value, 10);
    var animals = num("c-animals", 1, 10000, 50);

    var spacing = Math.round((size * 10) / 12); // feet
    var rows = Math.max(1, Math.ceil(width / 24));
    var perRow = Math.max(1, Math.ceil(length / spacing));
    var fans = rows * perRow;
    var load = fans * MOTOR_KW[size];
    var solar = Math.ceil(load * 1.3);

    out.fans.textContent = fans;
    out.rows.textContent = rows;
    out.perRow.textContent = perRow;
    out.spacing.textContent = "about " + spacing + " ft";
    out.load.textContent = load.toFixed(1) + " kW";
    out.solar.textContent = "about " + solar + " kW";

    var msg = "Assalam-o-Alaikum Khaleeq Engineering. My shed is " + length + " ft x " + width +
      " ft with " + animals + " animals. Your calculator suggests " + fans + " x " + size +
      "\" fans. Please send me a quote.";
    out.wa.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); calculate(); });
  form.addEventListener("input", calculate);
  calculate();

  // Contact form -> WhatsApp
  var contact = document.getElementById("contact-form");
  var err = document.getElementById("f-error");
  contact.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("f-name");
    var phone = document.getElementById("f-phone");
    var missing = false;
    [name, phone].forEach(function (el) {
      var bad = !el.value.trim();
      el.setAttribute("aria-invalid", String(bad));
      if (bad) missing = true;
    });
    err.hidden = !missing;
    if (missing) { (name.value.trim() ? phone : name).focus(); return; }

    var lines = [
      "Assalam-o-Alaikum Khaleeq Engineering,",
      "Name: " + name.value.trim(),
      "Phone: " + phone.value.trim()
    ];
    var city = document.getElementById("f-city").value.trim();
    if (city) lines.push("Location: " + city);
    lines.push("Interested in: " + document.getElementById("f-interest").value);
    var message = document.getElementById("f-message").value.trim();
    if (message) lines.push("Details: " + message);

    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
  });
})();
