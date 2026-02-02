'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CameraIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Tractor, users } from '@/lib/mock-data';

interface TractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tractor: Partial<Tractor> & { image?: string | null }) => void;
  tractor?: Tractor | null;
  mode: 'add' | 'edit';
}

export default function TractorModal({ isOpen, onClose, onSave, tractor, mode }: TractorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Labour',
    ownerId: '',
    ownerName: '',
    pricePerDay: 0,
    location: '',
    status: 'pending_approval' as Tractor['status'],
    rating: 0,
    totalBookings: 0,
    image: null as string | null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const owners = users.filter(u => u.role === 'proprietaire');

  const tractorTypes = [
    'Labour',
    'Semis',
    'Récolte',
    'Transport',
    'Polyvalent',
    'Irrigation',
  ];

  useEffect(() => {
    if (tractor && mode === 'edit') {
      setFormData({
        name: tractor.name,
        type: tractor.type,
        ownerId: tractor.ownerId,
        ownerName: tractor.ownerName,
        pricePerDay: tractor.pricePerDay,
        location: tractor.location,
        status: tractor.status,
        rating: tractor.rating,
        totalBookings: tractor.totalBookings,
        image: tractor.image || null,
      });
    } else {
      setFormData({
        name: '',
        type: 'Labour',
        ownerId: '',
        ownerName: '',
        pricePerDay: 0,
        location: '',
        status: 'pending_approval',
        rating: 0,
        totalBookings: 0,
        image: null,
      });
    }
  }, [tractor, mode, isOpen]);

  const handleOwnerChange = (ownerId: string) => {
    const owner = owners.find(o => o.id === ownerId);
    setFormData({
      ...formData,
      ownerId,
      ownerName: owner ? `${owner.prenom} ${owner.nom}` : '',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, image: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {mode === 'add' ? 'Ajouter un tracteur' : 'Modifier le tracteur'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo du tracteur */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Photo du tracteur
            </label>
            <div className="relative">
              {formData.image ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={formData.image}
                    alt="Tracteur"
                    className="w-full h-full object-cover"
                  />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  {/* Change photo button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-slate-700 rounded-lg hover:bg-white transition-colors text-xs font-medium shadow-lg"
                  >
                    <CameraIcon className="h-4 w-4" />
                    Changer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer"
                >
                  <PhotoIcon className="h-10 w-10 text-slate-400" />
                  <span className="text-sm text-slate-500">Cliquez pour ajouter une photo</span>
                  <span className="text-xs text-slate-400">JPG, PNG (max 5MB)</span>
                </button>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nom du tracteur *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Ex: John Deere 5075E"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              >
                {tractorTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Tractor['status'] })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              >
                <option value="pending_approval">En attente d'approbation</option>
                <option value="available">Disponible</option>
                <option value="rented">Loué</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Propriétaire *
            </label>
            <select
              value={formData.ownerId}
              onChange={(e) => handleOwnerChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            >
              <option value="">Sélectionner un propriétaire</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.prenom} {owner.nom} - {owner.telephone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Prix par jour (FCFA) *
              </label>
              <input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="45000"
                min="0"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Localisation *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Dakar"
                required
              />
            </div>
          </div>

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
              {mode === 'add' ? 'Ajouter' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
