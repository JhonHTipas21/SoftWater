import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { IIrrigationRepository } from '../../domain/repositories/IIrrigationRepository';
import { mockIrrigationRepository } from '../../data/repositories/MockIrrigationRepository';
import { useUIStore } from '../state/useUIStore';

/**
 * Custom hook que implementa el patrón ViewModel para el control de riego.
 * Inyecta el repositorio de riego, desacoplando la UI de la capa de datos.
 * 
 * @param repository Implementación de IIrrigationRepository (por defecto el Mock)
 */
export const useIrrigationControl = (
  repository: IIrrigationRepository = mockIrrigationRepository
) => {
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);

  // 1. CONSULTAS (QUERIES) CON CONSULTA RECURRENTE (POLLING) SIMULADA
  
  // Consulta de sensores (Lectura en tiempo real del suelo y ambiente)
  const sensorQuery = useQuery({
    queryKey: ['sensorData'],
    queryFn: () => repository.getSensorData(),
    refetchInterval: 3000, // Consulta cada 3 segundos
  });

  // Consulta de estado de riego y modo
  const statusQuery = useQuery({
    queryKey: ['irrigationStatus'],
    queryFn: () => repository.getIrrigationStatus(),
    refetchInterval: 3000,
  });

  // Consulta de historial de humedad (Gráfica)
  const historicalQuery = useQuery({
    queryKey: ['historicalData'],
    queryFn: () => repository.getHistoricalData(),
    refetchInterval: 6000, // Historial requiere actualizaciones menos frecuentes
  });

  // Consulta del registro histórico de riegos
  const historyEventsQuery = useQuery({
    queryKey: ['irrigationHistory'],
    queryFn: () => repository.getIrrigationHistory(),
    refetchInterval: 3000,
  });

  // 2. MUTACIONES (MUTATIONS) PARA ENVIAR ACCIONES AL DISPOSITIVO

  // Alternar modo Auto/Manual
  const toggleAutoModeMutation = useMutation({
    mutationFn: (isAuto: boolean) => repository.toggleAutoMode(isAuto),
    onSuccess: (updatedStatus) => {
      // Actualizar caché de forma inmediata
      queryClient.setQueryData(['irrigationStatus'], updatedStatus);
      addNotification(
        'Cambio de Modo',
        `El sistema ahora opera en modo ${updatedStatus.isAutoMode ? 'AUTOMÁTICO' : 'MANUAL'}.`,
        'info'
      );
    },
  });

  // Iniciar riego manual
  const startIrrigationMutation = useMutation({
    mutationFn: (durationSeconds: number) => repository.startIrrigation(durationSeconds),
    onSuccess: (updatedStatus) => {
      queryClient.setQueryData(['irrigationStatus'], updatedStatus);
      queryClient.invalidateQueries({ queryKey: ['irrigationHistory'] });
      addNotification(
        'Riego Activado',
        'Se inició la irrigación manual del cultivo.',
        'success'
      );
    },
  });

  // Detener riego manual o automático en curso
  const stopIrrigationMutation = useMutation({
    mutationFn: () => repository.stopIrrigation(),
    onSuccess: (updatedStatus) => {
      queryClient.setQueryData(['irrigationStatus'], updatedStatus);
      queryClient.invalidateQueries({ queryKey: ['irrigationHistory'] });
      addNotification(
        'Riego Finalizado',
        'Se detuvo la irrigación del cultivo.',
        'info'
      );
    },
  });

  // Cambiar umbral de disparo automático
  const setThresholdMutation = useMutation({
    mutationFn: (threshold: number) => repository.setHumidityThreshold(threshold),
    onSuccess: (updatedStatus) => {
      queryClient.setQueryData(['irrigationStatus'], updatedStatus);
      addNotification(
        'Umbral Actualizado',
        `El umbral de disparo automático se fijó en ${updatedStatus.humidityThreshold}%.`,
        'info'
      );
    },
  });

  // 3. EFECTOS COLATERALES: MONITOREO DE NIVELES CRÍTICOS Y ALERTAS PUSH SIMULADAS

  const prevIsBelowThreshold = useRef(false);
  const humidity = sensorQuery.data?.humidity;
  const threshold = statusQuery.data?.humidityThreshold;
  const isWatering = statusQuery.data?.isWatering;

  useEffect(() => {
    if (humidity !== undefined && threshold !== undefined) {
      const isBelow = humidity < threshold;
      
      // Si cae por debajo del umbral y no se está regando actualmente
      if (isBelow && !isWatering) {
        if (!prevIsBelowThreshold.current) {
          addNotification(
            'Alerta de Sequedad',
            `Humedad crítica baja en el suelo: ${humidity}% (Umbral: ${threshold}%).`,
            'danger'
          );
          prevIsBelowThreshold.current = true;
        }
      } else if (!isBelow) {
        prevIsBelowThreshold.current = false;
      }
    }
  }, [humidity, threshold, isWatering, addNotification]);

  // Retorno integrado de datos y acciones
  return {
    // Datos en tiempo real
    sensorData: sensorQuery.data,
    status: statusQuery.data,
    historicalData: historicalQuery.data || [],
    historyEvents: historyEventsQuery.data || [],
    
    // Estados globales de carga y error
    isLoading: sensorQuery.isLoading || statusQuery.isLoading,
    isError: sensorQuery.isError || statusQuery.isError,
    isRefetching: sensorQuery.isRefetching || statusQuery.isRefetching,

    // Acciones directas
    toggleAutoMode: (isAuto: boolean) => toggleAutoModeMutation.mutate(isAuto),
    startIrrigation: (durationSeconds: number) => startIrrigationMutation.mutate(durationSeconds),
    stopIrrigation: () => stopIrrigationMutation.mutate(),
    setThreshold: (threshold: number) => setThresholdMutation.mutate(threshold),

    // Estado individual de carga de las mutaciones
    isTogglingAutoMode: toggleAutoModeMutation.isPending,
    isStartingIrrigation: startIrrigationMutation.isPending,
    isStoppingIrrigation: stopIrrigationMutation.isPending,
    isSettingThreshold: setThresholdMutation.isPending,
  };
};
