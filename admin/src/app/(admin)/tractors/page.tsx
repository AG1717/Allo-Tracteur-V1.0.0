'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import TractorModal from '@/components/TractorModal';
import { tractors as initialTractors, Tractor, addTractor, updateTractor, deleteTractor, users } from '@/lib/mock-data';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function TractorsPage() {
  const [tractors, setTractors] = useState<Tractor[]>(initialTractors);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedTractor, setSelectedTractor] = useState<Tractor | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tractorToDelete, setTractorToDelete] = useState<Tractor | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const filteredTractors = tractors.filter((tractor) => {
    const matchesSearch =
      tractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tractor.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tractor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tractor.status === statusFilter;
    const matchesType = typeFilter === 'all' || tractor.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const uniqueTypes = Array.from(new Set(tractors.map(t => t.type)));

  // Stats
  const totalTractors = tractors.length;
  const availableTractors = tractors.filter(t => t.status === 'available').length;
  const rentedTractors = tractors.filter(t => t.status === 'rented').length;
  const pendingTractors = tractors.filter(t => t.status === 'pending_approval').length;

  // Handlers
  const handleAdd = () => {
    setModalMode('add');
    setSelectedTractor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tractor: Tractor) => {
    setModalMode('edit');
    setSelectedTractor(tractor);
    setIsModalOpen(true);
  };

  const handleView = (tractor: Tractor) => {
    setSelectedTractor(tractor);
    setIsViewModalOpen(true);
  };

  const handleSave = (tractorData: Partial<Tractor>) => {
    if (modalMode === 'add') {
      const newTractor = addTractor(tractorData as Omit<Tractor, 'id' | 'createdAt'>);
      setTractors([...tractors, newTractor]);
    } else if (selectedTractor) {
      updateTractor(selectedTractor.id, tractorData);
      setTractors(tractors.map(t =>
        t.id === selectedTractor.id ? { ...t, ...tractorData } : t
      ));
    }
  };

  const handleDeleteClick = (tractor: Tractor) => {
    setTractorToDelete(tractor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tractorToDelete) {
      deleteTractor(tractorToDelete.id);
      setTractors(tractors.filter(t => t.id !== tractorToDelete.id));
      setIsDeleteModalOpen(false);
      setTractorToDelete(null);
    }
  };

  const handleApprove = (tractor: Tractor) => {
    updateTractor(tractor.id, { status: 'available' });
    setTractors(tractors.map(t =>
      t.id === tractor.id ? { ...t, status: 'available' } : t
    ));
  };

  const handleReject = (tractor: Tractor) => {
    deleteTractor(tractor.id);
    setTractors(tractors.filter(t => t.id !== tractor.id));
  };

  return (
    <>
      <Header
        title="Tracteurs"
        subtitle={`${totalTractors} tracteurs enregistrés`}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <TruckIcon className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-xl font-bold text-slate-900">{totalTractors}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Disponibles</p>
                <p className="text-xl font-bold text-green-700">{availableTractors}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Loués</p>
                <p className="text-xl font-bold text-blue-700">{rentedTractors}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">En attente</p>
                <p className="text-xl font-bold text-yellow-700">{pendingTractors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un tracteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">Tous les types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="available">Disponibles</option>
              <option value="rented">Loués</option>
              <option value="maintenance">Maintenance</option>
              <option value="pending_approval">En attente</option>
            </select>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter
          </button>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTractors.map((tractor) => (
            <div
              key={tractor.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image placeholder */}
              <div className="relative h-40 bg-gradient-to-br from-green-400 to-green-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-20 w-20 text-white/30" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 17h1c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10V5.5C18 4.1 16.9 3 15.5 3h-8C6.1 3 5 4.1 5 5.5V10l-1.5 1.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h1c0 1.7 1.3 3 3 3s3-1.3 3-3h4c0 1.7 1.3 3 3 3s3-1.3 3-3zm-12 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm10 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                  </svg>
                </div>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={tractor.status} type="tractor" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{tractor.name}</h3>
                    <p className="text-sm text-slate-500">{tractor.type}</p>
                  </div>
                  {tractor.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <StarSolid className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-slate-700">{tractor.rating}</span>
                    </div>
                  )}
                </div>

                <div className="mb-3 space-y-1 text-sm text-slate-500">
                  <p>Propriétaire: {tractor.ownerName}</p>
                  <p>Localisation: {tractor.location}</p>
                  <p>Réservations: {tractor.totalBookings}</p>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(tractor.pricePerDay)}
                  </span>
                  <span className="text-sm text-slate-500">/jour</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {tractor.status === 'pending_approval' ? (
                    <>
                      <button
                        onClick={() => handleApprove(tractor)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReject(tractor)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
                      >
                        <XCircleIcon className="h-4 w-4" />
                        Rejeter
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleView(tractor)}
                        className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <EyeIcon className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(tractor)}
                        className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <PencilIcon className="mx-auto h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(tractor)}
                        className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="mx-auto h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTractors.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
            Aucun tracteur trouvé
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <TractorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        tractor={selectedTractor}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && tractorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Confirmer la suppression</h2>
            </div>
            <p className="mb-6 text-slate-600">
              Êtes-vous sûr de vouloir supprimer le tracteur <strong>{tractorToDelete.name}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedTractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Détails du tracteur</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                  <TruckIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedTractor.name}</h3>
                  <p className="text-sm text-slate-500">{selectedTractor.type}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Propriétaire</p>
                  <p className="font-medium text-slate-900">{selectedTractor.ownerName}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Localisation</p>
                  <p className="font-medium text-slate-900">{selectedTractor.location}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Prix par jour</p>
                  <p className="font-medium text-green-600">{formatPrice(selectedTractor.pricePerDay)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Statut</p>
                  <StatusBadge status={selectedTractor.status} type="tractor" />
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Évaluation</p>
                  <div className="flex items-center gap-1">
                    <StarSolid className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium text-slate-900">
                      {selectedTractor.rating > 0 ? selectedTractor.rating : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total réservations</p>
                  <p className="font-medium text-slate-900">{selectedTractor.totalBookings}</p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Date d'ajout</p>
                <p className="font-medium text-slate-900">
                  {new Date(selectedTractor.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedTractor);
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <PencilIcon className="h-4 w-4" />
                Modifier
              </button>
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
    </>
  );
}
