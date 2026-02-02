# Allo Tracteur - Backend API

API REST pour l'application mobile Allo Tracteur - Plateforme de location de tracteurs au Sénégal.

## Technologies

- **Node.js** + **Express.js** - Framework backend
- **MongoDB** + **Mongoose** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe

## Installation

```bash
# Cloner le projet
cd allotracteur-backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables dans .env
# - MONGODB_URI
# - JWT_SECRET

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

## Structure du projet

```
src/
├── config/
│   └── database.js         # Configuration MongoDB
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── tractor.controller.js
│   ├── booking.controller.js
│   ├── payment.controller.js
│   ├── review.controller.js
│   └── notification.controller.js
├── middleware/
│   ├── auth.js             # Middleware JWT
│   └── errorHandler.js     # Gestion des erreurs
├── models/
│   ├── User.js
│   ├── Tractor.js
│   ├── Booking.js
│   ├── Payment.js
│   ├── Review.js
│   └── Notification.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── tractor.routes.js
│   ├── booking.routes.js
│   ├── payment.routes.js
│   ├── review.routes.js
│   └── notification.routes.js
├── utils/
│   └── helpers.js
├── validators/
│   ├── auth.validator.js
│   └── booking.validator.js
└── server.js               # Point d'entrée
```

## Endpoints API

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Inscription |
| POST | `/login` | Connexion |
| GET | `/me` | Profil utilisateur connecté |
| POST | `/logout` | Déconnexion |
| PUT | `/update-password` | Changer mot de passe |
| POST | `/forgot-password` | Mot de passe oublié |

### Utilisateurs (`/api/users`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/` | Liste utilisateurs | Admin |
| GET | `/stats` | Statistiques | Admin |
| GET | `/:id` | Détail utilisateur | Admin |
| PUT | `/profile` | Modifier profil | Connecté |
| PUT | `/:id/toggle-active` | Activer/Désactiver | Admin |
| PUT | `/:id/role` | Changer rôle | Admin |

### Tracteurs (`/api/tractors`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/` | Liste tracteurs | Public |
| GET | `/:id` | Détail tracteur | Public |
| GET | `/owner/me` | Mes tracteurs | Propriétaire |
| POST | `/` | Ajouter tracteur | Propriétaire |
| PUT | `/:id` | Modifier tracteur | Propriétaire |
| DELETE | `/:id` | Supprimer tracteur | Propriétaire |
| PUT | `/:id/availability` | Toggle disponibilité | Propriétaire |
| PUT | `/:id/approve` | Approuver | Admin |
| PUT | `/:id/reject` | Rejeter | Admin |

### Réservations (`/api/bookings`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| POST | `/` | Créer réservation | Client |
| GET | `/my-bookings` | Mes réservations | Client |
| GET | `/requests` | Demandes reçues | Propriétaire |
| GET | `/:id` | Détail réservation | Concerné |
| PUT | `/:id/accept` | Accepter | Propriétaire |
| PUT | `/:id/reject` | Refuser | Propriétaire |
| PUT | `/:id/cancel` | Annuler | Concerné |
| PUT | `/:id/start` | Démarrer location | Propriétaire |
| PUT | `/:id/complete` | Terminer location | Propriétaire |

### Paiements (`/api/payments`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| POST | `/` | Initier paiement | Client |
| GET | `/my-payments` | Mes paiements | Client |
| GET | `/received` | Paiements reçus | Propriétaire |
| GET | `/stats` | Statistiques | Propriétaire |
| PUT | `/:id/confirm` | Confirmer | Admin |
| PUT | `/:id/fail` | Marquer échoué | Admin |

### Avis (`/api/reviews`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/tractor/:tractorId` | Avis tracteur | Public |
| GET | `/user/:userId` | Avis utilisateur | Public |
| POST | `/` | Créer avis | Connecté |
| PUT | `/:id/respond` | Répondre | Évalué |
| POST | `/:id/report` | Signaler | Connecté |
| PUT | `/:id/hide` | Masquer | Admin |

### Notifications (`/api/notifications`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/` | Mes notifications | Connecté |
| PUT | `/:id/read` | Marquer lue | Connecté |
| PUT | `/read-all` | Tout marquer lu | Connecté |
| DELETE | `/:id` | Supprimer | Connecté |
| POST | `/system` | Envoyer système | Admin |
| POST | `/broadcast` | Diffuser | Admin |

## Modèles de données

### User
- nom, prenom, email, telephone, password
- role: `client`, `owner`, `admin`
- adresse, avatar, rating, documents, bankInfo

### Tractor
- name, brand, model, type, power, year
- pricePerHour, pricePerDay
- location (GeoJSON), images, features
- isAvailable, isApproved, rating

### Booking
- reference, client, tractor, owner
- startDate, endDate, duration, status
- pricing (basePrice, platformFee, ownerAmount, totalPrice)

### Payment
- reference, booking, payer, recipient
- amount, platformFee, ownerAmount
- method: `orange_money`, `wave`, `cash`
- status: `pending`, `completed`, `failed`, `refunded`

## Authentification

L'API utilise JWT Bearer tokens.

```
Authorization: Bearer <token>
```

## Réponses API

### Succès
```json
{
  "success": true,
  "data": { ... },
  "message": "Message optionnel"
}
```

### Erreur
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

### Pagination
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "totalPages": 10,
  "currentPage": 1,
  "data": [...]
}
```

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| PORT | Port du serveur | 5000 |
| NODE_ENV | Environnement | development |
| MONGODB_URI | URI MongoDB | localhost |
| JWT_SECRET | Secret JWT | - |
| JWT_EXPIRE | Expiration JWT | 30d |

## Commission

La plateforme prélève **10%** sur chaque transaction.

- `totalPrice` : Prix total payé par le client
- `platformFee` : Commission plateforme (10%)
- `ownerAmount` : Montant reçu par le propriétaire (90%)

## Licence

MIT
