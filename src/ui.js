const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch (e) {}
  const giscusFrame = document.querySelector("iframe.giscus-frame");
  if (giscusFrame) {
    giscusFrame.contentWindow.postMessage(
      {
        giscus: {
          setConfig: {
            theme: `${location.origin}/assets/css/giscus-${
              isDark ? "dark" : "light"
            }.css`
          }
        }
      },
      "https://giscus.app"
    );
  }
};

const toggleMobileMenu = () => {
  const menu = document.getElementById("mobile-menu");
  if (menu) {
    menu.classList.toggle("hidden");
  }
};

export { scrollToTop, toggleDarkMode, toggleMobileMenu };
