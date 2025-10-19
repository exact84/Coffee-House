import { imageMap } from '../consts';
import { makeRequestbyID } from '../request';
import { CardItem } from './types';

let modalLoaded = false;
let overlay: HTMLElement | null;

export function modal(id: string) {
  if (!modalLoaded) {
    fetch('./modal.html')
      .then((res) => res.text())
      .then((html) => {
        overlay?.remove();
        document.body.insertAdjacentHTML('beforeend', html);
        modalLoaded = true;

        requestAnimationFrame(() => {
          initModal(id);
        });
      })
      .catch((error) => console.log(error));
  } else {
    initModal(id);
  }
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

  makeRequestbyID<CardItem>('/products', id)
    .then((response) => {
      response.data.image = `./assets/img/menu/${imageMap[response.data.name as keyof typeof imageMap] || 'coffee.png'}`;
      card = response.data;
      // console.log(card);
      overlay?.removeChild(loading);
      if (modalWindow) overlay?.appendChild(modalWindow);

      const closeBtn = document.getElementById('close-btn');
      const curImg = document.getElementById('cur-img');
      const name = document.getElementById('name');
      const description = document.getElementById('description');
      const sizeTabs = document.getElementById('size-tabs');
      const additivesTabs = document.getElementById('additives-tabs');
      const price = document.getElementById('total-price');

      if (curImg) curImg.innerHTML = '';
      if (sizeTabs) sizeTabs.innerHTML = '';
      if (additivesTabs) additivesTabs.innerHTML = '';
      if (price) price.textContent = `$${card.price}`;

      const image = document.createElement('img');
      if (card.image) image.src = card.image;
      image.alt = card.name;
      if (curImg) curImg.appendChild(image);

      if (name) name.textContent = card.name;
      if (description) description.textContent = card.description;

      Object.keys(card.sizes).forEach((size, index) => {
        const sizeTab = document.createElement('div');
        sizeTab.classList.add('size-tab', 'typography-action-link-button');
        if (index === 0) sizeTab.classList.add('size-tab-active');
        sizeTab.id = size;
        sizeTab.setAttribute('title', '$' + card.sizes[size as keyof typeof card.sizes]['price']);
        sizeTab.innerHTML = `<div class="circle">${size.toUpperCase()}</div>${
          card.sizes[size as keyof typeof card.sizes].size
        }`;
        sizeTab.addEventListener('click', () => {
          if (sizeTabs)
            sizeTabs.querySelector('.size-tab-active')?.classList.remove('size-tab-active');
          sizeTab.classList.add('size-tab-active');
          const basePrice = parseFloat(card.sizes[size as keyof typeof card.sizes]['price']);
          const totalPrice = basePrice + additivesTotal;
          if (price) price.textContent = `$${totalPrice.toFixed(2)}`;
        });
        if (sizeTabs) sizeTabs.appendChild(sizeTab);
      });

      let additivesTotal = 0;

      Object.keys(card.additives).forEach((add: string) => {
        const addIndex = Number(add);
        const additivesTab = document.createElement('div');
        additivesTab.classList.add('size-tab', 'typography-action-link-button');
        additivesTab.id = 'add1';
        additivesTab.setAttribute('title', '$' + card.additives[addIndex]['price']);
        additivesTab.innerHTML = `<div class="circle">${+add + 1}</div>${
          card.additives[addIndex]['name']
        }`;
        additivesTab.addEventListener('click', () => {
          const addPrice = parseFloat(card.additives[addIndex]['price']);
          if (additivesTab.classList.contains('size-tab-active')) {
            additivesTab.classList.remove('size-tab-active');
            additivesTotal -= addPrice;
          } else {
            additivesTab.classList.add('size-tab-active');
            additivesTotal += addPrice;
          }

          const sizeActive: string | undefined = sizeTabs?.querySelector('.size-tab-active')?.id;
          let sizePrice = 0;
          if (sizeActive) {
            sizePrice = parseFloat(card.sizes[sizeActive as keyof typeof card.sizes]['price']);
          }
          const totalPrice = sizePrice + additivesTotal;
          if (price) price.textContent = `$${totalPrice.toFixed(2)}`;
        });
        if (additivesTabs) additivesTabs.appendChild(additivesTab);
      });

      if (closeBtn) closeBtn.addEventListener('click', closeModal);
    })
    .catch(() => {
      modalLoaded = false;
      loading.textContent = 'Something went wrong.\n Please, try again.';
    });

  function closeModal() {
    document.documentElement.classList.remove('no-scroll');
    document.removeEventListener('keydown', handleKey);
    // closeBtn.removeEventListener('click', closeModal);
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    overlay.removeEventListener('click', handleClick);
  }
}
