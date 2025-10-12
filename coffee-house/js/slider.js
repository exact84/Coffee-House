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
// let widthSlider = slider.offsetWidth;

let position = 0;
let currentSlide = 0;
let slidesCount = 3;
const autoScrollTime = 5000;

let autoScrollInterval;
let progressInterval;

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

  // if (currentSlide === 0) {
  //   position = 0;
  // } else {
  //   position = -currentSlide * step;
  // }
  position = -currentSlide * step;

  // console.log("position:", position);
  slider.style.transform = `translateX(${position}px)`;
  updateControls();
  startAutoScroll();
}

function left() {
  stopAutoScroll();

  // widthVisble = section.offsetWidth;
  // widthSlider = slider.scrollWidth;
  const step = getStep();
  currentSlide = (currentSlide - 1 + slidesCount) % slidesCount;

  // if (currentSlide === slidesCount - 1) {
  //   position = -(slidesCount - 1) * step;
  // } else {
  //   position = -currentSlide * step;
  // }
  position = -currentSlide * step;

  slider.style.transform = `translateX(${position}px)`;
  updateControls();
  startAutoScroll();
}

section.addEventListener("mouseenter", function () {
  stopAutoScroll();
  pauseProgress();
});

section.addEventListener("mouseleave", function () {
  resumeProgress();
  startAutoScroll();
});

function resize() {
  const oldWidthVisible = widthVisble;
  const oldPosition = position;
  widthVisble = section.offsetWidth;
  // widthSlider = slider.scrollWidth;

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
  // const step = getStep();
  // currentSlide = Math.abs(Math.round(position / step));

  controls.forEach((control, index) => {
    if (index === currentSlide) {
      control.classList.add("slider-control-activ");
    } else {
      control.classList.remove("slider-control-activ");
    }
  });
}

function startAutoScroll() {
  // return;
  stopAutoScroll();
  resetProgress();
  setTimeout(() => {
    startProgress();
    autoScrollInterval = setInterval(() => {
      right();
    }, autoScrollTime);
  }, 50);
}

function stopAutoScroll() {
  clearInterval(autoScrollInterval);
  clearInterval(progressInterval);
}

function startProgress() {
  const progressBar = controls[currentSlide].querySelector(".slider-progress");
  progressBar.style.transition = `width ${autoScrollTime}ms linear`;
  progressBar.style.width = "100%";
  progressStartTime = Date.now();
  isPaused = false;
}

function resetProgress() {
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

  const progressBar = controls[currentSlide].querySelector(".slider-progress");
  const elapsedTime = Date.now() - progressStartTime;
  remainingTime = autoScrollTime - elapsedTime;

  const computedStyle = window.getComputedStyle(progressBar);
  progressBar.style.transition = "none";
  progressBar.style.width = computedStyle.width;

  isPaused = true;
}

function resumeProgress() {
  if (!isPaused) return;
  startProgress();
}

let startX = 0;
let currentX = 0;
let isSwiping = false;

section.addEventListener("touchmove", handleTouchMove);
section.addEventListener("touchend", handleTouchEnd);

function handleTouchStart(e) {
  stopAutoScroll();
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
  if (!isSwiping) {
    resumeProgress();
    startAutoScroll();
    return;
  }
  const diffX = startX - currentX;
  const minSwipeDistance = 50;

  if (diffX > minSwipeDistance) {
    right();
  } else if (diffX < -minSwipeDistance) {
    left();
  }

  isSwiping = false;
  startAutoScroll();
}

section.addEventListener("touchstart", handleTouchStart);

