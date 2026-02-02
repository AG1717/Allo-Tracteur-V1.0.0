import { NextRequest } from 'next/server';
import { users, addUser } from '@/lib/mock-data';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-utils';

// POST /api/auth/register - Inscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.nom || !body.prenom || !body.email || !body.telephone || !body.password || !body.role) {
      return errorResponse('Champs requis manquants: nom, prenom, email, telephone, password, role');
    }

    // Vérifier si l'email existe déjà
    const existingUser = users.find(u => u.email === body.email);
    if (existingUser) {
      return errorResponse('Un compte avec cet email existe déjà', 409);
    }

    // Vérifier si le téléphone existe déjà
    const existingPhone = users.find(u => u.telephone === body.telephone);
    if (existingPhone) {
      return errorResponse('Un compte avec ce numéro de téléphone existe déjà', 409);
    }

    // Créer l'utilisateur
    const newUser = addUser({
      nom: body.nom,
      prenom: body.prenom,
      email: body.email,
      telephone: body.telephone,
      password: body.password,
      role: body.role,
      status: 'pending', // En attente de validation
      adresse: body.adresse,
      nombreTracteurs: body.role === 'proprietaire' ? 0 : undefined,
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = newUser;

    return jsonResponse({
      success: true,
      data: {
        user: userWithoutPassword,
        token: `mock-jwt-token-${newUser.id}-${Date.now()}`,
      },
      message: 'Inscription réussie. Votre compte est en attente de validation.',
    }, 201);
  } catch {
    return errorResponse('Erreur lors de l\'inscription', 500);
  }
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
