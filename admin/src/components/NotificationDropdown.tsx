'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BellIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserIcon,
  TruckIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  notifications as initialNotifications,
  Notification,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/lib/notifications';

const typeIcons = {
  booking: CalendarDaysIcon,
  user: UserIcon,
  tractor: TruckIcon,
  payment: BanknotesIcon,
  system: Cog6ToothIcon,
};

const typeColors = {
  booking: 'bg-blue-100 text-blue-600',
  user: 'bg-green-100 text-green-600',
  tractor: 'bg-yellow-100 text-yellow-600',
  payment: 'bg-purple-100 text-purple-600',
  system: 'bg-slate-100 text-slate-600',
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else {
      return `Il y a ${diffDays}j`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Tout marquer comme lu
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-slate-400">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={`flex gap-3 border-b border-slate-50 p-4 hover:bg-slate-50 transition-colors ${
                      !notification.read ? 'bg-green-50/50' : ''
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${typeColors[notification.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200"
                            title="Marquer comme lu"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{notification.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatTime(notification.createdAt)}</p>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          onClick={() => {
                            handleMarkAsRead(notification.id);
                            setIsOpen(false);
                          }}
                          className="mt-2 inline-block text-xs font-medium text-green-600 hover:text-green-700"
                        >
                          Voir les détails
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-3">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-slate-500 hover:text-slate-700"
            >
              Gérer les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
