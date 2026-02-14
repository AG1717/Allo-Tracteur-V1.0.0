'use client';

import { XMarkIcon, BanknotesIcon, UserIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Payment } from '@/lib/api';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onConfirm?: () => void;
  onFail?: () => void;
  onRefund?: () => void;
}

const methodConfig = {
  orange_money: { label: 'Orange Money', color: 'bg-orange-100 text-orange-800' },
  wave: { label: 'Wave', color: 'bg-blue-100 text-blue-800' },
  paydunya: { label: 'PayDunya', color: 'bg-indigo-100 text-indigo-800' },
  cash: { label: 'Espèces', color: 'bg-green-100 text-green-800' },
  bank_transfer: { label: 'Virement', color: 'bg-purple-100 text-purple-800' },
};

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'En traitement', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Complété', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Échoué', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Remboursé', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Annulé', color: 'bg-gray-100 text-gray-800' },
};

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  payment,
  onConfirm,
  onFail,
  onRefund
}: PaymentDetailsModalProps) {
  if (!isOpen || !payment) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Détails du paiement</h2>
            <p className="text-sm text-slate-500 mt-1">Référence: {payment.reference}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Statut et Méthode */}
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusConfig[payment.status]?.color}`}>
              {statusConfig[payment.status]?.label}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${methodConfig[payment.method]?.color}`}>
              {methodConfig[payment.method]?.label}
            </span>
          </div>

          {/* Montants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BanknotesIcon className="h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-700">Montant total</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{formatPrice(payment.amount)}</p>
            </div>

            <div className="rounded-xl bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BanknotesIcon className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-700">Revenu propriétaire</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatPrice(payment.ownerAmount)}</p>
            </div>

            <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BanknotesIcon className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-700">Commission</p>
              </div>
              <p className="text-2xl font-bold text-purple-900">{formatPrice(payment.platformFee)}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payeur */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="h-5 w-5 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">Payeur</p>
              </div>
              <p className="font-medium text-slate-900">{payment.payer?.prenom} {payment.payer?.nom}</p>
              <p className="text-sm text-slate-500 mt-1">{payment.payer?.email}</p>
              <p className="text-sm text-slate-500">{payment.payer?.telephone}</p>
            </div>

            {/* Bénéficiaire */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="h-5 w-5 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">Bénéficiaire</p>
              </div>
              <p className="font-medium text-slate-900">{payment.recipient?.prenom} {payment.recipient?.nom}</p>
              <p className="text-sm text-slate-500 mt-1">{payment.recipient?.email}</p>
              <p className="text-sm text-slate-500">{payment.recipient?.telephone}</p>
            </div>
          </div>

          {/* Réservation associée */}
          {payment.booking && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600 mb-3">Réservation associée</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Référence:</span>
                  <span className="text-sm font-medium text-slate-900">{payment.booking.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Tracteur:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {payment.booking.tractor?.marque} {payment.booking.tractor?.modele}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Hectares:</span>
                  <span className="text-sm font-medium text-slate-900">{payment.booking.nombreHectares} ha</span>
                </div>
              </div>
            </div>
          )}

          {/* Données du provider */}
          {payment.providerData && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600 mb-3">Données du provider</p>
              <div className="space-y-2">
                {payment.providerData.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Transaction ID:</span>
                    <span className="text-sm font-mono text-slate-900">{payment.providerData.transactionId}</span>
                  </div>
                )}
                {payment.providerData.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Téléphone:</span>
                    <span className="text-sm font-medium text-slate-900">{payment.providerData.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remboursement */}
          {payment.refund && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-700 mb-3">Informations de remboursement</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">Montant remboursé:</span>
                  <span className="text-sm font-bold text-red-900">{formatPrice(payment.refund.amount!)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">Raison:</span>
                  <span className="text-sm text-red-900">{payment.refund.reason}</span>
                </div>
                {payment.refund.refundReference && (
                  <div className="flex justify-between">
                    <span className="text-sm text-red-600">Référence:</span>
                    <span className="text-sm font-mono text-red-900">{payment.refund.refundReference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600 mb-3">Dates</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">Créé le:</span>
                <span className="text-sm font-medium text-slate-900">{formatDate(payment.createdAt)}</span>
              </div>
              {payment.completedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-slate-600">Complété le:</span>
                  <span className="text-sm font-medium text-slate-900">{formatDate(payment.completedAt.toString())}</span>
                </div>
              )}
              {payment.failedAt && (
                <div className="flex items-center gap-2">
                  <XCircleIcon className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-slate-600">Échoué le:</span>
                  <span className="text-sm font-medium text-slate-900">{formatDate(payment.failedAt.toString())}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
            >
              Fermer
            </button>

            {payment.status === 'pending' && onConfirm && (
              <button
                onClick={onConfirm}
                className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                Confirmer le paiement
              </button>
            )}

            {payment.status === 'pending' && onFail && (
              <button
                onClick={onFail}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Marquer comme échoué
              </button>
            )}

            {payment.status === 'completed' && !payment.refund && onRefund && (
              <button
                onClick={onRefund}
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Rembourser
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
