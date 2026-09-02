export const colors = {
  primary: {
    DEFAULT: '#b63add',
    hover: '#9c28bd',
    light: '#f5dcfd',
    subtle: '#faf0fe',
    overlay: 'rgba(182, 58, 221, 0.35)',
    gradientStart: '#b63add',
    gradientEnd: '#d946ef',
  },
  neutral: {
    bg: '#ffffff',
    surface: '#fcfbfe',
    surfaceHover: '#f5eefb',
    border: '#e9dcf5',
    textPrimary: '#1f0c33',
    textSecondary: '#624d78',
    textMuted: '#9681ab',
  },
} as const;

export const tw = {
  textPrimary: 'text-[#1f0c33]',
  textSecondary: 'text-[#624d78]',
  textMuted: 'text-[#9681ab]',
  textBrand: 'text-[#b63add]',
  bgSurface: 'bg-white',
  bgSurfaceHover: 'hover:bg-[#f8f2fd]',
  borderTheme: 'border-[#e9dcf5]',
} as const;
