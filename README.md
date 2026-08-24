# 📋 List View Manager for ServiceNow

**List View Manager for ServiceNow** is a Chrome extension that simplifies saving, capturing, exporting, and applying custom list column layouts in ServiceNow slushbuckets.

---

## 🚀 How to Use (Step-by-Step Guide)

### 1️⃣ Capture or Create Column Profiles
- **Option A (Automatic 📸)**: Open any ServiceNow table list view (e.g. Incidents, Requests) or **Configure > List Layout** page. Click the extension icon and click **`📸 Capture from Page`**. It will automatically detect all visible columns and fill the editor.
- **Option B (Manual 📝)**: Enter a **Profile Name** (e.g., *Incident Daily View*) and type column display names into the text box (one column name per line).
- Click **`Save Profile`**.

### 2️⃣ Apply a Profile to ServiceNow
1. Navigate to your ServiceNow list view page.
2. Right-click any table header (or click table options) and select **Configure > List Layout** (**keep this List Layout screen open!**).
3. Open the **List View Manager** extension popup.
4. Click **`Apply`** on your saved column profile.
5. **Watch Live Progress % Overlay**: A sleek dark progress banner appears right on top of your ServiceNow page showing real-time **percentage progress (0% → 100%)** as columns are cleared, moved, and saved automatically!

### 3️⃣ Export, Import & Duplicate Profiles
- **Export**: Click **`Export`** to download all saved column profiles as a `.json` backup file.
- **Import**: Click **`Import`** to load column presets shared by your teammates or restored from backup.
- **Duplicate**: Click **`Duplicate`** on any profile card to quickly clone and create modified presets.

---

## 🛠️ Features

| Feature | Description |
| :--- | :--- |
| ⚡ **1-Click Slushbucket Automation** | Re-arranges ServiceNow slushbucket columns automatically without manual dragging/scrolling. |
| 📸 **1-Click Column Capture** | Detects active table columns or slushbucket selections directly from open ServiceNow tabs. |
| 📤 **Export & Import JSON** | Easily backup or share profile presets across teams. |
| 📋 **Duplicate & Edit** | Clone profiles for quick variations. |
| 🌙 **Dark Mode & Responsive UI** | Auto-detects browser dark/light mode preference. |
| 📖 **Built-in Quick Start Guide** | Built-in interactive `❓ Guide` panel right inside the popup for new users. |

---

## 💻 Installation Guide (Developer / Local Mode)

1. Clone or download this repository.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select this project directory (`SN-Column-Manager`).
5. Pin the **List View Manager** icon to your Chrome toolbar for fast access.

---

## 📁 File Structure

```text
SN-Column-Manager/
├── manifest.json                  # Manifest V3 extension configuration
├── popup.html                     # Main extension UI & Help Guide modal
├── popup.css                      # Modern dark/light design system styling
├── popup.js                       # UI controller, capture logic & slushbucket automation engine
├── storage.js                     # Chrome Storage API abstraction module
├── background.js                  # Background service worker script
├── content.js                     # Content script bridge
├── icons/                         # Extension icons (16x16, 48x48, 128x128, upi_logo)
├── PRIVACY_POLICY.md              # Official Privacy Policy
└── CHROME_STORE_PUBLISH_GUIDE.md  # Guide for publishing to Google Chrome Web Store
```

---

## ☕ Support

If you find this extension helpful, consider supporting the developer:
- ☕ [Buy Me a Coffee](https://buymeacoffee.com/pankajnegi)
- 💳 [Support via UPI](https://onlychai.neocities.org/support?name=Pankaj%20Negi&upi=Pankajitft2015-2%40okicici#)
