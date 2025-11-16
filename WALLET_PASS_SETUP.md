# Wallet Pass Setup Guide for StackPass

> **Status**: Your wallet pass implementation is 100% complete. This guide helps you configure the required certificates and accounts.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Apple Wallet Setup](#apple-wallet-setup)
3. [Google Wallet Setup](#google-wallet-setup)
4. [Environment Variables](#environment-variables)
5. [Create Wallet Assets](#create-wallet-assets)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

#### Apple Developer Account
- **Cost**: $99 USD/year
- **Signup**: https://developer.apple.com/programs/enroll/
- **Required for**: Apple Wallet passes
- **Processing time**: 24-48 hours for approval

#### Google Cloud Account
- **Cost**: FREE
- **Signup**: https://console.cloud.google.com/
- **Required for**: Google Wallet passes
- **Processing time**: Instant

### Required Software
- macOS (for Apple certificate generation)
- OpenSSL (pre-installed on macOS)
- Keychain Access (pre-installed on macOS)

---

## Apple Wallet Setup

### Step 1: Create Pass Type ID

- [ ] Log in to https://developer.apple.com/account/
- [ ] Navigate to **Certificates, Identifiers & Profiles**
- [ ] Click **Identifiers** → **+** button
- [ ] Select **Pass Type IDs** → **Continue**
- [ ] Fill in:
  - **Description**: `StackPass`
  - **Identifier**: `pass.dev.stackpass.card`
- [ ] Click **Continue** → **Register**
- [ ] **Save this identifier** for later

### Step 2: Create Certificate Signing Request

- [ ] Open **Keychain Access** (Applications → Utilities)
- [ ] Menu: **Keychain Access** → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
- [ ] Fill in:
  - **User Email**: Your Apple ID email
  - **Common Name**: `StackPass Pass Certificate`
  - **CA Email**: Leave EMPTY
  - **Request is**: ✓ Saved to disk
  - ✓ Let me specify key pair information
- [ ] Save as: `StackPassPass.certSigningRequest`
- [ ] Key settings:
  - **Key Size**: 2048 bits
  - **Algorithm**: RSA

### Step 3: Generate Pass Certificate

- [ ] Back in Apple Developer Portal → **Certificates**
- [ ] Click **+** button
- [ ] Select **Pass Type ID Certificate** → **Continue**
- [ ] Select your Pass Type ID → **Continue**
- [ ] Upload `StackPassPass.certSigningRequest` → **Continue**
- [ ] **Download** `pass.cer`
- [ ] **Double-click** `pass.cer` to install in Keychain

### Step 4: Export to P12

- [ ] Open **Keychain Access**
- [ ] Select **login** keychain → **My Certificates**
- [ ] Find `Pass Type ID: pass.dev.stackpass.card`
- [ ] **Expand** to see private key
- [ ] **Right-click certificate** → **Export**
- [ ] Save as: `.specify/certificates/pass-model/stackpass.p12`
- [ ] **Set a password** (save it securely!)

### Step 5: Convert to PEM Files

```bash
cd .specify/certificates/pass-model/

# Extract certificate
openssl pkcs12 -in stackpass.p12 -out signerCert.pem -clcerts -nokeys -legacy

# Extract private key
openssl pkcs12 -in stackpass.p12 -out signerKey.pem -nocerts -nodes -legacy

# Set permissions
chmod 644 signerCert.pem
chmod 600 signerKey.pem
```

### Step 6: Download WWDR Certificate

- [ ] Visit: https://www.apple.com/certificateauthority/
- [ ] Download **Worldwide Developer Relations - G4** (.cer file)
- [ ] Convert to PEM:

```bash
cd .specify/certificates/pass-model/

openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wwdr.pem
chmod 644 wwdr.pem
```

### Step 7: Get Team Identifier

- [ ] Go to: https://developer.apple.com/account/
- [ ] Click **Membership**
- [ ] Copy your **Team ID** (10-character code like `A1B2C3D4E5`)

---

## Google Wallet Setup

### Step 1: Create Google Cloud Project

- [ ] Go to: https://console.cloud.google.com/
- [ ] Click **Select a project** → **NEW PROJECT**
- [ ] Project name: `StackPass`
- [ ] Click **CREATE**
- [ ] **Select the new project**

### Step 2: Enable Google Wallet API

- [ ] Navigate to: **APIs & Services** → **Library**
- [ ] Search: `Google Wallet API`
- [ ] Click **ENABLE**

### Step 3: Create Service Account

- [ ] Navigate to: **IAM & Admin** → **Service Accounts**
- [ ] Click **CREATE SERVICE ACCOUNT**
- [ ] Fill in:
  - **Name**: `devius-wallet-service`
  - **Description**: `Service account for StackPass wallet passes`
- [ ] Click **CREATE AND CONTINUE**
- [ ] Grant role: **Service Account User**
- [ ] Click **DONE**

### Step 4: Generate Service Account Key

- [ ] Click **⋮** (three dots) on your service account
- [ ] Select **Manage keys**
- [ ] **ADD KEY** → **Create new key**
- [ ] Format: **JSON**
- [ ] Click **CREATE**
- [ ] Move downloaded file:

```bash
mv ~/Downloads/devius-devcard-*.json .specify/certificates/pass-model/google-service-key.json
chmod 600 .specify/certificates/pass-model/google-service-key.json
```

### Step 5: Set Up Issuer Account

- [ ] Go to: https://pay.google.com/business/console/
- [ ] Sign in (same account as Cloud project)
- [ ] Accept **Terms of Service**
- [ ] **Copy your Issuer ID** (long number at top)

### Step 6: Authorize Service Account

- [ ] In Pay Console → **Settings** → **Users**
- [ ] Click **ADD USER**
- [ ] Enter service account email (from JSON file: `client_email`)
- [ ] Role: **Developer**
- [ ] Click **ADD**

---

## Environment Variables

### Update `.env.local`

Add to your `.env.local` file:

```bash
# =============================================================================
# WALLET PASS CONFIGURATION
# =============================================================================

# Apple Wallet
APPLE_TEAM_IDENTIFIER=YOUR_TEAM_ID_HERE
APPLE_PASS_TYPE_IDENTIFIER=pass.dev.stackpass.card
APPLE_CERTIFICATE_PATH=/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/.specify/certificates/pass-model/signerCert.pem
APPLE_KEY_PATH=/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/.specify/certificates/pass-model/signerKey.pem
APPLE_WWDRCA_PATH=/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/.specify/certificates/pass-model/wwdr.pem

# Google Wallet
GOOGLE_WALLET_ISSUER_ID=YOUR_ISSUER_ID_HERE
GOOGLE_WALLET_SERVICE_ACCOUNT_KEY=$(cat .specify/certificates/pass-model/google-service-key.json)

# Wallet Assets (optional)
WALLET_ASSETS_PATH=/Users/dan/Documents/Websites/Devius/Deviusv2/Devius/public/wallet-assets
```

### For Vercel Production

For production, use base64-encoded certificates:

```bash
# Encode certificates
echo "APPLE_CERTIFICATE_BASE64=$(cat .specify/certificates/pass-model/signerCert.pem | base64 | tr -d '\n')"
echo "APPLE_KEY_BASE64=$(cat .specify/certificates/pass-model/signerKey.pem | base64 | tr -d '\n')"
echo "APPLE_WWDRCA_BASE64=$(cat .specify/certificates/pass-model/wwdr.pem | base64 | tr -d '\n')"
echo "GOOGLE_SERVICE_KEY_BASE64=$(cat .specify/certificates/pass-model/google-service-key.json | base64 | tr -d '\n')"
```

Then add these to Vercel environment variables.

---

## Create Wallet Assets

### Required Images

Create directory:
```bash
mkdir -p public/wallet-assets
```

### Image Requirements

| File | Size | Purpose |
|------|------|---------|
| `logo.png` | 160×50px | Pass header logo |
| `logo@2x.png` | 320×100px | Retina logo |
| `icon.png` | 29×29px | Notification icon |
| `icon@2x.png` | 58×58px | Retina icon |

### Quick Creation

If you have ImageMagick:

```bash
# Create from existing logo
convert public/assets/logo.png -resize 320x100 public/wallet-assets/logo@2x.png
convert public/assets/logo.png -resize 160x50 public/wallet-assets/logo.png
convert public/assets/icon.svg -resize 58x58 public/wallet-assets/icon@2x.png
convert public/assets/icon.svg -resize 29x29 public/wallet-assets/icon.png
```

Or use online tools like Figma/Photoshop to create properly sized images.

---

## Testing

### Test Apple Wallet

1. Start dev server:
```bash
npm run dev
```

2. Visit: `http://localhost:3000/yourusername`
3. Click **Share** → **Add to Apple Wallet**
4. Download `.pkpass` file
5. AirDrop to iPhone or email to yourself
6. Tap file on iPhone to add to Wallet

### Test Google Wallet

1. Click **Share** → **Add to Google Wallet**
2. Should redirect to Google Pay save URL
3. Open on Android device
4. Sign in with authorized Google account
5. Verify pass appears in Google Wallet app

### Verify Configuration

```bash
# Check env vars loaded
node -e "console.log('Apple configured:', !!process.env.APPLE_CERTIFICATE_PATH)"
node -e "console.log('Google configured:', !!process.env.GOOGLE_WALLET_ISSUER_ID)"
```

---

## Troubleshooting

### Apple Wallet: "Certificate not found"
**Solution**: Verify PEM files exist and paths are correct
```bash
ls -la .specify/certificates/pass-model/*.pem
```

### Apple Wallet: "Invalid signature"
**Solution**: Verify certificate is valid
```bash
openssl x509 -in .specify/certificates/pass-model/signerCert.pem -text -noout
```

### Google Wallet: "403 Forbidden"
**Solution**: Service account not authorized in Pay Console

### Pass downloads but won't open on iPhone
**Solution**: Check certificate expiration, verify logo.png exists

### "Platform not configured" error
**Expected**: This means certificates aren't set up yet (normal)

---

## Production Deployment

### Option 1: Base64 Environment Variables (Recommended)

1. Encode certificates:
```bash
cat .specify/certificates/pass-model/signerCert.pem | base64 | tr -d '\n'
```

2. Add to Vercel as environment variables
3. Modify code to decode base64 if path doesn't start with `/`

### Option 2: Store in Repository (Not Recommended)

Add encrypted certificates to repo using git-crypt or similar.

---

## Next Steps Checklist

### Immediate (5-10 minutes)
- [ ] Create this setup guide as markdown file
- [ ] Review prerequisites
- [ ] Decide if $99/year for Apple is worth it

### Phase 1: Apple Setup (3-4 hours)
- [ ] Enroll in Apple Developer Program
- [ ] Wait for approval (24-48 hours)
- [ ] Follow Apple Wallet steps above
- [ ] Test locally

### Phase 2: Google Setup (1-2 hours)
- [ ] Create Google Cloud project
- [ ] Follow Google Wallet steps above
- [ ] Test locally

### Phase 3: Production (1 hour)
- [ ] Configure Vercel environment variables
- [ ] Deploy and test on real devices

**Total Time**: ~6-8 hours active work + 24-48 hours waiting
**Total Cost**: $99/year (Apple only)