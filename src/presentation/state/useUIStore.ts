import { create } from 'zustand';

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  timestamp: Date;
  read: boolean;
}

interface UIStoreState {
  notifications: NotificationAlert[];
  isCelsius: boolean;
}

interface UIStoreActions {
  addNotification: (title: string, message: string, type: NotificationAlert['type']) => void;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  toggleTemperatureUnit: () => void;
}

type UIStore = UIStoreState & UIStoreActions;

export const useUIStore = create<UIStore>()((set) => ({
  notifications: [
    {
      id: 'init-alert-1',
      title: 'Monitoreo Iniciado',
      message: 'Softwater se ha enlazado con éxito al ESP32 (Modo Simulado Activo).',
      type: 'success',
      timestamp: new Date(Date.now() - 600000), // Hace 10 min
      read: false,
    },
  ],
  isCelsius: true,
  
  addNotification: (title, message, type) =>
    set((state) => ({
      notifications: [
        {
          id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title,
          message,
          type,
          timestamp: new Date(),
          read: false,
        },
        ...state.notifications,
      ],
    })),
    
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
    
  clearAllNotifications: () => set({ notifications: [] }),
  
  toggleTemperatureUnit: () =>
    set((state) => ({ isCelsius: !state.isCelsius })),
}));
