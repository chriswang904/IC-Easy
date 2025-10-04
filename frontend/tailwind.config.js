/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "m-3white": "var(--m-3white)",
        "m3-schemes-inverse-on-surface": "var(--m3-schemes-inverse-on-surface)",
        "m3-schemes-on-secondary": "var(--m3-schemes-on-secondary)",
        "m3-schemes-on-secondary-container":
          "var(--m3-schemes-on-secondary-container)",
        "m3-schemes-on-surface": "var(--m3-schemes-on-surface)",
        "m3-schemes-on-surface-variant": "var(--m3-schemes-on-surface-variant)",
        "m3-schemes-outline": "var(--m3-schemes-outline)",
        "m3-schemes-outline-variant": "var(--m3-schemes-outline-variant)",
        "m3-schemes-primary-container": "var(--m3-schemes-primary-container)",
        "m3-schemes-secondary": "var(--m3-schemes-secondary)",
        "m3-schemes-secondary-container":
          "var(--m3-schemes-secondary-container)",
        "m3-schemes-surface": "var(--m3-schemes-surface)",
        "m3-schemes-surface-container": "var(--m3-schemes-surface-container)",
        "m3-schemes-surface-container-high":
          "var(--m3-schemes-surface-container-high)",
        "m3-schemes-surface-container-low":
          "var(--m3-schemes-surface-container-low)",
        "m3-schemes-surface-container-lowest":
          "var(--m3-schemes-surface-container-lowest)",
      },
      fontFamily: {
        "m3-body-large": "var(--m3-body-large-font-family)",
        "m3-body-medium": "var(--m3-body-medium-font-family)",
        "m3-body-small": "var(--m3-body-small-font-family)",
        "m3-label-large": "var(--m3-label-large-font-family)",
        "m3-label-medium": "var(--m3-label-medium-font-family)",
        "m3-title-large": "var(--m3-title-large-font-family)",
      },
      boxShadow: {
        "m3-elevation-light-1": "var(--m3-elevation-light-1)",
      },
    },
  },
  plugins: [],
};
