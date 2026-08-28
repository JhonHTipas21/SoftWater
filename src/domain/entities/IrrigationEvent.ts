export interface IrrigationEvent {
  id: string; // Identificador único del evento
  timestamp: Date; // Inicio del riego
  durationSeconds: number; // Duración en segundos (o 0 si aún está en curso)
  type: 'manual' | 'auto'; // Origen de la orden de riego
  status: 'success' | 'failed' | 'running'; // Estado final o actual
}
