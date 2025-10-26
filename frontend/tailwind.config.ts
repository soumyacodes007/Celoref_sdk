import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FCFF52',
          dark: '#35D07F',
        },
        celo: {
          green: '#35D07F',
          gold: '#FCFF52',
          dark: '#2E3338',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
