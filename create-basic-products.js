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

// Productos básicos de demo - vamos a crearlos directamente con el servicio de productos
const basicProducts = [
  { name: 'Coca-Cola 350ml', description: 'Bebida gaseosa cola', sku: 'CC350', price: 3000, cost: 1500, stock: 50, minStock: 10, unit: 'unidad', brand: 'Coca-Cola', presentation: '350ml', venueId: 1, productTypeId: 1 },
  { name: 'Coca-Cola 500ml', description: 'Bebida gaseosa cola', sku: 'CC500', price: 4000, cost: 2000, stock: 40, minStock: 8, unit: 'unidad', brand: 'Coca-Cola', presentation: '500ml', venueId: 1, productTypeId: 1 },
  { name: 'Cerveza Aguila 350ml', description: 'Cerveza lager', sku: 'AG350', price: 4000, cost: 2500, stock: 30, minStock: 6, unit: 'unidad', brand: 'Bavaria', presentation: '350ml', venueId: 1, productTypeId: 1 },
  { name: 'Agua Purificada 500ml', description: 'Agua purificada', sku: 'AP500', price: 2000, cost: 800, stock: 60, minStock: 12, unit: 'unidad', brand: 'Cristal', presentation: '500ml', venueId: 1, productTypeId: 1 },
  { name: 'Jugo Natural Naranja', description: 'Jugo fresco de naranja', sku: 'JN500', price: 5000, cost: 2000, stock: 25, minStock: 5, unit: 'unidad', brand: 'Casa', presentation: '500ml', venueId: 1, productTypeId: 1 },
  { name: 'Papas Margarita Limón', description: 'Papas de maíz con sabor limón', sku: 'PM45', price: 2500, cost: 1200, stock: 80, minStock: 15, unit: 'unidad', brand: 'Margarita', presentation: '45g', venueId: 1, productTypeId: 2 },
  { name: 'Papas Margarita Queso', description: 'Papas de maíz con sabor queso', sku: 'PMQ45', price: 2500, cost: 1200, stock: 75, minStock: 15, unit: 'unidad', brand: 'Margarita', presentation: '45g', venueId: 1, productTypeId: 2 },
  { name: 'Nachos con Queso', description: 'Nachos con queso derretido', sku: 'NQ150', price: 12000, cost: 6000, stock: 15, minStock: 3, unit: 'porción', brand: 'Casa', presentation: '150g', venueId: 1, productTypeId: 2 },
  { name: 'Sandwich Jamón Queso', description: 'Sandwich con jamón y queso', sku: 'SJQ', price: 8000, cost: 4000, stock: 10, minStock: 2, unit: 'unidad', brand: 'Casa', presentation: 'Completo', venueId: 1, productTypeId: 3 },
  { name: 'Hamburguesa Completa', description: 'Hamburguesa con carne, lechuga, tomate', sku: 'HB', price: 15000, cost: 8000, stock: 8, minStock: 2, unit: 'unidad', brand: 'Casa', presentation: 'Completa', venueId: 1, productTypeId: 3 },
  { name: 'Perro Caliente', description: 'Perro caliente con todos los ingredientes', sku: 'PC', price: 10000, cost: 5000, stock: 12, minStock: 2, unit: 'unidad', brand: 'Casa', presentation: 'Completo', venueId: 1, productTypeId: 3 },
  { name: 'Café Americano', description: 'Café negro americano', sku: 'CA200', price: 2000, cost: 800, stock: 100, minStock: 20, unit: 'unidad', brand: 'Casa', presentation: '200ml', venueId: 1, productTypeId: 4 },
  { name: 'Café con Leche', description: 'Café con leche vaporizada', sku: 'CL250', price: 3000, cost: 1200, stock: 80, minStock: 15, unit: 'unidad', brand: 'Casa', presentation: '250ml', venueId: 1, productTypeId: 4 },
  { name: 'Brownie Chocolate', description: 'Brownie de chocolate', sku: 'BR', price: 6000, cost: 3000, stock: 20, minStock: 4, unit: 'unidad', brand: 'Casa', presentation: '80g', venueId: 1, productTypeId: 5 }
];

async function createBasicProducts() {
  console.log('Creando productos básicos de demo...');
  
  try {
    const token = await getAdminToken();
    console.log('Token obtenido exitosamente');
    
    // Primero vamos a verificar si ya hay productos
    try {
      const existingProducts = await axios.get(`${API_URL}/productos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (existingProducts.data.length > 0) {
        console.log(`Ya existen ${existingProducts.data.length} productos en la base de datos`);
        console.log('Productos existentes:');
        existingProducts.data.slice(0, 5).forEach((p, i) => {
          console.log(`${i+1}. ${p.name} - $${p.price}`);
        });
        return;
      }
    } catch (error) {
      console.log('No se pudieron verificar productos existentes, intentando crear...');
    }
    
    // Crear productos uno por uno
    for (const product of basicProducts) {
      try {
        const response = await axios.post(`${API_URL}/productos`, product, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Producto ${product.name} creado exitosamente`);
      } catch (error) {
        console.log(`Error creando producto ${product.name}:`, error.response?.data?.message || error.message);
      }
    }
    
    // Verificar productos creados
    try {
      const verifyResponse = await axios.get(`${API_URL}/productos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`\nTotal de productos en la base de datos: ${verifyResponse.data.length}`);
      console.log('Primeros 5 productos:');
      verifyResponse.data.slice(0, 5).forEach((p, i) => {
        console.log(`${i+1}. ${p.name} - $${p.price}`);
      });
    } catch (error) {
      console.error('Error verificando productos:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Error general:', error.message);
  }
}

createBasicProducts().catch(console.error);
