# Project Brief - Appointment Reminder Email System

Research baseline: April 17, 2026

## Research lens

This brief is based on:

- marketplace demand from Fiverr, Upwork, and Contra
- current workflow expectations shown by foreign-market software vendors serving appointment businesses
- business pain points and customer pain points first
- a code-first implementation path using Next.js, NestJS, or FastAPI

This is not a low-code or no-code brief.
It is meant to help build a believable coded product demo.

## What this project is really selling

This is not "an email reminder tool."

It is a small appointment operations system that helps businesses:

- reduce no-shows
- stop manual reminder chasing
- get confirmation signals before the appointment
- catch reschedules earlier
- see reminder outcomes in one place

## Marketplace demand signal

### Fiverr signal

Live Fiverr listings as of April 17, 2026 show that buyers are already paying for:

- appointment reminder systems that send automated emails 24 hours before appointments
- salon and spa booking systems with email notifications, booking restrictions, and online payments
- simple Google Sheets or Brevo based reminder automations
- clinic automation offers that bundle reminders with intake and workflow automation

What this means:

- buyers do not need to be convinced that reminder automation matters
- simple reminder systems are sellable
- many sellers package this work around "reduce no-shows" and "save admin time"
- a lot of Fiverr competition is setup-oriented, tool-oriented, or low-code oriented

That is useful for me because a custom coded demo can stand out if it looks more productized and more reliable than a generic workflow setup.

### Upwork signal

Live Upwork services and job posts show demand for:

- "book, confirm, remind automatically" systems
- appointment reminders connected to CRM systems
- email, SMS, or call reminder workflows
- calendar and customer data synchronization
- ongoing operational automation rather than one-off websites

One visible pattern on Upwork is that reminder work often appears inside a broader business operations or customer support problem, not as pure frontend development.

What this means:

- Upwork buyers often think in workflows, not pages
- they care about data synchronization, preferences, and reliable execution
- the market is comfortable with reminders across different industries, not just salons

### Contra signal

Contra is less gig-listing heavy and more case-study driven.
The useful signal there is how higher-trust freelancers present the work.

Contra examples around appointment workflows emphasize:

- reduced phone call volume
- faster booking and rescheduling
- multi-channel communication
- patient or client satisfaction
- secure data handling
- clear business outcomes

What this means:

- Contra is useful for learning presentation style
- the demo should read like a workflow case study, not just a feature list
- the value should be framed in outcomes and operations, not only in "I built an email reminder app"

## Inference from marketplace research

Based on live marketplace listings and case studies, the winning angle is not:

"I can send reminder emails."

The winning angle is:

"I can build a reminder and confirmation workflow that reduces missed appointments and removes admin work."

That should shape both the product and the pitch.

## Foreign market context

For this project, "foreign markets" mainly means appointment-based businesses operating in places like:

- United States
- United Kingdom
- Canada
- Australia

These markets already use software categories like:

- salon scheduling
- clinic reminders
- meeting scheduling workflows
- customer communication automation

So the buyer standard is not zero.
They already know what modern reminders should do.

## What businesses in these markets already expect

Current official product pages and support docs show that reminder workflows are expected to include more than a single message.

### Square Appointments

Square currently positions reminders and confirmations as standard no-show prevention features.
Their official pages say businesses can:

- send reminders by email and or text
- send reminders between 1 hour and 3 days before appointments
- send confirmation requests between 2 hours and 1 week before appointments
- see confirmed appointments and unconfirmed appointments distinctly
- manage change and cancellation notifications

Square support also says these notifications are transactional only, which is important.

### SimplePractice

SimplePractice shows what healthcare and therapy buyers expect:

- reminders by email, text, or voice
- lead-time options such as 24, 36, 48, or 72 hours
- reminders localized to the client timezone
- reminder settings at both practice and client level

### Calendly

Calendly shows what consultants, agencies, and professional services buyers expect:

- reminders and follow-ups as workflow automation
- triggers on booked, before start, rescheduled, canceled, ended, and no-show states
- reconfirmation to reduce no-shows
- post-no-show reschedule flows

### Vagaro

Vagaro shows the beauty and wellness side clearly:

- confirmations
- reminder notifications
- customer communication
- no-show and cancellation handling
- booking plus reminder expectations as one connected experience

## Inference from foreign-market product research

The foreign-market benchmark is already higher than:

- "send one reminder"
- "dump appointment rows into email"
- "show a table of appointments"

The minimum believable standard is closer to:

- reminders
- confirmations
- reschedule path
- status visibility
- timezone awareness
- delivery awareness

## Business pain points

These are the pains the business owner or staff actually feel.

### Operational pains

- no-shows waste appointment slots and revenue
- staff spend time calling or emailing manually
- reminder timing is inconsistent
- there is no single view of who confirmed and who did not
- reschedules happen too late
- canceled appointments still trigger outdated communications in bad systems

### Administrative pains

- customer data sits across calendars, spreadsheets, inboxes, and CRMs
- appointment changes create messaging confusion
- there is no reliable log of what was sent
- failed or bounced reminders are invisible until the customer complains

### Commercial pains

- missed appointments reduce revenue
- empty time slots are hard to refill late
- staff time gets wasted on follow-up instead of service delivery
- poor communication makes the business look disorganized

## Customer pain points

These are the pains the end-customer feels.

### Before the appointment

- they forget the date or time
- they are unsure whether the appointment is still active
- they cannot quickly confirm attendance
- they do not know how to reschedule without calling
- they miss messages because email lands in spam or texts are blocked

### During schedule changes

- rescheduling is too slow
- reminder messages continue after the appointment changed
- timezone confusion leads to missed events
- they cannot tell whether the business received their reply

### Experience pain

- too many manual calls feel annoying
- vague reminder messages create friction
- promotional or noisy reminder messages reduce trust
- healthcare or sensitive appointments require privacy-aware messaging

## What buyers are really hiring for

Across marketplaces and official vendor docs, the repeat pattern is:

- reminder automation
- confirmation capture
- reschedule handling
- branded communication
- dashboard visibility
- calendar or CRM sync

So this demo should be treated as a workflow engine for one slice of appointment operations.

## Where the gap is for you

Many marketplace sellers package this work as:

- tool setup
- Zapier or Make automation
- calendar configuration
- CRM workflow setup

That means a custom coded demo can stand out if it shows:

- clear domain logic
- proper status modeling
- reliable reminder scheduling
- delivery and confirmation tracking
- polished UI for both admin and public actions

## Product definition for your version

Your version should be:

"An appointment reminder and confirmation system for small appointment-based businesses, built as a coded web app."

Not:

"A generic marketing automation workflow."

## Best-fit buyers for this coded demo

- salons and beauty studios
- clinics and private practices
- therapists and coaches
- consultants and agencies
- any service business with booked appointments and repeat no-show pain

## Narrow v1 promise

The v1 promise should be:

- import or create appointments
- send confirmation and reminder emails automatically
- let clients confirm or request a reschedule
- show the business what happened

That is enough to be useful and believable.

## What the MVP should include

### Admin side

- create appointment manually
- import appointments by CSV
- define reminder rules
- appointment list with statuses
- dashboard with confirmation and delivery metrics
- reschedule request inbox

### Client side

- confirmation email
- reminder email
- confirm attendance link
- reschedule request form

### System behavior

- timezone-aware scheduling
- expired secure action links
- reminder cancellation when appointment is canceled or moved
- provider delivery status capture

## What the MVP should not include

- full booking website
- payment collection
- SMS and WhatsApp from day one
- full CRM
- marketing campaigns
- multi-tenant enterprise controls

## Product rules that matter

### Reminder and confirmation are not the same thing

A reminder tells the client the appointment is coming.
A confirmation asks the client to explicitly signal attendance.

### Reminder messages must stay transactional

This matches what Square documents.
Do not mix promotions into the workflow.

### Timezone handling is mandatory

This matches SimplePractice and foreign-market expectations.
If the appointment is in London and the client is in New York, the system needs a clear rule.

### Rescheduling must regenerate future reminders

Otherwise the app behaves like a toy and creates user frustration.

### Delivery tracking matters

The business needs to know whether the message was sent, delivered, bounced, or failed.

## Recommended default workflow

For the demo, use this sequence:

1. Appointment created
2. Confirmation request sent immediately
3. Reminder sent 24 hours before
4. Reminder sent 1 hour before
5. Optional follow-up or review request after the appointment

This is simple, believable, and easy to explain.

## User flows to design

### Admin flow

1. Create or import appointment
2. Review generated reminder events
3. See one appointment marked `pending_confirmation`
4. Watch reminder event status move from pending to sent
5. Review dashboard totals
6. Review incoming reschedule request

### Client flow

1. Receive confirmation email
2. Click confirm
3. See success page
4. Or click reschedule
5. Submit preferred new time and note

## Core data model

### `contacts`

- id
- full_name
- email
- phone
- timezone
- email_opt_out

### `appointments`

- id
- contact_id
- title
- location_name
- starts_at_utc
- ends_at_utc
- display_timezone
- status
- confirmation_status
- external_reference
- created_at
- updated_at

Recommended `status` values:

- scheduled
- confirmed
- reschedule_requested
- canceled
- completed
- no_show

Recommended `confirmation_status` values:

- pending
- confirmed
- expired
- skipped

### `reminder_rules`

- id
- name
- channel
- event_type
- offset_minutes
- active

Recommended `event_type` values:

- confirmation_request
- reminder
- follow_up

### `reminder_events`

- id
- appointment_id
- rule_id
- channel
- event_type
- scheduled_for_utc
- status
- provider
- provider_message_id
- locked_at
- processed_at
- error_message

Recommended `status` values:

- pending
- locked
- sent
- delivered
- opened
- clicked
- bounced
- failed
- canceled
- skipped

### `appointment_action_tokens`

- id
- appointment_id
- action_type
- token_hash
- expires_at
- used_at

Recommended `action_type` values:

- confirm
- reschedule

### `reschedule_requests`

- id
- appointment_id
- preferred_start_at_utc
- preferred_timezone
- message
- status
- reviewed_at
- reviewed_by

### `email_webhook_events`

- id
- provider
- provider_message_id
- event_type
- payload_json
- received_at

## Recommended coded architecture

## Primary recommendation

Use:

- `Next.js` for the dashboard and public confirmation pages
- `NestJS` for the API, reminder scheduling, and worker logic
- `PostgreSQL` for source-of-truth data
- `Redis` + `BullMQ` for queueing and delayed jobs
- `Resend` for email delivery

This is the strongest fit for this project if you want a clean, professional, product-style build.

## Why this stack fits the problem

### Next.js

Next.js App Router and Route Handlers are current and stable for modern web apps.
It is a good fit for:

- admin dashboard UI
- public confirm and reschedule pages
- CSV upload screens
- polished frontend and portfolio presentation

### NestJS

NestJS has official support for:

- task scheduling
- BullMQ queues
- modular API design

That makes it a strong fit for reminder workflows, where background processing and clean service boundaries matter.

### PostgreSQL

Postgres is the right source of truth for:

- appointments
- reminder state
- action tokens
- delivery logs
- audit history

### Redis and BullMQ

The official NestJS queue docs explicitly position queues as useful for reliable background work and preserving job state.
That matches reminder processing very well.

### Resend

Resend supports:

- sending transactional emails
- scheduled sends
- webhooks for delivery events

For this project, I would still keep the reminder schedule in my own database and queue system, and use Resend primarily for delivery plus status signals.

## Alternative Python path

If you want to build the backend in Python instead:

- `Next.js` frontend
- `FastAPI` API
- `PostgreSQL`
- `Redis`
- `Celery` for workers
- `Celery Beat` for periodic scheduling
- `Resend` for email

## Why I would not use FastAPI BackgroundTasks for the full reminder engine

FastAPI officially says `BackgroundTasks` is useful for small tasks after a request, but for heavier or multi-process background work it recommends bigger tools like Celery.

This reminder system is not just "send one email after one request."
It needs:

- scheduled jobs
- retries
- cancellation
- delayed reminders
- stateful processing

So for a production-like demo:

- use `FastAPI BackgroundTasks` only for very small follow-up work
- use `Celery` for the reminder engine

## NestJS implementation design

### Services

- `AppointmentsService`
- `ReminderRulesService`
- `ReminderPlannerService`
- `ReminderQueueService`
- `ReminderProcessorService`
- `ConfirmationService`
- `RescheduleService`
- `EmailWebhookService`
- `DashboardService`

### Modules

- `appointments`
- `contacts`
- `reminders`
- `notifications`
- `dashboard`
- `auth`

### Queues

- `reminder-dispatch`
- `webhook-reconcile`

### Job types

- `send-confirmation-email`
- `send-reminder-email`
- `cancel-reminder-event`
- `process-delivery-webhook`

## FastAPI implementation design

### Routers

- `/appointments`
- `/contacts`
- `/reminders`
- `/actions`
- `/reschedules`
- `/webhooks/resend`
- `/dashboard`

### Workers

- `plan_reminders`
- `dispatch_due_reminders`
- `cancel_future_events`
- `reconcile_email_events`

### Celery tasks

- `send_confirmation_email`
- `send_reminder_email`
- `send_followup_email`
- `process_resend_webhook`

## How the system should work

### Create appointment

1. Admin creates appointment or imports CSV
2. Backend validates the data
3. Backend stores the appointment
4. Backend generates reminder events from active rules
5. Backend creates secure tokens for confirm and reschedule links

### Process reminders

1. Scheduler finds due reminder events
2. The system locks them to prevent double-send
3. Worker sends the email with Resend
4. The event is updated with `provider_message_id`
5. Webhooks later update delivery state

### Confirm appointment

1. Client clicks confirm link
2. Backend validates token
3. Appointment status is updated
4. Confirmation status changes
5. Optional future confirmation reminders are canceled

### Request reschedule

1. Client clicks reschedule link
2. They submit preferred time and note
3. Backend creates `reschedule_request`
4. Staff reviews and updates appointment
5. Old reminder events are canceled
6. New reminder events are generated

## Suggested routes

### Next.js pages

- `/dashboard`
- `/appointments`
- `/appointments/new`
- `/appointments/import`
- `/appointments/[id]`
- `/reschedule-requests`
- `/confirm/[token]`
- `/reschedule/[token]`

### Backend routes

- `POST /appointments`
- `POST /appointments/import`
- `GET /appointments`
- `GET /appointments/:id`
- `PATCH /appointments/:id`
- `POST /appointments/:id/confirm`
- `POST /appointments/:id/reschedule-request`
- `GET /dashboard/summary`
- `POST /webhooks/resend`

## CSV import rules

Minimum CSV columns:

- `customer_name`
- `customer_email`
- `appointment_title`
- `starts_at`
- `timezone`

Helpful optional columns:

- `ends_at`
- `location_name`
- `phone`
- `external_reference`

Validation rules:

- reject invalid email
- reject invalid datetime
- reject missing timezone
- warn on duplicate external reference

## Dashboard metrics that matter

- appointments today
- confirmed appointments
- pending confirmations
- reschedule requests
- canceled appointments
- no-shows
- reminders sent today
- delivery failures
- bounce count

## Email template requirements

Each reminder email should include:

- customer name
- appointment title
- date and time
- timezone or local interpretation
- location or meeting link
- confirm button
- reschedule button

The email should not include:

- marketing copy
- clutter
- unnecessary sensitive detail

## Security and trust rules

- action links must expire
- token values should be hashed at rest
- reschedule should be a request flow, not an unrestricted public editor
- sensitive appointments should use minimal email detail
- webhook payloads should be stored for debugging
- duplicate sends should be prevented with locking

## Where this demo will stand out

This demo becomes stronger than generic marketplace setups if it shows:

- real workflow state
- delivery visibility
- coded queue processing
- clean admin UX
- believable public action pages

## Good positioning line

"A coded reminder and confirmation system for appointment businesses that reduces no-shows, captures confirmations, and gives staff a clear operations dashboard."

## Why this is good for direct client sales too

This is not only for Fiverr.
It also works for:

- Upwork proposals
- direct outreach emails
- portfolio case studies
- referral conversations
- local client presentations

Because the value is universal:

- save time
- reduce no-shows
- look more organized

## Suggested build order

1. Design the database schema
2. Build appointment CRUD
3. Build reminder rule generation
4. Build reminder event planner
5. Build queue worker and scheduler
6. Build Resend integration
7. Build confirm and reschedule token flow
8. Build dashboard metrics
9. Build CSV import
10. Add webhook reconciliation

## Official and marketplace sources

### Marketplace demand

- Fiverr reminder automation listing: https://www.fiverr.com/pranavpauto/build-an-automated-appointment-reminder-system-that-reduces-no-shows
- Fiverr salon booking listing: https://www.fiverr.com/coderbotics/build-salon-spa-reservation-and-appointment-booking-system
- Fiverr Google Sheets reminder listing: https://www.fiverr.com/moonlonging/automate-email-reminders-using-forms-and-spreadsheets
- Upwork appointment automation service: https://www.upwork.com/services/product/admin-customer-support-appointment-system-automation-book-confirm-remind-automatically-2009246686232016165
- Upwork appointment reminder service: https://www.upwork.com/services/product/admin-customer-support-timely-client-appointment-notifications-call-reminders-1724468701378347008
- Upwork reminder automation job: https://www.upwork.com/freelance-jobs/apply/GoHighLevel-Workflow-Setup-Appointment-Reminder-Automation_~022008866168286228953/
- Contra healthcare appointment assistant: https://contra.com/p/AUq2ekbv-healthcare-appointment-assistant-ai-automation-project
- Contra WhatsApp scheduling automation example: https://contra.com/community/M0570VXg-automate-your-appointment-scheduling-with-whats-app

### Foreign-market workflow expectations

- Square reminders and confirmations: https://squareup.com/gb/en/appointments/features/reminders
- Square support for appointment notifications: https://squareup.com/help/us/en/article/6729-manage-appointment-booking-notifications-and-reminders
- Square support on customer communication issues and time zones: https://squareup.com/help/us/en/article/8447-troubleshoot-customer-appointment-communications
- SimplePractice reminder setup: https://support.simplepractice.com/hc/en-us/articles/42052535058957-Setting-up-appointment-reminders
- Calendly Workflows feature page: https://calendly.com/features/workflows
- Calendly Workflows overview: https://calendly.com/help/workflows-overview
- Calendly scheduling notifications: https://calendly.com/help/calendly-scheduling-notifications
- Calendly text reminders: https://calendly.com/help/how-to-send-text-messages-with-workflows
- Vagaro online booking: https://www.vagaro.com/pro/online-booking
- Vagaro reminder software: https://www.vagaro.com/pro/notifications
- Vagaro reminder examples: https://support.vagaro.com/hc/en-us/articles/360000393854-Examples-of-Appointment-Notifications-and-Reminders

### Build stack docs

- Next.js App Router: https://nextjs.org/docs/app
- Next.js route handlers: https://nextjs.org/docs/app/api-reference/file-conventions/route
- Next.js forms with Server Actions: https://nextjs.org/docs/app/guides/forms
- NestJS task scheduling: https://docs.nestjs.com/techniques/task-scheduling
- NestJS queues with BullMQ: https://docs.nestjs.com/techniques/queues
- FastAPI background tasks: https://fastapi.tiangolo.com/tutorial/background-tasks/
- Celery user guide: https://docs.celeryq.dev/en/stable/userguide/
- Celery periodic tasks: https://docs.celeryq.dev/en/v5.4.0/userguide/periodic-tasks.html
- Resend docs: https://resend.com/docs
- Resend schedule email docs: https://resend.com/docs/dashboard/emails/schedule-email
- Resend email event docs: https://resend.com/docs/dashboard/emails/introduction
- Twilio message scheduling: https://www.twilio.com/docs/messaging/features/message-scheduling
