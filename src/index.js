import { scrollToTop, toggleDarkMode, toggleMobileMenu } from "./ui";
import { searchContent } from "./search";
import { copyUrlToClipboard } from "./utils";

window.scrollToTop = function () {
  scrollToTop();
};

window.toggleDarkMode = function () {
  toggleDarkMode();
};

window.toggleMobileMenu = function () {
  toggleMobileMenu();
};

window.searchContent = function (e) {
  window.clearTimeout(window.searchDelay);
  window.searchDelay = setTimeout(() => {
    searchContent(e);
  }, 300);
};

window.copyUrlToClipboard = function () {
  copyUrlToClipboard();
};

document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".content h2, .content h3");
  const menu = document.querySelectorAll("nav.toc a");

  const makeActive = (link) => {
    if (menu[link]) menu[link].classList.add("active");
  };
  const removeActive = (link) => {
    if (menu[link]) menu[link].classList.remove("active");
  };
  const removeAllActive = () =>
    [...Array(sections.length).keys()].forEach((link) => removeActive(link));

  let currentActive = 0;

  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const scrollEl = document.getElementById("scroll");

    // TOC active section tracking
    if (sections.length > 0 && menu.length > 0) {
      const navHeight = 56; // sticky nav height in px
      const currentHeading =
        sections.length -
        [...sections].reverse().findIndex((section) => {
          return section.offsetTop - navHeight - 8 <= scrollTop;
        }) -
        1;

      if (currentHeading !== currentActive) {
        removeAllActive();
        currentActive = currentHeading;
        makeActive(currentHeading);
      }
    }

    // Scroll-to-top button
    if (scrollEl) {
      if (scrollTop > window.innerHeight) {
        scrollEl.style.display = "flex";
      } else {
        scrollEl.style.display = "none";
      }
    }
  });
});
