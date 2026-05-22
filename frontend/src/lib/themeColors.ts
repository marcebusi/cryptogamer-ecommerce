/**
 * Theme-aware color tokens for inline styles.
 * Use this when Tailwind CSS classes can't override inline style={} attributes.
 *
 * Dark mode = purple/neon  |  Light mode = red brand palette
 */
import { useTheme } from '../context/ThemeContext'

export interface ThemeColors {
  // Primary brand (purple/neon → red)
  primary:        string
  primaryBg:      string
  primaryBorder:  string
  primaryGlow:    string

  // Neon green → forest green
  neon:           string
  neonBg:         string
  neonBorder:     string
  neonBgStrong:   string

  // Cyan → sky blue
  cyan:           string
  cyanBg:         string
  cyanBorder:     string

  // USDT / Crypto green
  usdt:           string
  usdtBg:         string
  usdtBorder:     string

  // General UI
  cardBg:         string
  cardBorder:     string
  mutedText:      string
  faintText:      string
  whiteLine:      string
}

export function useThemeColors(): ThemeColors & { isDark: boolean } {
  const { isDark } = useTheme()

  const dark: ThemeColors = {
    primary:       '#7c3aed',
    primaryBg:     'rgba(138,43,226,0.10)',
    primaryBorder: 'rgba(168,85,247,0.28)',
    primaryGlow:   '0 0 20px rgba(138,43,226,0.45)',

    neon:          '#39ff14',
    neonBg:        'rgba(57,255,20,0.08)',
    neonBorder:    'rgba(57,255,20,0.25)',
    neonBgStrong:  'rgba(57,255,20,0.12)',

    cyan:          '#3af4ff',
    cyanBg:        'rgba(58,244,255,0.08)',
    cyanBorder:    'rgba(58,244,255,0.22)',

    usdt:          '#26a17b',
    usdtBg:        'rgba(38,161,123,0.08)',
    usdtBorder:    'rgba(38,161,123,0.25)',

    cardBg:        'rgba(255,255,255,0.04)',
    cardBorder:    'rgba(255,255,255,0.10)',
    mutedText:     'rgba(255,255,255,0.45)',
    faintText:     'rgba(255,255,255,0.25)',
    whiteLine:     'rgba(255,255,255,0.10)',
  }

  const light: ThemeColors = {
    primary:       '#dc2626',
    primaryBg:     'rgba(220,38,38,0.07)',
    primaryBorder: 'rgba(220,38,38,0.22)',
    primaryGlow:   '0 4px 14px rgba(220,38,38,0.25)',

    neon:          '#15803d',
    neonBg:        'rgba(21,128,61,0.07)',
    neonBorder:    'rgba(21,128,61,0.20)',
    neonBgStrong:  'rgba(21,128,61,0.10)',

    cyan:          '#0284c7',
    cyanBg:        'rgba(2,132,199,0.07)',
    cyanBorder:    'rgba(2,132,199,0.20)',

    usdt:          '#15803d',
    usdtBg:        'rgba(21,128,61,0.07)',
    usdtBorder:    'rgba(21,128,61,0.20)',

    cardBg:        'rgba(0,0,0,0.025)',
    cardBorder:    'rgba(0,0,0,0.09)',
    mutedText:     'rgba(0,0,0,0.45)',
    faintText:     'rgba(0,0,0,0.28)',
    whiteLine:     'rgba(0,0,0,0.08)',
  }

  return { ...(isDark ? dark : light), isDark }
}
