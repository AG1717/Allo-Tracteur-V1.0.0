'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import { transactions } from '@/lib/mock-data';
import { exportToCSV, exportToPDF, formatPriceForExport, formatDateForExport } from '@/lib/export';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

const typeConfig = {
  payment: { label: 'Paiement', color: 'bg-green-100 text-green-800', icon: ArrowDownIcon },
  refund: { label: 'Remboursement', color: 'bg-red-100 text-red-800', icon: ArrowTrendingDownIcon },
  commission: { label: 'Commission', color: 'bg-purple-100 text-purple-800', icon: ReceiptPercentIcon },
  withdrawal: { label: 'Retrait', color: 'bg-blue-100 text-blue-800', icon: ArrowUpIcon },
};

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Complété', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Échoué', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Remboursé', color: 'bg-gray-100 text-gray-800' },
};

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || tx.paymentMethod === methodFilter;
    return matchesSearch && matchesType && matchesStatus && matchesMethod;
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
  const totalPayments = transactions
    .filter(t => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCommissions = transactions
    .filter(t => t.type === 'commission' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      { key: 'reference', label: 'Référence' },
      { key: 'userName', label: 'Utilisateur' },
      { key: 'userRole', label: 'Rôle' },
      { key: 'type', label: 'Type' },
      { key: 'paymentMethod', label: 'Méthode' },
      { key: 'amount', label: 'Montant' },
      { key: 'fee', label: 'Frais' },
      { key: 'status', label: 'Statut' },
      { key: 'createdAt', label: 'Date' },
    ];

    const data = filteredTransactions.map(tx => ({
      ...tx,
      amount: formatPriceForExport(tx.amount),
      fee: tx.fee > 0 ? formatPriceForExport(tx.fee) : '-',
      type: typeConfig[tx.type].label,
      status: statusConfig[tx.status].label,
      userRole: tx.userRole === 'proprietaire' ? 'Propriétaire' : 'Client',
      createdAt: formatDateForExport(tx.createdAt),
    }));

    exportToCSV(data, 'transactions', headers);
    setIsExportMenuOpen(false);
  };

  const handleExportPDF = () => {
    const tableRows = filteredTransactions.map(tx => `
      <tr>
        <td>${tx.reference}</td>
        <td>${tx.userName}</td>
        <td>${typeConfig[tx.type].label}</td>
        <td>${tx.paymentMethod}</td>
        <td>${formatPrice(tx.amount)}</td>
        <td>${statusConfig[tx.status].label}</td>
        <td>${formatDate(tx.createdAt)}</td>
      </tr>
    `).join('');

    const content = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" style="color: #22c55e">${formatPrice(totalPayments)}</div>
          <div class="stat-label">Paiements reçus</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #9333ea">${formatPrice(totalCommissions)}</div>
          <div class="stat-label">Commissions (5%)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #3b82f6">${formatPrice(totalWithdrawals)}</div>
          <div class="stat-label">Retraits effectués</div>
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
            <th>Utilisateur</th>
            <th>Type</th>
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

  return (
    <>
      <Header
        title="Transactions"
        subtitle={`${transactions.length} transactions au total`}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <ArrowDownIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Paiements reçus</p>
                <p className="text-xl font-bold text-green-700">{formatPrice(totalPayments)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <ReceiptPercentIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600">Commissions (5%)</p>
                <p className="text-xl font-bold text-purple-700">{formatPrice(totalCommissions)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <ArrowUpIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Retraits effectués</p>
                <p className="text-xl font-bold text-blue-700">{formatPrice(totalWithdrawals)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <ArrowPathIcon className="h-5 w-5 text-yellow-600" />
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

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">Tous les types</option>
              <option value="payment">Paiements</option>
              <option value="refund">Remboursements</option>
              <option value="commission">Commissions</option>
              <option value="withdrawal">Retraits</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Complétés</option>
              <option value="failed">Échoués</option>
            </select>

            {/* Method filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">Toutes méthodes</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Wave">Wave</option>
              <option value="Carte bancaire">Carte bancaire</option>
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
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Frais
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const TypeIcon = typeConfig[tx.type].icon;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono text-sm font-medium text-slate-900">{tx.reference}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{tx.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {tx.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm text-slate-900">{tx.userName}</p>
                            <p className="text-xs text-slate-500 capitalize">{tx.userRole === 'proprietaire' ? 'Propriétaire' : 'Client'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${typeConfig[tx.type].color}`}>
                          <TypeIcon className="h-3.5 w-3.5" />
                          {typeConfig[tx.type].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{tx.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm font-semibold ${tx.type === 'refund' ? 'text-red-600' : 'text-slate-900'}`}>
                          {tx.type === 'refund' ? '-' : ''}{formatPrice(tx.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-500">
                          {tx.fee > 0 ? formatPrice(tx.fee) : '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[tx.status].color}`}>
                          {statusConfig[tx.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="flex h-32 items-center justify-center text-slate-400">
              Aucune transaction trouvée
            </div>
          )}
        </div>
      </main>
    </>
  );
}
