# Phase 0 polish — what's next

## Peer discovery

### Forget contact
Remove a peer from your map and local storage. Doesn't announce anything to the network — the connection simply atrophies to zero from your side. Useful for cleanup and testing.
Implementation: delete from peers store and trust store, call persistPeers(), remove from map.

### QR code sharing
The highest-impact polish item. Right now adding a peer means copy-pasting a 64-character hex string — painful on mobile. Instead:

- **Show QR** — tap your key in the "+" panel, it renders as a QR code
- **Scan QR** — camera button opens scanner, reads the pubkey, adds the peer
- Two people standing next to each other: one shows, one scans, done in 3 seconds
- Library: `qrcode` for generation (tiny, no deps), browser `getUserMedia` + `jsQR` for scanning

This alone would make the difference between "technically works" and "I'd actually show this to my neighbor."

### Bluetooth LE discovery (Phase 1 preview)
For the future — auto-discover nearby Mycel users without exchanging keys. But QR is the right Phase 0 answer: it's simple, works everywhere, and doesn't need permissions beyond camera.

## Map polish

### Tap feedback
Currently tapping a node has no visual response before the panel opens. A brief pulse animation on the tapped node would feel more alive.

### Stale presence fading
The spec says stale presence fades visually, but this isn't implemented yet. Nodes whose last presence is older than the expiry should gradually become translucent.

### Offer/need match highlighting
When you set a need and a peer is offering it (or vice versa), subtly highlight the edge between you — maybe a different color or a gentle pulse. This is the "resource gradient" from the vision doc, made visible.

## Presence polish

### Auto-republish
Presence events expire after 1 hour. The app should quietly republish your presence periodically while it's open (e.g. every 30 minutes), so you don't silently disappear from others' maps.

### Presence in footer
The footer currently shows capacity and offer count in English even when Swedish is selected. Small i18n fix — translate the capacity label in the footer bar.

## Reliability

### Relay health indicator
Right now "connected" means the app started — it doesn't reflect whether relays are actually reachable. A subtle indicator (green/yellow/red dot) showing how many relays are live would help debug issues without opening the console.

### Reconnection
If a WebSocket drops (phone sleeps, network change), the app should reconnect automatically. Currently it doesn't — presence stops flowing until a page reload.

### Error recovery for publish
If all relays reject a publish, show a toast ("couldn't reach network") instead of silently failing.

## Cleanup

### Remove demo peers
The `addDemoPeers()` function should go. For fresh installs, show an empty map with a gentle prompt to add someone via the "+" button. The empty state is actually a feature — it says "this network is real, not pre-populated."

### Remove debug logging
Strip `console.log` calls and the `pool_debug` getter before sharing with non-developers. Keep the relay publish logs behind a debug flag if needed.

### Service worker versioning
Automate cache busting — derive the cache name from the build hash instead of manually bumping `mycel-v3`.

## Nice to have

### Landing page
A page on bjornkennethholmstrom.org/mycel explaining what Mycel is, linking to the app, and showing how to get started. Serves as the shareable URL when introducing people to the project.

### Empty state guidance
When the map has no peers, show a soft hint in the center: "tap + to add someone nearby". Disappears after the first peer is added. No help modal, no manual — if the app needs one, the app is too complicated.

### Block contact
Suppress all events from a pubkey — presence, gratitude, vouches. The blocked peer still exists on relays but your client ignores them entirely. Stored locally as a simple blocklist in localStorage. Different from "forget" because forget is quiet removal; block is active filtering of incoming events. Architecturally consistent with the trust model — it's just trust score = -∞.

### Constellation support
The event kind exists (30079) but there's no UI. A simple "start a group" flow — pick 2-3 peers, set an expiry, get a shared encrypted thread. This is the governance primitive from the spec, but the UI work is non-trivial.

### Settings page
Currently there's no way to:
- See/change your pubkey
- Manage relay list
- Clear data / reset identity
- Toggle debug mode

A minimal settings page behind a gear icon would cover these.

### Accessibility
The Canvas-based map is opaque to screen readers. For Phase 0 this is acceptable, but a text-based peer list as an alternative view would make the app usable for more people.

---

## Suggested priority

1. **QR code sharing** — biggest UX win, makes the app shareable
2. **Auto-republish presence** — without this, peers fade after an hour
3. **Remove demo peers + cleanup** — prepare for real users
4. **Stale presence fading** — visual honesty about who's actually around
5. **Reconnection** — reliability for real-world use
6. Everything else as energy allows
