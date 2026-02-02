const Tractor = require('../models/Tractor');

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
      isAvailable,
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
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) query.pricePerDay.$lte = parseInt(maxPrice);
    }
    if (minPower || maxPower) {
      query.power = {};
      if (minPower) query.power.$gte = parseInt(minPower);
      if (maxPower) query.power.$lte = parseInt(maxPower);
    }

    let tractors;

    // Recherche géographique si coordonnées fournies
    if (latitude && longitude) {
      tractors = await Tractor.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseInt(maxDistance)
          }
        }
      })
        .populate('owner', 'nom prenom telephone rating')
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
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
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
        address: req.body.address || '',
        ville: req.body.ville || '',
        region: req.body.region || ''
      };
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
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
        address: req.body.address || tractor.location?.address,
        ville: req.body.ville || tractor.location?.ville,
        region: req.body.region || tractor.location?.region
      };
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

    tractor.isAvailable = !tractor.isAvailable;
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
          avgPrice: { $avg: '$pricePerDay' },
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
