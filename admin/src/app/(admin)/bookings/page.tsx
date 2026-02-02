'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { bookings as initialBookings, Booking, updateBooking } from '@/lib/mock-data';
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
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToAction, setBookingToAction] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.tractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Stats
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
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

  const handleConfirmBooking = () => {
    if (bookingToAction) {
      updateBooking(bookingToAction.id, { status: 'confirmed' });
      setBookings(bookings.map(b =>
        b.id === bookingToAction.id ? { ...b, status: 'confirmed' } : b
      ));
      setIsConfirmModalOpen(false);
      setBookingToAction(null);
    }
  };

  const handleCancelBooking = () => {
    if (bookingToAction) {
      updateBooking(bookingToAction.id, { status: 'cancelled', paymentStatus: 'refunded' });
      setBookings(bookings.map(b =>
        b.id === bookingToAction.id ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b
      ));
      setIsCancelModalOpen(false);
      setBookingToAction(null);
    }
  };

  const handleChangeStatus = (booking: Booking, newStatus: Booking['status']) => {
    updateBooking(booking.id, { status: newStatus });
    setBookings(bookings.map(b =>
      b.id === booking.id ? { ...b, status: newStatus } : b
    ));
    setIsViewModalOpen(false);
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
                <p className="text-2xl font-bold text-blue-700">{confirmedCount}</p>
                <p className="text-sm text-blue-600">Confirmées</p>
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
            <option value="confirmed">Confirmées</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
            <option value="cancelled">Annulées</option>
          </select>
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
                    Période
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
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{booking.tractorName}</p>
                        <p className="text-sm text-slate-500">#{booking.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{booking.clientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{booking.ownerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <span>{formatDate(booking.startDate)}</span>
                        <span>-</span>
                        <span>{formatDate(booking.endDate)}</span>
                      </div>
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
                              title="Confirmer"
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
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
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
                  <h3 className="text-lg font-semibold text-slate-900">{selectedBooking.tractorName}</h3>
                  <p className="text-sm text-slate-500">Réservation #{selectedBooking.id}</p>
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
                  <p className="font-medium text-slate-900">{selectedBooking.clientName}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <p className="text-xs text-slate-500">Propriétaire</p>
                  </div>
                  <p className="font-medium text-slate-900">{selectedBooking.ownerName}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    <p className="text-xs text-slate-500">Période</p>
                  </div>
                  <p className="font-medium text-slate-900">
                    {formatDate(selectedBooking.startDate)} - {formatDate(selectedBooking.endDate)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ({getDuration(selectedBooking.startDate, selectedBooking.endDate)} jours)
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

              {/* Payment info */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Méthode de paiement</p>
                    <p className="font-medium text-slate-900">{selectedBooking.paymentMethod || 'Non spécifié'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Statut du paiement</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedBooking.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : selectedBooking.paymentStatus === 'refunded'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedBooking.paymentStatus === 'paid' ? 'Payé' :
                       selectedBooking.paymentStatus === 'refunded' ? 'Remboursé' : 'En attente'}
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
                        onClick={() => handleChangeStatus(selectedBooking, 'confirmed')}
                        className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                      >
                        Confirmer
                      </button>
                    )}
                    {selectedBooking.status === 'confirmed' && (
                      <button
                        onClick={() => handleChangeStatus(selectedBooking, 'in_progress')}
                        className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200"
                      >
                        Démarrer
                      </button>
                    )}
                    {selectedBooking.status === 'in_progress' && (
                      <button
                        onClick={() => handleChangeStatus(selectedBooking, 'completed')}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Terminer
                      </button>
                    )}
                    {selectedBooking.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleCancelClick(selectedBooking);
                        }}
                        className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                      >
                        Annuler
                      </button>
                    )}
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
              <h2 className="text-lg font-semibold text-slate-900">Confirmer la réservation</h2>
            </div>
            <p className="mb-6 text-slate-600">
              Voulez-vous confirmer la réservation du tracteur <strong>{bookingToAction.tractorName}</strong> pour{' '}
              <strong>{bookingToAction.clientName}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmBooking}
                className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
              >
                Confirmer
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
              Êtes-vous sûr de vouloir annuler la réservation du tracteur <strong>{bookingToAction.tractorName}</strong> ?
              Le client sera remboursé.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Retour
              </button>
              <button
                onClick={handleCancelBooking}
                className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                Annuler la réservation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
