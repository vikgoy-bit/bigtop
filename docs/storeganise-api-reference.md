# Storeganise Admin API Reference
## Big Top Self Storage
**Base URL:** `https://bigtopselfstorage.storeganise.com/api/v1/admin`

All endpoints require an `Authorization: Bearer <API_KEY>` header.
Currency: **GBP (£)**

### Common Query Parameters (all list endpoints)
| Parameter | Type | Description |
|-----------|------|-------------|
| `fields` | string | Comma-separated field names to return. Supports dot notation (e.g. `owner.name`). Omit to return all fields. |
| `limit` | integer | Max results to return (default: 100, max: 1000) |
| `offset` | integer | Number of results to skip (pagination) |
| `cursor` | string | ID of last item from previous page — use for efficient large pagination (enforces `order by id desc`) |
| `ids` | string | Comma-separated IDs to load specific items |
| `updatedAfter` | string | ISO 8601 or YYYY-MM-DD — returns only items updated after this date (max 40 days in the past, for incremental sync) |
| `labels` | string | Filter by label IDs — space-separated = OR, `*`-separated = AND |

---

## Settings

### GET /settings
Returns business configuration. Sensitive fields (payment keys, SSO secrets, API keys) are automatically redacted.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `fields` | string | Subset of fields to return |
| `include` | string | Extra fields: `userCustomFields`, `unitCustomFields`, `unitRentalCustomFields` |

**Response fields:**
`id`, `name`, `subdomain`, `timezone`, `currency`, `locale`, `billingMode`, `selfStorage`, `valetStorage`, `features`, `areas`, `plans`, `products`, `items`, `promos`, `unitPromos`, `unitTags`, `accountingCodes`, `manualPaymentMethods`, `userCharges`, `footerLinks`, `webhooks`, `webtasks`, `apiKeys`, `customDomains`

---

## Sites

### GET /sites
List all storage facility sites.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Free-text search by name |
| `include` | string | Extra fields: `customFields`, `positions` |
| *(+ common params)* | | |

**Response fields:**
`id`, `title`, `subtitle`, `code`, `image`, `address`, `phone`, `email`, `info`, `hours`, `lat`, `lng`, `measure`, `hidden`, `enableUnitBooking`, `enableMoveInAgreement`, `moveIn_autoConfirmOrder`, `moveIn_autoChargeInvoice`, `moveIn_autoCompleteOrder`, `availability`, `occupancy`, `unitTypeGroups`, `unitTypes`, `products`, `lateFees`, `labels`, `sec_plugin`, `sec_events`, `area_gross`, `area_net`, `excludedBookingDates`, `bookingDaysAhead`, `bookingCutoffTime`, `invoice_prefix`, `invoice_counter`, `invoice_zeroPadding`, `created`, `updated`

---

### GET /sites/:siteId
Get a single site by ID.

**Path params:** `siteId` (required)

**Query params:** `fields`, `include` (`customFields`, `positions`)

---

## Unit Types

### GET /unit-types
List unit type definitions (sizes/categories of storage units).

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `siteId` | string | Filter to unit types at this site |
| `groupId` | string | Filter to unit types in this group |
| `tagIds` | string | Comma-separated tag IDs to filter by |
| `search` | string | Free-text search |
| `include` | string | Extra fields: `customFields`, `site`, `priceRange` |
| *(+ common params)* | | |

**Response fields:**
`id`, `siteId`, `groupId`, `title`, `subtitle`, `info`, `code`, `image`, `imageFit`, `hidden`, `deposit`, `deposit_display`, `price`, `price_display`, `price_dynamic`, `price_before`, `availability`, `occupancy`, `tagIds`, `charges`, `occupancyPrices`, `systemCharges`, `order`, `labels`, `annotations`, `tags`, `created`, `updated`

---

### GET /unit-types/:unitTypeId
Get a single unit type by ID.

**Path params:** `unitTypeId` (required)

**Query params:** `fields`, `include` (`customFields`, `site`, `priceRange`)

---

## Units

### GET /units
List storage units.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `siteId` | string | Filter to units at this site |
| `typeId` | string | Filter to units of this unit type |
| `ownerId` | string | Filter to units rented by this user |
| `state` | string | `available`, `occupied`, `overdue`, `locked`, `blocked`, `archived` |
| `floor` | string | Filter by floor (comma-separated for multiple) |
| `featureIds` | string | Comma-separated feature IDs |
| `search` | string | Free-text search |
| `include` | string | Extra fields: `rental`, `customFields`, `features`, `jobs` |
| *(+ common params)* | | |

**Response fields:**
`id`, `siteId`, `typeId`, `name`, `state`, `width`, `length`, `height`, `measure`, `floor`, `defaultDeposit`, `defaultPrice`, `ownerId`, `rentalId`, `blockedReason`, `overdue`, `featureIds`, `labels`, `archived`, `archivedReason`, `created`, `updated`

---

### GET /units/:unitId
Get a single storage unit by ID.

**Path params:** `unitId` (required)

**Query params:** `fields`, `include` (`rental`, `customFields`, `features`, `jobs`)

---

## Unit Rentals

### GET /unit-rentals
List unit rental records (active occupancies and historical).

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `siteId` | string | Filter to rentals at this site |
| `unitId` | string | Filter to rentals for this unit |
| `ownerId` | string | Filter to rentals for this user |
| `state` | string | `active`, `ended`, `reserved` |
| `start` | string | YYYY-MM-DD — rentals starting after this date |
| `end` | string | YYYY-MM-DD — rentals starting before this date |
| `search` | string | Free-text search |
| `include` | string | Extra fields: `unit`, `owner`, `customFields`, `agreementUrl`, `activeJob`, `activeJobs`, `nextInvoiceDate` |
| *(+ common params)* | | |

**Response fields:**
`id`, `unitId`, `siteId`, `ownerId`, `parentId`, `state`, `startDate`, `endDate`, `price`, `priceUpdated`, `deposit`, `depositBalance`, `prepaymentBalance`, `revenueBalance`, `unpaidBalance`, `charges`, `invoiceDate`, `billedUntil`, `systemCharges`, `accessCodes`, `overdue`, `overlocked`, `skipLateFees`, `note`, `moveInJobId`, `moveOutJobId`, `promoCodeId`, `created`, `updated`

---

### GET /unit-rentals/:unitRentalId
Get a single unit rental by ID.

**Path params:** `unitRentalId` (required)

**Query params:** `fields`, `include` (`unit`, `owner`, `customFields`, `agreementUrl`, `activeJob`, `activeJobs`, `nextInvoiceDate`)

---

## Users

### GET /users
List users (customers and team members).

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `state` | string | `active`, `inactive`, `locked` |
| `roles` | string | Comma-separated: `admin`, `user`, `api` |
| `plan` | string | Filter by plan |
| `market` | string | Filter by market ID |
| `search` | string | Free-text search (name, email, phone) |
| `include` | string | Extra fields: `customFields`, `visits`, `valetOrders`, `items`, `units`, `stats`, `billing`, `settings` |
| *(+ common params)* | | |

**Response fields:**
`id`, `name`, `firstName`, `lastName`, `email`, `phone`, `phone2`, `address`, `altContactName`, `altContactEmail`, `altContactPhone`, `altContactAddress`, `area`, `companyName`, `companyId`, `personalId`, `roles`, `permissions`, `isDisabled`, `disabledReason`, `isActive`, `hasItemsInStorage`, `itemCounts`, `invoiceDate`, `billingTrigger`, `billingMethod`, `language`, `note`, `overdue`, `signinAt`, `emailConfirmed`, `market`, `planId`, `promoCode`, `referCode`, `charges`, `credits`, `deposits`, `files`, `labels`, `adminEmails`, `created`, `updated`

---

### GET /users/:userId
Get a single user by ID.

**Path params:** `userId` (required)

**Query params:** `fields`, `include` (`customFields`, `visits`, `valetOrders`, `items`, `units`, `stats`, `billing`, `settings`)

---

## Invoices

### GET /invoices
List invoices.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ownerId` | string | Filter to invoices for this user |
| `siteId` | string | Filter to invoices for this site |
| `unitRentalId` | string | Filter to invoices for this unit rental |
| `state` | string | `draft`, `sent`, `paid`, `overdue`, `void`, `credited` |
| `start` | string | YYYY-MM-DD — invoices after this date |
| `end` | string | YYYY-MM-DD — invoices before this date |
| `search` | string | Free-text search |
| `include` | string | Extra fields: `customFields`, `billing`, `billingMethod` |
| *(+ common params)* | | |

**Response fields:**
`id`, `sid`, `owner`, `type`, `state`, `siteId`, `unitRentalId`, `parentId`, `parentJobId`, `startDate`, `endDate`, `items`, `payments`, `taxPercent`, `creditApplied`, `subtotal`, `tax`, `total`, `amountPaid`, `balance`, `overdue`, `sent`, `paid`, `failed`, `shareId`, `tags`, `meta`, `labels`, `entries`, `deleted`, `created`, `updated`

---

### GET /invoices/:invoiceId
Get a single invoice by ID.

**Path params:** `invoiceId` (required)

**Query params:** `fields`, `include` (`customFields`, `billing`, `billingMethod`)

---

## Invoice Payments

### GET /invoice-payments
List all invoice payments across the business.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ownerId` | string | Filter to payments by this user |
| `siteId` | string | Filter to payments for this site |
| `unitRentalId` | string | Filter to payments for this unit rental |
| `method` | string | Filter by payment method |
| `start` | string | YYYY-MM-DD — payments after this date |
| `end` | string | YYYY-MM-DD — payments before this date |
| `limit` | integer | Max results |
| `offset` | integer | Skip results |

**Response fields:**
`id`, `invoiceId`, `owner`, `type`, `amount`, `date`, `method`, `notes`, `data`, `created`

---

## Jobs

### GET /jobs
List background jobs (move-ins, move-outs, invoicing, tasks, etc.).

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | `unit_moveIn`, `unit_moveOut`, `unit_invoice`, `unit_transfer`, `unit_block`, `unit_unblock`, `invoice_create`, `invoice_overdue`, `task`, `webhook`, `valet_order` |
| `state` | string | `active`, `inactive`, `ready`, `completed`, `failed` |
| `ownerId` | string | Filter to jobs for this user |
| `siteId` | string | Filter to jobs at this site |
| `unitRentalId` | string | Filter to jobs for this unit rental |
| `targetId` | string | Filter by target entity ID (comma-separated for multiple) |
| `targetType` | string | `user`, `site`, `unit`, `unitRental`, `invoice`, `addon` |
| `assigneeId` | string | Filter by assignee user ID (task jobs) |
| `orderState` | string | Filter by internal order state |
| `start` | string | YYYY-MM-DD |
| `end` | string | YYYY-MM-DD |
| *(+ common params)* | | |

**Response fields:**
`id`, `sid`, `type`, `state`, `step`, `steps`, `data`, `result`, `ownerId`, `requiresInput`, `error`, `labels`, `created`, `updated`

---

### GET /jobs/:jobId
Get a single job by ID or short ID (sid).

**Path params:** `jobId` (required)

**Query params:** `fields`

---

## Valet Orders

### GET /valet-orders
List valet storage orders.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ownerId` | string | Filter to orders for this user |
| `driverId` | string | Filter by assigned driver |
| `state` | string | Filter by order state |
| `area` | string | Filter by delivery area |
| `start` | string | YYYY-MM-DD |
| `end` | string | YYYY-MM-DD |
| `search` | string | Free-text search |
| `include` | string | Extra fields: `customFields`, `job`, `owner`, `items` |
| *(+ common params)* | | |

**Response fields:**
`id`, `sid`, `state`, `ownerId`, `ownerName`, `driverId`, `driverName`, `address`, `area`, `phone`, `altPhone`, `instructions`, `date`, `timeslot`, `collect`, `collectDate`, `collectTimeslot`, `nextDate`, `nextTimeslot`, `boxCounts`, `bulkyCounts`, `bulkyItems`, `empties`, `productCounts`, `products`, `deliverItems`, `collectItems`, `charges`, `promoCode`, `labels`, `created`, `updated`

---

### GET /valet-orders/:valetOrderId
Get a single valet order by ID.

**Path params:** `valetOrderId` (required)

**Query params:** `fields`, `include` (`customFields`, `job`, `owner`, `items`)

---

## Items (Valet Storage Items)

### GET /items
List items in valet storage.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `ownerId` | string | Filter to items owned by this user |
| `valetOrderId` | string | Filter to items in this valet order |
| `state` | string | Filter by item state |
| `type` | string | Filter by item type |
| `location` | string | Filter by item location |
| `search` | string | Free-text search |
| `include` | string | Extra fields: `customFields` |
| *(+ common params)* | | |

**Response fields:**
`id`, `sid`, `type`, `typeTitle`, `typeImage`, `state`, `title`, `desc`, `owner`, `ownerId`, `location`, `image`, `images`, `opsImage`, `opsImages`, `opsTitle`, `isBulky`, `valetOrderId`, `labels`, `config`, `created`, `updated`

---

### GET /items/:itemId
Get a single item by ID.

**Path params:** `itemId` (required)

**Query params:** `fields`, `include` (`customFields`)

---

## Markets (Valet)

### GET /markets
List all valet/parking markets for the business.

**Query params:** `fields`

**Response fields:**
`id`, `name`, `isDefault`, `title`, `collectionWaitTime`, `maxVisitsPerTimeslot`, `visitBookingCutoffTime`, `bookingDaysAhead`, `excludedVisitDates`, `timeslots`, `charges`, `plans`, `items`, `products`, `created`, `updated`

---

## Actions (Audit Trail)

### GET /actions
List the audit trail of actions/changes across the business.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by action type |
| `limit` | integer | Max results |
| `offset` | integer | Skip results |

**Response fields:**
`id`, `type`, `user`, `data`, `extraData`, `date`, `hidden`

---

### GET /actions/:targetId
Get the action history for a specific entity (user, unit, rental, invoice, etc.) by its ID.

**Path params:** `targetId` (required) — any entity ID (user, unit, unitRental, invoice, etc.)

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by action type |
| `limit` | integer | Max results |
| `offset` | integer | Skip results |

**Response fields:**
`id`, `type`, `user`, `data`, `extraData`, `date`, `hidden`

---

## Addons

### GET /addons
List installed third-party addon integrations for the business.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `siteId` | string | Filter to addons for this site |
| `state` | string | `enabled`, `paused`, `disabled` |
| *(+ common params)* | | |

**Response fields:**
`id`, `addonConfigId`, `siteId`, `state`, `price`, `disabledReason`, `customFields`, `created`, `updated`

---

### GET /addons/:addonId
Get a single installed addon by ID.

**Path params:** `addonId` (required)

**Query params:** `fields`

---

## Addon Configs

### GET /addon-configs
List available addon configuration templates.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `state` | string | Filter by config state |
| `tags` | string | Comma-separated tags |
| *(+ common params)* | | |

**Response fields:**
`id`, `title`, `subtitle`, `image`, `info`, `instructions`, `price`, `tags`, `state`, `addonCustomFields`, `websiteBlock`, `websiteCsp`, `created`, `updated`

---

### GET /addon-configs/:addonConfigId
Get a single addon configuration template by ID.

**Path params:** `addonConfigId` (required)

**Query params:** `fields`

---

## Reports

### GET /reports
List business-level aggregated reports (all sites combined).

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `start` | string | YYYY-MM-DD |
| `end` | string | YYYY-MM-DD |
| *(+ common params)* | | |

**Response fields:**
`id`, `date`, `stats`

---

## Site Reports

### GET /site-reports
List per-site daily report snapshots.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `siteId` | string | Filter to a specific site |
| `start` | string | YYYY-MM-DD |
| `end` | string | YYYY-MM-DD |
| *(+ common params)* | | |

**Response fields:**
`id`, `siteId`, `date`, `availability`, `occupancy`, `area`, `revenue`, `invoices`, `jobs`, `created`

---

## API Request Counts

### GET /request-counts
List API request count statistics — useful for monitoring API usage.

**Query params:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `clientId` | string | Filter by API client ID |
| `endpoint` | string | Filter by API endpoint |
| `groupBy` | string | Group results by field (e.g. `clientId`, `endpoint`) |
| `period` | string | Time period for grouping |
| `limit` | integer | Max results |
| `offset` | integer | Skip results |

**Response fields:**
`id`, `period`, `clientId`, `endpoint`, `count`, `points`

---

## Notes for Lovable

### Authentication
```
Authorization: Bearer <API_KEY>
```
API keys are configured in the Storeganise admin portal under Settings → API Keys. Never expose keys client-side; all calls should be server-side only.

### Pagination
Two strategies:
- **Offset pagination:** `limit` + `offset` — simple but slower on large datasets
- **Cursor pagination:** `cursor` = last ID from previous page — efficient for large lists, enforces `order by id desc`

### Selective field loading
Always use `fields` to request only what you need. Example:
```
GET /users?fields=id,name,email,overdue&state=active
```

### Related data with `include`
Use `include` to fetch related entities in a single request. Only use on detail endpoints or small lists (< 50 items):
```
GET /unit-rentals/:id?include=unit,owner,agreementUrl
```

### Incremental sync
Use `updatedAfter` for syncing to external systems (max 40 days in the past):
```
GET /invoices?updatedAfter=2026-05-01
```

### Caching
`GET /settings`, `GET /sites`, `GET /unit-types` return mostly static data — cache these aggressively.
