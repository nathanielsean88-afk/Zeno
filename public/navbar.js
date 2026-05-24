// navbar.js — Clerk Auth version

async function initNavbar(activePage) {
    // Load Clerk dulu sebelum cek user
    if (window.Clerk) await window.Clerk.load();

    const clerkUser = window.Clerk?.user || null;
    const username  = clerkUser ? (clerkUser.username || clerkUser.firstName || 'User') : null;
    const email     = clerkUser ? (clerkUser.primaryEmailAddress?.emailAddress || '') : null;

    const nav = document.querySelector('nav');
    if (!nav) return;

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.id = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(hamburger);

    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.id = 'mobileMenu';

    if (clerkUser) {
        mobileMenu.innerHTML = `
            <div class="mobile-user-info">
                <div class="mobile-avatar">${username.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="mobile-user-name">${username}</div>
                    <div class="mobile-user-email">${email || 'Pengguna Zeno Store'}</div>
                </div>
            </div>
            <a href="/" class="mobile-nav-item ${activePage==='home'?'active':''}">
                <div class="mobile-nav-icon">H</div>Beranda
            </a>
            <a href="/dashboard" class="mobile-nav-item ${activePage==='dashboard'?'active':''}">
                <div class="mobile-nav-icon">D</div>Dashboard
            </a>
            <a href="/products" class="mobile-nav-item ${activePage==='products'?'active':''}">
                <div class="mobile-nav-icon">P</div>Produk
            </a>
            <a href="/orders" class="mobile-nav-item ${activePage==='orders'?'active':''}">
                <div class="mobile-nav-icon">O</div>Pesanan Saya
            </a>
            <div class="mobile-divider"></div>
            <a href="https://wa.me/6282298673652" target="_blank" class="mobile-nav-item">
                <div class="mobile-nav-icon">S</div>Hubungi Support
            </a>
            <div class="mobile-divider"></div>
            <button class="mobile-nav-item logout-item" onclick="logoutUser()">
                <div class="mobile-nav-icon">X</div>Logout
            </button>`;
    } else {
        mobileMenu.innerHTML = `
            <a href="/" class="mobile-nav-item ${activePage==='home'?'active':''}">
                <div class="mobile-nav-icon">H</div>Beranda
            </a>
            <a href="/products" class="mobile-nav-item ${activePage==='products'?'active':''}">
                <div class="mobile-nav-icon">P</div>Produk
            </a>
            <div class="mobile-divider"></div>
            <div class="mobile-auth-buttons">
                <a href="/login" class="btn btn-secondary btn-full" style="text-align:center;">Masuk</a>
                <a href="/register" class="btn btn-primary btn-full" style="text-align:center;">Daftar Gratis</a>
            </div>`;
    }

    document.body.appendChild(mobileMenu);

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });

    const navButtons = document.getElementById('navButtons');
    if (navButtons) {
        if (clerkUser) {
            navButtons.innerHTML =
                '<span class="nav-user">' + username + '</span>' +
                '<a href="/dashboard" class="btn-sm btn-grad">Dashboard</a>' +
                '<button class="btn-sm btn-ghost" onclick="logoutUser()">Logout</button>';
        } else {
            navButtons.innerHTML =
                '<a href="/login" class="btn-sm btn-ghost">Masuk</a>' +
                '<a href="/register" class="btn-sm btn-grad">Daftar</a>';
        }
    }
}

async function logoutUser() {
    if (window.Clerk) await window.Clerk.signOut();
    window.location.href = '/';
}
