const WORKER = "https://api.niteapiworker.workers.dev";
let GLOBAL_COMMANDS = [];

function setCookie(n, v) {
    document.cookie = n + "=" + v + ";path=/;max-age=604800";
}

function getCookie(n) {
    return (document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)')) || [])[2];
}

const savedUser = getCookie("auth_user");
if (getCookie("auth_token")) showDash(savedUser);

function handleAuthClick() {
    if (!getCookie("auth_token")) {
        openLogin();
    } else {
        openLogout();
    }
}

function openLogin() {
    window.open(WORKER + "/auth", "Login", "width=500,height=800");
}

window.addEventListener("message", e => {
    if (e.data.type === "LOGIN_SUCCESS") {
        setCookie("auth_token", e.data.token);
        setCookie("auth_user", e.data.username);
        showDash(e.data.username);
    }
});

function showDash(u) {
    const lbl = document.getElementById('lbl-btn-username');
    if (lbl) lbl.innerText = u || "User";

    document.getElementById('view-login').classList.add('hide');
    document.getElementById('view-dash').classList.remove('hide');
    document.getElementById('lbl-user').innerText = u || "User";
}

function logout() {
    document.cookie = "auth_token=;path=/;max-age=0";
    document.cookie = "auth_user=;path=/;max-age=0";
    location.reload();
}

function openLogout() {
    document.getElementById('loginbtn').classList.add('expanded');
    document.getElementById('logOutContainer').classList.add('active');
}

function closeLogout() {
    document.getElementById('loginbtn').classList.remove('expanded');
    document.getElementById('logOutContainer').classList.remove('active');
}

async function startFlow() {
    const btn = document.getElementById('btn-get');
    const status = document.getElementById('status');
    const token = getCookie("auth_token");

    btn.disabled = true;
    btn.innerText = "Collecting Servers...";
    document.getElementById('server-list').innerHTML = "";

    try {
        let res = await fetch(WORKER + "/trigger", {
            headers: { "Authorization": token }
        });

        if (res.status === 401) {
        }

        btn.innerText = "Please have patience.";
        let attempts = 0;

        while (attempts < 30) {
            attempts++;
            status.innerText = `Checking... (${attempts}/30)`;
            let checkUrl = `${WORKER}/check?t=${Date.now()}`;
            let checkRes = await fetch(checkUrl, {
                headers: { "Authorization": token },
                cache: "no-store"
            });

            if (checkRes.status === 200) {
                const data = await checkRes.json();
                renderServers(data.servers);
                btn.innerText = "Refresh";
                btn.disabled = false;
                status.innerText = "Have fun! - Nite";
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        throw new Error("Timed Out");
    } catch (e) {
        status.innerText = "Error";
        btn.disabled = false;
        btn.innerText = "Try Again";
    }
}

function renderServers(list) {
    const el = document.getElementById('server-list');

    if (!list || list.length === 0) {
        el.innerHTML = `<div class="server-card" onclick="window.location.href='https://discord.com/oauth2/authorize?client_id=1371513819104415804&permissions=2815042428980240&integration_type=0&scope=bot+applications.commands'">
            <img src="plus.svg" alt="Nite" class="server-avatar" title="Nite" style="background-color: #202225;">
            <span>Add to server</span>
        </div>`;
        return;
    }

    // Fallback image if picture_url is empty
    const defaultIcon = "https://cdn.discordapp.com/embed/avatars/0.png";
    el.innerHTML = list.map((s, i) => {
        // Safe attribute handling
        const safeName = s.name.replace(/"/g, '&quot;');
        const safeIcon = (s.picture_url || defaultIcon).replace(/"/g, '&quot;');

        return `
        <div class="server-card" 
             data-id="${s.id}" 
             data-name="${safeName}" 
             data-icon="${safeIcon}"
             onclick="handleServerClick(this)" 
             style="animation-delay: ${i * 0.1}s;animation-duration: ${i * 0.1 + 0.4}s;">
            <img src="${s.picture_url || defaultIcon}" class="server-avatar" alt="${safeName}" title="${safeName}" style="animation-delay: ${i * 0.1}s;animation-duration: ${i * 0.1}s;">
            <span>${s.name}</span>
        </div>`;
    }).join('');
    el.innerHTML += `<div class="server-card" onclick="window.location.href='https://discord.com/oauth2/authorize?client_id=1371513819104415804&permissions=2815042428980240&integration_type=0&scope=bot+applications.commands'">
            <img src="https://cdn.discordapp.com/avatars/1371513819104415804/9e038eeb716c24ece29276422b52cc80.webp?size=320" class="server-avatar" alt="Nite" title="Nite" style="background-color: #5865F2;stroke: #000000ff;stroke-width: 5px;">
            <span>Add to server</span>
        </div>`
}

function doTransition(server_index) { // Insanely coolanim where everything else turns dark except the server and the server moves to the corner where it also is on manage.html!

}


document.addEventListener('DOMContentLoaded',
    startFlow()
)

function handleServerClick(element) {
    const id = element.dataset.id;
    const name = element.dataset.name;
    const iconUrl = element.dataset.icon;

    // 1. Create the overlay for dimming (Complete darkness)
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);

    // Force reflow
    void overlay.offsetWidth;
    overlay.classList.add('active');

    // 2. Calculate current position for Animation
    const rect = element.getBoundingClientRect();

    // 3. Clone the element to fly
    const flyer = element.cloneNode(true);

    // Set CSS Variables for the animation start position
    flyer.style.setProperty('--start-top', rect.top + 'px');
    flyer.style.setProperty('--start-left', rect.left + 'px');

    // Set initial fixed position on clone (start state)
    flyer.style.position = 'fixed';
    flyer.style.left = rect.left + 'px';
    flyer.style.top = rect.top + 'px';
    flyer.style.width = rect.width + 'px';
    flyer.style.height = rect.height + 'px';
    flyer.style.margin = '0';
    flyer.style.zIndex = '1000'; // Higher than overlay

    // Determine Destination (Desktop: Top-Left, Mobile: Bottom-Left)
    // Mobile breakpoint: 768px (standard)
    let endTop = '20px'; // Default Desktop
    if (window.innerWidth <= 768) {
        // Mobile: Bottom Left
        // Position: Viewport Height - Margin - Scaled Height
        // Scaled Height = rect.height * 0.6
        // We use window.innerHeight to be safe
        const scaledHeight = rect.height * 0.6;
        endTop = (window.innerHeight - 20 - scaledHeight) + 'px';
    }
    flyer.style.setProperty('--end-top', endTop);

    // Reset styles that might interfere
    flyer.style.animation = 'none';
    flyer.style.transition = 'none';
    flyer.style.filter = 'blur(0px)';
    flyer.style.webkitFilter = 'blur(0px)';

    // Fix inner image blur
    const innerImg = flyer.querySelector('img');
    if (innerImg) {
        innerImg.style.filter = 'blur(0px)';
        innerImg.style.webkitFilter = 'blur(0px)';
        innerImg.style.animation = 'none';
        innerImg.style.transition = 'none';
    }

    document.body.appendChild(flyer);

    // Hide original
    element.style.visibility = 'hidden';

    // Force reflow
    void flyer.offsetWidth;

    // 4. Add the animation class which triggers the Keyframe Animation
    flyer.classList.add('flying-card');

    // Note: No need for requestAnimationFrame to set left/top to 20px, 
    // the @keyframes 'flyToCorner' handles it using the CSS variables.

    // 5. Navigate after animation
    setTimeout(() => {
        // Encode parameters
        const dest = `manage.html?id=${id}&name=${encodeURIComponent(name)}&icon=${encodeURIComponent(iconUrl)}&width=${rect.width}&height=${rect.height}`;
        window.location.href = dest;
    }, 1500);
}
