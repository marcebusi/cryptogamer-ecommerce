/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Colors used with opacity modifiers → RGB channel format
        'background':          'rgb(var(--color-bg) / <alpha-value>)',
        'primary-container':   'rgb(var(--color-primary-container) / <alpha-value>)',
        'secondary-container': 'rgb(var(--color-secondary-container) / <alpha-value>)',
        'tertiary-container':  'rgb(var(--color-tertiary-container) / <alpha-value>)',

        // Surface system
        'surface':                    'var(--color-surface)',
        'surface-dim':                'var(--color-surface-dim)',
        'surface-bright':             'var(--color-surface-bright)',
        'surface-variant':            'var(--color-surface-variant)',
        'surface-tint':               'var(--color-surface-tint)',
        'surface-container-lowest':   'var(--color-surface-container-lowest)',
        'surface-container-low':      'var(--color-surface-container-low)',
        'surface-container':          'var(--color-surface-container)',
        'surface-container-high':     'var(--color-surface-container-high)',
        'surface-container-highest':  'var(--color-surface-container-highest)',

        // On-surface
        'on-background':      'var(--color-on-background)',
        'on-surface':         'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'inverse-surface':    'var(--color-inverse-surface)',
        'inverse-on-surface': 'var(--color-inverse-on-surface)',

        // Primary
        'primary':                  'var(--color-primary)',
        'primary-fixed':            'var(--color-primary-fixed)',
        'primary-fixed-dim':        'var(--color-primary-fixed-dim)',
        'on-primary':               'var(--color-on-primary)',
        'on-primary-container':     'var(--color-on-primary-container)',
        'on-primary-fixed':         'var(--color-on-primary-fixed)',
        'on-primary-fixed-variant': 'var(--color-on-primary-fixed-variant)',
        'inverse-primary':          'var(--color-inverse-primary)',

        // Secondary
        'secondary':                  'var(--color-secondary)',
        'secondary-fixed':            'var(--color-secondary-fixed)',
        'secondary-fixed-dim':        'var(--color-secondary-fixed-dim)',
        'on-secondary':               'var(--color-on-secondary)',
        'on-secondary-container':     'var(--color-on-secondary-container)',
        'on-secondary-fixed':         'var(--color-on-secondary-fixed)',
        'on-secondary-fixed-variant': 'var(--color-on-secondary-fixed-variant)',

        // Tertiary
        'tertiary':                  'var(--color-tertiary)',
        'tertiary-fixed':            'var(--color-tertiary-fixed)',
        'tertiary-fixed-dim':        'var(--color-tertiary-fixed-dim)',
        'on-tertiary':               'var(--color-on-tertiary)',
        'on-tertiary-container':     'var(--color-on-tertiary-container)',
        'on-tertiary-fixed':         'var(--color-on-tertiary-fixed)',
        'on-tertiary-fixed-variant': 'var(--color-on-tertiary-fixed-variant)',

        // Outline & error
        'outline':            'var(--color-outline)',
        'outline-variant':    'var(--color-outline-variant)',
        'error':              'var(--color-error)',
        'error-container':    'var(--color-error-container)',
        'on-error':           'var(--color-on-error)',
        'on-error-container': 'var(--color-on-error-container)',
      },
      borderRadius: {
        DEFAULT: '0.125rem', lg: '0.25rem', xl: '0.5rem', full: '0.75rem',
      },
      spacing: {
        md: '24px', gutter: '24px', base: '4px', sm: '16px',
        xs: '8px',  lg: '48px',    xl: '80px',  margin: '32px',
      },
      fontFamily: {
        'body-lg':    ['"Plus Jakarta Sans"', 'sans-serif'],
        'label-caps': ['"Plus Jakarta Sans"', 'sans-serif'],
        'h1-display': ['"Plus Jakarta Sans"', 'sans-serif'],
        'h3-title':   ['"Plus Jakarta Sans"', 'sans-serif'],
        'h2-headline':['"Plus Jakarta Sans"', 'sans-serif'],
        'button-text':['"Plus Jakarta Sans"', 'sans-serif'],
        'body-md':    ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontSize: {
        'body-lg':    ['18px', { lineHeight:'1.6',  fontWeight:'400' }],
        'label-caps': ['12px', { lineHeight:'1.0',  letterSpacing:'0.1em', fontWeight:'700' }],
        'h1-display': ['48px', { lineHeight:'1.1',  letterSpacing:'-0.02em', fontWeight:'800' }],
        'h3-title':   ['24px', { lineHeight:'1.3',  fontWeight:'700' }],
        'h2-headline':['32px', { lineHeight:'1.2',  letterSpacing:'-0.01em', fontWeight:'700' }],
        'button-text':['14px', { lineHeight:'1.0',  fontWeight:'600' }],
        'body-md':    ['16px', { lineHeight:'1.6',  fontWeight:'400' }],
      },
    },
  },
  plugins: [],
}
