'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { getDashboardStats, getRevenueByMonth, DashboardStats } from '@/lib/api';
import { exportToCSV, exportToPDF } from '@/lib/export';
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  BanknotesIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [revenueByMonth, setRevenueByMonth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, revenue] = await Promise.all([
        getDashboardStats(),
        getRevenueByMonth(),
      ]);
      setDashboardStats(stats);
      setRevenueByMonth(revenue);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (loading || !dashboardStats) {
    return (
      <>
        <Header title="Rapports" subtitle="Chargement..." />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-center py-12">
            <p className="text-slate-500">Chargement des rapports...</p>
          </div>
        </main>
      </>
    );
  }

  const totalRevenue = revenueByMonth.reduce((sum, m) => sum + (m.revenue || 0), 0);

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      { key: 'metric', label: 'Métrique' },
      { key: 'value', label: 'Valeur' },
    ];

    const data = [
      { metric: 'Utilisateurs totaux', value: dashboardStats.totalUsers },
      { metric: 'Clients', value: dashboardStats.totalClients },
      { metric: 'Propriétaires', value: dashboardStats.totalOwners },
      { metric: 'Tracteurs actifs', value: dashboardStats.totalTractors },
      { metric: 'Tracteurs disponibles', value: dashboardStats.availableTractors },
      { metric: 'En attente approbation', value: dashboardStats.pendingApprovals },
      { metric: 'Réservations totales', value: dashboardStats.totalBookings },
      { metric: 'Réservations actives', value: dashboardStats.activeBookings },
      { metric: 'Revenu mensuel', value: formatPrice(dashboardStats.monthlyRevenue) },
      ...revenueByMonth.map(m => ({
        metric: `Revenu ${m.month}`,
        value: formatPrice(m.revenue || 0),
      })),
    ];

    exportToCSV(data, 'rapport_statistiques', headers);
  };

  const handleExportPDF = () => {
    const revenueRows = revenueByMonth.map(m => `
      <tr>
        <td>${m.month}</td>
        <td>${formatPrice(m.revenue || 0)}</td>
      </tr>
    `).join('');

    const content = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${dashboardStats.totalUsers}</div>
          <div class="stat-label">Utilisateurs totaux</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${dashboardStats.totalTractors}</div>
          <div class="stat-label">Tracteurs actifs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${dashboardStats.totalBookings}</div>
          <div class="stat-label">Réservations totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatPrice(dashboardStats.monthlyRevenue)}</div>
          <div class="stat-label">Revenu mensuel</div>
        </div>
      </div>

      <h2 style="margin-top:30px;color:#22c55e;">Revenus mensuels</h2>
      <p style="color:#64748b;margin-bottom:15px;">Total: ${formatPrice(totalRevenue)}</p>
      <table>
        <thead>
          <tr>
            <th>Mois</th>
            <th>Revenu</th>
          </tr>
        </thead>
        <tbody>
          ${revenueRows}
        </tbody>
      </table>

      <h2 style="margin-top:30px;color:#3b82f6;">Statistiques détaillées</h2>
      <table>
        <thead>
          <tr>
            <th>Métrique</th>
            <th>Valeur</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Clients</td><td>${dashboardStats.totalClients}</td></tr>
          <tr><td>Propriétaires</td><td>${dashboardStats.totalOwners}</td></tr>
          <tr><td>Tracteurs disponibles</td><td>${dashboardStats.availableTractors}</td></tr>
          <tr><td>En attente d'approbation</td><td>${dashboardStats.pendingApprovals}</td></tr>
          <tr><td>Réservations actives</td><td>${dashboardStats.activeBookings}</td></tr>
        </tbody>
      </table>
    `;

    exportToPDF('Rapport Statistiques - Allo Tracteur', content, 'rapport_statistiques');
  };

  return (
    <>
      <Header
        title="Rapports"
        subtitle="Statistiques et analyses de la plateforme"
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Export buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <TableCellsIcon className="h-5 w-5 text-green-600" />
            Exporter en CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5 text-red-600" />
            Exporter en PDF
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Report */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <BanknotesIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Revenus</h2>
                  <p className="text-sm text-slate-500">Évolution mensuelle</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
            </div>

            <div className="space-y-4">
              {revenueByMonth.map((item, index) => (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="w-12 text-sm font-medium text-slate-500">{item.month}</span>
                  <div className="flex-1">
                    <div className="h-8 rounded-lg bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-green-400 to-green-600 transition-all"
                        style={{ width: `${(item.revenue / 600000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-32 text-right text-sm font-semibold text-slate-700">
                    {formatPrice(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Résumé</h2>
                <p className="text-sm text-slate-500">Statistiques clés de la plateforme</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Utilisateurs totaux</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardStats.totalUsers}</p>
                <p className="mt-1 text-xs text-green-600">+8.2% ce mois</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Tracteurs actifs</p>
                <p className="text-3xl font-bold text-slate-900">{dashboardStats.totalTractors}</p>
                <p className="mt-1 text-xs text-green-600">+5.1% ce mois</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Taux de conversion</p>
                <p className="text-3xl font-bold text-slate-900">68%</p>
                <p className="mt-1 text-xs text-green-600">+2.3% ce mois</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Valeur moyenne</p>
                <p className="text-3xl font-bold text-slate-900">176K</p>
                <p className="mt-1 text-xs text-slate-500">FCFA par réservation</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
