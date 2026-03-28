# Mycel — Technical Spec
*A coordination substrate for living communities*

Version 0.2 — March 2026

---

## Guiding constraint

This spec describes what a solo vibe coder with AI assistance could realistically build in 2026. It avoids inventing new protocols. Where existing, proven infrastructure exists, we use it.

The novel work is the trust-weighted topology layer and the ambient visualization. Everything else assembles from existing, maintained, open-source components.

---

## Base layer: Nostr

Nostr is the substrate. It provides:

- **Decentralized identity** via keypairs (ed25519). No registration, no central authority.
- **Event propagation** via relays — any server that accepts and forwards signed JSON. Anyone can run one.
- **Censorship resistance** — clients choose which relays to connect to; no single relay can silence a user.
- **Existing ecosystem** — clients, libraries (nostr-tools in JS, rust-nostr, others), 950+ public relays.

Every Mycel signal is a Nostr event: a signed JSON object with a `kind` (type), `content`, `tags`, and a timestamp.

### Relevant NIPs (Nostr Improvement Proposals)

| NIP | Purpose | Mycel use |
|-----|---------|-----------|
| NIP-01 | Base event format, relay protocol | Everything |
| NIP-44 | Encrypted direct messages | 1:1 coordination, constellation key distribution |
| NIP-65 | Relay list metadata | Trust-weighted relay selection |
| NIP-78 | Arbitrary app-specific data | All Mycel custom event kinds (30000+ range) |

---

## Phase 0: What gets built first

Works for 5–50 people who already know each other. No mesh, no currency, no governance tools.

---

### 1. Identity

Mycel identity is a Nostr keypair (ed25519).

- Generated client-side, never transmitted
- One person may hold multiple keys (personal, household, role)
- Optional NIP-05 handle for human-readable names
- Backup via encrypted mnemonic seed phrase
- No registration, no central authority

#### Vouching

A simple signed event indicating "I know this person."

```json
{
  "kind": 30081,
  "content": {
    "mycel_type": "vouch",
    "for": "<pubkey>"
  },
  "tags": [["p", "<pubkey>"]]
}
```

No threshold requirements. No verification tiers. A vouch is social signal, not gatekeeping. It feeds into trust scoring.

---

### 2. Trust scoring

Each client maintains a local trust score per peer. No server knows the graph.

#### Formula

```
trust_score(peer) = Σ (event_weight × recency_decay)
```

#### Event weights

| Event | Weight |
|-------|--------|
| Completed coordination (need → offer → confirmed) | +5 |
| Acted on a resource offer | +3 |
| Sent gratitude acknowledgement | +2 |
| Direct encrypted message exchange | +1 |
| Presence overlap in same location hash | +0.5 |
| Vouched for this peer | +2 |

#### Recency decay

Scores halve every 30 days of no interaction. Unused connections atrophy quietly.

#### What trust scores affect

- **Ambient map rendering**: high-trust nodes appear larger, closer
- **Relay selection**: high-trust peers' preferred relays get priority
- **Cache priority**: high-trust peers' events cached longer, served first offline
- **Discovery**: peers found through high-trust connections are surfaced; unknown sources are dimmed

All computed client-side. Single number. The topology emerges locally.

---

### 3. Presence

A lightweight event published periodically (e.g. every 30 min when app is open, or on user action).

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

- **capacity**: available / limited / unavailable — coarse, not surveillance
- **offers / needs**: loose tags from a shared vocabulary
- **mood**: optional, coarse (calm / stretched / urgent)
- **location_hash**: geohash at neighbourhood level (~1km²), user-adjustable precision
- **expiry**: presence events expire; stale presence fades from the map

#### Offer/need vocabulary

Start minimal. A flat list:

`tools, food, transport, shelter, skills, labor, childcare, medical, firewood, water, electronics, clothing, seeds, storage`

Plus freeform `skill:<name>` tags. The vocabulary grows organically from use. If people start using `skill:plumbing`, that becomes part of the vocabulary.

---

### 4. Gratitude

A costless acknowledgement. Not currency, not accounting. Just "thank you."

```json
{
  "kind": 30080,
  "content": {
    "mycel_type": "gratitude",
    "to": "<pubkey>",
    "note": "brought firewood"
  },
  "tags": [["p", "<recipient_pubkey>"]]
}
```

- No balances, no ledger, no reconciliation
- Feeds trust score (+2 per acknowledgement)
- Accumulates as a simple count on the recipient's profile

---

### 5. Constellations

Temporary groups that form around a need and dissolve when done. The only governance primitive.

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

- Encrypted group coordination (shared key distributed via NIP-44 DM)
- Expiry is mandatory. When it passes, the group context dissolves.
- No admin roles, no membership management
- After expiry, trust scores between participants carry the strengthened edges. The container is gone; the relationships persist.

---

### 6. Encrypted messaging

Standard NIP-44 encrypted direct messages for 1:1 coordination. Nothing custom needed.

---

### 7. Design principles

These are not features. They are constraints.

- **No algorithmic feed.** The ambient map is the interface.
- **No engagement metrics.** No likes, no view counts, no trending.
- **No infinite scroll.** Content has natural boundaries.
- **No notifications by default.** DMs only, user-configurable.
- **No streaks or gamification.**
- **Expiring events.** The network rests when nothing is happening.
- **Catalyst for physical meeting.** "I see my neighbor has tools" → I walk over. The app creates reasons to meet, not reasons to stay in the app.

---

### 8. Local storage

SQLite store on the client:

- Own keypair (encrypted)
- Trust scores for known peers
- Recent presence events from trusted contacts
- Pending outgoing events (for offline queueing)
- Gratitude counts
- Constellation membership and keys

The ambient map works partially offline from cache. No continuous server dependency for basic awareness.

---

### 9. The ambient map

The primary UI. Not a feed. A living visualization of the user's trust network.

- Nodes = people (or households, user's choice of presentation)
- Node size = trust score
- Edge thickness = interaction frequency
- Offers/needs visible as subtle indicators on nodes
- Mood/capacity shown as colour or opacity
- Location clusters visible at neighbourhood scale
- Stale presence fades visually

This is the novel UX work. Everything else assembles from existing components.

---

### 10. Implementation path

1. Fork a lightweight Nostr web client (Coracle, Snort, or similar)
2. Add presence event publishing (kind 30078)
3. Build local SQLite trust score store
4. Implement ambient map visualization (radial or spatial graph)
5. Add offer/need tags to presence
6. Add gratitude events (kind 30080)
7. Add vouching (kind 30081)
8. Add constellation support (kind 30079)
9. Test with 5–10 real people who already know each other

---

### What Phase 0 does not require

- A new protocol
- A blockchain or token
- A central server of any kind
- New cryptography
- Building a new relay network (use existing Nostr relays)
- Mesh networking
- Currency or economic system
- Governance tools

---

## Beyond Phase 0

Only if Phase 0 proves useful to real people.

### Phase 1 — Local mesh fallback

When internet connectivity fails, Mycel falls back to local mesh networking.

**Discovery:**
- **mDNS** (multicast DNS): works on local Wi-Fi. Mycel nodes announce themselves on the local network. Zero configuration.
- **Bluetooth LE**: for device-to-device discovery without Wi-Fi. Advertise a Mycel service UUID; nearby devices see each other.

**Store-and-forward:**
Offline, the node stores outgoing events locally and forwards them when a path appears — either internet restored, or a peer with connectivity comes into range.

**Implementation path:**
Rather than writing mesh networking from scratch, the most realistic path is adapting from [Bitchat](https://github.com/jackjackbits/bitchat) (Bluetooth LE mesh + Nostr relay, MIT licence) or similar. Evaluate Bitchat, meshtastic-bridge, and similar projects for licence compatibility and offline-first fit.

Same keypair works online and offline. No separate identity needed.

### Phase 2 — Resource routing

- Richer offer/need matching logic
- Bioregional overlays (location hash clustering)
- Hearts/Love Ledger integration — only if communities ask for it

### Phase 3 — If there's traction

- Governance primitives (proposals, delegation, conflict resolution)
- Place-based node identity
- Collective identity (multisig for households, hubs, BAZs)
- BAZ relay infrastructure

---

## Open questions

1. **Which Nostr client to fork?** Evaluate Coracle, Snort, noStrudel for codebase size, licence, and extensibility.
2. **Ambient map rendering:** Canvas? SVG? WebGL? What performs well on phones with 50–100 nodes?
3. **Offer/need vocabulary:** Start with the flat list above and see what people actually use.
4. **Mesh library selection (Phase 1):** Evaluate Bitchat, meshtastic-bridge for licence compatibility and offline-first fit.
5. **Trust score calibration:** The weights above are hypothetical. What interaction patterns actually predict trustworthy coordination in practice?
6. **First test community:** Who are the 5–10 people? Where does the first real test happen?

---

*The radical part is in the architecture. The spec just needs to point at something buildable.*

*Developed under the Global Governance Frameworks research initiative*
*Björn Kenneth Holmström — Upplands Väsby, Sweden*
*globalgovernanceframeworks.org*
