// Données mock pour l'administration

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password?: string;
  role: 'client' | 'proprietaire' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  avatar?: string;
  adresse?: string;
  nombreTracteurs?: number;
}

export interface Tractor {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  ownerName: string;
  pricePerDay: number;
  location: string;
  status: 'available' | 'rented' | 'maintenance' | 'pending_approval';
  rating: number;
  totalBookings: number;
  createdAt: string;
  image?: string;
}

export interface Booking {
  id: string;
  tractorId: string;
  tractorName: string;
  clientId: string;
  clientName: string;
  ownerId: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'commission' | 'withdrawal';
  amount: number;
  fee: number;
  netAmount: number;
  bookingId?: string;
  userId: string;
  userName: string;
  userRole: 'client' | 'proprietaire';
  paymentMethod: 'Orange Money' | 'Wave' | 'Carte bancaire' | 'Espèces';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  createdAt: string;
  reference: string;
}

// Utilisateurs mock (mutable)
export let users: User[] = [
  {
    id: '1',
    nom: 'Diallo',
    prenom: 'Mamadou',
    email: 'mamadou.diallo@email.com',
    telephone: '+221 77 123 45 67',
    password: 'test123',
    role: 'proprietaire',
    status: 'active',
    createdAt: '2024-01-15',
    adresse: 'Dakar, Sénégal',
    nombreTracteurs: 3,
  },
  {
    id: '2',
    nom: 'Diop',
    prenom: 'Fatou',
    email: 'fatou.diop@email.com',
    telephone: '+221 78 234 56 78',
    password: 'test123',
    role: 'client',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    nom: 'Ndiaye',
    prenom: 'Ousmane',
    email: 'ousmane.ndiaye@email.com',
    telephone: '+221 76 345 67 89',
    password: 'test123',
    role: 'proprietaire',
    status: 'active',
    createdAt: '2024-01-10',
    adresse: 'Thiès, Sénégal',
    nombreTracteurs: 2,
  },
  {
    id: '4',
    nom: 'Fall',
    prenom: 'Aminata',
    email: 'aminata.fall@email.com',
    telephone: '+221 77 456 78 90',
    password: 'test123',
    role: 'client',
    status: 'active',
    createdAt: '2024-03-05',
  },
  {
    id: '5',
    nom: 'Sow',
    prenom: 'Ibrahima',
    email: 'ibrahima.sow@email.com',
    telephone: '+221 78 567 89 01',
    password: 'test123',
    role: 'client',
    status: 'pending',
    createdAt: '2024-03-25',
  },
  {
    id: '6',
    nom: 'Ba',
    prenom: 'Mariama',
    email: 'mariama.ba@email.com',
    telephone: '+221 76 678 90 12',
    password: 'test123',
    role: 'proprietaire',
    status: 'inactive',
    createdAt: '2024-02-01',
    adresse: 'Saint-Louis, Sénégal',
    nombreTracteurs: 1,
  },
  {
    id: '7',
    nom: 'Gueye',
    prenom: 'Modou',
    email: 'modou.gueye@email.com',
    telephone: '+221 77 789 01 23',
    password: 'test123',
    role: 'client',
    status: 'active',
    createdAt: '2024-03-10',
  },
  {
    id: '8',
    nom: 'Sarr',
    prenom: 'Aissatou',
    email: 'aissatou.sarr@email.com',
    telephone: '+221 78 890 12 34',
    password: 'test123',
    role: 'client',
    status: 'active',
    createdAt: '2024-03-15',
  },
];

// Tracteurs mock (mutable)
export let tractors: Tractor[] = [
  {
    id: '1',
    name: 'John Deere 5075E',
    type: 'Labour',
    ownerId: '1',
    ownerName: 'Mamadou Diallo',
    pricePerDay: 45000,
    location: 'Dakar',
    status: 'available',
    rating: 4.8,
    totalBookings: 23,
    createdAt: '2024-01-20',
  },
  {
    id: '2',
    name: 'Massey Ferguson 290',
    type: 'Polyvalent',
    ownerId: '1',
    ownerName: 'Mamadou Diallo',
    pricePerDay: 38000,
    location: 'Dakar',
    status: 'rented',
    rating: 4.5,
    totalBookings: 18,
    createdAt: '2024-01-25',
  },
  {
    id: '3',
    name: 'New Holland T4',
    type: 'Semis',
    ownerId: '3',
    ownerName: 'Ousmane Ndiaye',
    pricePerDay: 42000,
    location: 'Thiès',
    status: 'available',
    rating: 4.7,
    totalBookings: 15,
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: 'Kubota M7060',
    type: 'Récolte',
    ownerId: '3',
    ownerName: 'Ousmane Ndiaye',
    pricePerDay: 50000,
    location: 'Thiès',
    status: 'maintenance',
    rating: 4.9,
    totalBookings: 28,
    createdAt: '2024-02-05',
  },
  {
    id: '5',
    name: 'Case IH Farmall',
    type: 'Labour',
    ownerId: '1',
    ownerName: 'Mamadou Diallo',
    pricePerDay: 35000,
    location: 'Dakar',
    status: 'pending_approval',
    rating: 0,
    totalBookings: 0,
    createdAt: '2024-03-20',
  },
  {
    id: '6',
    name: 'Fendt 200 Vario',
    type: 'Transport',
    ownerId: '6',
    ownerName: 'Mariama Ba',
    pricePerDay: 55000,
    location: 'Saint-Louis',
    status: 'available',
    rating: 4.6,
    totalBookings: 12,
    createdAt: '2024-02-15',
  },
];

// Réservations mock (mutable)
export let bookings: Booking[] = [
  {
    id: '1',
    tractorId: '1',
    tractorName: 'John Deere 5075E',
    clientId: '2',
    clientName: 'Fatou Diop',
    ownerId: '1',
    ownerName: 'Mamadou Diallo',
    startDate: '2024-03-25',
    endDate: '2024-03-28',
    totalPrice: 135000,
    status: 'completed',
    createdAt: '2024-03-20',
    paymentStatus: 'paid',
    paymentMethod: 'Orange Money',
  },
  {
    id: '2',
    tractorId: '2',
    tractorName: 'Massey Ferguson 290',
    clientId: '4',
    clientName: 'Aminata Fall',
    ownerId: '1',
    ownerName: 'Mamadou Diallo',
    startDate: '2024-03-28',
    endDate: '2024-04-02',
    totalPrice: 190000,
    status: 'in_progress',
    createdAt: '2024-03-25',
    paymentStatus: 'paid',
    paymentMethod: 'Wave',
  },
  {
    id: '3',
    tractorId: '3',
    tractorName: 'New Holland T4',
    clientId: '7',
    clientName: 'Modou Gueye',
    ownerId: '3',
    ownerName: 'Ousmane Ndiaye',
    startDate: '2024-04-01',
    endDate: '2024-04-05',
    totalPrice: 168000,
    status: 'confirmed',
    createdAt: '2024-03-28',
    paymentStatus: 'paid',
    paymentMethod: 'Orange Money',
  },
  {
    id: '4',
    tractorId: '1',
    tractorName: 'John Deere 5075E',
    clientId: '8',
    clientName: 'Aissatou Sarr',
    ownerId: '1',
    ownerName: 'Mamadou Diallo',
    startDate: '2024-04-10',
    endDate: '2024-04-15',
    totalPrice: 225000,
    status: 'pending',
    createdAt: '2024-03-30',
    paymentStatus: 'pending',
    paymentMethod: 'Wave',
  },
  {
    id: '5',
    tractorId: '6',
    tractorName: 'Fendt 200 Vario',
    clientId: '2',
    clientName: 'Fatou Diop',
    ownerId: '6',
    ownerName: 'Mariama Ba',
    startDate: '2024-03-15',
    endDate: '2024-03-18',
    totalPrice: 165000,
    status: 'cancelled',
    createdAt: '2024-03-10',
    paymentStatus: 'refunded',
    paymentMethod: 'Orange Money',
  },
];

// Transactions mock
export let transactions: Transaction[] = [
  {
    id: 'TRX001',
    type: 'payment',
    amount: 135000,
    fee: 6750,
    netAmount: 128250,
    bookingId: '1',
    userId: '2',
    userName: 'Fatou Diop',
    userRole: 'client',
    paymentMethod: 'Orange Money',
    status: 'completed',
    description: 'Paiement réservation #1 - John Deere 5075E',
    createdAt: '2024-03-20T10:30:00',
    reference: 'OM-2024032010300001',
  },
  {
    id: 'TRX002',
    type: 'commission',
    amount: 6750,
    fee: 0,
    netAmount: 6750,
    bookingId: '1',
    userId: '1',
    userName: 'Mamadou Diallo',
    userRole: 'proprietaire',
    paymentMethod: 'Orange Money',
    status: 'completed',
    description: 'Commission plateforme (5%) - Réservation #1',
    createdAt: '2024-03-20T10:30:01',
    reference: 'COM-2024032010300001',
  },
  {
    id: 'TRX003',
    type: 'withdrawal',
    amount: 128250,
    fee: 500,
    netAmount: 127750,
    userId: '1',
    userName: 'Mamadou Diallo',
    userRole: 'proprietaire',
    paymentMethod: 'Orange Money',
    status: 'completed',
    description: 'Retrait vers Orange Money',
    createdAt: '2024-03-21T14:00:00',
    reference: 'WD-2024032114000001',
  },
  {
    id: 'TRX004',
    type: 'payment',
    amount: 190000,
    fee: 9500,
    netAmount: 180500,
    bookingId: '2',
    userId: '4',
    userName: 'Aminata Fall',
    userRole: 'client',
    paymentMethod: 'Wave',
    status: 'completed',
    description: 'Paiement réservation #2 - Massey Ferguson 290',
    createdAt: '2024-03-25T09:15:00',
    reference: 'WV-2024032509150001',
  },
  {
    id: 'TRX005',
    type: 'payment',
    amount: 168000,
    fee: 8400,
    netAmount: 159600,
    bookingId: '3',
    userId: '7',
    userName: 'Modou Gueye',
    userRole: 'client',
    paymentMethod: 'Orange Money',
    status: 'completed',
    description: 'Paiement réservation #3 - New Holland T4',
    createdAt: '2024-03-28T16:45:00',
    reference: 'OM-2024032816450001',
  },
  {
    id: 'TRX006',
    type: 'payment',
    amount: 225000,
    fee: 11250,
    netAmount: 213750,
    bookingId: '4',
    userId: '8',
    userName: 'Aissatou Sarr',
    userRole: 'client',
    paymentMethod: 'Wave',
    status: 'pending',
    description: 'Paiement réservation #4 - John Deere 5075E',
    createdAt: '2024-03-30T11:20:00',
    reference: 'WV-2024033011200001',
  },
  {
    id: 'TRX007',
    type: 'refund',
    amount: 165000,
    fee: 0,
    netAmount: 165000,
    bookingId: '5',
    userId: '2',
    userName: 'Fatou Diop',
    userRole: 'client',
    paymentMethod: 'Orange Money',
    status: 'completed',
    description: 'Remboursement réservation #5 annulée - Fendt 200 Vario',
    createdAt: '2024-03-16T08:00:00',
    reference: 'RF-2024031608000001',
  },
  {
    id: 'TRX008',
    type: 'withdrawal',
    amount: 180500,
    fee: 500,
    netAmount: 180000,
    userId: '1',
    userName: 'Mamadou Diallo',
    userRole: 'proprietaire',
    paymentMethod: 'Wave',
    status: 'completed',
    description: 'Retrait vers Wave',
    createdAt: '2024-03-27T10:30:00',
    reference: 'WD-2024032710300001',
  },
  {
    id: 'TRX009',
    type: 'commission',
    amount: 9500,
    fee: 0,
    netAmount: 9500,
    bookingId: '2',
    userId: '1',
    userName: 'Mamadou Diallo',
    userRole: 'proprietaire',
    paymentMethod: 'Wave',
    status: 'completed',
    description: 'Commission plateforme (5%) - Réservation #2',
    createdAt: '2024-03-25T09:15:01',
    reference: 'COM-2024032509150001',
  },
  {
    id: 'TRX010',
    type: 'withdrawal',
    amount: 159600,
    fee: 500,
    netAmount: 159100,
    userId: '3',
    userName: 'Ousmane Ndiaye',
    userRole: 'proprietaire',
    paymentMethod: 'Orange Money',
    status: 'pending',
    description: 'Retrait vers Orange Money (en attente)',
    createdAt: '2024-03-29T15:00:00',
    reference: 'WD-2024032915000001',
  },
];

// Fonctions utilitaires pour CRUD
export const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
  const newUser: User = {
    ...user,
    id: String(users.length + 1),
    createdAt: new Date().toISOString().split('T')[0],
  };
  users = [...users, newUser];
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>) => {
  users = users.map(u => u.id === id ? { ...u, ...updates } : u);
  return users.find(u => u.id === id);
};

export const deleteUser = (id: string) => {
  users = users.filter(u => u.id !== id);
};

export const addTractor = (tractor: Omit<Tractor, 'id' | 'createdAt'>) => {
  const newTractor: Tractor = {
    ...tractor,
    id: String(tractors.length + 1),
    createdAt: new Date().toISOString().split('T')[0],
  };
  tractors = [...tractors, newTractor];
  return newTractor;
};

export const updateTractor = (id: string, updates: Partial<Tractor>) => {
  tractors = tractors.map(t => t.id === id ? { ...t, ...updates } : t);
  return tractors.find(t => t.id === id);
};

export const deleteTractor = (id: string) => {
  tractors = tractors.filter(t => t.id !== id);
};

export const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
  const newBooking: Booking = {
    ...booking,
    id: String(bookings.length + 1),
    createdAt: new Date().toISOString().split('T')[0],
  };
  bookings = [...bookings, newBooking];
  return newBooking;
};

export const updateBooking = (id: string, updates: Partial<Booking>) => {
  bookings = bookings.map(b => b.id === id ? { ...b, ...updates } : b);
  return bookings.find(b => b.id === id);
};

export const deleteBooking = (id: string) => {
  bookings = bookings.filter(b => b.id !== id);
};

// Statistiques du dashboard
export const getDashboardStats = () => ({
  totalUsers: users.length,
  totalClients: users.filter(u => u.role === 'client').length,
  totalOwners: users.filter(u => u.role === 'proprietaire').length,
  totalTractors: tractors.length,
  availableTractors: tractors.filter(t => t.status === 'available').length,
  pendingApprovals: tractors.filter(t => t.status === 'pending_approval').length,
  totalBookings: bookings.length,
  activeBookings: bookings.filter(b => b.status === 'in_progress' || b.status === 'confirmed').length,
  totalRevenue: bookings
    .filter(b => b.status === 'completed' || b.status === 'in_progress')
    .reduce((sum, b) => sum + b.totalPrice, 0),
  monthlyRevenue: 520000,
  revenueGrowth: 12.5,
  totalTransactions: transactions.length,
  pendingTransactions: transactions.filter(t => t.status === 'pending').length,
  totalCommissions: transactions
    .filter(t => t.type === 'commission' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0),
});

// Pour compatibilité
export const dashboardStats = getDashboardStats();

// Données pour les graphiques
export const revenueByMonth = [
  { month: 'Jan', revenue: 320000 },
  { month: 'Fév', revenue: 380000 },
  { month: 'Mar', revenue: 450000 },
  { month: 'Avr', revenue: 520000 },
];

export const bookingsByStatus = [
  { status: 'Terminées', count: 45, color: '#22c55e' },
  { status: 'En cours', count: 12, color: '#3b82f6' },
  { status: 'En attente', count: 8, color: '#f59e0b' },
  { status: 'Annulées', count: 5, color: '#ef4444' },
];
