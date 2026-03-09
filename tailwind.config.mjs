/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary-red': '#e31b23',
        'dark-blue': '#0f172a',
        'text-gray': '#374151',
        'bg-light': '#f3f4f6',
        'navy-blue': '#2c3e50',
        'success-green': '#10b981',
        'personal-blue': '#006cd1',
        'link-blue': '#1e40af',
        'life-purple': '#6b21a8',
        'hero-orange': '#d97706',
        'star-gold': '#fbbf24',
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
