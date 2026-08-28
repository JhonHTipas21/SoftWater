import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { theme } from '../../theme/theme';

interface ControlPanelProps {
  isAutoMode: boolean;
  isWatering: boolean;
  threshold: number;
  isTogglingAutoMode: boolean;
  isStartingIrrigation: boolean;
  isStoppingIrrigation: boolean;
  isSettingThreshold: boolean;
  onToggleAutoMode: (isAuto: boolean) => void;
  onStartIrrigation: (durationSeconds: number) => void;
  onStopIrrigation: () => void;
  onSetThreshold: (threshold: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isAutoMode,
  isWatering,
  threshold,
  isTogglingAutoMode,
  isStartingIrrigation,
  isStoppingIrrigation,
  isSettingThreshold,
  onToggleAutoMode,
  onStartIrrigation,
  onStopIrrigation,
  onSetThreshold,
}) => {
  
  const handleThresholdChange = (amount: number) => {
    const nextVal = Math.max(10, Math.min(90, threshold + amount));
    onSetThreshold(nextVal);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>CONTROL DE SISTEMA</Text>
      
      {/* 1. MODO DE OPERACIÓN: SWITCHER DE PESTAÑAS PERSONALIZADO */}
      <View style={styles.modeContainer}>
        <Text style={styles.label}>Modo de Operación</Text>
        <View style={styles.tabContainer}>
          <Pressable
            disabled={isTogglingAutoMode}
            onPress={() => onToggleAutoMode(false)}
            style={[
              styles.tabButton,
              !isAutoMode && styles.activeTab,
            ]}
          >
            {isTogglingAutoMode && !isAutoMode ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text
                style={[
                  styles.tabText,
                  !isAutoMode && styles.activeTabText,
                ]}
              >
                Manual
              </Text>
            )}
          </Pressable>
          
          <Pressable
            disabled={isTogglingAutoMode}
            onPress={() => onToggleAutoMode(true)}
            style={[
              styles.tabButton,
              isAutoMode && styles.activeTab,
            ]}
          >
            {isTogglingAutoMode && isAutoMode ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text
                style={[
                  styles.tabText,
                  isAutoMode && styles.activeTabText,
                ]}
              >
                Automático
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 2. GESTIÓN DE UMBRALES (Solo relevante en modo automático o ajustable) */}
      <View style={styles.sectionContainer}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>Umbral de Humedad</Text>
            <Text style={styles.description}>
              {isAutoMode 
                ? 'El riego inicia al caer de este umbral' 
                : 'Configure el umbral para recibir alertas'}
            </Text>
          </View>
          <View style={styles.thresholdValueContainer}>
            <Text style={styles.thresholdValue}>{threshold}</Text>
            <Text style={styles.thresholdPercent}>%</Text>
          </View>
        </View>

        {/* Control Step de Umbral */}
        <View style={styles.stepperContainer}>
          <Pressable
            disabled={isSettingThreshold || threshold <= 10}
            onPress={() => handleThresholdChange(-5)}
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.buttonPressed,
              (isSettingThreshold || threshold <= 10) && styles.disabledButton,
            ]}
          >
            <Text style={styles.stepButtonText}>-</Text>
          </Pressable>

          {/* Barra de Progreso Simulada */}
          <View style={styles.progressBarTrack}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${threshold}%` }
              ]} 
            />
          </View>

          <Pressable
            disabled={isSettingThreshold || threshold >= 90}
            onPress={() => handleThresholdChange(5)}
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.buttonPressed,
              (isSettingThreshold || threshold >= 90) && styles.disabledButton,
            ]}
          >
            <Text style={styles.stepButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 3. BOTÓN DE ACCIÓN RÁPIDA: REGAR / DETENER */}
      <View style={styles.actionSection}>
        {isAutoMode ? (
          <View style={styles.autoModeBanner}>
            <Text style={styles.autoModeBannerText}>
              ⚙️ Control Automático por ESP32 Activo. 
            </Text>
            <Text style={styles.autoModeBannerSubtext}>
              El microcontrolador activará el riego si la humedad desciende de {threshold}%.
            </Text>
            {isWatering && (
              <Pressable
                onPress={onStopIrrigation}
                disabled={isStoppingIrrigation}
                style={({ pressed }) => [
                  styles.stopAutoButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                {isStoppingIrrigation ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.stopAutoButtonText}>DETENER RIEGO DE EMERGENCIA</Text>
                )}
              </Pressable>
            )}
          </View>
        ) : (
          <Pressable
            disabled={isStartingIrrigation || isStoppingIrrigation}
            onPress={() => {
              if (isWatering) {
                onStopIrrigation();
              } else {
                onStartIrrigation(120); // Riego manual default de 2 minutos
              }
            }}
            style={({ pressed }) => [
              styles.actionButton,
              isWatering ? styles.actionButtonStop : styles.actionButtonStart,
              pressed && styles.buttonPressed,
            ]}
          >
            {isStartingIrrigation || isStoppingIrrigation ? (
              <ActivityIndicator color={theme.colors.textPrimary} />
            ) : (
              <Text style={styles.actionButtonText}>
                {isWatering ? '💧 DETENER RIEGO' : '⚡ REGAR AHORA (2 MIN)'}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },
  description: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F1015',
    borderRadius: theme.borderRadius.lg,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.cardBgElevated,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold as any,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  sectionContainer: {
    paddingVertical: theme.spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thresholdValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  thresholdValue: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.primary,
  },
  thresholdPercent: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.cardBgElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  disabledButton: {
    opacity: 0.3,
  },
  stepButtonText: {
    fontSize: 22,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold as any,
    lineHeight: 26,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#0F1015',
    borderRadius: theme.borderRadius.full,
    marginHorizontal: theme.spacing.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  actionSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: '100%',
    height: 52,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  actionButtonStart: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonStop: {
    backgroundColor: theme.colors.danger,
  },
  actionButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold as any,
    letterSpacing: 0.5,
  },
  autoModeBanner: {
    width: '100%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(0, 168, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 255, 0.15)',
    alignItems: 'center',
  },
  autoModeBannerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  autoModeBannerSubtext: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  stopAutoButton: {
    marginTop: theme.spacing.md,
    width: '100%',
    paddingVertical: 10,
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopAutoButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: theme.typography.weights.bold as any,
    letterSpacing: 0.5,
  },
});
