const isProduction = process.env.NODE_ENV === "production";

let purge = false;

if (isProduction) {
  purge = ["./content/**/*.njk", "./content/**/*.md", "./src/*.js"];
}

module.exports = {
  darkMode: "class",
  purge,
  theme: {
    extend: {
      colors: {
        giants: {
          50:  "#e8ecf4",
          100: "#c5cfe5",
          200: "#9eafd4",
          300: "#748ec3",
          400: "#5273b6",
          500: "#2f58a9",
          600: "#1f4099",
          700: "#162f82",
          800: "#0B2265",
          900: "#071540"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif"
        ],
        serif: ["Merriweather", "serif"]
      },
      maxWidth: {
        content: "90rem"
      },
      lineHeight: {
        pagination: "1.8rem",
        12: "3rem"
      },
      borderWidth: {
        1: "1px"
      },
      margin: {
        15: "3.75rem"
      }
    }
  },
  variants: {
    extend: {
      fill: ["dark"],
      stroke: ["dark"]
    }
  },
  plugins: []
};
