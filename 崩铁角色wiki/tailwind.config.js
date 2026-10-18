/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        display: ['"Noto Serif SC"', 'Georgia', 'serif'],
      },
      colors: {
        // 银河底色
        void: {
          900: '#05060f',
          800: '#0a0c1b',
          700: '#111427',
          600: '#1a1f3a',
        },
      },
      keyframes: {
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -2%, 0) scale(1.06)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '0.9' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        drift: 'drift 26s ease-in-out infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        sweep: 'sweep 3.4s ease-in-out infinite',
        riseIn: 'riseIn .6s cubic-bezier(.22,1,.36,1) both',
        orbit: 'orbit 40s linear infinite',
      },
    },
  },
  plugins: [],
}
