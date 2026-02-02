interface StatusBadgeProps {
  status: string;
  type: 'booking' | 'user' | 'tractor';
}

const statusStyles = {
  booking: {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  },
  user: {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  },
  tractor: {
    available: 'bg-green-100 text-green-800',
    rented: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    pending_approval: 'bg-purple-100 text-purple-800',
  },
};

const statusLabels = {
  booking: {
    pending: 'En attente',
    confirmed: 'Confirmée',
    in_progress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
  },
  user: {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
  },
  tractor: {
    available: 'Disponible',
    rented: 'Loué',
    maintenance: 'Maintenance',
    pending_approval: 'En attente',
  },
};

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const styles = statusStyles[type] as Record<string, string>;
  const labels = statusLabels[type] as Record<string, string>;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
}
