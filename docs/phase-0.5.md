# Phase 0.5 — Prepare for real testers

The app works. Now make it ready for people who aren't you.

---

## Cleanup (before sharing)

- [ ] **Remove debug subscriptions** — delete the `pool_debug` subscriber and direct WebSocket debug test from `startSubscriptions` in +page.svelte
- [ ] **Remove debug getter** — delete `pool_debug` from client.ts
- [ ] **Clean console.log** — keep relay connect/publish logs, remove everything that says "Debug:"
- [ ] **Test clean install** — clear all localStorage on a device, open the app fresh, verify: onboarding works, empty map shows hint, adding a peer works, QR works, presence publishes, peer appears on map
- [ ] **Test on iOS Safari** — you've tested Chrome/Samsung; Safari has quirks with service workers and camera access
- [ ] **Bump service worker** — ensure the auto-versioning is working so testers don't get stale cached versions

## Settings page

Testers will need to:
- [ ] **See their pubkey** — full key with copy button (not just the truncated version in the + panel)
- [ ] **Set display name** — currently only in the presence panel; a settings page makes it more discoverable
- [ ] **Reset identity** — start fresh if something breaks; confirm dialog, clears all localStorage
- [ ] **Clear peers** — nuclear option for debugging; removes all peers and trust without resetting identity
- [ ] **Link to the app** — for easy sharing

Minimal implementation: a gear icon in the header, opens a simple page/panel.

## Visual polish

- [ ] **Take screenshots** — phone and desktop, with 2-3 peers showing presence, at least one offer/need match. Use these in the README and website landing page.
- [ ] **App name in PWA install** — verify the manifest shows "Mycel" correctly when installing on home screen
- [ ] **Favicon** — verify it shows correctly in browser tabs and PWA icon on both platforms

## Documentation for testers

- [ ] **Short onboarding message** — write a brief text you'd send someone: "Install Mycel, I'll scan your QR, here's what it does." 3-4 sentences max.
- [ ] **Known issues list** — be upfront about what's rough:
  - Relay connections can take a few seconds
  - QR scanning needs good lighting
  - Presence disappears after 1 hour if you close the app
  - Names may not show immediately (wait for next presence publish)

## Recruiting testers

- [ ] **Pick 5-10 people** — neighbors, friends, anyone you see regularly in person. Not developers. Not people who'll be polite about bugs. People who'll tell you "this is confusing" or "I don't get it."
- [ ] **Have a reason to coordinate** — don't ask people to "test an app." Ask if they want to coordinate something real: a shared meal, tool lending, a walk together. The app is the tool, not the point.
- [ ] **Be physically present** for the first setup — scan QR codes together, set presence together, show them the map with their node on it. The first experience must work.
- [ ] **Check in after a week** — are they still opening it? What did they use it for? What confused them? What's missing?

## What to observe

- Do people understand the map without explanation?
- Do they set presence, or forget/ignore it?
- Do the vocabulary tags match what they actually want to offer/need?
- Do they send gratitude? Does it feel meaningful or perfunctory?
- Do they ask for features? Which ones?
- Do they show it to anyone else unprompted?

## Success criteria

Phase 0.5 is complete when:
- 5+ real people have used Mycel for at least one real coordination
- You have a list of what confused them and what they asked for
- The app didn't crash or lose data for any of them
- At least one person showed it to someone you didn't recruit

That last one is the real test. If someone spreads it on their own, the substrate works.

---

*After this: revisit the Phase 1 plan with real feedback in hand. What users actually need may surprise you.*
