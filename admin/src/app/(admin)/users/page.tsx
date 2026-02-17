'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import UserModal from '@/components/UserModal';
import { getAllUsers, verifyUser, updateUserStatus, createUser, deleteUser, type User } from '@/lib/api';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const roleLabels: Record<string, string> = {
  client: 'Client',
  proprietaire: 'Propriétaire',
  admin: 'Admin',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUserDetails, setShowUserDetails] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = user.isActive && user.isVerified;
    } else if (statusFilter === 'inactive') {
      matchesStatus = !user.isActive;
    } else if (statusFilter === 'pending') {
      matchesStatus = user.isActive && !user.isVerified;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleVerifyUser = async (userId: string) => {
    try {
      await verifyUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await updateUserStatus(user._id, !user.isActive);
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (modalMode === 'add') {
        await createUser({
          nom: userData.nom!,
          prenom: userData.prenom!,
          email: userData.email!,
          telephone: userData.telephone!,
          password: userData.password!,
          role: userData.role as 'client' | 'proprietaire',
          adresse: userData.adresse,
          region: userData.region,
        });
      }
      await loadUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      await loadUsers();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const getStatusForBadge = (user: User): 'active' | 'inactive' | 'pending' => {
    if (!user.isActive) return 'inactive';
    if (!user.isVerified) return 'pending';
    return 'active';
  };

  const totalClients = users.filter(u => u.role === 'client').length;
  const totalOwners = users.filter(u => u.role === 'proprietaire').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const pendingUsers = users.filter(u => u.isActive && !u.isVerified).length;

  if (loading) {
    return (
      <>
        <Header
          title="Utilisateurs"
          subtitle="Chargement..."
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-green-500"></div>
              <p className="text-slate-500">Chargement des utilisateurs...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Utilisateurs"
        subtitle={`${users.length} utilisateurs enregistrés`}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-2xl font-bold text-slate-700">
              {users.length}
            </p>
            <p className="text-sm text-slate-600">Total</p>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <p className="text-2xl font-bold text-blue-700">
              {totalClients}
            </p>
            <p className="text-sm text-blue-600">Clients</p>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <p className="text-2xl font-bold text-green-700">
              {totalOwners}
            </p>
            <p className="text-sm text-green-600">Propriétaires</p>
          </div>
          <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
            <p className="text-2xl font-bold text-purple-700">
              {totalAdmins}
            </p>
            <p className="text-sm text-purple-600">Admins</p>
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
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="proprietaire">Propriétaires</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="pending">En attente</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Ajouter un utilisateur
            </button>
            <button
              onClick={loadUsers}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
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
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Inscrit le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                          user.role === 'proprietaire'
                            ? 'bg-green-100 text-green-700'
                            : user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.prenom[0]}{user.nom[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.prenom} {user.nom}
                          </p>
                          {user.adresse && (
                            <p className="text-sm text-slate-500">{user.adresse}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{user.email}</p>
                      <p className="text-sm text-slate-500">{user.telephone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === 'proprietaire'
                          ? 'bg-green-100 text-green-800'
                          : user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={getStatusForBadge(user)} type="user" />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowUserDetails(user)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          title="Voir détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {!user.isVerified && user.isActive && (
                          <button
                            onClick={() => handleVerifyUser(user._id)}
                            className="rounded-lg p-2 text-green-400 hover:bg-green-100 hover:text-green-600 transition-colors"
                            title="Vérifier l'utilisateur"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`rounded-lg p-2 transition-colors ${
                            user.isActive
                              ? 'text-red-400 hover:bg-red-100 hover:text-red-600'
                              : 'text-green-400 hover:bg-green-100 hover:text-green-600'
                          }`}
                          title={user.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {user.isActive ? (
                            <XCircleIcon className="h-5 w-5" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5" />
                          )}
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => setDeleteConfirm(user._id)}
                            className="rounded-lg p-2 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                            title="Supprimer l'utilisateur"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="flex h-32 items-center justify-center text-slate-400">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </main>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        mode={modalMode}
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
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUserDetails(null)} />
          <div className="relative rounded-2xl bg-white p-6 shadow-xl mx-4 max-w-lg w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${
                showUserDetails.role === 'proprietaire'
                  ? 'bg-green-100 text-green-700'
                  : showUserDetails.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {showUserDetails.prenom[0]}{showUserDetails.nom[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {showUserDetails.prenom} {showUserDetails.nom}
                </h3>
                <p className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  showUserDetails.role === 'proprietaire'
                    ? 'bg-green-100 text-green-800'
                    : showUserDetails.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {roleLabels[showUserDetails.role]}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Email</p>
                  <p className="font-medium text-slate-900">{showUserDetails.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Téléphone</p>
                  <p className="font-medium text-slate-900">{showUserDetails.telephone}</p>
                </div>
              </div>

              {showUserDetails.adresse && (
                <div>
                  <p className="text-xs text-slate-500 uppercase">Adresse</p>
                  <p className="font-medium text-slate-900">{showUserDetails.adresse}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Statut</p>
                  <StatusBadge status={getStatusForBadge(showUserDetails)} type="user" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Inscrit le</p>
                  <p className="font-medium text-slate-900">
                    {new Date(showUserDetails.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Vérifié</p>
                  <p className="font-medium text-slate-900">
                    {showUserDetails.isVerified ? 'Oui' : 'Non'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Actif</p>
                  <p className="font-medium text-slate-900">
                    {showUserDetails.isActive ? 'Oui' : 'Non'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowUserDetails(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Fermer
              </button>
              {!showUserDetails.isVerified && showUserDetails.isActive && (
                <button
                  onClick={() => {
                    handleVerifyUser(showUserDetails._id);
                    setShowUserDetails(null);
                  }}
                  className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  Vérifier
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
