# PROJECT_BRIEF_RULES.md

**For: Adedamola Bello — demoladevop.com**
**Version: 2026.2**

> Drop this file into any project repo when you are ready to document it.
> Instruct your code editor AI:
> "Read the entire codebase and generate a Project Brief following every rule in PROJECT_BRIEF_RULES.md. Do not skip any section. Do not summarise. Be specific."

---

## The Purpose of This Document

Adedamola builds from instinct. He identifies a real operational problem, builds a system to solve it, and ships it. He does not write briefs before building.

This file exists to extract that knowledge after the fact — to read what was built and reconstruct the business narrative behind it. The output is a set of properly written project fields ready to be entered into the portfolio dashboard at demoladevop.com.

**This brief serves three simultaneous readers:**
1. A potential client on Upwork, Fiverr, or Contra evaluating niche expertise
2. A potential client on Upwork, Fiverr, or Contra evaluating niche expertise
3. The Sentinel AI pipeline that generates social media captions and knowledge documents

Every word must work for all three. If it reads as if it was written for one geography only, it fails international platforms. Write at the intersection — specific business outcome, universal pain.

---

## Absolute Rules Before You Begin

**Rule 1: Read the codebase before forming any opinion**
Do not guess what the system does. Read the schema, the API routes, the integrations, the auth config. The code tells the real story of what was built and what business problem it solves.

**Rule 2: Think like a business owner, not a developer**
The output is not for developers. It is for a business owner who has never written a line of code. Every field must make them feel seen — not impressed by the technology, but recognised in the problem.

**Rule 3: Ground the context in the specific vertical**
Every project belongs to one of three verticals: Wellness & Beauty, Healthcare, or Auto Workshops. Ground every field in the specific language, pain, and outcome expectations of that vertical. A salon owner and a clinic owner do not speak the same language.

**Rule 4: Ditch "Past Results" for two separate frames**
- `results` → What the system physically does (capabilities, mathematical absolutes)
- `projected_outcomes` → What the business can expect based on industry research (always attributed)

Never combine these two into one field. Never invent numbers. Never use vague language like "improved efficiency."

**Rule 5: The competitor swap test**
Before finalising any field, ask: could this exact text appear on a different developer's portfolio? If yes, rewrite it with more specificity until the answer is no.

**Rule 6: Write in Adedamola's voice**
First-person singular. Direct. Short sentences. Active voice. No corporate language. No passive voice. No press release tone. Write as if telling the story to someone at a table.

---

## Codebase Reading Instructions

Scan in this order before writing anything:

1. `package.json` or `requirements.txt` — full dependency list. Every integration is a business capability.
2. Prisma schema or SQLAlchemy models — what does the system track? Every model is a real-world entity.
3. API routes — what can the system do? Each route is a business action.
4. `.env.example` — what third-party services are connected? Stripe, Twilio, Resend, Google Calendar.
5. Auth config — who uses the system? Owner only, staff, customers, or all three?
6. The most complex service file — where is the most interesting business logic?
7. README if it exists — any business context already written down?

---

## Vertical Archetype Library

Before writing anything, identify which of the three verticals this project serves.

### Vertical 1 — Wellness & Beauty
**Business types:** Salons, spas, barbershops, gyms, nail studios, massage centres

**Core operational pain:** Bookings managed through WhatsApp DMs and Instagram messages. Staff track appointments in a shared notebook or phone contacts. Double-bookings happen weekly. No-shows go untracked. Cash payments have no receipt trail. The owner spends 2+ hours daily on coordination that should be automated.

**What they fear:** Losing bookings because they couldn't respond fast enough. Being double-booked in front of a client. Not knowing their week's revenue until they count cash on Sunday.

**Platform language (Upwork/Fiverr/Contra buyers search for):** "salon booking system", "spa appointment app", "beauty business scheduling software", "WhatsApp booking automation", "no-show reminder system"

**International pain (UK, Canada, Australia):** Existing SaaS tools (Fresha, Vagaro, Mindbody) are too expensive or too generic. They want something custom-built that fits their exact workflow.

---

### Vertical 2 — Healthcare
**Business types:** Private clinics, dental practices, physiotherapy centres, diagnostics labs, opticians, GP practices

**Core operational pain:** Appointment booking by phone only. Receptionist manages a paper register. No automated reminders — no-show rates between 17% and 40%. Invoices are handwritten or printed manually. Patient history requires searching physical files. Doctors have no pre-session visibility into their daily patient load. NHIA/HMO billing is manual and delayed.

**What they fear:** Revenue loss from no-shows. Patients complaining about poor communication. Regulatory scrutiny due to poor record-keeping. Losing patients to clinics with better systems.

**Platform language:** "clinic appointment system", "patient management software", "medical booking system", "EMR alternative", "no-show reduction system", "healthcare scheduling app"

**International pain (UK, US, Canada):** HIPAA-compliant or GDPR-aware systems for private practices that operate outside public health systems. Budget for quality tooling exists. Trust and compliance are primary decision factors.

---

### Vertical 3 — Auto Workshops
**Business types:** Mechanic workshops, tyre shops, panel beaters, car service centres, auto diagnostics centres

**Core operational pain:** Paper job cards that get lost or misfiled. Verbal instructions to technicians that lead to miscommunication. Manual billing calculations that cause disputes. No visibility into which jobs are open, in progress, or complete. No customer communication until pick-up. Revenue leakage from parts not added to invoices. FIRS e-invoicing compliance pressure coming in 2025.

**What they fear:** Losing a job card. A customer claiming they were overcharged because there's no clear invoice trail. Not knowing how much the workshop made last week.

**Platform language:** "workshop management system", "auto repair shop software", "mechanic job card system", "garage management app", "auto workshop invoicing software"

**International pain:** Same transparency and tracking pain exists globally. GDPR-adjacent data handling for customer records in UK/EU.

---

## Output: Portfolio Project Fields

Generate content for every field below. These map directly to the database model fields on demoladevop.com. Every field must be complete. If a field cannot be determined from the codebase, write `[CONFIRM WITH ADEDAMOLA]`.

---

### Field 1: Title

**Format:** `[Brand Name] ([Vertical] System Descriptor)`
**Max:** 60 characters

Give the demo a SaaS-like brand name. The descriptor must immediately tell both a local business owner and an international Upwork buyer what the system does. Include a vertical signal in the descriptor.

**BAD:**
> Appointment Booking Bot

**GOOD:**
> QuickSlot (Salon Booking & Reminder Engine)
> VitaQ (Clinic Patient & Appointment Manager)
> GarageOS (Auto Workshop Job & Invoice Tracker)

---

### Field 2: Category

One of: `FULLSTACK` / `BACKEND` / `FRONTEND`

---

### Field 3: Target Vertical

**This is required.** Select exactly one:

`WELLNESS` / `HEALTHCARE` / `AUTO`

Do not leave this blank. The entire downstream pipeline — captions, knowledge document, platform proposals — depends on this field. If the project serves multiple verticals, choose the primary one the demo was built around.

---

### Field 4: Overview

**Length:** 2-3 sentences maximum
**Format:** Problem → System → Outcome

Write what the system does and who it is for. No technical language. No framework names. This must work for an international Upwork buyer scanning a proposal and a business owner on the portfolio site. Do not start with "I" — start with the business pain.

**BAD:**
> "A full-stack Next.js application with Prisma ORM and PostgreSQL that handles appointment scheduling."

**GOOD:**
> "Private clinics lose up to 30% of appointment revenue to no-shows because patients forget and nobody follows up. This system handles everything — patient booking, automated reminders, and doctor schedule visibility — without requiring any technical skill from the clinic staff."

---

### Field 5: Problem

**Length:** 2-3 sentences
**Format:** Describe the specific operational chaos before this system existed

Name the exact manual process that was failing. WhatsApp threads, paper records, phone calls, shared notebooks. Be specific about the mechanical bottleneck. Do not use random numbers or vague claims like "the business lacked an efficient system."

**GOOD:**
> "Every booking came through WhatsApp. Three stylists shared one phone. Double-bookings happened at least twice a week. The owner spent every Sunday manually counting cash receipts against a WhatsApp history."

---

### Field 6: Client Persona

**Format:** A short structured description of the fictional business this was built for

This is not optional. It is what makes a Upwork proposal feel real and specific versus generic. The fictional business must feel like a real entity — specific location, specific size, specific decision-maker.

**Output as a JSON object with these exact keys:**

```json
{
  "business_name": "Glow Studio London",
  "type": "Mid-range unisex salon",
  "location": "Brixton, London",
  "size": "3 stylists, 60+ clients weekly",
  "decision_maker": "Owner"
}
```

Keep it realistic. Match the vertical. For Healthcare: use a private clinic in London or Austin with 1-3 doctors. For Auto: a workshop in Manchester or Houston with 3-5 technicians.

---

### Field 7: Infrastructure & Reliability (maps to `challenge`)

**Length:** 3-5 sentences
**Audience:** Mixed — business owner and platform buyer (Upwork/Fiverr/Contra)

Describe the real technical resiliency of the system. Address uptime, security, mobile-first design, and offline handling where relevant. These are the trust signals that matter on freelance platforms.

Also include: who can operate this system. It must require zero technical skill from staff to be a credible vertical system.

---

### Field 8: Compliance Notes (maps to `compliance_notes`)

**Length:** 1-2 sentences
**This is a dedicated output field, not part of Field 7**

State the relevant compliance signal for this project. This is a trust signal on every freelance platform.

| Vertical | Market | Compliance Signal |
|---|---|---|
| Healthcare | UK/EU | GDPR-awareness, data minimisation principles |
| Healthcare | US | HIPAA-awareness (no PII exposure, access controls) |
| Wellness | All | Basic data privacy — no sensitive data exposed publicly |
| Auto | UK/EU | GDPR-aware customer data handling |
| Auto | US | State-level data privacy compliance |

**Example (Healthcare, UK/EU):**
> "Built with GDPR awareness in mind — patient data is never exposed publicly, all records are access-controlled, and the system architecture follows data minimisation principles required under GDPR."

If genuinely not applicable, write: `"No specific compliance requirement for this system — standard data privacy practices applied."`

---

### Field 9: Approach

**Length:** 4-6 sentences
**Format:** How the system was designed and why those decisions were made

Explain the key design decisions in plain language. Not "I used Redis for caching" — "Every action the owner takes triggers automatically without them needing to do anything again." Use the trigger → action → outcome pattern. Reference the integrations that matter most to business owners: Stripe, Square, Google Calendar, Twilio, Resend.

---

### Field 10: Results (maps to `results`)

**Length:** 2-4 sentences or bullet points
**Format:** What the system physically does — system capabilities and mathematical absolutes

This field is about what the system IS capable of doing. Not what happened. Not what might happen. What the system mathematically prevents or automates.

Frame capabilities around two themes:
- **Admin elimination** — what manual task is now completely gone?
- **Output without headcount** — what can the business now do without hiring more staff?

**BAD:**
> "The system significantly improved the business's operational efficiency."

**GOOD:**
> "Staff never touch a job card after logging it — status updates happen automatically as technicians progress through the job. The system processes 50+ concurrent booking requests without human intervention. Double-booking is mathematically eliminated by locking calendar slots at the moment of confirmation."

---

### Field 11: Projected Outcomes (maps to `projected_outcomes`)

**Format:** Array of 3-5 strings — industry-benchmarked projections, always attributed
**This is DIFFERENT from Field 10 (Results)**

Field 10 describes what the system does. Field 11 describes what the business can realistically expect — backed by documented industry data, not invented numbers.

Always attribute. Always use "up to" or "based on industry data" language. This is what converts on Upwork and Fiverr because it gives the buyer confidence that the outcome is achievable.

**Output as an array:**
```json
[
  "Reduces no-shows by up to 50% — consistent with documented appointment system research across clinical settings",
  "Eliminates 2+ hours of daily manual booking coordination — based on salon owner time-audit studies",
  "Creates a complete paper trail for all transactions, eliminating end-of-week cash reconciliation errors",
  "Frees the owner from inbox management, allowing them to focus on service delivery without admin overhead"
]
```

Use the Key Numbers from vertical-strategy.md where they apply:
- No-shows reduced by up to 50% (telehealth/appointment system studies)
- 40% reservation growth from booking apps (documented salon case studies)
- 2+ hours/day saved from manual booking management
- 30% reduction in document processing time (healthcare automation)

---

### Field 12: Technologies

List every technology used. Pull from `package.json` / `requirements.txt` and `.env`. Format as an array of strings. Do not polish — list exactly.

---

### Field 13: Live URL

Pull from README or deployment config. If not available write `[ADD LIVE URL]`.

---

### Field 14: SolutionCategory

Select exactly one: `BOOKING` / `PAYMENTS` / `MESSAGING` / `AI` / `DASHBOARD` / `WORKFLOW`

Choose the primary business driver — not the most technically interesting feature.

---

### Field 15: Golden Nuggets

3-5 single sentences — under 200 characters each — that capture the most compelling, specific truth about this project. These feed the social media caption generator and the Knowledge Document.

**Rules:**
- Never start with "I"
- No forbidden words — game-changer, revolutionary, seamless, innovative, leveraged, streamlined
- Must pass the competitor swap test — cannot belong to any other project
- Must reference a specific vertical, business type, or city
- Emphasise "WhatsApp-Native", "No New Headcount", or "Zero Technical Skill Required" where applicable
- Must sound like something a person would say out loud, not write in a press release
- Must work as a social media hook and freelance platform profile content (Upwork/Fiverr/Contra/LinkedIn)

**Examples:**
- "A London salon was losing 2 hours a day to DM booking management. This system handles that automatically, with zero staff training required."
- "Private clinics lose up to 30% of appointment revenue to no-shows. This is the system that stops that."
- "The hardest part of building this wasn't the invoicing logic. It was designing for a workshop where three different people need to see the same job card at the same time."

---

## Distribution Readiness Check

Before presenting the output, verify every item below. Mark each as PASS or FAIL. Fix every FAIL before presenting.

**Content completeness:**
- [ ] Every field is complete — no blanks, only `[CONFIRM WITH ADEDAMOLA]` placeholders — PASS / FAIL
- [ ] `vertical` is set to exactly one of: WELLNESS / HEALTHCARE / AUTO — PASS / FAIL
- [ ] `client_persona` has all five keys: business_name, type, location, size, decision_maker — PASS / FAIL
- [ ] `compliance_notes` is populated — not left blank — PASS / FAIL
- [ ] `projected_outcomes` has at least 3 items with attribution language — PASS / FAIL

**Voice and language:**
- [ ] Overview does not contain technical framework names — PASS / FAIL
- [ ] Overview starts with the business pain, not "I" — PASS / FAIL
- [ ] Overview works for an international Upwork/Fiverr buyer — PASS / FAIL
- [ ] Problem field describes a specific manual process, not a vague inefficiency — PASS / FAIL
- [ ] Every sentence passes the reading aloud test — no press release language — PASS / FAIL
- [ ] No forbidden words anywhere — game-changer, revolutionary, seamless, innovative, leveraged — PASS / FAIL

**Platform specificity:**
- [ ] Title contains searchable keywords a Upwork/Fiverr buyer would use — PASS / FAIL
- [ ] `client_persona` is specific enough to name in a proposal ("I built this for a salon similar to yours in London") — PASS / FAIL
- [ ] `compliance_notes` names the correct compliance standard for this vertical and market — PASS / FAIL
- [ ] `projected_outcomes` uses attributed industry data, not invented numbers — PASS / FAIL

**Vertical authority:**
- [ ] The vertical appears explicitly named in the overview or problem field — PASS / FAIL
- [ ] All five Golden Nuggets pass the competitor swap test — PASS / FAIL
- [ ] No Golden Nugget starts with "I" — PASS / FAIL
- [ ] Results field contains at least one specific system capability claim — not "improved efficiency" — PASS / FAIL

**Zero-proof authority:**
- [ ] No field claims a past client outcome that does not exist — only system capabilities and projected outcomes — PASS / FAIL
- [ ] Demo projects are framed as live, working systems — not prototypes — PASS / FAIL
- [ ] If a testimonial is referenced, it must be a real quote from a real client. Never fabricate social proof — PASS / FAIL

---

_PROJECT_BRIEF_RULES.md — Version 2026.2 — demoladevop.com_
_Run this after every project build. Feed the output into the portfolio dashboard, then run knowledge-rules.md for the full Knowledge Document._
_Cross-reference with knowledge-rules.md, brand-persona.md, vertical-strategy.md, and ANTI_AI_WRITING.md._
