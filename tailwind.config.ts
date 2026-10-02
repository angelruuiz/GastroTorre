import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nueva Paleta Oficial GastroTorre 2026
        gastrotorre: {
          yellow: '#FFCC00', // Amarillo GastroTorre Oficial (Pantone 116 C)
          black: '#111111',  // Negro de marca oficial
          white: '#FFFFFF',  // Blanco de apoyo
          grayLight: '#F4F4F2', // Tarjetas sobre blanco
          grayDark: '#232323',  // Tarjetas sobre negro
          grayText: '#555555',  // Subtítulos y descripciones
          grayFooter: '#888888' // Pies de página
        },
        // Alias de compatibilidad visual con la nueva paleta
        torre: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFCC00', // Amarillo GastroTorre
          600: '#e6b800',
          700: '#cc9900',
          800: '#111111', // Negro de marca
          900: '#111111',
          950: '#0b0f19',
        },
        oro: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FFCC00',
          500: '#FFCC00', // Amarillo GastroTorre Oficial
          600: '#e6b800',
          700: '#cc9900',
          800: '#111111',
          900: '#111111',
        },
        dark: {
          900: '#111111', // Negro de marca oficial
          800: '#1e1e1e',
          700: '#232323', // Gris oscuro oficial
        }
      },
      fontFamily: {
        sans: ['Arial', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'float': '0 10px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'gt-yellow': '0 10px 25px rgba(255, 204, 0, 0.35)',
      }
    },
  },
  plugins: [],
};
export default config;
