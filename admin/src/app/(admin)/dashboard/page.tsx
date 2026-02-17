'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import {
  getDashboardStats,
  getRevenueByMonth,
  getAllBookings,
  getAllTractors,
  approveTractor,
  rejectTractor,
  type DashboardStats,
  type RevenueData,
  type Booking,
  type Tractor
} from '@/lib/api';
import {
  UsersIcon,
  TruckIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [pendingTractors, setPendingTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [statsData, revenueMonthData, bookingsData, tractorsData] = await Promise.all([
        getDashboardStats(),
        getRevenueByMonth(),
        getAllBookings(),
        getAllTractors(),
      ]);

      setStats(statsData);
      setRevenueData(revenueMonthData);
      setRecentBookings(bookingsData.slice(0, 5));
      setPendingTractors(tractorsData.filter(t => !t.isApproved && t.isActive));
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleApproveTractor = async (tractorId: string) => {
    try {
      await approveTractor(tractorId);
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleRejectTractor = async (tractorId: string) => {
    try {
      await rejectTractor(tractorId);
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const getBookingStatus = (booking: Booking): 'pending' | 'confirmed' | 'completed' | 'cancelled' => {
    if (booking.status === 'cancelled') return 'cancelled';
    if (booking.status === 'completed') return 'completed';
    if (booking.status === 'accepted' || booking.status === 'in_progress') return 'confirmed';
    return 'pending';
  };

  if (loading || !stats) {
    return (
      <>
        <Header
          title="Dashboard"
          subtitle="Chargement..."
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-green-500"></div>
              <p className="text-slate-500">Chargement du tableau de bord...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...revenueData.map(item => item.revenue), 1);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Vue d'ensemble de votre plateforme"
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Utilisateurs totaux"
            value={stats.totalUsers}
            change={stats.revenueGrowth}
            changeLabel="vs mois dernier"
            icon={UsersIcon}
            color="blue"
          />
          <StatsCard
            title="Tracteurs actifs"
            value={stats.availableTractors}
            change={stats.revenueGrowth}
            changeLabel="vs mois dernier"
            icon={TruckIcon}
            color="green"
          />
          <StatsCard
            title="Réservations"
            value={stats.totalBookings}
            change={stats.revenueGrowth}
            changeLabel="vs mois dernier"
            icon={CalendarDaysIcon}
            color="yellow"
          />
          <StatsCard
            title="Revenus du mois"
            value={formatPrice(stats.monthlyRevenue)}
            change={stats.revenueGrowth}
            changeLabel="vs mois dernier"
            icon={BanknotesIcon}
            color="purple"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Revenus mensuels</h2>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                +{stats.revenueGrowth}%
              </div>
            </div>

            {/* Simple bar chart */}
            <div className="flex h-48 items-end justify-between gap-4">
              {revenueData.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-green-500 transition-all hover:bg-green-600"
                    style={{ height: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
                  />
                  <span className="text-xs font-medium text-slate-500">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Statistiques rapides</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Clients</span>
                <span className="font-semibold text-slate-900">{stats.totalClients}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Propriétaires</span>
                <span className="font-semibold text-slate-900">{stats.totalOwners}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Tracteurs disponibles</span>
                <span className="font-semibold text-green-600">{stats.availableTractors}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-600">En attente d&apos;approbation</span>
                <span className="font-semibold text-yellow-600">{stats.pendingApprovals}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Réservations actives</span>
                <span className="font-semibold text-blue-600">{stats.activeBookings}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Recent Bookings */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Réservations récentes</h2>
            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {booking.tractor?.nom || 'Tracteur inconnu'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {booking.client?.prenom} {booking.client?.nom}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={getBookingStatus(booking)} type="booking" />
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatPrice(booking.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-slate-400">
                Aucune réservation récente
              </div>
            )}
          </div>

          {/* Pending Approvals */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">En attente d&apos;approbation</h2>
            {pendingTractors.length > 0 ? (
              <div className="space-y-3">
                {pendingTractors.map((tractor) => (
                  <div key={tractor._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div>
                      <p className="font-medium text-slate-900">{tractor.nom}</p>
                      <p className="text-sm text-slate-500">
                        {tractor.owner?.prenom} {tractor.owner?.nom} • {tractor.localisation.ville}, {tractor.localisation.region}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveTractor(tractor._id)}
                        className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRejectTractor(tractor._id)}
                        className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-slate-400">
                Aucune demande en attente
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
