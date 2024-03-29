const isProduction = process.env.NODE_ENV === "production";

let purge = false;

// We want optimization only in production
if (isProduction) {
  purge = ["./content/**/*.njk", "./src/*.js"];
}

module.exports = {
  purge,
  plugins: [
    function ({ addUtilities }) {
      const extendUnderline = {
        ".underline": {
          textDecoration: "underline",
          "text-decoration-color": "text-indigo-300",
          "text-underline-position": "under"
        }
      };
      addUtilities(extendUnderline);
    }
  ],
  variants: {
    extend: {
      backgroundImage: ["dark"],
      fill: ["dark"],
      fontWeight: ["dark"],
      gradientColorStops: ["dark"],
      stroke: ["dark"]
    }
  },
  theme: {
    extend: {
      backgroundColor: (theme) => ({
        ...theme("colors"),
        "dark-nav": "#242424",
        "dark-body": "#1B1B1E",
        "dark-heading": "#27282B"
      }),
      backgroundImage: () => ({
        "sidebar-dark": "radial-gradient(circle,rgba(21, 2, 122, 1) 0%,rgba(35, 37, 46, 1) 100%)",
        "sidebar-light":
          "radial-gradient(circle,rgba(21, 2, 122, 1) 0%,rgba(35, 37, 46, 1) 100%)"
      }),
      borderWidth: (theme) => ({
        ...theme("width"),
        1: "1px"
      }),
      gradientColorStops: (theme) => ({
        ...theme("colors"),
        "dark-outer": "#1B1B1E",
        "dark-middle": "#242424"
      }),
      gridTemplateColumns: {
        small: "0 auto",
        regular: "minmax(auto, 0fr) auto;",
        topbar: "auto 18rem"
      },
      lineHeight: {
        pagination: "1.8rem",
        12: "3rem"
      },
      margin: {
        15: "3.75rem"
      },
      maxWidth: {
        content: "95rem"
      },
      textColor: {
        "orange-hover": "#d2603a"
      },
      colors: {
        myblue: {
          50: "#4734ac",
          100: "#3d2aa2",
          200: "#332098",
          300: "#29168e",
          400: "#1f0c84",
          500: "#15027a",
          600: "#0b0070",
          700: "#010066",
          800: "#00005c",
          900: "#000052"
        }
      },
      fontFamily: {
        sans: ["Graphik", "sans-serif"],
        serif: ["Merriweather", "serif"]
      }
    }
  }
};
