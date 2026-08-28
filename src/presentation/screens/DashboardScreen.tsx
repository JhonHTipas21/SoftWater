import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  StatusBar,
  Pressable
} from 'react-native';
import { theme } from '../theme/theme';
import { useIrrigationControl } from '../hooks/useIrrigationControl';
import { useUIStore } from '../state/useUIStore';
import { HumidityIndicator } from '../components/dashboard/HumidityIndicator';
import { ControlPanel } from '../components/dashboard/ControlPanel';
import { HistoryChart } from '../components/dashboard/HistoryChart';
import { NotificationPanel } from '../components/dashboard/NotificationPanel';

export const DashboardScreen: React.FC = () => {
  // ViewModel
  const {
    sensorData,
    status,
    historicalData,
    historyEvents,
    isLoading,
    isError,
    isRefetching,
    toggleAutoMode,
    startIrrigation,
    stopIrrigation,
    setThreshold,
    isTogglingAutoMode,
    isStartingIrrigation,
    isStoppingIrrigation,
    isSettingThreshold,
  } = useIrrigationControl();

  // Zustand State (Notificaciones y Ajustes de UI)
  const notifications = useUIStore((state) => state.notifications);
  const markAsRead = useUIStore((state) => state.markAsRead);
  const clearAllNotifications = useUIStore((state) => state.clearAllNotifications);

  // 1. CARGA INICIAL (CONEXIÓN INICIAL)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Estableciendo enlace con ESP32...</Text>
        <Text style={styles.loadingSubtext}>Sincronizando registros en canal local</Text>
      </View>
    );
  }

  // 2. ERROR DE ENLACE / COMUNICACIÓN
  if (isError || !sensorData || !status) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>Fallo en la comunicación IoT</Text>
        <Text style={styles.errorSubtext}>
          No se pudo recibir telemetría del ESP32. Verifique la alimentación del circuito.
        </Text>
        <Pressable 
          style={styles.retryButton}
          onPress={() => {
            // Recargar datos (React Query maneja refetch al reintentar de forma nativa)
          }}
        >
          <Text style={styles.retryButtonText}>Reintentar Enlace</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      {/* CABECERA (HEADER) PREMIUM */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SOFTWATER</Text>
          <Text style={styles.headerSubtitle}>Sistema Inteligente de Riego</Text>
        </View>
        
        {/* Indicador de Conexión en Tiempo Real */}
        <View style={styles.connectionIndicator}>
          {isRefetching && (
            <ActivityIndicator 
              size="small" 
              color={theme.colors.primary} 
              style={styles.refetchSpinner} 
            />
          )}
          <View style={styles.pulsingDot} />
          <Text style={styles.connectionText}>ESP32 OK</Text>
        </View>
      </View>

      {/* ÁREA DE CONTENIDO */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Indicador Radial de Humedad en Tiempo Real */}
        <HumidityIndicator
          humidity={sensorData.humidity}
          temperature={sensorData.temperature}
          isWatering={status.isWatering}
          threshold={status.humidityThreshold}
        />

        {/* 2. Panel de Control y Configuración de Umbral */}
        <ControlPanel
          isAutoMode={status.isAutoMode}
          isWatering={status.isWatering}
          threshold={status.humidityThreshold}
          isTogglingAutoMode={isTogglingAutoMode}
          isStartingIrrigation={isStartingIrrigation}
          isStoppingIrrigation={isStoppingIrrigation}
          isSettingThreshold={isSettingThreshold}
          onToggleAutoMode={toggleAutoMode}
          onStartIrrigation={startIrrigation}
          onStopIrrigation={stopIrrigation}
          onSetThreshold={setThreshold}
        />

        {/* 3. Gráfica Histórica y Eventos Recientes */}
        <HistoryChart
          historicalData={historicalData}
          historyEvents={historyEvents}
          threshold={status.humidityThreshold}
        />

        {/* 4. Notificaciones Push Simuladas */}
        <NotificationPanel
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onClearAll={clearAllNotifications}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold as any,
    marginTop: theme.spacing.lg,
  },
  loadingSubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginTop: 6,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.bold as any,
    marginBottom: theme.spacing.sm,
  },
  errorSubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xxl,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.bold as any,
    fontSize: theme.typography.sizes.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  refetchSpinner: {
    marginRight: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.secondary,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
});
