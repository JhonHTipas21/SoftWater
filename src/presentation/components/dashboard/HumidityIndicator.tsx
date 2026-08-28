import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../../theme/theme';

interface HumidityIndicatorProps {
  humidity: number;
  temperature: number;
  isWatering: boolean;
  threshold: number;
}

export const HumidityIndicator: React.FC<HumidityIndicatorProps> = ({
  humidity,
  temperature,
  isWatering,
  threshold,
}) => {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    if (isWatering) {
      // Animación de pulso continuo de riego (efecto de ondas de agua)
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseScale, {
              toValue: 1.08,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseScale, {
              toValue: 1.0,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0.6,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.2,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseScale.setValue(1);
      pulseOpacity.setValue(0.1);
    }
  }, [isWatering, pulseScale, pulseOpacity]);

  // Selección de colores semánticos basados en el estado
  const isBelowThreshold = humidity < threshold;
  const statusColor = isWatering
    ? theme.colors.primary // Riego activo: Azul
    : isBelowThreshold
    ? theme.colors.danger // Crítico: Rojo
    : theme.colors.secondary; // Normal: Verde

  const statusLabel = isWatering
    ? 'REGANDO AHORA'
    : isBelowThreshold
    ? 'SUELO SECO'
    : 'NIVEL ÓPTIMO';

  return (
    <View style={styles.container}>
      {/* Halo de brillo animado en el fondo */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: statusColor,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />
      
      {/* Anillo de información principal */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: statusColor,
            shadowColor: statusColor,
            transform: [{ scale: isWatering ? pulseScale : 1 }],
          },
        ]}
      >
        <View style={styles.innerRing}>
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {statusLabel}
          </Text>
          
          <View style={styles.valueContainer}>
            <Text style={styles.humidityVal}>{humidity}</Text>
            <Text style={styles.percentSymbol}>%</Text>
          </View>
          
          <Text style={styles.captionText}>HUMEDAD SUELO</Text>

          {/* Badge de temperatura ambiente */}
          <View style={styles.tempBadge}>
            <Text style={styles.tempLabel}>TEMP: </Text>
            <Text style={styles.tempVal}>{temperature} °C</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.xxl,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 10,
    backgroundColor: 'transparent',
  },
  outerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardBg,
    ...theme.shadows.lg,
    shadowOpacity: 0.45,
    shadowRadius: 15,
  },
  innerRing: {
    width: 198,
    height: 198,
    borderRadius: 99,
    backgroundColor: '#0F1015',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  statusLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold as any,
    letterSpacing: 1.8,
    marginBottom: theme.spacing.xs,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  humidityVal: {
    fontSize: 54,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.textPrimary,
  },
  percentSymbol: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  captionText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.medium as any,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginTop: -theme.spacing.xs,
  },
  tempBadge: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tempLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textMuted,
  },
  tempVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textSecondary,
  },
});
