'use client';

import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <UserCircleIcon className="h-8 w-8 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                {user.prenom} {user.nom}
              </span>
              <span className="text-xs text-slate-500">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
