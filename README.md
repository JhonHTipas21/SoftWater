# Softwater

**Softwater** is a premium real-time monitoring and control mobile application for a smart drip irrigation IoT system. Designed to work hand in hand with **ESP32** microcontrollers, capacitive soil moisture sensors, relays and water pumps.

The app allows users to monitor the health of their crops and automate water delivery by setting smart thresholds.

---

## Main Features

1. **Real Time Dashboard:** Dynamic radial display of the percentage of soil moisture and the ambient temperature of the crop.
2. **Smart Irrigation Control:** 
* **Automatic Mode:** The ESP32 activates and stops irrigation autonomously based on humidity thresholds. 
* **Manual Mode:** User has direct control to activate ("Water Now") or stop watering with a single touch.
3. **Threshold Management:** Adjustment of the minimum humidity percentage that triggers automatic irrigation directly from the app's UI.
4. **History and Event Log:** 
* Natively displayed graph showing recent soil moisture variations with a critical level guide line. 
* Detailed history of the last irrigation events (start time, activation type and exact duration).
5. **Real Time Alerts:** Integrated notification tray to record alerts for critical soil dryness, pump failures and start of automatic irrigation.

---

## Technology Stack

* **Core Framework:** React Native with strict TypeScript.
* **Server State Management:** [TanStack React Query v5](https://tanstack.com/query) for asynchronous telemetry control and reactive cache/invalidation.
* **Global State Management (UI):** [Zustand](https://github.com/pmndrs/zustand) for the local alert and notification queue.
* **Navigation:** React Navigation v6.
* **Design and Styles:** Structured design system using modular `StyleSheet` in premium dark mode, implementing shadows and native micro-animations of water fluids.

---

## Software Architecture (Clean Architecture)

The project is designed under the **SOLID** principles and the **Clean Architecture** pattern to guarantee scalability, maintainability and hardware independence:

```
src/
├── domain/ # Domain Layer (Pure business logic, no React dependencies)
│ ├── entities/ # Business data models (SensorData, IrrigationStatus)
│ └── repositories/ # Abstract data access interfaces and contracts
│
├── data/ # Data Layer (External integration and infrastructure)
│ └── repositories/ # Specific implementations of access to local APIs or Mocks
│
└── presentation/ # Presentation Layer (User Interface and State) 
├── components/ # Dumb components (pure UI: circular gauges, threshold steppers, graphs) 
├── hooks/ # ViewModels (useIrrigationControl connects the UI to the Domain) 
└── state/ # Zustand Storage (local notifications)
```

### Dependency Inversion (DIP)
The ViewModel (`useIrrigationControl`) consumes the abstract interface `IIrrigationRepository` instead of a concrete class. This allows the **`MockIrrigationRepository`** (used to test the app without hardware attached) to be transparently interleaved with the **`APIIrrigationRepository`** (production) without altering the user interface.

---

## ⚡ Integrated IoT Simulation (For Testing)

The application includes an active simulator (`MockIrrigationRepository`) that reproduces the behavior of a real crop:
* If irrigation is **off**, soil moisture drops slowly (`-0.4%` to `-0.8%` every 3 seconds).
* If irrigation is **active**, humidity rises rapidly simulating water absorption (`+4%` to `+6%` every 3 seconds).
* Triggers automatic notification events and log records when the configured critical threshold is crossed.

---

## Installation and Boot (iOS/Simulator)

### Prerequisites
* Node.js (v18+)
* Xcode (with simulators installed)
* CocoaPods (`brew install cocoapods` or `sudo gem install cocoapods`)

### Installation Steps
1. Clone the repository.
2. Install Node dependencies: 
```bash 
npm install 
```
3. Install native iOS dependencies: 
```bash 
ios cd 
pod install 
cd.. 
```

### Run in Development
1. Turn on the JavaScript bundler (Metro Bundler): 
```bash 
npm start 
```
2. Run the app in the iOS simulator: 
```bash 
npx react-native run-ios 
``` 
*Or, open `ios/SoftWater.xcworkspace` in Xcode, select your device and click **Run (Play)**.*
