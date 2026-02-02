const Notification = require('../models/Notification');

// @desc    Obtenir mes notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const query = { user: req.user.id };
    if (unreadOnly === 'true') query.isRead = false;

    const notifications = await Notification.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Marquer une notification comme lue
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Marquer toutes les notifications comme lues
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer toutes les notifications lues
// @route   DELETE /api/notifications/clear-read
// @access  Private
exports.clearReadNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user.id,
      isRead: true
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notification(s) supprimée(s)`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Envoyer une notification système (admin)
// @route   POST /api/notifications/system
// @access  Private/Admin
exports.sendSystemNotification = async (req, res, next) => {
  try {
    const { userIds, title, message, type = 'system_message' } = req.body;

    if (!userIds || !userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez spécifier des destinataires'
      });
    }

    const notifications = await Promise.all(
      userIds.map(userId =>
        Notification.create({
          user: userId,
          type,
          title,
          message
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${notifications.length} notification(s) envoyée(s)`,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Envoyer une notification à tous les utilisateurs (admin)
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'promotion', role } = req.body;

    const User = require('../models/User');
    const query = { isActive: true };
    if (role) query.role = role;

    const users = await User.find(query).select('_id');
    const userIds = users.map(u => u._id);

    const notifications = await Promise.all(
      userIds.map(userId =>
        Notification.create({
          user: userId,
          type,
          title,
          message
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `Notification envoyée à ${notifications.length} utilisateur(s)`
    });
  } catch (error) {
    next(error);
  }
};
