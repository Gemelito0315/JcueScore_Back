const axios = require('axios');
const { Client } = require('pg');

const API_URL = 'http://localhost:3000';

async function testCrud() {
  console.log('--- STARTING CRUD TEST FOR RESOURCES ---');

  // 1. LOGIN AS ADMIN
  console.log('\n[1] Logging in as Admin...');
  let token;
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@jcuescore.com',
      password: 'admin123'
    });
    token = loginRes.data.access_token;
    console.log('Login successful! Token:', token.substring(0, 15) + '...');
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    return;
  }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // 2. CREATE A NEW RESOURCE (Mesa Test CRUD)
  console.log('\n[2] Creating new resource "Mesa Test"...');
  let newResourceId;
  try {
    const createPayload = {
      venueId: 1,
      gameTypeId: 1, // Billar
      code: 'Mesa Test CRUD',
      status: 'available',
      pricePerHour: 15000,
      specifications: { size: 'grande' }
    };
    const createRes = await axios.post(`${API_URL}/recursos`, createPayload, authHeader);
    newResourceId = createRes.data.id;
    console.log(`Resource created successfully! ID: ${newResourceId}`);
    console.log(createRes.data);
  } catch (err) {
    console.error('Creation failed:', err.response?.data || err.message);
    return;
  }

  // 3. EDIT THE CREATED RESOURCE
  console.log(`\n[3] Editing resource with ID ${newResourceId}...`);
  try {
    const editPayload = {
      pricePerHour: 18000,
      status: 'maintenance'
    };
    const editRes = await axios.put(`${API_URL}/recursos/${newResourceId}`, editPayload, authHeader);
    console.log('Resource edited successfully!');
    console.log(editRes.data);
  } catch (err) {
    console.error('Update failed:', err.response?.data || err.message);
    return;
  }

  // 4. DELETE THE CREATED RESOURCE (Soft Delete)
  console.log(`\n[4] Deleting created resource ID ${newResourceId}...`);
  try {
    const deleteRes = await axios.delete(`${API_URL}/recursos/${newResourceId}`, authHeader);
    console.log('Resource deleted successfully!', deleteRes.status);
    console.log(deleteRes.data);
  } catch (err) {
    console.error('Deletion failed:', err.response?.data || err.message);
  }

  // 5. TEST SOFT DELETING THE PREVIOUSLY FAILING RESOURCE ID 27
  console.log('\n[5] Attempting soft delete on ID 27...');
  try {
    const delete27Res = await axios.delete(`${API_URL}/recursos/27`, authHeader);
    console.log('Resource 27 deleted successfully!', delete27Res.status);
    console.log(delete27Res.data);
  } catch (err) {
    console.error('Deletion of 27 failed:', err.response?.data || err.message);
  }

  // 6. QUERY DATABASE TO VERIFY SYSTEM STATE
  console.log('\n[6] Querying database state for deleted items...');
  const c = new Client({ user: 'root', host: '127.0.0.1', database: 'JcueScore_Db', password: '123456', port: 5432 });
  await c.connect();

  const dbRes = await c.query('SELECT id, code, "isActive", status FROM resource WHERE id IN ($1, 27) ORDER BY id', [newResourceId]);
  console.table(dbRes.rows);

  await c.end();

  // 7. VERIFY THAT THE GET ENDPOINT OMITS DELETED RESOURCES
  console.log('\n[7] Querying GET /recursos to verify omitted soft-deleted resources...');
  try {
    const listRes = await axios.get(`${API_URL}/recursos`);
    const foundNew = listRes.data.find(r => r.id === newResourceId);
    const found27 = listRes.data.find(r => r.id === 27);
    console.log(`Is created resource ID ${newResourceId} in list?`, !!foundNew);
    console.log(`Is resource ID 27 in list?`, !!found27);
    if (!foundNew && !found27) {
      console.log('\nSUCCESS: Both soft-deleted resources are cleanly omitted from API results!');
    } else {
      console.error('\nFAILURE: One or both soft-deleted resources are still present in API list.');
    }
  } catch (err) {
    console.error('Listing failed:', err.response?.data || err.message);
  }

  console.log('\n--- CRUD TEST COMPLETED ---');
}

testCrud().catch(console.error);
