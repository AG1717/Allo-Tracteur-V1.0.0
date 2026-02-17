// Données mock pour les notifications

export interface Notification {
  id: string;
  type: 'booking' | 'user' | 'tractor' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// Les notifications seront chargées depuis l'API backend dans une future version
// Pour l'instant, le tableau est vide pour afficher uniquement les vraies données
export let notifications: Notification[] = [];

export const getUnreadCount = () => {
  return notifications.filter(n => !n.read).length;
};

export const markAsRead = (id: string) => {
  notifications = notifications.map(n =>
    n.id === id ? { ...n, read: true } : n
  );
};

export const markAllAsRead = () => {
  notifications = notifications.map(n => ({ ...n, read: true }));
};

export const deleteNotification = (id: string) => {
  notifications = notifications.filter(n => n.id !== id);
};
