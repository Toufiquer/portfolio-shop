# Leads

`/dashboard/leads` contains five navigation cards. Its subpages are Overview,
Funnels, Customers, Councilors, and My Leads. Existing installations receive
role-filtered navigation immediately; `/tools/import-data` also includes the
permanent sidebar defaults.

## Access and assignment

Leads recognizes Admin and Councilor roles from the existing Access and Role
records. Counselor/Councillor/Counsellor spellings are accepted for existing
roles. These checks remain active when `AuthorizationEnable=false`.

An Admin creates an active councilor contact using the person's login email,
then assigns their Councilor role through the existing Admin Access editor.
Adding a contact does not grant an account a role. Inactive councilor contacts
and blocked Access records cannot use the Leads API.

| Action                                        | Admin                                 | Councilor                             |
| --------------------------------------------- | ------------------------------------- | ------------------------------------- |
| Read overview, funnels, councilors, customers | Yes                                   | Yes                                   |
| Manage funnels and councilors                 | Yes                                   | No                                    |
| Add/import customers                          | Yes                                   | Yes, assigned to themselves           |
| Edit/delete/bulk-update customers             | All                                   | Their own assignments                 |
| Assign, reassign, or unassign                 | Customers page                        | No                                    |
| Take an unassigned active, unblocked customer | Use Assign                            | Atomic claim                          |
| Record counselling                            | Their own active, unblocked customers | Their own active, unblocked customers |
| My Leads reads and writes                     | Their own assignments                 | Their own assignments                 |

My Leads uses the normalized authenticated session email for reads, writes,
imports, and exports. Its assignment filters only narrow that scope. Supplying
another email or removing `mine` never expands a Councilor's mutation rights.

## Records

Customer mobile numbers are unique across both customer pages and imports.
Formatting is removed; Bangladesh local `01…`, `8801…`, and `+8801…` numbers
share a canonical key. International numbers are stored with `+`. Email is
optional for customers and required/unique for councilor contacts.

Funnel positions are positive unique integers. Editing to an occupied position
returns a conflict; choose an unused position. Referenced funnels/councilors
cannot be deleted until their customers are moved/reassigned. A councilor's
email cannot change while it owns customer assignments.

Lists use RTK Query, pagination, and page sizes 10/25/50/100. Typing filters the
loaded page first. When it has no match, Search database submits the query to
MongoDB. Export applies the current search and filters across all result pages.
Refresh buttons have a 60-second countdown.

## Excel

Customers and councilors support `.xlsx` export and `.xlsx`/`.xls` import.
Download the page's template. Each import accepts at most 100 data rows and
5 MB. Store Mobile cells as text to preserve leading zeros.

Customer headers: `Name`, `Mobile`, `Email`, `Funnel ID`, `Status`, `Blocked`.
Councilor headers: `Name`, `Mobile`, `Email`, `Status`.
Find a Funnel ID in its View dialog. Status defaults to active; Blocked defaults
to false. Assignment fields in exports are informational and cannot assign
imported records. The server validates each imported row and reports row-level
failures; successful rows stay saved. Reimport only corrected failed rows.

## Metrics

Summary counts come from all stored customers. New in 30 days and counselling
in the last 24 hours use rolling server-time windows. Counselling counts sessions
created through Mark counselled, rather than generic customer edits.

Graphs cover the last 12 calendar months in Asia/Dhaka. Customer growth counts
creation dates. Business facts counts new customers, assignments, and counselling
events. Distribution and funnel charts show the current status/funnel of each
month's newly created customers; these are cohorts, not historical snapshots.
No revenue figures are inferred from customer records.

## Verification

`npm run test:leads` creates a random disposable MongoDB database, seeds synthetic
accounts, starts an isolated app at `http://127.0.0.1:3001`, exercises the real
authenticated HTTP handlers, and removes its server/database. It never writes
to the application's configured database. Redis, email delivery, and OAuth are
disabled in this test process. Stop any existing `next dev` first because Next
shares its local development lock.

Use `node scripts/test-leads.cjs --authorization-disabled` to repeat the same
ownership checks with general dashboard authorization disabled. `--keep-open`
leaves the disposable app available for browser QA until Ctrl+C. Synthetic
accounts are `qa-admin@example.test`, `qa-councilor-a@example.test`, and
`qa-councilor-b@example.test`, with password `Leads-QA-only-2026!`.
