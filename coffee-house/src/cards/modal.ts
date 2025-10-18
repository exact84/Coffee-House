import { CardItem } from './types';

let modalLoaded = false;
let overlay: HTMLElement | null;

export function modal(card: CardItem) {
  if (!modalLoaded) {
    fetch('./modal.html')
      .then((res) => res.text())
      .then((html) => {
        document.body.insertAdjacentHTML('beforeend', html);
        modalLoaded = true;

        requestAnimationFrame(() => {
          initModal(card);
        });
      })
      .catch((error) => console.log(error));
  } else {
    initModal(card);
  }
}

export function initModal(card: CardItem) {
  overlay = document.getElementById('overlay');
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
    sizeTab.innerHTML = `<div class="circle">${size.toUpperCase()}</div>${
      card.sizes[size as keyof typeof card.sizes].size
    }`;
    sizeTab.addEventListener('click', () => {
      if (sizeTabs) sizeTabs.querySelector('.size-tab-active')?.classList.remove('size-tab-active');
      sizeTab.classList.add('size-tab-active');
      const basePrice = parseFloat(card.price);
      const addPrice = parseFloat(card.sizes[size as keyof typeof card.sizes]['add-price']);
      const totalPrice = basePrice + addPrice + additivesTotal;
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
    additivesTab.innerHTML = `<div class="circle">${+add + 1}</div>${
      card.additives[addIndex]['name']
    }`;
    additivesTab.addEventListener('click', () => {
      const addPrice = parseFloat(card.additives[addIndex]['add-price']);
      // console.log('addPrice', addPrice);
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
        sizePrice = parseFloat(card.sizes[sizeActive as keyof typeof card.sizes]['add-price']);
      }
      const totalPrice = parseFloat(card.price) + sizePrice + additivesTotal;
      if (price) price.textContent = `$${totalPrice.toFixed(2)}`;
    });
    if (additivesTabs) additivesTabs.appendChild(additivesTab);
  });

  if (overlay) overlay.style.display = 'flex';
  document.documentElement.classList.add('no-scroll');

  if (closeBtn) closeBtn.onclick = closeModal;
  if (overlay)
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
}

function closeModal() {
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.style.display = 'none';
  document.documentElement.classList.remove('no-scroll');
}
