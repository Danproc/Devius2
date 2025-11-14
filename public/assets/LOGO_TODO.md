# Logo Assets TODO

## Current Status
The current logo files in this directory are placeholders from the previous "Devius/Indie Kit" branding.

## Action Required
The following logo files need to be replaced with **StackPass** branded assets:

- `logo.png` - Main logo file (currently used in favicons and wallet passes)
- `logo.svg` - Vector logo (if exists)
- Any favicon files

## Design Requirements

### Brand Identity
- **New Brand Name:** StackPass
- **Product Focus:** GitHub-powered developer profiles with wallet passes
- **Color Scheme:** Keep the existing green (#00FF94) as the primary brand color

### Logo Specifications
1. **Favicon (logo.png)**
   - Size: 512x512px minimum
   - Format: PNG with transparency
   - Usage: Browser tabs, Apple touch icon, wallet pass icon

2. **Vector Logo (logo.svg)**
   - Format: SVG
   - Scalable for various sizes
   - Usage: Website headers, marketing materials

3. **Wallet Pass Logo**
   - Size: 160x50px (Apple Wallet requirement)
   - Format: PNG with transparency
   - High resolution (2x or 3x)

## Files Currently Using Logo
- `src/app/layout.tsx` - Favicon and Apple touch icon
- `src/emails/components/Layout.tsx` - Email header logo
- `src/lib/sharing/wallet-pass.ts` - Apple Wallet pass logo
- Wallet pass configuration (requires actual logo asset)

## Next Steps
1. Design new StackPass logo
2. Generate all required sizes and formats
3. Replace placeholder files in this directory
4. Test across all platforms (web, email, wallet)

---
**Note:** Logo design should reflect the developer-focused, GitHub-integrated nature of the platform.
