import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        'mobile': '480px',
      },
      colors: {
        'safe-blue': '#2563eb',
        'safe-green': '#16a34a',
      },
    },
  },
  plugins: [],
}
export default config

