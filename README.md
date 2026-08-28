# Softwater 

**Softwater** es una aplicación móvil premium de monitoreo y control en tiempo real para un sistema IoT de riego por goteo inteligente. Diseñada para trabajar de la mano con microcontroladores **ESP32**, sensores capacitivos de humedad de suelo, relés y bombas de agua.

La aplicación permite a los usuarios supervisar la salud de sus cultivos y automatizar el suministro de agua mediante la configuración de umbrales inteligentes.

---

##  Características Principales

1. **Dashboard en Tiempo Real:** Visualización radial dinámica del porcentaje de humedad del suelo y la temperatura ambiente del cultivo.
2. **Control Inteligente de Riego:**
   * **Modo Automático:** El ESP32 activa y detiene el riego de manera autónoma basándose en umbrales de humedad.
   * **Modo Manual:** El usuario tiene control directo para activar ("Regar Ahora") o detener el riego con un solo toque.
3. **Gestión de Umbrales:** Ajuste del porcentaje mínimo de humedad que dispara el riego automático directamente desde la UI de la app.
4. **Historial y Bitácora de Eventos:**
   * Gráfica visualizada nativamente que muestra las variaciones recientes de humedad del suelo con una línea guía de nivel crítico.
   * Historial detallado de los últimos eventos de riego (hora de inicio, tipo de activación y duración exacta).
5. **Alertas en Tiempo Real:** Bandeja de notificaciones integrada para registrar alertas de sequedad crítica del suelo, fallos en la bomba e inicio de riegos automáticos.

---

##  Stack Tecnológico

* **Core Framework:** React Native con TypeScript estricto.
* **Manejo de Estado del Servidor:** [TanStack React Query v5](https://tanstack.com/query) para el control asíncrono de telemetría e invalidación/caché reactiva.
* **Manejo de Estado Global (UI):** [Zustand](https://github.com/pmndrs/zustand) para la cola de alertas y notificaciones locales.
* **Navegación:** React Navigation v6.
* **Diseño y Estilos:** Sistema de diseño estructurado mediante `StyleSheet` modular en modo oscuro premium, implementando sombras y micro-animaciones nativas de fluidos de agua.

---

##  Arquitectura de Software (Clean Architecture)

El proyecto está diseñado bajo los principios **SOLID** y el patrón **Clean Architecture** para garantizar escalabilidad, mantenibilidad e independencia de hardware:

```
src/
├── domain/            # Capa del Dominio (Lógica de negocio pura, sin dependencias de React)
│   ├── entities/      # Modelos de datos del negocio (SensorData, IrrigationStatus)
│   └── repositories/  # Interfaces y contratos abstractos de acceso a datos
│
├── data/              # Capa de Datos (Integración externa e infraestructura)
│   └── repositories/  # Implementaciones concretas de acceso a APIs o Mocks locales
│
└── presentation/      # Capa de Presentación (Interfaz de usuario y estado)
    ├── components/    # Dumb components (UI pura: circular gauges, steppers de umbral, gráficas)
    ├── hooks/         # ViewModels (useIrrigationControl conecta la UI con el Dominio)
    └── state/         # Almacenamiento Zustand (notificaciones locales)
```

### Inversión de Dependencias (DIP)
El ViewModel (`useIrrigationControl`) consume la interfaz abstracta `IIrrigationRepository` en lugar de una clase concreta. Esto permite intercalar de forma transparente el **`MockIrrigationRepository`** (usado para probar la app sin hardware conectado) con el **`APIIrrigationRepository`** (de producción) sin alterar la interfaz de usuario.

---

## ⚡ Simulación IoT Integrada (Para Pruebas)

La aplicación incluye un simulador activo (`MockIrrigationRepository`) que reproduce el comportamiento de un cultivo real:
* Si el riego está **apagado**, la humedad del suelo cae lentamente (`-0.4%` a `-0.8%` cada 3 segundos).
* Si el riego está **activo**, la humedad sube rápidamente simulando la absorción del agua (`+4%` a `+6%` cada 3 segundos).
* Dispara eventos de notificaciones automáticas y registros en la bitácora cuando se cruza el umbral crítico configurado.

---

## Instalación y Arranque (iOS/Simulador)

### Requisitos Previos
* Node.js (v18+)
* Xcode (con simuladores instalados)
* CocoaPods (`brew install cocoapods` o `sudo gem install cocoapods`)

### Pasos de Instalación
1. Clonar el repositorio.
2. Instalar dependencias de Node:
   ```bash
   npm install
   ```
3. Instalar dependencias nativas de iOS:
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Ejecutar en Desarrollo
1. Enciende el empaquetador de JavaScript (Metro Bundler):
   ```bash
   npm start
   ```
2. Ejecuta la aplicación en el simulador de iOS:
   ```bash
   npx react-native run-ios
   ```
   *O bien, abre `ios/SoftWater.xcworkspace` en Xcode, selecciona tu dispositivo y haz clic en **Run (Play)**.*
