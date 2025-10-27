import { CurrentUser } from './user';

export function initBurgerMenu(): void {
  const burgerToggle = document.getElementById('burger-toggle') as HTMLInputElement;
  const menu = document.querySelector('.menu');
  const body = document.body;
  const html = document.documentElement;

  if (CurrentUser.instance?.countCart === 0 && CurrentUser.instance?.userData?.user.id == -1) {
    document.getElementById('cart-menu')!.style.display = 'none';
    document.getElementById('cart-menu-vertical')!.style.display = 'none';
  }

  if (!burgerToggle || !menu) {
    console.log('burgerToggle or menu not found');
    return;
  }

  burgerToggle.addEventListener('change', function () {
    if (burgerToggle.checked) {
      body.classList.add('no-scroll');
      html.classList.add('no-scroll');
    } else {
      body.classList.remove('no-scroll');
      html.classList.remove('no-scroll');
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && burgerToggle.checked) {
      burgerToggle.checked = false;
      body.classList.remove('no-scroll');
      html.classList.remove('no-scroll');
    }
  });

  menu.addEventListener('click', () => {
    burgerToggle.checked = false;
    body.classList.remove('no-scroll');
    html.classList.remove('no-scroll');
  });
}
