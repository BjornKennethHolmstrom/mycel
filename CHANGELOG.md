# Changelog

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
- **Presence panel** — set your capacity (available/limited/unavailable), mood, offers, needs, and display name; slides up from bottom
- **Peer detail panel** — tap a node to see their status, offers, needs, trust score; send gratitude; rename locally
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
