// ===== Before / After sliders =====
document.querySelectorAll(".compare__frame").forEach((frame) => {
  const range = frame.querySelector(".compare__range");
  const pastTag = frame.querySelector(".compare__tag--past");
  const presentTag = frame.querySelector(".compare__tag--present");

  const update = () => {
    const value = Number(range.value);
    frame.style.setProperty("--pos", value + "%");
    // Fade a year tag out when its photo is almost hidden
    if (pastTag) pastTag.style.opacity = value < 12 ? 0 : 1;
    if (presentTag) presentTag.style.opacity = value > 88 ? 0 : 1;
    range.setAttribute("aria-valuetext", value + "% past photo shown");
  };

  range.addEventListener("input", update);
  update();
});

// ===== Campus walk: mini map with a moving pin =====
const SVG_NS = "http://www.w3.org/2000/svg";
const campusMap = document.getElementById("campus-map");
const stops = [...document.querySelectorAll(".stop")];
const minimap = document.querySelector(".minimap");
const footer = document.querySelector(".footer");

// Stop coordinates come from the route line in the map
const points = campusMap
  .querySelector(".map-route")
  .getAttribute("points").trim().split(/\s+/)
  .map((p) => p.split(",").map(Number));

// Distance along the route to each stop
const lengths = [0];
for (let i = 1; i < points.length; i++) {
  const [x1, y1] = points[i - 1];
  const [x2, y2] = points[i];
  lengths.push(lengths[i - 1] + Math.hypot(x2 - x1, y2 - y1));
}
const total = lengths[lengths.length - 1];

// Copy the big map into the floating card and add the pin
const mini = campusMap.cloneNode(true);
mini.removeAttribute("id");
mini.setAttribute("aria-hidden", "true");
mini.setAttribute("viewBox", "60 20 530 330"); // crop a little closer
document.querySelector(".minimap__map").appendChild(mini);

const pin = document.createElementNS(SVG_NS, "g");
pin.setAttribute("class", "map-pin");
pin.innerHTML = '<circle class="map-pin__pulse" r="18"/><circle class="map-pin__dot" r="9"/>';
mini.appendChild(pin);

const walkedLines = document.querySelectorAll(".map-route--walked");
walkedLines.forEach((l) => {
  l.style.strokeDasharray = total;
  l.style.strokeDashoffset = total;
});
const markers = document.querySelectorAll(".map-stop");
const stepEl = document.querySelector(".minimap__step");
const nameEl = document.querySelector(".minimap__name");

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function updateTour() {
  const line = window.scrollY + window.innerHeight * 0.45; // "reading line"
  const tops = stops.map((s) => s.getBoundingClientRect().top + window.scrollY);

  // Which stop is the reader at?
  let i = 0;
  while (i < stops.length - 1 && line >= tops[i + 1]) i++;

  // Pin waits at a stop for the first 60% of its section, then walks to the next
  let walk = 0;
  if (i < stops.length - 1 && line > tops[i]) {
    const t = (line - tops[i]) / (tops[i + 1] - tops[i]);
    walk = clamp((t - 0.6) / 0.4, 0, 1);
  }

  const [x1, y1] = points[i];
  const [x2, y2] = points[Math.min(i + 1, points.length - 1)];
  pin.setAttribute("transform", `translate(${x1 + (x2 - x1) * walk} ${y1 + (y2 - y1) * walk})`);

  const walked = lengths[i] + (lengths[Math.min(i + 1, lengths.length - 1)] - lengths[i]) * walk;
  walkedLines.forEach((l) => (l.style.strokeDashoffset = total - walked));

  markers.forEach((m) => m.classList.toggle("is-visited", Number(m.dataset.stop) <= i + 1));

  const current = walk > 0.5 ? i + 1 : i;
  stepEl.textContent = `Stop ${current + 1} of ${stops.length}`;
  nameEl.textContent = stops[current].dataset.name;

  // Show the card during the tour, hide it at the top and at the footer
  const started = line > tops[0];
  const ended = footer.getBoundingClientRect().top < window.innerHeight * 0.7;
  minimap.classList.toggle("is-visible", started && !ended);
}

// Click any stop on either map to jump there
document.addEventListener("click", (e) => {
  const marker = e.target.closest(".map-stop");
  if (marker) document.getElementById("stop-" + marker.dataset.stop).scrollIntoView({ behavior: "smooth" });
});

// Hide / show the mini map
const toggle = document.querySelector(".minimap__toggle");
toggle.addEventListener("click", () => {
  const collapsed = minimap.classList.toggle("is-collapsed");
  toggle.textContent = collapsed ? "+" : "–";
  toggle.setAttribute("aria-label", collapsed ? "Show map" : "Hide map");
  toggle.setAttribute("aria-expanded", String(!collapsed));
});

// ===== Reading progress bar =====
const bar = document.querySelector(".progress span");
function setProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    setProgress();
    updateTour();
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
window.addEventListener("load", onScroll);
onScroll();

// ===== Fade sections in as you scroll =====
const items = document.querySelectorAll(".text, .compare, .stats, .route");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}
