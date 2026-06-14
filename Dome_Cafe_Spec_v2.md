# Dome Cafe — Digital Management System
### Version 2.0 — Revised Specification
*Incorporates UX, Architecture & Compliance Critique*
*Prepared by Glorx Digital Agency — Vignesh & Karthikeyan*

---

## At a Glance

| | |
|---|---|
| **Branches** | 2 — Kokapet & Sainikpuri |
| **Critique Fixes** | 5 — all implemented in this version |
| **Database** | Single multi-tenant PostgreSQL with RLS |
| **Scalability** | New branches added with zero code changes |

---

## What Changed in Version 2.0

This document supersedes v1.0. Every section incorporates the five key critique recommendations.

| Feature | Original v1.0 | Revised v2.0 |
|---|---|---|
| Login Placement | Step 1 — before browsing | Step 7 — at checkout |
| WhatsApp API | OTP + all notifications | OTP + SMS fallback; selective WA use |
| Database Architecture | Separate accounts per branch | Single multi-tenant DB with RLS |
| Branch Disable Toggle | Simple on/off toggle | Branch Disable (soft disable mechanism) |
| Anniversary CRM | Direct WhatsApp trigger | Cron scheduler + DPDP-compliant opt-in |

---

## Part 1 — Customer Booking Journey (Revised)

### 1.1 Revised Booking Wizard — Step Order

The most significant UX change in v2.0 is moving authentication from Step 1 to Step 7. Research shows that leading with a login wall reduces conversion by 30–50%. The new flow lets customers design their full experience first, creating an **endowment effect** — by the time they reach checkout, they are highly motivated to complete.

> 💡 **Endowment Effect:** Once a customer has selected their package, balloon palette, cake, and add-ons, they feel ownership of that experience. Authentication at this point feels like the last step to *claim* something already theirs — not a gate.

| Step | Action | Notes |
|---|---|---|
| 1 | Choose Branch | Kokapet or Sainikpuri. Unavailable branches are hidden. |
| 2 | Pick Date & Time | Live availability calendar. Full slots greyed out automatically. |
| 3 | Select Package | Visual cards with photos, inclusions, and price. |
| 4 | Balloon Palette | Visual colour picker. Options managed from admin panel. |
| 5 | Choose Cake | Flavour/type selection with dietary tags (eggless, vegan). |
| 6 | Add-Ons | Optional extras — photography, banners, extra decor. |
| **7** | **Guest Details + Login** | **WhatsApp OTP login here. Fields pre-fill after auth. ← REVISED** |
| 8 | Payment | 50% advance via Razorpay/UPI. Invoice sent to WhatsApp. |

### 1.2 Step 7 Detail — Authentication at Checkout

When the customer reaches Step 7, they are prompted to enter their WhatsApp number. An OTP is dispatched and verified. After successful authentication:

- Full Name and WhatsApp Number fields auto-populate from their profile
- Returning customers see their previous occasion preferences pre-filled
- Remaining fields: Occasion, Guest Count, Celebrant Name, Special Requests
- Optional fields (Special Requests, Celebrant Name) are clearly labelled as optional to reduce form anxiety

### 1.3 WhatsApp API Usage — Revised Scope

To control messaging costs and avoid Meta API rate-limit risks, WhatsApp communication is now tiered.

**WhatsApp — Reserved For:**
- Booking confirmation with invoice PDF
- 24-hour event reminder
- Day-of arrival message
- Post-event thank-you
- Annual CRM occasion reminders (opted-in customers only)

**SMS Fallback (MSG91 / Twilio):**
- OTP delivery when Meta API is rate-limited
- OTP delivery on WhatsApp delivery failure
- Low-cost fallback — triggers automatically, no admin action needed
- Same OTP code, different transport layer

> 💰 **Cost Note:** Meta charges per conversation category (Authentication, Utility, Marketing). Reserving WhatsApp for high-value steps keeps monthly API costs predictable and protects the business number from spam flags.

### 1.4 Booking Confirmation Flow

- Payment confirmed via Razorpay webhook
- Booking record written to the database with `confirmed` status
- WhatsApp confirmation + invoice dispatched within 10 seconds
- Admin portal notification fires simultaneously
- Booking appears in the Calendar and Appointment Manager instantly

---

## Part 2 — Admin Portal (Revised)

### 2.1 Multi-Tenant Architecture — Revised

Version 1.0 proposed separate database accounts per branch. This has been replaced with a **single unified PostgreSQL database using Row-Level Security (RLS)** — the industry-standard pattern for multi-location SaaS.

**Why a Unified DB with RLS is Correct:**
- ✓ Cross-branch reporting works without complex joins across separate databases
- ✓ Adding a new branch is a one-row insert — no new DB instance, no deployment
- ✓ Global config (packages, cakes, palettes) is maintained in one place
- ✓ Branch admins still see only their own data — enforced at the database level via RLS policies
- ✓ Super Admin gets a global dashboard without manual data aggregation

#### Account Roles & Access Matrix

| Role | Own Branch Data | Other Branches | Global Config |
|---|---|---|---|
| Branch Admin (Kokapet) | Full read/write | No access (RLS blocks) | Read only |
| Branch Admin (Sainikpuri) | Full read/write | No access (RLS blocks) | Read only |
| Super Admin (Developer) | Full access all branches | Full access all branches | Full read/write |

### 2.2 Location Serviceability Toggle — Revised

The original simple toggle has been replaced with a **Branch Disable** mechanism designed to prevent new bookings while preserving existing commitments.

*Use when: Planned maintenance, staff shortage, temporary closure, or scheduled downtime.*

- Blocks all new bookings for this branch.
- Website shows: "This location is temporarily unavailable for new bookings".
- Existing upcoming bookings remain active and unaffected.
- Calendar and appointment manager stay fully functional.
- Admin can still message individual customers manually.

> ℹ️ **Operational Note:** In case of emergency closures, administrators can manually contact affected customers using the calendar and appointment manager quick-message actions.

### 2.3 Calendar View

- Month and week views available
- Colour-coded event blocks: Confirmed (green), Pending Payment (amber), Rescheduled (blue), Cancelled (red)
- Clicking an event navigates to the full Appointment Detail page
- Admin can manually block dates for private events or maintenance
- Disabled dates appear as a full-day block with a lock icon

### 2.4 Appointment Manager

Card-based page sorted by upcoming date. Two display states:

#### Compact Card View
- Appointment time and date
- Customer name and occasion
- Package category
- Payment status badge: Advance Paid / Pending / Fully Paid
- Quick actions: View, Edit, Reschedule, Message Customer

#### Expanded Detail View
- All booking data in collection order: branch, date, time, package, palette, cake, add-ons
- Guest details: name, WhatsApp, occasion, guest count, celebrant name, special notes
- Payment record: amount, method, Razorpay transaction ID
- Change log: timestamped history of all modifications
- Inline edit: swap cake, change palette, reschedule
- Admin override: mark balance paid, add internal notes
- Direct WhatsApp button: opens a pre-filled message template for this customer

### 2.5 Dynamic Content Management (Settings)

Admins control what appears on the customer-facing website — no developer needed for routine changes.

- **Packages** — add, edit, hide, reorder with price, description, photo
- **Balloon Palettes** — manage colour options and availability
- **Cake Options** — add flavours, dietary tags, seasonal availability
- **Add-Ons** — create extras with individual pricing
- **Branch Settings** — name, address, phone, hours, slot duration, capacity per slot
- **Credentials** — Razorpay and WhatsApp API keys (securely stored)
- **Serviceability Toggle** — Enable / Disable per branch

---

## Part 3 — CRM & WhatsApp Automation (Revised)

### 3.1 WhatsApp Marketing Compliance — DPDP Act 2023

Sending automated marketing messages in India without explicit consent is a violation of the **Digital Personal Data Protection Act 2023** and Meta's Business Messaging policies. A suspended WhatsApp Business number would disable the entire booking confirmation system.

> 🇮🇳 **Legal Requirement:** The DPDP Act 2023 requires explicit, informed, and revocable consent before sending promotional messages. A pre-checked opt-in box does not constitute valid consent under Indian law.

**Revised consent mechanism:**
- An **unchecked** opt-in checkbox is shown at Step 7 (Guest Details)
- Label reads: *"I agree to receive booking reminders and personalised celebration messages on WhatsApp"*
- Customers who do not check the box receive only transactional messages (confirmation, invoice)
- Consent status is stored as `marketing_consent: boolean` against the customer profile
- A one-tap opt-out link is included in every marketing message

### 3.2 Anniversary CRM — Cron Scheduler Architecture

The original vision proposed a direct WhatsApp trigger for anniversary reminders. The revised architecture uses a **scheduled background job**.

**Scheduler Flow:**
1. A cron job runs daily at **9:00 AM**
2. Queries the database for customers whose occasion date (anniversary/birthday) falls **7 days from today**
3. Filters to only include customers with `marketing_consent = true`
4. Generates a personalised message: celebrant name, occasion type, last venue visited
5. Dispatches via WhatsApp Business API using a pre-approved message template
6. Logs each message with delivery status (sent, delivered, read, failed)
7. Failed sends are retried once after 2 hours

**Recommended scheduler:** QStash (serverless, no always-on server needed) or BullMQ (if using a Node.js backend).

### 3.3 Customer Database & CRM

- Every booking automatically creates or updates the customer profile
- Profile contains: name, WhatsApp, booking history, occasions, packages preferred, total spend, consent status
- Smart tags auto-applied: Anniversary, Birthday, Baby Shower, Corporate
- Filter & search by name, phone, date range, occasion, branch, spend tier
- Export to CSV for offline campaign planning

### 3.4 Bulk Messaging

- Filter a customer segment (e.g., all anniversary customers from Kokapet in June)
- Select a pre-approved message template
- Preview message with dynamic fields populated
- Schedule for a specific date/time, or send immediately
- Only customers with `marketing_consent = true` are included in bulk sends
- Delivery report after send: delivered, read, failed counts

---

## Part 4 — Technology Stack

Clean separation of concerns: marketing content in a CMS, transactional data in a relational database.

| Layer | Technology | What It Stores |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | Booking wizard, admin portal UI |
| CMS | Sanity | Packages, balloon palettes, cake options, branch info, images |
| Transactional DB | PostgreSQL + Prisma / Drizzle | Users, bookings, payments, WhatsApp logs, consent records |
| Auth | Custom WhatsApp OTP + SMS fallback (MSG91) | Session management, OTP state |
| Payments | Razorpay | Payment records, webhook events, transaction IDs |
| Messaging | WhatsApp Business API + MSG91 (SMS) | Confirmations, reminders, OTPs, bulk campaigns |
| Scheduler | QStash or BullMQ | Anniversary cron, reminder queue, retry logic |
| Hosting | Vercel (frontend) + Railway / Render (DB) | Serverless functions, database hosting |

---

## Closing Summary — v2.0 Improvements

All five critique points have been fully resolved:

- ✅ **Login moved to checkout** — reduces drop-off, leverages endowment effect
- ✅ **WhatsApp costs controlled** — selective use + SMS fallback for OTP
- ✅ **Database unified** — single PostgreSQL instance with branch-level RLS
- ✅ **Branch toggle upgraded** — Branch Disable toggle to halt new bookings while keeping existing ones active
- ✅ **Anniversary CRM compliant** — cron scheduler + DPDP Act opt-in consent

---

*Confidential — Prepared by Glorx Digital Agency*
*Vignesh & Karthikeyan*
