import { CardItem } from './types';
import { imageMap } from '../consts';
import { modal } from './modal';
import { makeRequest, makeRequestbyID } from '../request';
import { Products } from '../responseTypes';

let filteredItems: Products[] = [];
let items: Products[] = [];
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
  makeRequest<Products>('/products')
    .then((response) => {
      items = response.data;
      filterData(category);
      if (grid) {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(310px, 1fr))';
      }
    })
    .catch(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.textContent = 'Something went wrong. Please, refresh the page.';
    });
}

function filterData(category: string) {
  // console.log("filterData", category, items);
  filteredItems = items
    .filter((item: Products) => item.category === category)
    .map((item: Products) => ({
      ...item,
      image: `./assets/img/menu/${imageMap[item.name as keyof typeof imageMap] || 'coffee.png'}`,
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
    card.id = item.id.toString();
    card.classList.add('card');

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('image');
    const img = document.createElement('img');
    img.src = item.image || 'placeholder.png'; // Проверить
    img.alt = item.name;
    imageWrapper.appendChild(img);

    // description
    const description = document.createElement('div');
    description.classList.add('description');

    // title
    const titleBlock = document.createElement('div');
    titleBlock.classList.add('title');

    const title = document.createElement('h3');
    title.classList.add('typography-heading-3');
    title.textContent = item.name;

    const paragraph = document.createElement('p');
    paragraph.classList.add('typography-body-medium');
    paragraph.textContent = item.description;

    titleBlock.appendChild(title);
    titleBlock.appendChild(paragraph);

    // price
    const priceBlock = document.createElement('div');
    priceBlock.classList.add('typography-heading-3', 'price');

    // добавить лоигин
    if (!item.discountPrice) priceBlock.textContent = `$${item.price}`;
    else {
      priceBlock.textContent = `$${item.discountPrice}`;
      const oldPrice = document.createElement('span');
      oldPrice.classList.add('old-price');
      oldPrice.textContent = `$${item.price}`;
      priceBlock.appendChild(oldPrice);
    }

    description.appendChild(titleBlock);
    description.appendChild(priceBlock);

    card.appendChild(imageWrapper);
    card.appendChild(description);
    if (grid) grid.appendChild(card);

    card.addEventListener('click', (event) => {
      event.stopPropagation(); // надо ли?
      makeRequestbyID<CardItem>('/products', '2').then((response) => {
        const selectedProduct: CardItem = response.data;
        console.log(selectedProduct);
        modal(selectedProduct);
      });
    });
  }

  document.querySelector('.load-more-container')?.remove();

  if (filteredItems.length > limit && window.innerWidth <= 768) {
    isButton = true;
    if (grid) grid.after(buttonContainer);
  } else isButton = false;
}
