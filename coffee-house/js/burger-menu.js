const burgerToggle = document.getElementById("burger-toggle");
const menuLinks = document.querySelectorAll(".menu a");
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

menuLinks.forEach((item) => {
  item.addEventListener("click", () => {
    burgerToggle.checked = false;
    body.classList.remove("no-scroll");
    html.classList.remove("no-scroll");
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && burgerToggle.checked) {
    burgerToggle.checked = false;
  }
});

