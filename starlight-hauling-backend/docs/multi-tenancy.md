# Multitenancy

This document elaborates on our approach to multitenancy and data isolation. Here, we refer to tenants as ‘subscribers’.

**Important!!!** This document is a high-level overview of the implementation details,
which are generally irrelevant and hidden behind abstractions in the real app.
Its purpose is explaining the architecture and how everything works under the hood,
_not_ describing how to do something.

## Multitenancy on database level

On PostgreSQL level, we use DB schemas to isolate subscriber data. The following convention is used:

- if the table data is not subscriber-specific (for example, the list of subscribers themselves), put it in `admin` schema;
- if the table is subscriber-scoped, create a copy of the table under each subscriber-schema;
- subscriber schema name should be the same as the name of the subscriber in table `admin.tenants`;

so, for example, for a subscriber whose legal name is `5280 Waste Solutions`, we could have the following entry in `admin.tenants`:

```sql
-- the order of the columns is id,name,legal_name,created_at,updated_at
{1,'waste5280','5280 Waste Solutions','2020-04-13'::DATE,'2020-04-13'::DATE}
```

and schema `waste5280`.

> **Note**
>
> Bear in mind that SQL identifiers can not start with numeric characters, so we need workarounds like this.  
> Also, it is important that subscriber names do not contain characters that cannot be a part of Elasticsearch
> index names for reasons specified below. They are also used for tenant domains, so there can be no underscores or dashes.

The migration machinery is used to bootstrap new subscribers' schemas whenever an entry in `admin.tenants` table is created.
On each startup, the DB manager object picks up tenants that have not been migrated to the latest migrations yet and runs those.
The initial migration in the tenant migration creates the tenant schema.

## Multitenancy on Elasticsearch level

Since we feed database records into Elasticsearch for processing and subsequent querying, it has to be split there as well.
To achieve this, we create separate indices for each subscriber. The indices follow the pattern `{index_name}_{version}__{subscriber}`.

> **Note**
>
> This scheme is used for other kinds of scoping too. To find out more about how Elasticsearch setup works,
> see [the relevant docs](../services/elasticsearch/README.md).

## Multitenancy on application level

To access subscriber-scoped entities, we normally create an instance of the service class per tenant and cache them.
They are subsequently retrieved with static methods of the corresponding service class.
An example of this pattern is `BaseRepository` defined in `repos/_base.js`, which has `getInstance`
that implements all the caching logic. Real code is worth a thousand words. Say, we want to retrieve all orders of `waste_5280`:

```javascript
// Creates a repository that accesses only `waste_5280.orders`
const orderRepo = OrderRepository.getInstance('waste_5280');

const orders = await orderRepo.getAll();
```

Similar patterns are used for isolation of Elasticsearch data on application level with `getEsInstance` function returning
cached Elasticsearch service instances.
