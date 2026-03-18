const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch (e) {}
};

const toggleMobileMenu = () => {
  const menu = document.getElementById("mobile-menu");
  if (menu) {
    menu.classList.toggle("hidden");
  }
};

export { scrollToTop, toggleDarkMode, toggleMobileMenu };
