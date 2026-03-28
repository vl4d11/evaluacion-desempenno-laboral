/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  safelist: [
    {
      pattern: /col-span-(1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24)/
    },
    {
      pattern: /md:col-span-(1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24)/
    },
    {
      pattern: /w-\[(10|20|30|40|50|60|70|80|90)%\]/
    }
  ],

  theme: {
    extend: {
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))'
      }
    }
  },

  plugins: []
}
