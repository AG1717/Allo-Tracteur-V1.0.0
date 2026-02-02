import { NextRequest } from 'next/server';
import { tractors, updateTractor, deleteTractor } from '@/lib/mock-data';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-utils';

// GET /api/tractors/[id] - Obtenir un tracteur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tractor = tractors.find(t => t.id === id);

  if (!tractor) {
    return errorResponse('Tracteur non trouvé', 404);
  }

  return jsonResponse({
    success: true,
    data: tractor,
  });
}

// PUT /api/tractors/[id] - Mettre à jour un tracteur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const tractor = tractors.find(t => t.id === id);
    if (!tractor) {
      return errorResponse('Tracteur non trouvé', 404);
    }

    const updatedTractor = updateTractor(id, body);

    return jsonResponse({
      success: true,
      data: updatedTractor,
      message: 'Tracteur mis à jour avec succès',
    });
  } catch {
    return errorResponse('Erreur lors de la mise à jour', 500);
  }
}

// DELETE /api/tractors/[id] - Supprimer un tracteur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tractor = tractors.find(t => t.id === id);

  if (!tractor) {
    return errorResponse('Tracteur non trouvé', 404);
  }

  deleteTractor(id);

  return jsonResponse({
    success: true,
    message: 'Tracteur supprimé avec succès',
  });
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
