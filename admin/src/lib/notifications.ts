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

export let notifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Nouvelle réservation',
    message: 'Aissatou Sarr a demandé une réservation pour John Deere 5075E',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    link: '/bookings',
  },
  {
    id: '2',
    type: 'tractor',
    title: 'Tracteur en attente',
    message: 'Case IH Farmall est en attente d\'approbation',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    link: '/tractors',
  },
  {
    id: '3',
    type: 'user',
    title: 'Nouvel utilisateur',
    message: 'Ibrahima Sow s\'est inscrit et attend la validation',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    link: '/users',
  },
  {
    id: '4',
    type: 'payment',
    title: 'Paiement reçu',
    message: 'Paiement de 168 000 FCFA reçu de Modou Gueye',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    link: '/transactions',
  },
  {
    id: '5',
    type: 'system',
    title: 'Mise à jour système',
    message: 'Nouvelle version de la plateforme disponible',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
];

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
