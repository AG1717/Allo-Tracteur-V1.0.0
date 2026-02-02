import { NextRequest } from 'next/server';
import { tractors, addTractor } from '@/lib/mock-data';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-utils';

// GET /api/tractors - Liste tous les tracteurs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const ownerId = searchParams.get('ownerId');
  const search = searchParams.get('search');
  const location = searchParams.get('location');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  let filteredTractors = [...tractors];

  if (status && status !== 'all') {
    filteredTractors = filteredTractors.filter(t => t.status === status);
  }

  if (type && type !== 'all') {
    filteredTractors = filteredTractors.filter(t => t.type === type);
  }

  if (ownerId) {
    filteredTractors = filteredTractors.filter(t => t.ownerId === ownerId);
  }

  if (location) {
    filteredTractors = filteredTractors.filter(t =>
      t.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (minPrice) {
    filteredTractors = filteredTractors.filter(t => t.pricePerDay >= Number(minPrice));
  }

  if (maxPrice) {
    filteredTractors = filteredTractors.filter(t => t.pricePerDay <= Number(maxPrice));
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredTractors = filteredTractors.filter(t =>
      t.name.toLowerCase().includes(searchLower) ||
      t.ownerName.toLowerCase().includes(searchLower) ||
      t.location.toLowerCase().includes(searchLower) ||
      t.type.toLowerCase().includes(searchLower)
    );
  }

  return jsonResponse({
    success: true,
    data: filteredTractors,
    total: filteredTractors.length,
  });
}

// POST /api/tractors - Créer un tracteur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.type || !body.ownerId || !body.pricePerDay || !body.location) {
      return errorResponse('Champs requis manquants: name, type, ownerId, pricePerDay, location');
    }

    const newTractor = addTractor({
      name: body.name,
      type: body.type,
      ownerId: body.ownerId,
      ownerName: body.ownerName,
      pricePerDay: Number(body.pricePerDay),
      location: body.location,
      status: body.status || 'pending_approval',
      rating: body.rating || 0,
      totalBookings: body.totalBookings || 0,
    });

    return jsonResponse({
      success: true,
      data: newTractor,
      message: 'Tracteur créé avec succès',
    }, 201);
  } catch {
    return errorResponse('Erreur lors de la création du tracteur', 500);
  }
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
