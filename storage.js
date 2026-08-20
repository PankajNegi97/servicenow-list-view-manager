const Storage = {

    async getProfiles() {

        const result = await chrome.storage.local.get("profiles");
        return result.profiles || {};

    },

    async saveProfile(name, columns) {

        const profiles = await this.getProfiles();

        profiles[name] = columns;

        await chrome.storage.local.set({
            profiles
        });

    },

    async deleteProfile(name) {

        const profiles = await this.getProfiles();

        delete profiles[name];

        await chrome.storage.local.set({
            profiles
        });

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

        const profiles = await this.getProfiles();

        let count = 0;
        for (const [name, columns] of Object.entries(incoming)) {
            if (typeof name === "string" && Array.isArray(columns)) {
                profiles[name] = columns;
                count++;
            }
        }

        await chrome.storage.local.set({ profiles });
        return count;

    }

};