const axios = require('axios');
const { Client } = require('pg');

const API_URL = 'http://localhost:3000';

async function testCrud() {
  console.log('--- STARTING CRUD TEST FOR USERS ---');

  // 1. LOGIN AS ADMIN
  console.log('\n[1] Logging in as Admin...');
  let token;
  let adminEmail = 'admin@jcuescore.com';
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: adminEmail,
      password: 'admin123'
    });
    token = loginRes.data.access_token;
    console.log(`Login successful as ${adminEmail}!`);
  } catch (err) {
    console.log(`Failed with admin@jcuescore.com, trying admin@correo.com...`);
    try {
      adminEmail = 'admin@correo.com';
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: adminEmail,
        password: 'password123'
      });
      token = loginRes.data.access_token;
      console.log(`Login successful as ${adminEmail}!`);
    } catch (err2) {
      console.error('All admin logins failed!', err2.response?.data || err2.message);
      return;
    }
  }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // 2. CREATE A NEW USER (Test CRUD)
  console.log('\n[2] Creating new user...');
  let newUserId;
  const testEmail = `test_crud_${Date.now()}@jcuescore.com`;
  try {
    const createPayload = {
      name: 'User Test CRUD',
      lastName: 'Soft Delete',
      docType: 'CC',
      docNumber: '12312312',
      email: testEmail,
      password: 'password123',
      isActive: true,
      roleIds: [2]
    };
    const createRes = await axios.post(`${API_URL}/users`, createPayload, authHeader);
    newUserId = createRes.data.id;
    console.log(`User created successfully! ID: ${newUserId}, Email: ${testEmail}`);
    console.log(createRes.data);
  } catch (err) {
    console.error('User creation failed:', err.response?.data || err.message);
    return;
  }

  // 3. EDIT THE CREATED USER
  console.log(`\n[3] Editing user with ID ${newUserId}...`);
  try {
    const editPayload = {
      lastName: 'Soft Delete Modified',
      docNumber: '987987987',
      roleIds: [2]
    };
    const editRes = await axios.put(`${API_URL}/users/${newUserId}`, editPayload, authHeader);
    console.log('User edited successfully!');
    console.log(editRes.data);
  } catch (err) {
    console.error('User edit failed:', err.response?.data || err.message);
    return;
  }

  // 4. SOFT DELETE THE USER
  console.log(`\n[4] Deleting (soft-deactivating) created user ID ${newUserId}...`);
  try {
    const deleteRes = await axios.delete(`${API_URL}/users/${newUserId}`, authHeader);
    console.log('User deleted successfully! Status:', deleteRes.status);
    console.log(deleteRes.data);
  } catch (err) {
    console.error('User deletion failed:', err.response?.data || err.message);
    return;
  }

  // 5. QUERY DATABASE TO VERIFY USER IS ALIVE BUT DEACTIVATED (isActive = false)
  console.log('\n[5] Querying database state for soft-deleted user...');
  const c = new Client({ user: 'root', host: '127.0.0.1', database: 'JcueScore_Db', password: '123456', port: 5432 });
  await c.connect();

  const dbRes = await c.query('SELECT id, name, "lastName", email, "isActive" FROM "user" WHERE id = $1', [newUserId]);
  console.table(dbRes.rows);

  await c.end();

  const isSoftDeleted = dbRes.rows.length > 0 && dbRes.rows[0].isActive === false;
  if (isSoftDeleted) {
    console.log('SUCCESS: Database confirms row remains intact but with "isActive = false"!');
  } else {
    console.error('FAILURE: User is either missing from database or "isActive" is not false.');
  }

  // 6. VERIFY THAT THE GET /users ENDPOINT OMITS THE SOFT-DELETED USER
  console.log('\n[6] Querying GET /users to verify user is omitted from active list...');
  try {
    const listRes = await axios.get(`${API_URL}/users`, authHeader);
    const found = listRes.data.find(u => u.id === newUserId);
    console.log(`Is soft-deleted user ID ${newUserId} in GET /users?`, !!found);
    if (!found) {
      console.log('SUCCESS: Soft-deleted user is cleanly omitted from GET /users list!');
    } else {
      console.error('FAILURE: Soft-deleted user is still present in GET /users list.');
    }
  } catch (err) {
    console.error('Listing users failed:', err.response?.data || err.message);
  }

  // 7. VERIFY THAT THE GET /users/names ENDPOINT OMITS THE SOFT-DELETED USER
  console.log('\n[7] Querying GET /users/names to verify user is omitted...');
  try {
    const namesRes = await axios.get(`${API_URL}/users/names`, authHeader);
    const found = namesRes.data.find(u => u.id === newUserId);
    console.log(`Is soft-deleted user ID ${newUserId} in GET /users/names?`, !!found);
    if (!found) {
      console.log('SUCCESS: Soft-deleted user is cleanly omitted from names dropdown list!');
    } else {
      console.error('FAILURE: Soft-deleted user is still present in names list.');
    }
  } catch (err) {
    console.error('Listing user names failed:', err.response?.data || err.message);
  }

  // 8. VERIFY THAT LOGIN FOR SOFT-DELETED USER FAILS
  console.log('\n[8] Testing login with the soft-deleted user credentials...');
  try {
    await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: 'password123'
    });
    console.error('FAILURE: Logged in successfully as soft-deleted user! (Should be blocked)');
  } catch (err) {
    console.log('SUCCESS: Login failed for soft-deleted user as expected!');
    console.log('Error payload:', err.response?.data || err.message);
  }

  // 9. VERIFY THAT SYSTEM ADMINISTRATORS CANNOT BE DELETED/DEACTIVATED
  console.log('\n[9] Attempting to delete main admin account...');
  try {
    // Find admin user ID from DB first
    const c2 = new Client({ user: 'root', host: '127.0.0.1', database: 'JcueScore_Db', password: '123456', port: 5432 });
    await c2.connect();
    const adminRes = await c2.query('SELECT id FROM "user" WHERE email = $1', [adminEmail]);
    await c2.end();

    if (adminRes.rows.length > 0) {
      const adminId = adminRes.rows[0].id;
      console.log(`Attempting to delete admin account ID ${adminId} (${adminEmail})...`);
      await axios.delete(`${API_URL}/users/${adminId}`, authHeader);
      console.error('FAILURE: Succesfully deleted admin account! (Security guard failed)');
    } else {
      console.log('Skipping admin delete test because admin was not found in DB.');
    }
  } catch (err) {
    console.log('SUCCESS: Delete admin account request was blocked as expected!');
    console.log('Error payload:', err.response?.data || err.message);
  }

  console.log('\n--- CRUD TEST COMPLETED ---');
}

testCrud().catch(console.error);
