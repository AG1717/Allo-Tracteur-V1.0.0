import { NextRequest } from 'next/server';
import { users, addUser, User } from '@/lib/mock-data';
import { jsonResponse, errorResponse, optionsResponse } from '@/lib/api-utils';

// GET /api/users - Liste tous les utilisateurs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let filteredUsers = [...users];

  if (role && role !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.role === role);
  }

  if (status && status !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.status === status);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.nom.toLowerCase().includes(searchLower) ||
      u.prenom.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      u.telephone.includes(search)
    );
  }

  return jsonResponse({
    success: true,
    data: filteredUsers,
    total: filteredUsers.length,
  });
}

// POST /api/users - Créer un utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.nom || !body.prenom || !body.email || !body.telephone || !body.role) {
      return errorResponse('Champs requis manquants: nom, prenom, email, telephone, role');
    }

    // Vérifier si l'email existe déjà
    const existingUser = users.find(u => u.email === body.email);
    if (existingUser) {
      return errorResponse('Un utilisateur avec cet email existe déjà', 409);
    }

    const newUser = addUser({
      nom: body.nom,
      prenom: body.prenom,
      email: body.email,
      telephone: body.telephone,
      password: body.password || 'temp123',
      role: body.role,
      status: body.status || 'pending',
      adresse: body.adresse,
      nombreTracteurs: body.nombreTracteurs,
    });

    return jsonResponse({
      success: true,
      data: newUser,
      message: 'Utilisateur créé avec succès',
    }, 201);
  } catch {
    return errorResponse('Erreur lors de la création de l\'utilisateur', 500);
  }
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return optionsResponse();
}
