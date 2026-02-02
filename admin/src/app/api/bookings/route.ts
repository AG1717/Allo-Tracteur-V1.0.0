import { NextRequest } from 'next/server';
import { bookings, addBooking, tractors, users } from '@/lib/mock-data';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-utils';

// GET /api/bookings - Liste toutes les réservations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');
  const ownerId = searchParams.get('ownerId');
  const tractorId = searchParams.get('tractorId');
  const search = searchParams.get('search');

  let filteredBookings = [...bookings];

  if (status && status !== 'all') {
    filteredBookings = filteredBookings.filter(b => b.status === status);
  }

  if (clientId) {
    filteredBookings = filteredBookings.filter(b => b.clientId === clientId);
  }

  if (ownerId) {
    filteredBookings = filteredBookings.filter(b => b.ownerId === ownerId);
  }

  if (tractorId) {
    filteredBookings = filteredBookings.filter(b => b.tractorId === tractorId);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredBookings = filteredBookings.filter(b =>
      b.tractorName.toLowerCase().includes(searchLower) ||
      b.clientName.toLowerCase().includes(searchLower) ||
      b.ownerName.toLowerCase().includes(searchLower)
    );
  }

  return jsonResponse({
    success: true,
    data: filteredBookings,
    total: filteredBookings.length,
  });
}

// POST /api/bookings - Créer une réservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.tractorId || !body.clientId || !body.startDate || !body.endDate) {
      return errorResponse('Champs requis manquants: tractorId, clientId, startDate, endDate');
    }

    // Vérifier que le tracteur existe et est disponible
    const tractor = tractors.find(t => t.id === body.tractorId);
    if (!tractor) {
      return errorResponse('Tracteur non trouvé', 404);
    }

    if (tractor.status !== 'available') {
      return errorResponse('Ce tracteur n\'est pas disponible', 400);
    }

    // Vérifier que le client existe
    const client = users.find(u => u.id === body.clientId);
    if (!client) {
      return errorResponse('Client non trouvé', 404);
    }

    // Calculer le prix total
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * tractor.pricePerDay;

    const newBooking = addBooking({
      tractorId: body.tractorId,
      tractorName: tractor.name,
      clientId: body.clientId,
      clientName: `${client.prenom} ${client.nom}`,
      ownerId: tractor.ownerId,
      ownerName: tractor.ownerName,
      startDate: body.startDate,
      endDate: body.endDate,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: body.paymentMethod,
    });

    return jsonResponse({
      success: true,
      data: newBooking,
      message: 'Réservation créée avec succès',
    }, 201);
  } catch {
    return errorResponse('Erreur lors de la création de la réservation', 500);
  }
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
