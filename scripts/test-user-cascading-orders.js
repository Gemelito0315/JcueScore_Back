const axios = require('axios');
const { Client } = require('pg');

const API_URL = 'http://localhost:3000';

async function testCascading() {
  console.log('--- STARTING CASCADING DELETION & SECURE ISOLATION TEST ---');

  // 1. LOGIN AS ADMIN
  console.log('\n[1] Logging in as Admin...');
  let adminToken;
  let adminEmail = 'admin@jcuescore.com';
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: adminEmail,
      password: 'admin123'
    });
    adminToken = loginRes.data.access_token;
    console.log(`Login successful as ${adminEmail}!`);
  } catch (err) {
    try {
      adminEmail = 'admin@correo.com';
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: adminEmail,
        password: 'password123'
      });
      adminToken = loginRes.data.access_token;
      console.log(`Login successful as ${adminEmail}!`);
    } catch (err2) {
      console.error('All admin logins failed!', err2.response?.data || err2.message);
      return;
    }
  }

  const adminAuth = { headers: { Authorization: `Bearer ${adminToken}` } };

  // 2. CREATE A NEW USER (Independent profile)
  console.log('\n[2] Registering a new player account...');
  let newUserId;
  const userEmail = `player_${Date.now()}@jcuescore.com`;
  const userPassword = 'password123';
  try {
    const registerPayload = {
      name: 'Independent',
      lastName: 'Player',
      docType: 'CC',
      docNumber: '99887766',
      email: userEmail,
      password: userPassword,
      isActive: true,
      roleIds: [2] // regular player role
    };
    const registerRes = await axios.post(`${API_URL}/users`, registerPayload, adminAuth);
    newUserId = registerRes.data.id;
    console.log(`Player created successfully! ID: ${newUserId}, Email: ${userEmail}`);
  } catch (err) {
    console.error('Player registration failed:', err.response?.data || err.message);
    return;
  }

  // 3. LOGIN AS THE NEW USER
  console.log('\n[3] Logging in as the newly created player...');
  let userToken;
  try {
    const loginUserRes = await axios.post(`${API_URL}/auth/login`, {
      email: userEmail,
      password: userPassword
    });
    userToken = loginUserRes.data.access_token;
    console.log('Login successful! Fetched user JWT token.');
  } catch (err) {
    console.error('Player login failed:', err.response?.data || err.message);
    return;
  }

  const userAuth = { headers: { Authorization: `Bearer ${userToken}` } };

  // 4. VERIFY THAT THE NEW USER HAS 0 HISTORIC ORDERS (Secure Isolation)
  console.log('\n[4] Querying GET /pedidos as the new player...');
  try {
    const ordersRes = await axios.get(`${API_URL}/pedidos`, userAuth);
    console.log(`Orders returned for new player: ${ordersRes.data.length}`);
    if (ordersRes.data.length === 0) {
      console.log('SUCCESS: Newly created player has exactly 0 orders, keeping full data isolation!');
    } else {
      console.error('FAILURE: New player loaded orders belonging to other users!', ordersRes.data);
    }
  } catch (err) {
    console.error('Failed to load player orders:', err.response?.data || err.message);
  }

  // 5. FIND AN ACTIVE PRODUCT ID AND CREATE A PENDING ORDER FOR THE NEW USER
  console.log('\n[5] Placing a new pending order for the player...');
  let orderId;
  let productId = 1; // fallback
  try {
    const cProd = new Client({ user: 'root', host: '127.0.0.1', database: 'JcueScore_Db', password: '123456', port: 5432 });
    await cProd.connect();
    const prodRes = await cProd.query('SELECT id FROM product WHERE "isActive" = true LIMIT 1');
    await cProd.end();
    if (prodRes.rows.length > 0) {
      productId = prodRes.rows[0].id;
      console.log(`Found active product ID dynamically from DB: ${productId}`);
    } else {
      console.log(`No active products found in DB, using fallback ID: ${productId}`);
    }
  } catch (errDb) {
    console.error('Failed to query active product ID:', errDb.message);
  }

  try {
    const orderPayload = {
      items: [
        { productId: productId, cantidad: 1, notas: 'Sin azúcar' }
      ],
      recursoId: 1, // table 1
      notas: 'Entrega rápida',
      metodoPago: 'cuenta_mesa'
    };
    const orderRes = await axios.post(`${API_URL}/pedidos`, orderPayload, userAuth);
    orderId = orderRes.data.id;
    console.log(`Order created successfully! ID: ${orderId}, Status: ${orderRes.data.estado}`);
  } catch (err) {
    console.error('Failed to create order:', err.response?.data || err.message);
    return;
  }

  // 6. VERIFY THE USER NOW SEES EXACTLY THEIR OWN 1 ORDER
  console.log('\n[6] Re-querying GET /pedidos as the player...');
  try {
    const ordersRes = await axios.get(`${API_URL}/pedidos`, userAuth);
    console.log(`Orders returned for player: ${ordersRes.data.length}`);
    const ownOrder = ordersRes.data.find(o => o.id === orderId);
    if (ordersRes.data.length === 1 && ownOrder) {
      console.log(`SUCCESS: Player only sees their own active order (ID: ${orderId})!`);
    } else {
      console.error('FAILURE: Isolation breached or own order not returned.', ordersRes.data);
    }
  } catch (err) {
    console.error('Failed to query orders:', err.response?.data || err.message);
  }

  // 7. ADMIN SOFT-DELETES THE USER
  console.log(`\n[7] Admin soft-deleting player account ID ${newUserId}...`);
  try {
    const deleteUserRes = await axios.delete(`${API_URL}/users/${newUserId}`, adminAuth);
    console.log('Player deleted/deactivated successfully!', deleteUserRes.status);
  } catch (err) {
    console.error('Failed to delete player:', err.response?.data || err.message);
  }

  // 8. VERIFY PENDING ORDER WAS AUTOMATICALLY CANCELED (Cascading Cancellation)
  console.log('\n[8] Querying database state for the deleted player\'s pending orders...');
  const c = new Client({ user: 'root', host: '127.0.0.1', database: 'JcueScore_Db', password: '123456', port: 5432 });
  await c.connect();

  const dbRes = await c.query('SELECT id, "usuarioId", estado, notas FROM pedidos WHERE id = $1', [orderId]);
  console.table(dbRes.rows);

  await c.end();

  const isCanceled = dbRes.rows.length > 0 && dbRes.rows[0].estado === 'cancelado';
  if (isCanceled) {
    console.log('SUCCESS: Cascading cancellation verified! Pending order was automatically updated to "cancelado".');
  } else {
    console.error('FAILURE: Pending order state was not canceled.', dbRes.rows);
  }

  // 9. VERIFY CANCELED ORDER IS NOT SHOWN IN ACTIVE ORDERS
  console.log('\n[9] Querying GET /pedidos/activos to verify order is hidden...');
  try {
    const activeRes = await axios.get(`${API_URL}/pedidos/activos`);
    const found = activeRes.data.find(o => o.id === orderId);
    console.log(`Is the canceled order ID ${orderId} in active queue?`, !!found);
    if (!found) {
      console.log('SUCCESS: Canceled order is completely omitted from the active preparation queue!');
    } else {
      console.error('FAILURE: Canceled order is still present in active queue.');
    }
  } catch (err) {
    console.error('Failed to query active orders:', err.response?.data || err.message);
  }

  // 10. VERIFY THAT THE GARITERO CAN STILL LOAD IT IN THE COMPLETE HISTORY
  console.log('\n[10] Querying GET /pedidos as Admin/Garitero to verify complete history...');
  try {
    const historyRes = await axios.get(`${API_URL}/pedidos`, adminAuth);
    const found = historyRes.data.find(o => o.id === orderId);
    console.log(`Is the canceled order ID ${orderId} in garitero's complete history?`, !!found);
    if (found && found.estado === 'cancelado') {
      console.log('SUCCESS: Garitero retains full, complete history of all orders (including canceled orders of deactivated users)!');
    } else {
      console.error('FAILURE: Order not found or state is incorrect in complete history.', found);
    }
  } catch (err) {
    console.error('Failed to load complete history:', err.response?.data || err.message);
  }

  console.log('\n--- CASCADING & SECURE ISOLATION TEST COMPLETED ---');
}

testCascading().catch(console.error);
