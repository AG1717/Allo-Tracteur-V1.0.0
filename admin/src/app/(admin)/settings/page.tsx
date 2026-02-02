'use client';

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Profile state
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
  });

  // Security state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    language: 'fr',
    timezone: 'Africa/Dakar',
    currency: 'XOF',
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    newBookings: true,
    newUsers: true,
    pendingTractors: false,
    weeklyReports: false,
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: UserCircleIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Sécurité', icon: ShieldCheckIcon },
    { id: 'billing', label: 'Facturation', icon: CreditCardIcon },
    { id: 'general', label: 'Général', icon: GlobeAltIcon },
  ];

  // Toast functions
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Profile handlers
  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'Le fichier est trop volumineux. Maximum 2MB.');
        return;
      }
      showToast('success', 'Photo de profil mise à jour avec succès!');
    }
  };

  const handleSaveProfile = () => {
    if (!profileData.prenom || !profileData.nom || !profileData.email) {
      showToast('error', 'Veuillez remplir tous les champs.');
      return;
    }
    showToast('success', 'Profil sauvegardé avec succès!');
  };

  // Security handlers
  const handleUpdatePassword = () => {
    if (!passwordData.currentPassword) {
      showToast('error', 'Veuillez entrer votre mot de passe actuel.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('error', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('success', 'Mot de passe mis à jour avec succès!');
  };

  // General handlers
  const handleSaveGeneral = () => {
    showToast('success', 'Paramètres généraux sauvegardés!');
  };

  return (
    <>
      <Header
        title="Paramètres"
        subtitle="Gérez les paramètres de votre compte"
      />

      {/* Toast notifications */}
      <div className="fixed top-20 right-6 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white animate-slide-in`}
          >
            {toast.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <XCircleIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="mb-6 text-lg font-semibold text-slate-900">Informations du profil</h2>

                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
                    {profileData.prenom?.[0]}{profileData.nom?.[0]}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileSelected}
                      className="hidden"
                    />
                    <button
                      onClick={handlePhotoChange}
                      className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                    >
                      Changer la photo
                    </button>
                    <p className="mt-2 text-xs text-slate-500">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={profileData.prenom}
                      onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={profileData.nom}
                      onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="mb-6 text-lg font-semibold text-slate-900">Préférences de notifications</h2>

                <div className="space-y-4">
                  {[
                    { key: 'newBookings', label: 'Nouvelles réservations', description: 'Recevoir une notification pour chaque nouvelle réservation' },
                    { key: 'newUsers', label: 'Nouveaux utilisateurs', description: 'Être notifié quand un nouvel utilisateur s\'inscrit' },
                    { key: 'pendingTractors', label: 'Tracteurs en attente', description: 'Notification pour les tracteurs à approuver' },
                    { key: 'weeklyReports', label: 'Rapports hebdomadaires', description: 'Recevoir un résumé chaque semaine' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                          onChange={(e) => {
                            setNotificationSettings({
                              ...notificationSettings,
                              [item.key]: e.target.checked,
                            });
                            showToast('success', `Notification "${item.label}" ${e.target.checked ? 'activée' : 'désactivée'}`);
                          }}
                          className="peer sr-only"
                        />
                        <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-500 peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="mb-6 text-lg font-semibold text-slate-900">Sécurité du compte</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 font-medium text-slate-900">Changer le mot de passe</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Mot de passe actuel
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Confirmer le mot de passe
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <button
                        onClick={handleUpdatePassword}
                        className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                      >
                        Mettre à jour
                      </button>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div>
                    <h3 className="mb-4 font-medium text-slate-900">Sessions actives</h3>
                    <div className="rounded-lg border border-slate-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">Session actuelle</p>
                          <p className="text-sm text-slate-500">Chrome sur Windows - Dakar, Sénégal</p>
                        </div>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="mb-6 text-lg font-semibold text-slate-900">Facturation</h2>
                <div className="flex h-32 items-center justify-center text-slate-400">
                  Fonctionnalité à venir
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                <h2 className="mb-6 text-lg font-semibold text-slate-900">Paramètres généraux</h2>

                <div className="space-y-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Langue
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                      className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Fuseau horaire
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="Africa/Dakar">Africa/Dakar (GMT+0)</option>
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Devise
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                      className="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="XOF">FCFA (XOF)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveGeneral}
                    className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
