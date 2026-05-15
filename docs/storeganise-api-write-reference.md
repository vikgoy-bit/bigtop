# Content from https://claude.ai/public/artifacts/e7a0787f-0891-4e2f-b67c-21fdc6be3136

Content is user-generated and unverified.

Customize

# Storeganise Write-Side API Reference

## Big Top Self Storage

**Base URL:**`https://bigtopselfstorage.storeganise.com/api/v1/admin`

All write endpoints require:

```
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

* * *

## Users

### POST /users

Create a new user (customer or staff).

**Request body:**

json

```json
{
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+447700900000",
  "phone2": "",
  "address": "12 High St, London, W1A 1AA",
  "companyName": "",
  "companyId": "",
  "personalId": "",
  "language": "en",
  "note": "",
  "planId": "plan_id_here",
  "market": "market_id_here",
  "promoCode": "",
  "roles": ["user"],
  "labels": [],
  "customFields": {
    "identitySession": ""
  }
}
```

**Required fields:**`email`

**Response:** Created user object (same fields as GET /users/:userId)

* * *

### PUT /users/:userId

Update an existing user. Send only the fields you want to change (partial update).

**Path params:**`userId` (required)

**Common update patterns:**

#### Update basic profile

json

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+447700900000",
  "address": "12 High St, London"
}
```

#### Set identity\_session (Stripe Identity verification)

This is how you mark a user as identity-verified after a Stripe Identity check. The field is stored as a user custom field with key `identitySession`.

json

```json
{
  "customFields": {
    "identitySession": "vs_1Q698sCu8o1es6nBvvRNQFXq#verified"
  }
}
```

**Format:**`{stripeVerificationSessionId}#{status}`

**Valid status values:**

- `verified` — fully verified, booking will proceed without ID check prompt
- `processing` — treat same as verified in booking flow (Stripe still processing)

**To clear / force re-verification:**

json

```json
{
  "customFields": {
    "identitySession": ""
  }
}
```

**How it works:** When the Stripe Identity addon is enabled, the Customer Portal booking flow checks `customFields.identitySession` on the user. If the field is populated with a `verified` or `processing` status, the ID verification step is skipped. Admin-initiated move-ins (via Management Portal or API) **always** skip the identity check regardless of this field.

#### Disable a user

json

```json
{
  "isDisabled": true,
  "disabledReason": "Account closed at customer request"
}
```

#### Update billing trigger / invoice date

json

```json
{
  "invoiceDate": 1,
  "billingTrigger": "moveIn"
}
```

* * *

## Unit Rentals

### POST /unit-rentals

Create a new unit rental (move-in). This is the admin equivalent of a customer submitting a unit order.

**Request body:**

json

```json
{
  "unitId": "unit_id_here",
  "ownerId": "user_id_here",
  "startDate": "2026-06-01",
  "price": 15000,
  "deposit": 5000,
  "note": "",
  "promoCodeId": "",
  "customFields": {}
}
```

**Required fields:**`unitId`, `ownerId`, `startDate`

**Note on `price`:** Values are in minor currency units (pence for GBP). £150.00 = `15000`.

* * *

### PUT /unit-rentals/:unitRentalId

Update an existing unit rental. Partial update — send only fields to change.

**Path params:**`unitRentalId` (required)

#### Update price

json

```json
{
  "price": 16000
}
```

#### Update access codes

json

```json
{
  "accessCodes": ["1234", "5678"]
}
```

#### Skip late fees for this rental

json

```json
{
  "skipLateFees": true
}
```

#### Add a note

json

```json
{
  "note": "Customer requested ground floor access"
}
```

#### Update move-out date

json

```json
{
  "endDate": "2026-08-31"
}
```

#### Set custom fields on a rental

json

```json
{
  "customFields": {
    "yourFieldKey": "value"
  }
}
```

* * *

## Jobs (Move-In / Move-Out / Tasks)

Jobs are the workflow engine behind move-ins, move-outs, and other operations. Each job has a series of `steps` that must be progressed in order.

### POST /jobs

Create a new job (e.g. move-out, task).

**Request body for a move-out:**

json

```json
{
  "type": "unit_moveOut",
  "unitRentalId": "rental_id_here",
  "data": {
    "endDate": "2026-06-30"
  }
}
```

**Request body for a task:**

json

```json
{
  "type": "task",
  "ownerId": "user_id_here",
  "data": {
    "title": "Call customer re: overdue payment",
    "assigneeId": "admin_user_id"
  }
}
```

* * *

### PUT /jobs/:jobId

Update a job — typically used to progress or cancel it.

json

```json
{
  "state": "cancelled"
}
```

* * *

### PUT /jobs/:jobId/steps/:stepId

Progress a job step. This is the primary way to advance move-in/move-out workflows and valet order flows.

**Path params:**`jobId`, `stepId` (both required — get stepId from job.steps array)

**To complete a step:**

json

```json
{
  "state": "completed"
}
```

**To complete a step with data (e.g. confirm move-in with agreement skip):**

json

```json
{
  "state": "completed",
  "data": {
    "skipGenerateAgreement": true
  }
}
```

#### Skipping agreement generation

The `generateAgreement` step appears in move-in jobs when `enableMoveInAgreement` is true on the site. To skip it programmatically:

**Option 1 — Skip the step itself** (if agreement step is active):

json

```json
PUT /jobs/:jobId/steps/:stepId
{
  "state": "skipped"
}
```

**Option 2 — Pass skip flag when confirming the move-in order step:**

json

```json
PUT /jobs/:jobId/steps/:stepId
{
  "state": "completed",
  "data": {
    "skipGenerateAgreement": true
  }
}
```

**Option 3 — Disable at site level** (affects all move-ins for that site):

```
PUT /sites/:siteId
{ "enableMoveInAgreement": false }
```

**When to use:** Use `skipGenerateAgreement: true` when you are handling agreement generation externally (e.g. via your own e-signature flow in Lovable), or when doing bulk/programmatic move-ins where no agreement is needed.

**Move-in job step sequence (typical):**

1. `order_confirm` — admin confirms the customer's order
2. `generateAgreement` — system generates the rental agreement PDF ← skip here if needed
3. `signAgreement` — customer signs (or admin marks as signed)
4. `invoice_charge` — initial invoice is charged
5. `order_complete` — move-in is finalised, access codes issued

* * *

## Valet Orders

### POST /valet-orders

Create a new valet order.

**Request body:**

json

```json
{
  "ownerId": "user_id_here",
  "date": "2026-06-10",
  "timeslot": "1000-1200",
  "address": "12 High St, London",
  "area": "zone_id_here",
  "phone": "+447700900000",
  "instructions": "Leave with concierge",
  "boxCounts": { "box_type_id": 2 },
  "charges": [],
  "customFields": {}
}
```

* * *

### PUT /valet-orders/:valetOrderId

Update a valet order.

**Path params:**`valetOrderId` (required)

json

```json
{
  "date": "2026-06-12",
  "timeslot": "1400-1600",
  "instructions": "Ring doorbell twice"
}
```

* * *

### PUT /valet-orders/:valetOrderId/steps/:stepId

Progress a valet order job step. Same pattern as unit job steps.

json

```json
{
  "state": "completed"
}
```

**Valet order step sequence:**

1. `order_start`
2. `items_pickEmptyBoxes`
3. `items_deliver`
4. `items_collect`
5. `items_store`

* * *

## Sites

### PUT /sites/:siteId

Update a site's configuration. Partial update.

**Path params:**`siteId` (required)

json

```json
{
  "enableMoveInAgreement": false,
  "moveIn_autoConfirmOrder": true,
  "moveIn_autoChargeInvoice": true,
  "moveIn_autoCompleteOrder": false,
  "bookingDaysAhead": 30,
  "bookingCutoffTime": "17:00"
}
```

**Fields relevant to move-in flow automation:**

| Field | Type | Description |
| --- | --- | --- |
| `enableMoveInAgreement` | boolean | Whether a rental agreement is generated on move-in. Set `false` to globally skip for this site. |
| `moveIn_autoConfirmOrder` | boolean | Auto-confirm customer orders without admin review |
| `moveIn_autoChargeInvoice` | boolean | Auto-charge first invoice on move-in |
| `moveIn_autoCompleteOrder` | boolean | Auto-complete move-in job once invoice paid |

* * *

## Invoices

### POST /invoices

Create a new invoice for a unit rental or ad-hoc charge.

**Request body:**

json

```json
{
  "ownerId": "user_id_here",
  "unitRentalId": "rental_id_here",
  "siteId": "site_id_here",
  "startDate": "2026-06-01",
  "endDate": "2026-06-30",
  "items": [\
    {\
      "title": "Storage rental - June",\
      "amount": 15000,\
      "quantity": 1\
    }\
  ],
  "taxPercent": 20
}
```

* * *

### PUT /invoices/:invoiceId

Update an invoice. Typically used to change state or add payments.

**Path params:**`invoiceId` (required)

#### Send an invoice

json

```json
{
  "state": "sent"
}
```

#### Void an invoice

json

```json
{
  "state": "void"
}
```

#### Mark as paid (manual payment)

json

```json
{
  "payments": [\
    {\
      "amount": 15000,\
      "method": "cash",\
      "date": "2026-06-01",\
      "notes": "Paid at reception"\
    }\
  ]
}
```

* * *

## Items (Valet)

### PUT /items

Bulk command endpoint for valet item operations.

**Request body — add items to a valet order:**

json

```json
{
  "command": "valetOrder_add",
  "itemSids": ["item_sid_1", "item_sid_2"],
  "data": {
    "valetOrderId": "order_id_here"
  }
}
```

**Request body — deliver items:**

json

```json
{
  "command": "valetOrder_deliver",
  "itemSids": ["item_sid_1"],
  "data": {
    "valetOrderId": "order_id_here"
  }
}
```

**Request body — collect items:**

json

```json
{
  "command": "valetOrder_collect",
  "itemSids": ["item_sid_1"],
  "data": {
    "valetOrderId": "order_id_here"
  }
}
```

**Request body — put away (store) items:**

json

```json
{
  "command": "valetOrder_store",
  "itemSids": ["item_sid_1"],
  "data": {
    "valetOrderId": "order_id_here",
    "location": "SHELF-A1"
  }
}
```

* * *

### PUT /items/:itemId

Update a single item.

json

```json
{
  "title": "Winter clothes box",
  "location": "SHELF-B2",
  "customFields": {
    "yourFieldKey": "value"
  }
}
```

* * *

## Authentication Notes

### API key (admin/server-side)

```
Authorization: Bearer <API_KEY>
```

Use for all server-side admin operations. Never expose in frontend code.

### Addon authentication

If calling from a Storeganise addon context:

```
Authorization: Addon <addonId>|<SG_API_KEY>
```

### User token (customer-facing flows)

For customer-facing endpoints (`/v1/` not `/v1/admin/`), authenticate via:

1. `POST /v1/auth/token` with `Authorization: Basic base64(email:password)`
2. Use returned `token` as `Authorization: Bearer <token>`

* * *

## identity\_session — Complete Integration Pattern

This is the full pattern for pre-verifying a user's identity via Stripe and injecting the result into Storeganise so the portal skips the ID check on their next booking.

### Step 1 — Create verification session in Stripe

```
POST https://api.stripe.com/v1/identity/verification_sessions
```

Use the customer's Stripe `billingId` (found on user record) as the customer reference.

### Step 2 — Customer completes verification

Send them the Stripe one-time verification URL. Do not open it yourself — it invalidates on first access.

### Step 3 — Write result to Storeganise user

Once Stripe confirms `verified` or `processing`:

```
PUT /users/:userId
Content-Type: application/json
Authorization: Bearer <API_KEY>

{
  "customFields": {
    "identitySession": "vs_1Q698sCu8o1es6nBvvRNQFXq#verified"
  }
}
```

### Step 4 — Verify it's set

```
GET /users/:userId?fields=customFields
```

Response should include:

json

```json
{
  "customFields": {
    "identitySession": "vs_1Q698sCu8o1es6nBvvRNQFXq#verified"
  }
}
```

### Step 5 — Customer books

The Customer Portal booking flow now reads `identitySession`, sees `#verified`, and skips the Stripe Identity prompt entirely. No change needed on the booking request itself.

### To clear and force re-verification

json

```json
{
  "customFields": {
    "identitySession": ""
  }
}
```

* * *

## skipGenerateAgreement — Complete Integration Pattern

Use this when you are generating the rental agreement yourself (e.g. via DocuSign, HelloSign, or your own Lovable PDF flow) and want Storeganise to skip its own agreement generation step.

### Step 1 — Start a move-in (customer submits unit order or admin creates rental)

A `unit_moveIn` job is created automatically. Fetch it:

```
GET /jobs?type=unit_moveIn&unitRentalId=:rentalId&state=active
```

### Step 2 — Find the active step

```
GET /jobs/:jobId?fields=steps
```

Response:

json

```json
{
  "steps": [\
    { "id": "step1", "type": "order_confirm", "state": "completed" },\
    { "id": "step2", "type": "generateAgreement", "state": "ready" },\
    ...\
  ]
}
```

### Step 3 — Skip or complete the agreement step

**To skip it entirely:**

```
PUT /jobs/:jobId/steps/step2
{ "state": "skipped" }
```

**Or complete the preceding confirm step with skip flag:**

```
PUT /jobs/:jobId/steps/step1
{
  "state": "completed",
  "data": { "skipGenerateAgreement": true }
}
```

### Step 4 — Continue the job

Progress remaining steps (`invoice_charge`, `order_complete`) as normal.

### Alternative: Disable agreement at site level

If you never want Storeganise to generate agreements for Big Top (because you handle it externally for all move-ins):

```
PUT /sites/:siteId
{ "enableMoveInAgreement": false }
```

This removes the `generateAgreement` step from all future move-in jobs at that site.

* * *

## Error Responses

All errors return a JSON body:

json

```json
{
  "error": {
    "message": "User not found",
    "code": "not_found"
  }
}
```

| HTTP Status | Meaning |
| --- | --- |
| 400 | Bad request — invalid body or missing required field |
| 401 | Unauthorized — missing or invalid API key |
| 403 | Forbidden — valid key but insufficient permissions |
| 404 | Not found — entity ID doesn't exist |
| 409 | Conflict — e.g. unit already occupied |
| 422 | Unprocessable — business logic violation |
| 429 | Rate limited |
| 500 | Server error |

Content is user-generated and unverified.

Storeganise Write-Side API Reference Guide \| Claude