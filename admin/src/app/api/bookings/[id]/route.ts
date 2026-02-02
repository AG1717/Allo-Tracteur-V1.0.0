import { NextRequest } from 'next/server';
import { bookings, updateBooking, deleteBooking } from '@/lib/mock-data';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-utils';

// GET /api/bookings/[id] - Obtenir une réservation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    return errorResponse('Réservation non trouvée', 404);
  }

  return jsonResponse({
    success: true,
    data: booking,
  });
}

// PUT /api/bookings/[id] - Mettre à jour une réservation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return errorResponse('Réservation non trouvée', 404);
    }

    const updatedBooking = updateBooking(id, body);

    return jsonResponse({
      success: true,
      data: updatedBooking,
      message: 'Réservation mise à jour avec succès',
    });
  } catch {
    return errorResponse('Erreur lors de la mise à jour', 500);
  }
}

// DELETE /api/bookings/[id] - Supprimer une réservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    return errorResponse('Réservation non trouvée', 404);
  }

  deleteBooking(id);

  return jsonResponse({
    success: true,
    message: 'Réservation supprimée avec succès',
  });
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
