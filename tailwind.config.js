/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#14334D',
          slate: '#304F67',
          subtle: '#456176',
          muted: '#A0AFBB',
          light: '#D6DCE1',
          bg: '#F0F2F5',
          card: '#FFFFFF',
          pill: '#0D0E10',
          blue: '#3898D5',
        },
        dark: {
          bg: '#0A0B0D',
          surface: '#131518',
          card: '#181A1E',
          raised: '#202328',
          border: '#26292F',
          subtle: '#32363D',
        },
        accent: {
          light: '#E0F2FE',
          DEFAULT: '#3898D5',
          dark: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'tactile': '0px 1.67px 4.18px rgba(181,186,203,0.31), 0px 17.57px 10.88px rgba(181,187,203,0.16), 0px 31.8px 12.55px rgba(181,187,203,0.05), inset 0px 7px 32px rgb(255,255,255)',
        'kree8': '0px 1.67px 4.18px 0px #B7B5CB4F, 0px 8.37px 8.37px 0px #B7B5CB45, 0px 17.57px 10.88px 0px #B7B5CB29, 0px 31.8px 12.55px 0px #B7B5CB0D',
        'floating': '0 20px 40px -15px rgba(20, 51, 77, 0.15)',
        'pill': '0 4px 14px 0 rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
