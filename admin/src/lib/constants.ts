// Couleurs de l'application
export const colors = {
  primary: '#22c55e',
  primaryDark: '#16a34a',
  primaryLight: '#86efac',
  secondary: '#3b82f6',
  background: '#f8fafc',
  backgroundDark: '#1e293b',
  text: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  white: '#ffffff',
  border: '#e2e8f0',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  info: '#3b82f6',
};

// Configuration de l'application
export const APP_CONFIG = {
  name: 'Allo Tracteur Admin',
  currency: {
    code: 'XOF',
    symbol: 'FCFA',
  },
  defaultRegion: {
    name: 'Sénégal',
    code: 'SN',
  },
};

// Statuts de réservation
export const BOOKING_STATUS = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'En cours', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Terminée', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

// Rôles utilisateurs
export const USER_ROLES = {
  client: { label: 'Client', color: 'bg-blue-100 text-blue-800' },
  proprietaire: { label: 'Propriétaire', color: 'bg-green-100 text-green-800' },
  admin: { label: 'Administrateur', color: 'bg-purple-100 text-purple-800' },
};

// Types de tracteurs
export const TRACTOR_TYPES = [
  'Labour',
  'Semis',
  'Récolte',
  'Transport',
  'Polyvalent',
];
