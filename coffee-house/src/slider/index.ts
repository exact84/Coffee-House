import { setupSlider } from './core';

export function initSlider(): void {
  const section = document.querySelector<HTMLElement>('.slider-row');
  const slider = document.querySelector<HTMLElement>('.slider-slider');
  const btnLeft = document.getElementById('btnLeft') as HTMLElement;
  const btnRight = document.getElementById('btnRight') as HTMLElement;
  const controls = document.querySelectorAll<HTMLElement>('.slider-control');

  if (!section || !slider || !btnLeft || !btnRight || controls.length === 0) {
    console.log('Slider: elements not found');
    return;
  }

  setupSlider({ section, slider, btnLeft, btnRight, controls });
}
