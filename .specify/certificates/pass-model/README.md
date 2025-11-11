# Wallet Pass Certificates

This directory stores certificates required for generating Apple Wallet passes and Google Wallet passes.

## Apple Wallet Certificates

To generate Apple Wallet passes, you need the following certificates:

1. **Apple WWDR Certificate** (`wwdr.pem`)
   - Download from Apple Developer Portal
   - Used to verify the chain of trust

2. **Apple Signer Certificate** (`signerCert.pem`)
   - Your Pass Type ID certificate
   - Downloaded from Apple Developer Portal

3. **Apple Signer Key** (`signerKey.pem`)
   - Private key for your Pass Type ID certificate
   - Generated when creating the certificate

## Google Wallet Service Key

For Google Wallet passes, you need:

1. **Google Service Account Key** (`google-service-key.json`)
   - Download from Google Cloud Console
   - Service account with Google Wallet API access

## Setup Instructions

### Apple Wallet Setup

1. Create an Apple Developer account
2. Create a Pass Type ID in the Certificates, Identifiers & Profiles section
3. Generate a certificate for the Pass Type ID
4. Download the certificate and convert to PEM format
5. Download the WWDR certificate
6. Place files in this directory:
   - `wwdr.pem`
   - `signerCert.pem`
   - `signerKey.pem`

### Google Wallet Setup

1. Create a Google Cloud project
2. Enable the Google Wallet API
3. Create a service account with appropriate permissions
4. Download the service account key JSON file
5. Place `google-service-key.json` in this directory

## Security Note

**IMPORTANT:** This directory should be added to `.gitignore` to prevent committing sensitive certificates to version control. Only documentation files should be committed.
