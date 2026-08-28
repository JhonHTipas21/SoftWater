export interface IrrigationStatus {
  isWatering: boolean; // Indica si la bomba de agua está activa actualmente
  isAutoMode: boolean; // true = Control automático por ESP32, false = Control manual
  humidityThreshold: number; // Umbral de humedad (%) mínimo para activar riego automático
  lastIrrigationTime?: Date; // Fecha/hora de finalización del último riego
}
