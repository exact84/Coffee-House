let filteredItems = [];
let items = [];
let visibleCount = 4;
let isDesktop = window.innerWidth > 768;
let isButton = false;

let resizeTimeout;
const debounceTimeout = 230;

const imageMap = {
  "Irish coffee": "coffee-1.png",
  "Kahlua coffee": "coffee-2.png",
  "Honey raf": "coffee-3.png",
  "Ice cappuccino": "coffee-4.png",
  Espresso: "coffee-5.png",
  Latte: "coffee-6.png",
  "Latte macchiato": "coffee-7.png",
  "Coffee with cognac": "coffee-8.png",

  Moroccan: "tea-1.png",
  Ginger: "tea-2.png",
  Cranberry: "tea-3.png",
  "Sea buckthorn": "tea-4.png",

  "Marble cheesecake": "dessert-1.png",
  "Red velvet": "dessert-2.png",
  Cheesecakes: "dessert-3.png",
  "Creme brulee": "dessert-4.png",
  Pancakes: "dessert-5.png",
  "Honey cake": "dessert-6.png",
  "Chocolate cake": "dessert-7.png",
  "Black forest": "dessert-8.png",
};

const grid = document.getElementById("grid");

const buttonContainer = document.createElement("div");
buttonContainer.classList.add("load-more-container");
const loadMoreBtn = document.createElement("button");
loadMoreBtn.classList.add("load-more-btn", "button-more");
const buttonIcon = document.createElement("img");
buttonIcon.src = "assets/img/refresh.svg";
buttonIcon.alt = "arrow";
loadMoreBtn.appendChild(buttonIcon);
buttonContainer.appendChild(loadMoreBtn);

getTabData();

function getTabData(category = "coffee") {
  fetch("./assets/products.json")
    .then((response) => response.json())
    .then((data) => {
      items = data;
      filterData(category);
    })
    .catch((err) => console.error("Error loading JSON:", err));
}

function filterData(category) {
  // console.log("filterData", category, items);
  filteredItems = items
    .filter((item) => item.category === category)
    .map((item) => ({
      ...item,
      image: `./assets/img/menu/${imageMap[item.name] || "coffee-1.png"}`,
    }));
  visibleCount = window.innerWidth > 768 ? filteredItems.length : 4;
  renderCards();
}

loadMoreBtn.addEventListener("click", () => {
  visibleCount = filteredItems.length;
  renderCards();
});

document.querySelectorAll(".tab-item").forEach((tab) => {
  tab.addEventListener("click", function () {
    document
      .querySelectorAll(".tab-item")
      .forEach((t) => t.classList.remove("tab-item-active"));
    document
      .querySelectorAll(".tab-icon")
      .forEach((t) => t.classList.remove("tab-icon-active"));

    this.classList.add("tab-item-active");
    this.children[0].classList.add("tab-icon-active");

    // tabType = this.dataset.tab;
    filterData(this.dataset.tab);
  });
});

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
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
  grid.innerHTML = "";

  const limit = Math.min(visibleCount, filteredItems.length);

  for (let i = 0; i < limit; i++) {
    const item = filteredItems[i];

    const card = document.createElement("div");
    card.classList.add("card");
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
    grid.appendChild(card);

    card.addEventListener("click", (event) => {
      modal(item);
      event.stopPropagation(); // надо ли?
    });
  }

  document.querySelector(".load-more-container")?.remove();

  if (filteredItems.length > limit && window.innerWidth <= 768) {
    isButton = true;
    grid.after(buttonContainer);
  } else isButton = false;

  // console.log("filteredItems.length > limit. isButton:", isButton);
}

let modalLoaded = false;
let overlay, closeBtn;

function modal(card) {
  if (!modalLoaded) {
    fetch("./modal.html")
      .then((res) => res.text())
      .then((html) => {
        document.body.insertAdjacentHTML("beforeend", html);
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

function initModal(card) {
  overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("close-btn");
  const curImg = document.getElementById("cur-img");
  const name = document.getElementById("name");
  const description = document.getElementById("description");
  const sizeTabs = document.getElementById("size-tabs");
  const additivesTabs = document.getElementById("additives-tabs");
  const price = document.getElementById("total-price");

  curImg.innerHTML = "";
  sizeTabs.innerHTML = "";
  additivesTabs.innerHTML = "";
  price.textContent = `$${card.price}`;

  const image = document.createElement("img");
  image.src = card.image;
  image.alt = card.name;
  curImg.appendChild(image);

  name.textContent = card.name;
  description.textContent = card.description;

  Object.keys(card.sizes).forEach((size, index) => {
    const sizeTab = document.createElement("div");
    sizeTab.classList.add("size-tab", "typography-action-link-button");
    if (index === 0) sizeTab.classList.add("size-tab-active");
    sizeTab.id = size;
    sizeTab.innerHTML = `<div class="circle">${size.toUpperCase()}</div>${
      card.sizes[size].size
    }`;
    sizeTab.addEventListener("click", () => {
      sizeTabs
        .querySelector(".size-tab-active")
        .classList.remove("size-tab-active");
      sizeTab.classList.add("size-tab-active");
      const basePrice = parseFloat(card.price);
      const addPrice = parseFloat(card.sizes[size]["add-price"]);
      totalPrice = basePrice + addPrice + additivesTotal;
      price.textContent = `$${totalPrice.toFixed(2)}`;
    });
    sizeTabs.appendChild(sizeTab);
  });

  let additivesTotal = 0;

  Object.keys(card.additives).forEach((add) => {
    const additivesTab = document.createElement("div");
    additivesTab.classList.add("size-tab", "typography-action-link-button");
    additivesTab.id = "add1";
    additivesTab.innerHTML = `<div class="circle">${+add + 1}</div>${
      card.additives[add].name
    }`;
    additivesTab.addEventListener("click", () => {
      const addPrice = parseFloat(card.additives[add]["add-price"]);
      console.log("addPrice", addPrice);
      if (additivesTab.classList.contains("size-tab-active")) {
        additivesTab.classList.remove("size-tab-active");
        additivesTotal -= addPrice;
      } else {
        additivesTab.classList.add("size-tab-active");
        additivesTotal += addPrice;
      }

      const sizeActive = sizeTabs.querySelector(".size-tab-active").id;
      const sizePrice = parseFloat(card.sizes[sizeActive]["add-price"]);
      const totalPrice = parseFloat(card.price) + sizePrice + additivesTotal;
      price.textContent = `$${totalPrice.toFixed(2)}`;
    });
    additivesTabs.appendChild(additivesTab);
  });

  overlay.style.display = "flex";
  document.documentElement.classList.add("no-scroll");

  closeBtn.onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };
}

function closeModal() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "none";
  document.documentElement.classList.remove("no-scroll");
}

