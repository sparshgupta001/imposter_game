# Styling and Design System

<cite>
**Referenced Files in This Document**
- [tailwind.config.js](file://client/tailwind.config.js)
- [postcss.config.js](file://client/postcss.config.js)
- [index.css](file://client/src/index.css)
- [package.json](file://client/package.json)
- [vite.config.js](file://client/vite.config.js)
- [App.jsx](file://client/src/App.jsx)
- [Home.jsx](file://client/src/screens/Home.jsx)
- [Lobby.jsx](file://client/src/screens/Lobby.jsx)
- [RoleReveal.jsx](file://client/src/screens/RoleReveal.jsx)
- [Results.jsx](file://client/src/screens/Results.jsx)
- [GameContext.jsx](file://client/src/context/GameContext.jsx)
- [useSocket.js](file://client/src/hooks/useSocket.js)
</cite>

## Update Summary
**Changes Made**
- Complete theme transformation from dark to light theme across all styling systems
- Updated color palette from dark backgrounds to light backgrounds
- Modified design tokens to support light mode implementation
- Adjusted glass card effects and transparency for light theme
- Updated typography and contrast ratios for improved readability
- Maintained consistent animation and transition patterns while adapting them to light theme

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the styling and design system of the Imposter Game frontend. The application has undergone a complete theme transformation from a dark to light theme, featuring a modern light aesthetic with glass morphism effects, vibrant accent colors, and consistent design tokens. It covers Tailwind CSS configuration, color palette, typography, spacing, responsive behavior, animations, transitions, and build-time optimizations. The design system emphasizes accessibility, brand consistency, and cross-device compatibility across all screens.

## Project Structure
The styling system is organized around a small set of configuration files and global styles, with component-specific styles applied via Tailwind utility classes and custom CSS. The build pipeline uses Vite with PostCSS and Tailwind CSS, now optimized for light theme aesthetics.

```mermaid
graph TB
subgraph "Build Pipeline"
Vite["Vite Config<br/>vite.config.js"]
PostCSS["PostCSS Config<br/>postcss.config.js"]
Tailwind["Tailwind Config<br/>tailwind.config.js"]
end
subgraph "Global Styles"
IndexCSS["Global CSS<br/>src/index.css"]
end
subgraph "Components"
App["App.jsx"]
Screens["Screens<br/>Home.jsx, Lobby.jsx,<br/>RoleReveal.jsx, Results.jsx"]
Context["GameContext.jsx"]
Hooks["useSocket.js"]
end
Vite --> PostCSS --> Tailwind
Vite --> IndexCSS
App --> Screens
App --> Context
Context --> Hooks
Screens --> IndexCSS
```

**Diagram sources**
- [vite.config.js:1-16](file://client/vite.config.js#L1-L16)
- [postcss.config.js:1-2](file://client/postcss.config.js#L1-L2)
- [tailwind.config.js:1-48](file://client/tailwind.config.js#L1-L48)
- [index.css:1-217](file://client/src/index.css#L1-L217)
- [App.jsx:1-101](file://client/src/App.jsx#L1-L101)
- [Home.jsx:1-238](file://client/src/screens/Home.jsx#L1-L238)
- [Lobby.jsx:1-210](file://client/src/screens/Lobby.jsx#L1-L210)
- [RoleReveal.jsx:1-123](file://client/src/screens/RoleReveal.jsx#L1-L123)
- [Results.jsx:1-442](file://client/src/screens/Results.jsx#L1-L442)
- [GameContext.jsx:1-383](file://client/src/context/GameContext.jsx#L1-L383)
- [useSocket.js:1-76](file://client/src/hooks/useSocket.js#L1-L76)

**Section sources**
- [vite.config.js:1-16](file://client/vite.config.js#L1-L16)
- [postcss.config.js:1-2](file://client/postcss.config.js#L1-L2)
- [tailwind.config.js:1-48](file://client/tailwind.config.js#L1-L48)
- [index.css:1-217](file://client/src/index.css#L1-L217)

## Core Components
- Tailwind CSS configuration defines the design tokens and custom animations optimized for light theme.
- PostCSS configuration enables Tailwind and Autoprefixer for modern CSS processing.
- Global CSS establishes base styles, typography, layout, and reusable animations adapted for light backgrounds.
- Components apply Tailwind utilities and custom CSS classes for consistent visuals across the light theme.

Key configuration highlights:
- Content scanning targets templates and JS/JSX files for purging unused styles.
- Color palette extends light backgrounds, accent colors, and vibrant neon hues optimized for light mode.
- Animation and keyframes are defined for pulse rings, fade/slide/scale-ins, glow, and floating effects.
- Global base styles set font stack, light background, and viewport sizing with dynamic viewport units.

**Section sources**
- [tailwind.config.js:1-48](file://client/tailwind.config.js#L1-L48)
- [postcss.config.js:1-2](file://client/postcss.config.js#L1-L2)
- [index.css:1-217](file://client/src/index.css#L1-L217)

## Architecture Overview
The styling architecture follows a layered approach optimized for light theme:
- Build layer: Vite compiles assets with PostCSS and Tailwind.
- Token layer: Tailwind config centralizes design tokens (colors, animations) for light mode.
- Global layer: Base styles and reusable animations live in global CSS with light theme adaptations.
- Component layer: Screens and UI elements compose utilities and custom classes.

```mermaid
graph TB
TailwindCfg["Tailwind Config<br/>Light Colors, Animations"]
PostCSSCfg["PostCSS Config<br/>Plugins"]
ViteCfg["Vite Config<br/>Dev server, proxy"]
GlobalCSS["Global CSS<br/>Base, Typography,<br/>Transitions, Animations"]
Components["Components<br/>App, Screens,<br/>Context, Hooks"]
ViteCfg --> PostCSSCfg --> TailwindCfg
ViteCfg --> GlobalCSS
Components --> GlobalCSS
Components --> TailwindCfg
```

**Diagram sources**
- [tailwind.config.js:1-48](file://client/tailwind.config.js#L1-L48)
- [postcss.config.js:1-2](file://client/postcss.config.js#L1-L2)
- [vite.config.js:1-16](file://client/vite.config.js#L1-L16)
- [index.css:1-217](file://client/src/index.css#L1-L217)
- [App.jsx:1-101](file://client/src/App.jsx#L1-L101)
- [Home.jsx:1-238](file://client/src/screens/Home.jsx#L1-L238)
- [Lobby.jsx:1-210](file://client/src/screens/Lobby.jsx#L1-L210)
- [RoleReveal.jsx:1-123](file://client/src/screens/RoleReveal.jsx#L1-L123)
- [Results.jsx:1-442](file://client/src/screens/Results.jsx#L1-L442)
- [GameContext.jsx:1-383](file://client/src/context/GameContext.jsx#L1-L383)
- [useSocket.js:1-76](file://client/src/hooks/useSocket.js#L1-L76)

## Detailed Component Analysis

### Tailwind CSS Configuration
- Content scanning includes HTML and JS/JSX under src for purging.
- Extended colors:
  - Light palette with multiple shades for backgrounds and overlays optimized for light theme.
  - Accent palette for primary action and highlight states with proper contrast ratios.
  - Neon palette for vibrant accents and glows with light theme compatibility.
- Animation and keyframes:
  - Pulse ring, fade-in, slide-up, scale-in, glow, float.
  - Used across screens for interactive feedback and visual polish with light theme adaptations.

**Section sources**
- [tailwind.config.js:1-48](file://client/tailwind.config.js#L1-L48)

### PostCSS and Build Configuration
- PostCSS loads Tailwind and Autoprefixer plugins for modern CSS processing.
- Vite dev server runs on port 5173 with a proxy to the Socket.IO backend.
- Dependencies include React, Tailwind CSS, PostCSS, and canvas-confetti for animations.

**Section sources**
- [postcss.config.js:1-2](file://client/postcss.config.js#L1-L2)
- [vite.config.js:1-16](file://client/vite.config.js#L1-L16)
- [package.json:1-26](file://client/package.json#L1-L26)

### Global Styles and Typography
- Base reset and box sizing for light theme compatibility.
- Font stack prioritizes Inter and system UI fonts with proper light theme contrast.
- Body and root containers use dynamic viewport units for consistent full-screen layouts on light backgrounds.
- Custom scrollbar styling for subtle contrast against light backgrounds.
- Reusable animations:
  - Screen transitions (enter/exit) with opacity and transform.
  - Countdown ring progress animation.
  - Toast notifications with slide-in/out keyframes.
  - Glass card effect with backdrop blur and borders optimized for light theme.
  - 3D flip card with preserve-3d and backface visibility.
  - Glow effects for red/green/blue themes with proper light theme contrast.
  - Staggered children animation for list reveals.
  - Thinking dots animation for waiting states.
  - Gradient background for game layout with light color scheme.

**Section sources**
- [index.css:1-217](file://client/src/index.css#L1-L217)

### App Shell and Transitions
- App wraps the entire UI with a light gradient background and manages screen transitions.
- Transition classes adjust opacity, translation, and scale during phase changes.
- Connection indicator uses Tailwind classes and animation utilities with light theme colors.

**Section sources**
- [App.jsx:1-101](file://client/src/App.jsx#L1-L101)

### Home Screen
- Floating emoji decorations and background glow orbs for atmospheric light theme.
- Animated entrance for title and cards using fade-in and slide-up.
- Glass card strong containers with hover and focus states optimized for light backgrounds.
- Gradient buttons with shadow and hover effects using light theme color combinations.
- Responsive typography scaling with sm breakpoint for optimal readability.

**Section sources**
- [Home.jsx:1-238](file://client/src/screens/Home.jsx#L1-L238)

### Lobby Screen
- Player avatars with gradient color bands and online/offline indicators using light theme colors.
- Category selection with animated selection states and proper contrast.
- Start button with glow animation and disabled states optimized for light backgrounds.
- Thinking dots animation for non-host players with appropriate light theme styling.
- Copy-to-clipboard flow with toast notifications using light theme styling.

**Section sources**
- [Lobby.jsx:1-210](file://client/src/screens/Lobby.jsx#L1-L210)

### Role Reveal Screen
- Flip card component with 3D transform and staggered reveal timing.
- Dynamic background glow based on role using light theme color combinations.
- Timer overlay and tap-to-reveal prompt with pulse ring animation.

**Section sources**
- [RoleReveal.jsx:1-123](file://client/src/screens/RoleReveal.jsx#L1-L123)

### Results Screen
- Staggered vote reveal with timed reveals and smooth transitions.
- Canvas-confetti integration for celebratory and dramatic moments using light theme colors.
- Final results screen with leaderboard and winner highlighting using light theme styling.
- Imposter guess submission flow with validation and feedback using light theme colors.

**Section sources**
- [Results.jsx:1-442](file://client/src/screens/Results.jsx#L1-L442)

### Game Context and Notifications
- Toast management with enter/exit animations and automatic dismissal using light theme styling.
- Error and warning toasts styled with accent and warning palettes optimized for light backgrounds.

**Section sources**
- [GameContext.jsx:1-383](file://client/src/context/GameContext.jsx#L1-L383)

### Socket Hook and Connectivity
- Connection status drives UI states (disabled controls, warnings) with light theme adaptations.
- Reconnection handling ensures continuity across network changes with proper light theme styling.

**Section sources**
- [useSocket.js:1-76](file://client/src/hooks/useSocket.js#L1-L76)

## Dependency Analysis
The styling system depends on Tailwind utilities and global CSS. Components rely on:
- Tailwind utilities for layout, colors, shadows, and transforms optimized for light theme.
- Global CSS for reusable animations and base styles adapted for light backgrounds.
- Custom animations defined in Tailwind config and global CSS with light theme considerations.

```mermaid
graph LR
Tailwind["Tailwind Utilities"]
GlobalCSS["Global CSS"]
Home["Home.jsx"]
Lobby["Lobby.jsx"]
RoleReveal["RoleReveal.jsx"]
Results["Results.jsx"]
App["App.jsx"]
Context["GameContext.jsx"]
Home --> Tailwind
Home --> GlobalCSS
Lobby --> Tailwind
Lobby --> GlobalCSS
RoleReveal --> Tailwind
RoleReveal --> GlobalCSS
Results --> Tailwind
Results --> GlobalCSS
App --> Tailwind
App --> GlobalCSS
Context --> GlobalCSS
```

**Diagram sources**
- [Home.jsx:1-238](file://client/src/screens/Home.jsx#L1-L238)
- [Lobby.jsx:1-210](file://client/src/screens/Lobby.jsx#L1-L210)
- [RoleReveal.jsx:1-123](file://client/src/screens/RoleReveal.jsx#L1-L123)
- [Results.jsx:1-442](file://client/src/screens/Results.jsx#L1-L442)
- [App.jsx:1-101](file://client/src/App.jsx#L1-L101)
- [index.css:1-217](file://client/src/index.css#L1-L217)
- [tailwind.config.js:1-48](file://client/tailwind.config.js#L1-L48)

**Section sources**
- [Home.jsx:1-238](file://client/src/screens/Home.jsx#L1-L238)
- [Lobby.jsx:1-210](file://client/src/screens/Lobby.jsx#L1-L210)
- [RoleReveal.jsx:1-123](file://client/src/screens/RoleReveal.jsx#L1-L123)
- [Results.jsx:1-442](file://client/src/screens/Results.jsx#L1-L442)
- [App.jsx:1-101](file://client/src/App.jsx#L1-L101)
- [index.css:1-217](file://client/src/index.css#L1-L217)
- [tailwind.config.js:1-48](file://client/tailwind.config.js#L1-L48)

## Performance Considerations
- Purge unused CSS: Tailwind scans src/**/*.{js,jsx} and index.html to remove unreachable styles.
- Minimize repaints: Prefer transform and opacity for animations; avoid layout-affecting properties.
- Reduce blur complexity: Glass card blur is applied selectively; consider reducing blur radius on lower-powered devices.
- Limit confetti: Canvas-confetti is triggered conditionally; ensure timers clean up to prevent repeated heavy frames.
- Font rendering: Inter is prioritized; ensure efficient font loading and consider font-display strategies if needed.
- Viewport units: Using dvh prevents layout shifts on mobile browsers.
- Light theme optimization: Reduced shadow complexity and lighter backgrounds improve performance on mobile devices.

## Troubleshooting Guide
- Animations not playing:
  - Verify Tailwind animation utilities are present and keyframes are defined.
  - Confirm global CSS animations are loaded and not overridden by component styles.
- Confetti not firing:
  - Ensure canvas-confetti is imported and effects are triggered after DOM updates.
  - Check that confetti flags reset on new round results.
- Toasts not appearing/disappearing:
  - Confirm toasts array is managed in context and exit transitions are applied.
  - Ensure backdrop-filter is supported on target devices with light theme styling.
- Mobile layout issues:
  - Use dynamic viewport units (dvh) and test on multiple device sizes.
  - Prefer container queries or responsive utilities for complex layouts.
- Light theme contrast issues:
  - Verify text colors maintain sufficient contrast ratios against light backgrounds.
  - Check that glass card effects use appropriate transparency values.

**Section sources**
- [Results.jsx:55-98](file://client/src/screens/Results.jsx#L55-L98)
- [GameContext.jsx:40-51](file://client/src/context/GameContext.jsx#L40-L51)
- [index.css:81-109](file://client/src/index.css#L81-L109)

## Conclusion
The Imposter Game frontend employs a modern, light-themed styling system built on Tailwind CSS and PostCSS. The design system emphasizes a clean, accessible light palette with vibrant accent colors, consistent glass morphism effects, and expressive micro-interactions. Animations and transitions reinforce gameplay phases while maintaining excellent readability and contrast on light backgrounds. The build pipeline is optimized for rapid iteration and clean production bundles with light theme optimizations.

## Appendices

### Design Tokens and Theming
- Color palette
  - Light backgrounds: soft grays (#f5f5f5, #fafafa) for clean, modern UI.
  - Accent: bright red/pink (#e94560, #ff6b81) for primary actions and highlights with proper contrast.
  - Neon: green, blue, purple, and pink for secondary accents and glows optimized for light backgrounds.
- Typography
  - Inter as the primary font family for crisp readability on light backgrounds.
  - System UI fallbacks for broader compatibility.
- Spacing and layout
  - Consistent padding and margins using Tailwind spacing scale.
  - Full-screen layout with dynamic viewport units for mobile-first responsiveness.
- Responsive breakpoints
  - Uses Tailwind's default breakpoints; sm is leveraged for larger text and spacing adjustments.
- Accessibility
  - Sufficient contrast ratios with light backgrounds and proper color combinations.
  - Focus-visible outlines via focus utilities; ensure custom focus states remain visible.
  - Semantic HTML and ARIA attributes where appropriate in components.
- Light mode support
  - The design is fully optimized for light mode with proper contrast ratios and readability.
  - Color tokens are tuned for high-contrast environments with light backgrounds.
- Brand consistency
  - Vibrant accent colors and glass card styles unify the visual identity across screens.
  - Consistent animation patterns (fade/slide/scale) reinforce brand personality on light backgrounds.

**Section sources**
- [tailwind.config.js:5-9](file://client/tailwind.config.js#L5-L9)
- [index.css:12-19](file://client/src/index.css#L12-L19)
- [Home.jsx:67-82](file://client/src/screens/Home.jsx#L67-L82)
- [Lobby.jsx:182-196](file://client/src/screens/Lobby.jsx#L182-L196)
- [Results.jsx:182-189](file://client/src/screens/Results.jsx#L182-L189)

### Animation and Transition Reference
- Built-in Tailwind animations: pulse-ring, fade-in, slide-up, scale-in, glow, float.
- Custom keyframes: countdown ring, toast slide-in/out, staggered children, thinking dots.
- Component-specific animations: flip card, screen transitions, connection indicator pulse.

**Section sources**
- [tailwind.config.js:10-43](file://client/tailwind.config.js#L10-L43)
- [index.css:70-217](file://client/src/index.css#L70-L217)
- [App.jsx:89-97](file://client/src/App.jsx#L89-L97)
- [Lobby.jsx:199-206](file://client/src/screens/Lobby.jsx#L199-L206)
- [RoleReveal.jsx:40-56](file://client/src/screens/RoleReveal.jsx#L40-L56)