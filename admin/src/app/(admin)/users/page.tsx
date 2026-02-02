'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import UserModal from '@/components/UserModal';
import { users as initialUsers, User, addUser, updateUser, deleteUser } from '@/lib/mock-data';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const roleLabels: Record<string, string> = {
  client: 'Client',
  proprietaire: 'Propriétaire',
  admin: 'Admin',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<User | null>(null);

  // Sync with mock data
  useEffect(() => {
    setUsers([...initialUsers]);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    setModalMode('add');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData: Partial<User>) => {
    if (modalMode === 'add') {
      const newUser = addUser(userData as Omit<User, 'id' | 'createdAt'>);
      setUsers([...initialUsers]);
    } else if (selectedUser) {
      updateUser(selectedUser.id, userData);
      setUsers([...initialUsers]);
    }
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id);
    setUsers([...initialUsers]);
    setShowDeleteConfirm(null);
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUser(user.id, { status: newStatus });
    setUsers([...initialUsers]);
  };

  return (
    <>
      <Header
        title="Utilisateurs"
        subtitle={`${users.length} utilisateurs enregistrés`}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <p className="text-2xl font-bold text-blue-700">
              {users.filter(u => u.role === 'client').length}
            </p>
            <p className="text-sm text-blue-600">Clients</p>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <p className="text-2xl font-bold text-green-700">
              {users.filter(u => u.role === 'proprietaire').length}
            </p>
            <p className="text-sm text-green-600">Propriétaires</p>
          </div>
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-2xl font-bold text-yellow-700">
              {users.filter(u => u.status === 'pending').length}
            </p>
            <p className="text-sm text-yellow-600">En attente</p>
          </div>
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-2xl font-bold text-red-700">
              {users.filter(u => u.status === 'inactive').length}
            </p>
            <p className="text-sm text-red-600">Inactifs</p>
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

          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter un utilisateur
          </button>
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
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                          user.role === 'proprietaire'
                            ? 'bg-green-100 text-green-700'
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
                      {user.role === 'proprietaire' && user.nombreTracteurs && (
                        <p className="mt-1 text-xs text-slate-500">
                          {user.nombreTracteurs} tracteur{user.nombreTracteurs > 1 ? 's' : ''}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className="group"
                      >
                        <StatusBadge status={user.status} type="user" />
                      </button>
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
                        <button
                          onClick={() => handleEditUser(user)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="Supprimer"
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

          {filteredUsers.length === 0 && (
            <div className="flex h-32 items-center justify-center text-slate-400">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative rounded-2xl bg-white p-6 shadow-xl mx-4 max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Supprimer l&apos;utilisateur</h3>
                <p className="text-sm text-slate-500">Cette action est irréversible</p>
              </div>
            </div>
            <p className="mb-6 text-slate-600">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses données seront perdues.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
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
                  <StatusBadge status={showUserDetails.status} type="user" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Inscrit le</p>
                  <p className="font-medium text-slate-900">
                    {new Date(showUserDetails.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {showUserDetails.role === 'proprietaire' && (
                <div>
                  <p className="text-xs text-slate-500 uppercase">Nombre de tracteurs</p>
                  <p className="font-medium text-slate-900">{showUserDetails.nombreTracteurs || 0}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowUserDetails(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowUserDetails(null);
                  handleEditUser(showUserDetails);
                }}
                className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
