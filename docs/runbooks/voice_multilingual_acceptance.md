# Voice Multilingual Acceptance Checklist

**Date:** 2026-02-24
**Owner:** Founder
**Status:** Pending acceptance

## 17-Point Checklist

1. [ ] **DE agent ID correct:** `agent_d7dfe45ab444e1370e836c3e0f`
2. [ ] **INTL agent ID correct:** `agent_fb4b956eec31db9c591880fdeb`
3. [ ] **Execution Mode = Rigid:** `flex_mode: false` on BOTH flows (Flex Mode OFF in Dashboard)
4. [ ] **Language Gate exists in DE flow:** branch node (not conversation), routes German → Intake, else → Language Transfer
5. [ ] **Language Transfer node is swap-only:** only tool = `swap_to_intl_agent` to INTL agent ID
6. [ ] **DE nodes do not end_call for language:** no `swap_to_intl_agent` tool on Intake/Closing/OOS; language edges route structurally
7. [ ] **INTL prompt: FOLLOW MODE:** "no language lock; follow caller language; can repeat in requested language; never refuse switch"
8. [ ] **Dashboard: Publish DE agent** — note version: _____ time: _____
9. [ ] **Dashboard: Publish INTL agent** — note version: _____ time: _____
10. [ ] **Proof call EN-start:** say "English." → verify immediate transfer (agent_transfer within 5s)
11. [ ] **Mid-call switch:** say "In French please." → verify agent switches to French
12. [ ] **Switch back:** say "German/Deutsch." → verify agent switches back (no refusal)
13. [ ] **Run Spur 1+2:** `node scripts/run_chain.mjs voice --id <call_id> --with-audio` → 0 criticals in trigger/transfer
14. [ ] **Reprompt timing:** agent does NOT chain multiple questions without user input; `skip_response_edge` removed from Intake; `responsiveness: 0.9`
15. [ ] **Back-transfer DE:** on INTL agent, say "Deutsch bitte" → verify transfer back to DE agent (swap_to_de_agent fires, caller hears Susi's voice)
16. [ ] **Natural latency:** typical response lag < ~2s after user turn (no 6–10s waits); `responsiveness: 0.9` on both agents
17. [ ] **Back-transfer continuity:** switching to German does NOT restart intake; DE agent continues with preserved context (no full re-greeting)
18. [ ] **PLZ readback fluency:** PLZ confirmation is spoken as a fluent number (e.g., "acht-neun-vier-zwei"), not stuttered with long pauses; caller can understand without prior knowledge of the PLZ

## Evidence Archive

| Field | Value |
|-------|-------|
| Proof call ID | |
| agent_version (from raw JSON) | |
| Transfer timestamp | |
| FR switch confirmed | |
| DE switch-back confirmed | |
| Spur 1+2 report path | |
| Acceptance date | |

## Key Learnings

- **Retell API publish does not reliably publish conversation flows.** Always publish from Dashboard.
- **flex_mode=true bypasses the entire node graph.** Must be OFF for conversation flows to work.
- **end_call is a built-in tool on all conversation nodes.** Use branch nodes for routing to eliminate LLM tool choice.
- **STICKY language mode causes language lock.** Use FOLLOW mode instead.
- **skip_response_edge with "Skip response" causes rapid-fire loop:** Intake→Logic Split→Intake cycles without user input. Fix: remove skip_response_edge from Intake, add routing edges directly.
- **skip_response_edge.prompt is hardcoded:** Retell API only allows `"Skip response"` — custom conditions rejected with 400.
- **responsiveness=0.3 causes 6s lag; 0.9 is natural.** Only use low values for specific no-input scenarios, not globally.
- **Back-transfer uses symmetric swap:** INTL has `swap_to_de_agent` targeting DE agent ID, mirroring DE's `swap_to_intl_agent`.
- **DE Welcome must be prompt-based (not static_text) for context-aware re-entry.** Static text always plays the full greeting, even on back-transfer.
