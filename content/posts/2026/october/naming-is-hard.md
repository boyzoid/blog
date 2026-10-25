---
title: 'Naming Things is Hard'
date: 2026-10-26T06:00:00
image: 2026/naming/header.png
tags: [ "Coding", "Database", "Tips" ]
description: A cryptic constraint name in a meme got me thinking about the naming conventions I rely on for tables, keys, and code, and why they sometimes need to change.
---

I shared a meme [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7516834181591646208?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAAnXxcBZjEDWwCw5j05YNBM72lQlGWdNio) because it made me laugh. Then I kept looking at the constraint name at the bottom.

`PK__LAW__3214EC07B14E510A`.

I would like to cooperate, officer, but I may need a minute to figure out what I did.

`PK` gives me a clue that this is a primary key constraint. `LAW` suggests the table involved. The rest gives me something to copy into a search box. A name such as `pk_law_id` would give me a much better starting point for understanding the violation.

That is a lot to ask of a meme, but it gets at something I care about when I build databases and write code: names should help the person reading them understand what is happening.

A useful name gives me enough context to keep working. A consistent naming convention helps me predict what related things will be called. Together, they save me from having to look up details that the names themselves could have explained.

I have some preferences for getting there. I have also worked on projects where following a naming rule too rigidly left us with names that needed their own explanation.

## The conventions I start with

I have preferences. Strong ones, in some cases. I also know that a convention earns its place by making a project easier to understand.

For databases, I start with singular table names, primary key columns named `id`, foreign key constraint names that list the referencing table and column before the referenced table and column, and `snake_case` for database objects. In code, I use `camelCase` for variables, functions, and methods, and `PascalCase` for class names.

Here is what that looks like in practice:

| Thing | Example |
| --- | --- |
| Table | `account`, `role`, `purchase_order` |
| Primary key column | `id` |
| Foreign key column | `role_id` referencing `role.id` |
| Primary key constraint | `pk_account_id` |
| Foreign key constraint | `fk_account_role_id_role_id` |
| Variable | `purchaseOrder` |
| Function or method | `getPurchaseOrder()` |
| Class | `PurchaseOrder` |

These choices let me make useful predictions before I open a schema diagram or search the codebase.

### Singular table names

I use `account`, `role`, and `purchase_order`. Each row represents an account, a role, or a purchase order, and the table name identifies that kind of thing.

Singular names also save me from debating irregular plurals or wondering whether the next developer chose `person`, `people`, or `persons`.

A team can work successfully with plural names. My preference is singular, and I want the choice applied consistently enough that nobody has to guess table by table.

### Primary keys named id

My primary key column is `id`.

The table already supplies the context: `account.id`, `role.id`, and `purchase_order.id`. I do not need to repeat the table name inside its own primary key column.

When a query includes several IDs, I qualify the columns and give the results useful aliases:

```sql
select
    account.id as account_id,
    role.id as role_id
from account
join role on account.role_id = role.id;
```

The column stays predictable, and the query makes the context explicit.

### Foreign keys that explain the relationship

For a foreign key column, I use the referenced table and column to describe what it points to. A reference to `role.id` becomes `role_id` in `account`.

Column names and constraint names serve different purposes. The column names the reference; the constraint identifies the relationship being enforced.

For the constraint name, I put the referencing table and column first, followed by the referenced table and column. The table containing the primary key comes last:

```text
fk_account_role_id_role_id
```

Read that as “`account.role_id` references `role.id`.” A primary key constraint follows the simpler pattern `pk_account_id`.

There is a useful exception when a table references the same target more than once. An order might have both `billing_address_id` and `shipping_address_id`, each referencing `address.id`. Calling both columns `address_id` cannot express those two roles. The names need that extra context.

### Predictable casing

In the database, I use names such as `purchase_order`, `created_at`, and `account_id`.

In code, those become names such as `purchaseOrder`, `createdAt`, and `accountId`. Classes start with a capital letter: `PurchaseOrder`, `Account`, and `Role`.

Casing gives me a quick visual cue about what I am reading. Consistency also means I can spend less time remembering whether this particular method is `get_purchase_order`, `GetPurchaseOrder`, or `getPurchaseOrder`.

## Abbreviations should save effort for the reader

Short names can become expensive to read.

Consider `usrSvc`. It takes fewer characters than `userService`, but someone unfamiliar with the project has to expand it mentally before they can understand it. Even then, they may be unsure what it means.

I am comfortable with widely understood abbreviations such as `id` and `url`. A private vocabulary of shortened words is harder to justify. If someone needs a glossary to read an ordinary method name, we have probably gone too far.

The other extreme causes problems too. A name such as `retrieveAllCurrentlyActivePurchaseOrderRecordsForAccount` makes the reader work through a sentence to find the operation.

Depending on the surrounding class and the method's actual behavior, `findActiveForAccount(accountId)` might say everything necessary. If the function stands alone, `findActivePurchaseOrdersForAccount(accountId)` may need the extra context.

The right length depends on what the reader already knows at that location. I want each word to contribute meaning, and I want familiar words left readable.

## How we ended up with ServiceLineServiceService

On one project, we did not have the full scope at the beginning. We had classes such as `UserService` and `RoleService`. Appending `Service` to the entity name seemed reasonable.

Then we discovered business entities named `Service`, `ServiceLine`, and `ServiceLineService`.

Following our convention gave us:

```text
ServiceService
ServiceLineService
ServiceLineServiceService
```

Every name followed the rule. Reading them still required explanation.

`ServiceLineService` was especially awkward: was that the business entity with that name, or the application service for a `ServiceLine`? The same sequence of words could describe two different things.

The first `Service` could be business vocabulary. The last could be an architectural suffix. In `ServiceLineServiceService`, the reader had to figure out where one meaning ended and the other began.

## What could have helped

Learning more of the domain vocabulary earlier might have exposed the collision. We could have reviewed a small set of business terms alongside our proposed class names before applying the pattern everywhere.

That would not guarantee we discovered every entity. Requirements evolve, and some names only become awkward as a system grows. We also needed permission to revise the convention when it stopped helping.

Several approaches could have improved those names.

**Use a deliberate abbreviation to distinguish the architectural role.** We could have reserved `Service` for the business vocabulary and used `Svc` as the suffix for application service classes. That would give us this distinction:

| Business entity | Application service class |
| --- | --- |
| `Service` | `ServiceSvc` |
| `ServiceLine` | `ServiceLineSvc` |
| `ServiceLineService` | `ServiceLineServiceSvc` |

`ServiceLineSvc` would then clearly identify the application service for a `ServiceLine`, while `ServiceLineService` would retain its business meaning. This is where a selective abbreviation can help: it gives two different meanings visibly different names. Unlike shortening the entire name to `usrSvc`, it preserves the domain words and abbreviates one agreed architectural suffix. The team would need to document that distinction and apply it consistently. It would reduce the collision, though a more specific responsibility name could still explain the class better.

**Name classes for their responsibilities.** If a class retrieves stored services, `ServiceRepository` may describe it accurately. If it maintains a catalog, `ServiceCatalog` may fit. If it assigns services to service lines, `ServiceLineAssignment` may express its purpose. Those names depend on what the class actually does; replacing every `Service` suffix with `Manager` would leave us with much the same problem.

**Name specific operations.** A class with one focused job might be `AssignServiceToLine` or `UpdateServiceLine`. We would need to examine the responsibilities before making that change, but the resulting name could tell the reader more than another generic suffix.

**Use namespaces or modules for architectural context.** A model might be `domain.ServiceLineService`, while the application component is `application.ServiceLineServiceHandler`, if handling requests is its job. For a focused use case, `application.AssignServiceToLine` may be clearer still. Package structure can supply context that otherwise gets repeated in every class name, although imports and logs still need to remain understandable.

**Revisit a domain term when it is genuinely unclear.** If `ServiceLineService` means an association between a service line and a service, the team might agree that `ServiceLineAssignment` expresses that relationship better. But we should establish what it means with the people who understand the domain. Renaming a meaningful business term purely to accommodate a coding suffix can make conversations harder.

The lesson I took from that experience was that naming conventions need room to change as our understanding improves.

## Making naming a little easier

Naming things is hard because we are trying to communicate what something means, how it relates to other things, and sometimes what responsibility it has—all while our understanding of the system is still changing.

Conventions help. Singular tables, `id` primary keys, descriptive foreign keys, and consistent casing give me a starting point. They make ordinary names predictable and leave me more attention for the decisions that need it.

There is still judgment involved. I have to decide whether an abbreviation will be understood, whether a longer name adds useful context, and whether a familiar pattern still fits the domain. Sometimes that means adding a word, as with `billing_address_id`. Sometimes it means agreeing that `Svc` identifies an application service so that `ServiceLineService` can keep its business meaning.

I also have to be willing to revisit a name when I learn something new. Ending up with `ServiceLineServiceService` is a pretty good signal that the convention needs another look.

I want the next person reading my code or querying my database to spend less time deciphering names. That next person may well be me, six months from now, with very little memory of why any of this seemed obvious.

And if I violate a constraint, I would appreciate a name that helps me understand the charge.
