# Chatbot Product Spec (Implementation-Ready)

## 1) Product Summary
Build a legal-assistant chatbot for Kamal & Associates that can triage legal issues, route users to the right service/attorney, capture leads, schedule consultations, support bilingual chat (English/Bangla), and hand off to WhatsApp/human staff when needed.

This spec is designed to evolve the current browser-only chatbot (`chatbot.js`) into a production system with:
- deterministic flow logic for high-trust legal interactions,
- retrieval-backed answers for FAQ/knowledge,
- structured intake + booking + follow-up,
- Supabase-backed persistence and analytics.

## 2) Goals and Non-Goals
### Goals
- Increase qualified consultation bookings.
- Reduce repetitive staff workload (FAQs, office info, basic process explanations).
- Improve lead quality with structured case intake.
- Provide safe first-level legal guidance with clear disclaimers and escalation.

### Non-Goals
- Giving final legal advice or legal representation over chat.
- Automated drafting/submission of legal filings without attorney review.
- Replacing attorney judgment in complex matters.

## 3) Target Metrics (First 90 Days)
- Booking conversion rate: >= 8% of unique chatbot visitors.
- Qualified lead rate: >= 60% of collected leads have phone + issue + case type.
- First response latency: < 1.5s median.
- Human escalation correctness: >= 90% for emergency/high-risk intents.
- FAQ containment: >= 45% resolved without human handoff.

## 4) User Roles
- Visitor: New site visitor seeking legal help.
- Returning visitor: Existing lead/client with known preferences.
- Intake coordinator: Reviews leads and follow-ups.
- Attorney: Reviews structured intake and recommendations.
- Admin: Maintains knowledge base, FAQ, and rules.

## 5) Feature Scope Mapping (Your 26 Items)
### MVP (Phase 1)
1. Instant Legal Guidance (first-level triage)
2. Legal Service Navigator
3. Consultation Booking Assistant
4. Legal FAQ Assistant
8. Office Information Assistant
10. Emergency Legal Help
11. Lead Generation
12. Attorney Recommendation (rule-based)
13. Smart Case Intake System (core fields)
19. WhatsApp Integration
25. Appointment Reminder System
26. Knowledge Base Search (basic FAQ/blog retrieval)

### Phase 2
5. Case Type Evaluation (scored)
6. Document Checklist Generator (dynamic)
7. Multilingual Support (full parity + quality layer)
9. Blog & Legal Knowledge Guide
15. Legal Process Explainer
16. Document Upload Assistant (server-backed)
17. AI Legal Glossary
20. Location-Based Legal Help
22. Scam/Fraud Awareness
23. Smart Follow-Up System

### Phase 3
14. Court Information Assistant (jurisdiction-aware)
18. Smart Recommendations (behavior + intent model)
21. Client Education Mode
24. Personalized Visitor Experience

## 6) System Architecture
## 6.1 Current State
- Frontend widget in `chatbot.js` with localStorage state and rule-based intents.
- No server persistence for chat sessions/leads/bookings/files.

## 6.2 Target State (MVP)
- Frontend: existing widget + API client.
- Backend: Supabase (Postgres + Storage + Edge Functions).
- Optional AI layer: LLM gateway for generated explanations, with policy + retrieval guardrails.
- Channels: Website chat + WhatsApp handoff link; later bidirectional WhatsApp API.

## 6.3 Component Diagram (logical)
1. Chat UI (web widget)
2. Conversation Orchestrator (Edge Function)
3. Intent Router (rules first, AI fallback)
4. Knowledge Retriever (FAQ/blog/glossary docs)
5. Booking Service
6. Lead/Intake Service
7. Notification Service (email/SMS/WhatsApp reminders)
8. Analytics/Event Pipeline

## 7) Conversation Design
Use one consistent response format:
1. Acknowledge user message.
2. Ask at most one clarifying question if required.
3. Give short guidance with disclaimer when legal content is involved.
4. Offer action buttons (book, call, WhatsApp, view service page, talk to attorney).

## 7.1 Global Safety Rules
- Always include: "General legal information, not legal advice."
- Emergency detection keywords: arrest, police custody, violence, immediate deadline, warrant.
- On emergency detection: bypass normal flow and show call + WhatsApp + office phone immediately.
- If confidence low: ask clarifying question or escalate to human.

## 7.2 Core Intents (MVP)
- legal_guidance
- service_navigation
- faq
- booking
- intake
- attorney_recommendation
- office_info
- emergency
- whatsapp_handoff
- knowledge_search

## 7.3 Conversation Flows (State Machines)
### Flow A: Instant Legal Guidance + Service Navigator
Entry: free-text legal question
1. Detect domain (family/criminal/corporate/property/immigration/other).
2. Ask one clarifier: jurisdiction/city or issue stage.
3. Return first-level guidance + related service.
4. CTA: Book consultation | Talk on WhatsApp | See practice area.
Exit: booking_started OR handoff OR resolved.

### Flow B: Consultation Booking Assistant
Entry: quick action or intent=booking
Required fields:
- full_name
- phone
- email (optional if phone verified)
- preferred_date
- preferred_time_window
- issue_summary
1. Confirm slot availability.
2. Confirm booking.
3. Send reminder schedule (24h + 2h).
4. Push lead to CRM queue.
Exit: booking_confirmed.

### Flow C: Smart Case Intake System
Entry: quick action or post-guidance CTA
Required fields:
- case_type
- city_district
- opposing_party_type
- incident_date
- urgency_level
- documents_available (yes/no)
- short_facts
Output:
- intake completeness score
- recommended attorney category
- recommended next action
Exit: intake_submitted.

### Flow D: FAQ + Knowledge Base Search
Entry: faq intent or user asks "how/what"
1. Retrieve top 3 snippets from FAQ/blog/knowledge docs.
2. Answer with source titles.
3. Offer "Need attorney review?" CTA.
Exit: resolved or escalated.

### Flow E: Emergency Legal Help
Entry: emergency intent
1. Show emergency banner + phone + WhatsApp + office direction.
2. Ask one question: "Are you or someone currently in custody?"
3. Create high-priority lead with alert flag.
Exit: emergency_escalated.

### Flow F: Attorney Recommendation
Entry: based on case_type/service
Rule-based scoring:
- practice match (40%)
- language match (20%)
- urgency availability (20%)
- location convenience (10%)
- workload balancing (10%)
Return top 2 attorneys with reason tags.

### Flow G: Office Information + Location Help
Entry: office/location intent
1. Return office hours, map, phone, email.
2. Ask for district for nearest branch recommendation.
3. Provide route/map link.

### Flow H: Follow-up and Reminder
Entry: incomplete booking/intake OR confirmed booking
1. Follow-up at T+30m, T+24h (if no conversion).
2. Reminder at T-24h and T-2h before appointment.
3. One-click reschedule/cancel links.

## 8) Data Model (Supabase/Postgres)
Use UUID keys and soft-delete fields where relevant.

## 8.1 Tables
### visitors
- id uuid pk
- first_seen_at timestamptz
- last_seen_at timestamptz
- preferred_language text check in ('en','bn')
- source_page text
- device_fingerprint text
- consent_marketing boolean default false

### conversations
- id uuid pk
- visitor_id uuid fk -> visitors.id
- channel text default 'web'
- status text check in ('open','closed','escalated')
- started_at timestamptz
- ended_at timestamptz null
- current_intent text
- current_flow text

### messages
- id uuid pk
- conversation_id uuid fk -> conversations.id
- sender text check in ('user','bot','agent','system')
- message_type text check in ('text','button','link','file','system')
- content text
- metadata jsonb
- created_at timestamptz

### leads
- id uuid pk
- visitor_id uuid fk -> visitors.id
- conversation_id uuid fk -> conversations.id
- lead_status text check in ('new','qualified','contacted','booked','closed')
- name text
- phone text
- email text
- case_type text
- urgency_level text check in ('low','medium','high','emergency')
- issue_summary text
- city_district text
- source text default 'chatbot'
- created_at timestamptz
- updated_at timestamptz

### appointments
- id uuid pk
- lead_id uuid fk -> leads.id
- attorney_id uuid fk -> attorneys.id null
- scheduled_at timestamptz
- timezone text default 'Asia/Dhaka'
- status text check in ('pending','confirmed','completed','cancelled','rescheduled')
- meeting_mode text check in ('phone','video','in_person')
- notes text
- created_at timestamptz

### appointment_reminders
- id uuid pk
- appointment_id uuid fk -> appointments.id
- reminder_type text check in ('24h','2h','custom')
- channel text check in ('email','sms','whatsapp')
- scheduled_for timestamptz
- sent_at timestamptz null
- status text check in ('queued','sent','failed')

### intakes
- id uuid pk
- lead_id uuid fk -> leads.id
- case_type text
- incident_date date null
- opposing_party_type text null
- documents_available boolean
- facts text
- intake_score int
- recommended_service text
- recommended_attorney_id uuid null
- created_at timestamptz

### attorneys
- id uuid pk
- name text
- slug text unique
- practice_areas text[]
- languages text[]
- is_active boolean
- availability_status text
- office_location text
- priority_weight int default 50

### knowledge_documents
- id uuid pk
- doc_type text check in ('faq','blog','glossary','process','court_info')
- title text
- slug text unique
- language text check in ('en','bn')
- content_markdown text
- tags text[]
- source_url text
- is_published boolean
- updated_at timestamptz

### chat_events
- id uuid pk
- visitor_id uuid
- conversation_id uuid
- event_name text
- event_payload jsonb
- created_at timestamptz

## 8.2 Minimal SQL Starter (MVP)
```sql
create extension if not exists pgcrypto;

create table if not exists visitors (
  id uuid primary key default gen_random_uuid(),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  preferred_language text not null default 'en' check (preferred_language in ('en','bn')),
  source_page text,
  device_fingerprint text,
  consent_marketing boolean not null default false
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references visitors(id),
  channel text not null default 'web',
  status text not null default 'open' check (status in ('open','closed','escalated')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  current_intent text,
  current_flow text
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender text not null check (sender in ('user','bot','agent','system')),
  message_type text not null default 'text' check (message_type in ('text','button','link','file','system')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references visitors(id),
  conversation_id uuid references conversations(id),
  lead_status text not null default 'new' check (lead_status in ('new','qualified','contacted','booked','closed')),
  name text,
  phone text,
  email text,
  case_type text,
  urgency_level text not null default 'low' check (urgency_level in ('low','medium','high','emergency')),
  issue_summary text,
  city_district text,
  source text not null default 'chatbot',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 9) API Contracts (Edge Functions)
All responses should include:
- request_id
- status
- data
- warnings[]

### POST /api/chat/session/start
Input:
- visitor_id (optional)
- language
- source_page
Output:
- visitor_id
- conversation_id
- welcome_message
- quick_actions[]

### POST /api/chat/message
Input:
- conversation_id
- message
- language
- context (current_flow, prior_slots)
Output:
- intent
- confidence
- reply_text
- buttons[]
- next_flow
- slot_prompts[]
- escalation_required boolean

### POST /api/leads/upsert
Input:
- conversation_id
- name/phone/email
- case_type
- issue_summary
- urgency
Output:
- lead_id
- qualification_score

### POST /api/intake/submit
Input: intake fields
Output:
- intake_id
- intake_score
- recommended_attorneys[]

### GET /api/appointments/slots?date=YYYY-MM-DD
Output: available slots

### POST /api/appointments/book
Input:
- lead_id
- slot
- mode
Output:
- appointment_id
- confirmation_message

### POST /api/reminders/schedule
Input:
- appointment_id
- channel_preferences
Output:
- queued_count

### GET /api/knowledge/search?q=...
Output:
- results[] {title, snippet, url, score, doc_type}

## 10) Intent + Slot Schema
Use deterministic extraction first, then AI fallback.

### Intent payload
- intent_name
- confidence (0-1)
- entities {}
- urgency_level
- requires_human boolean

### Slots by flow
- booking: name, phone, email, issue_summary, date, time_window
- intake: case_type, city_district, incident_date, facts, docs_available
- recommendation: language_pref, location_pref, urgency

## 11) Knowledge Base Design (MVP)
### Sources
- Existing FAQ list in chatbot config.
- Blog anchors from blog page.
- Practice area summaries.
- Glossary terms.

### Indexing strategy
- Basic full-text search in Postgres for MVP.
- Add semantic embeddings in Phase 2.

### Answer policy
- Return concise answer + 1 to 3 sources.
- If no good source, state uncertainty and suggest attorney consult.

## 12) WhatsApp Integration Plan
### MVP
- Click-to-WhatsApp with prefilled context and lead ID.
- Format: `https://wa.me/<number>?text=<encoded>`

### Phase 2
- WhatsApp Business API webhook for two-way sync.
- Mirror messages into `messages` table.

## 13) Document Upload Assistant Plan
### MVP
- UI guidance only + accepted formats + checklist suggestion.

### Phase 2
- Upload to Supabase Storage bucket `client-documents`.
- Virus scan hook + file type validation + max size checks.
- Link uploaded file metadata to lead/intake.

## 14) Analytics Event Taxonomy
Track these events at minimum:
- chat_opened
- first_message_sent
- intent_detected
- faq_answered
- service_navigated
- lead_captured
- booking_started
- booking_completed
- emergency_triggered
- whatsapp_clicked
- followup_sent
- reminder_sent

KPIs derived from events:
- funnel: open -> first message -> lead -> booking
- average messages to conversion
- top intents by conversion

## 15) Security, Privacy, Compliance
- Collect explicit consent before storing sensitive details.
- PII encryption at rest (DB-level + transport TLS).
- Limit retention for chat logs (e.g., 180 days unless client relationship).
- Role-based access for staff dashboards.
- Add audit logs for lead updates and appointment changes.
- Strict disclaimer in every legal guidance answer block.

## 16) UX Requirements
- Max 2 sentence bot responses before action buttons.
- Show typing state for >= 300ms for natural pacing.
- One primary CTA per message to reduce confusion.
- Preserve language choice across sessions.
- Mobile-first: keep bubble and window controls thumb-friendly.

## 17) MVP Backlog (Implementation Order)
Each item includes clear deliverable + acceptance criteria.

### Sprint 1: Foundation (Week 1)
1. Create Supabase tables: visitors, conversations, messages, leads.
   - AC: migrations run successfully on dev.
2. Add chat session API (`session/start`, `message` stub with rule router).
   - AC: chat can start a server-backed conversation.
3. Wire frontend widget to backend APIs behind feature flag.
   - AC: messages persist in DB when flag enabled.
4. Add event logging endpoint and basic dashboard query.
   - AC: `chat_opened` and `first_message_sent` visible.

### Sprint 2: Core Value (Week 2)
5. Implement intents: legal_guidance, service_navigation, faq, office_info, emergency.
   - AC: >= 80% of test prompts routed correctly.
6. Implement knowledge search from FAQ/blog docs.
   - AC: response returns source links.
7. Add lead capture panel and `/leads/upsert`.
   - AC: leads saved with name/phone/issue.
8. Add attorney recommendation (rule-based).
   - AC: top 2 recommendations shown with reason tags.

### Sprint 3: Conversion (Week 3)
9. Implement booking slots API + booking confirmation.
   - AC: appointment record created and linked to lead.
10. Implement reminder scheduler (24h/2h).
   - AC: reminder jobs created for confirmed appointments.
11. Implement smart intake form flow.
   - AC: intake score calculated and saved.
12. Implement emergency priority routing.
   - AC: emergency lead marked and surfaced in priority queue.

### Sprint 4: Polish + Launch (Week 4)
13. Bilingual parity pass (EN/BN content audit).
   - AC: all MVP intents support both languages.
14. Add WhatsApp context handoff with lead ID.
   - AC: generated WhatsApp message includes conversation context.
15. Add guardrails + disclaimer enforcement middleware.
   - AC: all legal responses include disclaimer token.
16. QA + analytics validation + launch checklist.
   - AC: production readiness checklist complete.

## 18) Engineering Tasks You Can Start Today
1. Create migration files for schema in section 8.
2. Build Edge Function: `/api/chat/session/start`.
3. Build Edge Function: `/api/chat/message` with deterministic router from current `smartReply` logic.
4. Replace localStorage-only persistence with API persistence fallback to localStorage on failure.
5. Add `lead_id` to WhatsApp link generation.
6. Add reminder queue table and scheduler stub.
7. Add analytics logging helper in frontend and backend.

## 19) Definition of Done (MVP)
- Visitor can ask legal question and get safe first-level guidance.
- Visitor can be routed to relevant service + attorney recommendation.
- Visitor can complete booking end-to-end.
- Lead/intake/appointment data is persisted and queryable.
- Emergency intents escalate immediately.
- EN/BN language switching works across all MVP flows.
- Basic analytics dashboard shows conversion funnel.

## 20) Test Plan (Minimum)
### Functional
- 50 intent test prompts (EN/BN).
- End-to-end booking from first message to reminder creation.
- Emergency trigger path for 10 urgent scenarios.

### Data
- Verify all flow steps write to conversations/messages/leads.
- Verify no orphan appointment without lead.

### UX
- Mobile viewport (360x800) flow completion.
- Retry behavior when API fails.

### Security
- PII fields masked in logs.
- CORS and auth checks on all write endpoints.

## 21) Risks and Mitigations
- Risk: Hallucinated legal information.
  - Mitigation: retrieval-first answers + disclaimer + low-confidence fallback.
- Risk: Poor bilingual quality.
  - Mitigation: human-reviewed EN/BN response library for top intents.
- Risk: Staff overload from low-quality leads.
  - Mitigation: mandatory intake fields + qualification score.
- Risk: Drop-off in long flows.
  - Mitigation: progressive profiling and one-question-at-a-time flow.

## 22) Immediate Next-Step Checklist (Day 1-2)
1. Stand up Supabase project and apply migrations.
2. Implement `/session/start` and `/message` endpoints.
3. Connect current `chatbot.js` to endpoints with graceful fallback.
4. Seed `knowledge_documents`, `attorneys`, and FAQ records.
5. Validate 10 real user journeys manually.

---
Owner: Product + Engineering
Last updated: 2026-03-11
Status: Ready for implementation
