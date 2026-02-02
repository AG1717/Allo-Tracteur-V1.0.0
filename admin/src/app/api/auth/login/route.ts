import { NextRequest } from 'next/server';
import { users } from '@/lib/mock-data';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-utils';

// POST /api/auth/login - Connexion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.password) {
      return errorResponse('Email et mot de passe requis');
    }

    // Chercher l'utilisateur
    const user = users.find(u => u.email === body.email);

    if (!user) {
      return errorResponse('Email ou mot de passe incorrect', 401);
    }

    // Vérifier le mot de passe (en prod, utiliser bcrypt)
    if (user.password !== body.password) {
      return errorResponse('Email ou mot de passe incorrect', 401);
    }

    // Vérifier le statut
    if (user.status === 'inactive') {
      return errorResponse('Votre compte est désactivé', 403);
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;

    return jsonResponse({
      success: true,
      data: {
        user: userWithoutPassword,
        token: `mock-jwt-token-${user.id}-${Date.now()}`, // Token mock
      },
      message: 'Connexion réussie',
    });
  } catch {
    return errorResponse('Erreur lors de la connexion', 500);
  }
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
