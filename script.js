/**
 * CONFIGURATION
 */
const CONFIG = {
    API_URL: "https://api.niteapiworker.workers.dev",
    DISCORD_CLIENT_ID: "1371513819104415804",
    // Used for the "Add to Server" card
    INVITE_URL: "https://discord.com/oauth2/authorize?client_id=1371513819104415804&permissions=2815042428980240&integration_type=0&scope=bot+applications.commands"
};

/**
 * UTILITIES & COOKIES
 */
function setCookie(name, value, days = 7) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    // Security Fix: Added Secure and SameSite=Lax
    document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()};Secure;SameSite=Lax`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * AUTHENTICATION LOGIC
 */
function handleAuthClick() {
    if (!getCookie("auth_token")) {
        openLogin();
    } else {
        toggleLogoutMenu();
    }
}

function openLogin() {
    // Opens the worker auth endpoint
    window.open(CONFIG.API_URL + "/auth", "Login", "width=500,height=800");
}

function logout() {
    document.cookie = "auth_token=;path=/;max-age=0";
    document.cookie = "auth_user=;path=/;max-age=0";
    location.reload();
}

function toggleLogoutMenu() {
    const btn = document.getElementById('loginbtn');
    const container = document.getElementById('logOutContainer');
    
    // Simple toggle logic
    if (container.classList.contains('active')) {
        btn.classList.remove('expanded');
        container.classList.remove('active');
    } else {
        btn.classList.add('expanded');
        container.classList.add('active');
    }
}

// SECURITY CRITICAL: Handle the postMessage from the popup
window.addEventListener("message", (e) => {
    // 1. Verify Origin
    if (e.origin !== CONFIG.API_URL) return;

    // 2. Handle Login
    if (e.data.type === "LOGIN_SUCCESS") {
        setCookie("auth_token", e.data.token);
        setCookie("auth_user", e.data.username);

        // Update UI immediately without reloading page
        updateDashUI(e.data.username);
        fetchServers(); 
    }
});

/**
 * UI STATE MANAGEMENT
 */
function updateDashUI(username) {
    const userLabel = document.getElementById('lbl-btn-username');
    const dashLabel = document.getElementById('lbl-user');
    const loginView = document.getElementById('view-login');
    const dashView = document.getElementById('view-dash');

    if (userLabel) userLabel.innerText = username || "User";
    if (dashLabel) dashLabel.innerText = username || "User";

    if (loginView) loginView.classList.add('hide');
    if (dashView) dashView.classList.remove('hide');
}

/**
 * DATA FETCHING
 */
async function fetchServers() {
    const btn = document.getElementById('btn-get');
    const status = document.getElementById('status');
    const token = getCookie("auth_token");

    if (!token) return; // Safety check

    btn.disabled = true;
    btn.innerText = "Collecting Servers...";
    document.getElementById('server-list').innerHTML = "";

    try {
        // Trigger the backend process
        await fetch(CONFIG.API_URL + "/trigger", {
            headers: { "Authorization": token }
        });

        btn.innerText = "Please wait...";
        
        // Polling loop (max 30 seconds)
        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            status.innerText = `Syncing... (${attempts}/30)`;
            
            // Cache busting with timestamp
            const checkRes = await fetch(`${CONFIG.API_URL}/check?t=${Date.now()}`, {
                headers: { "Authorization": token },
                cache: "no-store"
            });

            if (checkRes.status === 200) {
                const data = await checkRes.json();
                renderServers(data.servers);
                
                btn.innerText = "Refresh List";
                btn.disabled = false;
                status.innerText = "Select a server";
                return; // Success
            }
            
            // Wait 1 second before next try
            await new Promise(r => setTimeout(r, 1000));
        }

        throw new Error("Timed Out");

    } catch (e) {
        console.error(e);
        status.innerText = "Failed to sync servers.";
        btn.disabled = false;
        btn.innerText = "Try Again";
    }
}

function renderServers(list) {
    const container = document.getElementById('server-list');
    const defaultIcon = "https://cdn.discordapp.com/embed/avatars/0.png";

    // Helper HTML for the "Add Bot" card
    const addCardHtml = `
        <div class="server-card" onclick="window.location.href='${CONFIG.INVITE_URL}'">
            <img src="plus.svg" class="server-avatar" alt="Add" style="background-color: #202225;">
            <span>Add to server</span>
        </div>`;

    if (!list || list.length === 0) {
        container.innerHTML = addCardHtml;
        return;
    }

    // Build Server Cards
    const cardsHtml = list.map((s, i) => {
        const safeName = escapeHtml(s.name);
        const iconUrl = s.picture_url || defaultIcon;
        const safeIcon = escapeHtml(iconUrl);

        // Staggered animation delay
        const delay = i * 0.05; 

        return `
        <div class="server-card" 
             data-id="${s.id}" 
             data-name="${safeName}" 
             data-icon="${safeIcon}"
             onclick="handleServerTransition(this)" 
             style="animation-delay: ${delay}s;">
            <img src="${iconUrl}" 
                 class="server-avatar" 
                 alt="${safeName}" 
                 loading="lazy">
            <span>${safeName}</span>
        </div>`;
    }).join('');

    container.innerHTML = cardsHtml + addCardHtml;
}

/**
 * ANIMATION & NAVIGATION
 */
function handleServerTransition(element) {
    const { id, name, icon } = element.dataset;
    const rect = element.getBoundingClientRect();

    // 1. Create Dimming Overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
    
    // Force Reflow
    requestAnimationFrame(() => overlay.classList.add('active'));

    // 2. Create Flying Element
    const flyer = element.cloneNode(true);
    
    // Set CSS Variables for animation
    flyer.style.setProperty('--start-top', `${rect.top}px`);
    flyer.style.setProperty('--start-left', `${rect.left}px`);
    flyer.style.setProperty('--start-width', `${rect.width}px`);
    flyer.style.setProperty('--start-height', `${rect.height}px`);

    // Determine End Position (Responsive)
    // Desktop: Top-Left (20px) | Mobile: Bottom-Left
    let endTop = '20px';
    if (window.innerWidth <= 768) {
        const scaledHeight = rect.height * 0.6;
        endTop = `${window.innerHeight - 20 - scaledHeight}px`;
    }
    flyer.style.setProperty('--end-top', endTop);

    // Initial Styles
    Object.assign(flyer.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: '0',
        zIndex: '1000',
        pointerEvents: 'none' // Prevent double clicks
    });

    // Reset internal filters
    const innerImg = flyer.querySelector('img');
    if (innerImg) innerImg.style.filter = 'none';

    document.body.appendChild(flyer);
    element.style.visibility = 'hidden';

    // 3. Trigger Animation
    requestAnimationFrame(() => {
        flyer.classList.add('flying-card');
    });

    // 4. Navigate
    setTimeout(() => {
        const params = new URLSearchParams({
            id: id,
            name: name,
            icon: icon,
            width: rect.width,
            height: rect.height
        });
        window.location.href = `manage.html?${params.toString()}`;
    }, 600);
}

/**
 * INITIALIZATION
 */
function init() {
    const savedUser = getCookie("auth_user");
    const savedToken = getCookie("auth_token");

    if (savedToken && savedUser) {
        // 1. Update the UI to show the dashboard immediately
        updateDashUI(savedUser);
        
        // 2. Automatically start fetching servers
        fetchServers(); 
    }
}

// Correct event listener syntax
document.addEventListener('DOMContentLoaded', init);
