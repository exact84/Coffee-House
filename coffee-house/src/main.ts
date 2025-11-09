import { initBurgerMenu } from './burger-menu';
import { initSlider } from './slider/index';
import { CurrentUser } from './user';
import { loadLayout } from './utils';
// import '/assets/fonts/Inter-Regular.woff2';
// import '/assets/fonts/Inter-Italic.woff2';
// import '/assets/fonts/Inter-SemiBold.woff2';
// import '/assets/fonts/Inter-SemiBoldItalic.woff2';

document.addEventListener('DOMContentLoaded', async () => {
  await CurrentUser.restoreInstance();
  await loadLayout();
  initBurgerMenu();
  initSlider();
});
