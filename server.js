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

const ORDERS_FILE = path.join(__dirname, 'orders.json');
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));

function getOrders()   { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); }
function saveOrders(o) { fs.writeFileSync(ORDERS_FILE, JSON.stringify(o, null, 2)); }

// Produk data + link download
const PRODUCTS = [
    { id:1,  cat:'plugin', catLabel:'Plugin',  name:'Items Adder',           desc:'✨ItemsAdder⭐Emotes, Mobs, Items, Armors, HUD, GUI, Emojis, Blocks, Wings, Hats, Liquids',  price:'Rp 20.000',     rawPrice:20000,  img:'images/product-1.jpg',  badge:'HOT', downloadLink:'https://drive.google.com/file/d/1h06htqdhf3AUb_vcFwHsHbiIWRwY968b/view?usp=drivesdk' },
    { id:2,  cat:'plugin', catLabel:'Plugin',  name:'MMO Items',              desc:'MMO ITEMS ⚔️ Custom Skill item. Version 1.8 - 1.21.11.',                                      price:'Rp 15.000',     rawPrice:15000,  img:'images/product-2.jpg',  badge:'HOT', downloadLink:'https://drive.google.com/file/d/14s1nO2LNrm80DxphuE8R9MIDLGKdIQ4P/view?usp=drivesdk' },
    { id:3,  cat:'plugin', catLabel:'Plugin',  name:'Vulkan Anti Cheat',      desc:'VULKAN ANTI CHEAT. Version 1.8-26.1.',                                     price:'Rp 15.000',     rawPrice:15000,  img:'images/product-3.jpg',  badge:'NEW', downloadLink:'https://drive.google.com/file/d/1Yw35MlOppj3-rSTw_R3okL7iqwLD0nLE/view?usp=drivesdk' },
    { id:4,  cat:'plugin', catLabel:'Plugin',  name:'Citizen',           desc:'Citizen. Npc premium plugin,all version.',                                        price:'Rp 15.000',     rawPrice:15000,  img:'images/product-4.jpg',  badge:'',    downloadLink:'https://drive.google.com/file/d/1QpvD8n5eCocqwe08k4urnv_tNXyUbHPe/view?usp=drivesdk' },
    { id:5,  cat:'asset',  catLabel:'Asset',   name:'Resource Pack Premium',  desc:'Pack texture HD 128x128 dengan visual menakjubkan.',                                          price:'Rp 15.000',     rawPrice:15000,  img:'images/product-5.jpg',  badge:'',    downloadLink:'https://drive.google.com/your-link-5' },
    { id:6,  cat:'asset',  catLabel:'Asset',   name:'Custom Map Lobby',       desc:'Map lobby server Minecraft custom desain profesional.',                                       price:'Rp 30.000',     rawPrice:30000,  img:'images/product-6.jpg',  badge:'HOT', downloadLink:'https://drive.google.com/your-link-6' },
    { id:7,  cat:'asset',  catLabel:'Asset',   name:'Particle Effect Pack',   desc:'Kumpulan efek partikel custom untuk server kamu.',                                            price:'Rp 12.000',     rawPrice:12000,  img:'images/product-7.jpg',  badge:'',    downloadLink:'https://drive.google.com/your-link-7' },
    { id:8,  cat:'backup', catLabel:'Backup',  name:'Superior Survival - Oceanic Lab',          desc:'1.21.1 Backup server survival .',                                        price:'Rp 20.000/bln', rawPrice:20000,  img:'images/product-8.jpg',  badge:'',    downloadLink:'https://www.mediafire.com/file/vuzqi267ydin08t/Superior_Survival_2.0.0.zip/file',
    { id:9,  cat:'backup', catLabel:'Backup',  name:'Backup Realtime',        desc:'Backup tiap 6 jam dengan restore instan.',                                                    price:'Rp 50.000/bln', rawPrice:50000,  img:'images/product-9.jpg',  badge:'PRO', downloadLink:'https://wa.me/6282298673652' },
    { id:10, cat:'jasa',   catLabel:'Jasa',    name:'Website Landing Page',   desc:'Website landing page profesional untuk server kamu.',                                         price:'Rp 150.000',    rawPrice:150000, img:'images/product-10.jpg', badge:'',    downloadLink:'https://wa.me/6282298673652' },
    { id:11, cat:'jasa',   catLabel:'Jasa',    name:'Website Toko Online',    desc:'Website toko online lengkap dengan sistem pembayaran.',                                       price:'Rp 300.000',    rawPrice:300000, img:'images/product-11.jpg', badge:'',    downloadLink:'https://wa.me/6282298673652' },
    { id:12, cat:'jasa',   catLabel:'Jasa',    name:'Bot Discord',            desc:'Bot Discord custom untuk server Minecraft kamu.',                                             price:'Rp 100.000',    rawPrice:100000, img:'images/product-12.jpg', badge:'NEW', downloadLink:'https://wa.me/6282298673652' },
];

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
    res.json({ success: true, products: PRODUCTS.map(p => ({ ...p, downloadLink: undefined })) });
});

// ─── API: Session user info (dipanggil client untuk tahu siapa yg login) ──────
// Mengembalikan data user Clerk agar halaman-halaman lain bisa pakai
app.get('/api/me', (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.json({ success: false, user: null });
    // username & email diisi client-side dari Clerk JS SDK,
    // di sini cukup kembalikan userId
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
    // User hanya bisa lihat order miliknya sendiri
    if (userId !== req.params.userId) return res.status(403).json({ success: false, message: 'Forbidden' });
    const orders = getOrders().filter(o => String(o.userId) === String(req.params.userId));
    res.json({ success: true, orders });
});

// ─── API: Download link (only paid orders) ────────────────────────────────────
app.get('/api/download/:orderId', requireAuth(), (req, res) => {
    const { userId } = getAuth(req);
    const orders = getOrders();
    const order  = orders.find(o => o.orderId === req.params.orderId);
    if (!order)  return res.json({ success: false, message: 'Order tidak ditemukan!' });
    if (order.userId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (order.status !== 'paid') return res.json({ success: false, message: 'Pembayaran belum dikonfirmasi!' });
    const product = PRODUCTS.find(p => p.id === order.productId);
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
