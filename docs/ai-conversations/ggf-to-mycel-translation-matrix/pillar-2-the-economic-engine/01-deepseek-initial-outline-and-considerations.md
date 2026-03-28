Understood. Let's move to **Pillar 2: The Economic Engine (AUBI & The Love Ledger)**. This pillar translates the GGF's economic frameworks—AUBI, Hearts, Leaves, the Love Ledger—into Mycel's technical primitives.

---

# GGF-to-Mycel Translation Matrix

## Pillar 2: The Economic Engine (AUBI & The Love Ledger)

### 2.1 Core Requirements from the Frameworks

| Framework | Requirement |
|-----------|-------------|
| **AUBI Framework** | Universal Basic Income decoupled from fiat markets; unconditional survival resources; Layer 2/3 supplements for care work and ecological restoration |
| **Cairn Protocol** | Recovery Weavers compensated in Hearts; participants earn Hearts for community contribution; Recovery Hubs funded through pooled Hearts |
| **Capacity Engine** | Competency Passport may include Hearts earned; skills and contributions recognized economically |
| **Work in Liberation Framework** | Community Work Teams compensated in Hearts; meaningful work rewarded regardless of market value |
| **Climate & Energy Framework** | Leaves for ecological restoration; carbon-negative actions rewarded; nature-based solutions funded |
| **Phoenix Protocol** | Circular economy incentives; recycling and repair rewarded with Hearts; reverse logistics compensated |
| **Synoptic Protocol** | Public Epistemic Institutions funded through Hearts; truth-telling and sense-making recognized as care work |
| **Indigenous Framework** | Traditional knowledge stewards compensated through Hearts; community-controlled distribution |

**The Core Insight:** Hearts are not cryptocurrency. They are a mutual credit system. No speculation. No mining. No global ledger. They exist to decouple survival from the fiat market and to recognize work that markets ignore.

---

### 2.2 Hearts Architecture: Mutual Credit, Not Cryptocurrency

#### 2.2.1 What Hearts Are Not

| Feature | Hearts | Cryptocurrency |
|---------|--------|----------------|
| **Speculation** | Not traded on markets | Speculative asset |
| **Mining** | No mining; issued through mutual credit | Energy-intensive mining |
| **Global ledger** | No global ledger; local accounting | Global blockchain |
| **Store of value** | Not designed as store of value | Store of value claim |
| **Interest** | No interest | Staking/lending yields |

#### 2.2.2 What Hearts Are

| Feature | Description |
|---------|-------------|
| **Mutual credit** | One person's credit is another's debt; accounts sum to zero locally |
| **Recognition currency** | Value comes from what it represents, not scarcity |
| **Local-first** | Primarily exchanged within communities; interoperability through trust |
| **Expiring** | Hearts may have expiration to encourage circulation (design choice, not fixed) |
| **Sectoral** | Different "colors" for different types of work (care, ecological, etc.) |

**Event Kind: Heart Transaction (kind: 30090)**

```json
{
  "kind": 30090,
  "content": {
    "mycel_type": "hearts",
    "to": "<recipient_pubkey>",
    "amount": 5,
    "color": "care",  // care, ecological, education, repair, etc.
    "context": "constellation:<id>",
    "note": "facilitated recovery circle"
  },
  "tags": [
    ["p", "<recipient_pubkey>"],
    ["context", "constellation:<id>"],
    ["expiry", "31536000"]  // optional expiration
  ]
}
```

---

### 2.3 The Love Ledger: Local Accounting, Not Global Blockchain

#### 2.3.1 The Problem with Global Ledgers

- Blockchain requires global consensus, energy, and internet
- Central ledger requires trusted authority and creates surveillance risk
- Neither works offline
- Neither is appropriate for mutual credit

#### 2.3.2 The Solution: Local Accounting

Each node maintains its own ledger of Hearts sent and received. Ledgers are reconciled through trust, not consensus.

**Local Ledger Structure (SQLite):**

```sql
CREATE TABLE hearts_ledger (
  id INTEGER PRIMARY KEY,
  counterparty_pubkey TEXT NOT NULL,
  direction TEXT NOT NULL, -- 'sent' or 'received'
  amount INTEGER NOT NULL,
  color TEXT NOT NULL,
  context TEXT,
  timestamp INTEGER NOT NULL,
  signature TEXT NOT NULL
);

CREATE TABLE balance (
  counterparty_pubkey TEXT PRIMARY KEY,
  net_balance INTEGER NOT NULL,  -- positive = they owe me, negative = I owe them
  last_reconciled INTEGER
);
```

**How Reconciliation Works:**

1. Alice sends Bob 5 Hearts: Alice records -5 in her ledger (she owes Bob). Bob records +5 in his ledger (Bob is owed by Alice).
2. When they meet (online or offline), they compare ledgers.
3. If totals match, they sign a reconciliation event. Balances are zeroed or carried forward.
4. If totals don't match, they resolve through trust-weighted mediation.

**Reconciliation Event (kind: 30091):**

```json
{
  "kind": 30091,
  "content": {
    "mycel_type": "reconciliation",
    "with": "<peer_pubkey>",
    "alice_balance": -15,
    "bob_balance": 15,
    "new_alice_balance": -5,
    "new_bob_balance": 5,
    "settled": 10  // amount settled
  },
  "tags": [
    ["p", "<peer_pubkey>"]
  ]
}
```

**Why This Works:**
- No global consensus required
- Works offline (ledgers sync when peers meet)
- No surveillance (no central ledger to subpoena)
- Scales with trust: high-trust peers reconcile more frequently; low-trust peers reconcile before large transactions

---

### 2.4 Hearts Layers: AUBI Integration

#### 2.4.1 Layer 1: Universal Basic Income (AUBI)

**Requirement:** Unconditional survival resources for all. Decoupled from work.

**Mycel Implementation:**

- Layer 1 is **not** Hearts. Hearts are recognition currency, not survival currency.
- Layer 1 is the assurance that no one lacks food, shelter, or dignity. Mycel does not implement this directly—it coordinates the delivery of resources that are already assured through other mechanisms (BAZ-level guarantees, community mutual aid, etc.).

**What Mycel Provides:** A coordination layer for distributing AUBI resources locally—tracking who has received what, routing resources to where they are needed, verifying delivery.

**Event Kind: AUBI Distribution (kind: 30092)**

```json
{
  "kind": 30092,
  "content": {
    "mycel_type": "aubi_distribution",
    "to": "<recipient_pubkey>",
    "type": "food",  // food, shelter, healthcare, etc.
    "value": 100,  // local currency equivalent for accounting
    "source": "baz:stockholm"
  },
  "tags": [
    ["p", "<recipient_pubkey>"],
    ["source", "baz:stockholm"]
  ]
}
```

#### 2.4.2 Layer 2: Care Work (Hearts)

**Requirement:** Recognition for work that markets ignore—caregiving, community facilitation, recovery support, education, mediation.

**Mycel Implementation:** Hearts are issued through mutual credit when one community member recognizes another's contribution.

**Heart Colors:**

| Color | Purpose | Examples |
|-------|---------|----------|
| **care** | Direct care work | Childcare, eldercare, disability support, recovery facilitation |
| **ecological** | Ecosystem restoration | Reforestation, wetland restoration, cleanup |
| **education** | Teaching and mentoring | Skills sharing, tutoring, facilitation |
| **repair** | Fixing things | Tool repair, mending, maintenance |
| **coordination** | Making things happen | Event organizing, mediation, communication |
| **knowledge** | Sharing wisdom | Storytelling, traditional knowledge, research |

**Heart Issuance Constraints:**
- Hearts cannot be issued to oneself
- Hearts cannot be issued without a real interaction (verified through constellation context)
- Hearts can be issued in fractional amounts (0.1 Hearts)
- Hearts are not convertible to fiat currency within the system

#### 2.4.3 Layer 3: Ecological Restoration (Leaves)

**Requirement:** Recognition for work that regenerates ecosystems—carbon sequestration, biodiversity restoration, soil health.

**Mycel Implementation:** Leaves are a specialized Heart color with additional verification requirements.

**Leaf Verification:**

| Verification Level | Description |
|--------------------|-------------|
| **Self-attested** | User claims restoration work; visible only to trust network |
| **Peer-attested** | Another user verifies the work; higher trust weight |
| **BAZ-verified** | BAZ restoration council confirms; highest trust weight |

**Leaf Event (kind: 30093):**

```json
{
  "kind": 30093,
  "content": {
    "mycel_type": "leaves",
    "to": "<recipient_pubkey>",
    "amount": 10,
    "project": "mangrove_restoration_north_bay",
    "verification": "peer",
    "verifier": "<verifier_pubkey>"
  },
  "tags": [
    ["p", "<recipient_pubkey>"],
    ["verifier", "<verifier_pubkey>"]
  ]
}
```

---

### 2.5 Collective Accounts

**Requirement:** Recovery Hubs, BAZs, and other community organizations need collective accounts to receive and spend Hearts.

**Implementation:** Collective identities (defined in Pillar 1) can have Heart balances.

**Collective Heart Transaction (multisig):**

```json
{
  "kind": 30090,
  "content": {
    "mycel_type": "hearts",
    "to": "<recipient_pubkey>",
    "from": "<collective_pubkey>",
    "amount": 50,
    "color": "care",
    "signatures": ["<sig1>", "<sig2>", "<sig3>"]
  },
  "tags": [
    ["p", "<recipient_pubkey>"],
    ["p", "<collective_pubkey>"]
  ]
}
```

**Signature Requirement:** As defined in the collective identity event (e.g., 3 of 5 signatures required).

---

### 2.6 Trust-Weighted Economics

**Requirement:** Hearts should be harder to earn from low-trust peers; easier from high-trust peers.

**Implementation:** Heart value is trust-weighted locally.

**Trust Weight Calculation:**

```
effective_hearts_received = hearts_amount × (trust_score / 100)
```

Example:
- Alice sends Bob 10 Hearts
- Bob's trust score for Alice is 80
- Effective value: 8 Hearts

**What This Does:**
- Encourages building genuine relationships
- Reduces gaming through sock puppet accounts
- Makes sybil attacks economically pointless (bots have no trust)

---

### 2.7 Expiration and Circulation

**Requirement:** Hearts should circulate, not be hoarded.

**Options:**

| Option | Description | Trade-offs |
|--------|-------------|-----------|
| **No expiration** | Hearts accumulate indefinitely | May encourage hoarding |
| **Soft expiration** | Hearts expire after 1 year unless used | Encourages circulation; may feel punitive |
| **Demurrage** | Hearts slowly lose value over time | Encourages spending; complexity |
| **Community choice** | Each BAZ chooses expiration policy | Flexibility; fragmentation |

**Recommended:** Soft expiration with community override. Hearts expire after 1 year unless spent or re-issued by the sender. BAZs may set different policies for their internal circulation.

---

### 2.8 User Stories

**Story 1: Recovery Weaver Compensation**

> Maria is a Recovery Weaver. She facilitates a healing circle for five participants. After the circle, each participant sends her 5 Hearts (care color). The collective Recovery Hub account also sends her 20 Hearts as coordinator stipend. She now has Hearts to spend at the community kitchen.

**Story 2: Ecological Restoration Work**

> Jamal leads a mangrove restoration project. He coordinates 10 volunteers who plant 500 saplings. Each volunteer receives 10 Leaves (ecological color) from the BAZ restoration fund. The Leaves are BAZ-verified and can be exchanged for tools, food, or other goods within the community.

**Story 3: Mutual Credit in Action**

> A storm damages several homes. Neighbors coordinate through Mycel. One provides a chainsaw (needs: fuel), another provides fuel (needs: food), another provides meals. They use Hearts to track contributions. After the crisis, they reconcile ledgers. Some debts are settled; others are carried forward as community credit.

**Story 4: Heart-Based Learning**

> A retired carpenter offers a workshop on home repair. Five people attend. Each sends him 3 Hearts (education color). The workshop is recorded, and the video is shared through the local Learning Hub. The carpenter's Hearts are recognized in his Competency Passport.

---

### 2.9 Open Questions for This Pillar

| Question | Implication |
|----------|-------------|
| **Should Hearts be convertible to fiat?** | Convertibility would attract speculation, undermine mutual credit. Strong recommendation: Hearts are not convertible. Fiat is for survival; Hearts are for recognition. |
| **How to handle disputes?** | If someone claims they were not paid, mediation through trust-weighted arbitration. Escalate to BAZ-level dispute resolution if needed. |
| **How to prevent inflation?** | Hearts are not a currency; they are recognition. Inflation is not a problem because they are not a store of value. The problem is hoarding; expiration addresses this. |
| **How to integrate with existing fiat systems?** | AUBI Layer 1 is fiat (or fiat-equivalent). Mycel coordinates distribution but does not manage the fiat itself. Hearts are separate. |

---

## Next Steps

If this approach resonates, we can:

1. **Validate the heart color categories** — are these the right types? What's missing? (spiritual? ceremonial? cultural preservation?)
2. **Define the reconciliation protocol** in detail — how often should peers reconcile? What happens when ledgers disagree?
3. **Build the Hearts module** — local ledger, transaction events, reconciliation
4. **Test with a small community** — five people using Hearts to recognize each other's contributions

Shall we proceed to define the event schemas for Hearts, or refine this pillar further?

Björn:
What do you think of having Hearts just similar to likes, that can be sent without cost?
Or having a system without any Hearts? Simpler, more like the forest perhaps?

DeepSeek:
This is an excellent question. Let me think it through carefully.

---

## The Question: Do Hearts Add Value or Complexity?

You're asking something fundamental: does the economic layer actually serve the purpose, or does it complicate what should be simple?

Let me explore three paths:

---

### Option 1: Hearts as Recognition (Current Design)

Hearts are a mutual credit system. They have value (they can be spent) and they circulate.

**What this enables:**
- Compensation for care work that markets ignore
- Reciprocity tracking across time (I help you today; you help me next week)
- Community resource pooling (a Recovery Hub can accumulate Hearts to fund tools, food, etc.)
- Legible contribution records for things like Competency Passports

**What this costs:**
- Complexity: users must understand that Hearts are not money but also not meaningless
- Disputes: what happens when someone isn't paid?
- Hoarding: some people will accumulate Hearts and not spend them
- Mental overhead: tracking who owes what to whom

---

### Option 2: Hearts as "Likes" (No Cost)

Hearts become a simple acknowledgement, like a thumbs-up. Anyone can send them, no balance, no circulation.

**What this enables:**
- Instant, costless recognition
- No complexity: users don't need to understand anything
- No disputes: nothing is at stake

**What this costs:**
- No reciprocity tracking: a "like" doesn't create an obligation or a memory
- No compensation: care work is acknowledged but not rewarded
- Inflation: if Hearts cost nothing, they mean nothing
- No community resource pooling: you can't fund a Recovery Hub with likes

---

### Option 3: No Hearts at All (Just Coordination)

The forest doesn't need currency. Trees share resources through mycelium without accounting. The mycelium doesn't track who gave what to whom; it just routes where there is need.

**What this enables:**
- Pure simplicity: Mycel just helps people see each other, signal needs, coordinate
- Trust-based: you help because it's your neighbor, not because you'll get Hearts
- Focus on real relationships, not transactional ones

**What this costs:**
- No recognition for invisible work (caregiving, facilitation, etc.) that often goes unnoticed
- No way to track reciprocity across time without mental effort
- Harder to fund collective projects (no Hearts to pool)
- Less legible contribution records for things like Competency Passports

---

## A Deeper Reflection: What Does the Forest Teach?

You're right to invoke the forest. The forest doesn't have Hearts. But the forest also doesn't have care work that goes uncompensated because the market doesn't value it. The forest doesn't have people who need to prove their contributions for a Competency Passport. The forest doesn't have Recovery Weavers who need to eat while they facilitate healing circles.

The forest is a model for resilience, for organic topology, for trust without contracts. But it is not a model for a society that must transition from a system where people die without money.

The question is: does Hearts serve the transition, or is it carrying over the very transactional logic we're trying to leave behind?

---

## A Possible Middle Path: Recognition Without Accounting

What if Hearts are one-way? You can send them, they accumulate in a total "reputation" score, but they are not spent. They are not currency. They are simply a record that "this person has contributed."

**What this enables:**
- Recognition without complexity
- Legible contribution records for Competency Passports
- No disputes, no hoarding, no accounting
- Still can fund collective projects through other mechanisms (BAZ budgets, AUBI, etc.)

**What this costs:**
- No reciprocity tracking across time (I helped you; you owe me nothing)
- No medium of exchange for community resource pooling
- Still transactional in a way (people might accumulate reputation as status)

---

## My Honest Take

I lean toward **Option 3: No Hearts** for the first phase. Here's why:

1. **Mycel's purpose is coordination, not economics.** The frameworks describe economic systems. Mycel's job is to enable coordination. Let the frameworks handle the economics.

2. **Hearts are complicated.** Even in the simplified version, Hearts require users to understand a system that doesn't exist anywhere else. This is a cognitive burden.

3. **Hearts can wait.** AUBI and the Love Ledger are aspirational. They may never exist in the form the frameworks describe. But coordination is needed now. Mycel should do one thing well: help people coordinate.

4. **The forest model is powerful.** If Mycel works purely on trust—no points, no scores, no currency—it models the world we want to build. It says: you help because you're in relationship, not because you're earning something.

5. **Hearts can be added later.** If the community wants recognition, a simple "thank you" event (like a like) is easy to add. If they want mutual credit, that can come in Phase 2 or 3. Start simple.

---

## Revised Pillar 2: The Economic Engine (Simplified)

If we go with Option 3, Pillar 2 becomes much simpler:

### 2.1 What Mycel Does

- **Coordinates resource distribution:** Needs and offers are visible. People can see who needs food, who has tools, who can help.
- **Tracks contributions** (if users want): A simple "thank you" event that does nothing except acknowledge. No value, no circulation, no ledger.
- **Integrates with AUBI** only insofar as AUBI resources (food, shelter, etc.) are distributed. Mycel helps route them; it doesn't manage them.

### 2.2 What Mycel Does Not Do

- No Hearts as currency
- No mutual credit
- No ledgers
- No reconciliation
- No balances

### 2.3 User Story (Simplified)

> Maria facilitates a healing circle. Afterward, participants send her "thank you" acknowledgements. These appear in her profile as a simple count. No one owes anyone anything. Maria helped because she is a Recovery Weaver; her compensation comes through AUBI or BAZ budget. Mycel just helped coordinate.

---

## A Question Back to You

What is Mycel's primary job?

If it is **coordination infrastructure**, then economics is a separate layer. Mycel helps people see each other, signal needs, coordinate responses. How they exchange value—whether through Hearts, mutual aid, AUBI, or direct reciprocity—is their business, not Mycel's.

If it is also **economic infrastructure**, then Hearts are necessary, with all their complexity.

Which feels more aligned with the forest? The forest coordinates resources without accounting. It doesn't track who gave what to whom. It just routes where there is need.

What do you think?
