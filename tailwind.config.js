/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // ─── CORES NEOBRUTALISTAS ──────────────────────────────────────────
      colors: {
        // Primárias vibrantes
        brutal: {
          yellow:  '#FFE600',  // Amarelo elétrico (cor base)
          green:   '#00FF85',  // Verde neon
          red:     '#FF2D2D',  // Vermelho intenso
          blue:    '#0057FF',  // Azul royal saturado
          pink:    '#FF3FD4',  // Rosa choque
          orange:  '#FF6B00',  // Laranja queimado
          purple:  '#7B2FFF',  // Roxo vibrante
          // Neutros
          black:   '#0A0A0A',  // Preto quase total
          white:   '#FAFAFA',  // Branco quase total
          gray:    '#E8E8E8',  // Cinza claro para fundos
        },
      },

      // ─── TIPOGRAFIA ────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Black Han Sans"', 'Impact', 'sans-serif'],
        body:    ['"Space Grotesk"', 'monospace'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      // ─── SOMBRAS BLOCADAS SEM DESFOQUE (assinatura neobrut) ───────────
      boxShadow: {
        'brutal':    '4px 4px 0px 0px #0A0A0A',
        'brutal-sm': '2px 2px 0px 0px #0A0A0A',
        'brutal-lg': '6px 6px 0px 0px #0A0A0A',
        'brutal-xl': '8px 8px 0px 0px #0A0A0A',
        'brutal-white':  '4px 4px 0px 0px #FAFAFA',
        'brutal-yellow': '4px 4px 0px 0px #FFE600',
        'brutal-red':    '4px 4px 0px 0px #FF2D2D',
        'brutal-green':  '4px 4px 0px 0px #00FF85',
        'brutal-blue':   '4px 4px 0px 0px #0057FF',
        'none': 'none',
      },

      // ─── BORDAS ────────────────────────────────────────────────────────
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '6': '6px',
      },

      // ─── ANIMAÇÕES ─────────────────────────────────────────────────────
      keyframes: {
        'brutal-bounce': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-2px, -2px)' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'brutal-bounce': 'brutal-bounce 0.3s ease-in-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
