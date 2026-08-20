# 🇮🇳 Monetization & Payment Setup for India Developers

This guide explains how to accept international payments (USD/EUR) and receive payouts directly into your **Indian Bank Account** for **List View Manager for ServiceNow**.

---

## ⚡ Why LemonSqueezy / Paddle is Best for India

In India, direct Stripe accounts face strict RBI cross-border regulations and e-mandate restrictions.

The industry-standard solution for Indian developers selling digital software globally is to use a **Merchant of Record (MoR)** like **LemonSqueezy** or **Paddle**:

| Feature | LemonSqueezy / Paddle | Standard Direct Stripe |
| :--- | :--- | :--- |
| **India Support** | ✅ 100% Supported | ⚠️ RBI Restrictions / Invite Only |
| **Global Tax & VAT** | ✅ Handled automatically | ❌ You must file taxes in 50+ countries |
| **Payout to India** | ✅ Direct SWIFT/Bank transfer (INR) | ⚠️ Complex compliance |
| **Customer Payment Options** | ✅ Credit Card, Debit Card, PayPal, Apple Pay, Google Pay | ❌ Limited |

---

## 🚀 Step-by-Step Monetization Guide for India

### Step 1: Create a Free LemonSqueezy Account
1. Go to [LemonSqueezy.com](https://www.lemonsqueezy.com/).
2. Register your account and select **India** as your store country.
3. Add your product: **List View Manager - Pro**.
4. Set your pricing (e.g., **$4.99/month** or **$29/year** or **$9.99 one-time**).

---

### Step 2: Link Your Indian Bank Account
1. Under **Settings > Payouts**, select **Bank Transfer (SWIFT)**.
2. Enter your Indian Bank details:
   - Account Holder Name (Must match your PAN/Bank record)
   - Account Number
   - Bank IFSC Code & SWIFT Code (Available on your bank statement or netbanking)
3. LemonSqueezy will automatically convert USD/EUR sales to INR and transfer funds to your Indian bank account on payouts.

---

### Step 3: Enable License Keys in LemonSqueezy
1. In LemonSqueezy product settings, enable **"Issue License Keys"**.
2. When a customer buys your extension, LemonSqueezy automatically emails them a unique **License Key**.

---

### Step 4: How License Validation Works in the Extension
Users unlock Pro features by entering their License Key into the extension popup:

1. User clicks **"Activate Pro License"** in the extension popup.
2. Extension sends a simple fetch request to LemonSqueezy's official license API:
   ```javascript
   const res = await fetch("https://api.lemonsqueezy.com/v1/licenses/activate", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
           license_key: inputKey,
           instance_name: "Chrome Extension"
       })
   });
   const data = await res.json();
   if (data.activated) {
       // Unlock Pro Features locally!
       await chrome.storage.local.set({ isPro: true, licenseKey: inputKey });
   }
   ```

---

## ⚖️ India Tax & Legal Basics for Software Exports

1. **GST Registration**:
   - If your annual global turnover is under **₹20 Lakhs**, GST registration is **NOT mandatory**.
   - If you exceed ₹20 Lakhs, register for GST and file LUT (Letter of Undertaking) for 0% GST on zero-rated export sales.
2. **PAN Card**:
   - Use your individual PAN card during signup on LemonSqueezy. No company/LLC is required to start!
