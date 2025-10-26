import { initBurgerMenu } from './burger-menu';
import { CartItem } from './cards/types';
import { imageMap } from './consts';
import { postOrder } from './request';
import { CurrentUser } from './user';
import { loadLayout, newElement, transformToOrderData, updateCartCount } from './utils';

await CurrentUser.restoreInstance();
await loadLayout();
initBurgerMenu();
initCart();

export function initCart() {
  const overlay = document.querySelector('.loader-overlay') as HTMLElement;
  const notification = newElement('div', '', document.body, [
    'notification',
    'typography-heading-3',
  ]);
  const errorMessage = newElement('div', '', notification, ['typography-body-medium']);
  const currentUser = CurrentUser.instance?.userData?.user;
  const main = document.querySelector('main')!;
  const container = newElement('div', '', main, ['cart-container']);
  newElement('h1', 'Cart', container, ['typography-heading-2', 'title-cart']);

  const cartItems: CartItem[] = getItems(currentUser?.login) as CartItem[];
  let list: HTMLElement;
  if (cartItems) {
    list = newElement('div', '', container, ['list-items']);
    cartItems.forEach((item: CartItem) => {
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
          cartItems.splice(currentIndex, 1);
          totalPrice.textContent = calcTotalPrice();
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
    const AddressDiv = newElement('div', '', total, ['total-line']);
    newElement('div', 'Address:', AddressDiv, []);
    newElement(
      'div',
      currentUser?.city + ', ' + currentUser?.street + ', ' + currentUser?.houseNumber ||
        'No address',
      AddressDiv,
      []
    );
    const payBy = currentUser?.paymentMethod
      ? currentUser?.paymentMethod?.charAt(0).toUpperCase() + currentUser?.paymentMethod?.slice(1)
      : '';
    const payByDiv = newElement('div', '', total, ['total-line']);
    newElement('div', 'Pay by:', payByDiv, []);
    newElement('div', payBy || 'No payment method', payByDiv, []);
  }

  if (currentUser?.id != -1 && (cartItems?.length == 0 || !cartItems)) return;
  const buttons = newElement('div', '', container, ['buttons']);
  if (currentUser?.id == -1) {
    const loginBtn = newElement('button', 'Sign In', buttons, [
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
      overlay.classList.remove('show');
      showLoaderOverlay();
      postOrder(transformToOrderData(cartItems))
        .then(() => {
          cartItems.length = 0;
          list.remove();
          totalPrice.textContent = '';
          discPrice.textContent = '$0.00';
          CurrentUser.instance!.countCart = 0;
          localStorage.setItem(
            'CoffeeHouseCartItems-' + currentUser?.login,
            JSON.stringify(cartItems)
          );
          updateCartCount();
          buttons.remove();
          showNotification('Thank you for your order! Our manager will contact you shortly.');
        })
        .catch((error) => {
          showNotification('Something went wrong. Please, try again.', error.message);
        })
        .finally(() => {
          hideLoaderOverlay();
        });
    });
  }

  function showLoaderOverlay() {
    overlay.classList.add('show');
  }

  function hideLoaderOverlay() {
    overlay.classList.remove('show');
  }

  function showNotification(message: string, error: string = '') {
    notification.textContent = message;
    errorMessage.textContent = error;
    document.body.prepend(notification);
    notification.appendChild(errorMessage);
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

    totalPrice.textContent = '$' + regularPrice;
    discPrice.textContent = '$' + discountPrice;
    if ((regularPrice === '0.00' || discountPrice === regularPrice) && cartItems.length > 0) {
      totalPrice.style.display = 'none';
      discPrice.textContent = '$' + regularPrice;
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
