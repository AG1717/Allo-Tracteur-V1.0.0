const mongoose = require('mongoose');

const connectDB = async () => {
  try {
<<<<<<< HEAD
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://benoitsagna7_db_user:HSOCmgZUlccuqDHG@allotracteur.snta9d5.mongodb.net/a');
=======
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Options recommandées pour Mongoose 8+
    });
>>>>>>> 6e75dcef8fb8a0aa421ca89a4d89729b26293ade

    console.log(`MongoDB connecté: ${conn.connection.host}`);

    // Événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB déconnecté');
    });

    // Gestion propre de la fermeture
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
