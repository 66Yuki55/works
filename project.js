const header = document.querySelector(".site-header");
const cursor = document.querySelector(".site-cursor");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const detailVideo = document.querySelector(".detail-player video");
const durationLabel = document.querySelector("[data-duration]");

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "FULL FILM";
  }

  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remaining = String(rounded % 60).padStart(2, "0");
  return `FULL FILM / ${minutes}:${remaining}`;
}

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 22);
}

if (detailVideo && durationLabel) {
  const updateDuration = () => {
    durationLabel.textContent = formatDuration(detailVideo.duration);
  };

  detailVideo.addEventListener("loadedmetadata", updateDuration, { once: true });
  if (detailVideo.readyState >= 1) {
    updateDuration();
  }
}

if (cursor && finePointer.matches) {
  document.addEventListener("pointermove", (event) => {
    cursor.classList.add("is-active");
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
  });

  document.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-active");
  });
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
