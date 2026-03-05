# Mycel

**A coordination substrate for living communities**

[![Status](https://img.shields.io/badge/status-concept%20%2F%20early%20prototype-green)](https://github.com/BjornKennethHolmstrom/mycel)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Protocol: Nostr](https://img.shields.io/badge/protocol-Nostr-purple)](https://nostr.com)

---

## What it is

Mycel is a lightweight, offline-capable coordination network inspired by mycelium — the underground fungal networks that connect forests, route nutrients between trees, and maintain planetary-scale resilience without any central organism in charge.

It is not a social media platform. It is not a replacement for the internet. It is infrastructure that quietly makes real-world coordination easier, works when the internet doesn't, and is designed to strengthen human relationships rather than substitute for them.

The main view is not a feed. It is a soft, living map of presence: who is around, what they have to offer, what they need. Connections thicken where real exchange happens and atrophy where they don't — no algorithm, no moderation team, just organic topology.

---

## The problem it addresses

Current platforms monetize attention, amplify anxiety, and simulate connection without providing it. The result is epidemic loneliness sitting alongside compulsive engagement — people technically more connected than ever and socially more isolated than ever.

Mycel is designed around a different question: what would infrastructure look like if its goal was to get you off the app and into the world?

---

## Core principles

**Coordination substrate, not social media.** Social connection emerges as a byproduct of useful coordination — shared tools, a meal, a response to a local problem. The app facilitates the coordination and then gets out of the way.

**Two-speed signaling.** An ambient layer (slow, presence-based, no urgency) and an active layer (fast, encrypted, for when something actually needs attention). Quiet by default.

**Trust-weighted topology.** Connections strengthen with meaningful exchange history and atrophy without it. Bots and noise are starved of visibility organically.

**Offline-first.** Falls back to local mesh via Bluetooth/Wi-Fi Direct when internet fails. Designed for crisis resilience as well as everyday use.

**Anti-addiction by design.** No engagement algorithms. No notification dark patterns. No metrics that create status competition. Presence events expire. The network rests when nothing is happening.

---

## Architecture

Built on [Nostr](https://nostr.com) as the base protocol — simple signed JSON events, decentralized relays, no central authority — with Mycel adding:

- **Trust-weighted adaptive topology** — local scoring per peer based on interaction history, used for relay selection, caching priority, and map rendering
- **Ambient presence layer** — signed presence events with coarse location hashes, mood signals, and offer/need tags; expire after ~1 hour
- **Temporary constellations** — time-bounded group coordination contexts that dissolve cleanly when their purpose is done, leaving strengthened edges between participants
- **Local mesh fallback** — mDNS and Bluetooth LE discovery for offline operation
- **Hearts/Love Ledger** — optional lightweight care acknowledgement events that feed into trust scoring (no blockchain, no global ledger)

See [`docs/technical-sketch.md`](docs/technical-sketch.md) for the full architectural breakdown.

---

## Status

Early concept and prototype stage. The vision and architecture are documented; the first buildable slice is the Nostr client with trust-weighted ambient presence map.

**What exists:**
- Vision document
- Technical architecture sketch
- UI mockup

**What is being built:**
- Nostr client fork with local trust graph
- Ambient presence event publishing and rendering
- Basic map visualization

Contributions welcome, especially from people with experience in distributed systems, Nostr development, mesh networking, or UX design for low-anxiety interfaces.

---

## Roadmap

**Phase 0 — solo, weeks to months**
Nostr client with trust-weighted contact graph and ambient presence map. Works for 5–50 people who already know each other.

**Phase 1 — add local mesh fallback**
Bluetooth LE and mDNS discovery. Store-and-forward for offline events. 72-hour offline operation test.

**Phase 2 — resource routing and Hearts**
Offer/need event kinds with matching logic. Hearts acknowledgements. Loose bioregional overlays.

**Phase 3 — if there is traction**
Governance plugins, place-based node identity, BAZ relay infrastructure.

---

## Design philosophy

> Create reasons to show up, and let belonging emerge from showing up.

Mycel does not try to be an anti-loneliness app — programs explicitly aimed at reducing loneliness tend to attract the already-connected and feel clinical to everyone else. Instead it provides low-threshold infrastructure where social contact is a natural byproduct of useful activity: coordinating tools, food, a neighbourhood response to something.

The goal is a tool people pick up when they need it and put down without difficulty. Like a good shovel.

---

## Contributing

The most valuable contributions right now:

- **Nostr developers** — help shape the custom event kinds and relay topology logic
- **Distributed systems experience** — mesh networking, conflict resolution, offline-first architecture
- **UX / design** — low-anxiety interface patterns, ambient visualization
- **Community organizers** — what does coordination actually look like on the ground? What would you need?

Open an issue or reach out directly.

---

## Relation to Global Governance Frameworks

Mycel is related to the [Global Governance Frameworks](https://globalgovernanceframeworks.org) research initiative as the potential technical substrate for bioregional coordination, the Social Fabric Framework, and the Hearts/Love Ledger care economy layer. It is designed to stand alone as useful infrastructure regardless of that broader context.

---

## License

AGPL-3.0 — public infrastructure stays public. See [LICENSE](LICENSE) for details.

---

*Björn Kenneth Holmström — Upplands Väsby, Sweden*
*bjorn.kenneth.holmstrom@gmail.com*
*bjornkennethholmstrom.org*
