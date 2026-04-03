Congratulations on completing Phase 0! Mycel is already a solid, usable substrate. Phase 1 is where it becomes *resilient* — the offline‑first mesh that makes it truly distinct from any app that requires a live internet connection.

Here’s how I’d approach Phase 1, staying true to the vision and the existing architecture.

---

## Phase 1 goal statement

> Enable a group of people to discover each other, exchange presence and coordination events, and maintain trust‑weighted topology **without any internet connection** for up to 72 hours, using only local mesh (Bluetooth LE + mDNS) and store‑and‑forward synchronization when connectivity returns.

---

## Core challenges & architectural shifts

### 1. Browser limitations → native wrapper

The existing PWA (SvelteKit + service worker) cannot directly access BLE advertising, mDNS discovery, or raw UDP sockets. **Phase 1 requires a native shell** that can:

- Advertise and scan for BLE beacons (presence announcements)
- Resolve `.local` mDNS names (peer discovery on shared Wi‑Fi)
- Maintain a local TCP/WebSocket server for peer‑to‑peer event exchange

**Recommendation:** Wrap the existing SvelteKit app with **Capacitor** (preferred for web devs) or **Tauri** (lighter, but mobile support maturing). Capacitor gives you plugins for BLE, mDNS (via custom plugin or native modules), and background execution. The same codebase remains mostly untouched – only the networking layer gains new transports.

### 2. Two‑tier event bus

Today, events go directly to Nostr relays. Offline, they must travel through the local mesh. Introduce an **abstraction layer** that chooses the best available transport:

```
Event Bus
├── Online: Nostr relay (WebSocket)
└── Offline: Local mesh (BLE + mDNS + WebRTC DataChannels)
```

When both are available, the bus can use both – mesh for low‑latency local sync, relays for global redundancy.

### 3. Store‑and‑forward & eventual consistency

Every Mycel node becomes a **mini‑relay** for its peers. Events are stored in an **indexed offline queue** (SQLite via Capacitor or OPFS in the browser fallback). When a peer reappears (via mesh or online), nodes exchange missing events using a simple **gossip protocol** – similar to how Nostr relays sync with NIP‑11 but adapted for peer lists.

**Key design decisions:**

- Each event already has a signature, `created_at`, and a `pubkey`. No central ordering needed.
- Use **per‑peer watermarks** (last seen event timestamp or hash) to avoid re‑sending everything.
- Trust scores continue to update locally based on received events, even offline. When sync resumes, scores merge using a **last‑write‑wins** or **score‑accumulation** rule (since trust is additive and monotonic – you never forget a gratitude).

### 4. Presence in a mesh without relays

Presence events (kind 30078) are ephemeral (expire ~1 hour). In offline mode, they are **broadcast over BLE advertisement packets** (truncated: pubkey prefix + capacity + timestamp) and also exchanged over mDNS/WebRTC for full event bodies. This lets nearby peers see “someone is here” without a full data connection.

Design the BLE advertisement as a tiny frame:

```
[ 2B service UUID ][ 4B timestamp ][ 4B pubkey prefix ][ 1B capacity ][ 2B CRC ]
```

Full presence events are requested over a separate channel (WebRTC or TCP) when two nodes decide to establish a richer connection.

### 5. The 72‑hour offline test

This is the acceptance criterion. It means:

- No internet for 72 hours, but the local mesh (BLE + mDNS) remains functional.
- All published presence, gratitude, and offer/need events are stored locally and exchanged when peers come within range.
- Trust scores continue to evolve based on those exchanges.
- When internet returns, the node syncs all missed events to configured relays without data loss or duplication.

**Infrastructure needed:**
- Persistent event store (SQLite) with an outgoing queue per peer/relay.
- A reconciliation routine that runs every N minutes (or on network change) that asks each peer/relay: “What events after timestamp X from pubkeys Y do you have that I don’t?”
- Ability to **re‑publish** local events to relays after a long offline period – with proper idempotency (relays already deduplicate by event id).

---

## Suggested feature breakdown (Phase 1)

### Milestone 1: Native shell + offline database
- [ ] Wrap app with Capacitor (or Tauri)
- [ ] Add SQLite plugin – replace localStorage for events, trust store, and peer metadata
- [ ] Implement event queue table: `(id, pubkey, kind, created_at, relay_hint, transmitted_at)`
- [ ] Ensure all existing functionality (key management, trust scoring, map UI) works unchanged inside the native shell

### Milestone 2: Local peer discovery (BLE + mDNS)
- [ ] BLE: advertise a Mycel service UUID with truncated presence info
- [ ] BLE: scan for other advertisers, resolve full pubkey via mDNS or WebRTC
- [ ] mDNS: register `mycel-<pubkey-short>.local` on the local network, resolve peers to IP:port
- [ ] Add a simple WebSocket server inside the app (listens on port 5174 or dynamic) for direct peer‑to‑peer event exchange
- [ ] UI indicator: show “Mesh active” / “Offline mode” / “Relay connected”

### Milestone 3: Store‑and‑forward & gossip
- [ ] When a peer is discovered, exchange `since` timestamps and pull missing events
- [ ] Rate‑limit and prioritize – presence first, then gratitude/offers, then older history
- [ ] Implement “broadcast to all known peers” when a new local event is created (if mesh is available)
- [ ] Conflict resolution: last‑write‑wins on trust score updates (since gratitude events are immutable, simple ordering works)

### Milestone 4: 72‑hour offline test & polish
- [ ] Add a “simulate offline” toggle in dev mode
- [ ] Write integration test: three devices, no internet, exchange presence and gratitude for 3 simulated days (speed up time by using low TTLs)
- [ ] Optimize battery usage: BLE scanning only when app is foreground or with background permission
- [ ] Ensure re‑sync after reconnection does not flood relays (use NIP‑11 limits, backoff)

---

## What does NOT change (by design)

- **Trust scoring** remains purely local, recency‑based, and independent of any global consensus.
- **The ambient map** continues to show trust‑weighted topology – offline, it will show only peers discovered via mesh, but the same visual language applies.
- **No new engagement metrics** – mesh discovery is passive, no “friend suggestions” or lists of nearby strangers. You still need to know a peer’s pubkey or have been introduced.
- **Nostr compatibility** – all events are still valid Nostr events. When online, they flow to relays as before. Offline mesh is an additional transport, not a replacement.

---

## Open questions for your team

1. **Capacitor vs Tauri vs pure WebRTC + BLE (via browser)?**  
   Capacitor gives the fastest path to production on iOS/Android. Tauri is lighter but desktop‑first. If you want to keep the PWA pure, you could use WebRTC DataChannels with a signaling server that also works over LAN (mDNS + HTTPS local server). However, BLE advertising is impossible from a browser. I strongly recommend Capacitor.

2. **Background operation** – Should Mycel keep scanning for peers when the app is closed? That would require native background modes (location/BLE). It’s a big battery trade‑off. For Phase 1, keep it simple: only discover when the app is open. The 72‑hour test can assume the app stays in foreground or uses “keep‑awake” mode.

3. **Security model** – Local mesh currently has no encryption beyond event signatures. Anyone on the same Wi‑Fi can see your presence broadcasts. Is that acceptable for Phase 1? You could later add a pairwise encryption layer, but for initial offline coordination, the threat model is physical proximity (trusted environment). Document as a known limitation.

---

## A concrete first step (Monday morning)

1. **Install Capacitor** into the existing project:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init Mycel com.mycel.app
   npm install @capacitor/android @capacitor/ios
   ```

2. **Add SQLite plugin** (store events and trust scores in a real database).

3. **Run the existing app on a real device** – verify that the map and Nostr publishing still work exactly as before inside the native WebView.

Once that’s stable, start adding BLE scan/advertise (use `@capacitor-community/bluetooth-le`) and a simple WebSocket peer server.

---

## Why this Phase 1 sets you up for the future

- The store‑and‑forward engine becomes the foundation for **Phase 2** (resource routing) – offers and needs can be forwarded across multiple hops.
- The local mesh transport can later be extended to **Wi‑Fi Direct** and **LoRa** without changing the event model.
- You will have proven the most radical claim of the vision: *Mycel works when the internet doesn’t.* That’s the feature that turns it from a nice idea into indispensable infrastructure.

Let me know if you want a deeper dive into any of these areas – the BLE advertisement format, the gossip reconciliation algorithm, or how to adapt the trust store for offline‑first. And again, congratulations on reaching this milestone – it’s a beautiful project.
