# 🛍️ How to Publish "List View Manager for ServiceNow" on Chrome Web Store

This step-by-step guide explains how to publish **List View Manager for ServiceNow** on the Google Chrome Web Store.

---

## 📦 Ready-to-Upload Package
Your extension ZIP package is compiled and ready:
- **Location**: `list-view-manager-v1.0.0.zip` (in the project root)
- **Includes**: `manifest.json`, icons (`16x16`, `48x48`, `128x128`, `512x512 logo`), `popup.html`, `popup.css`, `popup.js`, `storage.js`, `background.js`, `content.js`.
- **Privacy Policy**: [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) (required by Google Chrome Web Store).

---

## 🚀 Step-by-Step Publishing Steps

### Step 1: Create a Chrome Developer Account
1. Open the [Chrome Developer Console](https://chrome.google.com/webstore/devconsole/).
2. Sign in with your Google account.
3. If you haven't registered yet, pay the **one-time $5 developer registration fee** required by Google to prevent spam.

---

### Step 2: Create a New Item & Upload the ZIP
1. Click **"+ Add new item"** (or **"New Item"** button in top right).
2. Click **"Browse files"** and select `list-view-manager-v1.0.0.zip`.
3. Click **"Upload"**.

---

### Step 3: Complete Store Listing Details

#### 📝 Product Details
- **Item Title**: `List View Manager for ServiceNow`
- **Summary**: `Save, capture, export, and apply ServiceNow list column profiles effortlessly.`
- **Detailed Description**:
  ```text
  List View Manager for ServiceNow makes managing list view columns in ServiceNow fast and effortless.

  Key Features:
  ⚡ Apply Column Profiles: Change ServiceNow list columns in a single click without manually scrolling through slushbuckets.
  📸 Capture Columns: 1-click import to read and save currently selected columns from any open ServiceNow page.
  📤 Export & Import: Backup profiles or share them with teammates via JSON files.
  📋 Duplicate Profiles: Quickly clone existing profiles to create custom variations.
  🌙 Dark Mode & Modern UI: Full support for browser dark mode and crisp responsive popup interface.

  How to Use:
  1. Open any ServiceNow list view page and click "Configure > List Layout".
  2. Click the List View Manager extension icon in your toolbar.
  3. Select your saved column profile and click "Apply".

  Disclaimer:
  This extension is an independent tool and is not affiliated, endorsed, or sponsored by ServiceNow, Inc.
  ```

#### 🖼️ Graphic Assets
- **Store Icon**: Upload `icons/icon128.png` (128x128 PNG).
- **Screenshots**: Take 1–5 screenshots of the extension popup (1280x800 or 640x400 PNG/JPEG) while open on a ServiceNow page.
- **Promotional Tile (Optional)**: 440x280 PNG (You can use `icons/logo.png` or a custom graphic).

#### 🏷️ Categorization & Official Information
- **Category**: `Productivity` or `Developer Tools`
- **Language**: `English`

---

### Step 4: Privacy & Permissions Tab

Google requires clear privacy details:

1. **Privacy Policy Link**:
   - Google requires a public Privacy Policy URL.
   - You can copy the contents of [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) into a free GitHub Gist, Google Doc (set to "Anyone with link can view"), or host it on GitHub Pages.

2. **Single Purpose**:
   > *"Save and apply custom column profiles to ServiceNow list view slushbuckets."*

3. **Permission Justifications**:
   - `storage`: *"Required to save user-created column profile presets locally in browser storage."*
   - `activeTab` & `scripting`: *"Required to inject the slushbucket automation script into the active ServiceNow tab when the user clicks 'Apply' or 'Capture'."*
   - `host_permissions` (`*://*.service-now.com/*`, `*://*.servicenow.com/*`): *"Required to detect and interact with ServiceNow slushbucket list layout elements."*

4. **Data Usage Declarations**:
   - Check **"No"** to selling user data or using data for unrelated purposes.
   - Check **"Does not collect or store sensitive personal data"** (the extension works 100% locally in browser storage).

---

### Step 5: Submit for Review
1. Review all fields for completeness.
2. Click **"Submit for Review"**.
3. Google typically reviews new extension submissions within **24 to 72 hours**. Once approved, your extension will be live on the Chrome Web Store!
