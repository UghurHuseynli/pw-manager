/** @type {import('tailwindcss').Config} */
module.exports = {
  // We roll our own light/dark theming via CSS variables (see global.css and
  // src/theme/colors.ts's paletteToCssVars, applied at the root layout with
  // nativewind's `vars()`), not Tailwind's `dark:` variant. 'class' (vs. the
  // default 'media') just keeps NativeWind's internal `colorScheme.set()`
  // from throwing on web — something in the Expo/router stack calls it on
  // mount, and it rejects outright when the strategy is 'media'.
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Each token resolves through a CSS variable so it can be swapped
        // between the light/dark palette at runtime without regenerating
        // any stylesheet. Default values live in global.css; the root
        // layout overrides them per the active theme.
        app: "rgb(var(--color-app) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        cardAlt: "rgb(var(--color-card-alt) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accentSoft: "rgb(var(--color-accent-soft) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
      },
      borderRadius: {
        xl2: "20px",
      },
    },
  },
  plugins: [],
};
