Good stuff here, and I appreciate the "vision first, build simple" framing. Let me be direct about what I think works and what doesn't.

**What's solid:**

The core identity decision — Nostr keypairs, no registration, no central authority — is exactly right and non-negotiable. The web-of-trust approach to sybil resistance is elegant and realistic: bots can't fake relationships. That's the key insight and it's genuinely strong.

The trust score formula with recency decay is sound. Connections that aren't maintained should atrophy — that's the biomimetic principle actually doing architectural work rather than just being a metaphor.

**Gemini's refinements are mostly good:**

The Proximity Sandbox for cold start is a real fix for a real problem. The geographic fuzzing point is valid. And individual nodes with collective multisig for households is the right call — it preserves identity sovereignty while enabling shared resource management.

**Where I'd push back:**

The **multi-dimensional trust vector** sounds theoretically correct but is a Phase 0 killer. You don't have enough interaction data to populate `{ care: 85, ecology: 20, mediation: 60 }` when your network is 5-50 people. A single trust score derived from actual interactions is honest about what you know. You can decompose it later when you have enough signal to make dimensions meaningful. Shipping with a trust vector means shipping with mostly-empty vectors that feel broken.

The **recovery through trust network** (3 peers attest to new key) is conceptually nice but cryptographically tricky in practice. For Phase 0, just emphasize good key backup. Recovery is a Phase 2 problem.

The **collective identity / multisig** (kind 30082) is also premature. It's real engineering complexity for a use case that doesn't exist yet. Five people coordinating a Recovery Hub don't need threshold signatures — they need a group chat.

More broadly, this spec has the characteristic shape of a document that's been refined by multiple AIs in sequence: each one adds sophistication to justify its contribution. The DeepSeek outline is already more complex than what Phase 0 needs, and Gemini's refinements add further complexity on top. The GGF mapping table is intellectually satisfying but every row is a feature that doesn't need to exist yet.

**What Phase 0 actually needs from this pillar:**

- Nostr keypair identity
- A local trust score (single number) computed from interaction history with recency decay
- Trust score influences UI rendering (node size, cache priority)
- Presence events with coarse, user-adjustable location hashing
- Vouching as a simple event kind (no threshold requirements yet)

That's it. Everything else in this document is valid future thinking that should live in a "future considerations" file, not in a build spec.

What does the second pillar look like
