/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B192C',
          800: '#1E3E62',
          700: '#153448',
          600: '#2C4E80'
        },
        civic: {
          teal: '#008DDA',
          emerald: '#10B981',
          amber: '#F59E0B',
          coral: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}
