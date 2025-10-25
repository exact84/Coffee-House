import { CartItem } from './cards/types';
import { imageMap } from './consts';
import { CurrentUser } from './user';
import { loadLayout, newElement, updateCartCount } from './utils';

await CurrentUser.restoreInstance();
await loadLayout();
initCart();

export function initCart() {
  const currentUser = CurrentUser.instance?.userData?.user;
  // Create
  const main = document.querySelector('main')!;
  const container = newElement('div', '', main, ['cart-container']);

  newElement('h1', 'Cart', container, ['typography-heading-2', 'title-cart']);
  const list = newElement('div', '', container, ['list-items']);

  console.log('Запрос товаров: ', CurrentUser.instance?.userData?.user);
  const cartItems: CartItem[] = getItems(currentUser?.login) as CartItem[];
  const cartItem: HTMLElement[] = [];
  if (list && cartItems) {
    cartItems.forEach((item: CartItem, index) => {
      cartItem[index] = newElement('div', '', list, ['list-item'], { id: index.toString() });

      const deleteBtn = newElement('button', '', cartItem[index], []);
      newElement('img', '', deleteBtn, ['icon'], {
        src: './assets/img/trash.svg',
        alt: 'delete icon',
      });
      deleteBtn.addEventListener('click', () => {
        cartItem[index].remove();
        totalPrice.textContent = calcTotaPrice();
        console.log('Удаляем Номер:  ', index);
        cartItems.splice(index, 1);
        console.log('Корзина после удаления: ', cartItems);
        CurrentUser.instance!.countCart = cartItems.length;
        localStorage.setItem(
          'CoffeeHouseCartItems-' + currentUser?.login,
          JSON.stringify(cartItems)
        );
        updateCartCount();
      });

      newElement('img', '', cartItem[index], ['list-item-img'], {
        src: `./assets/img/menu/${imageMap[item.name as keyof typeof imageMap] || 'coffee.png'}`,
        alt: item.name,
      });

      const itemInfo = newElement('div', '', cartItem[index], ['item-info']);
      newElement('div', item.name, itemInfo, ['typography-heading-3', 'title']);

      // console.log(item.additives);
      let additiveNames = '';
      if (item.additives) {
        additiveNames = item.additives.map((add) => add).join(', ');
      }
      newElement('div', item.size + (additiveNames ? ', ' + additiveNames : ''), itemInfo, [
        'typography-body-medium',
      ]);

      newElement('div', item.price, cartItem[index], ['typography-heading-3', 'price']);
      newElement('div', item.discountPrice, cartItem[index], [
        'typography-heading-3',
        'disc-price',
      ]);
    });
  }

  const total = newElement('div', '', container, ['total', 'typography-heading-3']);

  const totalPriceDiv = newElement('div', '', total, ['total-line']);
  newElement('div', 'Total:', totalPriceDiv, ['max-width']);
  const totalPrice = newElement('div', '', totalPriceDiv, ['price']);
  const discPrice = newElement('div', '', totalPriceDiv, ['disc-price']);
  totalPrice.textContent = calcTotaPrice();

  const AddressDiv = newElement('div', '', total, ['total-line']);
  newElement('div', 'Address:', AddressDiv, []);
  newElement(
    'div',
    currentUser?.city + ', ' + currentUser?.street + ', ' + currentUser?.houseNumber ||
      'No address',
    AddressDiv,
    []
  );

  const payBy = newElement('div', '', total, ['total-line']);
  newElement('div', 'Pay by:', payBy, []);
  newElement('div', currentUser?.paymentMethod || 'No payment method', payBy, []);

  const buttons = newElement('div', '', container, ['buttons']);
  if (!currentUser) {
    const loginBtn = newElement('button', 'login', buttons, [
      'typography-action-link-button',
      'button',
    ]);
    loginBtn.addEventListener('click', loadLoginForm);
    const registerBtn = newElement('button', 'Registration', buttons, [
      'typography-action-link-button',
      'button',
    ]);
    registerBtn.addEventListener('click', loadRegisterForm);
  } else if (cartItems.length > 0) {
    const orderBtn = newElement('button', 'Confirm', buttons, [
      'typography-action-link-button',
      'button',
    ]);
    orderBtn.addEventListener('click', () => {
      console.log('Заказать');
    });
  }

  function calcTotaPrice() {
    if (!cartItems) {
      return '$0.00';
    } else {
      discPrice.textContent = cartItems
        .reduce((acc, item) => acc + Number(item.discountPrice), 0)
        .toFixed(2);
      console.log('итоговая корзина: ', cartItems);
      console.log(
        'пересчитываем итогову цену: ',
        cartItems.reduce((acc, item) => acc + Number(item.price), 0).toFixed(2)
      );
      return '$' + cartItems.reduce((acc, item) => acc + Number(item.price), 0).toFixed(2);
    }
  }
}

function getItems(login: string | null | undefined): [] | undefined {
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
