# Changelog

## 0.2.0 — 2026-03-28

Polish pass. The app is usable by real people.

### Peer discovery
- **QR code sharing** — show your key as a QR code, scan a peer's QR with camera; bundled qrcode-generator and jsQR libraries
- **Forget contact** — remove a peer and their trust history from your map

### Presence
- **Display name** — set your name in the presence panel; broadcast in presence events; peers pick it up automatically
- **Peer renaming** — tap a peer's name in the detail panel to edit it locally; clearing it reverts to their broadcast name
- **Auto-republish** — presence quietly re-publishes every 30 minutes while the app is open
- **Presence persistence** — your own presence survives page reloads

### Map
- **Tap feedback** — green ripple pulse animation when tapping a node
- **Stale presence fading** — nodes and edges gradually become translucent after presence expires
- **Offer/need match highlighting** — edges pulse green (they offer what you need), orange (you offer what they need), or gold (mutual match)
- **"You" node is tappable** — opens the presence panel

### Reliability
- **Relay health indicator** — header shows connected/total relay count with green/yellow/red dot
- **Auto-reconnection** — WebSocket subscriptions reconnect with backoff when connections drop (phone sleep, network change)
- **Publish error feedback** — toast notification when all relays reject a publish
- **Service worker auto-versioning** — cache name derived from build hash, no manual bumping

### i18n
- **Full Swedish translation** — all UI strings, vocabulary tags, time-ago labels, error messages
- **Footer presence translation** — capacity label in footer bar now respects locale

### Cleanup
- **Demo peers removed** — fresh installs show an empty map with a hint to add someone
- **Empty state guidance** — "tap + to add someone nearby" shown when map has no peers

### Website
- **Mycel landing page** — bilingual page at bjornkennethholmstrom.org/mycel with explanation, getting started guide, and links
- **Apps page listing** — Mycel added to the apps & tools page

### Documentation
- **POLISH.md** — polish roadmap for remaining Phase 0 work
- **Swedish one-pager** — translated version of the Mycel one-pager

---

## 0.1.0 — 2026-03-28

First working prototype. Two real people can see each other's presence across devices.

### Core
- **Nostr identity** — keypair generation, localStorage persistence, import/export
- **Trust scoring engine** — local scores per peer with recency decay (halves every 30 days), persisted to localStorage
- **Presence events** — publish capacity, mood, offers, needs to Nostr relays (kind 30078)
- **Gratitude events** — costless acknowledgements that feed trust scores (kind 30080)
- **Vouch events** — "I know this person" signal (kind 30081)
- **Live relay subscriptions** — direct WebSocket connections to relays, bypassing SimplePool for reliability
- **Peer persistence** — names, presence, and trust events survive page reloads

### Interface
- **Ambient map** — Canvas-based radial visualization; you at center, peers arranged by trust score; edges from you to each peer with thickness reflecting trust
- **Presence panel** — set your capacity (available/limited/unavailable), mood, offers, needs; slides up from bottom
- **Peer detail panel** — tap a node to see their status, offers, needs, trust score; send gratitude
- **Add peer panel** — paste a pubkey to add someone; copy your own key to share; "+" button in header
- **Toast notifications** — quiet confirmation for gratitude sent/received
- **Language switcher** — English and Swedish, auto-detects browser language
- **PWA** — installable on mobile, service worker for offline shell caching

### Design
- Dark earthy color palette (greens, browns, muted tones)
- No feed, no metrics, no notifications by default
- Expiring presence events
- Node colors reflect capacity (green/yellow/grey)
- Offer/need indicators on nodes (green/orange dots)

### Technical
- SvelteKit + TypeScript
- nostr-tools for event signing and relay publishing
- Direct WebSocket for subscriptions (SimplePool had timing issues)
- Tailwind CSS v4
- GitHub Pages deployment with static adapter
