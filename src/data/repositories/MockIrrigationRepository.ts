import { IIrrigationRepository } from '../../domain/repositories/IIrrigationRepository';
import { SensorData } from '../../domain/entities/SensorData';
import { IrrigationStatus } from '../../domain/entities/IrrigationStatus';
import { IrrigationEvent } from '../../domain/entities/IrrigationEvent';
import { HistoricalData } from '../../domain/entities/HistoricalData';

export class MockIrrigationRepository implements IIrrigationRepository {
  private isWatering = false;
  private isAutoMode = true;
  private humidityThreshold = 45;
  private lastIrrigationTime: Date | undefined = new Date(Date.now() - 3600000 * 4); // Hace 4 horas
  private humidity = 52.0; // Humedad inicial
  private temperature = 24.5; // Temperatura inicial

  private history: HistoricalData[] = [];
  private events: IrrigationEvent[] = [];
  private simulationInterval: NodeJS.Timeout | null = null;
  private wateringDurationRemaining = 0;

  constructor() {
    this.initializeMockData();
    this.startSimulation();
  }

  /**
   * Inicializa el historial y eventos anteriores para que la interfaz muestre información real inmediatamente.
   */
  private initializeMockData() {
    const now = Date.now();
    let currentHum = 58.0;

    // Generar muestras históricas de las últimas 12 horas (una lectura cada 30 minutos)
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now - i * 30 * 60 * 1000);
      
      // Simular variaciones históricas del suelo
      if (i > 16 && i < 20) {
        currentHum += 3.5; // Simulación de riego en el historial
      } else {
        currentHum -= 0.8; // Secado normal
      }

      this.history.push({
        timestamp: time,
        humidity: parseFloat(Math.max(15, Math.min(95, currentHum)).toFixed(1))
      });
    }

    // Eventos de riego previos
    this.events = [
      {
        id: 'evt-mock-1',
        timestamp: new Date(now - 3600000 * 8), // Hace 8 horas
        durationSeconds: 120,
        type: 'auto',
        status: 'success'
      },
      {
        id: 'evt-mock-2',
        timestamp: new Date(now - 3600000 * 4), // Hace 4 horas
        durationSeconds: 90,
        type: 'manual',
        status: 'success'
      }
    ];
  }

  /**
   * Ciclo de simulación del hardware ESP32 y el comportamiento del suelo.
   * Ejecutado cada 3 segundos.
   */
  private startSimulation() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      // Fluctuación leve de temperatura ambiente
      this.temperature += (Math.random() - 0.5) * 0.3;
      this.temperature = parseFloat(Math.max(15.0, Math.min(38.0, this.temperature)).toFixed(1));

      if (this.isWatering) {
        // Humedad sube rápidamente al regar
        this.humidity += 4.0 + Math.random() * 2.0;
        this.humidity = Math.min(98.0, this.humidity);

        // Descontar temporizador en riego manual
        if (this.wateringDurationRemaining > 0) {
          this.wateringDurationRemaining -= 3;
          if (this.wateringDurationRemaining <= 0) {
            this.stopWateringInternal('success');
          }
        }

        // En modo auto, detener al alcanzar un porcentaje óptimo (ej. 80%)
        if (this.isAutoMode && this.humidity >= 80.0) {
          this.stopWateringInternal('success');
        }
      } else {
        // Humedad disminuye lentamente si no se riega
        this.humidity -= 0.4 + Math.random() * 0.4;
        this.humidity = Math.max(10.0, this.humidity);

        // En modo auto, disparar riego si cae por debajo del umbral
        if (this.isAutoMode && this.humidity < this.humidityThreshold) {
          this.startWateringInternal(60, 'auto'); // Regar por 60s
        }
      }

      // Guardar registro en historial y mantener los últimos 40 puntos
      this.history.push({
        timestamp: new Date(),
        humidity: parseFloat(this.humidity.toFixed(1))
      });
      if (this.history.length > 40) {
        this.history.shift();
      }
    }, 3000);
  }

  private startWateringInternal(durationSeconds: number, type: 'manual' | 'auto') {
    this.isWatering = true;
    this.wateringDurationRemaining = durationSeconds;

    const newEvent: IrrigationEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date(),
      durationSeconds: durationSeconds,
      type: type,
      status: 'running'
    };

    this.events.unshift(newEvent);
  }

  private stopWateringInternal(status: 'success' | 'failed') {
    this.isWatering = false;
    this.wateringDurationRemaining = 0;
    this.lastIrrigationTime = new Date();

    if (this.events.length > 0 && this.events[0].status === 'running') {
      const activeEvent = this.events[0];
      const duration = Math.round((Date.now() - activeEvent.timestamp.getTime()) / 1000);
      
      this.events[0] = {
        ...activeEvent,
        durationSeconds: duration > 0 ? duration : activeEvent.durationSeconds,
        status: status
      };
    }
  }

  /**
   * Utilidad para simular latencia de red en llamadas HTTP
   */
  private delay<T>(value: T): Promise<T> {
    const latency = 150 + Math.random() * 350; // 150ms a 500ms
    return new Promise((resolve) => setTimeout(() => resolve(value), latency));
  }

  // IMPLEMENTACIÓN DE IIrrigationRepository

  async getSensorData(): Promise<SensorData> {
    return this.delay({
      humidity: parseFloat(this.humidity.toFixed(1)),
      temperature: parseFloat(this.temperature.toFixed(1)),
      timestamp: new Date()
    });
  }

  async getIrrigationStatus(): Promise<IrrigationStatus> {
    return this.delay({
      isWatering: this.isWatering,
      isAutoMode: this.isAutoMode,
      humidityThreshold: this.humidityThreshold,
      lastIrrigationTime: this.lastIrrigationTime
    });
  }

  async getHistoricalData(): Promise<HistoricalData[]> {
    return this.delay([...this.history]);
  }

  async getIrrigationHistory(): Promise<IrrigationEvent[]> {
    return this.delay([...this.events]);
  }

  async toggleAutoMode(isAuto: boolean): Promise<IrrigationStatus> {
    this.isAutoMode = isAuto;
    // Si se activa auto mode y la humedad está baja, el loop simulará el encendido
    return this.getIrrigationStatus();
  }

  async startIrrigation(durationSeconds: number): Promise<IrrigationStatus> {
    if (!this.isWatering) {
      this.startWateringInternal(durationSeconds, 'manual');
    }
    return this.getIrrigationStatus();
  }

  async stopIrrigation(): Promise<IrrigationStatus> {
    if (this.isWatering) {
      this.stopWateringInternal('success');
    }
    return this.getIrrigationStatus();
  }

  async setHumidityThreshold(threshold: number): Promise<IrrigationStatus> {
    this.humidityThreshold = Math.max(0, Math.min(100, threshold));
    return this.getIrrigationStatus();
  }
}

// Exportación del repositorio Singleton para inyección
export const mockIrrigationRepository = new MockIrrigationRepository();
