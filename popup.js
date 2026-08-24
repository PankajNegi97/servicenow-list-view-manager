const profileName = document.getElementById("profileName");
const columns = document.getElementById("columns");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const captureBtn = document.getElementById("captureBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFileInput = document.getElementById("importFileInput");
const searchProfiles = document.getElementById("searchProfiles");
const profilesDiv = document.getElementById("profiles");
const statusBox = document.getElementById("status");
const helpBtn = document.getElementById("helpBtn");
const closeHelpBtn = document.getElementById("closeHelpBtn");
const helpPanel = document.getElementById("helpPanel");

let editingProfile = null;
let profilesCache = {};

saveBtn.addEventListener("click", saveProfile);
cancelEditBtn.addEventListener("click", resetEditor);
captureBtn.addEventListener("click", captureCurrentColumns);
exportBtn.addEventListener("click", exportProfiles);
importBtn.addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", importProfiles);
searchProfiles.addEventListener("input", renderProfiles);
if (helpBtn) helpBtn.addEventListener("click", toggleHelp);
if (closeHelpBtn) closeHelpBtn.addEventListener("click", () => helpPanel.classList.add("hidden"));

loadProfiles();

function toggleHelp() {
    helpPanel.classList.toggle("hidden");
}

async function saveProfile() {
    const name = profileName.value.trim();
    const list = parseColumns(columns.value);

    if (!name) {
        setStatus("Enter a profile name.", "error");
        return;
    }

    if (list.length === 0) {
        setStatus("Enter at least one column.", "error");
        return;
    }

    if (editingProfile && editingProfile !== name) {
        await Storage.deleteProfile(editingProfile);
    }

    await Storage.saveProfile(name, list);
    setStatus(`Saved profile "${name}".`, "success");
    resetEditor();
    await loadProfiles();
}

async function loadProfiles() {
    profilesCache = await Storage.getProfiles();
    if (Object.keys(profilesCache).length === 0 && helpPanel) {
        helpPanel.classList.remove("hidden");
    }
    renderProfiles();
}

function renderProfiles() {
    const query = normalize(searchProfiles.value);
    const names = Object.keys(profilesCache)
        .sort((a, b) => a.localeCompare(b))
        .filter(name => {
            if (!query) return true;
            const haystack = normalize(`${name} ${profilesCache[name].join(" ")}`);
            return haystack.includes(query);
        });

    profilesDiv.innerHTML = "";

    if (names.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = Object.keys(profilesCache).length
            ? "No matching profiles."
            : "No profiles yet. Create one above or capture from page.";
        profilesDiv.appendChild(empty);
        return;
    }

    for (const name of names) {
        profilesDiv.appendChild(createProfileCard(name, profilesCache[name]));
    }
}

function createProfileCard(name, profileColumns) {
    const card = document.createElement("article");
    card.className = "profile-card";

    const titleRow = document.createElement("div");
    titleRow.className = "profile-title";

    const title = document.createElement("strong");
    title.textContent = name;

    const count = document.createElement("span");
    count.className = "count";
    count.textContent = `${profileColumns.length} columns`;

    titleRow.append(title, count);

    const preview = document.createElement("div");
    preview.className = "preview";
    preview.textContent = profileColumns.slice(0, 5).join(", ")
        + (profileColumns.length > 5 ? "..." : "");

    const actions = document.createElement("div");
    actions.className = "profile-actions";

    const applyBtn = makeButton("Apply");
    applyBtn.title = "Open ServiceNow 'Configure > List Layout' first, then click Apply!";
    const editBtn = makeButton("Edit", "secondary");
    const duplicateBtn = makeButton("Duplicate", "secondary");
    const deleteBtn = makeButton("Delete", "danger");

    applyBtn.addEventListener("click", () => applyProfile(name, profileColumns));
    editBtn.addEventListener("click", () => editProfile(name, profileColumns));
    duplicateBtn.addEventListener("click", () => duplicateProfile(name, profileColumns));
    deleteBtn.addEventListener("click", () => deleteProfile(name));

    actions.append(applyBtn, editBtn, duplicateBtn, deleteBtn);
    card.append(titleRow, preview, actions);

    return card;
}

function makeButton(text, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    if (className) button.className = className;
    return button;
}

function editProfile(name, profileColumns) {
    editingProfile = name;
    profileName.value = name;
    columns.value = profileColumns.join("\n");
    saveBtn.textContent = "Update Profile";
    cancelEditBtn.classList.remove("hidden");
    setStatus(`Editing "${name}".`, "info");
}

async function duplicateProfile(name, profileColumns) {
    let copyName = `${name} (Copy)`;
    let counter = 1;
    while (profilesCache[copyName]) {
        copyName = `${name} (Copy ${counter++})`;
    }

    await Storage.saveProfile(copyName, profileColumns);
    setStatus(`Duplicated profile as "${copyName}".`, "success");
    await loadProfiles();
}

async function deleteProfile(name) {
    if (!confirm(`Delete profile "${name}"?`)) return;

    await Storage.deleteProfile(name);

    if (editingProfile === name) {
        resetEditor();
    }

    setStatus(`Deleted "${name}".`, "success");
    await loadProfiles();
}

async function exportProfiles() {
    try {
        const jsonStr = await Storage.exportProfiles();
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sn_column_profiles_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus("Exported profiles to JSON file.", "success");
    } catch (err) {
        setStatus("Export failed: " + err.message, "error");
    }
}

async function importProfiles(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const count = await Storage.importProfiles(e.target.result);
            setStatus(`Successfully imported ${count} profile(s).`, "success");
            await loadProfiles();
        } catch (err) {
            setStatus("Import error: " + err.message, "error");
        } finally {
            importFileInput.value = "";
        }
    };
    reader.readAsText(file);
}

async function captureCurrentColumns() {
    setStatus("Reading columns from active ServiceNow page...", "info");

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.id) {
            throw new Error("No active browser tab found.");
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            world: "MAIN",
            func: getColumnsFromPage
        }).catch(() => chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: getColumnsFromPage
        }));

        const captured = results
            .map(item => item && item.result)
            .find(res => res && res.columns && res.columns.length > 0);

        if (!captured) {
            throw new Error("No columns found on active page. Open ServiceNow List Layout or a table list view first.");
        }

        columns.value = captured.columns.join("\n");
        if (!profileName.value.trim() && captured.suggestedName) {
            profileName.value = captured.suggestedName;
        }

        setStatus(`Captured ${captured.columns.length} columns from ${captured.source}.`, "success");
    } catch (error) {
        setStatus(cleanError(error), "error");
    }
}

function getColumnsFromPage() {
    const queryDeep = (selector, root = document) => {
        if (!root) return null;
        if (root.querySelector) {
            const match = root.querySelector(selector);
            if (match) return match;
        }
        const nodes = root.querySelectorAll ? root.querySelectorAll("*") : [];
        for (const node of nodes) {
            if (node.shadowRoot) {
                const match = queryDeep(selector, node.shadowRoot);
                if (match) return match;
            }
        }
        return null;
    };

    const right = queryDeep("#slush_right");
    if (right && right.options && right.options.length > 0) {
        const cols = Array.from(right.options)
            .map(opt => (opt.text || opt.textContent || opt.value || "").trim())
            .filter(Boolean);

        return {
            source: "List Layout Slushbucket",
            suggestedName: document.title ? document.title.replace(/\|.*/, "").trim() : "Captured Layout",
            columns: cols
        };
    }

    const headers = document.querySelectorAll("th[aria-label], th.list_header_cell, th[data-column-name]");
    if (headers && headers.length > 0) {
        const isJunk = text => /select all|actions for|search|sort column|^\s*$/i.test(text);
        const cols = Array.from(headers)
            .map(th => (th.getAttribute("aria-label") || th.textContent || "").replace(/Sort column.*/i, "").trim())
            .filter(b => b && b.length > 0 && b.length < 60 && !isJunk(b));

        const unique = [...new Set(cols)];
        if (unique.length > 0) {
            return {
                source: "Table List View",
                suggestedName: document.title ? document.title.replace(/\|.*/, "").trim() : "Captured Table",
                columns: unique
            };
        }
    }

    return null;
}

async function applyProfile(name, profileColumns) {
    setStatus(`⚡ Applying "${name}"... Check active tab for live progress.`, "info");

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.id) {
            throw new Error("No active browser tab found.");
        }

        if (tab.url && !/^https?:\/\//i.test(tab.url)) {
            throw new Error("Open your ServiceNow list page first, then try Apply again.");
        }

        const results = await runApplyScript(tab.id, profileColumns);
        const frameResults = results.map(item => item && item.result).filter(Boolean);
        const success = frameResults.find(result => result.ok);
        const foundDialog = frameResults.find(result => result.found);

        if (success) {
            setStatus(success.message || `Applied "${name}".`, "success");
            return;
        }

        if (foundDialog && foundDialog.missing && foundDialog.missing.length) {
            setStatus(
                `Could not apply "${name}". Missing columns: ${foundDialog.missing.join(", ")}. The list was not saved.`,
                "error"
            );
            return;
        }

        if (foundDialog && foundDialog.message) {
            setStatus(foundDialog.message, "error");
            return;
        }

        setStatus(
            "Open ServiceNow Configure > List Layout first, then click Apply again.",
            "error"
        );
    } catch (error) {
        setStatus(cleanError(error), "error");
    }
}

async function runApplyScript(tabId, profileColumns) {
    const mainFrameResults = await executeApplyScript(tabId, profileColumns, false);

    if (hasUsefulApplyResult(mainFrameResults)) {
        return mainFrameResults;
    }

    try {
        const allFrameResults = await executeApplyScript(tabId, profileColumns, true);
        return allFrameResults.length ? allFrameResults : mainFrameResults;
    } catch (error) {
        return mainFrameResults.length ? mainFrameResults : Promise.reject(error);
    }
}

async function executeApplyScript(tabId, profileColumns, allFrames) {
    const target = { tabId };

    if (allFrames) {
        target.allFrames = true;
    }

    try {
        return await chrome.scripting.executeScript({
            target,
            world: "MAIN",
            func: applyProfileOnPage,
            args: [profileColumns]
        });
    } catch (error) {
        return await chrome.scripting.executeScript({
            target,
            func: applyProfileOnPage,
            args: [profileColumns]
        });
    }
}

function hasUsefulApplyResult(results) {
    return results.some(item => {
        const result = item && item.result;
        return result && (result.ok || result.found);
    });
}

function resetEditor() {
    editingProfile = null;
    profileName.value = "";
    columns.value = "";
    saveBtn.textContent = "Save Profile";
    cancelEditBtn.classList.add("hidden");
}

function parseColumns(value) {
    return value
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);
}

function normalize(value) {
    return String(value || "")
        .replace(/\u00a0/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function setStatus(message, type) {
    statusBox.textContent = message || "";
    statusBox.className = message ? `status ${type || "info"}` : "status";
}

function cleanError(error) {
    const message = error && error.message ? error.message : String(error);

    if (/Cannot access|chrome:|edge:|extensions page/i.test(message)) {
        return "Chrome blocked this page. Open your ServiceNow list page and try Apply again.";
    }

    if (/Missing host permission|Cannot access contents/i.test(message)) {
        return "Chrome could not access this tab. Click the List View Manager icon while ServiceNow is the active tab.";
    }


    return message;
}

async function applyProfileOnPage(profileColumns) {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const normalizeText = value => String(value || "")
        .replace(/\u00a0/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

    const normalizeField = value => normalizeText(value)
        .replace(/[._-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const normalizeClean = text => normalizeText(text)
        .replace(/\[.*?\]|\(.*?\)/g, "")
        .trim();

    const getTargetDoc = () => {
        try {
            if (window.top && window.top.document) return window.top.document;
        } catch (e) {}
        return document;
    };

    const showOverlay = () => {
        const targetDoc = getTargetDoc();
        let el = targetDoc.getElementById("sn-lvm-overlay");
        if (!el) {
            el = targetDoc.createElement("div");
            el.id = "sn-lvm-overlay";
            el.style.cssText = `
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999999;
                pointer-events: none;
                background: #0f172a;
                color: #f8fafc;
                border: 1px solid #38bdf8;
                border-radius: 12px;
                padding: 14px 20px;
                width: 350px;
                max-width: 90vw;
                box-shadow: 0 12px 32px rgba(0,0,0,0.6);
                font-family: system-ui, -apple-system, sans-serif;
                box-sizing: border-box;
                transition: opacity 0.3s ease, transform 0.3s ease;
                display: block;
                opacity: 1;
            `;
            el.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-weight:700; font-size:13px; color:#38bdf8; display:flex; align-items:center; gap:6px;">
                        ⚡ List View Manager
                    </span>
                    <span id="sn-lvm-percent" style="font-size:13px; font-weight:700; color:#38bdf8;">0%</span>
                </div>
                <div id="sn-lvm-msg" style="font-size:11px; color:#94a3b8; margin-bottom:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    Initializing...
                </div>
                <div style="background:#1e293b; border-radius:999px; height:8px; overflow:hidden; border:1px solid #334155;">
                    <div id="sn-lvm-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #38bdf8, #0284c7); transition:width 0.25s ease;"></div>
                </div>
            `;
            (targetDoc.body || targetDoc.documentElement).appendChild(el);
        } else {
            el.style.display = "block";
            el.style.opacity = "1";
            el.style.transform = "translateX(-50%) translateY(0)";
        }
        return el;
    };

    const updateOverlay = (percent, message, state = "running") => {
        try {
            showOverlay();
            const targetDoc = getTargetDoc();
            const pctEl = targetDoc.getElementById("sn-lvm-percent");
            const msgEl = targetDoc.getElementById("sn-lvm-msg");
            const barEl = targetDoc.getElementById("sn-lvm-bar");
            const container = targetDoc.getElementById("sn-lvm-overlay");

            const clampedPct = Math.min(100, Math.max(0, Math.round(percent)));
            if (pctEl) pctEl.textContent = `${clampedPct}%`;
            if (msgEl) msgEl.textContent = message;
            if (barEl) barEl.style.width = `${clampedPct}%`;

            if (state === "running") {
                if (container) container.style.borderColor = "#38bdf8";
                if (pctEl) pctEl.style.color = "#38bdf8";
                if (barEl) barEl.style.background = "linear-gradient(90deg, #38bdf8, #0284c7)";
            } else if (state === "error") {
                if (container) container.style.borderColor = "#f87171";
                if (pctEl) pctEl.style.color = "#f87171";
                if (barEl) barEl.style.background = "#f87171";
            } else if (state === "success") {
                if (container) container.style.borderColor = "#4ade80";
                if (pctEl) pctEl.style.color = "#4ade80";
                if (barEl) barEl.style.background = "#4ade80";
            }

            if (state === "success" || state === "error") {
                setTimeout(() => {
                    const el = targetDoc.getElementById("sn-lvm-overlay");
                    if (el) {
                        el.style.opacity = "0";
                        el.style.transform = "translateX(-50%) translateY(-10px)";
                        setTimeout(() => {
                            try { el.remove(); } catch (e) {}
                        }, 400);
                    }
                }, 2200);
            }
        } catch (e) {}
    };

    const queryDeep = (selector, root = document) => {
        if (!root) return null;

        if (root.querySelector) {
            const match = root.querySelector(selector);
            if (match) return match;
        }

        const nodes = root.querySelectorAll ? root.querySelectorAll("*") : [];

        for (const node of nodes) {
            if (node.shadowRoot) {
                const match = queryDeep(selector, node.shadowRoot);
                if (match) return match;
            }
        }

        return null;
    };

    const findFirst = (selectors, root = document) => {
        for (const selector of selectors) {
            const match = queryDeep(selector, root);
            if (match) return match;
        }
        return null;
    };

    const waitForLayout = async () => {
        for (let attempt = 0; attempt < 25; attempt++) {
            const left = queryDeep("#slush_left");
            const right = queryDeep("#slush_right");

            if (left && right) {
                return { left, right, root: left.getRootNode ? left.getRootNode() : document };
            }

            await sleep(80);
        }

        return null;
    };

    const getOptionKeys = option => [
        normalizeText(option.text),
        normalizeClean(option.text),
        normalizeText(option.textContent),
        normalizeClean(option.textContent),
        normalizeText(option.label),
        normalizeText(option.title),
        normalizeText(option.value),
        normalizeField(option.value)
    ].filter(Boolean);

    const optionMatches = (option, wanted) => {
        const text = normalizeText(wanted);
        const clean = normalizeClean(wanted);
        const field = normalizeField(wanted);
        return getOptionKeys(option).some(key => key === text || key === clean || key === field || normalizeField(key) === field || normalizeClean(key) === clean);
    };

    const findOption = (select, wanted) => Array.from(select.options)
        .find(option => optionMatches(option, wanted));

    const containsOption = (select, wanted) => Boolean(findOption(select, wanted));

    const selectOnly = (select, option) => {
        for (const current of select.options) {
            current.selected = false;
        }

        option.selected = true;
        select.selectedIndex = option.index;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const waitUntil = async (predicate, timeout = 3000) => {
        const started = Date.now();

        while (Date.now() - started < timeout) {
            if (predicate()) return true;
            await sleep(100);
        }

        return predicate();
    };

    const clickButton = button => {
        if (!button) return false;
        button.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        button.click();
        return true;
    };

    const moveLeftToRight = root => {
        if (window.slush && typeof window.slush.moveLeftToRight === "function") {
            window.slush.moveLeftToRight();
            return true;
        }

        const button = findFirst([
            "[onclick*='moveLeftToRight']",
            ".slush-bucket-add",
            ".icon-chevron-right",
            "[title='Add']",
            "[aria-label='Add']"
        ], root);

        return clickButton(button);
    };

    const moveRightToLeft = root => {
        if (window.slush && typeof window.slush.moveRightToLeft === "function") {
            window.slush.moveRightToLeft();
            return true;
        }

        const button = findFirst([
            "[onclick*='moveRightToLeft']",
            ".slush-bucket-remove",
            ".icon-chevron-left",
            "[title='Remove']",
            "[aria-label='Remove']"
        ], root);

        return clickButton(button);
    };

    const layout = await waitForLayout();

    if (!layout) {
        return {
            ok: false,
            found: false,
            message: "List Layout was not found in this frame."
        };
    }

    let { left, right, root } = layout;
    const requestedColumns = profileColumns.map(column => String(column || "").trim()).filter(Boolean);
    const initialRightCount = right.options.length;
    const totalSteps = Math.max(1, initialRightCount + requestedColumns.length + 1);
    let stepCount = 0;

    const missing = [];
    const applied = [];
    const failed = [];

    updateOverlay(5, `Found List Layout (${initialRightCount} columns). Clearing...`);

    if (right.options.length > 0) {
        for (let i = 0; i < right.options.length; i++) {
            right.options[i].selected = true;
        }
        right.dispatchEvent(new Event("change", { bubbles: true }));
        moveRightToLeft(root);
        await sleep(250);
    }

    const maxClearingAttempts = Math.max(3000, initialRightCount * 2);

    for (let guard = 0; right.options.length > 0 && guard < maxClearingAttempts; guard++) {
        const before = right.options.length;
        selectOnly(right, right.options[0]);

        if (!moveRightToLeft(root)) {
            updateOverlay(0, "Could not find ServiceNow remove button.", "error");
            return {
                ok: false,
                found: true,
                message: "Could not find the ServiceNow remove button. The list was not saved."
            };
        }

        const moved = await waitUntil(() => right.options.length < before);

        if (!moved) {
            updateOverlay(0, "Could not remove current columns.", "error");
            return {
                ok: false,
                found: true,
                message: "ServiceNow did not remove the current selected columns. The list was not saved."
            };
        }

        stepCount++;
        const pct = (stepCount / totalSteps) * 100;
        updateOverlay(pct, `Clearing current columns (${initialRightCount - right.options.length}/${initialRightCount})...`);

        await sleep(50);
    }

    for (const wanted of requestedColumns) {
        left = queryDeep("#slush_left") || left;
        right = queryDeep("#slush_right") || right;
        root = left.getRootNode ? left.getRootNode() : root;

        stepCount++;
        const pct = (stepCount / totalSteps) * 100;
        updateOverlay(pct, `Adding "${wanted}" (${applied.length + 1}/${requestedColumns.length})...`);

        const option = findOption(left, wanted);

        if (!option) {
            if (containsOption(right, wanted)) {
                applied.push(wanted);
            } else {
                missing.push(wanted);
            }
            continue;
        }

        const before = right.options.length;
        selectOnly(left, option);

        if (!moveLeftToRight(root)) {
            failed.push(wanted);
            continue;
        }

        const moved = await waitUntil(() => containsOption(right, wanted) || right.options.length > before);

        if (moved) {
            applied.push(wanted);
        } else {
            failed.push(wanted);
        }

        await sleep(120);
    }

    if (missing.length || failed.length) {
        updateOverlay(90, "Some columns could not be moved.", "error");
        return {
            ok: false,
            found: true,
            applied,
            missing: missing.concat(failed),
            message: "Some columns could not be moved. The list was not saved."
        };
    }

    await sleep(300);
    updateOverlay(98, "Saving list layout...");

    if (typeof window.actionOK === "function") {
        window.actionOK();
    } else {
        const okButton = findFirst([
            "#ok_button",
            "[onclick*='actionOK']",
            "button[type='submit'].btn-primary",
            "input[type='submit'].btn-primary"
        ], root);

        if (!clickButton(okButton)) {
            updateOverlay(95, "Columns moved, but OK button was not found.", "error");
            return {
                ok: false,
                found: true,
                applied,
                message: "Columns were moved, but the OK button was not found."
            };
        }
    }

    updateOverlay(100, `✅ Applied ${applied.length} columns! Saving list view...`, "success");

    return {
        ok: true,
        found: true,
        applied,
        message: `Applied ${applied.length} columns and clicked OK.`
    };
}

