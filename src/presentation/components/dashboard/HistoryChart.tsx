import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../theme/theme';
import { HistoricalData } from '../../../domain/entities/HistoricalData';
import { IrrigationEvent } from '../../../domain/entities/IrrigationEvent';

interface HistoryChartProps {
  historicalData: HistoricalData[];
  historyEvents: IrrigationEvent[];
  threshold: number;
}

export const HistoryChart: React.FC<HistoryChartProps> = ({
  historicalData,
  historyEvents,
  threshold,
}) => {
  // Tomamos los últimos 20 puntos de datos para mantener la legibilidad
  const activeData = historicalData.slice(-20);
  
  // Encontrar el valor máximo para ajustar la escala visual (default 100%)
  const maxVal = 100;
  
  // Utilidad para formatear la hora (HH:MM)
  const formatTime = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Formatear duración de riego
  const formatDuration = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
    }
    return `${seconds}s`;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>HISTORIAL Y REGISTROS</Text>

      {/* 1. GRÁFICA VISUAL DE BARRAS DE ESPACIO DE HUMEDAD */}
      <Text style={styles.sectionLabel}>Humedad del Suelo (Últimas Muestras)</Text>
      
      <View style={styles.chartContainer}>
        {/* Contenedor de la gráfica y la línea de umbral */}
        <View style={styles.chartVisualArea}>
          
          {/* Línea horizontal indicadora de Umbral de Riego */}
          <View 
            style={[
              styles.thresholdLine, 
              { bottom: `${(threshold / maxVal) * 100}%` }
            ]}
          >
            <View style={styles.thresholdLineLabelContainer}>
              <Text style={styles.thresholdLineLabel}>Umbral: {threshold}%</Text>
            </View>
          </View>
          
          {/* Mapear las barras verticales */}
          <View style={styles.barsContainer}>
            {activeData.map((data, index) => {
              const heightPercent = (data.humidity / maxVal) * 100;
              const isBelow = data.humidity < threshold;
              
              return (
                <View key={`bar-${index}`} style={styles.barColumn}>
                  {/* Tooltip de valor de la barra */}
                  <Text style={styles.barTooltip}>
                    {index % 4 === 0 || index === activeData.length - 1 ? `${Math.round(data.humidity)}` : ''}
                  </Text>
                  
                  {/* Cuerpo de la barra */}
                  <View 
                    style={[
                      styles.barFill,
                      { 
                        height: `${heightPercent}%`,
                        backgroundColor: isBelow ? theme.colors.danger : theme.colors.primary,
                        shadowColor: isBelow ? theme.colors.danger : theme.colors.primary,
                      }
                    ]} 
                  />
                  
                  {/* Etiqueta de tiempo debajo de la barra */}
                  <Text style={styles.barTimeLabel}>
                    {index % 5 === 0 ? formatTime(data.timestamp) : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Eje Y del Gráfico */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>100%</Text>
          <Text style={styles.yAxisLabel}>50%</Text>
          <Text style={styles.yAxisLabel}>0%</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 2. REGISTRO DE EVENTOS DE RIEGO */}
      <Text style={styles.sectionLabel}>Últimos Eventos de Riego</Text>
      
      <ScrollView 
        style={styles.eventsScrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {historyEvents.length === 0 ? (
          <Text style={styles.emptyText}>No hay eventos de riego registrados aún.</Text>
        ) : (
          historyEvents.slice(0, 5).map((event) => {
            const isManual = event.type === 'manual';
            const isRunning = event.status === 'running';
            const isSuccess = event.status === 'success';

            return (
              <View key={event.id} style={styles.eventRow}>
                {/* Icono de tipo */}
                <View 
                  style={[
                    styles.eventIconContainer, 
                    { backgroundColor: isManual ? theme.colors.primaryMuted : theme.colors.secondaryMuted }
                  ]}
                >
                  <Text style={styles.eventEmoji}>{isManual ? '💧' : '⚙️'}</Text>
                </View>
                
                {/* Detalles */}
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>
                    Riego {isManual ? 'Manual' : 'Automático'}
                  </Text>
                  <Text style={styles.eventSubtitle}>
                    Iniciado a las {formatTime(event.timestamp)}
                  </Text>
                </View>

                {/* Estatus e información de duración */}
                <View style={styles.eventStatusContainer}>
                  <Text style={styles.eventDuration}>
                    {isRunning ? 'Activo' : formatDuration(event.durationSeconds)}
                  </Text>
                  
                  <View 
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isRunning 
                          ? theme.colors.primaryMuted 
                          : isSuccess 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : 'rgba(239, 68, 68, 0.1)'
                      }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.statusBadgeText,
                        {
                          color: isRunning 
                            ? theme.colors.primary 
                            : isSuccess 
                            ? theme.colors.secondary 
                            : theme.colors.danger
                        }
                      ]}
                    >
                      {isRunning ? 'Corriendo' : isSuccess ? 'Completado' : 'Fallido'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 180,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  chartVisualArea: {
    flex: 1,
    height: '100%',
    position: 'relative',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: theme.spacing.xs,
  },
  thresholdLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: theme.colors.danger,
    opacity: 0.8,
    zIndex: 5,
  },
  thresholdLineLabelContainer: {
    position: 'absolute',
    top: -16,
    right: 8,
    backgroundColor: theme.colors.cardBgElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  thresholdLineLabel: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.danger,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    height: '100%',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    marginHorizontal: 1.5,
  },
  barTooltip: {
    fontSize: 8,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  barFill: {
    width: '85%',
    minHeight: 4,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    opacity: 0.85,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  barTimeLabel: {
    fontSize: 8,
    color: theme.colors.textMuted,
    marginTop: 4,
    position: 'absolute',
    bottom: -14,
  },
  yAxis: {
    width: 32,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: theme.spacing.xs,
    paddingBottom: 10,
    paddingTop: 10,
  },
  yAxisLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  eventsScrollView: {
    maxHeight: 240,
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  eventIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventEmoji: {
    fontSize: 16,
  },
  eventDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  eventTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },
  eventSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  eventStatusContainer: {
    alignItems: 'flex-end',
  },
  eventDuration: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any,
    color: theme.colors.textSecondary,
    marginBottom: 3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold as any,
  },
});
