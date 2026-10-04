# Business Growth permission matrix

This matrix covers the Business Growth workspace: Overview, Funnels, Customers, Counselors (the existing `/councillor` route), and My Customer. **Counselor** is the canonical user-facing spelling for the lead-follow-up role. Existing route, API, Redux, authentication, and MongoDB identifiers retain their `councilor` / `councillor` spellings for compatibility. The matrix also covers the legacy direct Spend API, which is not a sixth dashboard tab. It does not change authorization for unrelated dashboard areas.

The module landing page is `/dashboard/business-growth`. Its five tab routes are `/dashboard/business-growth/overview`, `/dashboard/business-growth/funnels`, `/dashboard/business-growth/customer`, `/dashboard/business-growth/councillor`, and `/dashboard/business-growth/my-customer`. The legacy `/dashboard/business-growth/task` and `/dashboard/admin/business-growth` tab URLs redirect to the current matching tab.

`R` means read, `C` create, `U` update, and `D` delete.

| Role                | Overview | Funnels | Counselors | Customers                      | My Customer                                        |
| ------------------- | -------- | ------- | ---------- | ------------------------------ | -------------------------------------------------- |
| Admin / Super Admin | CRUD     | CRUD    | CRUD       | CRUD                           | R/U/D on customers assigned to the signed-in email |
| Developer           | CRUD     | CRUD    | CRUD       | CRUD                           | R/U/D on customers assigned to the signed-in email |
| Counselor           | R        | R       | R          | R/U on assigned customers only | R/U on customers assigned to the signed-in email   |

Counselors cannot create or delete customers, assign or reassign customers, change a customer's Counselor assignment, or use bulk customer mutations. My Customer follow-up notes are stored on customer records; a Counselor may update follow-ups only through an update to a customer assigned to that Counselor. The API stamps the authenticated actor on changed follow-ups. Counselors cannot create or delete customer records through the My Customer view.

The matrix grants Admin and Developer full CRUD permissions across the shared management areas. My Customer is intentionally email-scoped and supports only the applicable customer actions for records assigned to the signed-in email. Overview is an aggregate read surface today, so it has no record mutation endpoint; the related funnel, customer, Counselor, and task records support the applicable writes. Direct Spend list and mutation endpoints are restricted to Admin, Super Admin, and Developer. The Overview may still display aggregate spend metrics to roles with Overview read access.

Other named custom roles keep their explicit sidebar permissions. API permissions for those roles are checked against the matching Business Growth area instead of a shared permission for the whole feature. They do not receive Admin, Developer, or Counselor role overrides.

## Server enforcement

- Role names are case-insensitive. Admin aliases are `Admin`, `Administrator`, `Super Admin`, and `Super Administrator`; `Developer` receives the same Business Growth CRUD access. Legacy session role values `Councilor` and `Councillor` remain recognized as Counselor-role aliases.
- Page and sidebar permissions are derived from the same role matrix. API handlers authorize the requested resource (`overview`, `funnels`, `councilors`, `customers`, `tasks`, or `spends`) and target (collection, item, or bulk operation).
- Counselor customer reads use the linked Counselor record and assignment ID. My Customer reads are server-filtered to the authenticated session's normalized email, including for Admin and Developer; no client-supplied email filter is trusted.
- Counselor item updates require that ownership check and reject `councilorId` and `councilorEmail` changes. My Customer mutations use the authenticated session email for every role and reject assignment changes. Collection creation, all delete methods, and all bulk mutations are denied to Counselors.
- A customer's `councilorId` is the authoritative owner. Legacy rows with only `councilorEmail` remain assigned; a normal Assign request returns HTTP 409 for an already assigned customer. Explicit Reassign uses a compare-and-set update against the observed owner, so concurrent requests cannot both replace it. Conflict responses include the affected customer IDs; each customer update is atomic.
- Admin and Developer overrides apply only to Business Growth; all unrelated dashboard routes keep their existing authorization rules.
- Business Growth API authorization still checks the role and this matrix when the global `AuthorizationEnable=false` bypass is set. That global bypass remains in effect for unrelated dashboard areas.

## Counselor progress metrics

The Overview response includes a team summary, and each item from `GET kind=councilors` includes the same per-Counselor summary shape. The server derives both from currently assigned customer records and their existing follow-ups; the client only renders returned values.

- A working assignment is a currently assigned customer whose status is not `inactive` or `archived`. `lead` and legacy records without a status are treated as working, consistent with customer status summaries.
- Activity counts follow-up entries on currently assigned customers when `followUps.authorEmail` matches that Counselor's normalized email. Each period reports follow-up count and distinct customers touched. Missing or unrecognized authors are not attributed to a Counselor.
- Daily, weekly, and monthly are calendar periods in `Asia/Dhaka`, from local midnight today, Monday, and the first of the month, respectively, through one captured `asOf` instant. The `from` bound is inclusive and `to` is exclusive; all periods are period-to-date.
- The response includes the timezone and ISO `from`, `to`, and `asOf` values. Assignment history is not stored, so activity is associated with the customer's current Counselor assignment.
- The existing My Customer summary field `counsellingLast24Hours` remains a separate rolling 24-hour count for compatibility; it is not the new Asia/Dhaka calendar-day metric.
