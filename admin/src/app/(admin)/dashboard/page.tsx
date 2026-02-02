'use client';

import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { dashboardStats, bookings, tractors, revenueByMonth } from '@/lib/mock-data';
import {
  UsersIcon,
  TruckIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const recentBookings = bookings.slice(0, 5);
  const pendingTractors = tractors.filter(t => t.status === 'pending_approval');

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
            value={dashboardStats.totalUsers}
            change={8.2}
            changeLabel="vs mois dernier"
            icon={UsersIcon}
            color="blue"
          />
          <StatsCard
            title="Tracteurs actifs"
            value={dashboardStats.totalTractors}
            change={5.1}
            changeLabel="vs mois dernier"
            icon={TruckIcon}
            color="green"
          />
          <StatsCard
            title="Réservations"
            value={dashboardStats.totalBookings}
            change={12.5}
            changeLabel="vs mois dernier"
            icon={CalendarDaysIcon}
            color="yellow"
          />
          <StatsCard
            title="Revenus du mois"
            value={formatPrice(dashboardStats.monthlyRevenue)}
            change={dashboardStats.revenueGrowth}
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
                +{dashboardStats.revenueGrowth}%
              </div>
            </div>

            {/* Simple bar chart */}
            <div className="flex h-48 items-end justify-between gap-4">
              {revenueByMonth.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-green-500 transition-all hover:bg-green-600"
                    style={{ height: `${(item.revenue / 600000) * 100}%` }}
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
                <span className="font-semibold text-slate-900">{dashboardStats.totalClients}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Propriétaires</span>
                <span className="font-semibold text-slate-900">{dashboardStats.totalOwners}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Tracteurs disponibles</span>
                <span className="font-semibold text-green-600">{dashboardStats.availableTractors}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-600">En attente d&apos;approbation</span>
                <span className="font-semibold text-yellow-600">{dashboardStats.pendingApprovals}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-600">Réservations actives</span>
                <span className="font-semibold text-blue-600">{dashboardStats.activeBookings}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Recent Bookings */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Réservations récentes</h2>
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="font-medium text-slate-900">{booking.tractorName}</p>
                    <p className="text-sm text-slate-500">{booking.clientName}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={booking.status} type="booking" />
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {formatPrice(booking.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">En attente d&apos;approbation</h2>
            {pendingTractors.length > 0 ? (
              <div className="space-y-3">
                {pendingTractors.map((tractor) => (
                  <div key={tractor.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div>
                      <p className="font-medium text-slate-900">{tractor.name}</p>
                      <p className="text-sm text-slate-500">{tractor.ownerName} • {tractor.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors">
                        Approuver
                      </button>
                      <button className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors">
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
