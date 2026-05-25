// zenodialog.js

function zenoAlert(msg, type, title) {
    const colors = {
        success: '#22c55e',
        error:   '#ef4444',
        warning: '#f59e0b',
        copy:    '#3b82f6',
    };
    const icons = {
        success: '✅',
        error:   '❌',
        warning: '⚠️',
        copy:    '📋',
    };

    const color = colors[type] || colors.success;
    const icon  = icons[type]  || '✅';

    // Hapus toast lama kalau ada
    const old = document.getElementById('_zenoToast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = '_zenoToast';
    toast.style.cssText = `
        position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(20px);
        background:#0f1923; border:1px solid ${color}44; border-left:3px solid ${color};
        color:#e2e8f0; padding:12px 20px; border-radius:10px; font-family:'Space Grotesk',sans-serif;
        font-size:0.88rem; font-weight:600; z-index:99999; white-space:nowrap;
        box-shadow:0 8px 32px rgba(0,0,0,0.5); display:flex; align-items:center; gap:10px;
        opacity:0; transition:opacity 0.25s, transform 0.25s;
    `;
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function zenoConfirm(msg, onConfirm, type, title) {
    const colors = {
        success: '#22c55e',
        error:   '#ef4444',
        warning: '#f59e0b',
    };
    const color = colors[type] || '#3b82f6';

    // Overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:99998;
        display:flex; align-items:center; justify-content:center;
        backdrop-filter:blur(4px); padding:20px;
        opacity:0; transition:opacity 0.2s;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
        background:#0f1923; border:1px solid ${color}44; border-top:3px solid ${color};
        border-radius:14px; padding:28px 24px; max-width:340px; width:100%;
        font-family:'Space Grotesk',sans-serif; color:#e2e8f0;
        box-shadow:0 20px 60px rgba(0,0,0,0.6);
        transform:scale(0.95); transition:transform 0.2s;
    `;

    box.innerHTML = `
        <div style="font-size:1rem;font-weight:800;margin-bottom:10px;color:#f1f5f9">${title || 'Konfirmasi'}</div>
        <div style="font-size:0.85rem;color:#94a3b8;line-height:1.6;margin-bottom:22px">${msg}</div>
        <div style="display:flex;gap:10px;">
            <button id="_zenoCancelBtn" style="
                flex:1; padding:11px; border-radius:8px; border:1px solid #334155;
                background:transparent; color:#94a3b8; font-family:'Space Grotesk',sans-serif;
                font-size:0.85rem; font-weight:700; cursor:pointer;
            ">Batal</button>
            <button id="_zenoOkBtn" style="
                flex:1; padding:11px; border-radius:8px; border:none;
                background:${color}; color:#fff; font-family:'Space Grotesk',sans-serif;
                font-size:0.85rem; font-weight:700; cursor:pointer;
            ">${title || 'Ya'}</button>
        </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity  = '1';
        box.style.transform    = 'scale(1)';
    });

    function close() {
        overlay.style.opacity = '0';
        box.style.transform   = 'scale(0.95)';
        setTimeout(() => overlay.remove(), 200);
    }

    document.getElementById('_zenoCancelBtn').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };
    document.getElementById('_zenoOkBtn').onclick = () => {
        close();
        if (typeof onConfirm === 'function') onConfirm();
    };
}
