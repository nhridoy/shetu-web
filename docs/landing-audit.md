# Terra landing page audit

Scope: `terra-web` only. The later user instruction to use the existing Astro scaffold supersedes the original Next.js request. The abandoned attempt remains in Git stash. `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, and `tsconfig.json` match their original tracked versions.

## Em-dash audit

Pass. Zero U+2014 em-dashes or U+2013 en-dashes in authored source, public text assets, documents, and rendered page text. Generated dependency files, binary image data, and the preserved Git stash are outside the authored-page audit.

## Pre-Flight Check: Section 14

Each conditional item is marked Pass when its triggering pattern is intentionally absent, with that reason stated explicitly.

| Item                                   | Result | Justification                                                                                                                                   |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Brief inference                     | Pass   | The approved read targets developers, DevOps professionals, and tech leads with restrained technical minimalism.                                |
| 2. Dial values                         | Pass   | DESIGN_VARIANCE 6, MOTION_INTENSITY 3, VISUAL_DENSITY 3 are explicit and justified in DESIGN.md.                                                |
| 3. Design system                       | Pass   | Native CSS and Tailwind v4 are labeled honestly; Geist and Phosphor use the installed packages.                                                 |
| 4. Redesign mode                       | Pass   | The inspected incumbent was an Astro demonstration scaffold; the requested product landing replaces it while retaining Astro.                   |
| 5. Zero em-dashes and en-dashes        | Pass   | Source, page text, metadata, alt text, and task-authored documents contain no U+2014 or U+2013.                                                 |
| 6. Page Theme Lock                     | Pass   | Every section uses the approved dark theme, including when the OS requests light mode.                                                          |
| 7. Color Consistency Lock              | Pass   | One muted emerald accent family is used throughout against graphite surfaces.                                                                   |
| 8. Shape Consistency Lock              | Pass   | Panels use 12px, primary controls 8px, and compact demo controls 6px, documented as one scale.                                                  |
| 9. Button contrast                     | Pass   | Primary CTA contrast is 10.31:1; neutral CTA text is 16.01:1 on the page background.                                                            |
| 10. CTA button wrap                    | Pass   | Button labels use white-space: nowrap and fit the tested desktop and mobile widths.                                                             |
| 11. Form contrast                      | Pass   | Inputs and placeholders use the shared high-contrast text tokens; muted text is at least 6.77:1 on tested surfaces.                             |
| 12. Serif discipline                   | Pass   | No serif typography is used.                                                                                                                    |
| 13. Premium-consumer palette           | Pass   | Not applicable to this developer product; the page uses charcoal and mint.                                                                      |
| 14. Italic descender clearance         | Pass   | No italic display text is used.                                                                                                                 |
| 15. Hero fits viewport                 | Pass   | Measured headline is two lines; subtext is 19 words and three or four lines; both actions are visible without scrolling.                        |
| 16. Hero top padding                   | Pass   | Desktop hero padding is 64px, below the 96px cap.                                                                                               |
| 17. Hero stack discipline              | Pass   | Only headline, subtext, and one action group appear in the hero.                                                                                |
| 18. Eyebrow count                      | Pass   | Zero section eyebrows across nine sections; the allowed maximum is three.                                                                       |
| 19. Split-header ban                   | Pass   | Section introductions stack headings and explanations vertically; FAQ pairs its introduction with actual disclosures.                           |
| 20. Zigzag alternation cap             | Pass   | There is no alternating sequence of image and text splits.                                                                                      |
| 21. No duplicate CTA intent            | Pass   | Repeated actions retain consistent labels: Get Terra, Self-host Terra, and View source.                                                         |
| 22. Logo wall is logo only             | Pass   | No customer logo wall is fabricated; the separate desktop ribbon identifies supported platforms.                                                |
| 23. Bento background diversity         | Pass   | The mosaic combines a generated photograph, a green host panel, and a graphite keyboard panel.                                                  |
| 24. Trusted-by logo wall placement     | Pass   | No unverifiable trusted-by claim or customer logo wall is included.                                                                             |
| 25. Copy self-audit                    | Pass   | Visible text is plain and reviewed; cloud prices, testimonials, and benchmarks are not invented.                                                |
| 26. Motivated motion                   | Pass   | Hover and active feedback acknowledge interaction; terminal scrolling instantly reveals newly produced results.                                 |
| 27. Marquee maximum                    | Pass   | There are no marquees.                                                                                                                          |
| 28. Single-line navigation             | Pass   | Desktop navigation remains on one line in a 72px header; mobile uses a 64px disclosure header.                                                  |
| 29. Section layout repetition          | Pass   | Nine sections use nine distinct compositions, listed below.                                                                                     |
| 30. Bento rhythm and cell count        | Pass   | Exactly three content items occupy three cells: one tall media panel plus two compact panels.                                                   |
| 31. Long lists use suitable components | Pass   | The longest grouped list is the five-item FAQ, implemented with native disclosures.                                                             |
| 32. Real images                        | Pass   | Two original generated hardware images are shipped as local WebP files; the terminal is a functioning labeled browser demo.                     |
| 33. No labels over images              | Pass   | Both photographic assets are unobstructed by tags or floating labels.                                                                           |
| 34. No decorative photo credits        | Pass   | No invented photographer names or decorative captions are present.                                                                              |
| 35. No version footers                 | Pass   | The footer contains product and source information, not version strings.                                                                        |
| 36. No micro-meta-sentences            | Pass   | No eyebrow or self-referential design commentary appears on the page.                                                                           |
| 37. No decorative hero-bottom strip    | Pass   | The hero ends with its visual; the next section communicates actual desktop platform compatibility.                                             |
| 38. No floating heading subtext        | Pass   | Supporting copy is aligned beneath its relevant heading.                                                                                        |
| 39. No scoring bars                    | Pass   | No comparison progress bars or pseudo-metrics are used.                                                                                         |
| 40. No locale or weather strips        | Pass   | No atmospheric locale, time, or weather data is included.                                                                                       |
| 41. No scroll cues                     | Pass   | There is no generic scroll cue; Explore workspace is a functional link to a named section.                                                      |
| 42. No hero version labels             | Pass   | No beta, version, or launch-status label appears in the hero.                                                                                   |
| 43. No section-number eyebrows         | Pass   | Sections have descriptive headings and no display numbering.                                                                                    |
| 44. No decorative dots                 | Pass   | No decorative status-dot UI appears; tiny light details belong to the generated hardware image.                                                 |
| 45. No doubled row borders             | Pass   | FAQ rows have one bottom separator; no long spec table has doubled row borders.                                                                 |
| 46. Sane content density               | Pass   | Section descriptions are concise; longer FAQ answers are hidden behind disclosures for readers seeking detail.                                  |
| 47. Quote discipline                   | Pass   | No testimonials or quotation blocks are fabricated.                                                                                             |
| 48. Motion claimed equals shown        | Pass   | Dial 3 promises only restrained interaction feedback, which the CSS implements.                                                                 |
| 49. GSAP skeletons                     | Pass   | Not applicable: no pinned stacks, horizontal pans, or GSAP are used.                                                                            |
| 50. No window scroll listeners         | Pass   | There are no window scroll listeners or scroll-driven React state updates.                                                                      |
| 51. Reduced motion                     | Pass   | Transform transitions are gated by prefers-reduced-motion: no-preference; tested with reduced motion enabled.                                   |
| 52. Dark-mode tokens and testing       | Pass   | Explicit dark tokens are tested under both light and dark system preferences; the approved theme stays locked.                                  |
| 53. Mobile collapse                    | Pass   | Every multi-column section has an explicit single-column rule below 768px; widths 320 and 390 pass overflow checks.                             |
| 54. Viewport stability                 | Pass   | No h-screen sizing is used; the content-height hero and image aspect ratios reserve stable space.                                               |
| 55. Effect cleanup                     | Pass   | No animation effects create timers or listeners; the terminal effect performs a single local scroll write with nothing to clean up.             |
| 56. Empty, loading, and error states   | Pass   | Search has an empty result, clear has an empty log, unsupported commands have recovery text, and static content avoids invented network states. |
| 57. Cards omitted where possible       | Pass   | Only the feature mosaic and interactive plan use panels; principles, deployment, FAQ, and footer rely on spacing and separators.                |
| 58. Icon library                       | Pass   | All interface icons come from Phosphor; the favicon is an allowed simple typographic mark.                                                      |
| 59. Motion isolation                   | Pass   | No React motion library is used; stateful UI lives in separate Astro React islands and CSS handles feedback.                                    |
| 60. No AI tells                        | Pass   | No purple glows, generic testimonials, equal feature-card row, gradient headlines, or fabricated metrics are present.                           |
| 61. Core Web Vitals plausibility       | Pass   | Lighthouse is run on the production build; measured LCP, CLS, and blocking time are recorded below, with field INP explicitly unclaimed.        |
| 62. One design system                  | Pass   | One native CSS and Tailwind visual system spans the page; unused scaffold primitives do not introduce another rendered theme.                   |

## Section-Layout-Repetition audit

| Section                           | Layout family                                        |
| --------------------------------- | ---------------------------------------------------- |
| Your servers. Your rules.         | Asymmetric split hero                                |
| Desktop compatibility             | Horizontal compatibility ribbon                      |
| Less switching. More shipping.    | Full-width interactive workspace stage               |
| Everything within reach           | Asymmetric feature mosaic                            |
| Your credentials. Only yours.     | Centered connection flow with open principle columns |
| Choose where Terra lives          | Side-by-side deployment comparison                   |
| Start your way                    | Tabbed plan selector                                 |
| Good questions. Straight answers. | Offset native disclosures                            |
| Make yourself at home             | Typographic closing invitation                       |

Pass. Nine sections, nine distinct compositions. No repeated zigzag sequence. Header and footer are not counted as content sections.

## Hero discipline audit

| Viewport   | Headline lines | Subtext words | Subtext lines | CTA bottom | Visible without scroll |
| ---------- | -------------- | ------------- | ------------- | ---------- | ---------------------- |
| 1440 x 900 | 2              | 19            | 3             | 541px      | Pass                   |
| 1024 x 768 | 2              | 19            | 3             | 480px      | Pass                   |
| 390 x 844  | 2              | 19            | 3             | 377px      | Pass                   |
| 320 x 740  | 2              | 19            | 4             | 402px      | Pass                   |

Pass. Three hero text groups, no eyebrow, two actions, desktop top padding 64px. Asset dimensions and font scale are planned together.

## Functional verification

- Astro production build passes and emits one static page.
- Biome check passes without warnings or errors.
- Browser checks pass at 320, 390, 1024, and 1440px widths with no horizontal overflow, broken local anchors, unloaded images, or console errors.
- Host selection, host-search empty state, supported commands, unknown commands including `__proto__`, clear, plan selection, arrow-key tab navigation, FAQ disclosures, and mobile navigation all pass.
- New terminal output is revealed immediately. Regression evidence: before the fix it was 339px below the visible area; after the fix the distance is 0px.
- Both system color preferences retain the approved dark theme; reduced motion is honored.
- Reviewer disposition: ship for both identified fixes, terminal output scrolling and mobile menu label matching. This verdict is scoped to those reviewed fixes.
- Screenshots and machine-readable checks are in `.impeccable/review/`.

## Product and delivery limits

The interactive terminal uses local sample data and never opens SSH connections. Cloud signup URLs and prices were not supplied; cloud actions point to project discussions. Source and setup links retain the repository URL from the original scaffold. No deployment or external publication was performed.

The Impeccable context launcher was unavailable, so the supplied brief and project files were read directly. No successful detector execution is claimed. Imagery and exact prompts are documented in `docs/asset-provenance.md`.

## Final performance audit

| Lighthouse category | Score   |
| ------------------- | ------- |
| Performance         | 92/100  |
| Accessibility       | 100/100 |
| Best Practices      | 100/100 |
| Seo                 | 100/100 |

Measured on the final production build using mobile simulation: LCP 1.8 seconds, CLS 0.001, total blocking time 340ms. The mobile menu accessible-name check passes. The first run scored 100 for performance; the final run scored 92, which is the score reported here. Local run-to-run timing varies.

A separate interaction probe under 4x CPU slowdown exercised typing, command submission, plan tabs, and FAQ disclosure. Maximum observed interaction-event duration was 72ms. This supports the responsiveness target but is not a field INP measurement. No real-user Core Web Vitals claim is made.

Machine-readable final summary: `.impeccable/review/performance-summary.json`.
