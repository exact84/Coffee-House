const btnRight = document.getElementById("btnRight");
const btnLeft = document.getElementById("btnLeft");
const VectorRight = document.getElementById("VectorRight");
const VectorLeft = document.getElementById("VectorLeft");
const slider = document.querySelector(".slider-slider");
const section = document.querySelector(".slider-row");
const controls = document.querySelectorAll(".slider-control");

btnRight.onclick = right;
btnLeft.onclick = left;
window.addEventListener("resize", resize);
let widthVisble = section.offsetWidth;

let position = 0;
let currentSlide = 0;
let slidesCount = 3;
const autoScrollTime = 5000;

let autoScrollTimeout;

let progressStartTime = 0;
let remainingTime = autoScrollTime;
let isPaused = false;

updateControls();
startAutoScroll();

function getStep() {
  const cards = document.querySelectorAll(".slider-card");
  const style = window.getComputedStyle(slider);
  const gap = parseInt(style.gap) || 0;
  return cards[0].offsetWidth + gap;
}

function right() {
  stopAutoScroll();

  const step = getStep();
  currentSlide = (currentSlide + 1) % slidesCount;
  position = -currentSlide * step;

  // console.log("position:", position);
  slider.style.transform = `translateX(${position}px)`;
  isPaused = false;
  updateControls();
  startAutoScroll();
}

function left() {
  stopAutoScroll();
  const step = getStep();
  currentSlide = (currentSlide - 1 + slidesCount) % slidesCount;
  position = -currentSlide * step;

  slider.style.transform = `translateX(${position}px)`;
  isPaused = false;
  updateControls();
  startAutoScroll();
}

section.addEventListener("mouseenter", pauseProgress);
section.addEventListener("mouseleave", resumeProgress);

function resize() {
  const oldWidthVisible = widthVisble;
  const oldPosition = position;
  widthVisble = section.offsetWidth;

  if (oldWidthVisible > 0) {
    position = (oldPosition / oldWidthVisible) * widthVisble;
  } else {
    position = 0;
  }

  const step = getStep();
  currentSlide = Math.abs(Math.round(position / step));

  slider.style.transform = `translateX(${position}px)`;
  updateControls();
  stopAutoScroll();
  startAutoScroll();
}

function updateControls() {
  controls.forEach((control, index) => {
    if (index === currentSlide) {
      control.classList.add("slider-control-activ");
    } else {
      control.classList.remove("slider-control-activ");
    }
  });
}

function startAutoScroll() {
  // console.log("startAutoScroll, isPaused:", isPaused);
  // return;
  stopAutoScroll();
  if (isPaused) return;
  resetProgress();
  startProgress();
  autoScrollTimeout = setTimeout(() => {
    right();
  }, remainingTime);
}

function stopAutoScroll() {
  // console.log("stopAutoScroll");
  if (autoScrollTimeout) {
    clearTimeout(autoScrollTimeout);
    autoScrollTimeout = null;
  }
}

function startProgress() {
  if (isPaused) return;
  // console.log("startProgress");
  const progressBar = controls[currentSlide].querySelector(".slider-progress");

  const duration = remainingTime || autoScrollTime;

  progressBar.style.transition = "none";
  progressBar.offsetWidth;
  progressBar.style.transition = `width ${duration}ms linear`;
  progressBar.style.width = "100%";

  progressStartTime = Date.now();
  isPaused = false;
}

function resetProgress() {
  // console.log("resetProgress");
  remainingTime = autoScrollTime;
  isPaused = false;
  controls.forEach((control) => {
    const progressBar = control.querySelector(".slider-progress");
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
  });
}

function pauseProgress() {
  if (isPaused) return;
  stopAutoScroll();

  const progressBar = controls[currentSlide].querySelector(".slider-progress");
  const elapsedTime = Date.now() - progressStartTime;
  remainingTime = Math.max(0, autoScrollTime - elapsedTime);
  // console.log("pauseProgress, remainingTime:", remainingTime);

  const computedStyle = window.getComputedStyle(progressBar);
  const currentWidth = computedStyle.width;
  progressBar.style.transition = "none";
  progressBar.style.width = currentWidth;
  isPaused = true;
}

function resumeProgress() {
  // console.log("resumeProgress");
  if (!isPaused) return;
  isPaused = false;

  const progressBar = controls[currentSlide].querySelector(".slider-progress");
  progressBar.style.transition = `width ${remainingTime}ms linear`;
  progressBar.style.width = "100%";

  progressStartTime = Date.now() - (autoScrollTime - remainingTime);
  autoScrollTimeout = setTimeout(() => right(), remainingTime);
}

let startX = 0;
let currentX = 0;
let isSwiping = false;

section.addEventListener("touchstart", handleTouchStart);
section.addEventListener("touchmove", handleTouchMove);
section.addEventListener("touchend", handleTouchEnd);

function handleTouchStart(e) {
  pauseProgress();
  startX = e.touches[0].clientX;
  currentX = startX;
  isSwiping = true;
}

function handleTouchMove(e) {
  if (!isSwiping) return;
  currentX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  if (!isSwiping) return;

  const diffX = startX - currentX;
  const minSwipeDistance = 50;

  if (Math.abs(diffX) < minSwipeDistance) {
    resumeProgress();
  } else {
    if (diffX > 0) {
      right();
    } else {
      left();
    }
  }

  isSwiping = false;
}

