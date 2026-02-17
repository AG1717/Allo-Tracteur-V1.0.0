'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Tractor, User, getAllUsers } from '@/lib/api';

interface TractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tractorData: any) => void;
  tractor?: Tractor | null;
  mode: 'add' | 'edit';
}

export default function TractorModal({ isOpen, onClose, onSave, tractor, mode }: TractorModalProps) {
  const [owners, setOwners] = useState<User[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    nom: '',
    marque: '',
    modele: '',
    annee: new Date().getFullYear(),
    puissance: 0,
    description: '',
    prixParHectare: 0,
    owner: '',
    adresse: '',
    ville: '',
    region: '',
    equipements: [] as string[],
    etat: 'bon' as 'neuf' | 'bon' | 'moyen' | 'a_renover',
  });

  useEffect(() => {
    const loadOwners = async () => {
      try {
        const users = await getAllUsers();
        setOwners(users.filter(u => u.role === 'proprietaire'));
      } catch (error) {
        console.error('Erreur chargement propriétaires:', error);
      }
    };
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen]);

  useEffect(() => {
    if (tractor && mode === 'edit') {
      setFormData({
        nom: tractor.nom || '',
        marque: tractor.marque || '',
        modele: tractor.modele || '',
        annee: tractor.annee || new Date().getFullYear(),
        puissance: 0,
        description: '',
        prixParHectare: tractor.prixParHectare || 0,
        owner: tractor.owner?._id || '',
        adresse: tractor.localisation?.adresse || '',
        ville: tractor.localisation?.ville || '',
        region: tractor.localisation?.region || '',
        equipements: [],
        etat: 'bon',
      });
    } else {
      setFormData({
        nom: '',
        marque: '',
        modele: '',
        annee: new Date().getFullYear(),
        puissance: 0,
        description: '',
        prixParHectare: 0,
        owner: '',
        adresse: '',
        ville: '',
        region: '',
        equipements: [],
        etat: 'bon',
      });
    }
    setSelectedFiles([]);
    setPreviews([]);
  }, [tractor, mode, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - selectedFiles.length;
    const newFiles = files.slice(0, remaining);

    setSelectedFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tractorData = {
      nom: formData.nom,
      marque: formData.marque,
      modele: formData.modele,
      annee: formData.annee,
      puissance: formData.puissance,
      description: formData.description,
      prixParHectare: formData.prixParHectare,
      owner: formData.owner,
      localisation: {
        adresse: formData.adresse,
        ville: formData.ville,
        region: formData.region,
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
      equipements: formData.equipements,
      etat: formData.etat,
    };

    onSave({ ...tractorData, _pendingFiles: selectedFiles });
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
          {/* Nom du tracteur */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nom du tracteur *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Ex: Tracteur John Deere"
              required
            />
          </div>

          {/* Marque et Modèle */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Marque *
              </label>
              <input
                type="text"
                value={formData.marque}
                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Ex: John Deere"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Modèle *
              </label>
              <input
                type="text"
                value={formData.modele}
                onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Ex: 5075E"
                required
              />
            </div>
          </div>

          {/* Année et Puissance */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Année *
              </label>
              <input
                type="number"
                value={formData.annee}
                onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="2024"
                min="1950"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Puissance (CV)
              </label>
              <input
                type="number"
                value={formData.puissance}
                onChange={(e) => setFormData({ ...formData, puissance: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="75"
                min="0"
              />
            </div>
          </div>

          {/* Prix par hectare */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Prix par hectare (FCFA) *
            </label>
            <input
              type="number"
              value={formData.prixParHectare}
              onChange={(e) => setFormData({ ...formData, prixParHectare: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="15000"
              min="0"
              required
            />
          </div>

          {/* Propriétaire */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Propriétaire *
            </label>
            <select
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            >
              <option value="">Sélectionner un propriétaire</option>
              {owners.map((owner) => (
                <option key={owner._id} value={owner._id}>
                  {owner.prenom} {owner.nom} - {owner.telephone}
                </option>
              ))}
            </select>
          </div>

          {/* Localisation */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Adresse *
            </label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Ex: Route de Rufisque"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Ville *
              </label>
              <input
                type="text"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Ex: Dakar"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Région *
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Ex: Dakar"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Description du tracteur..."
              rows={3}
            />
          </div>

          {/* État */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              État
            </label>
            <select
              value={formData.etat}
              onChange={(e) => setFormData({ ...formData, etat: e.target.value as any })}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="neuf">Neuf</option>
              <option value="bon">Bon</option>
              <option value="moyen">Moyen</option>
              <option value="a_renover">À rénover</option>
            </select>
          </div>

          {/* Photos */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Photos ({selectedFiles.length}/5)
            </label>

            {previews.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {previews.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={src}
                      alt={`Photo ${index + 1}`}
                      className="h-20 w-20 rounded-lg object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Principale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 hover:border-green-400 hover:text-green-600 transition-colors"
              >
                <PhotoIcon className="h-5 w-5" />
                Ajouter des photos
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
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
