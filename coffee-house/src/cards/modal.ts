import { imageMap } from '../consts';
import { makeRequestbyID } from '../request';
import { CurrentUser } from '../user';
import { newElement, updateCartCount } from '../utils';
import { CardItem, CartItem } from './types';

let overlay: HTMLElement | null;

export function modal(id: string) {
  // fetch('./src/modal.html')
  //   .then((res) => res.text())
  //   .then((html) => {
  //     overlay?.remove();
  //     document.body.insertAdjacentHTML('beforeend', html);

  //     requestAnimationFrame(() => {
  //       initModal(id);
  //     });
  //   })
  //   .catch((error) => console.log(error));
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
      console.log(card);
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

      // Заголовок
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
      // if (card.discountPrice) {
      //   priceDiv.classList.add('striked-price');
      // }

      Object.keys(card.sizes).forEach((size, index) => {
        if (!sizeTabs) return;
        const sizeTab = newElement(
          'div',
          '',
          sizeTabs,
          ['size-tab', 'typography-action-link-button'],
          { id: size }
        );
        if (index === 0) sizeTab.classList.add('size-tab-active');
        sizeTab.setAttribute('title', '$' + card.sizes[size as keyof typeof card.sizes]['price']);
        newElement('div', size.toUpperCase(), sizeTab, ['circle']);
        newElement('div', card.sizes[size as keyof typeof card.sizes].size, sizeTab, ['size']);
        sizeTab.addEventListener('click', () => {
          if (sizeTabs)
            sizeTabs.querySelector('.size-tab-active')?.classList.remove('size-tab-active');
          sizeTab.classList.add('size-tab-active');
          const basePrice = parseFloat(card.sizes[size as keyof typeof card.sizes]['price']);
          const totalPrice = basePrice + additivesTotal;
          priceDiv.textContent = '$' + totalPrice;
          const discPrice = card.sizes[size as keyof typeof card.sizes].discountPrice;
          console.log(discPrice);
          priceDiv.classList.remove('striked-price');
          discontedPriceDiv.textContent = '';
          if (card.sizes[size as keyof typeof card.sizes].discountPrice) {
            discontedPriceDiv.textContent =
              '$' + card.sizes[size as keyof typeof card.sizes].discountPrice;
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
        additivesTab.id = 'add1';
        additivesTab.setAttribute('title', '$' + additive.price);
        additivesTab.innerHTML = `<div class="circle">${addIndex + 1}</div>${additive.name}`;
        additivesTab.addEventListener('click', () => {
          const addPrice = parseFloat(additive.price);
          const addDiscPrice = parseFloat(additive.discountPrice || additive.price);
          console.log('Add Price: ', addPrice, addDiscPrice);
          if (additivesTab.classList.contains('size-tab-active')) {
            additivesTab.classList.remove('size-tab-active');
            additivesTotal -= addPrice;
            additivesDiscount -= addDiscPrice;
            additives.delete(key);
            console.log(additives);
          } else {
            additivesTab.classList.add('size-tab-active');
            additivesTotal += addPrice;
            additivesDiscount += addDiscPrice;
            additives.add(key);
            // console.log(additives);
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
        console.log('Size Price: ', sizePrice, discSizePrice);

        const totalPrice = sizePrice + additivesTotal;
        let totalDiscPrice = discSizePrice + additivesDiscount;

        if (CurrentUser.instance?.userData?.user.id == -1) {
          totalDiscPrice = totalPrice; /////////////////////////////
        }
        console.log('Total Price: ', totalPrice, totalDiscPrice);
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
        console.log('Добавили в Корзину: ', cartItem);
        CurrentUser.addToCart(cartItem);
        updateCartCount();
      }
    })
    .catch(() => {
      loading.textContent = 'Something went wrong.\n Please, try again.';
    });

  function closeModal() {
    document.documentElement.classList.remove('no-scroll');
    document.removeEventListener('keydown', handleKey);
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    overlay.removeEventListener('click', handleClick);
  }
}
