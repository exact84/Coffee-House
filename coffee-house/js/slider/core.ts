import { SliderElements, SliderState } from './types';
import {scrollTime} from './consts';

export function setupSlider({ section, slider, btnLeft, btnRight, controls }: SliderElements): void {
  const slidesCount = controls.length;
  let state: SliderState = {
    position: 0,
    currentSlide: 0,
    slidesCount,
    widthVisible: section.offsetWidth,
    autoScrollTime: scrollTime,
    remainingTime: scrollTime,
    progressStartTime: 0,
    isPaused: false,
  };

  btnRight.addEventListener('click', () => right());
  btnLeft.addEventListener('click', () => left());
  window.addEventListener('resize', () => resize());
  section.addEventListener('mouseenter', pauseProgress);
  section.addEventListener('mouseleave', resumeProgress);
  section.addEventListener('touchstart', handleTouchStart);
  section.addEventListener('touchmove', handleTouchMove);
  section.addEventListener('touchend', handleTouchEnd);

  let startX = 0;
  let currentX = 0;
  let isSwiping = false;

  function getStep(): number {
    const cards = section.querySelectorAll<HTMLElement>('.slider-card');
    const style = window.getComputedStyle(slider);
    const gap = parseInt(style.gap) || 0;
    return cards[0].offsetWidth + gap;
  }

  function updateControls(): void {
    controls.forEach((c, i) => c.classList.toggle('slider-control-activ', i === state.currentSlide));
  }

  function resetProgress(): void {
    state.remainingTime = state.autoScrollTime;
    state.isPaused = false;
    controls.forEach((control) => {
      const progressBar = control.querySelector<HTMLElement>('.slider-progress');
      if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
      }
    });
  }

  function startProgress(): void {
    if (state.isPaused) return;
    const progressBar = controls[state.currentSlide].querySelector<HTMLElement>('.slider-progress');
    if (!progressBar) return;

    const duration = state.remainingTime || state.autoScrollTime;
    progressBar.style.transition = 'none';
    progressBar.offsetWidth;
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = '100%';
    state.progressStartTime = Date.now();
  }

  function stopAutoScroll(): void {
    if (state.autoScrollTimeout) {
      clearTimeout(state.autoScrollTimeout);
      state.autoScrollTimeout = undefined;
    }
  }

  function startAutoScroll(): void {
    stopAutoScroll();
    if (state.isPaused) return;
    resetProgress();
    startProgress();
    state.autoScrollTimeout = window.setTimeout(() => right(), state.remainingTime);
  }

  function right(): void {
    stopAutoScroll();
    const step = getStep();
    state.currentSlide = (state.currentSlide + 1) % state.slidesCount;
    state.position = -state.currentSlide * step;
    slider.style.transform = `translateX(${state.position}px)`;
    state.isPaused = false;
    updateControls();
    startAutoScroll();
  }

  function left(): void {
    stopAutoScroll();
    const step = getStep();
    state.currentSlide = (state.currentSlide - 1 + state.slidesCount) % state.slidesCount;
    state.position = -state.currentSlide * step;
    slider.style.transform = `translateX(${state.position}px)`;
    state.isPaused = false;
    updateControls();
    startAutoScroll();
  }

  function resize(): void {
    state.widthVisible = section.offsetWidth;
    const step = getStep();
    state.position = -state.currentSlide * step;
    slider.style.transform = `translateX(${state.position}px)`;
    updateControls();
    // stopAutoScroll();
    // startAutoScroll();
  }

  function pauseProgress(): void {
    if (state.isPaused) return;
    stopAutoScroll();
    const progressBar = controls[state.currentSlide].querySelector<HTMLElement>('.slider-progress');
    if (!progressBar) return;

    const elapsed = Date.now() - state.progressStartTime;
    state.remainingTime = Math.max(0, state.autoScrollTime - elapsed);
    const currentWidth = window.getComputedStyle(progressBar).width;
    progressBar.style.transition = 'none';
    progressBar.style.width = currentWidth;
    state.isPaused = true;
  }

  function resumeProgress(): void {
    if (!state.isPaused) return;
    state.isPaused = false;
    const progressBar = controls[state.currentSlide].querySelector<HTMLElement>('.slider-progress');
    if (!progressBar) return;
    progressBar.style.transition = `width ${state.remainingTime}ms linear`;
    progressBar.style.width = '100%';
    state.progressStartTime = Date.now() - (state.autoScrollTime - state.remainingTime);
    state.autoScrollTimeout = window.setTimeout(() => right(), state.remainingTime);
  }

  function handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    pauseProgress();
    startX = e.touches[0].clientX;
    currentX = startX;
    isSwiping = true;
  }

  function handleTouchMove(e: TouchEvent): void {
    if (!isSwiping) return;
    e.preventDefault();
    currentX = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent): void {
    if (!isSwiping) return;
    e.preventDefault();
    const diffX = startX - currentX;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe) resumeProgress();
    else diffX > 0 ? right() : left();
    isSwiping = false;
  }

  updateControls();
  startAutoScroll();
}
