This is the pillar where I'd push back the hardest.

**The core insight is right:** no algorithmic amplification, no engagement optimization, quiet by default. That alone handles most of the problem, and DeepSeek says it well. The anti-addiction design principles — no notifications, no infinite scroll, no streaks, expiring presence — are excellent and should be baked into Phase 0.

**But almost everything else here is premature architecture for problems that don't exist yet at 5-50 users.**

Circuit breakers, attention signals, context events, verification badges, Red Lines, adversarial UI structuring, Trust Bridges — this is designing a content moderation system for a network that doesn't have content. Mycel isn't a publishing platform. It's a coordination substrate. At Phase 0 scale, if someone spreads a false rumor about the evacuation center, you send a message in the constellation saying "no, it's open." That's it. You don't need an event kind for that.

Gemini's refinements make this worse, not better. The trust vector for epistemic integrity (which we already agreed to defer), adversarial UI structuring with side-by-side claims, Trust Bridge visualizations — this is building a sophisticated newsroom interface for a tool that's supposed to feel like a good shovel.

**What Phase 0 actually needs from this pillar:**

- No algorithmic feed. The ambient map *is* the interface.
- No engagement metrics. No likes, no view counts, no trending.
- Trust-weighted visibility (which we already have from Pillar 1 — high-trust peers' signals are more prominent).
- Quiet notifications. DMs only, user-configurable.
- Expiring events. Stale information fades.

That's five design principles, not five new event kinds. The sense-making problem at 5-50 users is solved by the fact that you know these people. You already have context. You can ask them directly.

The deeper issue: both DeepSeek and Gemini are treating Mycel as if it will face Twitter-scale information warfare. It won't — not in Phase 0, probably not in Phase 1. If Mycel ever reaches a scale where circuit breakers and epistemic institutions matter, the community using it will have real experience to inform how those mechanisms should work. Designing them now, from theory, almost guarantees getting them wrong.

My recommendation: save this entire document as "future considerations for sense-making at scale." For the build spec, the sense-making pillar is just the anti-addiction design principles list. One paragraph, not seven event schemas.

What's Pillar 4?
