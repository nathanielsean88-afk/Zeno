const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express');

const app  = express();
const PORT = process.env.PORT || 3000;

// Clerk middleware (baca CLERK_PUBLISHABLE_KEY & CLERK_SECRET_KEY dari env otomatis)
app.use(clerkMiddleware());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ORDERS_FILE   = path.join(__dirname, 'orders.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));

function getOrders()   { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); }
function saveOrders(o) { fs.writeFileSync(ORDERS_FILE, JSON.stringify(o, null, 2)); }

// Baca produk dari products.json (bukan hardcode lagi)
// Edit deskripsi, foto, harga, dll langsung di products.json saja!
function getProducts() {
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
}

// ─── Pages ────────────────────────────────────────────────────────────────────
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login',     (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/products',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'products.html')));
app.get('/checkout',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout.html')));
app.get('/orders',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'orders.html')));
app.get('/admin',     (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ─── API: Get products (public) ───────────────────────────────────────────────
app.get('/api/products', (req, res) => {
    const PRODUCTS = getProducts();
    res.json({ success: true, products: PRODUCTS.map(p => ({ ...p, downloadLink: undefined })) });
});

// ─── API: Session user info (dipanggil client untuk tahu siapa yg login) ──────
app.get('/api/me', (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.json({ success: false, user: null });
    res.json({ success: true, userId });
});

// ─── API: Create order (butuh login) ─────────────────────────────────────────
app.post('/api/order', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    const { username, email, productId, productName, price, paymentMethod } = req.body;
    const orders  = getOrders();
    const orderId = 'ZNO' + Date.now();
    orders.push({ orderId, userId, username, email, productId, productName, price, paymentMethod, status: 'pending', createdAt: new Date().toISOString() });
    saveOrders(orders);
    res.json({ success: true, orderId });
});

// ─── API: Confirm payment ─────────────────────────────────────────────────────
app.post('/api/confirm-payment', requireAuth(), (req, res) => {
    const { orderId, buktiUrl } = req.body;
    const orders = getOrders();
    const idx    = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    orders[idx].status      = 'confirming';
    orders[idx].buktiUrl    = buktiUrl;
    orders[idx].confirmedAt = new Date().toISOString();
    saveOrders(orders);
    res.json({ success: true });
});

// ─── API: Get orders by user ──────────────────────────────────────────────────
app.get('/api/orders/:userId', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    if (userId !== req.params.userId) return res.status(403).json({ success: false, message: 'Forbidden' });
    const orders = getOrders().filter(o => String(o.userId) === String(req.params.userId));
    res.json({ success: true, orders });
});

// ─── API: Download link (only paid orders) ────────────────────────────────────
app.get('/api/download/:orderId', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    const orders  = getOrders();
    const order   = orders.find(o => o.orderId === req.params.orderId);
    if (!order)  return res.json({ success: false, message: 'Order tidak ditemukan!' });
    if (order.userId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (order.status !== 'paid') return res.json({ success: false, message: 'Pembayaran belum dikonfirmasi!' });
    const PRODUCTS = getProducts();
    const product  = PRODUCTS.find(p => p.id === order.productId);
    if (!product) return res.json({ success: false, message: 'Produk tidak ditemukan!' });
    res.json({ success: true, downloadLink: product.downloadLink, productName: product.name });
});

// ─── API: Admin - get all orders ──────────────────────────────────────────────
app.get('/api/admin/orders', (req, res) => {
    res.json({ success: true, orders: getOrders().slice().reverse() });
});

// ─── API: Admin - approve order ───────────────────────────────────────────────
app.post('/api/admin/approve', (req, res) => {
    const { orderId } = req.body;
    const orders = getOrders();
    const idx    = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    orders[idx].status     = 'paid';
    orders[idx].approvedAt = new Date().toISOString();
    saveOrders(orders);
    res.json({ success: true });
});

// ─── API: Admin - reject order ────────────────────────────────────────────────
app.post('/api/admin/reject', (req, res) => {
    const { orderId } = req.body;
    const orders = getOrders();
    const idx    = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    orders[idx].status     = 'cancelled';
    orders[idx].rejectedAt = new Date().toISOString();
    saveOrders(orders);
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Zeno Store berjalan di http://localhost:${PORT}`);
});
