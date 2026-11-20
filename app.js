const heroImages = [
  { src: "assets/works/space-motion-cover.jpg", ratio: 0.75, size: 244, label: "FRAME 01" },
  {
    src: "assets/works/copilot-compare-cover.jpg",
    ratio: 0.5625,
    size: 194,
    label: "FRAME 16",
  },
  { src: "assets/works/yonho-ip.jpg", ratio: 0.708, size: 232, label: "FRAME 07" },
  { src: "assets/works/wifi-cover.jpg", ratio: 1.777, size: 318, label: "FRAME 03" },
  { src: "assets/works/charity-a.jpg", ratio: 0.707, size: 218, label: "FRAME 02" },
  { src: "assets/works/g65-cover.jpg", ratio: 1.777, size: 300, label: "FRAME 09" },
  { src: "assets/works/abao-ip.jpg", ratio: 0.707, size: 238, label: "FRAME 05" },
  {
    src: "assets/works/research-cover.jpg",
    ratio: 0.5625,
    size: 196,
    label: "FRAME 08",
  },
  { src: "assets/works/event-cover.jpg", ratio: 0.75, size: 228, label: "FRAME 17" },
  { src: "assets/works/arsenal-cover.jpg", ratio: 1.777, size: 310, label: "FRAME 15" },
];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const heroMedia = document.querySelector(".hero-media");
const header = document.querySelector(".site-header");
const cursor = document.querySelector(".site-cursor");
const projects = [...document.querySelectorAll(".project")];
const projectViewer = document.querySelector(".project-viewer");
const viewerStage = projectViewer?.querySelector(".viewer-stage");
const viewerVideo = projectViewer?.querySelector("video");
const viewerImage = projectViewer?.querySelector("img");
const viewerIndex = projectViewer?.querySelector(".viewer-index");
const viewerCategory = projectViewer?.querySelector(".viewer-category");
const viewerTitle = projectViewer?.querySelector(".viewer-title");
const viewerDescription = projectViewer?.querySelector(".viewer-description");
const viewerClose = projectViewer?.querySelector(".viewer-close");

let imageIndex = 0;
let lastSpawn = 0;
let previousPoint = null;
let idleTimer = 0;
let hasInteracted = false;
let activeTiles = [];
let lastFocusedProject = null;

function spawnTile(clientX, clientY, options = {}) {
  if (reducedMotion.matches || !heroMedia) {
    return;
  }

  const bounds = heroMedia.getBoundingClientRect();
  const localX = clientX - bounds.left;
  const localY = clientY - bounds.top;

  if (
    localX < -160 ||
    localX > bounds.width + 160 ||
    localY < -160 ||
    localY > bounds.height + 160
  ) {
    return;
  }

  const itemIndex = options.index ?? imageIndex % heroImages.length;
  const item = heroImages[itemIndex];
  const movement = previousPoint
    ? {
        x: localX - previousPoint.x,
        y: localY - previousPoint.y,
      }
    : { x: 0, y: 0 };

  const tile = document.createElement("figure");
  const image = document.createElement("img");
  const label = document.createElement("span");
  const driftX = movement.x * -0.25 + (Math.random() - 0.5) * 38;
  const driftY = movement.y * -0.19 + (Math.random() - 0.5) * 36 - 62;
  const rotation = (Math.random() - 0.5) * 3.6;
  const mobileScale = finePointer.matches ? 1 : 0.74;

  tile.className = "cursor-tile";
  tile.setAttribute("aria-hidden", "true");
  tile.style.setProperty("--tx", `${localX}px`);
  tile.style.setProperty("--ty", `${localY}px`);
  tile.style.setProperty("--offset-x", `${driftX}px`);
  tile.style.setProperty("--offset-y", `${driftY}px`);
  tile.style.setProperty("--rotation", `${rotation}deg`);
  tile.style.setProperty("--tile-width", `${item.size}px`);
  tile.style.setProperty("--tile-width-mobile", `${item.size * mobileScale}px`);
  tile.style.setProperty("--tile-ratio", item.ratio);

  image.src = item.src;
  image.alt = "";
  image.decoding = "async";

  label.className = "cursor-tile-label";
  label.textContent = item.label;

  tile.append(image, label);
  heroMedia.appendChild(tile);
  activeTiles.push(tile);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => tile.classList.add("is-visible"));
  });

  const visibleFor = options.visibleFor ?? 920;
  window.setTimeout(() => tile.classList.add("is-leaving"), visibleFor);
  window.setTimeout(() => {
    tile.remove();
    activeTiles = activeTiles.filter((activeTile) => activeTile !== tile);
  }, visibleFor + 720);

  if (activeTiles.length > 8) {
    const oldest = activeTiles.shift();
    oldest?.remove();
  }

  previousPoint = { x: localX, y: localY };
  imageIndex = (itemIndex + 1) % heroImages.length;
}

function createIntroSequence() {
  if (!heroMedia || reducedMotion.matches) {
    return;
  }

  const bounds = heroMedia.getBoundingClientRect();
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  const sequence = mobile
    ? [
        { x: bounds.width * 0.5, y: bounds.height * 0.44, index: 0 },
        { x: bounds.width * 0.7, y: bounds.height * 0.56, index: 4 },
        { x: bounds.width * 0.38, y: bounds.height * 0.61, index: 7 },
      ]
    : [
        { x: bounds.width * 0.43, y: bounds.height * 0.44, index: 0 },
        { x: bounds.width * 0.61, y: bounds.height * 0.53, index: 2 },
        { x: bounds.width * 0.36, y: bounds.height * 0.63, index: 5 },
        { x: bounds.width * 0.57, y: bounds.height * 0.7, index: 8 },
      ];

  sequence.forEach((point, sequenceIndex) => {
    window.setTimeout(() => {
      spawnTile(bounds.left + point.x, bounds.top + point.y, {
        index: point.index,
        visibleFor: 1280,
      });
    }, 360 + sequenceIndex * 600);
  });
}

function beginIdleSequence() {
  if (!heroMedia || reducedMotion.matches || !finePointer.matches) {
    return;
  }

  window.clearInterval(idleTimer);
  idleTimer = window.setInterval(() => {
    if (hasInteracted || !heroMedia.matches(":hover")) {
      return;
    }

    const bounds = heroMedia.getBoundingClientRect();
    const time = Date.now() / 2300;
    const x = bounds.left + bounds.width * (0.46 + Math.cos(time) * 0.22);
    const y = bounds.top + bounds.height * (0.51 + Math.sin(time * 1.2) * 0.18);
    spawnTile(x, y, { visibleFor: 1080 });
  }, 1700);
}

function attachHeroInteraction() {
  if (!heroMedia) {
    return;
  }

  heroMedia.addEventListener("pointerenter", (event) => {
    if (!finePointer.matches) {
      return;
    }

    hasInteracted = true;
    lastSpawn = performance.now() - 120;
    spawnTile(event.clientX, event.clientY);
  });

  heroMedia.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }

    hasInteracted = true;
    const now = performance.now();
    if (now - lastSpawn < 105) {
      return;
    }

    lastSpawn = now;
    spawnTile(event.clientX, event.clientY);
  });

  heroMedia.addEventListener("pointerleave", () => {
    previousPoint = null;
  });
}

function attachCursor() {
  if (!cursor || !finePointer.matches) {
    return;
  }

  document.addEventListener("pointermove", (event) => {
    cursor.classList.add("is-active");
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
  });

  document.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-active");
  });

  projects.forEach((project) => {
    project.addEventListener("pointerenter", () => {
      cursor.classList.add("is-project");
    });
    project.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-project");
    });
  });
}

function playProjectVideo(project) {
  if (reducedMotion.matches) {
    return;
  }

  const video = project.querySelector("video");
  if (!video) {
    return;
  }

  project.classList.add("is-playing");
  const playPromise = video.play();
  if (playPromise) {
    playPromise.catch(() => {
      project.classList.remove("is-playing");
    });
  }
}

function stopProjectVideo(project) {
  const video = project.querySelector("video");
  project.classList.remove("is-playing");
  if (!video) {
    return;
  }

  video.pause();
  if (video.readyState > 0) {
    video.currentTime = 0;
  }
}

function attachProjectPreviews() {
  projects.forEach((project) => {
    project.addEventListener("pointerenter", () => playProjectVideo(project));
    project.addEventListener("pointerleave", () => stopProjectVideo(project));
    project.addEventListener("focus", () => playProjectVideo(project));
    project.addEventListener("blur", () => stopProjectVideo(project));
    project.addEventListener("click", () => openProject(project));
  });
}

function openProject(project) {
  if (!projectViewer || !viewerVideo || !viewerImage) {
    return;
  }

  lastFocusedProject = project;
  viewerIndex.textContent = `${project.dataset.index} / ${String(projects.length).padStart(2, "0")}`;
  viewerCategory.textContent = project.dataset.category;
  viewerTitle.textContent = project.dataset.title;
  viewerDescription.textContent = project.dataset.description;

  const videoSource = project.dataset.video;
  const imageSource = project.dataset.image;

  viewerVideo.pause();
  viewerVideo.removeAttribute("src");
  viewerVideo.load();
  viewerImage.removeAttribute("src");
  viewerImage.alt = "";
  viewerStage.classList.remove("is-video", "is-image");

  if (videoSource) {
    viewerStage.classList.add("is-video");
    viewerVideo.src = videoSource;
    viewerVideo.load();
    const playPromise = viewerVideo.play();
    if (playPromise) {
      playPromise.catch(() => {});
    }
  } else if (imageSource) {
    viewerStage.classList.add("is-image");
    viewerImage.src = imageSource;
    viewerImage.alt = project.dataset.title;
  }

  document.body.classList.add("has-viewer");
  projectViewer.showModal();
  viewerClose?.focus({ preventScroll: true });
}

function closeProject() {
  if (projectViewer?.open) {
    projectViewer.close();
  }
}

function cleanUpViewer() {
  viewerVideo?.pause();
  viewerVideo?.removeAttribute("src");
  viewerVideo?.load();
  viewerImage?.removeAttribute("src");
  document.body.classList.remove("has-viewer");
  lastFocusedProject?.focus({ preventScroll: true });
}

function attachViewer() {
  if (!projectViewer) {
    return;
  }

  viewerClose?.addEventListener("click", closeProject);
  projectViewer.addEventListener("click", (event) => {
    if (event.target !== projectViewer) {
      return;
    }

    const bounds = projectViewer.getBoundingClientRect();
    const inside =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;

    if (!inside) {
      closeProject();
    }
  });
  projectViewer.addEventListener("close", cleanUpViewer);
}

function attachReveal() {
  if (!("IntersectionObserver" in window)) {
    projects.forEach((project) => project.classList.add("is-inview"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-inview");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -7% 0px", threshold: 0.06 },
  );

  projects.forEach((project, index) => {
    project.setAttribute("data-reveal", "");
    project.style.transitionDelay = `${Math.min(index % 4, 3) * 45}ms`;
    revealObserver.observe(project);
  });
}

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 32);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    return;
  }

  projects.forEach(stopProjectVideo);
  viewerVideo?.pause();
});

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("load", createIntroSequence);

attachHeroInteraction();
attachCursor();
attachProjectPreviews();
attachViewer();
attachReveal();
updateHeader();
beginIdleSequence();
