import { SensorData } from '../entities/SensorData';
import { IrrigationStatus } from '../entities/IrrigationStatus';
import { IrrigationEvent } from '../entities/IrrigationEvent';
import { HistoricalData } from '../entities/HistoricalData';

export interface IIrrigationRepository {
  /**
   * Obtiene la lectura actual en tiempo real de los sensores.
   */
  getSensorData(): Promise<SensorData>;

  /**
   * Obtiene el estado actual del riego y configuración.
   */
  getIrrigationStatus(): Promise<IrrigationStatus>;

  /**
   * Obtiene el historial de lecturas de humedad para graficación.
   */
  getHistoricalData(): Promise<HistoricalData[]>;

  /**
   * Obtiene el registro histórico de los eventos de riego.
   */
  getIrrigationHistory(): Promise<IrrigationEvent[]>;

  /**
   * Alterna entre modo automático y manual.
   */
  toggleAutoMode(isAuto: boolean): Promise<IrrigationStatus>;

  /**
   * Inicia el riego manual por un tiempo determinado en segundos.
   */
  startIrrigation(durationSeconds: number): Promise<IrrigationStatus>;

  /**
   * Detiene el riego en curso.
   */
  stopIrrigation(): Promise<IrrigationStatus>;

  /**
   * Actualiza el umbral de humedad mínimo para el disparo automático.
   */
  setHumidityThreshold(threshold: number): Promise<IrrigationStatus>;
}
