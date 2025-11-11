# DevCard Design System - Design Tokens

**Extracted from Figma/Illustrator designs**
**Date**: 2025-11-10

---

## Color Palette

### Dark Theme (Default)

**Backgrounds**:
```
--devcard-bg-primary: #0a0a0a
--devcard-bg-card: #1a1a1a
--devcard-bg-elevated: #2a2a2a
```

**Accent Colors**:
```
--devcard-accent-primary: #00FF88 (Bright Green)
--devcard-accent-hover: #00DD77
--devcard-accent-pressed: #00CC66
```

**Text Colors**:
```
--devcard-text-primary: #ffffff
--devcard-text-secondary: #888888
--devcard-text-tertiary: #666666
--devcard-text-muted: #444444
```

**Border Colors**:
```
--devcard-border-default: #2a2a2a
--devcard-border-focus: #00FF88
```

### Light Theme

**Backgrounds**:
```
--devcard-light-bg-primary: #ffffff
--devcard-light-bg-card: #f9f9f9
--devcard-light-bg-elevated: #f1f1f1
```

**Text Colors**:
```
--devcard-light-text-primary: #0a0a0a
--devcard-light-text-secondary: #666666
```

**Accent** (slightly darker for contrast):
```
--devcard-light-accent: #00DD77
```

---

## Typography

### Font Family
```
--devcard-font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
```

### Font Sizes
```
--devcard-text-xs: 12px
--devcard-text-sm: 14px
--devcard-text-base: 16px
--devcard-text-lg: 18px
--devcard-text-xl: 24px
--devcard-text-2xl: 32px
--devcard-text-3xl: 40px
```

### Font Weights
```
--devcard-font-regular: 400
--devcard-font-medium: 500
--devcard-font-semibold: 600
--devcard-font-bold: 700
```

### Line Heights
```
--devcard-leading-tight: 1.25
--devcard-leading-normal: 1.5
--devcard-leading-relaxed: 1.75
```

### Specific Elements
```
Name: 32px, bold (700), tight (1.25)
Headline: 16px, regular (400), normal (1.5)
Bio: 14px, regular (400), relaxed (1.75)
Section Headings: 18px, semibold (600)
Stats/Metadata: 13px, medium (500)
Member ID: 14px, medium (500), gray
Premium Badge: 12px, semibold (600), green bg
```

---

## Spacing

### Card Structure
```
--devcard-card-padding: 40px (desktop), 24px (mobile)
--devcard-card-radius: 16px
--devcard-card-border: 1px
```

### Section Gaps
```
--devcard-gap-xs: 8px
--devcard-gap-sm: 12px
--devcard-gap-md: 16px
--devcard-gap-lg: 24px
--devcard-gap-xl: 32px
--devcard-gap-2xl: 48px
```

### Specific Spacing
```
Header to Avatar: 32px
Avatar to Name: 16px
Name to Headline: 8px
Headline to Metadata: 12px
Metadata to CTA: 24px
Between sections: 32px
Button padding: 12px 24px
Badge padding: 6px 12px
```

---

## Components

### Avatar
```
Size: 140px diameter
Border: 2px solid --devcard-border-default
Border-radius: 50% (circular)
Drop shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
```

### Buttons

**Primary (Connect Button)**:
```
Background: --devcard-accent-primary (#00FF88)
Text: #000000 (black for contrast)
Height: 48px
Padding: 12px 32px
Border-radius: 24px (fully rounded)
Font: 16px, semibold (600)
Hover: Scale 1.02, glow shadow
Active: Scale 0.98
```

**Secondary (View Project, etc.)**:
```
Background: transparent
Border: 1px solid --devcard-accent-primary
Text: --devcard-accent-primary
Height: 40px
Padding: 8px 20px
Border-radius: 8px
Hover: Background fade to accent-primary/10
```

### Badges

**Premium Badge**:
```
Background: --devcard-accent-primary
Text: #000000
Height: 28px
Padding: 6px 16px
Border-radius: 14px (pill)
Font: 12px, semibold (600)
Position: Absolute top-right (16px from edges)
```

**Member ID** (next to name):
```
Text: #1 (or #2, #3, etc.)
Color: --devcard-text-secondary
Font: 14px, medium (500)
Display: inline, gray
```

**Language Badges**:
```
Background: Transparent
Border: 1px solid language-color
Text: --devcard-text-primary
Height: 24px
Padding: 4px 10px
Border-radius: 4px
Font: 12px, regular
Color dot: 8px circle, language-specific color
Gap: 6px between dot and text
```

### Cards (Sections)

**Repository Cards**:
```
Background: --devcard-bg-elevated
Border: 1px solid --devcard-border-default
Padding: 20px
Border-radius: 12px
Gap: 12px between elements
Hover: Border color to accent
```

### Dividers
```
Color: --devcard-border-default
Height: 1px
Margin: 24px 0
Opacity: 0.5
```

---

## Animations

### Timings
```
--devcard-transition-fast: 150ms
--devcard-transition-base: 300ms
--devcard-transition-slow: 500ms
```

### Easing
```
--devcard-ease-out: cubic-bezier(0.16, 1, 0.3, 1)
--devcard-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
```

### Specific Animations

**Page Load** (Fade In):
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

animation: fadeIn 500ms var(--devcard-ease-out);
```

**Stagger Children** (for sections):
```
Delay: 100ms between each
Total duration: 500ms
```

**Button Hover**:
```css
transform: scale(1.02);
box-shadow: 0 8px 24px rgba(0, 255, 136, 0.3);
transition: all 200ms ease-out;
```

**Badge Hover**:
```css
transform: translateY(-2px);
transition: transform 150ms ease-out;
```

**Connect Button** (special):
```css
/* Default state */
background: #00FF88;
box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4);

/* Hover */
transform: scale(1.02);
box-shadow: 0 8px 24px rgba(0, 255, 136, 0.6);

/* Click */
transform: scale(0.98);
```

---

## Layout Measurements (from screenshots)

### Card Container
```
Max-width: 680px
Margin: 64px auto (desktop), 16px auto (mobile)
Padding: 40px (desktop), 24px (mobile)
Background: --devcard-bg-card
Border-radius: 16px
```

### Avatar Section
```
Avatar: 140px diameter, centered
Margin-bottom: 16px
```

### Name + Member ID
```
Name: 32px, centered
Member ID: 14px, inline, gray, padding-left 8px
Gap: 8px between name and ID
```

### Bio
```
Max-width: 480px (centered within card)
Text-align: center
Max-height: 48px (2 lines @ 24px line-height)
Overflow: ellipsis
```

### Language Section
```
Heading: "Top Languages", 18px semibold
Subheading: "Detected from repositories", 13px, gray
Gap: 8px between heading and badges
Badges: Flex wrap, gap 8px
```

### Connect Button
```
Width: 100%
Height: 56px (larger than normal buttons)
Margin: 32px 0
```

### Connection Avatars
```
Avatar size: 48px diameter
Overlap: -12px (each avatar overlaps previous by 12px)
Border: 2px solid --devcard-bg-card (for separation)
Max shown: 5 avatars + "+X more" text
```

### QR Code
```
Size: 200px square
Padding: 24px
Background: white (for contrast)
Border-radius: 8px
Margin: 32px auto
```

---

## Component States

### Buttons

**Connect Button States**:
```
Default: Green background, black text
Hover: Lifted, glowing shadow
Pressed: Scale down
Loading: Spinner, "Connecting..."
Disabled: Gray background, no interaction
Sent: "Request sent", gray, no click
```

**Secondary Button States**:
```
Default: Transparent, green border
Hover: Light green background
Pressed: Darker green background
```

### Badges

**Premium Badge States**:
```
Standard: Green background
Lifetime: Gold gradient background
Trial: Orange background
```

**Language Badge States**:
```
Default: Border with language color
Hover: Lifted slightly, subtle shadow
```

---

## Responsive Breakpoints

```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

### Mobile Adjustments
```
Card padding: 40px → 24px
Avatar size: 140px → 100px
Font sizes: -2px for all
Button height: 56px → 48px
Section gaps: 32px → 20px
```

---

## Icon System

### Icons to Use
- Use **Lucide React** icons
- Size: 16px for inline, 20px for buttons
- Color: Inherit from parent or accent
- Stroke-width: 2

### Specific Icons
```
Member ID: None (just # symbol)
Premium: Crown or Star
Location: MapPin
GitHub: Github
Website: Globe
Email: Mail
Twitter: Twitter (from lucide or custom)
LinkedIn: Linkedin
Connect: Users or UserPlus
Settings: Settings
Notifications: Bell
```

---

## Animation Specifications

### Page Transitions
```
Duration: 300ms
Easing: ease-out
Fade + Slide: opacity 0→1, translateY 20px→0
```

### Micro-interactions
```
Button hover: 200ms, scale 1.02
Badge hover: 150ms, translateY -2px
Icon hover: 200ms, rotate or bounce
Link hover: Underline fade-in 150ms
```

### Loading States
```
Spinner: Rotate 360deg, 1s, linear, infinite
Skeleton: Pulse opacity 0.5→1, 1.5s, ease-in-out
Progress: Width 0→100%, variable duration
```

---

## Usage in Code

### Tailwind CSS Classes

**Based on these tokens**:

```typescript
// Card container
<Card className="bg-[#1a1a1a] border-[#2a2a2a] rounded-2xl p-10">

// Primary button (Connect)
<Button className="bg-[#00FF88] text-black hover:scale-105 transition-transform h-14 rounded-full">

// Premium badge
<Badge className="bg-[#00FF88] text-black absolute top-4 right-4">
  Premium
</Badge>

// Language badge
<Badge
  className="border border-[color] bg-transparent text-white text-xs"
  style={{ borderColor: language.color }}
>
  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: language.color }} />
  {language.name}
</Badge>
```

### Framer Motion Variants

```typescript
// Page container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Child elements
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Usage
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div variants={itemVariants}>
    {/* Avatar */}
  </motion.div>
  <motion.div variants={itemVariants}>
    {/* Name */}
  </motion.div>
</motion.div>
```

---

## Mobile-Specific Tokens

```
Card padding: 24px
Avatar: 100px
Name: 28px
Headline: 14px
Bio: 13px
Button height: 48px
Section gap: 20px
```

---

## Accessibility

### Contrast Ratios
```
Primary text on dark bg: 21:1 (AAA)
Secondary text on dark bg: 7:1 (AA)
Accent on dark bg: 12:1 (AAA)
Button text on accent: 8:1 (AA)
```

### Focus States
```
Outline: 2px solid --devcard-accent-primary
Offset: 2px
Border-radius: Same as element
```

---

## Language Color Mapping

**Use these exact colors for language badges**:

```javascript
const languageColors = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f7df1e',
  'Python': '#3776ab',
  'Java': '#b07219',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Ruby': '#701516',
  'PHP': '#777bb4',
  'C++': '#f34b7d',
  'C#': '#178600',
  'Swift': '#ffac45',
  'Kotlin': '#A97BFF',
  'Shell': '#89e051',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'Vue': '#41b883',
  'React': '#61dafb', // Framework, not language
};
```

**Fallback**: `#888888` (gray) for unknown languages

---

## Component Examples

### Premium Badge (Exact Replica)

```tsx
<div className="absolute top-4 right-4">
  <Badge className="
    bg-[#00FF88]
    text-black
    px-4
    py-1.5
    text-xs
    font-semibold
    rounded-full
  ">
    Premium
  </Badge>
</div>
```

### Member ID Display

```tsx
<div className="flex items-baseline gap-2 justify-center">
  <h1 className="text-3xl font-bold text-white">
    Dan Proctor
  </h1>
  <span className="text-sm text-[#888888] font-medium">
    #1
  </span>
</div>
```

### Connect Button (Big Green CTA)

```tsx
<Button className="
  w-full
  h-14
  bg-[#00FF88]
  hover:bg-[#00DD77]
  text-black
  font-semibold
  text-base
  rounded-full
  shadow-[0_4px_12px_rgba(0,255,136,0.4)]
  hover:shadow-[0_8px_24px_rgba(0,255,136,0.6)]
  hover:scale-[1.02]
  active:scale-[0.98]
  transition-all
  duration-200
">
  Connect with Dan
</Button>
```

### Language Badge

```tsx
<Badge className="
  border
  bg-transparent
  text-white
  text-xs
  px-3
  py-1
  rounded
  flex
  items-center
  gap-2
"
style={{ borderColor: language.color }}
>
  <span
    className="w-2 h-2 rounded-full"
    style={{ backgroundColor: language.color }}
  />
  {language.name} {language.percentage}%
</Badge>
```

### Connection Avatars (Overlapping)

```tsx
<div className="flex justify-center -space-x-3">
  {connections.slice(0, 5).map((user, idx) => (
    <img
      key={user.id}
      src={user.avatar}
      alt={user.username}
      className="
        w-12
        h-12
        rounded-full
        border-2
        border-[#1a1a1a]
        hover:scale-110
        transition-transform
        cursor-pointer
      "
      style={{ zIndex: 5 - idx }}
    />
  ))}
  {connectionCount > 5 && (
    <div className="
      w-12
      h-12
      rounded-full
      border-2
      border-[#1a1a1a]
      bg-[#2a2a2a]
      flex
      items-center
      justify-center
      text-xs
      font-medium
    ">
      +{connectionCount - 5}
    </div>
  )}
</div>
```

---

## Z-Index Layers

```
--z-base: 0
--z-card: 1
--z-dropdown: 10
--z-sticky: 20
--z-modal: 50
--z-notification: 60
--z-tooltip: 70
```

---

## Reference

**Design Files**:
- Main card: `docs/designs/devcard-full.png`
- Annotated: `docs/designs/devcard-annotated.png`
- Mobile: `docs/designs/devcard-mobile.png`

**Match these designs EXACTLY** - this is the quality bar.

---

**Last Updated**: 2025-11-10
**Version**: 2.0
