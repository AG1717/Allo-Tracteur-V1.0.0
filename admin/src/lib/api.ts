/**
 * Service API pour communiquer avec le backend
 * Toutes les pages admin doivent utiliser ce service au lieu des mock-data
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.15:5000/api';

// Helper pour les requêtes API
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erreur API');
  }

  return data;
};

// ==================== BOOKINGS ====================

export interface Booking {
  _id: string;
  tractor: {
    _id: string;
    nom: string;
  };
  client: {
    _id: string;
    prenom: string;
    nom: string;
  };
  owner: {
    _id: string;
    prenom: string;
    nom: string;
  };
  nombreHectares: number;
  prixParHectare: number;
  totalPrice: number;
  commission: number;
  ownerEarnings: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'in_progress';
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllBookings = async (): Promise<Booking[]> => {
  const response = await apiRequest('/admin/bookings/all');
  return response.data || [];
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  return await apiRequest(`/admin/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// ==================== USERS ====================

export interface User {
  _id: string;
  prenom: string;
  nom: string;
  email?: string;
  telephone: string;
  role: 'client' | 'proprietaire' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  adresse?: string;
  region?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  password?: string;
  createdAt: string;
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiRequest('/admin/users/all');
  return response.data || [];
};

export const updateUserStatus = async (userId: string, estActif: boolean) => {
  return await apiRequest(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ estActif }),
  });
};

export const verifyUser = async (userId: string) => {
  return await apiRequest(`/admin/users/${userId}/verify`, {
    method: 'POST',
  });
};

export const createUser = async (userData: {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  role: 'client' | 'proprietaire';
  adresse?: string;
  region?: string;
}) => {
  return await apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId: string) => {
  return await apiRequest(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
};

// ==================== TRACTORS ====================

export interface Tractor {
  _id: string;
  nom: string;
  marque: string;
  modele: string;
  annee: number;
  prixParHectare: number;
  images: string[];
  owner: {
    _id: string;
    prenom: string;
    nom: string;
    telephone?: string;
  };
  localisation: {
    adresse: string;
    ville: string;
    region: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  disponible: boolean;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

export const getAllTractors = async (): Promise<Tractor[]> => {
  const response = await apiRequest('/admin/tractors/all');
  return response.data || [];
};

export const approveTractor = async (tractorId: string) => {
  return await apiRequest(`/admin/tractors/${tractorId}/approve`, {
    method: 'POST',
  });
};

export const rejectTractor = async (tractorId: string) => {
  return await apiRequest(`/admin/tractors/${tractorId}/reject`, {
    method: 'POST',
  });
};

export const updateTractorStatus = async (tractorId: string, estActif: boolean) => {
  return await apiRequest(`/admin/tractors/${tractorId}`, {
    method: 'PUT',
    body: JSON.stringify({ estActif }),
  });
};

export const createTractor = async (tractorData: {
  nom: string;
  marque: string;
  modele: string;
  annee: number;
  puissance?: number;
  description?: string;
  prixParHectare: number;
  owner: string;
  localisation: {
    adresse: string;
    ville: string;
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  equipements?: string[];
  etat?: string;
}) => {
  return await apiRequest('/admin/tractors', {
    method: 'POST',
    body: JSON.stringify(tractorData),
  });
};

export const deleteTractor = async (tractorId: string) => {
  return await apiRequest(`/admin/tractors/${tractorId}`, {
    method: 'DELETE',
  });
};

export const uploadTractorImages = async (tractorId: string, files: File[]) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await fetch(`${API_URL}/tractors/${tractorId}/images`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erreur upload');
  }
  return data;
};

// ==================== STATS ====================

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalOwners: number;
  totalTractors: number;
  availableTractors: number;
  pendingApprovals: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  monthlyRevenue: number;
  revenueGrowth: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiRequest('/admin/stats');
  return response.data || {
    totalUsers: 0,
    totalClients: 0,
    totalOwners: 0,
    totalTractors: 0,
    availableTractors: 0,
    pendingApprovals: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
  };
};

export const getRevenueByMonth = async () => {
  const response = await apiRequest('/admin/revenue-by-month');
  return response.data || [];
};

// ==================== PAIEMENTS / TRANSACTIONS ====================

export interface Payment {
  _id: string;
  reference: string;
  booking: {
    _id: string;
    reference: string;
    nombreHectares: number;
    totalPrice: number;
    tractor: {
      _id: string;
      nom: string;
      marque: string;
      modele: string;
    };
  };
  payer: {
    _id: string;
    prenom: string;
    nom: string;
    telephone: string;
    email: string;
    role: string;
  };
  recipient: {
    _id: string;
    prenom: string;
    nom: string;
    telephone: string;
    email: string;
    role: string;
  };
  amount: number;
  platformFee: number;
  ownerAmount: number;
  currency: string;
  method: 'orange_money' | 'wave' | 'paydunya' | 'cash' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  providerData?: {
    transactionId?: string;
    providerReference?: string;
    phoneNumber?: string;
    responseCode?: string;
    responseMessage?: string;
  };
  refund?: {
    amount?: number;
    reason?: string;
    refundedAt?: Date;
    refundReference?: string;
  };
  completedAt?: Date;
  failedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export const getAllPayments = async (): Promise<Payment[]> => {
  const response = await apiRequest('/admin/payments/all');
  return response.data || [];
};

export const getPaymentDetails = async (paymentId: string): Promise<Payment> => {
  const response = await apiRequest(`/payments/${paymentId}`);
  return response.data;
};

export const confirmPayment = async (paymentId: string, transactionId?: string, providerReference?: string) => {
  return await apiRequest(`/payments/${paymentId}/confirm`, {
    method: 'PUT',
    body: JSON.stringify({ transactionId, providerReference }),
  });
};

export const failPayment = async (paymentId: string, reason: string) => {
  return await apiRequest(`/payments/${paymentId}/fail`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
};

export const refundPayment = async (paymentId: string, amount?: number, reason?: string) => {
  return await apiRequest(`/payments/${paymentId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason }),
  });
};

export default {
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  updateUserStatus,
  verifyUser,
  createUser,
  deleteUser,
  getAllTractors,
  approveTractor,
  rejectTractor,
  updateTractorStatus,
  createTractor,
  deleteTractor,
  getDashboardStats,
  getRevenueByMonth,
  getAllPayments,
  getPaymentDetails,
  confirmPayment,
  failPayment,
  refundPayment,
};
