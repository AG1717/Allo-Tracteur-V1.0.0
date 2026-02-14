'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import PaymentDetailsModal from '@/components/PaymentDetailsModal';
import RefundModal from '@/components/RefundModal';
import { getAllPayments, getPaymentDetails, confirmPayment, failPayment, refundPayment, Payment } from '@/lib/api';
import { exportToCSV, exportToPDF, formatPriceForExport, formatDateForExport } from '@/lib/export';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  DocumentTextIcon,
  TableCellsIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

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

export default function TransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [failReason, setFailReason] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      setPayments(data);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (payment: Payment) => {
    try {
      const details = await getPaymentDetails(payment._id);
      setSelectedPayment(details);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des détails');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    try {
      await confirmPayment(selectedPayment._id);
      await loadPayments();
      setIsDetailsModalOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la confirmation');
    }
  };

  const handleFailPayment = async () => {
    if (!selectedPayment || !failReason.trim()) {
      alert('Veuillez entrer une raison');
      return;
    }
    try {
      await failPayment(selectedPayment._id, failReason);
      await loadPayments();
      setIsFailModalOpen(false);
      setIsDetailsModalOpen(false);
      setSelectedPayment(null);
      setFailReason('');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'échec du paiement');
    }
  };

  const handleRefund = async (amount: number, reason: string) => {
    if (!selectedPayment) return;
    try {
      await refundPayment(selectedPayment._id, amount, reason);
      await loadPayments();
      setIsRefundModalOpen(false);
      setIsDetailsModalOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du remboursement');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const payerName = `${payment.payer?.prenom || ''} ${payment.payer?.nom || ''}`.toLowerCase();
    const recipientName = `${payment.recipient?.prenom || ''} ${payment.recipient?.nom || ''}`.toLowerCase();
    const matchesSearch =
      payerName.includes(searchTerm.toLowerCase()) ||
      recipientName.includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Stats
  const totalPayments = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalCommissions = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.platformFee, 0);
  const totalOwnerEarnings = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.ownerAmount, 0);
  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      { key: 'reference', label: 'Référence' },
      { key: 'payerName', label: 'Payeur' },
      { key: 'recipientName', label: 'Bénéficiaire' },
      { key: 'method', label: 'Méthode' },
      { key: 'amount', label: 'Montant' },
      { key: 'platformFee', label: 'Commission' },
      { key: 'ownerAmount', label: 'Montant propriétaire' },
      { key: 'status', label: 'Statut' },
      { key: 'createdAt', label: 'Date' },
    ];

    const data = filteredPayments.map(payment => ({
      reference: payment.reference,
      payerName: `${payment.payer?.prenom || ''} ${payment.payer?.nom || ''}`,
      recipientName: `${payment.recipient?.prenom || ''} ${payment.recipient?.nom || ''}`,
      method: methodConfig[payment.method]?.label || payment.method,
      amount: formatPriceForExport(payment.amount),
      platformFee: formatPriceForExport(payment.platformFee),
      ownerAmount: formatPriceForExport(payment.ownerAmount),
      status: statusConfig[payment.status]?.label || payment.status,
      createdAt: formatDateForExport(payment.createdAt),
    }));

    exportToCSV(data, 'transactions', headers);
    setIsExportMenuOpen(false);
  };

  const handleExportPDF = () => {
    const tableRows = filteredPayments.map(payment => `
      <tr>
        <td>${payment.reference}</td>
        <td>${payment.payer?.prenom || ''} ${payment.payer?.nom || ''}</td>
        <td>${payment.recipient?.prenom || ''} ${payment.recipient?.nom || ''}</td>
        <td>${methodConfig[payment.method]?.label || payment.method}</td>
        <td>${formatPrice(payment.amount)}</td>
        <td>${statusConfig[payment.status]?.label || payment.status}</td>
        <td>${formatDate(payment.createdAt)}</td>
      </tr>
    `).join('');

    const content = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" style="color: #22c55e">${formatPrice(totalPayments)}</div>
          <div class="stat-label">Paiements complétés</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #9333ea">${formatPrice(totalCommissions)}</div>
          <div class="stat-label">Commissions (10%)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #3b82f6">${formatPrice(totalOwnerEarnings)}</div>
          <div class="stat-label">Revenus propriétaires</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #f59e0b">${formatPrice(pendingAmount)}</div>
          <div class="stat-label">En attente</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Référence</th>
            <th>Payeur</th>
            <th>Bénéficiaire</th>
            <th>Méthode</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    exportToPDF('Rapport des Transactions - Allo Tracteur', content, 'transactions');
    setIsExportMenuOpen(false);
  };

  if (loading) {
    return (
      <>
        <Header title="Transactions" subtitle="Chargement..." />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-center py-12">
            <p className="text-slate-500">Chargement des transactions...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Transactions"
        subtitle={`${payments.length} paiements au total`}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <BanknotesIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Paiements complétés</p>
                <p className="text-xl font-bold text-green-700">{formatPrice(totalPayments)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <BanknotesIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600">Commissions (10%)</p>
                <p className="text-xl font-bold text-purple-700">{formatPrice(totalCommissions)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <BanknotesIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Revenus propriétaires</p>
                <p className="text-xl font-bold text-blue-700">{formatPrice(totalOwnerEarnings)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <BanknotesIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">En attente</p>
                <p className="text-xl font-bold text-yellow-700">{formatPrice(pendingAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="completed">Complétés</option>
              <option value="failed">Échoués</option>
              <option value="refunded">Remboursés</option>
              <option value="cancelled">Annulés</option>
            </select>

            {/* Method filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">Toutes méthodes</option>
              <option value="orange_money">Orange Money</option>
              <option value="wave">Wave</option>
              <option value="cash">Espèces</option>
              <option value="bank_transfer">Virement bancaire</option>
            </select>
          </div>

          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Exporter
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10">
                <button
                  onClick={handleExportCSV}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <TableCellsIcon className="h-5 w-5 text-green-600" />
                  Exporter en CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
                >
                  <DocumentTextIcon className="h-5 w-5 text-red-600" />
                  Exporter en PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Bénéficiaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      Aucun paiement trouvé
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm font-medium text-slate-900">{payment.reference}</p>
                        {payment.booking?.tractor && (
                          <p className="text-xs text-slate-500">{payment.booking.tractor.nom}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {payment.payer?.prenom?.[0]}{payment.payer?.nom?.[0]}
                          </div>
                          <div>
                            <p className="text-sm text-slate-900">{payment.payer?.prenom} {payment.payer?.nom}</p>
                            <p className="text-xs text-slate-500 capitalize">{payment.payer?.role === 'proprietaire' ? 'Propriétaire' : 'Client'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {payment.recipient?.prenom?.[0]}{payment.recipient?.nom?.[0]}
                          </div>
                          <div>
                            <p className="text-sm text-slate-900">{payment.recipient?.prenom} {payment.recipient?.nom}</p>
                            <p className="text-xs text-slate-500 capitalize">{payment.recipient?.role === 'proprietaire' ? 'Propriétaire' : 'Client'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${methodConfig[payment.method]?.color || 'bg-slate-100 text-slate-800'}`}>
                          {methodConfig[payment.method]?.label || payment.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatPrice(payment.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-purple-600 font-medium">
                          {formatPrice(payment.platformFee)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[payment.status]?.color || 'bg-slate-100 text-slate-800'}`}>
                          {statusConfig[payment.status]?.label || payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsConfirmModalOpen(true);
                                }}
                                className="rounded-lg p-2 text-green-400 hover:bg-green-100 hover:text-green-600 transition-colors"
                                title="Confirmer"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsFailModalOpen(true);
                                }}
                                className="rounded-lg p-2 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                title="Marquer comme échoué"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {payment.status === 'completed' && !payment.refund && (
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsRefundModalOpen(true);
                              }}
                              className="rounded-lg p-2 text-orange-400 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                              title="Rembourser"
                            >
                              <ArrowPathIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <PaymentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        onConfirm={selectedPayment?.status === 'pending' ? () => setIsConfirmModalOpen(true) : undefined}
        onFail={selectedPayment?.status === 'pending' ? () => setIsFailModalOpen(true) : undefined}
        onRefund={selectedPayment?.status === 'completed' && !selectedPayment?.refund ? () => setIsRefundModalOpen(true) : undefined}
      />

      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        payment={selectedPayment}
        onConfirm={handleRefund}
      />

      {/* Confirmation Modal */}
      {isConfirmModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative rounded-2xl bg-white p-6 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Confirmer le paiement</h3>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir confirmer le paiement <strong>{selectedPayment.reference}</strong> de{' '}
              <strong>{formatPrice(selectedPayment.amount)}</strong> ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  handleConfirmPayment();
                  setIsConfirmModalOpen(false);
                }}
                className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fail Modal */}
      {isFailModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative rounded-2xl bg-white p-6 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Marquer comme échoué</h3>
            <p className="text-slate-600 mb-4">
              Paiement <strong>{selectedPayment.reference}</strong>
            </p>
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Raison de l'échec *
              </label>
              <textarea
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                placeholder="Ex: Fonds insuffisants"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsFailModalOpen(false);
                  setFailReason('');
                }}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleFailPayment}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Marquer comme échoué
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
