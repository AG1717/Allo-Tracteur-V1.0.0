'use client';

import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Payment } from '@/lib/api';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onConfirm: (amount: number, reason: string) => void;
}

export default function RefundModal({ isOpen, onClose, payment, onConfirm }: RefundModalProps) {
  const [amount, setAmount] = useState(payment?.amount || 0);
  const [reason, setReason] = useState('');
  const [isPartialRefund, setIsPartialRefund] = useState(false);

  if (!isOpen || !payment) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(isPartialRefund ? amount : payment.amount, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Rembourser le paiement</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info paiement */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Référence:</span>
                <span className="font-medium text-slate-900">{payment.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Montant:</span>
                <span className="font-bold text-slate-900">{formatPrice(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Client:</span>
                <span className="font-medium text-slate-900">
                  {payment.payer?.prenom} {payment.payer?.nom}
                </span>
              </div>
            </div>
          </div>

          {/* Type de remboursement */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={isPartialRefund}
                onChange={(e) => setIsPartialRefund(e.target.checked)}
                className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-slate-700">Remboursement partiel</span>
            </label>
          </div>

          {/* Montant */}
          {isPartialRefund && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Montant du remboursement (FCFA) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={payment.amount}
                min={1}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Maximum: {formatPrice(payment.amount)}
              </p>
            </div>
          )}

          {/* Raison */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Raison du remboursement *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Annulation de la réservation par le client"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              rows={3}
              required
            />
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
            <p className="text-sm text-orange-800">
              <strong>Attention:</strong> Cette action est irréversible. Le client sera remboursé de{' '}
              <strong>{formatPrice(isPartialRefund ? amount : payment.amount)}</strong> et la réservation sera annulée.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Confirmer le remboursement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
