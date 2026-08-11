const { connectDB, sequelize } = require('../src/config/db');
const User = require('../src/models/User');

const insertUser = async () => {
  await connectDB();
  
  try {
    const [user, created] = await User.findOrCreate({
      where: { username: 'mtellez' },
      defaults: {
        name: 'M Tellez',
        email: 'mtellez@pollofiesta.com', // Dummy email since it's required
        username: 'mtellez',
        password: 'mtellez2026*',
        role: 'Administrador',
        status: 'Activo'
      }
    });

    if (!created) {
      // Update password if user already exists
      user.password = 'mtellez2026*';
      await user.save();
      console.log('User mtellez updated.');
    } else {
      console.log('User mtellez created.');
    }
  } catch (error) {
    console.error('Error inserting user:', error);
  } finally {
    process.exit(0);
  }
};

insertUser();
