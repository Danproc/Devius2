# FINAL DESIGN SPECIFICATION - DevCard V2

**Reference Image**: `specs/001-devcard-platform/design/Final-Design.png`

## EXACT COLOR PALETTE

```css
--devcard-base: #04080f      /* Background */
--devcard-heading: #dde3ed   /* Headings (name, titles) */
--devcard-text: #5b6a7f      /* Body text (bio, descriptions) */
--devcard-green: #1cf491     /* Primary green (buttons, accents, numbers) */
--devcard-border: #121824    /* Borders and dividers */
```

## TYPOGRAPHY

**Font Family**: Inter (already installed)
- Name/Headings: `font-inter font-semibold text-devcard-heading`
- Body text: `font-inter font-normal text-devcard-text`
- Numbers/Stats: `font-inter font-bold text-devcard-green`

## COMPONENT SPECIFICATIONS

### 1. Page Background
```tsx
className="bg-[#04080f] min-h-screen"
```

### 2. Main Card Container
```tsx
className="bg-[#04080f] border border-[#121824] rounded-3xl p-8 max-w-2xl mx-auto"
// NO glassmorphism, NO blur, NO glow effects
```

### 3. Premium Badge (Top Right)
```tsx
className="bg-[#1cf491] text-black px-4 py-2 rounded-full font-semibold text-sm"
```

### 4. Avatar
```tsx
// Large circular avatar, NO green ring/border
className="w-48 h-48 rounded-full mx-auto"
```

### 5. Name
```tsx
className="text-4xl font-semibold text-[#dde3ed] text-center mt-6"
// Example: "Dan Proctor"
```

### 6. User Number Badge
```tsx
className="text-[#5b6a7f] text-2xl font-medium"
// Example: "#1"
```

### 7. Bio Text
```tsx
className="text-[#5b6a7f] text-center max-w-xl mx-auto mt-4 leading-relaxed"
// Lorem ipsum text in the mockup
```

### 8. Social Links Row
```tsx
className="flex items-center justify-center gap-6 text-[#5b6a7f] mt-6"
// Icons: Location, GitHub, Instagram, Website
// Each item: icon + text
```

### 9. Connect Button (PRIMARY CTA)
```tsx
className="w-full bg-[#1cf491] hover:bg-[#19e085] text-black font-bold text-lg py-4 rounded-full transition-colors mt-8"
// Text: "Connect with Dan"
// NO glow effect on hover
```

### 10. Connected Developers Section
```tsx
// Text: "Connected with 25 developers"
// "25" in green (#1cf491), rest in muted (#5b6a7f)
<p className="text-center text-[#5b6a7f] mt-8">
  Connected with <span className="text-[#1cf491] font-semibold">25</span> developers
</p>

// Avatar row
className="flex justify-center -space-x-4 mt-4"
// Each avatar: w-12 h-12 rounded-full border-2 border-[#121824]
```

## DESIGN RULES

### ❌ REMOVE These:
- Glassmorphism effects (`backdrop-blur`, `rgba` backgrounds)
- Hover glow effects (`box-shadow` with green glow)
- Green rings/borders on avatar
- Gradient backgrounds
- Any `animate-green-glow` or glow keyframes
- Complex shadows

### ✅ KEEP These:
- Clean, flat design
- Subtle hover: Only slight lift (`translateY(-2px)`)
- Border: `#121824`
- Rounded corners: `rounded-3xl` for main card, `rounded-full` for buttons/avatars
- Simple, minimal aesthetic

## COMPONENTS TO UPDATE

1. **`src/app/(public)/[username]/page.tsx`**
   - Background: `bg-[#04080f]`
   - Remove any gradient or complex styling

2. **`src/components/devcard/card-preview.tsx`**
   - Card: `bg-[#04080f] border border-[#121824] rounded-3xl`
   - NO glassmorphism

3. **`src/components/devcard/profile-section.tsx`**
   - Avatar: NO green ring
   - Name: `text-[#dde3ed]`
   - Bio: `text-[#5b6a7f]`
   - Social links: `text-[#5b6a7f]`

4. **`src/components/devcard/stats-display.tsx`**
   - Numbers: `text-[#1cf491]`
   - Labels: `text-[#5b6a7f]`

5. **`src/components/devcard/repo-showcase.tsx`**
   - Repo cards: `bg-[#04080f] border border-[#121824]`
   - Repo names: `text-[#dde3ed]`
   - Descriptions: `text-[#5b6a7f]`
   - Stats: `text-[#1cf491]`

6. **All buttons**:
   - Primary: `bg-[#1cf491] hover:bg-[#19e085] text-black`
   - NO glow, NO ring effects

## FONT SETUP

Ensure Inter is loaded in `src/app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

// In body tag:
<body className={inter.className}>
```

---

**CRITICAL**: This is the FINAL design. Match the mockup exactly - clean, minimal, professional.
