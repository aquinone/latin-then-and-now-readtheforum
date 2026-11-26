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


  // Which stop is the reader at?
  let i = 0;
  while (i < stops.length - 1 && line >= tops[i + 1]) i++;


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
