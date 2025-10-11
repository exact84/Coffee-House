let tabType = "coffee";
let filteredItems = [];
let visibleCount = 4;
let isDesktop = window.innerWidth > 768;

const grid = document.getElementById("grid");

const buttonContainer = document.createElement("div");
buttonContainer.className = "load-more-container";
const loadMoreBtn = document.createElement("button");
loadMoreBtn.className = "load-more-btn button-more";
const buttonIcon = document.createElement("img");
buttonIcon.src = "assets/img/refresh.svg";
buttonIcon.alt = "arrow";
loadMoreBtn.appendChild(buttonIcon);
buttonContainer.appendChild(loadMoreBtn);

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

    tabType = this.dataset.tab;
    getTabData();
  });
});

window.addEventListener("resize", () => {
  const nowDesktop = window.innerWidth > 768;

  if (nowDesktop !== isDesktop) {
    isDesktop = nowDesktop;
    visibleCount = isDesktop ? filteredItems.length : 4;
    renderCards();
  }
});

getTabData();

function getTabData() {
  fetch("./assets/products.json")
    .then((response) => response.json())
    .then((data) => {
      filteredItems = data.filter((item) => item.category === tabType);
      visibleCount = window.innerWidth > 768 ? filteredItems.length : 4;
      renderCards();
    })
    .catch((err) => console.error("Error loading JSON:", err));
}

async function renderCards() {
  console.log("renderCards", visibleCount, tabType);
  grid.innerHTML = "";
  let count = 0;

  const limit = Math.min(visibleCount, filteredItems.length);

  for (let i = 0; i < limit; i++) {
    const item = filteredItems[i];
    count++;
    let imageName = `./assets/img/menu/${item.category}-${count}.png`;

    try {
      const res = await fetch(imageName, { method: "HEAD" });
      if (!res.ok) {
        count = 1;
        imageName = `./assets/img/menu/${item.category}-1.png`;
      }
    } catch {
      count = 1;
      imageName = `./assets/img/menu/${item.category}-1.png`;
    }

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="image"><img src="${imageName}" alt="${item.name}" /></div>
      <div class="description">
        <div class="title">
          <h3 class="typography-heading-3">${item.name}</h3>
          <p class="typography-body-medium">${item.description}</p>
        </div>
        <div class="typography-heading-3 price">$${item.price}</div>
      </div>
    `;
    grid.appendChild(card);
  }

  document.querySelector(".load-more-container")?.remove();

  if (filteredItems.length > limit && window.innerWidth <= 768) {
    grid.after(buttonContainer);
  }
}

