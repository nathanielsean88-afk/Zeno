const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const USERS_FILE  = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

if (!fs.existsSync(USERS_FILE))  fs.writeFileSync(USERS_FILE,  JSON.stringify([]));
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));

function getUsers()      { return JSON.parse(fs.readFileSync(USERS_FILE,  'utf8')); }
function saveUsers(u)    { fs.writeFileSync(USERS_FILE,  JSON.stringify(u, null, 2)); }
function getOrders()     { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); }
function saveOrders(o)   { fs.writeFileSync(ORDERS_FILE, JSON.stringify(o, null, 2)); }

// Produk data + link download (edit sesuai produk kamu!)
const PRODUCTS = [
    { id:1,  cat:'plugin', catLabel:'Plugin',  name:'Items Adder',           desc:'✨ItemsAdder⭐Emotes, Mobs, Items, Armors, HUD, GUI, Emojis, Blocks, Wings, Hats, Liquids',  price:'Rp 20.000',     rawPrice:20000,  img:'images/product-1.jpg',  badge:'HOT', downloadLink:'https://drive.google.com/file/d/1h06htqdhf3AUb_vcFwHsHbiIWRwY968b/view?usp=drivesdk' },
    { id:2,  cat:'plugin', catLabel:'Plugin',  name:'MMO Items',              desc:'MMO ITEMS ⚔️ Custom Skill item. Version 1.8 - 1.21.11.',                                      price:'Rp 15.000',     rawPrice:15000,  img:'images/product-2.jpg',  badge:'HOT', downloadLink:'https://drive.google.com/file/d/14s1nO2LNrm80DxphuE8R9MIDLGKdIQ4P/view?usp=drivesdk' },
    { id:3,  cat:'plugin', catLabel:'Plugin',  name:'Vulkan Anti Cheat',      desc:'VULKAN ANTI CHEAT. Version 1.8-26.1.',                                     price:'Rp 15.000',     rawPrice:15000,  img:'images/product-3.jpg',  badge:'NEW', downloadLink:'https://drive.google.com/file/d/1Yw35MlOppj3-rSTw_R3okL7iqwLD0nLE/view?usp=drivesdk' },
    { id:4,  cat:'plugin', catLabel:'Plugin',  name:'Citizen',           desc:'Citizen. Npc premium plugin,all version.',                                        price:'Rp 15.000',     rawPrice:15000,  img:'images/product-4.jpg',  badge:'',    downloadLink:'https://drive.google.com/file/d/1QpvD8n5eCocqwe08k4urnv_tNXyUbHPe/view?usp=drivesdk' },
    { id:5,  cat:'asset',  catLabel:'Asset',   name:'Resource Pack Premium',  desc:'Pack texture HD 128x128 dengan visual menakjubkan.',                                          price:'Rp 15.000',     rawPrice:15000,  img:'images/product-5.jpg',  badge:'',    downloadLink:'https://drive.google.com/your-link-5' },
    { id:6,  cat:'asset',  catLabel:'Asset',   name:'Custom Map Lobby',       desc:'Map lobby server Minecraft custom desain profesional.',                                       price:'Rp 30.000',     rawPrice:30000,  img:'images/product-6.jpg',  badge:'HOT', downloadLink:'https://drive.google.com/your-link-6' },
    { id:7,  cat:'asset',  catLabel:'Asset',   name:'Particle Effect Pack',   desc:'Kumpulan efek partikel custom untuk server kamu.',                                            price:'Rp 12.000',     rawPrice:12000,  img:'images/product-7.jpg',  badge:'',    downloadLink:'https://drive.google.com/your-link-7' },
    { id:8,  cat:'backup', catLabel:'Backup',  name:'Backup Harian',          desc:'Backup otomatis tiap hari, disimpan 7 hari terakhir.',                                        price:'Rp 25.000/bln', rawPrice:25000,  img:'images/product-8.jpg',  badge:'',    downloadLink:'https://wa.me/6282298673652' },
    { id:9,  cat:'backup', catLabel:'Backup',  name:'Backup Realtime',        desc:'Backup tiap 6 jam dengan restore instan.',                                                    price:'Rp 50.000/bln', rawPrice:50000,  img:'images/product-9.jpg',  badge:'PRO', downloadLink:'https://wa.me/6282298673652' },
    { id:10, cat:'jasa',   catLabel:'Jasa',    name:'Website Landing Page',   desc:'Website landing page profesional untuk server kamu.',                                         price:'Rp 150.000',    rawPrice:150000, img:'images/product-10.jpg', badge:'',    downloadLink:'https://wa.me/6282298673652' },
    { id:11, cat:'jasa',   catLabel:'Jasa',    name:'Website Toko Online',    desc:'Website toko online lengkap dengan sistem pembayaran.',                                       price:'Rp 300.000',    rawPrice:300000, img:'images/product-11.jpg', badge:'',    downloadLink:'https://wa.me/6282298673652' },
    { id:12, cat:'jasa',   catLabel:'Jasa',    name:'Bot Discord',            desc:'Bot Discord custom untuk server Minecraft kamu.',                                             price:'Rp 100.000',    rawPrice:100000, img:'images/product-12.jpg', badge:'NEW', downloadLink:'https://wa.me/6282298673652' },
];

// Pages
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login',     (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/products',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'products.html')));
app.get('/checkout',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout.html')));
app.get('/orders',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'orders.html')));
app.get('/admin',     (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// API: Get products
app.get('/api/products', (req, res) => {
    res.json({ success: true, products: PRODUCTS.map(p => ({ ...p, downloadLink: undefined })) });
});

// API: Register
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return res.json({ success: false, message: 'Semua field harus diisi!' });
    const users = getUsers();
    if (users.find(u => u.email === email))
        return res.json({ success: false, message: 'Email sudah terdaftar!' });
    users.push({ id: Date.now(), username, email, password, createdAt: new Date().toISOString() });
    saveUsers(users);
    res.json({ success: true, message: 'Registrasi berhasil! Silakan login.' });
});

// API: Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.json({ success: false, message: 'Email dan password harus diisi!' });
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.json({ success: false, message: 'Email atau password salah!' });
    res.json({ success: true, username: user.username, userId: user.id, email: user.email });
});

// API: Create order
app.post('/api/order', (req, res) => {
    const { userId, username, email, productId, productName, price, paymentMethod } = req.body;
    const orders = getOrders();
    const orderId = 'ZNO' + Date.now();
    orders.push({ orderId, userId, username, email, productId, productName, price, paymentMethod, status: 'pending', createdAt: new Date().toISOString() });
    saveOrders(orders);
    res.json({ success: true, orderId });
});

// API: Confirm payment (simpan bukti)
app.post('/api/confirm-payment', (req, res) => {
    const { orderId, buktiUrl } = req.body;
    const orders = getOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    orders[idx].status     = 'confirming';
    orders[idx].buktiUrl   = buktiUrl;
    orders[idx].confirmedAt = new Date().toISOString();
    saveOrders(orders);
    res.json({ success: true });
});

// API: Get orders by user
app.get('/api/orders/:userId', (req, res) => {
    const orders = getOrders().filter(o => String(o.userId) === String(req.params.userId));
    res.json({ success: true, orders });
});

// API: Get download link (only for paid orders)
app.get('/api/download/:orderId', (req, res) => {
    const orders = getOrders();
    const order = orders.find(o => o.orderId === req.params.orderId);
    if (!order) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    if (order.status !== 'paid') return res.json({ success: false, message: 'Pembayaran belum dikonfirmasi!' });
    const product = PRODUCTS.find(p => p.id === order.productId);
    if (!product) return res.json({ success: false, message: 'Produk tidak ditemukan!' });
    res.json({ success: true, downloadLink: product.downloadLink, productName: product.name });
});

// API: Admin - get all orders
app.get('/api/admin/orders', (req, res) => {
    res.json({ success: true, orders: getOrders().slice().reverse() });
});

// API: Admin - approve order
app.post('/api/admin/approve', (req, res) => {
    const { orderId } = req.body;
    const orders = getOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    orders[idx].status     = 'paid';
    orders[idx].approvedAt = new Date().toISOString();
    saveOrders(orders);
    res.json({ success: true });
});

// API: Admin - reject order
app.post('/api/admin/reject', (req, res) => {
    const { orderId } = req.body;
    const orders = getOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return res.json({ success: false, message: 'Order tidak ditemukan!' });
    orders[idx].status     = 'cancelled';
    orders[idx].rejectedAt = new Date().toISOString();
    saveOrders(orders);
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Zeno Store berjalan di http://localhost:${PORT}`);
});
