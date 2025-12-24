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
    el.innerHTML = list.map((s, i) => `
        <div class="server-card" onclick="window.location.href='manage.html?id=${s.id}'" style="animation-delay: ${i * 0.1}s;animation-duration: ${i * 0.1 + 0.4}s;">
            <img src="${s.picture_url || defaultIcon}" class="server-avatar" alt="${s.name}" title="${s.name}" style="animation-delay: ${i * 0.1}s;animation-duration: ${i * 0.1}s;">
            <span>${s.name}</span>
        </div>
    `).join('');
    el.innerHTML += `<div class="server-card" onclick="window.location.href='https://discord.com/oauth2/authorize?client_id=1371513819104415804&permissions=2815042428980240&integration_type=0&scope=bot+applications.commands'">
            <img src="https://cdn.discordapp.com/avatars/1371513819104415804/9e038eeb716c24ece29276422b52cc80.webp?size=320" class="server-avatar" alt="Nite" title="Nite" style="background-color: #5865F2;stroke: #000000ff;stroke-width: 5px;">
            <span>Add to server</span>
        </div>`
}


document.addEventListener('DOMContentLoaded',
    startFlow()
)
