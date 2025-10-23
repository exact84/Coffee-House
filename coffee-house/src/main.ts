import { initBurgerMenu } from './burger-menu';
import { initSlider } from './slider/index';
import { CurrentUser } from './user';
import { loadLayout } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  await CurrentUser.restoreInstance();
  await loadLayout();
  initBurgerMenu();
  initSlider();
});
