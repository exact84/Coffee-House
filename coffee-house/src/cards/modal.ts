import { imageMap } from '../consts';
import { makeRequestbyID } from '../request';
import { CurrentUser } from '../user';
import { newElement, updateCartCount } from '../utils';
import { CardItem, CartItem, DrinkSizeKey } from './types';

let overlay: HTMLElement | null;

export function modal(id: string) {
  overlay?.remove();

  const html = `
    <div id="overlay" class="overlay">
      <div class="modal-window" id="modal">
        <div class="close-row" id="close-row">
          <button class="close-button" id="close-button">
            <img src="/assets/img/button-close.svg" alt="close" />
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  requestAnimationFrame(() => {
    initModal(id);
  });
}

export function initModal(id: string) {
  overlay = document.getElementById('overlay');
  if (!overlay) return;
  const oldNotification = document.getElementById('notification');
  if (oldNotification) oldNotification.remove();
  const notification = newElement(
    'div',
    '',
    document.body,
    ['notification', 'typography-heading-3'],
    {
      id: 'notification',
    }
  );
  const errorMessage = newElement('div', '', notification, ['typography-body-medium']);
  const modalWindow = document.getElementById('modal');
  overlay.innerHTML = '';
  overlay.style.display = 'flex';
  document.documentElement.classList.add('no-scroll');

  const handleClick = (e: MouseEvent) => {
    const closeRow = document.getElementById('close-row');
    if (e.target === overlay) closeModal();
    if (closeRow && closeRow.contains(e.target as Node)) closeModal();
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
  };

  overlay.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKey);

  const loading = document.createElement('h3');
  loading.classList.add('loading');
  loading.textContent = 'Loading...';
  overlay?.appendChild(loading);
  let card: CardItem = {} as CardItem;
  let cartItemId = 0;

  makeRequestbyID<CardItem>('/products', id)
    .then((response) => {
      response.data.image = `./assets/img/menu/${imageMap[response.data.name as keyof typeof imageMap] || 'coffee.png'}`;
      card = response.data;
      overlay?.removeChild(loading);
      if (modalWindow) overlay?.appendChild(modalWindow);
      else return;

      const modalDiv = newElement('div', '', modalWindow, ['modal-div'], { id: 'modal-div' });
      const curImg = newElement('div', '', modalDiv, ['gifts-img'], { id: 'cur-img' });
      newElement('img', '', curImg, [], {
        src: card.image || '/assets/img/menu/coffee.png',
        alt: card.name,
      });
      const modalDescription = newElement('div', '', modalDiv, ['modal-description'], {
        id: 'modal-description',
      });

      // Title
      const titleDiv = newElement('div', '', modalDescription, ['title']);
      newElement('h3', card.name, titleDiv, ['typography-heading-3'], { id: 'name' });
      newElement('p', card.description, titleDiv, ['typography-body-medium'], {
        id: 'description',
      });

      // Size
      const sizeDiv = newElement('div', '', modalDescription, ['size']);
      newElement('p', 'Size', sizeDiv, ['typography-body-medium']);
      const sizeTabs = newElement('div', '', sizeDiv, ['size-tabs'], { id: 'size-tabs' });

      // Additives
      const additivesDiv = newElement('div', '', modalDescription, ['additives']);
      newElement('p', 'Additives', additivesDiv, ['typography-body-medium']);
      const additivesTabs = newElement('div', '', additivesDiv, ['additives-tabs'], {
        id: 'additives-tabs',
      });

      // Price
      const price = newElement('div', '', modalDescription, [
        'typography-heading-3',
        'total-price',
      ]);
      newElement('div', 'Total: ', price, ['typography-heading-3']);
      const totalPriceDiv = newElement('div', '', price, ['typography-heading-3', 'prices']);
      const priceDiv = newElement('div', '', totalPriceDiv, ['typography-heading-3', 'price']);
      const discontedPriceDiv = newElement('div', '', totalPriceDiv, [
        'typography-heading-3',
        'price',
      ]);
      if (CurrentUser.instance?.userData?.user.id != -1) {
        discontedPriceDiv.textContent = '$' + card.discountPrice;
      }

      Object.values(DrinkSizeKey).forEach((size, index) => {
        if (!sizeTabs || !card.sizes[size]) return;
        const sizeTab = newElement(
          'div',
          '',
          sizeTabs,
          ['size-tab', 'typography-action-link-button'],
          { id: size }
        );
        if (index === 0) sizeTab.classList.add('size-tab-active');
        const sizeInfo = card.sizes[size as keyof typeof card.sizes];

        let hintPrice = '';
        if (CurrentUser.instance?.userData?.user.id == -1) {
          hintPrice = `
          <span>$${sizeInfo.price}</span>
        `;
        } else if (sizeInfo.discountPrice) {
          hintPrice = `
          <span class="striked-price">$${sizeInfo.price}</span>
          <span>$${sizeInfo.discountPrice}</span>
        `;
        } else {
          hintPrice = `
          <span>$${sizeInfo.price}</span>
        `;
        }

        newElement('div', size.toUpperCase(), sizeTab, ['circle']);
        newElement('div', sizeInfo.size, sizeTab, ['size']);
        const toolTip = newElement('div', '', sizeTab, ['tool-tip']);
        toolTip.innerHTML = hintPrice;

        sizeTab.addEventListener('click', () => {
          if (sizeTabs)
            sizeTabs.querySelector('.size-tab-active')?.classList.remove('size-tab-active');
          sizeTab.classList.add('size-tab-active');
          const basePrice = parseFloat(sizeInfo.price);
          const totalPrice = basePrice + additivesTotal;

          priceDiv.textContent = '$' + totalPrice;
          priceDiv.classList.remove('striked-price');
          discontedPriceDiv.textContent = '';
          if (sizeInfo.discountPrice) {
            discontedPriceDiv.textContent = '$' + sizeInfo.discountPrice;
            priceDiv.classList.add('striked-price');
          }

          calcPrice();
        });
      });

      let additivesTotal = 0;
      let additivesDiscount = 0;
      const additives = new Set<string>();

      Object.keys(card.additives).forEach((add: string) => {
        const addIndex = Number(add);
        const additive = card.additives[addIndex];
        const key = additive.name;

        const additivesTab = document.createElement('div');
        additivesTab.classList.add('size-tab', 'typography-action-link-button');
        additivesTab.id = (addIndex + 1).toString();

        let hintPrice = '';
        if (CurrentUser.instance?.userData?.user.id == -1) {
          hintPrice = `<span>$${additive.price}</span>`;
        } else if (additive.discountPrice) {
          hintPrice = `
            <span class="striked-price">$${additive.price}</span>
            <span>$${additive.discountPrice}</span>
          `;
        } else {
          hintPrice = `<span>$${additive.price}</span>`;
        }

        additivesTab.innerHTML = `
          <div class="circle">${addIndex + 1}</div>
          <div class="add-name">${additive.name}</div>
        `;

        const toolTip = newElement('div', '', additivesTab, ['tool-tip']);
        toolTip.innerHTML = hintPrice;
        additivesTab.addEventListener('click', () => {
          const addPrice = parseFloat(additive.price);
          const addDiscPrice = parseFloat(additive.discountPrice || additive.price);
          if (additivesTab.classList.contains('size-tab-active')) {
            additivesTab.classList.remove('size-tab-active');
            additivesTotal -= addPrice;
            additivesDiscount -= addDiscPrice;
            additives.delete(key);
          } else {
            additivesTab.classList.add('size-tab-active');
            additivesTotal += addPrice;
            additivesDiscount += addDiscPrice;
            additives.add(key);
          }
          calcPrice();
        });
        if (additivesTabs) additivesTabs.appendChild(additivesTab);
      });

      function calcPrice() {
        const sizeActive: string = sizeTabs.querySelector('.size-tab-active')?.id || '';
        const sizePrice = parseFloat(card.sizes[sizeActive as keyof typeof card.sizes].price);
        const discSizePrice = parseFloat(
          card.sizes[sizeActive as keyof typeof card.sizes].discountPrice ||
            card.sizes[sizeActive as keyof typeof card.sizes].price
        );

        const totalPrice = sizePrice + additivesTotal;
        let totalDiscPrice = discSizePrice + additivesDiscount;

        if (CurrentUser.instance?.userData?.user.id == -1) {
          totalDiscPrice = totalPrice;
        }
        if (totalPrice !== totalDiscPrice) priceDiv.textContent = `$${totalPrice.toFixed(2)}`;
        else priceDiv.textContent = '';
        priceDiv.classList.add('striked-price');
        discontedPriceDiv.textContent = `$${totalDiscPrice.toFixed(2)}`;
      }
      calcPrice();

      const closeBtn = newElement(
        'button',
        'Add to Cart',
        modalDescription,
        ['close-btn', 'typography-action-link-button'],
        { id: 'close-btn' }
      );
      closeBtn.addEventListener('click', closeModal);

      function closeModal() {
        document.documentElement.classList.remove('no-scroll');
        document.removeEventListener('keydown', handleKey);
        const overlay = document.getElementById('overlay');
        if (!overlay) return;
        overlay.style.display = 'none';
        overlay.removeEventListener('click', handleClick);

        const cartItem: CartItem = {
          id: (cartItemId += 1),
          productId: Number(id),
          name: card.name,
          description: card.description,
          price: priceDiv.textContent.slice(1),
          discountPrice: '',
          category: card.category,
          image: card.image,
          size:
            sizeTabs?.querySelector('.size-tab-active .size')?.textContent.replace(/\s+/g, '') ||
            '',
          additives: Array.from(additives),
          quantity: 1,
          totalPrice: '',
        };

        if (CurrentUser.instance?.userData?.user.id != -1) {
          cartItem.discountPrice = discontedPriceDiv.textContent.slice(1);
          cartItem.totalPrice = cartItem.discountPrice;
        } else {
          cartItem.price = discontedPriceDiv.textContent.slice(1);
          cartItem.totalPrice = cartItem.price;
        }
        CurrentUser.addToCart(cartItem);
        updateCartCount();

        document.getElementById('cart-menu')!.style.display = 'flex';
        document.getElementById('cart-menu-vertical')!.style.display = 'flex';
      }
    })
    .catch((error) => {
      showNotification('Something went wrong. Please, try again.', error.message || error.error);
      closeModal();
    });

  function showNotification(message: string, error: string = '') {
    notification.textContent = message;
    errorMessage.textContent = error;
    document.body.prepend(notification);
    notification.appendChild(errorMessage);
  }

  function closeModal() {
    document.documentElement.classList.remove('no-scroll');
    document.removeEventListener('keydown', handleKey);
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    overlay.removeEventListener('click', handleClick);
  }
}
