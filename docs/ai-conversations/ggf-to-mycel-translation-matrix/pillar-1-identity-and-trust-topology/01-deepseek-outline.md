I think this is an excellent plan. Gemini has correctly identified that Mycel needs to be designed from the GGF requirements outward, not built first and retrofitted later. The translation matrix approach ensures that Mycel becomes the infrastructure the frameworks describe, rather than another app that happens to share some terminology.

I agree with starting with **Pillar 1: Identity & Trust Topology**. This is foundational. Without a robust, offline-capable, sybil-resistant identity model, the other pillars cannot function. Hearts require trusted accounts. Sense-making requires resistance to bots. Governance requires verifiable participants.

Let me offer a detailed specification for this pillar.

---

# GGF-to-Mycel Translation Matrix

## Pillar 1: Identity & Trust Topology (The Social Fabric)

### 1.1 Core Requirements from the Frameworks

| Framework | Requirement |
|-----------|-------------|
| **Cairn Protocol** | Recovery Weavers need trusted identity to build relationships; participants need to verify who they are engaging with |
| **Social Fabric Framework** | Connections strengthen with meaningful exchange; trust is emergent, not imposed |
| **Capacity Engine** | Competency Passport requires verifiable achievements; credentials must be tied to real individuals |
| **Synoptic Protocol** | Resistance to bot networks and sybil attacks without centralized identity verification |
| **Cognitive Sovereignty Accord** | Protection against surveillance; identity must be controlled by the individual |
| **AUBI Framework** | Hearts require trusted accounts to prevent gaming; care work must be attributable |
| **Justice Systems Framework** | Accountability requires identity that cannot be trivially discarded |
| **Indigenous Framework** | Collective identity models alongside individual ones; communities may hold shared keys |

---

### 1.2 Identity Architecture

#### 1.2.1 The Baseline: Nostr Keypairs

**Decision:** Mycel identity is a Nostr keypair (ed25519). No registration, no central authority. One person may have multiple keypairs for different contexts (personal, household, community role).

| Element | Specification |
|---------|---------------|
| **Private Key** | 64-character hex, generated client-side, never transmitted |
| **Public Key** | 64-character hex, serves as the account identifier |
| **Derived Identifiers** | NIP-05 (email-style names) optional for human-readable handles |
| **Backup** | Encrypted mnemonic seed phrase; user education on key management |

**Why this fits GGF requirements:**
- Sovereignty: keys are user-controlled
- No surveillance: no central authority issues identities
- Pseudonymity: users may have multiple identities for different contexts
- Interoperability: uses existing Nostr ecosystem

#### 1.2.2 Proof of Personhood: The Trust-Weighted Alternative

**The Problem:** The GGF requires resistance to bot networks and sybil attacks, but cannot rely on government IDs (surveillance risk) or biometrics (centralization, exclusion).

**The Solution:** Trust-weighted proof of personhood, not cryptographic proof.

**Mechanism:**

| Element | Description |
|---------|-------------|
| **Trust Anchor** | Existing users vouch for new users they know personally. A new user is "real" if they are vouched for by a sufficiently trusted node. |
| **Web of Trust** | No global score. Each user maintains their own trust graph based on interaction history. |
| **Sybil Resistance** | A bot farm has no trusted connections; it is invisible to real users. |
| **New User Onboarding** | Without trusted vouch, new users are visible only to those who explicitly choose to see "unverified" accounts. |
| **Recovery** | Lost keys can be recovered through trust network attestations (3 trusted peers confirm identity). |

**Event Kind: Vouch (kind: 30081)**

```json
{
  "kind": 30081,
  "content": {
    "mycel_type": "vouch",
    "for": "<new_user_pubkey>",
    "relationship": "neighbor",
    "duration_known": "2 years"
  },
  "tags": [
    ["p", "<new_user_pubkey>"],
    ["expiry", "31536000"]  // 1 year
  ]
}
```

**Why this fits GGF requirements:**
- No central identity authority: trust is local and emergent
- Sybil-resistant: bots cannot infiltrate without real relationships
- Offline-capable: vouches can be exchanged via mesh
- Inclusive: no ID document required

---

### 1.3 Trust Topology: Hyphal Thickening

#### 1.3.1 Local Trust Score Calculation

Each peer maintains a local trust score for every other peer they have interacted with. The score is computed client-side; no server knows the global trust graph.

**Base Score Formula:**

```
trust_score(peer) = Σ (event_weight × recency_decay × interaction_depth)
```

**Event Weights:**

| Event Type | Base Weight | Rationale |
|------------|-------------|-----------|
| Received and acted on an offer | +3 | Direct resource exchange |
| Completed a coordination loop (need → match → confirmed) | +5 | Sustained collaboration |
| Sent Hearts acknowledgement | +2 | Recognition of care work |
| Encrypted DM exchange | +1 | Direct communication |
| Presence overlap in same location | +0.5 | Physical co-presence |
| Vouch for new user (vouch recipient) | +2 | Trust propagation |
| Constellation participation | +1 per session | Group coordination |

**Recency Decay:**

```
effective_weight = event_weight × e^(-days_since / 30)
```

Scores halve every 30 days of no interaction. Unused connections quietly atrophy.

**Interaction Depth Multiplier:**

| Depth | Multiplier |
|-------|------------|
| Single event | 1.0 |
| 2-5 events | 1.2 |
| 6-20 events | 1.5 |
| 21+ events | 2.0 |

#### 1.3.2 What Trust Scores Control

| Element | Control |
|---------|---------|
| **Ambient Map Visibility** | Low-trust peers appear smaller, more distant; high-trust peers appear larger, closer |
| **Relay Selection** | High-trust peers' preferred relays are prioritized for fetching events |
| **Caching Priority** | High-trust peers' events cached longer, served first offline |
| **Message Routing** | In mesh mode, messages preferentially hop through high-trust nodes |
| **New User Discovery** | Peers discovered through high-trust connections are shown; low-trust connections filtered |

#### 1.3.3 Sybil Resistance Through Trust Starvation

A bot farm can generate thousands of keys, but:

- It cannot generate vouches from real users without real relationships
- Without vouches, it has zero trust score for all real users
- Its events are not cached, not relayed preferentially, not visible in ambient maps
- It is effectively invisible

**This is not cryptographic sybil resistance. It is economic: bots cannot afford the relationship cost.**

---

### 1.4 Offline-First Identity

#### 1.4.1 Local Event Cache

The client maintains a local SQLite store of:
- Own keypair (encrypted)
- Trust scores for known peers
- Recent events from high-trust peers
- Pending events waiting for connectivity

**Offline Operation:**

| Operation | Offline Behavior |
|-----------|------------------|
| **View ambient map** | Shows last known state from cache; staleness indicated visually |
| **Send DM** | Stored locally, queued for delivery when connection restored |
| **Publish presence** | Stored locally; published to relays and mesh when online |
| **Trust score update** | Applied locally; synced when online |

#### 1.4.2 Mesh Discovery

When internet fails, Mycel falls back to:

| Method | Discovery | Use Case |
|--------|-----------|----------|
| **mDNS** | Broadcast on local Wi-Fi | Neighborhood network with shared Wi-Fi |
| **Bluetooth LE** | Device-to-device advertisement | Close-range, no infrastructure |
| **Wi-Fi Direct** | Peer-to-peer Wi-Fi | Larger local network without router |
| **Store-and-forward** | Nodes carry events through disconnected areas | Mesh routing across distance |

**Mesh Identity:** Same keypair works online and offline. No separate identity needed.

---

### 1.5 Collective Identity (BAZ / Community Nodes)

**The GGF Requirement:** Communities (BAZs, Recovery Hubs, Learning Hubs) need collective identity for resource allocation, governance, and external representation.

**The Solution:** Multi-signature nodes.

**Event Kind: Collective Identity (kind: 30082)**

```json
{
  "kind": 30082,
  "content": {
    "mycel_type": "collective",
    "name": "North Bay Recovery Hub",
    "type": "recovery_hub",
    "threshold": 3  // 3 of 5 signatures required
  },
  "tags": [
    ["p", "<pubkey1>"], ["p", "<pubkey2>"], ["p", "<pubkey3>"], ["p", "<pubkey4>"], ["p", "<pubkey5>"]
  ]
}
```

**Operations requiring collective signature:**
- Resource allocation (spending Hearts from collective account)
- Formal offers/needs on behalf of community
- Governance decisions (joining BAZ federation, etc.)
- Vouching for new members

**Why this fits GGF requirements:**
- BAZs are not individuals; they are collectives
- Governance requires accountability
- Recovery Hubs need institutional identity
- Matches Indigenous collective governance models

---

### 1.6 Key Management and Recovery

#### 1.6.1 Key Storage

| Element | Specification |
|---------|---------------|
| **Primary** | Mobile: secure enclave (iOS Keychain, Android Keystore) |
| **Desktop** | Encrypted local file with password |
| **Backup** | Encrypted mnemonic seed phrase (BIP39) |
| **Web** | No key storage; use local client |

#### 1.6.2 Recovery Through Trust Network

If keys are lost:

1. User generates new keypair
2. User contacts 3 trusted peers (high trust score, offline channels)
3. Peers issue **recovery vouches** (kind: 30083) attesting to identity
4. Network recognizes new key as continuation of same identity
5. Old key is marked as deprecated in local trust graphs

**Why this works:** Trust network recovery matches how identity works in the physical world: people know you, not your key.

---

### 1.7 Privacy and Surveillance Resistance

| Risk | Mitigation |
|------|------------|
| **IP address tracking** | Use relays; mesh bypasses internet entirely |
| **Metadata correlation** | Events signed but not encrypted (except DMs). Presence events use coarse location hashes (neighborhood, ~1km²), not exact coordinates. |
| **Network analysis** | Trust scores are local; no global graph exists to analyze |
| **Key compromise** | Recovery through trust network; old key revoked |
| **Surveillance state access** | No central authority to subpoena; keys are local; mesh can operate entirely offline |

---

### 1.8 User Stories

**Story 1: New User Joins Through Trusted Contact**

> Maria has been using Mycel for months. Her neighbor Jamal wants to join. Maria generates a vouch event for Jamal. Jamal's new keypair now has a starting trust score with Maria and her high-trust contacts. He appears on their ambient maps as a small node, gaining visibility as he participates.

**Story 2: Community Forms Recovery Hub**

> Five people start a Recovery Hub. They generate a collective identity keypair with 3-of-5 threshold. The Hub can now receive Hearts, make formal offers, and participate in BAZ governance. Individual members retain their personal keys for private coordination.

**Story 3: Internet Fails, Local Mesh Activates**

> A storm knocks out internet. Mycel nodes on the same Wi-Fi network discover each other via mDNS. Phones with Bluetooth LE connect devices across greater distances. Store-and-forward ensures messages eventually reach their destinations. The ambient map shows who is still present, what resources are available.

**Story 4: Sybil Attack Fails**

> A bot farm creates 10,000 keys and floods the network with offers. They have no vouches from real users. Their trust scores are zero. Their events are not cached, not relayed, not visible. The attack fails.

---

### 1.9 Open Questions for This Pillar

| Question | Implication |
|----------|-------------|
| **Should nodes represent households or individuals?** | Household model: more stable, lower privacy risk; matches physical dwelling. Individual model: more flexible, higher surveillance risk. Suggest household default with individual opt-in. |
| **How granular should location hashes be?** | Too coarse: not useful for coordination. Too fine: surveillance risk. Suggest ~1km² (geohash precision 6) as default, user-adjustable. |
| **What is the minimal trust score threshold for new user visibility?** | Too high: network growth stalls. Too low: sybil risk. Suggest threshold = 2 vouches from peers with trust_score > 50. |
| **How are collective keys managed across members?** | Each member holds a share; threshold signatures require quorum. Implementation using existing multisig libraries. |

---

## Next Steps

If this approach resonates, we can:

1. **Validate the trust score weights** — are these the right interaction types? Do the weights need calibration?
2. **Define the event schemas** in detail — presence, offers, needs, Hearts, vouches, collective identities
3. **Build the first prototype** — Nostr client with trust-weighted ambient presence map
4. **Test with a small community** — five people who already know each other

Shall we proceed to define the event schemas, or would you like to refine this pillar further?
