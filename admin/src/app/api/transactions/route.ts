import { NextRequest } from 'next/server';
import { transactions } from '@/lib/mock-data';
import { jsonResponse, optionsResponse } from '@/lib/api-utils';

// GET /api/transactions - Liste toutes les transactions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const userId = searchParams.get('userId');
  const paymentMethod = searchParams.get('paymentMethod');
  const search = searchParams.get('search');

  let filteredTransactions = [...transactions];

  if (type && type !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }

  if (status && status !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.status === status);
  }

  if (userId) {
    filteredTransactions = filteredTransactions.filter(t => t.userId === userId);
  }

  if (paymentMethod && paymentMethod !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.paymentMethod === paymentMethod);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredTransactions = filteredTransactions.filter(t =>
      t.userName.toLowerCase().includes(searchLower) ||
      t.reference.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower)
    );
  }

  // Calculer les stats
  const stats = {
    totalPayments: filteredTransactions
      .filter(t => t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalCommissions: filteredTransactions
      .filter(t => t.type === 'commission' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalWithdrawals: filteredTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    pendingAmount: filteredTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return jsonResponse({
    success: true,
    data: filteredTransactions,
    stats,
    total: filteredTransactions.length,
  });
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
