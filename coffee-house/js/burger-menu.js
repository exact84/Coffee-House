const burgerToggle = document.getElementById("burger-toggle");
const menu = document.querySelector(".menu");
const body = document.body;
const html = document.documentElement;

burgerToggle.addEventListener("change", function () {
  if (burgerToggle.checked) {
    body.classList.add("no-scroll");
    html.classList.add("no-scroll");
  } else {
    body.classList.remove("no-scroll");
    html.classList.remove("no-scroll");
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && burgerToggle.checked) {
    burgerToggle.checked = false;
    body.classList.remove("no-scroll");
    html.classList.remove("no-scroll");
  }
});

menu.addEventListener("click", (e) => {
  burgerToggle.checked = false;
  body.classList.remove("no-scroll");
  html.classList.remove("no-scroll");
});

