const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        'page-bg': 'var(--page-bg)', // Fundo pagina
        'shell-bg': 'var(--shell-bg)', // Shell / Sidebar
        'content-bg': 'var(--content-bg)', // Conteudo
        'card-bg': 'var(--card-bg)', // Card / Surface
        surface: 'var(--surface)', // Superficie 1
        'surface-2': 'var(--surface-2)', // Superficie 2
        'surface-3': 'var(--surface-3)', // Superficie 3

        primary: 'var(--primary)', // Primaria
        'primary-600': 'var(--primary-600)', // Primaria 600
        'primary-700': 'var(--primary-700)', // Primaria 700
        'primary-soft': 'var(--primary-soft)', // Primaria soft
        'primary-soft-2': 'var(--primary-soft-2)', // Primaria soft 2

        teal: 'var(--teal)', // Teal
        purple: 'var(--purple)', // Purple
        amber: 'var(--amber)', // Amber
        progress: 'var(--progress)', // Progress
        danger: 'var(--danger)', // Danger
        pink: 'var(--pink)', // Pink

        'info-soft': 'var(--info-soft)', // Info soft
        'success-soft': 'var(--success-soft)', // Success soft
        'warning-soft': 'var(--warning-soft)', // Warning soft
        'danger-soft': 'var(--danger-soft)', // Danger soft
        'progress-soft': 'var(--progress-soft)', // Progress soft
        'pink-soft': 'var(--pink-soft)', // Pink soft
        'teal-soft': 'var(--teal-soft)', // Teal soft
        'purple-soft': 'var(--purple-soft)', // Purple soft

        text: 'var(--text)', // Texto
        'text-soft': 'var(--text-soft)', // Texto soft
        'text-muted': 'var(--text-muted)', // Texto muted
        'text-faint': 'var(--text-faint)', // Texto faint
        border: 'var(--border)', // Borda
        'border-2': 'var(--border-2)', // Borda 2
        'border-strong': 'var(--border-strong)', // Borda forte
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-xs)' }],
        sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height-sm)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-base)' }],
        lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-lg)' }],
        xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-xl)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-2xl)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-3xl)' }],
      },
    },
  },
  plugins: [],
}

export default config
