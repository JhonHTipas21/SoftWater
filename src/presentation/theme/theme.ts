export const theme = {
  colors: {
    background: '#0D0E12', // Negro premium profundo
    cardBg: '#16171D', // Fondo de tarjetas con contraste
    cardBgElevated: '#1F212A', // Fondo para componentes elevados
    border: '#252731', // Bordes sutiles
    
    // Colores semánticos
    primary: '#00A8FF', // Azul Agua / Agua marina
    primaryMuted: 'rgba(0, 168, 255, 0.15)',
    secondary: '#10B981', // Verde Esmeralda (Salud vegetal)
    secondaryMuted: 'rgba(16, 185, 129, 0.15)',
    
    accent: '#8B5CF6', // Violeta eléctrico para acentos
    
    // Alertas y estados
    danger: '#EF4444', // Rojo crítico (Humedad baja / Falla)
    dangerMuted: 'rgba(239, 68, 68, 0.15)',
    warning: '#F59E0B', // Naranja preventivo
    warningMuted: 'rgba(245, 158, 11, 0.15)',
    success: '#10B981',
    info: '#3B82F6',

    // Textos
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textInverted: '#0D0E12',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
  },
  
  typography: {
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 48,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '900' as const,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.41,
      shadowRadius: 7.49,
      elevation: 12,
    },
  },
};
export type Theme = typeof theme;
