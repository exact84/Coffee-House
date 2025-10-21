import { imageMap } from './consts';
import { CardItem } from './responseTypes';
import { CurrentUser } from './user';
import { newElement } from './utils';

async function loadLayout() {
  const header = await fetch('/components/header.html').then((response) => response.text());
  const footer = await fetch('/components/footer.html').then((response) => response.text());

  document.getElementById('header')!.innerHTML = header;
  document.getElementById('contact')!.innerHTML = footer;
}

loadLayout();
initCart();

export function initCart() {
  // Create
  const main = document.querySelector('main')!;
  const container = newElement('div', '', main, ['cart']);

  newElement('h1', 'Cart', container, ['typography-heading-1']);
  const list = newElement('div', '', container, ['list-items']);
  const total = newElement('div', '', container, ['total']);
  const buttons = newElement('div', '', container, ['buttons']);
  const loginBtn = newElement('button', 'login', buttons, ['typography-action-link-button']);
  loginBtn.addEventListener('click', loadLoginForm);
  const registerBtn = newElement('button', 'Registration', buttons, [
    'typography-action-link-button',
  ]);
  registerBtn.addEventListener('click', loadRegisterForm);

  const cartItems: CardItem[] = getItems(CurrentUser.instance?.userData?.user.login) as CardItem[];
  const cartItem: HTMLElement[] = [];
  if (list && cartItems) {
    cartItems.forEach((item: CardItem, index) => {
      cartItem[index] = newElement('div', '', list, ['cart-item'], { id: index.toString() });
      newElement('img', '', cartItem[index], ['cart-item-img'], {
        src: `./assets/img/menu/${imageMap[item.name as keyof typeof imageMap] || 'coffee.png'}`,
      });
    });

    const totalPrice = newElement('div', '', total, ['typography-heading-2']);
    totalPrice.textContent = `Total: `;
    const address = newElement('div', '', total, ['typography-body-medium']);
    address.textContent = 'Address: 123 Main St, Anytown, USA';
    const payBy = newElement('div', '', total, ['typography-body-medium']);
    payBy.textContent = 'Pay by: Cash on Delivery';
  }
}

function getItems(login: string | null | undefined): [] | undefined {
  if (!login) {
    login = localStorage.getItem('CoffeeHouseLogin');
  }
  if (!login) {
    return [];
  }
  const cartItems = localStorage.getItem('CoffeeHouseCartItems-' + login);
  if (cartItems) {
    return JSON.parse(cartItems);
  }
}

function loadLoginForm() {
  window.location.href = '/login.html';
}

function loadRegisterForm() {
  {
    window.location.href = '/registration.html';
  }
}
