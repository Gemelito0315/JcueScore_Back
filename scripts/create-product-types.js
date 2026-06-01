const axios = require('axios');

const API_URL = 'http://localhost:3000';

// Login como admin para obtener token
async function getAdminToken() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@jcuescore.com',
      password: 'admin123'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error en login admin:', error.response?.data || error.message);
    throw error;
  }
}

// Tipos de producto básicos
const productTypes = [
  { name: 'Bebidas', description: 'Refrescos, jugos y bebidas diversas' },
  { name: 'Snacks', description: 'Papas, nachos y aperitivos' },
  { name: 'Comida', description: 'Platos completos y sandwiches' },
  { name: 'Café', description: 'Cafés y bebidas calientes' },
  { name: 'Postres', description: 'Dulces y postres' }
];

async function createProductTypes() {
  console.log('Creando tipos de producto...');
  
  try {
    const token = await getAdminToken();
    console.log('Token obtenido exitosamente');
    
    for (const productType of productTypes) {
      try {
        const response = await axios.post(`${API_URL}/product-types`, productType, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Tipo de producto ${productType.name} creado exitosamente`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.message?.includes('already exists')) {
          console.log(`Tipo de producto ${productType.name} ya existe`);
        } else {
          console.error(`Error creando tipo de producto ${productType.name}:`, error.response?.data || error.message);
        }
      }
    }
    
    console.log('¡Tipos de producto creados exitosamente!');
    
  } catch (error) {
    console.error('Error general:', error.message);
  }
}

createProductTypes().catch(console.error);
