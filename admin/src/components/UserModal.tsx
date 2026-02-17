'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CameraIcon, PhotoIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { User } from '@/lib/api';

interface TractorPhoto {
  id: string;
  name: string;
  image: string | null;
}

interface UserFormData extends Partial<User> {
  status?: 'active' | 'inactive';
  nombreTracteurs?: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { tractors?: TractorPhoto[] }) => void;
  user?: User | null;
  mode: 'add' | 'edit';
}

export default function UserModal({ isOpen, onClose, onSave, user, mode }: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    role: 'client',
    status: 'active',
    adresse: '',
    region: '',
    coordinates: undefined,
    nombreTracteurs: 1,
  });

  const [tractorPhotos, setTractorPhotos] = useState<TractorPhoto[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Initialize tractor photos based on nombreTracteurs
  useEffect(() => {
    if (formData.role === 'proprietaire' && formData.nombreTracteurs) {
      const count = formData.nombreTracteurs;
      setTractorPhotos(prev => {
        // Keep existing photos if count increased, remove extras if decreased
        if (prev.length < count) {
          const newPhotos = [...prev];
          for (let i = prev.length; i < count; i++) {
            newPhotos.push({
              id: `tractor_${Date.now()}_${i}`,
              name: `Tracteur ${i + 1}`,
              image: null,
            });
          }
          return newPhotos;
        } else if (prev.length > count) {
          return prev.slice(0, count);
        }
        return prev;
      });
    } else {
      setTractorPhotos([]);
    }
  }, [formData.nombreTracteurs, formData.role]);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        status: user.isActive ? 'active' : 'inactive',
        adresse: user.adresse || '',
        region: user.region || '',
        coordinates: user.coordinates,
        nombreTracteurs: 1,
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        role: 'client',
        status: 'active',
        adresse: '',
        nombreTracteurs: 1,
      });
      setTractorPhotos([]);
    }
  }, [user, mode, isOpen]);

  const handleFileChange = (tractorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTractorPhotos(prev =>
          prev.map(t =>
            t.id === tractorId ? { ...t, image: reader.result as string } : t
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTractorNameChange = (tractorId: string, name: string) => {
    setTractorPhotos(prev =>
      prev.map(t =>
        t.id === tractorId ? { ...t, name } : t
      )
    );
  };

  const handleRemovePhoto = (tractorId: string) => {
    setTractorPhotos(prev =>
      prev.map(t =>
        t.id === tractorId ? { ...t, image: null } : t
      )
    );
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible d\'obtenir votre position. Veuillez vérifier les permissions de géolocalisation.');
        setIsLoadingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tractors: formData.role === 'proprietaire' ? tractorPhotos : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {mode === 'add' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Type d&apos;utilisateur *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  formData.role === 'client'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">👤</span>
                Client
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'proprietaire' })}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  formData.role === 'proprietaire'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">🚜</span>
                Propriétaire
              </button>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nom *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>

          {/* Telephone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Téléphone *
            </label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="+221 77 123 45 67"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>

          {/* Password (only for add mode) */}
          {mode === 'add' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mot de passe *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required={mode === 'add'}
                minLength={6}
              />
              <p className="mt-1 text-xs text-slate-500">Minimum 6 caractères</p>
            </div>
          )}

          {/* Propriétaire-specific fields */}
          {formData.role === 'proprietaire' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="Ex: Rue 10, Quartier Liberté"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    required={formData.role === 'proprietaire'}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Région *
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    required={formData.role === 'proprietaire'}
                  >
                    <option value="">Sélectionner une région</option>
                    <option value="Dakar">Dakar</option>
                    <option value="Thiès">Thiès</option>
                    <option value="Diourbel">Diourbel</option>
                    <option value="Fatick">Fatick</option>
                    <option value="Kaolack">Kaolack</option>
                    <option value="Kaffrine">Kaffrine</option>
                    <option value="Kolda">Kolda</option>
                    <option value="Louga">Louga</option>
                    <option value="Matam">Matam</option>
                    <option value="Saint-Louis">Saint-Louis</option>
                    <option value="Sédhiou">Sédhiou</option>
                    <option value="Tambacounda">Tambacounda</option>
                    <option value="Kédougou">Kédougou</option>
                    <option value="Ziguinchor">Ziguinchor</option>
                  </select>
                </div>
              </div>

              {/* Géolocalisation */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">Position GPS</p>
                    </div>
                    {formData.coordinates?.latitude && formData.coordinates?.longitude ? (
                      <div className="space-y-1">
                        <p className="text-xs text-blue-700">
                          ✓ Position enregistrée
                        </p>
                        <p className="text-xs text-blue-600 font-mono">
                          {formData.coordinates.latitude.toFixed(6)}, {formData.coordinates.longitude.toFixed(6)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-blue-700">
                        Activez votre géolocalisation pour enregistrer votre position exacte
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLoadingLocation}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingLocation ? 'Localisation...' : formData.coordinates?.latitude ? 'Actualiser' : 'Obtenir ma position'}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre de tracteurs
                </label>
                <input
                  type="number"
                  value={formData.nombreTracteurs}
                  onChange={(e) => setFormData({ ...formData, nombreTracteurs: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="50"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              {/* Tractor Photos Section */}
              {tractorPhotos.length > 0 && (
                <div className="mt-6">
                  <label className="mb-3 block text-sm font-medium text-slate-700">
                    Photos des tracteurs (optionnel)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tractorPhotos.map((tractor, index) => (
                      <div
                        key={tractor.id}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                      >
                        {/* Tractor Name */}
                        <input
                          type="text"
                          value={tractor.name}
                          onChange={(e) => handleTractorNameChange(tractor.id, e.target.value)}
                          placeholder={`Tracteur ${index + 1}`}
                          className="w-full mb-3 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />

                        {/* Photo Upload Area */}
                        <div className="relative">
                          {tractor.image ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-200">
                              <img
                                src={tractor.image}
                                alt={tractor.name}
                                className="w-full h-full object-cover"
                              />
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(tractor.id)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                              {/* Change photo button */}
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[tractor.id]?.click()}
                                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-slate-700 rounded-lg hover:bg-white transition-colors text-xs font-medium shadow-lg"
                              >
                                <CameraIcon className="h-4 w-4" />
                                Changer
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[tractor.id]?.click()}
                              className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer"
                            >
                              <PhotoIcon className="h-8 w-8 text-slate-400" />
                              <span className="text-xs text-slate-500">Cliquez pour ajouter</span>
                            </button>
                          )}

                          {/* Hidden file input */}
                          <input
                            ref={(el) => { fileInputRefs.current[tractor.id] = el; }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(tractor.id, e)}
                            className="hidden"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Les photos sont optionnelles. Vous pourrez les ajouter plus tard.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
            >
              {mode === 'add' ? 'Ajouter' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
