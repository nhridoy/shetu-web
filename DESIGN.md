---

name: Terra
description: An open-source home for your servers, owned by the people using it.
colors:
surface: "#111615"
raised: "#191f1d"
ink: "#edf1ed"
muted: "#a7b2ac"
mint: "#a8dbbd"
mint-ink: "#15251b"
line: "#35413a"
mint-hover: "#bce8cd"
outline: "#607168"
search-border: "#56625b"
host-selected: "#26372d"
host-selected-border: "#425b4c"
host-hover: "#24312a"
feature-transfer: "#1c2420"
feature-hosts: "#1c2b23"
feature-shortcuts: "#202724"
typography:
display:
fontFamily: '"Geist Variable", sans-serif'
fontSize: "clamp(46px, 5.4vw, 72px)"
fontWeight: 500
lineHeight: 1.07
letterSpacing: "-0.04em"
headline:
fontFamily: '"Geist Variable", sans-serif'
fontSize: "clamp(34px, 4vw, 49px)"
fontWeight: 500
lineHeight: 1.12
letterSpacing: "-0.04em"
title:
fontFamily: '"Geist Variable", sans-serif'
fontSize: "26px"
fontWeight: 500
lineHeight: 1.25
letterSpacing: "-0.03em"
body:
fontFamily: '"Geist Variable", sans-serif'
fontSize: "16px"
lineHeight: 1.7
label:
fontFamily: '"Geist Variable", sans-serif'
fontSize: "14px"
fontWeight: 550
terminal:
fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
fontSize: "12px"
lineHeight: 1.8
rounded:
panel: "12px"
control: "8px"
compact: "6px"
spacing:
section: "104px"
section-mobile: "66px"
heading-gap: "46px"
heading-gap-mobile: "30px"
mosaic-gap: "18px"
components:
button-primary:
backgroundColor: "{colors.mint}"
textColor: "{colors.mint-ink}"
typography: "{typography.label}"
rounded: "{rounded.control}"
padding: "0 22px"
button-primary-hover:
backgroundColor: "{colors.mint-hover}"
button-outline:
backgroundColor: "transparent"
textColor: "{colors.ink}"
typography: "{typography.label}"
rounded: "{rounded.control}"
padding: "0 22px"
button-outline-hover:
backgroundColor: "{colors.raised}"
host-search:
backgroundColor: "transparent"
textColor: "{colors.ink}"
rounded: "{rounded.compact}"
padding: "0 10px"
host-selected:
backgroundColor: "{colors.host-selected}"
textColor: "{colors.mint}"
rounded: "{rounded.compact}"
padding: "11px 12px"
feature-hosts:
backgroundColor: "{colors.feature-hosts}"
rounded: "{rounded.panel}"
padding: "32px 34px"
---

# Design System: Terra

## Overview

**Creative North Star: "An open-source home for your servers"**

Graphite hardware and a quiet developer workspace express ownership and everyday usefulness. The locked charcoal theme, restrained mint accent, generous spacing, and original hardware still lifes support a modern, minimalist, professional interface. The system uses native CSS with Tailwind v4 in the installed Astro scaffold, with React islands for the workspace demo and plan selector.

The user approved the design read and dials before asking to build, then explicitly retained Astro and the installed packages. This document records that implemented direction; it does not reopen a direction choice. Impeccable context could not start because its engine was unavailable. Project files and the provided brief are the authority; no detector result, seed approval, or comp approval is claimed. Tokens are extracted from `src/styles/global.css` and describe the implemented landing page.

**Key Characteristics:**

- DESIGN_VARIANCE 6: asymmetric composition with clear reading order.
- MOTION_INTENSITY 3: hover and active feedback, no automatic motion.
- VISUAL_DENSITY 3: short copy and generous space, with useful density inside the demo.
- Single locked dark theme, including when the operating system prefers light.

Scope remains the Terra landing page. Its persuasion action is Get Terra, with conversion destinations at the source repository and self-hosting instructions. Cloud interest routes to discussions until a real signup destination is supplied. The local browser demo never opens SSH connections or handles credentials.

## Colors

A charcoal neutral foundation carries one pale mint accent family. Frontmatter retains the exact source values; local surface variations remain in the same dark green-charcoal family.

### Primary

- **Mint** marks primary actions, selected controls, focus, the hero emphasis, and Phosphor icons.
- **Mint ink** provides dark text on mint actions and selections.
- **Mint hover** brightens primary actions on hover.

### Neutral

- **Surface** is the page canvas; **raised** is the plan panel and secondary action hover.
- **Ink** is primary content; **muted** is supporting text and inactive navigation.
- **Line** separates groups. Stronger outline and search borders clarify controls.
- Feature surfaces and selected host surfaces are tonal variations, not alternate themes.

Text selection, caret, scrollbar, focus rings, and disabled controls use the page palette. Do not flip tokens between sections.

## Typography

Display and body use self-hosted Geist Variable with a sans-serif fallback. Terminal output uses SFMono-Regular, Consolas, Liberation Mono, and monospace; the command input uses SFMono-Regular, Consolas, and monospace. Phosphor icons use regular weight.

The frontmatter describes the hero display, standard section headline, base title, section introduction body, button label, and terminal output. Body is a section-introduction role, not a universal paragraph size: hero copy is 17px with 1.65 line height and 425px maximum width; section introductions are 16px with 510px maximum width. Feature descriptions are 14px. Display tracking stops at -0.04em.

At mobile width the hero uses `clamp(44px, 9.3vw, 64px)`, standard section headlines use 35px, and hero copy uses 15px. Preserve explicit hierarchy and balanced headline wrapping; use monospace only for terminal content.

## Layout

The centered shell is `min(1200px, calc(100% - 96px))`. Its total horizontal gutter becomes 64px at widths up to 1100px, 40px at widths up to 767px, and 32px at widths up to 360px. Standard section padding is 104px per edge, reduced to 66px on mobile, with deliberate section-specific exceptions.

The first viewport pairs a left-aligned two-line headline, short definition, primary and secondary actions with a server still life at right. The hero grid uses 0.93fr / 1.07fr columns. Nine section families build the story: asymmetric hero, compatibility ribbon, interactive stage, feature mosaic, security flow and principles, deployment comparison, tabbed plan selector, offset disclosures, and typographic closing invitation.

At widths up to 767px the main multi-column compositions collapse; small supporting arrangements such as demo footnotes remain compact grids. The header shrinks from 72px to 64px and exposes a native disclosure menu. Workspace hosts become a wrapping horizontal group above the terminal. At widths from 1440px the hero minimum height rises to 600px.

## Elevation & Depth

Depth comes from tonal layering, borders, and the graphite imagery. The stylesheet adds no box shadows. Sticky navigation is opaque. Layers are content 0, sticky navigation 10, mobile navigation 20, and skip link 30. Preserve these purposeful layer assignments.

## Shapes

Panels, hero media, and feature containers use 12px corners. Buttons use 8px corners. Compact demo controls, including host search and host rows, use 6px corners. Plan panels round only the lower corners. Dividers and selected-state borders provide structure without ornamental containers. Hardware images are clipped and cropped within their containers; they contain no decorative text overlays.

## Components

### Buttons

Primary actions are mint with mint-ink text, 8px corners, 48px minimum height, `0 22px` padding, and a 13px icon gap. Primary hover uses mint-hover. Outline actions use a 1px outline border, ink text, transparent fill, and raised fill on hover. Small header buttons use 38px minimum height, `0 15px` padding, and 13px text; on mobile they use 40px minimum height and 12px horizontal padding.

Focus-visible uses a 2px mint outline with 5px offset. With no reduced-motion preference, buttons and host rows transition background and transform over 160ms with ease, and press to scale 0.98. Text-link arrows move 3px on hover in that same motion mode. Reduced-motion users receive no animated transforms.

### Inputs and host rows

Host search uses a 6px bordered wrapper with `0 10px` padding. Its transparent input has 38px height and 12px text. Selected host rows use a dark green fill and border with mint icon treatment; hover uses host-hover. Rows retain ink names and muted supporting details. The command field uses a bottom border, 43px input height, and a mint submit control with a 44px minimum target. Disabled submission is visibly muted.

### Navigation

Desktop navigation uses muted 13px links, 44px minimum link height, and ink hover. Mobile navigation uses native details/summary. Its links close the menu, and Escape closes it and returns focus to its summary. The skip link appears on focus.

### Feature containers

The asymmetric mosaic has an 18px gap and three related tonal surfaces. The transfer panel spans two rows on desktop, while host and shortcut panels use compact icon and copy columns with `32px 34px` padding. Mobile panels stack with a 14px gap.

### Workspace and plan selector

The interactive workspace is explicitly labeled as a local demo. Its desktop sidebar is 242px wide; output scrolls in a bounded terminal pane. Keep the simulated workflow distinct from a real connection or credential form. Plan tabs use an underlined mint selected state above a raised panel. Do not invent cloud prices or signup destinations.

### Disclosures

FAQ uses native details/summary and remains usable without JavaScript. Keep meaningful headings, keyboard focus, and expanded states available to assistive technology.

## Do's and Don'ts

- **Do** preserve the approved 6/3/3 dials, locked dark theme, and self-hosted Geist.
- **Do** keep ownership, everyday workflow, transfers, encryption, deployment, plans, questions, and source in a clear reading order.
- **Do** preserve the installed Astro/React scaffold and use pnpm.
- **Do** use actual product evidence and explicitly labeled local demo behavior.
- **Don't** introduce automatic motion, alternating themes, or decorative text inside images.
- **Don't** invent customers, testimonials, benchmarks, prices, or commercial destinations.
- **Don't** use U+2013 or U+2014 punctuation.
