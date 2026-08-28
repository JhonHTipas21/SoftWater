import { MockIrrigationRepository } from '../data/repositories/MockIrrigationRepository';

describe('MockIrrigationRepository Tests', () => {
  let repository: MockIrrigationRepository;

  beforeEach(() => {
    // Instanciamos un nuevo repositorio para cada test
    repository = new MockIrrigationRepository();
  });

  test('debe inicializar con el modo automático activo por defecto', async () => {
    const status = await repository.getIrrigationStatus();
    expect(status.isAutoMode).toBe(true);
    expect(status.isWatering).toBe(false);
  });

  test('debe cambiar de modo exitosamente (Auto -> Manual)', async () => {
    const statusBefore = await repository.getIrrigationStatus();
    expect(statusBefore.isAutoMode).toBe(true);

    const statusAfter = await repository.toggleAutoMode(false);
    expect(statusAfter.isAutoMode).toBe(false);
  });

  test('debe actualizar el umbral de humedad correctamente dentro de límites (10% a 90%)', async () => {
    const status = await repository.setHumidityThreshold(65);
    expect(status.humidityThreshold).toBe(65);

    // Límite superior
    const statusHigh = await repository.setHumidityThreshold(120);
    expect(statusHigh.humidityThreshold).toBe(100); // Límite cap en la lógica del repo

    // Límite inferior
    const statusLow = await repository.setHumidityThreshold(-10);
    expect(statusLow.humidityThreshold).toBe(0);
  });

  test('debe iniciar y detener el riego manual correctamente', async () => {
    // 1. Verificar estado inicial
    let status = await repository.getIrrigationStatus();
    expect(status.isWatering).toBe(false);

    // 2. Iniciar riego
    status = await repository.startIrrigation(120);
    expect(status.isWatering).toBe(true);

    // 3. Detener riego
    status = await repository.stopIrrigation();
    expect(status.isWatering).toBe(false);
  });

  test('debe registrar el evento de riego en el historial al iniciar el riego manual', async () => {
    const initialEvents = await repository.getIrrigationHistory();
    const initialCount = initialEvents.length;

    // Iniciar riego
    await repository.startIrrigation(90);
    
    const updatedEvents = await repository.getIrrigationHistory();
    expect(updatedEvents.length).toBe(initialCount + 1);
    expect(updatedEvents[0].type).toBe('manual');
    expect(updatedEvents[0].status).toBe('running');
  });
});
