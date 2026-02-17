const Tractor = require('../models/Tractor');
const path = require('path');
const fs = require('fs');

// Fonction utilitaire pour calculer la distance entre deux points (formule Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance en km
}

// @desc    Obtenir tous les tracteurs
// @route   GET /api/tractors
// @access  Public
exports.getTractors = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      minPrice,
      maxPrice,
      minPower,
      maxPower,
      brand,
      disponible,
      latitude,
      longitude,
      maxDistance = 50000, // 50km par défaut
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isApproved: true };

    // Filtres
    if (search) {
      query.$text = { $search: search };
    }
    if (type) query.type = type;
    if (brand) query.marque = { $regex: brand, $options: 'i' };
    if (disponible !== undefined) query.disponible = disponible === 'true';
    if (minPrice || maxPrice) {
      query.prixParHectare = {};
      if (minPrice) query.prixParHectare.$gte = parseInt(minPrice);
      if (maxPrice) query.prixParHectare.$lte = parseInt(maxPrice);
    }
    if (minPower || maxPower) {
      query.puissance = {};
      if (minPower) query.puissance.$gte = parseInt(minPower);
      if (maxPower) query.puissance.$lte = parseInt(maxPower);
    }

    let tractors;

    // Recherche géographique si coordonnées fournies
    if (latitude && longitude) {
      // Filtrer manuellement par distance car localisation n'utilise pas GeoJSON
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const maxDistKm = parseInt(maxDistance) / 1000; // Convertir mètres en km

      const allTractors = await Tractor.find(query)
        .populate('owner', 'nom prenom telephone rating');

      const tractorsWithDistance = allTractors
        .map(tractor => {
          if (!tractor.localisation?.coordinates?.latitude || !tractor.localisation?.coordinates?.longitude) {
            return null;
          }

          // Calculer la distance en km
          const distance = calculateDistance(
            lat,
            lon,
            tractor.localisation.coordinates.latitude,
            tractor.localisation.coordinates.longitude
          );

          return { tractor, distance };
        })
        .filter(item => item && item.distance <= maxDistKm)
        .sort((a, b) => a.distance - b.distance);

      // Pagination
      tractors = tractorsWithDistance
        .slice((page - 1) * limit, page * limit)
        .map(item => item.tractor);
    } else {
      tractors = await Tractor.find(query)
        .populate('owner', 'nom prenom telephone rating')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });
    }

    const total = await Tractor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tractors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: tractors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir un tracteur par ID
// @route   GET /api/tractors/:id
// @access  Public
exports.getTractor = async (req, res, next) => {
  try {
    const tractor = await Tractor.findById(req.params.id)
      .populate('owner', 'nom prenom telephone email rating totalReviews');

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: tractor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer un tracteur
// @route   POST /api/tractors
// @access  Private/Owner
exports.createTractor = async (req, res, next) => {
  try {
    // Ajouter le propriétaire
    req.body.owner = req.user.id;

    // Formater les coordonnées
    if (req.body.latitude && req.body.longitude) {
      req.body.localisation = {
        adresse: req.body.address || req.body.adresse || '',
        ville: req.body.ville || '',
        region: req.body.region || '',
        coordinates: {
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude)
        }
      };
      // Nettoyer les champs temporaires
      delete req.body.latitude;
      delete req.body.longitude;
      delete req.body.address;
      delete req.body.adresse;
    }

    const tractor = await Tractor.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tracteur créé avec succès, en attente d\'approbation',
      data: tractor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un tracteur
// @route   PUT /api/tractors/:id
// @access  Private/Owner
exports.updateTractor = async (req, res, next) => {
  try {
    let tractor = await Tractor.findById(req.params.id);

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (tractor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce tracteur'
      });
    }

    // Mettre à jour les coordonnées si fournies
    if (req.body.latitude && req.body.longitude) {
      req.body.localisation = {
        adresse: req.body.address || req.body.adresse || tractor.localisation?.adresse || '',
        ville: req.body.ville || tractor.localisation?.ville || '',
        region: req.body.region || tractor.localisation?.region || '',
        coordinates: {
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude)
        }
      };
      // Nettoyer les champs temporaires
      delete req.body.latitude;
      delete req.body.longitude;
      delete req.body.address;
      delete req.body.adresse;
    }

    tractor = await Tractor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: tractor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un tracteur
// @route   DELETE /api/tractors/:id
// @access  Private/Owner/Admin
exports.deleteTractor = async (req, res, next) => {
  try {
    const tractor = await Tractor.findById(req.params.id);

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (tractor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce tracteur'
      });
    }

    await tractor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tracteur supprimé',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les tracteurs d'un propriétaire
// @route   GET /api/tractors/owner/me
// @access  Private/Owner
exports.getMyTractors = async (req, res, next) => {
  try {
    const tractors = await Tractor.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tractors.length,
      data: tractors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle disponibilité
// @route   PUT /api/tractors/:id/availability
// @access  Private/Owner
exports.toggleAvailability = async (req, res, next) => {
  try {
    const tractor = await Tractor.findById(req.params.id);

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé'
      });
    }

    if (tractor.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    tractor.disponible = !tractor.disponible;
    await tractor.save();

    res.status(200).json({
      success: true,
      data: tractor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approuver un tracteur (admin)
// @route   PUT /api/tractors/:id/approve
// @access  Private/Admin
exports.approveTractor = async (req, res, next) => {
  try {
    const tractor = await Tractor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé'
      });
    }

    // TODO: Envoyer notification au propriétaire

    res.status(200).json({
      success: true,
      message: 'Tracteur approuvé',
      data: tractor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rejeter un tracteur (admin)
// @route   PUT /api/tractors/:id/reject
// @access  Private/Admin
exports.rejectTractor = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const tractor = await Tractor.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé'
      });
    }

    // TODO: Envoyer notification au propriétaire avec la raison

    res.status(200).json({
      success: true,
      message: 'Tracteur rejeté',
      data: tractor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Statistiques tracteurs (admin)
// @route   GET /api/tractors/stats
// @access  Private/Admin
exports.getTractorStats = async (req, res, next) => {
  try {
    const stats = await Tractor.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$prixParHectare' },
          available: { $sum: { $cond: ['$isAvailable', 1, 0] } }
        }
      }
    ]);

    const total = await Tractor.countDocuments();
    const pending = await Tractor.countDocuments({ isApproved: false });
    const available = await Tractor.countDocuments({ isAvailable: true, isApproved: true });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        available,
        byType: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload images pour un tracteur
// @route   POST /api/tractors/:id/images
// @access  Private/Owner
exports.uploadImages = async (req, res, next) => {
  try {
    const tractor = await Tractor.findById(req.params.id);

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (tractor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce tracteur'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image fournie'
      });
    }

    // Construire les URLs des images
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const newImages = req.files.map((file, index) => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      isPrimary: tractor.images.length === 0 && index === 0,
    }));

    // Ajouter les nouvelles images
    tractor.images.push(...newImages);
    await tractor.save();

    res.status(200).json({
      success: true,
      message: `${req.files.length} image(s) ajoutée(s)`,
      data: tractor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une image d'un tracteur
// @route   DELETE /api/tractors/:id/images/:imageId
// @access  Private/Owner
exports.deleteImage = async (req, res, next) => {
  try {
    const tractor = await Tractor.findById(req.params.id);

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé'
      });
    }

    if (tractor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const image = tractor.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image non trouvée'
      });
    }

    // Supprimer le fichier physique
    const filename = image.url.split('/uploads/')[1];
    if (filename) {
      const filePath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Retirer du tableau
    tractor.images.pull(req.params.imageId);

    // Si l'image supprimée était la principale, rendre la première restante principale
    if (image.isPrimary && tractor.images.length > 0) {
      tractor.images[0].isPrimary = true;
    }

    await tractor.save();

    res.status(200).json({
      success: true,
      message: 'Image supprimée',
      data: tractor
    });
  } catch (error) {
    next(error);
  }
};
