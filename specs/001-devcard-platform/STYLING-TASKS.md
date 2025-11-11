# Styling Tasks: User Story 1 - DevCard Design System

**Purpose**: Apply DevCard V2 design system to User Story 1 components before continuing to User Story 2

**Reference**: Original design specs from feature specification (Green branding, modern developer aesthetic)

## Design System Requirements

### Brand Colors
- **Primary Green**: `#00FF88` (DevCard signature green)
- **Dark Background**: `#0A0E14` or similar dark slate
- **Card Background**: Subtle gradient or glassmorphism effect
- **Text**: High contrast for readability
- **Accent Colors**: Complementary to green (blues, purples for variety)

### Typography
- **Headings**: Bold, modern sans-serif
- **Body**: Clean, readable (Inter or similar)
- **Code/Tech**: Monospace for technical elements
- **Sizing**: Clear hierarchy (name > bio > stats)

### Component Patterns
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: DevCard green primary, ghost secondary
- **Badges**: Tech stack pills with icons
- **Stats**: Clear metric display with icons
- **Repos**: Card-based grid with language colors

---

## Styling Tasks (User Story 1)

### T-S01: Design System Foundation

**File**: `src/styles/devcard-theme.css` or Tailwind config extension

- [ ] Define DevCard color palette in Tailwind config
  - Primary: #00FF88 (devcard-green)
  - Dark backgrounds
  - Accent colors
- [ ] Add custom animations (fade-in, slide-up for cards)
- [ ] Define spacing scale for DevCard components
- [ ] Add glassmorphism utilities if needed

---

### T-S02: Public DevCard Page Styling

**File**: `src/app/(public)/[username]/page.tsx`

- [ ] Dark gradient background (subtle, not distracting)
- [ ] Center card with max-width constraint
- [ ] Add fade-in animation on load
- [ ] Responsive layout (mobile-first)
- [ ] Meta tags for social sharing (OG images)

---

### T-S03: Card Preview Component

**File**: `src/components/devcard/card-preview.tsx`

- [ ] Modern card design with subtle shadow/glow
- [ ] Glassmorphism or gradient background
- [ ] Rounded corners (lg or xl)
- [ ] Hover effects (subtle lift/glow)
- [ ] Responsive padding and spacing
- [ ] Green accent highlights

---

### T-S04: Profile Section

**File**: `src/components/devcard/profile-section.tsx`

- [ ] Large avatar with green ring/border
- [ ] Name typography: Bold, large, high contrast
- [ ] GitHub username: Smaller, muted with @ symbol
- [ ] Bio: Readable size, proper line spacing
- [ ] Location/links: Icon + text layout
- [ ] Availability badge: Green pill for "Open to opportunities"

---

### T-S05: Repository Showcase

**File**: `src/components/devcard/repo-showcase.tsx`

- [ ] Grid layout (responsive: 1 col mobile, 2-3 cols desktop)
- [ ] Repo cards: Distinct from main card, subtle backgrounds
- [ ] Language badges with actual language colors (TypeScript blue, Python yellow, etc.)
- [ ] Star/fork counts with icons
- [ ] Hover effects (scale, highlight)
- [ ] Truncate long descriptions with "Read more"

---

### T-S06: Stats Display

**File**: `src/components/devcard/stats-display.tsx`

- [ ] Horizontal stat cards or grid
- [ ] Icons for each metric (repos, stars, followers)
- [ ] Number formatting (1.2k instead of 1234)
- [ ] Subtle backgrounds for each stat
- [ ] Green highlights for standout metrics
- [ ] Animated counter effect (optional)

---

### T-S07: Dashboard Styling

**File**: `src/app/(in-app)/app/dashboard/page.tsx`

- [ ] Clean layout with DevCard preview
- [ ] Share URL: Copy button with green highlight
- [ ] "View Public Card" button: Prominent, green
- [ ] Quick stats summary
- [ ] Recent activity/views (if data available)
- [ ] Mobile responsive

---

### T-S08: Sign-In Page Polish

**File**: Already updated, verify:

- [x] GitHub button: Green (#00FF88)
- [ ] Page layout: Centered, clean
- [ ] Add DevCard branding/logo
- [ ] Tagline: "Your developer card, instantly"
- [ ] Privacy notice styling
- [ ] Dark theme consistency

---

### T-S09: Loading & Error States

**Files**: `src/app/(public)/[username]/loading.tsx`, `error.tsx`, `not-found.tsx`

- [ ] Loading: Skeleton with green pulse animation
- [ ] Error: Friendly message with retry button (green)
- [ ] Not Found: Helpful 404 with suggestions
- [ ] Consistent styling across all states

---

### T-S10: Tech Stack Badges

**Component**: Tech stack display in profile section

- [ ] Icon library for tech logos (React, TypeScript, etc.)
- [ ] Pill/badge design with subtle backgrounds
- [ ] Grid or flex wrap layout
- [ ] Hover effects showing tech name
- [ ] Color coding by category (languages vs frameworks vs tools)

---

## Design Reference

**Refer to original design specs for:**
- Color values and gradients
- Specific component layouts
- Animation preferences
- Mobile breakpoints
- Dark/light mode variations

## Testing Checklist

After completing styling tasks:

- [ ] View `/danproc` in browser - looks professional and branded
- [ ] Test mobile responsive (resize browser)
- [ ] Check dark/light mode (if applicable)
- [ ] Verify all text is readable
- [ ] Hover states work smoothly
- [ ] No layout shifts on load
- [ ] Animations are subtle, not jarring
- [ ] Screenshot and compare to design specs

---

## Notes for Claude Code Web Agent

- Use existing Tailwind utilities where possible
- Keep components modular and reusable
- Ensure accessibility (contrast ratios, focus states)
- Test on both dark and light modes
- Mobile-first responsive design
- Performance: Keep animations GPU-accelerated (transform/opacity)
