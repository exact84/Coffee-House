import { CardItem } from './types';
import { imageMap } from '../consts';

let filteredItems: CardItem[] = [];
let items: CardItem[] = [];
let visibleCount = 4;
// let isDesktop = window.innerWidth > 768;
let isButton = false;

let resizeTimeout: number;
const debounceTimeout = 230;

const grid = document.getElementById('grid');

const buttonContainer = document.createElement('div');
buttonContainer.classList.add('load-more-container');
const loadMoreBtn = document.createElement('button');
loadMoreBtn.classList.add('load-more-btn', 'button-more');
const buttonIcon = document.createElement('img');
buttonIcon.src = 'assets/img/refresh.svg';
buttonIcon.alt = 'arrow';
loadMoreBtn.appendChild(buttonIcon);
buttonContainer.appendChild(loadMoreBtn);

export function getTabData(category = 'coffee') {
  fetch('./assets/products.json')
    .then((response) => response.json())
    .then((data) => {
      items = data;
      filterData(category);
    })
    .catch((err) => console.error('Error loading JSON:', err));
}

function filterData(category: string) {
  // console.log("filterData", category, items);
  filteredItems = items
    .filter((item: CardItem) => item.category === category)
    .map((item: CardItem) => ({
      ...item,
      image: `./assets/img/menu/${imageMap[item.name as keyof typeof imageMap] || 'coffee-1.png'}`,
    }));
  visibleCount = window.innerWidth > 768 ? filteredItems.length : 4;
  renderCards();
}

loadMoreBtn.addEventListener('click', () => {
  visibleCount = filteredItems.length;
  renderCards();
});

document.querySelectorAll('.tab-item').forEach((tab) => {
  tab.addEventListener('click', function (event) {
    const target = event.currentTarget as HTMLElement;
    document.querySelectorAll('.tab-item').forEach((t) => t.classList.remove('tab-item-active'));
    document.querySelectorAll('.tab-icon').forEach((t) => t.classList.remove('tab-icon-active'));

    target.classList.add('tab-item-active');
    target.children[0].classList.add('tab-icon-active');

    if (target.dataset.tab) filterData(target.dataset.tab);
  });
});

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    const nowDesktop = window.innerWidth > 768;

    if (visibleCount > 4 && !nowDesktop) {
      visibleCount = 4;
      renderCards();
    }

    if (isButton && nowDesktop) {
      visibleCount = filteredItems.length;
      renderCards();
    }
  }, debounceTimeout);
});

async function renderCards() {
  // console.log("renderCards", visibleCount, tabType, ". isButton:", isButton);
  if (grid) grid.innerHTML = '';

  const limit = Math.min(visibleCount, filteredItems.length);

  for (let i = 0; i < limit; i++) {
    const item = filteredItems[i];

    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <div class="image"><img src="${item.image}" alt="${item.name}" /></div>
      <div class="description">
        <div class="title">
          <h3 class="typography-heading-3">${item.name}</h3>
          <p class="typography-body-medium">${item.description}</p>
        </div>
        <div class="typography-heading-3 price">$${item.price}</div>
      </div>
    `;
    if (grid) grid.appendChild(card);

    card.addEventListener('click', (event) => {
      modal(item);
      event.stopPropagation(); // надо ли?
    });
  }

  document.querySelector('.load-more-container')?.remove();

  if (filteredItems.length > limit && window.innerWidth <= 768) {
    isButton = true;
    if (grid) grid.after(buttonContainer);
  } else isButton = false;

  // console.log("filteredItems.length > limit. isButton:", isButton);
}

let modalLoaded = false;
let overlay: HTMLElement | null;

function modal(card: CardItem) {
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

function initModal(card: CardItem) {
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
