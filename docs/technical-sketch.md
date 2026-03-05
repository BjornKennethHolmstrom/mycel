# Mycel — technical sketch
*A map from vision to buildable architecture*

Version 0.1 — March 2026

---

## Guiding constraint

This sketch describes what a solo vibe coder with AI assistance could realistically build in 2026. It avoids inventing new protocols. Where existing, proven infrastructure exists, we use it.

---

## Base layer: Nostr

Nostr is the substrate. It provides:

- **Decentralized identity** via keypairs (ed25519). No registration, no central authority. A Mycel identity is a Nostr keypair.
- **Event propagation** via relays — any server that accepts and forwards signed JSON. Anyone can run one.
- **Censorship resistance** — clients choose which relays to connect to; no single relay can silence a user.
- **Existing ecosystem** — clients, libraries (nostr-tools in JS, rust-nostr, others), 950+ public relays.

Every Mycel signal is a Nostr event: a signed JSON object with a `kind` (type), `content`, `tags`, and a timestamp.

### Relevant existing NIPs (Nostr Improvement Proposals)

| NIP | Purpose |
|-----|---------|
| NIP-01 | Base event format, relay protocol |
| NIP-04 | Encrypted direct messages (or NIP-44 for improved encryption) |
| NIP-65 | Relay list metadata (which relays a user prefers) |
| NIP-78 | Arbitrary app-specific data (useful for Mycel-specific event kinds) |

Mycel introduces custom event kinds in the 30000+ range (application-specific per NIP-78).

---

## Ambient layer: presence and resource gradients

### Signed presence events (kind: 30078)

A lightweight event published periodically (e.g. every 30 minutes when the app is open, or on user action):

```json
{
  "kind": 30078,
  "content": {
    "mycel_type": "presence",
    "capacity": "available",
    "offers": ["tools", "transport"],
    "needs": [],
    "mood": "calm",
    "location_hash": "u65z..."
  },
  "tags": [["d", "presence"], ["expiry", "3600"]],
  "created_at": 1741234567
}
```

- `capacity`: available / limited / unavailable (not granular — avoids surveillance)
- `offers` / `needs`: loose tags from a shared vocabulary (tools, food, transport, skill:carpentry, etc.)
- `mood`: optional, coarse (calm / stretched / urgent)
- `location_hash`: a geohash at low precision (neighbourhood-level, ~1km²) — never exact coordinates
- `expiry`: presence events expire; stale presence disappears from the map

### Local caching

The ambient map is built from locally cached presence events. The client maintains a small SQLite store of recent presence events from trusted contacts. This means:

- The ambient layer works partially offline (last known state)
- No continuous server dependency for basic awareness
- Privacy: presence is shared with your trust graph, not broadcast globally

---

## Hyphal thickening: trust-weighted topology

This is the core Mycel addition on top of plain Nostr.

### The scoring model

Each peer in the contact graph has a local trust score, computed from interaction history:

```
trust_score(peer) = Σ (event_weight × recency_decay)
```

Event weights (examples):
- Received and acted on a resource offer: +3
- Completed a coordination loop (need → match → confirmed): +5
- Sent a Hearts acknowledgement: +2
- Direct encrypted message exchange: +1
- Presence overlap in same location hash: +0.5

Recency decay: scores halve every 30 days of no interaction. Unused connections quietly atrophy.

### How the score is used

- **Relay selection**: High-trust peers' preferred relays get priority for fetching events. The client builds a personal relay topology weighted by trust.
- **Ambient map rendering**: Node size and edge thickness in the visual map reflect trust score.
- **Caching priority**: High-trust peers' events are cached longer and served first offline.
- **Signal routing**: In mesh mode, messages preferentially hop through high-trust nodes.

This all happens client-side. No server needs to know about trust scores. The topology emerges locally.

---

## Active layer: encrypted coordination

Standard NIP-44 encrypted direct messages for 1:1 coordination.

For small group coordination (a temporary constellation), a simple shared-key group message scheme:

```json
{
  "kind": 30079,
  "content": "<encrypted payload>",
  "tags": [
    ["d", "constellation:<unique_id>"],
    ["expiry", "<unix_timestamp>"],
    ["p", "<pubkey1>"], ["p", "<pubkey2>"], ["p", "<pubkey3>"]
  ]
}
```

- Constellations have an expiry. When the timestamp passes, the group context dissolves.
- No admin, no membership management. The constellation is simply a shared event kind with a shared encryption key distributed out-of-band (e.g. via NIP-44 DM to each participant).
- After expiry, the edges between participants carry the strengthened trust score. The container is gone; the relationship persists.

---

## Mesh fallback: offline operation

When internet connectivity fails, Mycel falls back to local mesh networking.

### Discovery

- **mDNS** (multicast DNS): works on local Wi-Fi. Mycel nodes announce themselves on the local network. Zero configuration.
- **Bluetooth LE**: for device-to-device discovery without Wi-Fi. Advertise a Mycel service UUID; nearby devices see each other.

### Store-and-forward

Offline, the node stores outgoing events locally and forwards them when a path appears — either internet restored, or a peer with connectivity comes into range. This mirrors how mycelium routes around damage: not instantly, but reliably.

### Implementation path

Rather than writing mesh networking from scratch, the most realistic path is adapting from [Bitchat](https://github.com/jackjackbits/bitchat) (Bluetooth LE mesh + Nostr relay, MIT licence) or similar open-source implementations. The mesh layer is the most technically complex part of the project and the most likely to benefit from existing code.

---

## Hearts / Love Ledger: optional event kind

The Hearts currency is an optional layer, not a dependency. A Hearts acknowledgement is simply a signed event:

```json
{
  "kind": 30080,
  "content": {
    "mycel_type": "hearts",
    "to": "<pubkey>",
    "amount": 3,
    "note": "brought firewood",
    "context": "constellation:<id>"
  },
  "tags": [["p", "<recipient_pubkey>"]]
}
```

- Purely local accounting. No global ledger, no blockchain.
- Each node maintains its own record of sent/received Hearts.
- Optionally shared with a trusted BAZ relay for community-level resource visibility.
- Hearts events feed into trust scoring (+2 per acknowledgement sent).

---

## Phased build plan

### Phase 0 — solo, weeks to months
Nostr client with trust-weighted contact graph and ambient presence map.

Concrete deliverables:
- Fork a lightweight Nostr web client (Coracle or similar)
- Add presence event publishing and rendering
- Build local SQLite trust score store
- Implement basic ambient map visualization (radial graph, node size = trust score)

Works for 5–50 people who already know each other. No mesh yet.

### Phase 1 — solo with AI, months
Add local mesh fallback.

- Integrate mDNS local discovery
- Add Bluetooth LE via existing open-source mesh library
- Store-and-forward for offline events
- Test: 72-hour offline operation with a small group

### Phase 2 — small team or sustained solo
Resource routing and Hearts integration.

- Offer/need event kinds with matching logic
- Hearts acknowledgements feeding trust scores
- Loose bioregional overlay (location hash clustering)
- Basic constellation support with expiry

### Phase 3 — if there's traction
Governance plugins, place-based node identity, BAZ relay infrastructure.

---

## What this does not require

- A new consensus protocol
- A blockchain or token
- A central server of any kind
- Inventing new cryptography
- Building a new relay network (use existing Nostr relays for Phase 0)

The novel work is the trust-weighted topology layer and the ambient visualization. Everything else assembles from existing, maintained, open-source components.

---

## Key open questions for contributors

1. **Place-based vs person-based identity**: Should a node represent a household/place (stable, lower privacy risk) or a person (familiar UX, higher surveillance risk)? This affects key management and the whole identity model.

2. **Offer/need vocabulary**: What's the minimal shared tag vocabulary for resource signalling that's useful without being prescriptive? Who maintains it, and how does it evolve?

3. **Trust score calibration**: The weights above are hypothetical. What interaction patterns actually predict trustworthy coordination in practice?

4. **Mesh library selection**: Evaluate Bitchat, meshtastic-bridge, and similar projects for licence compatibility and offline-first fit.

---

*Global Governance Frameworks — globalgovernanceframeworks.org*
*Contact: bjorn.kenneth.holmstrom@gmail.com*
