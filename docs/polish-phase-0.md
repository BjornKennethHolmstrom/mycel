# Phase 0 polish — status

## Completed ✓

- ~~QR code sharing~~ — show/scan QR codes for peer discovery
- ~~Auto-republish presence~~ — every 30 minutes while app is open
- ~~Remove demo peers~~ — empty map with guidance for fresh installs
- ~~Stale presence fading~~ — nodes fade after expiry
- ~~Reconnection~~ — WebSocket auto-reconnect with backoff
- ~~Tap feedback~~ — ripple animation on node tap
- ~~Offer/need match highlighting~~ — colored pulsing edges for matches
- ~~Relay health indicator~~ — green/yellow/red dot with count
- ~~Publish error feedback~~ — toast on network failure
- ~~Service worker versioning~~ — auto cache busting from build hash
- ~~Display name~~ — broadcast your name, rename peers locally
- ~~Presence persistence~~ — survives page reload
- ~~Footer i18n~~ — capacity label translated
- ~~Empty state guidance~~ — hint to add someone
- ~~Forget contact~~ — remove peer and trust history
- ~~Landing page~~ — bjornkennethholmstrom.org/mycel
- ~~Swedish one-pager~~ — translated for sharing

## Remaining

### Cleanup
- **Remove debug logging** — strip console.log calls from relay connection/debug sessions; keep publish success/fail logs behind a debug flag if needed
- **Remove debug subscriptions** — the `pool_debug` subscriber and direct WebSocket debug test in startSubscriptions should go before sharing with non-developers

### Peer discovery
- **Forget/block contact** — block suppresses all events from a pubkey; implement when public discovery exists or someone asks for it

### Settings
- **Settings page** — currently no way to: see/change your pubkey, manage relay list, clear data / reset identity, toggle debug mode. A minimal settings page behind a gear icon.

### Accessibility
- **Text-based peer list** — the Canvas map is opaque to screen readers. An alternative list view showing peers with their status would make the app usable for more people.

### Constellation support
- **Group coordination UI** — the event kind exists (30079) but there's no UI. A simple "start a group" flow: pick 2-3 peers, set an expiry, get a shared encrypted context. Non-trivial UI work.

### Landing page
- **Screenshots** — add app screenshots to the website landing page and README

---

## Suggested next priorities

1. **Debug cleanup** — prepare for sharing with non-developers
2. **Settings page** — basic identity and relay management
3. **Screenshots for README/website** — visual proof the app exists
4. **Constellation UI** — the next real feature after Phase 0 polish
5. Everything else as energy and user feedback dictate
