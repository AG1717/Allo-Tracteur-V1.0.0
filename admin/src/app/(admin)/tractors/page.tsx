'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import TractorModal from '@/components/TractorModal';
import { getAllTractors, approveTractor, rejectTractor, updateTractorStatus, createTractor, deleteTractor, uploadTractorImages, type Tractor } from '@/lib/api';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  ClockIcon,
  BanknotesIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function TractorsPage() {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTractor, setSelectedTractor] = useState<Tractor | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [tractorToAction, setTractorToAction] = useState<Tractor | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isTractorModalOpen, setIsTractorModalOpen] = useState(false);
  const [tractorModalMode, setTractorModalMode] = useState<'add' | 'edit'>('add');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Charger les tracteurs
  useEffect(() => {
    loadTractors();
  }, []);

  const loadTractors = async () => {
    try {
      setLoading(true);
      const data = await getAllTractors();
      setTractors(data);
    } catch (error) {
      console.error('Erreur chargement tracteurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTractors = tractors.filter((tractor) => {
    const nom = tractor.nom || '';
    const ownerName = `${tractor.owner?.prenom || ''} ${tractor.owner?.nom || ''}`.trim();
    const location = tractor.localisation?.ville || '';

    const matchesSearch =
      nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && tractor.isApproved && tractor.isActive) ||
      (statusFilter === 'pending' && !tractor.isApproved) ||
      (statusFilter === 'inactive' && !tractor.isActive);

    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  // Stats
  const totalTractors = tractors.length;
  const approvedTractors = tractors.filter(t => t.isApproved && t.isActive).length;
  const pendingTractors = tractors.filter(t => !t.isApproved && t.isActive).length;
  const inactiveTractors = tractors.filter(t => !t.isActive).length;

  // Handlers
  const handleView = (tractor: Tractor) => {
    setSelectedTractor(tractor);
    setIsViewModalOpen(true);
  };

  const handleApproveClick = (tractor: Tractor) => {
    setTractorToAction(tractor);
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (tractor: Tractor) => {
    setTractorToAction(tractor);
    setIsRejectModalOpen(true);
  };

  const handleApprove = async () => {
    if (!tractorToAction) return;

    try {
      setActionLoading(true);
      await approveTractor(tractorToAction._id);
      await loadTractors();
      setIsApproveModalOpen(false);
      setTractorToAction(null);
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!tractorToAction) return;

    try {
      setActionLoading(true);
      await rejectTractor(tractorToAction._id);
      await loadTractors();
      setIsRejectModalOpen(false);
      setTractorToAction(null);
    } catch (error) {
      console.error('Erreur rejet:', error);
      alert('Erreur lors du rejet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (tractor: Tractor) => {
    try {
      await updateTractorStatus(tractor._id, !tractor.isActive);
      await loadTractors();
    } catch (error) {
      console.error('Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const handleAddTractor = () => {
    setSelectedTractor(null);
    setTractorModalMode('add');
    setIsTractorModalOpen(true);
  };

  const handleSaveTractor = async (tractorData: any) => {
    try {
      const { _pendingFiles, ...data } = tractorData;

      if (tractorModalMode === 'add') {
        const result = await createTractor(data);

        // Upload des images si des fichiers ont été sélectionnés
        if (_pendingFiles && _pendingFiles.length > 0 && result?.data?._id) {
          try {
            await uploadTractorImages(result.data._id, _pendingFiles);
          } catch (uploadError) {
            console.error('Erreur upload images:', uploadError);
            alert('Tracteur créé mais certaines images n\'ont pas pu être uploadées.');
          }
        }
      }
      await loadTractors();
      setIsTractorModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du tracteur');
    }
  };

  const handleDeleteTractor = async (tractorId: string) => {
    try {
      await deleteTractor(tractorId);
      await loadTractors();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(error.message || 'Erreur lors de la suppression du tracteur');
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Tracteurs" subtitle="Chargement..." />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-2 text-slate-600">Chargement des tracteurs...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Tracteurs"
        subtitle={`${totalTractors} tracteurs au total`}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <TruckIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{totalTractors}</p>
                <p className="text-sm text-blue-600">Total</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{approvedTractors}</p>
                <p className="text-sm text-green-600">Approuvés</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{pendingTractors}</p>
                <p className="text-sm text-yellow-600">En attente</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <XCircleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{inactiveTractors}</p>
                <p className="text-sm text-red-600">Inactifs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="approved">Approuvés</option>
            <option value="pending">En attente</option>
            <option value="inactive">Inactifs</option>
          </select>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddTractor}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Ajouter un tracteur
            </button>
            <button
              onClick={loadTractors}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tracteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Propriétaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Prix/ha
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
                {filteredTractors.map((tractor) => (
                  <tr key={tractor._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{tractor.nom}</p>
                        <p className="text-sm text-slate-500">{tractor.marque} {tractor.modele}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">
                        {tractor.owner?.prenom} {tractor.owner?.nom}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPinIcon className="h-4 w-4 text-slate-400" />
                        <span>{tractor.localisation?.ville || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-green-600">{formatPrice(tractor.prixParHectare)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {tractor.isApproved ? (
                          <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Approuvé
                          </span>
                        ) : (
                          <span className="inline-flex w-fit items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            En attente
                          </span>
                        )}
                        {!tractor.isActive && (
                          <span className="inline-flex w-fit items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Inactif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(tractor)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          title="Voir détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {!tractor.isApproved && tractor.isActive && (
                          <>
                            <button
                              onClick={() => handleApproveClick(tractor)}
                              className="rounded-lg p-2 text-green-500 hover:bg-green-100 transition-colors"
                              title="Approuver"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRejectClick(tractor)}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-100 transition-colors"
                              title="Rejeter"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(tractor._id)}
                          className="rounded-lg p-2 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="Supprimer le tracteur"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTractors.length === 0 && (
            <div className="flex h-32 items-center justify-center text-slate-400">
              Aucun tracteur trouvé
            </div>
          )}
        </div>
      </main>

      {/* Tractor Modal */}
      <TractorModal
        isOpen={isTractorModalOpen}
        onClose={() => setIsTractorModalOpen(false)}
        onSave={handleSaveTractor}
        tractor={selectedTractor}
        mode={tractorModalMode}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative rounded-2xl bg-white p-6 shadow-xl mx-4 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce tracteur ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteTractor(deleteConfirm)}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedTractor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Détails du tracteur</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                  <TruckIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{selectedTractor.nom}</h3>
                  <p className="text-sm text-slate-500">{selectedTractor.marque} {selectedTractor.modele} - {selectedTractor.annee}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {selectedTractor.isApproved ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      Approuvé
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                      En attente
                    </span>
                  )}
                  {!selectedTractor.isActive && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                      Inactif
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BanknotesIcon className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-700">Tarification</p>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {formatPrice(selectedTractor.prixParHectare)}/hectare
                </p>
              </div>

              {/* Owner */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">Propriétaire</p>
                </div>
                <p className="font-medium text-slate-900">
                  {selectedTractor.owner?.prenom} {selectedTractor.owner?.nom}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedTractor.owner?.telephone}
                </p>
              </div>

              {/* Location */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="h-5 w-5 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">Localisation</p>
                </div>
                <p className="text-slate-900">
                  {selectedTractor.localisation?.adresse}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedTractor.localisation?.ville}, {selectedTractor.localisation?.region}
                </p>
              </div>

              {/* Images */}
              {selectedTractor.images && selectedTractor.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-3">Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedTractor.images.slice(0, 6).map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={image}
                          alt={`Tracteur ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!selectedTractor.isApproved && selectedTractor.isActive && (
                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleApproveClick(selectedTractor);
                    }}
                    className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleRejectClick(selectedTractor);
                    }}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    Rejeter
                  </button>
                </div>
              )}

              {selectedTractor.isApproved && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      handleToggleActive(selectedTractor);
                      setIsViewModalOpen(false);
                    }}
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
                      selectedTractor.isActive
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {selectedTractor.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {isApproveModalOpen && tractorToAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Approuver le tracteur</h2>
            </div>
            <p className="mb-6 text-slate-600">
              Voulez-vous approuver le tracteur <strong>{tractorToAction.nom}</strong> de{' '}
              <strong>{tractorToAction.owner?.prenom} {tractorToAction.owner?.nom}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                disabled={actionLoading}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
              >
                {actionLoading ? 'Traitement...' : 'Approuver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && tractorToAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Rejeter le tracteur</h2>
            </div>
            <p className="mb-6 text-slate-600">
              Êtes-vous sûr de vouloir rejeter le tracteur <strong>{tractorToAction.nom}</strong> ?
              Il sera désactivé.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                disabled={actionLoading}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? 'Traitement...' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
