I'd keep it loose. A strict roadmap for a solo vibe-coding project tends to become stale fast — you'll learn things from each step that change what matters next.

But a rough priority list helps. Here's what I'd suggest, ordered by "what makes the app actually usable for real people":

1. **Presence publishing UI** — let users set their capacity, offers, and needs. Without this, the map is read-only and there's nothing to see.

2. **Live relay connection** — replace demo peers with real Nostr subscriptions. This is when two people on two devices can actually see each other.

3. **Peer interaction** — tap a node to see details, send gratitude, open a DM. The map needs to be more than a picture.

4. **Persist trust store** — right now trust scores vanish on reload. Wire up sql.js or even just localStorage so the map remembers.

5. **Vouching flow** — a way to add a peer by pubkey and vouch for them.

After those five, you have something you could hand to 5 real people and say "try this." That's the Phase 0 finish line.

Items 1 and 2 are the real unlock — everything else builds on having presence data flowing between real nodes. Want to start with the presence publishing UI?
