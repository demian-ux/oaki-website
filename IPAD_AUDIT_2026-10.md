# iPad Pro 12.9 (M1) audit, 2026-10-26

Scope: how the site behaves on an iPad Pro 12.9 (1024 x 1366 portrait, 1366 x 1024 landscape, DPR 2, Safari, touch). Audited on branch `cases/magazine-v4` against the running dev server, emulating both viewports. Touch input and Safari behavior could not be emulated here; those items are marked **device**.

## Contract for the fix

Every iPad change is isolated behind the input type, never the width:

- CSS: new rules only inside `@media (pointer: coarse)` blocks (optionally combined with width). Existing rules are never edited; an override is added next to them.
- Tailwind: a `touch:` variant that compiles to the same query. `touch:` classes are added beside the existing `lg:` ones, nothing removed.
- JS: behavior changes gated by `matchMedia("(pointer: coarse)")`; when false the current code path runs unchanged.
- Verification before each commit: desktop screenshots at 1280, 1440 and 1920 compared pixel for pixel with the current build. The diff must contain no change outside a `pointer: coarse` block or a `matchMedia` gate.

Desktop with a mouse reports `pointer: fine`, so none of it applies there. iPad with the Magic Keyboard still reports `pointer: coarse` (primary input is touch) so it stays in the tier; confirm on the device.

## Findings

### Confirmed in the emulated viewports

1. **No layout breakage at either orientation.** Home, case studies index, a case study (ny-penthouse), journal, process, contact (with the booking picker open) and selected-works all render without horizontal overflow at 1024 and 1366. The desktop header fits at 1024 (nav ends at 981 px of 1009).

2. **Hero shelf is small in portrait.** `HeroShelf` is `100svh` tall (1366 px). Cards are `min(clamp(200px, 20vw, 460px), 38svh)` = 205 px wide, so the shelf occupies roughly 300 px of a 1366 px viewport with large empty bands above and below. Landscape is fine. File: `src/components/home/HeroShelf.module.css`.

3. **Manifesto section is 1634 px tall in portrait** for one paragraph (`py-[calc(50vh+4rem)]` in `src/app/(site)/page.tsx`). The padding is intentional on desktop (the code comment says not to trade it down). In portrait it is more than a full screen of white. Design decision for Demi: keep as is, or a `touch:` override that reduces it only on tablets.

4. **Tap targets under 44 px.** Header nav links are 26 px tall, the email copy control 18 px, "View the Library" 19 px, the booking picker month arrows 15 x 32. Day cells (72 x 64) and time slots are fine. Fix: extra hit area via padding and negative margin under `pointer: coarse`, no visual change.

5. **Mega menu opens on hover only.** `Header.tsx` opens it with `onMouseEnter` and closes with `onMouseLeave`; the `.mega-backdrop` has no click handler. On iOS a first tap on "Case Studies" fires the synthetic hover (opens the panel) and may suppress the navigation; there is no tap-outside close. **Device** to confirm the exact behavior. Fix: under `pointer: coarse`, tap toggles the panel, tap on the backdrop closes it, the link itself navigates on a second tap or via an explicit "All case studies" row.

6. **Desktop-only warmup runs on iPad.** `WarmupAssets.tsx` gates on `(min-width: 1024px)`: every lazy image is promoted to eager and sections get `will-change: transform`. Both fire on iPad in both orientations. Fix: add `and (pointer: fine)` to both gates.

7. **Image variants are oversized for the iPad.** Sanity images use `sizes="100vw"` (22 occurrences). At 1366 CSS px and DPR 2 the browser asks for 2732 px and Next serves the 3840 px variant from its default `deviceSizes`. Changing `deviceSizes` would also change Mac Retina, so it is out. Option: a `(pointer: coarse)` clause in `sizes` that caps the request (for example 960 px, which maps to the 1920 variant at DPR 2). Visual quality to be checked on the device before adopting.

8. **Case study magazine layout at 1024.** The 4-column grid (`23fr 40fr 7fr 16.5fr`) applies from 821 px, giving a text column of about 400 px at 1024. Readable; no change needed unless Demi wants a wider measure. The large white gaps seen in the preview are the `.reveal` elements not animating in the preview pane, not a layout problem. **Device** to confirm reveals fire on scroll.

### Already correct

- Hover styles are behind `@media (hover: hover)` and Tailwind v4 `hover:` is hover-gated. Nothing sticks on tap.
- Every autoplay video has `autoPlay muted playsInline loop` (case study components, hero). The sound film in `CaseFilmScreen` is tap to play, with `playsInline`.
- Heights use `svh`, viewport has `viewport-fit: cover`, safe-area insets are applied to the page gutters.
- `HeroShelf` uses pointer events with `touch-action: pan-y`, so horizontal drag and vertical scroll should coexist. **Device** to confirm.
- Lenis 1.3 leaves touch scrolling native by default (`syncTouch` off). No change.
- `ServicesDeck` (pinned + snap) is currently commented out on the home page, so there is no pin-on-touch issue today. If it comes back, gate the pin and the snap to `pointer: fine`.

### Side finding (out of scope)

- `/about` returns 404 (`ABOUT_HIDDEN` in `src/app/(site)/about/page.tsx`) while the home "About the studio" button links to it.

## Device checklist (Demi, on the iPad)

1. Header: tap "Case Studies". Does the mega open? Does a second tap navigate? Does tapping outside close it?
2. Hero: swipe the shelf horizontally; scroll the page vertically starting on a card.
3. Scroll feel on the home: any jitter in the fixed header when the Safari bar collapses or expands.
4. Case study: images reveal as you scroll; videos play inline without going fullscreen.
5. Journal slider: swipe between cards.
6. Contact: open the picker, tap a day, tap a time, use the month arrows.
7. Rotate the iPad mid-page on the home and on a case study.
8. With the Magic Keyboard: hover a case card and a nav link with the trackpad.

A short screen recording of 1 to 4 is enough to decide the open items.

## Proposed order of work

1. Tailwind `touch:` variant + the WarmupAssets gate (zero visual risk).
2. Tap targets (header, email, picker arrows).
3. Mega menu tap behavior.
4. Hero shelf size and manifesto padding in portrait (needs Demi's call).
5. Image `sizes` cap (needs a visual check on the device).

## Implemented, 2026-10-26 (uncommitted on `cases/magazine-v4`)

Everything below is behind `(pointer: coarse)` (CSS), the `touch:` / `tablet:` Tailwind variants (`globals.css`, `@custom-variant`), or `useCoarsePointer()` / a `pointer: fine` `matchMedia` clause (JS). Desktop screenshots at 1280, 1440 and 1920 of the home, case studies index, ny-penthouse, contact and journal were compared pixel for pixel before and after: identical (the only differing pixels are the Next dev indicator, which also differs between two runs of the baseline).

| Finding | Change | Where |
|---|---|---|
| 6, warmup on iPad | both gates are now `(min-width: 1024px) and (pointer: fine)` | `WarmupAssets.tsx` |
| 4, tap targets | 44 px hit area via `::before` on the header nav links and the email copy, and on "View the Library"; booking month arrows get `tablet:p-3 tablet:-m-3`; INFO / CONTACT and the hero nav links get 12 px padding cancelled by margin | `globals.css` (tablet tier block), `BookingPicker.tsx`, `HeroShelf.module.css` |
| 5, mega menu hover-only | on a coarse pointer the hover handlers are not attached; first tap on Case Studies opens the panel, second tap navigates, tap on the backdrop closes | `Header.tsx`, `useCoarsePointer.ts` |
| 2, small hero in portrait | covers are `min(30vw, 460px)` instead of 20vw in coarse + portrait from 768 px (three covers across a 1024 viewport); `coverSizes` carries the same clause | `HeroShelf.module.css`, `HeroShelf.tsx` |
| 7, 3840 px images | every `sizes="100vw"` becomes `"(pointer: coarse) and (min-width: 768px) 1024px, 100vw"` through `SanityImg` and `JournalPicture`, so the iPad picks the 2560 export (1.9x landscape, 2.5x portrait). Desktop requests are unchanged | `lib/image-sizes.ts`, `SanityImg.tsx`, `JournalPicture.tsx` |

Verified with headless Chrome forced to a coarse pointer (`--blink-settings=primaryPointerType=2,availablePointerTypes=2,primaryHoverType=1,availableHoverTypes=1`) at 1024 x 1366 and 1366 x 1024.

Still open:

- Finding 3, the manifesto's `py-[calc(50vh+4rem)]` in portrait: left as is, Demi decides on the device.
- The device checklist above (mega tap, hero swipe, Safari bar, reveals, picker) on the real iPad: `http://192.168.1.15:3001` on the studio wifi while the dev server runs.

### Device round 1 (Demi, iPad Pro, 2026-10-26)

OK on the device: scroll feel with the Safari bar, case study reveals and inline video, booking picker, rotation. Four fixes, all gated the same way:

| Reported | Cause | Fix |
|---|---|---|
| Tap outside does not close the mega menu | `.mega-backdrop` stays `pointer-events: none` when open (desktop closes on hover-out) | coarse + 1024: `pointer-events: auto; cursor: pointer` (iOS needs the cursor to dispatch the click), `top: 80px` so the bar itself stays tappable |
| Hero covers slide back to their start while scrolling | Safari fires `resize` as its toolbar collapses; `measure()` re-ran `fullSet` and reset the row | coarse pointer: height-only resizes are ignored, only a width change re-measures (`HeroShelf.tsx`) |
| Journal cards cannot be swiped by touch | pointer events + immediate `setPointerCapture` on a touch pointer in iOS Safari | tablet tier: native `touchstart/move/end` listeners decide the axis and drive the same drag core; pointer handlers ignore touch pointers there (`JournalSlider.tsx`) |
| Trackpad scroll not fluid (Magic Keyboard) | Lenis lerps wheel events that iPadOS already gave momentum | `SmoothScroll.tsx` skips Lenis on `(pointer: coarse) and (min-width: 768px)`, like reduced motion; phones and mice keep it |

Dev server: `allowedDevOrigins` added to `next.config.ts` so the iPad can load the dev build from `http://192.168.1.15:3001` (Next 16 blocked the dev resources for a non-localhost origin, which left the page unhydrated: no hero, no header).

Round 2: the backdrop click never arrived on iOS (Safari only dispatches click to elements it deems clickable, and a delegated React handler is invisible to that heuristic), so `Header.tsx` closes the open panel from a document-level `pointerdown` on a coarse pointer: inside `.mega-inner` nothing, on the bar its own links decide, anywhere else closes. Confirmed on the device. All eight device checks pass; only the manifesto padding in portrait (finding 3) stays open.
