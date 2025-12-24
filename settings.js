const WORKER = "https://api.niteapiworker.workers.dev";
let currentIndex = 0;
let GLOBAL_COMMANDS = [];

// Store global data to access across tabs
let GLOBAL_SETTINGS = {};
let GLOBAL_CHANNELS = [];
let GLOBAL_ROLES = [];

// --- UTILS ---
function setCookie(n, v) { document.cookie = n + "=" + v + ";path=/;max-age=604800"; }
function getCookie(n) { return (document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)')) || [])[2]; }

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const token = getCookie("auth_token");
    if (!token) { window.location.href = "index.html"; return; }

    const user = getCookie("auth_user");
    if (user) document.getElementById('lbl-btn-username').innerText = user;

    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get('id');

    if (serverId) {
        document.getElementById('lbl-server-id').innerText = serverId;
        initSettingsFlow(serverId, token);
    } else {
        alert("No ID provided");
        window.location.href = "index.html";
    }

    const activeBtn = document.querySelector('.nav-item.active');
    if (activeBtn) setTimeout(() => moveGlider(activeBtn), 50);
});

// --- API FLOW ---
async function initSettingsFlow(serverId, token) {
    try {
        // Trigger Bot
        await fetch(`${WORKER}/trigger-settings?serverid=${serverId}`, { headers: { "Authorization": token } });

        // Poll for Data
        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            let res = await fetch(`${WORKER}/check-settings?t=${Date.now()}`, { headers: { "Authorization": token }, cache: "no-store" });

            if (res.status === 200) {
                const data = await res.json();

                GLOBAL_CHANNELS = data.channels || [];
                GLOBAL_ROLES = data.roles || [];
                GLOBAL_SETTINGS = data.settings || {};
                GLOBAL_COMMANDS = data.commands || []; // <--- Capture commands

                document.getElementById('loading-text').classList.add('hide');
                renderAllTabs();
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        document.getElementById('loading-text').innerText = "Bot timed out.";
    } catch (e) {
        document.getElementById('loading-text').innerText = "Error: " + e.message;
    }
}

// --- RENDER LOGIC ---

function renderAllTabs() {
    renderGeneral();
    renderCommands();
    renderWelcome();
    renderAI();
}

// 1. GENERAL TAB
function renderGeneral() {
    const container = document.getElementById('tab-general');
    const s = GLOBAL_SETTINGS;

    let html = `<h2>General Settings</h2>`;

    // Bot Enabled
    html += createToggle("bot_enabled", "Enable Bot", "Toggle the main bot functionality.", s.bot_enabled !== false);

    html += `<div class="section-title">Modes</div>`;

    // Regenerate Mode (Dropdown)
    const regenOpts = [
        { val: "0", txt: "Button Only (No Command)" },
        { val: "1", txt: "Command Only (Default)" },
        { val: "2", txt: "Reaction (Broken)" },
        { val: "3", txt: "All (Button + Cmd + React)" },
        { val: "4", txt: "Disabled" }
    ];
    html += createSelect("regenerate_mode", "Regeneration Mode", regenOpts, s.regenerate_mode || "1");

    // Ping State (Dropdown)
    const pingOpts = [
        { val: "1", txt: "Nite (Default)" },
        { val: "4", txt: "Ask (Useful)" },
        { val: "3", txt: "Think" },
        { val: "2", txt: "Dream" }
    ];
    html += createSelect("ping_state", "Mention Behavior", pingOpts, s.ping_state || "1");

    container.innerHTML = html;
}

// 2. COMMANDS TAB
function renderCommands() {
    const container = document.getElementById('tab-commands');
    const s = GLOBAL_SETTINGS;

    let html = `
        <h2>Command Permissions</h2>
        <p style="color:#aaa; font-size:0.9rem; margin-bottom:20px;">
            Enable or disable specific slash commands for this server.
        </p>
    `;

    if (GLOBAL_COMMANDS.length === 0) {
        html += `<p style="color:#72767d;">No commands found or bot failed to send list.</p>`;
    } else {
        html += `<div class="commands-grid">`;

        GLOBAL_COMMANDS.forEach(cmd => {
            const key = `${cmd.name}_enabled`;
            // Default to true if setting is missing (undefined)
            const isEnabled = s[key] !== false;

            html += `
            <div class="command-card" style="display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <span style="font-weight:bold; color:#fff; font-family:monospace; font-size:1.1rem;">/${cmd.name}</span>
                    <label class="switch">
                        <input type="checkbox" id="${key}" ${isEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <span style="font-size:0.8rem; color:#b9bbbe; line-height:1.3;">${cmd.description}</span>
            </div>`;
        });

        html += `</div>`;
    }

    container.innerHTML = html;
}

// 3. WELCOME & GOODBYE TAB
function renderWelcome() {
    const container = document.getElementById('tab-welcome');
    const s = GLOBAL_SETTINGS;

    // Debugging: Check console to see what values we actually have
    console.log("Welcome Channel ID:", s.welcome_channel);
    console.log("Goodbye Channel ID:", s.goodbye_channel);

    let html = `<h2>Welcome & Goodbye</h2>`;

    // --- WELCOME ---
    html += `<div class="section-title">Welcome Messages</div>`;

    let welcomeTxt = "";
    let welcomeEnabled = s.welcome_messages !== false;
    // Handle list vs string vs false
    if (Array.isArray(s.welcome_messages)) {
        welcomeTxt = s.welcome_messages.join(" | ");
    } else if (typeof s.welcome_messages === 'string') {
        welcomeTxt = s.welcome_messages;
    }

    html += createToggle("welcome_enabled_bool", "Enable Welcome Messages", "", welcomeEnabled);
    html += createTextarea("welcome_messages", "Messages", "Separate with | . Use {mention} for user.", welcomeTxt);

    // PASS THE ID HERE
    html += createChannelSelect("welcome_channel", "Welcome Channel", s.welcome_channel);

    html += createToggle("welcome_show_join_number", "Show Join Number", "e.g. 'Member #42'", s.welcome_show_join_number);
    html += createToggle("welcome_show_roles", "Show Roles", "Display assigned roles", s.welcome_show_roles);

    // --- GOODBYE ---
    html += `<div class="section-title">Goodbye Messages</div>`;

    let goodbyeTxt = "";
    let goodbyeEnabled = s.goodbye_messages !== false;
    if (Array.isArray(s.goodbye_messages)) {
        goodbyeTxt = s.goodbye_messages.join(" | ");
    } else if (typeof s.goodbye_messages === 'string') {
        goodbyeTxt = s.goodbye_messages;
    }

    html += createToggle("goodbye_enabled_bool", "Enable Goodbye Messages", "", goodbyeEnabled);
    html += createTextarea("goodbye_messages", "Messages", "Separate with |", goodbyeTxt);

    // PASS THE ID HERE
    html += createChannelSelect("goodbye_channel", "Goodbye Channel", s.goodbye_channel);

    container.innerHTML = html;
}
// 4. AI & THREADS TAB
function renderAI() {
    const container = document.getElementById('tab-ai');
    const s = GLOBAL_SETTINGS;

    let html = `<h2>AI & Thread Support</h2>`;

    // Auto Flair
    html += `<div class="section-title">Auto Flair</div>`;
    html += createToggle("auto_flair_enabled", "Enable Auto Flair", "AI adds tags to new posts.", s.auto_flair_enabled);

    let flairs = (s.auto_flair_options || ["Bug", "Suggestion"]).join(" | ");
    html += createTextarea("auto_flair_options", "Flair Options", "Separate with |", flairs);

    // Auto Help
    html += `<div class="section-title">Auto Help</div>`;
    html += createToggle("auto_help_enabled", "Enable Auto Help", "AI suggests answers from past threads.", s.auto_help_enabled);

    // Support Channels (Multi-select logic is complex in vanilla HTML, using simple input for IDs for now or a list)
    html += `<div class="section-title">Support Channels</div>`;
    html += `<p style="font-size:0.8rem; color:#aaa;">Select Forum Channels (IDs)</p>`;

    // Render checkboxes for Forum channels
    const forums = GLOBAL_CHANNELS.filter(c => c.type === '15' || c.type === '13' || c.type === 'forum'); // Type 15 is Forum
    if (forums.length === 0) {
        html += `<p style="color:#72767d; font-style:italic;">No Forum channels found.</p>`;
    } else {
        html += `<div class="commands-grid">`;
        const selected = s.support_channels || [];
        forums.forEach(c => {
            const isChecked = selected.includes(c.id);
            html += `
            <div class="command-card">
                <span># ${c.name}</span>
                <label class="switch">
                    <input type="checkbox" class="support-channel-chk" value="${c.id}" ${isChecked ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>`;
        });
        html += `</div>`;
    }

    container.innerHTML = html;
}

// --- HELPER COMPONENT GENERATORS ---

function createToggle(id, label, sublabel, checked) {
    return `
    <div class="toggle-wrapper">
        <div class="toggle-label-group">
            <span class="form-label" style="margin:0;">${label}</span>
            ${sublabel ? `<span class="form-sublabel" style="margin:0;">${sublabel}</span>` : ''}
        </div>
        <label class="switch">
            <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
            <span class="slider"></span>
        </label>
    </div>`;
}

function createSelect(id, label, options, selectedVal) {
    let opts = options.map(o => `<option value="${o.val}" ${String(o.val) === String(selectedVal) ? 'selected' : ''}>${o.txt}</option>`).join('');
    return `
    <div class="form-group">
        <label class="form-label">${label}</label>
        <select id="${id}" class="styled-select">${opts}</select>
    </div>`;
}

function createTextarea(id, label, placeholder, value) {
    return `
    <div class="form-group">
        <label class="form-label">${label}</label>
        <textarea id="${id}" class="styled-textarea" placeholder="${placeholder}">${value}</textarea>
    </div>`;
}

function createChannelSelect(id, label, selectedId) {
    // 1. Safe ID conversion (handle null/undefined)
    const targetId = selectedId ? String(selectedId) : "";

    // 2. Broaden Filter: Include Text (0) and News/Announcement (5)
    // The python script sends types as strings like "0", "5", etc.
    const channels = GLOBAL_CHANNELS.filter(c =>
        String(c.type) === '0' ||
        String(c.type) === 'text' ||
        String(c.type) === '5' ||
        String(c.type) === 'news'
    );

    // 3. Check if the saved channel is actually in our list
    const found = channels.find(c => String(c.id) === targetId);

    // 4. Build Options
    let opts = `<option value="">-- None --</option>`;

    // If we have a saved ID but it wasn't found in the list (e.g. deleted channel or weird permission), 
    // add it as a "Unknown" option so the setting doesn't look empty.
    if (targetId && !found) {
        opts += `<option value="${targetId}" selected>Unknown Channel (${targetId})</option>`;
    }

    // Map the valid channels
    opts += channels.map(c => {
        const cId = String(c.id);
        const isSelected = cId === targetId;
        return `<option value="${cId}" ${isSelected ? 'selected' : ''}># ${c.name}</option>`;
    }).join('');

    return `
    <div class="form-group">
        <label class="form-label">${label}</label>
        <select id="${id}" class="styled-select">
            ${opts}
        </select>
    </div>`;
}
// --- NAVIGATION (Existing Logic) ---
function switchTab(btn, targetId) {
    const allBtns = Array.from(document.querySelectorAll('.nav-item'));
    const newIndex = allBtns.indexOf(btn);
    if (newIndex === currentIndex) return;

    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    moveGlider(btn);

    const currentTab = document.querySelector('.tab-pane.active');
    const nextTab = document.getElementById(targetId);

    if (currentTab && nextTab) animateContent(currentTab, nextTab, currentIndex, newIndex);
    currentIndex = newIndex;
}

function moveGlider(targetBtn) {
    const glider = document.getElementById('nav-glider');
    if (glider) {
        glider.style.opacity = '1';
        glider.style.top = targetBtn.offsetTop + 'px';
        glider.style.height = targetBtn.offsetHeight + 'px';
    }
}

function animateContent(oldTab, newTab, oldIdx, newIdx) {
    oldTab.classList.remove('active'); oldTab.classList.add('animating');
    newTab.classList.add('active'); newTab.classList.add('animating');

    if (newIdx > oldIdx) { oldTab.classList.add('slide-out-up'); newTab.classList.add('slide-in-up'); }
    else { oldTab.classList.add('slide-out-down'); newTab.classList.add('slide-in-down'); }

    setTimeout(() => {
        oldTab.classList.remove('animating', 'slide-out-up', 'slide-out-down', 'active');
        newTab.classList.remove('animating', 'slide-in-up', 'slide-in-down');
        newTab.classList.add('active');
    }, 400);
}

// --- PLACEHOLDER SAVE FUNCTION ---
async function saveChanges() {
    const btn = document.getElementById('btn-save-changes');
    const status = document.getElementById('save-status');
    const serverId = document.getElementById('lbl-server-id').innerText;
    const token = getCookie("auth_token");

    if (!serverId || serverId === "Loading...") return;

    btn.disabled = true;
    btn.innerText = "Saving...";
    status.innerText = "Collecting data...";
    status.style.color = "#aaa";

    try {
        // --- 1. COLLECT GENERAL SETTINGS ---
        let payload = {
            bot_enabled: document.getElementById('bot_enabled').checked,
            regenerate_mode: parseInt(document.getElementById('regenerate_mode').value),
            ping_state: parseInt(document.getElementById('ping_state').value)
        };

        // --- 2. COLLECT COMMANDS ---
        // Iterate through the global list we saved earlier to find their checkboxes
        GLOBAL_COMMANDS.forEach(cmd => {
            const el = document.getElementById(`${cmd.name}_enabled`);
            if (el) {
                payload[`${cmd.name}_enabled`] = el.checked;
            }
        });

        // --- 3. COLLECT WELCOME & GOODBYE ---
        // Helper to process message lists: If toggle is off -> False. If on -> Array of strings.
        const processMsgList = (toggleId, textId) => {
            const isEnabled = document.getElementById(toggleId).checked;
            if (!isEnabled) return false;

            const rawText = document.getElementById(textId).value;
            // Split by pipe |, trim whitespace, remove empty entries
            return rawText.split('|').map(s => s.trim()).filter(s => s.length > 0);
        };

        // Welcome
        payload.welcome_messages = processMsgList('welcome_enabled_bool', 'welcome_messages');
        // Handle Channel ID: If empty string, send None/null, otherwise send ID string
        const wChan = document.getElementById('welcome_channel').value;
        payload.welcome_channel = wChan ? wChan : null;

        payload.welcome_show_join_number = document.getElementById('welcome_show_join_number').checked;
        payload.welcome_show_roles = document.getElementById('welcome_show_roles').checked;

        // Goodbye
        payload.goodbye_messages = processMsgList('goodbye_enabled_bool', 'goodbye_messages');
        const gChan = document.getElementById('goodbye_channel').value;
        payload.goodbye_channel = gChan ? gChan : null;


        // --- 4. COLLECT AI & THREADS ---
        // Auto Flair
        payload.auto_flair_enabled = document.getElementById('auto_flair_enabled').checked;
        const rawFlairs = document.getElementById('auto_flair_options').value;
        payload.auto_flair_options = rawFlairs.split('|').map(s => s.trim()).filter(s => s.length > 0);

        // Auto Help
        payload.auto_help_enabled = document.getElementById('auto_help_enabled').checked;

        // Support Channels (Multi-select)
        // Find all checkboxes with the class we added earlier
        const supportCheckboxes = document.querySelectorAll('.support-channel-chk:checked');
        // Map them to an array of integers (since your bot likely stores them as ints)
        // NOTE: If your bot expects strings for IDs in the list, remove parseInt
        payload.support_channels = Array.from(supportCheckboxes).map(cb => cb.value);


        // --- 5. SEND TO WORKER ---
        status.innerText = "Sending to Bot...";

        const response = await fetch(`${WORKER}/update-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                serverid: serverId,
                settings: payload
            })
        });

        if (response.ok) {
            status.innerText = "Saved Successfully!";
            status.style.color = "#4fdc7b"; // Green

            // Optional: Update global settings object with new values so UI doesn't flicker on refresh
            Object.assign(GLOBAL_SETTINGS, payload);
        } else {
            throw new Error("Worker rejected update");
        }

    } catch (e) {
        console.error(e);
        status.innerText = "Save Failed: " + e.message;
        status.style.color = "#ed4245"; // Red
    } finally {
        btn.disabled = false;
        btn.innerText = "Save Changes";
    }
}

function handleAuthClick() { openLogout(); }
function logout() { document.cookie = "auth_token=;path=/;max-age=0"; window.location.href = "index.html"; }
function openLogout() { document.getElementById('loginbtn').classList.add('expanded'); document.getElementById('logOutContainer').classList.add('active'); }
function closeLogout() { document.getElementById('loginbtn').classList.remove('expanded'); document.getElementById('logOutContainer').classList.remove('active'); }
function goBack() { window.location.href = "index.html"; }