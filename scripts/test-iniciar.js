const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testIniciar() {
  console.log('Logging in...');
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@jcuescore.com',
    password: 'admin123'
  });
  const token = loginRes.data.access_token;
  console.log('Login successful! Token acquired.');

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  try {
    const payload = {
      resourceId: 2, // Mesa 2
      jugadores: ['asd', 'das'],
      startTime: new Date().toISOString()
    };
    console.log('Payload:', payload);
    const res = await axios.post(`${API_URL}/partidas/iniciar`, payload, authHeader);
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error starting match:', err.response?.data || err.message);
  }
}

testIniciar().catch(console.error);
