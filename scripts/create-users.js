const axios = require('axios');

const API_URL = 'http://localhost:3000';

const users = [
  {
    name: 'Admin',
    lastName: 'JcueScore',
    email: 'admin@jcuescore.com',
    password: 'admin123',
    docType: 'CC',
    docNumber: '123456789',
    isActive: true,
    roleIds: [1] // Admin role
  },
  {
    name: 'Pedro',
    lastName: 'García',
    email: 'garitero@jcuescore.com',
    password: 'garitero123',
    docType: 'CC',
    docNumber: '987654321',
    isActive: true,
    roleIds: [3] // Garitero role
  },
  {
    name: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos@jcuescore.com',
    password: 'carlos123',
    docType: 'CC',
    docNumber: '456789123',
    isActive: true,
    roleIds: [2] // User role
  },
  {
    name: 'Andrés',
    lastName: 'Martínez',
    email: 'andres@jcuescore.com',
    password: 'andres123',
    docType: 'CC',
    docNumber: '789123456',
    isActive: true,
    roleIds: [2] // User role
  }
];

async function createUsers() {
  console.log('Creando usuarios de demo...');
  
  for (const user of users) {
    try {
      const response = await axios.post(`${API_URL}/users/register`, user);
      console.log(`Usuario ${user.email} creado exitosamente`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.message?.includes('already exists')) {
        console.log(`Usuario ${user.email} ya existe`);
      } else {
        console.error(`Error creando usuario ${user.email}:`, error.response?.data || error.message);
      }
    }
  }
  
  console.log('¡Usuarios de demo listos para login!');
  console.log('\nCredenciales:');
  console.log('Admin: admin@jcuescore.com / admin123');
  console.log('Garitero: garitero@jcuescore.com / garitero123');
  console.log('Usuario: carlos@jcuescore.com / carlos123');
  console.log('Usuario: andres@jcuescore.com / andres123');
}

createUsers().catch(console.error);
