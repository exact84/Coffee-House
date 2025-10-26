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

  // console.log('Запрос товаров: ', CurrentUser.instance?.userData?.user);
  const cartItems: CartItem[] = getItems(currentUser?.login) as CartItem[];
  if (cartItems) {
    const list = newElement('div', '', container, ['list-items']);
    cartItems.forEach((item: CartItem, index) => {
      const itemElement = newElement('div', '', list, ['list-item']);

      const deleteBtn = newElement('button', '', itemElement, []);
      newElement('img', '', deleteBtn, ['icon'], {
        src: './assets/img/trash.svg',
        alt: 'delete icon',
      });
      deleteBtn.addEventListener('click', () => {
        const currentIndex = cartItems.indexOf(item);

        if (currentIndex !== -1) {
          itemElement.remove();
          console.log('Удаляем Номер:  ', index);
          cartItems.splice(currentIndex, 1);
          totalPrice.textContent = calcTotalPrice();
          console.log(totalPrice.textContent, discPrice.textContent);
          if (
            totalPrice.textContent === discPrice.textContent &&
            discPrice.textContent !== '$0.00'
          ) {
            totalPrice.textContent = '';
          }
          if (cartItems.length === 0) {
            totalPrice.style.display = 'flex';
            totalPrice.textContent = '$0.00';
          }
          CurrentUser.instance!.countCart = cartItems.length;
          localStorage.setItem(
            'CoffeeHouseCartItems-' + currentUser?.login,
            JSON.stringify(cartItems)
          );
          updateCartCount();
        }
      });

      newElement('img', '', itemElement, ['list-item-img'], {
        src: `./assets/img/menu/${imageMap[item.name as keyof typeof imageMap] || 'coffee.png'}`,
        alt: item.name,
      });

      const itemInfo = newElement('div', '', itemElement, ['item-info']);
      newElement('div', item.name, itemInfo, ['typography-heading-3', 'title']);

      let additiveNames = '';
      if (item.additives) {
        additiveNames = item.additives.map((add) => add).join(', ');
      }
      newElement('div', item.size + (additiveNames ? ', ' + additiveNames : ''), itemInfo, [
        'typography-body-medium',
      ]);

      const itemPrice = newElement('div', item.price ? '$' + item.price : '', itemElement, [
        'typography-heading-3',
      ]);
      if (currentUser?.id != -1) {
        itemPrice.classList.add('price');
        newElement('div', '$' + item.discountPrice, itemElement, [
          'typography-heading-3',
          'disc-price',
        ]);
      }
    });
  }

  const total = newElement('div', '', container, ['total', 'typography-heading-3']);
  const totalPriceDiv = newElement('div', '', total, ['total-line']);
  newElement('div', 'Total:', totalPriceDiv, ['max-width']);
  const totalPrice = newElement('div', '', totalPriceDiv, ['price']);
  const discPrice = newElement('div', '', totalPriceDiv, ['disc-price']);
  totalPrice.textContent = calcTotalPrice();

  if (CurrentUser.instance?.userData?.user.id !== -1) {
    console.log(CurrentUser.instance?.userData?.user.id);
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
  } else {
    // discPrice.textContent = '';
    // totalPrice.classList.remove('price');
    console.log('убрали скидку');
  }

  if ((currentUser?.id !== -1 && cartItems?.length == 0) || !cartItems) return;
  console.log(currentUser, cartItems?.length);
  const buttons = newElement('div', '', container, ['buttons']);
  if (currentUser?.id == -1) {
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
  } else if (cartItems?.length > 0) {
    const orderBtn = newElement('button', 'Confirm', buttons, [
      'typography-action-link-button',
      'button',
    ]);
    orderBtn.addEventListener('click', () => {
      console.log('Заказать');
    });
  }

  function calcTotalPrice() {
    if (!cartItems) {
      discPrice.style.display = 'none';
      totalPrice.classList.remove('price');
      return '$0.00';
    }
    if (cartItems.length === 0) {
      discPrice.style.display = 'none';
      totalPrice.classList.remove('price');
      return '$0.00';
    }
    const regularPrice = cartItems
      .reduce((acc, item) => acc + Number(item.price || item.discountPrice), 0)
      .toFixed(2);
    const discountPrice = cartItems
      .reduce((acc, item) => acc + Number(item.discountPrice || item.price), 0)
      .toFixed(2);

    console.log('итоговая корзина: ', cartItems);
    console.log('обычная цена: ', regularPrice);
    console.log('скидочная цена: ', discountPrice);

    totalPrice.textContent = '$' + regularPrice;
    discPrice.textContent = '$' + discountPrice;
    if ((regularPrice === '0.00' || discountPrice === regularPrice) && cartItems.length > 0) {
      totalPrice.style.display = 'none';
      // discPrice.classList.remove('price');
      // discPrice.style.display = 'flex';
      discPrice.textContent = '$' + regularPrice;
      console.log('новая Цена со скидкой: ', discPrice.textContent);
      return '$0.00';
    }
    return '$' + regularPrice;
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
    window.location.href = '/register.html';
  }
}
