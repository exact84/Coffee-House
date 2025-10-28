import { initBurgerMenu } from './burger-menu';
import { getTabData } from './cards/menu-cards';
import { CurrentUser } from './user';
import { loadLayout } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  await CurrentUser.restoreInstance();
  await loadLayout();
  initBurgerMenu();
  getTabData();
});
