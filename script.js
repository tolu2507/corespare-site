const panels = Array.from(document.querySelectorAll(".panel"));
const dockItems = Array.from(document.querySelectorAll(".dock-item"));
const indicatorCurrent = document.querySelector(".indicator-current");
const indicatorTotal = document.querySelector(".indicator-total");
const app = document.getElementById("app");
const body = document.body;
const total = panels.length;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (total > 0 && app) {
  let activeIndex = 0;
  let lock = false;
  let wheelDeltaAccumulator = 0;
  const transitionMs = reducedMotion ? 80 : 900;

  if (indicatorTotal) {
    indicatorTotal.textContent = String(total).padStart(2, "0");
  }

  const setActive = (index) => {
    const next = Math.max(0, Math.min(total - 1, index));
    if (next === activeIndex) return;

    panels[activeIndex].classList.remove("is-active");
    if (dockItems[activeIndex]) {
      dockItems[activeIndex].classList.remove("is-active");
    }

    panels[next].classList.add("is-active");
    if (dockItems[next]) {
      dockItems[next].classList.add("is-active");
    }

    if (indicatorCurrent) {
      indicatorCurrent.textContent = String(next + 1).padStart(2, "0");
    }

    activeIndex = next;
  };

  const navigate = (direction) => {
    if (window.innerWidth <= 760 || lock) return;
    lock = true;
    setActive(activeIndex + direction);
    window.setTimeout(() => {
      lock = false;
    }, transitionMs);
  };

  const onWheel = (event) => {
    if (window.innerWidth <= 760) return;
    event.preventDefault();
    wheelDeltaAccumulator += event.deltaY;
    if (Math.abs(wheelDeltaAccumulator) < 45) return;
    navigate(wheelDeltaAccumulator > 0 ? 1 : -1);
    wheelDeltaAccumulator = 0;
  };

  let touchStartY = 0;
  const onTouchStart = (event) => {
    touchStartY = event.changedTouches[0].clientY;
  };

  const onTouchEnd = (event) => {
    if (window.innerWidth <= 760) return;
    const delta = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(delta) < 40) return;
    navigate(delta > 0 ? 1 : -1);
  };

  const onKeydown = (event) => {
    if (window.innerWidth <= 760) return;

    const forwardKeys = ["ArrowDown", "PageDown", " "];
    const backwardKeys = ["ArrowUp", "PageUp"];

    if (forwardKeys.includes(event.key)) {
      event.preventDefault();
      navigate(1);
    }

    if (backwardKeys.includes(event.key)) {
      event.preventDefault();
      navigate(-1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      setActive(total - 1);
    }
  };

  dockItems.forEach((button) => {
    button.addEventListener("click", () => {
      const target = Number(button.dataset.target);
      setActive(target);
    });
  });

  const jumpLinks = Array.from(document.querySelectorAll(".js-nav-target"));
  jumpLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (window.innerWidth <= 760) return;
      const target = Number(link.dataset.target);
      if (Number.isNaN(target)) return;
      event.preventDefault();
      setActive(target);
    });
  });

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });

  const carouselTrack = document.getElementById("carouselTrack");
  const carouselCards = carouselTrack ? Array.from(carouselTrack.children) : [];
  const carouselContainer = carouselTrack?.closest(".carousel");
  let carouselIndex = 0;
  let carouselTimer;
  let carouselTouchStartX = 0;
  let carouselTouchStartY = 0;

  const goCarousel = () => {
    if (!carouselTrack || carouselCards.length === 0) return;
    carouselIndex = (carouselIndex + 1) % carouselCards.length;
    carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
  };

  const startCarousel = () => {
    if (!carouselTrack) return;
    carouselTimer = window.setInterval(goCarousel, 4200);
  };

  const stopCarousel = () => {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = undefined;
    }
  };

  if (carouselTrack) {
    startCarousel();
    carouselTrack.addEventListener("mouseenter", stopCarousel);
    carouselTrack.addEventListener("mouseleave", startCarousel);
  }

  if (carouselContainer) {
    carouselContainer.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.changedTouches[0];
        carouselTouchStartX = touch.clientX;
        carouselTouchStartY = touch.clientY;
      },
      { passive: true },
    );

    carouselContainer.addEventListener(
      "touchend",
      (event) => {
        const touch = event.changedTouches[0];
        const deltaX = carouselTouchStartX - touch.clientX;
        const deltaY = carouselTouchStartY - touch.clientY;
        if (Math.abs(deltaX) < 30 || Math.abs(deltaX) < Math.abs(deltaY)) {
          return;
        }

        stopCarousel();
        if (deltaX > 0) {
          carouselIndex = (carouselIndex + 1) % carouselCards.length;
        } else {
          carouselIndex =
            (carouselIndex - 1 + carouselCards.length) % carouselCards.length;
        }
        carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
        startCarousel();
      },
      { passive: true },
    );
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 760) {
      stopCarousel();
    } else if (!carouselTimer) {
      startCarousel();
    }
  });

  app.focus();
}

if (body.classList.contains("is-intro")) {
  window.setTimeout(
    () => {
      body.classList.remove("is-intro");
    },
    reducedMotion ? 100 : 1300,
  );
}

const inquiryForm = document.querySelector(".inquiry-form");
const formNote = document.querySelector(".form-note");
const aboutGallery = document.getElementById("aboutGallery");
const aboutDots = Array.from(document.querySelectorAll(".about-dot"));

if (aboutGallery && aboutDots.length > 0) {
  const aboutSlides = Array.from(aboutGallery.querySelectorAll(".about-slide"));
  const aboutTotal = aboutSlides.length;
  let aboutIndex = 0;
  let aboutTimer;
  let pointerStartX = 0;
  let pointerDragging = false;

  const setAboutActiveDot = (index) => {
    aboutDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  const getAboutBehavior = (behavior = "smooth") =>
    reducedMotion ? "auto" : behavior;

  const getAboutLeftByIndex = (index) => {
    const boundedIndex = ((index % aboutTotal) + aboutTotal) % aboutTotal;
    return aboutSlides[boundedIndex]?.offsetLeft ?? 0;
  };

  const getAboutNearestIndex = () => {
    if (aboutTotal === 0) return 0;
    let nearestIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    aboutSlides.forEach((slide, slideIndex) => {
      const distance = Math.abs(aboutGallery.scrollLeft - slide.offsetLeft);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearestIndex = slideIndex;
      }
    });

    return nearestIndex;
  };

  const goAbout = (index, behavior = "smooth") => {
    if (aboutTotal === 0) return;
    const boundedIndex = ((index % aboutTotal) + aboutTotal) % aboutTotal;
    aboutIndex = boundedIndex;
    const left = getAboutLeftByIndex(aboutIndex);
    aboutGallery.scrollTo({ left, behavior: getAboutBehavior(behavior) });
    setAboutActiveDot(aboutIndex);
  };

  const startAboutAutoplay = () => {
    if (aboutTotal <= 1 || aboutTimer) return;
    aboutTimer = window.setInterval(() => {
      goAbout(aboutIndex + 1, "smooth");
    }, 4800);
  };

  const stopAboutAutoplay = () => {
    if (!aboutTimer) return;
    clearInterval(aboutTimer);
    aboutTimer = undefined;
  };

  const syncAboutDots = () => {
    const boundedIndex = getAboutNearestIndex();
    aboutIndex = boundedIndex;
    setAboutActiveDot(boundedIndex);
  };

  aboutGallery.addEventListener("scroll", syncAboutDots, { passive: true });

  aboutDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const slideIndex = Number(dot.dataset.slide);
      if (Number.isNaN(slideIndex)) return;
      stopAboutAutoplay();
      goAbout(slideIndex, "smooth");
      startAboutAutoplay();
    });
  });

  aboutGallery.addEventListener("mouseenter", stopAboutAutoplay);
  aboutGallery.addEventListener("mouseleave", startAboutAutoplay);

  aboutGallery.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
    pointerDragging = true;
    stopAboutAutoplay();
  });

  aboutGallery.addEventListener("pointerup", (event) => {
    if (!pointerDragging) return;
    const deltaX = pointerStartX - event.clientX;
    pointerDragging = false;
    if (Math.abs(deltaX) > 40) {
      goAbout(aboutIndex + (deltaX > 0 ? 1 : -1), "smooth");
    } else {
      goAbout(aboutIndex, "smooth");
    }
    startAboutAutoplay();
  });

  aboutGallery.addEventListener("pointerleave", () => {
    pointerDragging = false;
    startAboutAutoplay();
  });

  window.addEventListener("resize", () => {
    goAbout(aboutIndex, "auto");
  });

  startAboutAutoplay();
}

if (inquiryForm && formNote) {
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(inquiryForm);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const company = (formData.get("company") || "").toString().trim();
    const timeline = (formData.get("timeline") || "").toString().trim();
    const requirement = (formData.get("requirement") || "").toString().trim();

    const subject = `Website inquiry — ${name || "CoreSpare visitor"}`;
    const body = [
      "New inquiry from corespare.ee",
      "",
      `Full Name: ${name}`,
      `Business Email: ${email}`,
      `Company: ${company}`,
      `Needed By: ${timeline || "Not specified"}`,
      "",
      "Component Requirement:",
      requirement,
    ].join("\n");

    const params = new URLSearchParams({ subject, body });
    if (email) {
      params.set("cc", email);
    }

    window.location.href = `mailto:inquiry@corespare.ee?${params.toString()}`;

    formNote.textContent =
      "Your email app has been opened with the inquiry details. Send the draft to complete submission.";
    inquiryForm.reset();
  });
}

if (app) {
  app.focus();
}
