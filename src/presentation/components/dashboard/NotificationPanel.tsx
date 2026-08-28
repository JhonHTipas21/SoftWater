import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../../theme/theme';
import { NotificationAlert, useUIStore } from '../../state/useUIStore';

interface NotificationPanelProps {
  notifications: NotificationAlert[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  
  const getAlertColors = (type: NotificationAlert['type']) => {
    switch (type) {
      case 'danger':
        return {
          border: theme.colors.danger,
          bg: 'rgba(239, 68, 68, 0.08)',
          text: theme.colors.danger,
          icon: '⚠️',
        };
      case 'warning':
        return {
          border: theme.colors.warning,
          bg: 'rgba(245, 158, 11, 0.08)',
          text: theme.colors.warning,
          icon: '🔔',
        };
      case 'success':
        return {
          border: theme.colors.success,
          bg: 'rgba(16, 185, 129, 0.08)',
          text: theme.colors.success,
          icon: '✅',
        };
      case 'info':
      default:
        return {
          border: theme.colors.primary,
          bg: 'rgba(0, 168, 255, 0.08)',
          text: theme.colors.primary,
          icon: 'ℹ️',
        };
    }
  };

  const formatElapsedTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 5) return 'Ahora mismo';
    if (seconds < 60) return `Hace ${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    
    return new Date(date).toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.card}>
      {/* Cabecera del Panel */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.cardTitle}>NOTIFICACIONES PUSH</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount} nuevas</Text>
            </View>
          )}
        </View>
        
        {notifications.length > 0 && (
          <Pressable 
            onPress={onClearAll}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.clearButtonText}>Limpiar Todo</Text>
          </Pressable>
        )}
      </View>

      {/* Lista de Alertas */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍃</Text>
            <Text style={styles.emptyText}>Sin novedades</Text>
            <Text style={styles.emptySubtext}>Las alertas e incidencias de riego aparecerán aquí.</Text>
          </View>
        ) : (
          notifications.map((alert) => {
            const stylesConfig = getAlertColors(alert.type);
            
            return (
              <Pressable
                key={alert.id}
                onPress={() => onMarkAsRead(alert.id)}
                style={({ pressed }) => [
                  styles.alertItem,
                  { 
                    borderColor: alert.read ? theme.colors.border : stylesConfig.border,
                    backgroundColor: alert.read ? 'rgba(255, 255, 255, 0.01)' : stylesConfig.bg,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.alertContentRow}>
                  {/* Icono semántico */}
                  <Text style={styles.alertIcon}>{stylesConfig.icon}</Text>
                  
                  {/* Información */}
                  <View style={styles.alertBody}>
                    <View style={styles.alertHeaderRow}>
                      <Text 
                        style={[
                          styles.alertTitle,
                          { color: alert.read ? theme.colors.textSecondary : theme.colors.textPrimary },
                          !alert.read && styles.boldText,
                        ]}
                      >
                        {alert.title}
                      </Text>
                      <Text style={styles.alertTime}>
                        {formatElapsedTime(alert.timestamp)}
                      </Text>
                    </View>
                    
                    <Text 
                      style={[
                        styles.alertMessage,
                        { color: alert.read ? theme.colors.textMuted : theme.colors.textSecondary }
                      ]}
                      numberOfLines={2}
                    >
                      {alert.message}
                    </Text>
                  </View>
                </View>
                
                {/* Indicador sutil de no leído */}
                {!alert.read && (
                  <View style={[styles.unreadDot, { backgroundColor: stylesConfig.border }]} />
                )}
              </Pressable>
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
    marginBottom: theme.spacing.huge, // Margen inferior extra para navegación holgada
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
  },
  badge: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold as any,
    color: '#FFF',
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold as any,
  },
  scrollView: {
    maxHeight: 250,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 28,
    opacity: 0.6,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textSecondary,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: theme.spacing.lg,
  },
  alertItem: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    position: 'relative',
  },
  pressed: {
    opacity: 0.8,
  },
  alertContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: 18,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  alertBody: {
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  boldText: {
    fontWeight: theme.typography.weights.bold as any,
  },
  alertTime: {
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  alertMessage: {
    fontSize: theme.typography.sizes.xs,
    lineHeight: 16,
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
