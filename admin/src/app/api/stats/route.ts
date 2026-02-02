import { getDashboardStats, revenueByMonth, bookingsByStatus } from '@/lib/mock-data';
import { jsonResponse, optionsResponse } from '@/lib/api-utils';

// GET /api/stats - Statistiques du dashboard
export async function GET() {
  const stats = getDashboardStats();

  return jsonResponse({
    success: true,
    data: {
      ...stats,
      revenueByMonth,
      bookingsByStatus,
    },
  });
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
