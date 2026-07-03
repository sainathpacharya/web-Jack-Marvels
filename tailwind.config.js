const aspectRatio = require('@tailwindcss/aspect-ratio');

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: '#FFFDF5',
        'sidebar-peach': '#FFF8F0',
        'peach-highlight': '#FFE8D6',
        'brand-orange': '#E85D2C',
      },
      /**
       * ============================================================
       * SINGLE SOURCE OF TRUTH FOR ALL APP FONTS
       * ------------------------------------------------------------
       * Components NEVER hardcode font names. They only use the
       * semantic utility classes below:
       *   font-display  -> big logo / hero text
       *   font-script   -> titles, event names, buttons (expressive)
       *   font-label    -> UI labels, small headings
       *   font-body     -> all regular/body/input text (default)
       *
       * To change any font across the ENTIRE application:
       *   1. Change the family name(s) on the line(s) below.
       *   2. Load the new font in index.html (Google Fonts <link>).
       * That's it — no component edits required.
       * ============================================================
       */
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
        label: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [aspectRatio],
};
