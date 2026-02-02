import { NextRequest } from 'next/server';
import { users, updateUser, deleteUser } from '@/lib/mock-data';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-utils';

// GET /api/users/[id] - Obtenir un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = users.find(u => u.id === id);

  if (!user) {
    return errorResponse('Utilisateur non trouvé', 404);
  }

  return jsonResponse({
    success: true,
    data: user,
  });
}

// PUT /api/users/[id] - Mettre à jour un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const user = users.find(u => u.id === id);
    if (!user) {
      return errorResponse('Utilisateur non trouvé', 404);
    }

    const updatedUser = updateUser(id, body);

    return jsonResponse({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès',
    });
  } catch {
    return errorResponse('Erreur lors de la mise à jour', 500);
  }
}

// DELETE /api/users/[id] - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = users.find(u => u.id === id);

  if (!user) {
    return errorResponse('Utilisateur non trouvé', 404);
  }

  deleteUser(id);

  return jsonResponse({
    success: true,
    message: 'Utilisateur supprimé avec succès',
  });
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
