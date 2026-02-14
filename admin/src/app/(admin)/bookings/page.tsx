'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { getAllBookings, updateBookingStatus, type Booking } from '@/lib/api';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  UserIcon,
  BanknotesIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToAction, setBookingToAction] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Charger les réservations depuis l'API
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error('Erreur chargement bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const tractorName = booking.tractor?.nom || '';
    const clientName = `${booking.client?.prenom || ''} ${booking.client?.nom || ''}`.trim();
    const ownerName = `${booking.owner?.prenom || ''} ${booking.owner?.nom || ''}`.trim();

    const matchesSearch =
      tractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Stats
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const acceptedCount = bookings.filter(b => b.status === 'accepted').length;
  const inProgressCount = bookings.filter(b => b.status === 'in_progress').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  // Handlers
  const handleView = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleConfirmClick = (booking: Booking) => {
    setBookingToAction(booking);
    setIsConfirmModalOpen(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToAction(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingToAction) return;

    try {
      setActionLoading(true);
      await updateBookingStatus(bookingToAction._id, 'accepted');
      await loadBookings(); // Recharger les données
      setIsConfirmModalOpen(false);
      setBookingToAction(null);
    } catch (error) {
      console.error('Erreur confirmation:', error);
      alert('Erreur lors de la confirmation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToAction) return;

    try {
      setActionLoading(true);
      await updateBookingStatus(bookingToAction._id, 'cancelled');
      await loadBookings(); // Recharger les données
      setIsCancelModalOpen(false);
      setBookingToAction(null);
    } catch (error) {
      console.error('Erreur annulation:', error);
      alert('Erreur lors de l\'annulation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (booking: Booking, newStatus: Booking['status']) => {
    try {
      setActionLoading(true);
      await updateBookingStatus(booking._id, newStatus);
      await loadBookings(); // Recharger les données
      setIsViewModalOpen(false);
    } catch (error) {
      console.error('Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    } finally {
      setActionLoading(false);
    }
  };

  const getDuration = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <>
        <Header title="Réservations" subtitle="Chargement..." />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-2 text-slate-600">Chargement des réservations...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Réservations"
        subtitle={`${bookings.length} réservations au total`}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
                <p className="text-sm text-yellow-600">En attente</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{acceptedCount}</p>
                <p className="text-sm text-blue-600">Acceptées</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <ArrowPathIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{inProgressCount}</p>
                <p className="text-sm text-green-600">En cours</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <CalendarIcon className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">{completedCount}</p>
                <p className="text-sm text-slate-600">Terminées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une réservation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="accepted">Acceptées</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
            <option value="cancelled">Annulées</option>
          </select>

          <button
            onClick={loadBookings}
            className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-600 transition-colors"
          >
            Actualiser
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Réservation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Propriétaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Surface
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{booking.tractor?.nom || 'N/A'}</p>
                        <p className="text-sm text-slate-500">#{booking._id.slice(-8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">
                        {booking.client?.prenom} {booking.client?.nom}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">
                        {booking.owner?.prenom} {booking.owner?.nom}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {booking.nombreHectares ? booking.nombreHectares.toFixed(2) : '0.00'} ha
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-green-600">{formatPrice(booking.totalPrice)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} type="booking" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(booking)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          title="Voir détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmClick(booking)}
                              className="rounded-lg p-2 text-green-500 hover:bg-green-100 transition-colors"
                              title="Accepter"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleCancelClick(booking)}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-100 transition-colors"
                              title="Annuler"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="flex h-32 items-center justify-center text-slate-400">
              Aucune réservation trouvée
            </div>
          )}
        </div>
      </main>

      {/* View Details Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Détails de la réservation</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                  <TruckIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedBooking.tractor?.nom}</h3>
                  <p className="text-sm text-slate-500">#{selectedBooking._id.slice(-8)}</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={selectedBooking.status} type="booking" />
                </div>
              </div>

              {/* Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <p className="text-xs text-slate-500">Client</p>
                  </div>
                  <p className="font-medium text-slate-900">
                    {selectedBooking.client?.prenom} {selectedBooking.client?.nom}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <p className="text-xs text-slate-500">Propriétaire</p>
                  </div>
                  <p className="font-medium text-slate-900">
                    {selectedBooking.owner?.prenom} {selectedBooking.owner?.nom}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Surface</p>
                  <p className="font-medium text-slate-900">
                    {selectedBooking.nombreHectares ? selectedBooking.nombreHectares.toFixed(4) : '0.0000'} hectares
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BanknotesIcon className="h-4 w-4 text-slate-400" />
                    <p className="text-xs text-slate-500">Montant total</p>
                  </div>
                  <p className="font-medium text-green-600">{formatPrice(selectedBooking.totalPrice)}</p>
                </div>
              </div>

              {/* Commission */}
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-green-600 font-medium">Commission plateforme (10%)</p>
                    <p className="text-lg font-bold text-green-700">{formatPrice(selectedBooking.commission)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600 font-medium">Gains propriétaire</p>
                    <p className="text-lg font-bold text-green-700">{formatPrice(selectedBooking.ownerEarnings)}</p>
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Méthode de paiement</p>
                    <p className="font-medium text-slate-900">{selectedBooking.payment?.method || 'Non spécifié'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Statut du paiement</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedBooking.payment?.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedBooking.payment?.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedBooking.payment?.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status change buttons */}
              {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-3">Changer le statut:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.status === 'pending' && (
                      <button
                        onClick={() => handleChangeStatus(selectedBooking, 'accepted')}
                        disabled={actionLoading}
                        className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                      >
                        Accepter
                      </button>
                    )}
                    {selectedBooking.status === 'accepted' && (
                      <button
                        onClick={() => handleChangeStatus(selectedBooking, 'in_progress')}
                        disabled={actionLoading}
                        className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                      >
                        Démarrer
                      </button>
                    )}
                    {selectedBooking.status === 'in_progress' && (
                      <button
                        onClick={() => handleChangeStatus(selectedBooking, 'completed')}
                        disabled={actionLoading}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                      >
                        Terminer
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        handleCancelClick(selectedBooking);
                      }}
                      disabled={actionLoading}
                      className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Booking Modal */}
      {isConfirmModalOpen && bookingToAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Accepter la réservation</h2>
            </div>
            <p className="mb-6 text-slate-600">
              Voulez-vous accepter la réservation du tracteur <strong>{bookingToAction.tractor?.nom}</strong> pour{' '}
              <strong>{bookingToAction.client?.prenom} {bookingToAction.client?.nom}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={actionLoading}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={actionLoading}
                className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
              >
                {actionLoading ? 'Traitement...' : 'Accepter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {isCancelModalOpen && bookingToAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Annuler la réservation</h2>
            </div>
            <p className="mb-6 text-slate-600">
              Êtes-vous sûr de vouloir annuler la réservation du tracteur <strong>{bookingToAction.tractor?.nom}</strong> ?
              Le client devra être remboursé.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                disabled={actionLoading}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Retour
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? 'Traitement...' : 'Annuler la réservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
