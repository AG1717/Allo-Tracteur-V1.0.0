'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TruckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
            <TruckIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Allo Tracteur</h1>
          <p className="text-slate-400">Panneau d&apos;administration</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Connexion</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@allotracteur.sn"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-12 text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-green-500 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-lg bg-slate-50 p-4">
            <p className="mb-2 text-xs font-medium text-slate-500 uppercase">
              Compte admin de test
            </p>
            <p className="text-sm text-slate-600">
              Email: <span className="font-mono text-green-600">superadmin@allotracteur.sn</span>
            </p>
            <p className="text-sm text-slate-600">
              Mot de passe: <span className="font-mono text-green-600">Admin2024!</span>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          © 2024 Allo Tracteur. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
