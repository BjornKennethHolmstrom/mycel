I agree. Coordination infrastructure first. Economics can be added later if it proves necessary. Mycel's job is to help people see each other, signal needs, coordinate responses. That's already enough.

Let's move to **Pillar 3: Sense-Making & Reality (The Synoptic Protocol)**.

---

# GGF-to-Mycel Translation Matrix

## Pillar 3: Sense-Making & Reality (The Synoptic Protocol)

### 3.1 Core Requirements from the Frameworks

| Framework | Requirement |
|-----------|-------------|
| **Synoptic Protocol** | Universal Right to Reality; protection from algorithmic amplification of falsehoods; sense-making over engagement; epistemic integrity |
| **Cairn Protocol** | Recovery spaces need trusted information; participants must distinguish useful resources from harmful ones |
| **Capacity Engine** | Learning materials must be verifiable; competency requires accurate information |
| **Synoptic Protocol** | Public Epistemic Institutions need channels to distribute verified information |
| **Indigenous Framework** | Traditional knowledge must be protected from misrepresentation; context matters |
| **Peace & Conflict Framework** | Dialogue requires shared reality; reconciliation requires truth |

**The Core Insight:** The problem is not false information. The problem is that platforms profit from amplifying false information. Mycel does not need to moderate content. It needs to not profit from engagement. It needs to make sense-making the default, not outrage.

---

### 3.2 What Mycel Is Not

| Feature | Mycel Does Not Do | Rationale |
|---------|-------------------|-----------|
| **Content moderation** | No central moderation | Moderation is a form of control; Mycel is infrastructure, not a publisher |
| **Algorithmic feeds** | No engagement-optimized feeds | Algorithms that maximize engagement optimize for outrage |
| **Viral amplification** | No "trending" or "for you" | Viral dynamics reward falsehood |
| **Content ranking** | No universal ranking | What is true for you depends on context |

---

### 3.3 What Mycel Does Instead

#### 3.3.1 Ambient Sense-Making

The ambient map shows not just presence and resources, but also what people are paying attention to—gently.

**Event Kind: Attention Signal (kind: 30100)**

```json
{
  "kind": 30100,
  "content": {
    "mycel_type": "attention",
    "focus": "storm_prep",
    "intensity": 0.7,  // 0-1, how much attention this is getting
    "context": "constellation:storm_response"
  },
  "tags": [
    ["t", "storm_prep"],
    ["context", "constellation:storm_response"]
  ]
}
```

**How It Works:**
- Users can signal what they are paying attention to (coarse topics)
- The map shows clusters of attention—where focus is gathering
- No ranking, no trending. Just a gentle gradient: more people paying attention to storm prep makes that topic slightly more visible

#### 3.3.2 Trust-Weighted Information

Information is not true or false universally. It is true or false in relationship to those you trust.

**Implementation:**
- No global truth score
- Information from high-trust peers is more visible
- Information from unknown sources is visible only if you explicitly choose to see it

**User Control:**
- "Show me only what my trust network is paying attention to"
- "Show me what my Recovery Hub has verified"
- "Show me everything" (for those who want it)

---

### 3.4 Sense-Making, Not Fact-Checking

**The Synoptic Protocol's Insight:** Traditional fact-checking often triggers the backfire effect—people double down when their beliefs are challenged.

**Mycel's Approach:** Provide context, not corrections.

**Event Kind: Context (kind: 30101)**

```json
{
  "kind": 30101,
  "content": {
    "mycel_type": "context",
    "about": "<event_id or topic>",
    "context_type": "background",  // background, perspective, source, verification
    "perspective": "participant"   // participant, witness, expert, elder
  },
  "tags": [
    ["e", "<event_id>"],
    ["p", "<source_pubkey>"]
  ]
}
```

**How It Works:**

Instead of "This is false," a context event provides:
- **Background:** "Here's what we know about this topic"
- **Perspective:** "Here's how someone directly affected sees it"
- **Source:** "Here's where this information came from"
- **Verification:** "Here's what independent sources say"

The user sees multiple contexts, multiple perspectives. They make their own judgment.

---

### 3.5 The Right to Reality: Epistemic Circuit Breakers

**Requirement:** When false information is causing harm, there must be a way to slow its spread without censorship.

**Mycel's Mechanism:** Epistemic circuit breakers at the constellation level.

**Event Kind: Circuit Breaker (kind: 30102)**

```json
{
  "kind": 30102,
  "content": {
    "mycel_type": "circuit_breaker",
    "about": "<topic>",
    "reason": "imminent_harm",
    "duration": 3600  // seconds
  },
  "tags": [
    ["t", "<topic>"],
    ["p", "<initiator_pubkey>"]
  ]
}
```

**How It Works:**

1. A trusted user (Recovery Weaver, BAZ council member, etc.) can propose a circuit breaker on a specific topic
2. If enough high-trust peers agree, the topic is temporarily slowed—not removed
3. "Slowed" means: the topic is still visible, but requires an extra click to see. It does not appear in ambient attention gradients.
4. After the duration, the circuit breaker lifts automatically

**Safeguards:**
- Circuit breakers are public; anyone can see who initiated
- Abuse results in trust score reduction
- Multiple circuit breakers on the same topic require escalation to BAZ-level review

---

### 3.6 The Attention Economy: Anti-Addiction Design

**Requirement:** Mycel must not extract attention for profit. It must be quiet by default.

**Design Principles:**

| Principle | Implementation |
|-----------|----------------|
| **No notifications** | No push notifications except direct messages (user-configurable) |
| **No infinite scroll** | Content has natural boundaries; the map is bounded |
| **No engagement metrics** | No "likes," no "views," no "trending" |
| **No streaks** | No gamification that creates compulsive checking |
| **Ambient by default** | The map shows presence; nothing demands attention |
| **Expiring presence** | Presence events expire; the network rests when nothing is happening |

**The Goal:** A tool people pick up when they need it and put down without difficulty. Like a good shovel.

---

### 3.7 Trusted Sources: Public Epistemic Institutions

**Requirement:** Verified information from trusted sources (Public Epistemic Institutions, Recovery Hubs, BAZ councils) should be distinguishable.

**Implementation:** Verified badges through collective identities.

**Event Kind: Verification (kind: 30103)**

```json
{
  "kind": 30103,
  "content": {
    "mycel_type": "verification",
    "for": "<event_id>",
    "status": "verified",
    "by": "<collective_pubkey>"
  },
  "tags": [
    ["e", "<event_id>"],
    ["p", "<collective_pubkey>"]
  ]
}
```

**How It Works:**
- Public Epistemic Institutions (collective identities) can issue verifications
- Verified events appear with a subtle indicator
- Users can choose to filter for verified content only
- Verification is not censorship; unverified content remains visible

---

### 3.8 Indigenous Knowledge Protection

**Requirement:** Traditional knowledge must be protected from misrepresentation and extraction.

**Implementation:** Red Lines at the constellation level.

**Event Kind: Red Line (kind: 30104)**

```json
{
  "kind": 30104,
  "content": {
    "mycel_type": "red_line",
    "knowledge_domain": "sacred_site_location",
    "scope": "constellation",
    "by": "<collective_pubkey>"  // Indigenous council
  }
}
```

**How It Works:**
- Indigenous councils (collective identities) can declare certain knowledge domains Red Lined
- Within that constellation, events about those topics are not propagated
- Users outside the constellation may never see them
- Red Lines are absolute within the community that declared them

---

### 3.9 User Stories

**Story 1: Storm Rumors**

> A rumor spreads that the evacuation center is closed. Several people see it. A Recovery Weaver notices and issues a context event: "Here's the official source from the BAZ council—the center is open." The context appears alongside the rumor. Users see both and choose.

**Story 2: Attention Gradient**

> After the storm, many people are paying attention to "water safety." The ambient map shows a gentle cluster around that topic. A new user opens Mycel and sees that water safety is where attention is gathering. They join the conversation. No algorithm told them; they saw where their neighbors were.

**Story 3: Circuit Breaker**

> A false claim about looting is spreading and causing panic. Three Recovery Weavers agree to issue a circuit breaker. For 24 hours, the topic is slowed—visible but requiring an extra click. The panic subsides. The circuit breaker lifts.

**Story 4: Verified Information**

> The BAZ council issues a verification on a water safety guide. The guide now has a subtle indicator. Users who choose to filter for verified content see it prominently. Others still see unverified content if they want it.

---

### 3.10 Open Questions for This Pillar

| Question | Implication |
|----------|-------------|
| **How many peers are needed to trigger a circuit breaker?** | Too few: abuse risk. Too many: too slow. Suggest: 3 high-trust peers (trust_score > 80) or 1 collective identity. |
| **Should users be able to filter out all unverified content?** | This creates epistemic bubbles. But it's also user choice. Suggest: yes, but with a warning about bubble risk. |
| **How to handle conflicting verifications?** | Two Public Epistemic Institutions may disagree. Mycel shows both. Users choose. |
| **What about outright dangerous content (e.g., instructions for violence)?** | This is a hard question. Mycel's approach: circuit breakers slow spread; Red Lines prevent propagation within communities that reject it; but Mycel does not delete. Deleting is a form of control that contradicts decentralization. |

---

## Next Steps

If this approach resonates, we can:

1. **Validate the circuit breaker mechanism** — is three peers the right threshold? Should it be trust-weighted?
2. **Define the context event schema** in more detail — what are all the context types? How do they relate?
3. **Build the ambient attention layer** — topic clustering, gentle gradients
4. **Test with a small community** — how do people use context events? Do they prefer them to "fact-checking"?

Shall we proceed to define the event schemas for sense-making, or refine this pillar further?
