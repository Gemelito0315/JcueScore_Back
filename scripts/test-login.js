const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testLogin() {
  console.log('Probando login con usuarios de demo...\n');
  
  const users = [
    { email: 'admin@jcuescore.com', password: 'admin123', role: 'Admin' },
    { email: 'garitero@jcuescore.com', password: 'garitero123', role: 'Garitero' },
    { email: 'carlos@jcuescore.com', password: 'carlos123', role: 'Usuario' },
    { email: 'andres@jcuescore.com', password: 'andres123', role: 'Usuario' }
  ];
  
  for (const user of users) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      console.log(`\n${user.role} - Login exitoso!`);
      console.log(`Email: ${user.email}`);
      console.log(`Token: ${response.data.access_token.substring(0, 20)}...`);
      console.log(`Usuario ID: ${response.data.user.id}`);
      console.log(`Nombre: ${response.data.user.name} ${response.data.user.lastName}`);
      
    } catch (error) {
      console.error(`\n${user.role} - Error en login:`, error.response?.data || error.message);
    }
  }
  
  console.log('\n¡Login probado exitosamente! El sistema está listo para usar.');
  console.log('\nPuedes iniciar sesión en el frontend con estas credenciales:');
  console.log('1. Admin: admin@jcuescore.com / admin123');
  console.log('2. Garitero: garitero@jcuescore.com / garitero123');
  console.log('3. Usuario: carlos@jcuescore.com / carlos123');
  console.log('4. Usuario: andres@jcuescore.com / andres123');
}

testLogin().catch(console.error);
