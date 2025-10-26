export function initBurgerMenu(): void {
  const burgerToggle = document.getElementById('burger-toggle') as HTMLInputElement;
  const menu = document.querySelector('.menu');
  const body = document.body;
  const html = document.documentElement;

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
