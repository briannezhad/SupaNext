/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'stripe-dark': '#0a2540',
        'stripe-gray': '#8898aa',
        'stripe-border': '#e3e8ef',
        'stripe-bg': '#f6f9fc',
        'stripe-purple': '#635bff',
        'stripe-green': '#00d97e',
        'stripe-green-bg': '#e6faf1',
        'stripe-yellow': '#ffb020',
        'stripe-yellow-bg': '#fff4e6',
        'stripe-red': '#df1c41',
        'stripe-red-bg': '#ffe6eb',
      },
    },
  },
  plugins: [],
}

