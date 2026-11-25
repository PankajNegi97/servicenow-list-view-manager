// Profiles are stored one-per-key (prefix "p:") in chrome.storage.sync so they
// follow the user across devices. Per-key keeps each profile under sync's 8KB
// item limit (a single 450-column layout would blow a one-object store).
// Oversized profiles fall back to chrome.storage.local; getProfiles merges both.
const Storage = {

    PREFIX: "p:",

    async _readArea(area) {
        const all = await area.get(null);
        const out = {};
        for (const [key, value] of Object.entries(all)) {
            if (key.startsWith(this.PREFIX) && Array.isArray(value)) {
                out[key.slice(this.PREFIX.length)] = value;
            }
        }
        return { all, out };
    },

    async getProfiles() {
        const sync = await this._readArea(chrome.storage.sync);
        const local = await this._readArea(chrome.storage.local);
        const profiles = { ...local.out, ...sync.out }; // sync wins on conflict

        // One-time migration from the legacy single "profiles" object.
        const legacy = local.all.profiles || sync.all.profiles;
        if (legacy && typeof legacy === "object" && !Array.isArray(legacy)) {
            for (const [name, columns] of Object.entries(legacy)) {
                if (Array.isArray(columns) && !(name in profiles)) {
                    profiles[name] = columns;
                    await this.saveProfile(name, columns).catch(() => {});
                }
            }
            await chrome.storage.local.remove("profiles").catch(() => {});
            await chrome.storage.sync.remove("profiles").catch(() => {});
        }

        return profiles;
    },

    // Returns true if saved to sync (follows the user), false if it only fit locally.
    async saveProfile(name, columns) {
        const key = this.PREFIX + name;
        try {
            await chrome.storage.sync.set({ [key]: columns });
            await chrome.storage.local.remove(key).catch(() => {}); // drop any stale local copy
            return true;
        } catch (e) {
            // ponytail: quota/unavailable -> local fallback, so a huge profile still saves
            await chrome.storage.local.set({ [key]: columns });
            return false;
        }
    },

    async deleteProfile(name) {
        const key = this.PREFIX + name;
        await chrome.storage.sync.remove(key).catch(() => {});
        await chrome.storage.local.remove(key).catch(() => {});
    },

    async exportProfiles() {
        const profiles = await this.getProfiles();
        return JSON.stringify({ version: "1.0.0", exportedAt: new Date().toISOString(), profiles }, null, 2);
    },

    async importProfiles(jsonString) {
        const parsed = JSON.parse(jsonString);
        const incoming = parsed.profiles || parsed;

        if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
            throw new Error("Invalid profiles JSON file.");
        }

        let count = 0;
        for (const [name, columns] of Object.entries(incoming)) {
            if (typeof name === "string" && Array.isArray(columns) && columns.every(c => typeof c === "string")) {
                await this.saveProfile(name, columns).catch(() => {});
                count++;
            }
        }

        return count;
    }

};
