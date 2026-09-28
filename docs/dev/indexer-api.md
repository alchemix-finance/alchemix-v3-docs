---
sidebar_position: 6
hide_title: true
title: Indexer API
description: Query Alchemix v3 events and protocol state across every chain through the public Ponder indexer, over GraphQL or SQL.
keywords: [indexer, subgraph, graphql, sql, ponder, api, analytics]
---

import PageBanner from "@site/src/components/PageBanner";

<PageBanner title="Indexer API" />

Alchemix runs a public [Ponder](https://ponder.sh) indexer that tracks every Alchemix v3 deployment and serves the data over GraphQL and SQL over HTTP. Dashboards, analytics, bots and frontends can read protocol history from it directly, so they skip log scanning and RPC calls.

| Endpoint   | Value |
| ---------- | ----- |
| Base URL   | `https://ponder.alchemix.fi` |
| GraphQL    | `POST https://ponder.alchemix.fi/graphql` |
| SQL        | `https://ponder.alchemix.fi/sql` (through `@ponder/client`) |
| Playground | Open [ponder.alchemix.fi](https://ponder.alchemix.fi) in a browser |
| Chains     | Ethereum, Optimism, Arbitrum One, Base |
| Auth       | None. The API is public, read-only and CORS-enabled. |

## Quick start

This request returns the latest protocol snapshots across all Alchemists:

```bash
curl -s https://ponder.alchemix.fi/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ alchemistStats(orderBy: \"timestamp\", orderDirection: \"desc\", limit: 5) { items { chain alchemist totalDebt underlyingtvl timestamp } } }"}'
```

The same pattern from JavaScript or TypeScript, here fetching the 10 most recent deposits on Ethereum:

```ts
const res = await fetch("https://ponder.alchemix.fi/graphql", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    query: `
      query RecentDeposits($chain: String!) {
        alchemistDeposits(
          where: { chain: $chain }
          orderBy: "timestamp"
          orderDirection: "desc"
          limit: 10
        ) {
          items { alchemist amount recipientId txHash timestamp }
        }
      }
    `,
    variables: { chain: "mainnet" },
  }),
});

const { data, errors } = await res.json();
if (errors) throw new Error(errors[0].message);
console.log(data.alchemistDeposits.items);
```

:::tip
The GraphQL playground at [ponder.alchemix.fi](https://ponder.alchemix.fi) has autocomplete and a schema browser covering every table and filter. It is the quickest way to explore the data.
:::

## Deployments

Every row carries a `chain` field. Filter on these exact values:

| `chain` value | Network      | Chain ID |
| ------------- | ------------ | -------- |
| `mainnet`     | Ethereum     | 1        |
| `optimism`    | Optimism     | 10       |
| `arbitrumOne` | Arbitrum One | 42161    |
| `base`        | Base         | 8453     |

Each chain has one Alchemist per alAsset, and each Alchemist has its own Transmuter and Mix-Yield Token (MYT) vault. Base has a single alUSDb market. Full address lists for each chain are on the [Deployed Contracts](/dev/contracts/ethereum) pages.

| Chain         | alAsset | Alchemist                                    | Transmuter                                   | MYT vault                                    |
| ------------- | ------- | -------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| `mainnet`     | alETH   | `0xfa995b6abc387376c3e7de5f6d394ab5b6bee26b` | `0x073598132f37756a7e665fb52f1757463120bd3c` | `0x29bcfed246ce37319d94eba107db90c453d4c43d` |
| `mainnet`     | alUSD   | `0xeb83112d925268bede86654c13d423a987587e3e` | `0x2584e8b0616b3e750492c9629a3b27679c410cb9` | `0x9b44efca3e2a707b63dc00ce79d646e5e5d24ba5` |
| `optimism`    | alETH   | `0xded3a04612ff12b57317abe38e68026fc9d28114` | `0x2584e8b0616b3e750492c9629a3b27679c410cb9` | `0x91b8657aea26caa8a0e9d6dd4e24727ccf32f822` |
| `optimism`    | alUSD   | `0x930750a3510e703535e943e826aba3c364ffc1de` | `0x693b7594ae0633d9c5574d0da46a040f92f5b281` | `0xaf510a560744880410f0f65e3341a020fbc2ca41` |
| `arbitrumOne` | alETH   | `0xded3a04612ff12b57317abe38e68026fc9d28114` | `0x2584e8b0616b3e750492c9629a3b27679c410cb9` | `0xfe8f223f3d81462f55bf8609897b8cecfa4b195c` |
| `arbitrumOne` | alUSD   | `0x930750a3510e703535e943e826aba3c364ffc1de` | `0x693b7594ae0633d9c5574d0da46a040f92f5b281` | `0xeba62b842081cef5a8184318dc5c4e4aaca9f651` |
| `base`        | alUSDb  | `0xeb380d86eed275c9f2ed77745ab1b2ccf364bf7a` | `0x5b1c7180c630d3b2b6782df70f43ae5ea80425ba` | `0xb8befe5a6941ca4022a52042075ff269c3c67467` |

:::warning
The same address can belong to different contracts on different chains. `0xded3…` is the alETH Alchemist on both Optimism and Arbitrum, and `0x2584…` is the alUSD Transmuter on Ethereum and the alETH Transmuter on Optimism and Arbitrum. Always filter on `chain` as well as the address.
:::

The `alchemistMetadatas` query returns this table from the indexer itself, including the debt token, underlying token, MYT and Transmuter for each Alchemist:

```graphql
{
  alchemistMetadatas {
    items { chain address debttoken underlyingtoken myt transmuter }
  }
}
```

## Data conventions

- **Big numbers are strings** – Every `BigInt` field (`amount`, `totalDebt`, `timestamp`, `blockNumber` and so on) comes back as a decimal string, such as `"4502519585053891865235240"`. Parse it with `BigInt(...)` or a decimal library. `Number(...)` loses precision.
- **Amounts are raw onchain integers** – Divide by `10 ** decimals` for the token in question:
  - Synthetic debt (alETH, alUSD, alUSDb) uses 18 decimals. This covers `totalDebt`, `totalSyntheticsIssued`, `Mint`, `Burn` and `Repay` amounts, and Transmuter stakes.
  - MYT vault shares use 18 decimals. This covers `myttvl`, `Deposit` and `Withdraw` amounts on the Alchemist, and MYT `shares`.
  - Underlying tokens use the token’s own decimals: 18 for WETH, 6 for USDC. This covers `underlyingtvl` and MYT `assets` and `totalAssets`.
- **Addresses are lowercase** – GraphQL filters also accept checksummed addresses. Raw SQL compares text, so lowercase an address before using it in SQL.
- **Timestamps are Unix seconds** – They are block timestamps.
- **Position IDs are per Alchemist** – `recipientId`, `tokenId` and `accountId` all refer to the Alchemist position NFT ID. Each Alchemist numbers its positions separately, so filter by `alchemist` (and `chain`) as well.

## What’s indexed

The indexer has three kinds of table.

### Event tables

Each event table holds one row per onchain event.

| GraphQL query (plural)             | Source event                      | Key fields |
| ---------------------------------- | --------------------------------- | ---------- |
| `alchemistDeposits`                | Alchemist `Deposit`               | `alchemist`, `amount`, `recipientId` |
| `alchemistWithdraws`               | Alchemist `Withdraw`              | `alchemist`, `amount`, `tokenId`, `recipient` |
| `alchemistMints`                   | Alchemist `Mint`                  | `alchemist`, `tokenId`, `amount`, `recipient` |
| `alchemistBurns`                   | Alchemist `Burn`                  | `alchemist`, `sender`, `amount`, `recipientId` |
| `alchemistRepays`                  | Alchemist `Repay`                 | `alchemist`, `sender`, `amount`, `recipientId`, `credit` |
| `alchemistRedemptions`             | Alchemist `Redemption`            | `alchemist`, `amount` |
| `alchemistLiquidateds`             | Alchemist `Liquidated`            | `accountId`, `liquidator`, `amount`, `feeInYield`, `feeInUnderlying` |
| `alchemistBatchLiquidateds`        | Alchemist `BatchLiquidated`       | `liquidator`, `amount`, `feeInYield`, `feeInETH` |
| `alchemistSelfLiquidateds`         | Alchemist `SelfLiquidated`        | `accountId`, `amountLiquidated` |
| `alchemistForceRepays`             | Alchemist `ForceRepay`            | `accountId`, `amount`, `creditToYield`, `protocolFeeTotal` |
| `alchemistDepositCaps`             | Alchemist `DepositCapUpdated`     | `alchemist`, `depositCap` |
| `alchemistV3PositionTransfers`     | Position NFT `Transfer`           | `from`, `to`, `tokenId`, `alchemist` |
| `transmuterPositionCreateds`       | Transmuter `PositionCreated`      | `creator`, `nftId`, `amountStaked`, `transmuter`, `alchemist` |
| `transmuterPositionClaimeds`       | Transmuter `PositionClaimed`      | `claimer`, `amountClaimed`, `amountUnclaimed`, `transmuter` |
| `mytDeposits`                      | MYT `Deposit`                     | `myt`, `sender`, `onBehalf`, `assets`, `shares` |
| `mytWithdraws`                     | MYT `Withdraw`                    | `myt`, `sender`, `receiver`, `onBehalf`, `assets`, `shares` |
| `mytAllocates`                     | MYT `Allocate`                    | `myt`, `adapter`, `assets`, `change` |
| `mytDeallocates`                   | MYT `Deallocate`                  | `myt`, `adapter`, `assets`, `change` |
| `mytAccrueInterests`               | MYT `AccrueInterest`              | `myt`, `previousTotalAssets`, `newTotalAssets`, `performanceFeeShares`, `managementFeeShares` |

Most event tables also include `chain`, `txHash`, `blockNumber` and `timestamp`.

### Snapshot tables

Snapshot tables record contract state at the block of each event, which makes them a ready-made time series for charts.

| GraphQL query (plural)        | Written on                         | Fields |
| ----------------------------- | ---------------------------------- | ------ |
| `alchemistStats`              | Every Alchemist event              | `myttvl`, `underlyingtvl`, `totalDebt`, `totalSyntheticsIssued`, `cumulativeEarmarked`, `unrealizedCumulativeEarmarked`, `globalMinimumCollateralization`, `liquidatorFee`, `protocolFee`, `repaymentFee` |
| `transmuterStats`             | Transmuter position and cap events | `totalLocked`, `totalActiveLocked`, `depositCap`, `timeToTransmute`, `exitFee`, `transmutationFee` |
| `mytTotalAssetsAndSupplys`    | Every MYT event                    | `totalAssets`, `totalSupply` |

:::note
The indexer writes a snapshot only when an event fires, so a quiet vault can have gaps. For current values, take the most recent row for that contract.
:::

### Metadata tables

Each metadata table holds one row per contract.

| GraphQL query (plural) | Fields |
| ---------------------- | ------ |
| `alchemistMetadatas`   | `address`, `debttoken`, `underlyingtoken`, `myt`, `transmuter` |
| `transmuterMetadatas`  | `transmuter`, `alchemist`, `synthetictoken`, `name` |
| `mytMetadatas`         | `address`, `asset` |

Every table also has a singular query, such as `alchemistStat(id: "...")`, that fetches one row by primary key.

## GraphQL basics

Every table has a plural query with this shape:

```graphql
alchemistDeposits(
  where: { ... }            # filters (see below)
  orderBy: "timestamp"      # any column
  orderDirection: "desc"    # "asc" | "desc"
  limit: 100                # max 1000, default 50
  after: "<cursor>"         # or before: "<cursor>"
) {
  items { ... }
  pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
  totalCount
}
```

### Filters

Each column supports exact-match filters plus operator suffixes:

| Suffix                               | Meaning              | Example |
| ------------------------------------ | -------------------- | ------- |
| *(none)*                             | equals               | `chain: "base"` |
| `_not`                               | not equal            | `chain_not: "mainnet"` |
| `_in` / `_not_in`                    | in list              | `chain_in: ["optimism", "arbitrumOne"]` |
| `_gt` / `_gte` / `_lt` / `_lte`      | numeric comparison   | `timestamp_gt: "1790000000"` |
| `_contains` / `_starts_with` / …     | string matching      | `name_contains: "Transmuter"` |

Conditions in the same `where` object are combined with AND. For anything more complex, use `AND: [...]` and `OR: [...]`.

### Pagination

Pass the `endCursor` from one page as `after` in the next request, and repeat until `hasNextPage` is `false`:

```ts
async function fetchAll(chain: string) {
  const rows = [];
  let after: string | null = null;
  do {
    const res = await fetch("https://ponder.alchemix.fi/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `
          query Page($chain: String!, $after: String) {
            alchemistRepays(where: { chain: $chain }, orderBy: "timestamp", limit: 1000, after: $after) {
              items { alchemist sender amount recipientId timestamp }
              pageInfo { hasNextPage endCursor }
            }
          }`,
        variables: { chain, after },
      }),
    });
    const { data } = await res.json();
    rows.push(...data.alchemistRepays.items);
    after = data.alchemistRepays.pageInfo.hasNextPage
      ? data.alchemistRepays.pageInfo.endCursor
      : null;
  } while (after);
  return rows;
}
```

### Indexer sync status

`_meta` reports the latest block the indexer has processed on each chain. A UI can use it to show how fresh the data is:

```graphql
{ _meta { status } }
```

```json
{
  "mainnet":     { "id": 1,     "block": { "number": 26075279,  "timestamp": 1790590367 } },
  "optimism":    { "id": 10,    "block": { "number": 157495801, "timestamp": 1790590379 } },
  "arbitrumOne": { "id": 42161, "block": { "number": 509587009, "timestamp": 1790566809 } },
  "base":        { "id": 8453,  "block": { "number": 51900516,  "timestamp": 1790590379 } }
}
```

## Recipes

### Current state of one Alchemist

```graphql
query AlchemistNow($chain: String!, $alchemist: String!) {
  alchemistStats(
    where: { chain: $chain, alchemist: $alchemist }
    orderBy: "timestamp"
    orderDirection: "desc"
    limit: 1
  ) {
    items {
      totalDebt
      totalSyntheticsIssued
      myttvl
      underlyingtvl
      globalMinimumCollateralization
      timestamp
    }
  }
}
```

```json
{ "chain": "mainnet", "alchemist": "0xeb83112d925268bede86654c13d423a987587e3e" }
```

### TVL and debt history for a chart

```graphql
query History($alchemist: String!, $since: BigInt!) {
  alchemistStats(
    where: { chain: "optimism", alchemist: $alchemist, timestamp_gte: $since }
    orderBy: "timestamp"
    orderDirection: "asc"
    limit: 1000
  ) {
    items { timestamp underlyingtvl totalDebt }
    pageInfo { hasNextPage endCursor }
  }
}
```

The indexer writes one snapshot per event, so the rows arrive at irregular intervals. For a smooth daily chart, bucket rows by day on the client and keep the last row in each bucket.

### Full history of one position

Aliases pull several tables in a single request, up to 10 aliases per query:

```graphql
query Position($alchemist: String!, $id: BigInt!) {
  deposits: alchemistDeposits(where: { alchemist: $alchemist, recipientId: $id }) {
    items { amount txHash timestamp }
  }
  withdraws: alchemistWithdraws(where: { alchemist: $alchemist, tokenId: $id }) {
    items { amount recipient txHash timestamp }
  }
  mints: alchemistMints(where: { alchemist: $alchemist, tokenId: $id }) {
    items { amount recipient txHash timestamp }
  }
  repays: alchemistRepays(where: { alchemist: $alchemist, recipientId: $id }) {
    items { amount credit txHash timestamp }
  }
  burns: alchemistBurns(where: { alchemist: $alchemist, recipientId: $id }) {
    items { amount txHash timestamp }
  }
}
```

```json
{ "alchemist": "0xfa995b6abc387376c3e7de5f6d394ab5b6bee26b", "id": "736" }
```

The Optimism and Arbitrum Alchemists share addresses, so add `chain` to each `where` when the address you query exists on more than one chain.

### Recent liquidation activity across all chains

```graphql
{
  liquidations: alchemistLiquidateds(orderBy: "timestamp", orderDirection: "desc", limit: 10) {
    items { chain alchemist accountId liquidator amount timestamp }
  }
  selfLiquidations: alchemistSelfLiquidateds(orderBy: "timestamp", orderDirection: "desc", limit: 10) {
    items { chain alchemist accountId amountLiquidated timestamp }
  }
  forceRepays: alchemistForceRepays(orderBy: "timestamp", orderDirection: "desc", limit: 10) {
    items { chain alchemist accountId amount timestamp }
  }
}
```

### A wallet’s Transmuter positions

```graphql
query Transmuter($creator: String!) {
  transmuterPositionCreateds(where: { creator: $creator }, orderBy: "timestamp", orderDirection: "desc") {
    items { chain transmuter nftId amountStaked timestamp }
  }
}
```

### MYT share price over time

Share price is `totalAssets / totalSupply`. Shares use 18 decimals and assets use the underlying token’s decimals, so scale the result by the difference (12 places for a USDC vault):

```graphql
{
  mytTotalAssetsAndSupplys(
    where: { chain: "base", myt: "0xb8befe5a6941ca4022a52042075ff269c3c67467" }
    orderBy: "timestamp"
    orderDirection: "desc"
    limit: 100
  ) {
    items { timestamp totalAssets totalSupply }
  }
}
```

## SQL over HTTP

For aggregations, joins, or “latest row per group” queries that GraphQL can’t express, the indexer exposes a read-only SQL endpoint. Query it through Ponder’s client:

```bash
npm install @ponder/client
```

```ts
import { createClient, sql } from "@ponder/client";

const client = createClient("https://ponder.alchemix.fi/sql");

// Latest snapshot for every Alchemist on a chain
const chain = "mainnet";
const rows = await client.db.execute(sql`
  select distinct on (alchemist)
    alchemist,
    total_debt::text     as "totalDebt",
    underlyingtvl::text  as "underlyingTvl",
    timestamp::text
  from "alchemistStat"
  where chain = ${chain}
  order by alchemist, timestamp desc
`);
```

The client sends values interpolated with `${...}` as bound parameters, so they never become part of the SQL string.

**Naming in SQL** – Table names are camelCase and must be double-quoted (`"alchemistStat"`, `"alchemistV3PositionTransfer"`). Column names are snake_case (`total_debt`, `token_id`, `block_number`). Single-word columns such as `chain`, `alchemist` and `timestamp` look the same either way. Columns named after SQL keywords (`"from"`, `"to"`) need quotes. Cast `bigint` and `numeric` columns to `::text` to keep full precision in JSON.

### Positions currently owned by a wallet

The owner of a position NFT is the `to` address of its most recent `Transfer`:

```ts
const owner = "0x0057be07beef5d9b4beb9e2d147906e83d1915c8"; // must be lowercase

const positions = await client.db.execute(sql`
  select * from (
    select distinct on (chain, alchemist, token_id)
      chain, alchemist, token_id::text as "tokenId", "to" as owner
    from "alchemistV3PositionTransfer"
    order by chain, alchemist, token_id, id desc
  ) p
  where owner = ${owner}
`);
// → [{ chain: "arbitrumOne", alchemist: "0x9307…", tokenId: "4", owner: "0x0057…" }, …]
```

A burned position shows `owner = 0x0000000000000000000000000000000000000000`.

### Querying with curl

The client sends a [superjson](https://github.com/flightcontrolhq/superjson)-encoded `{ sql, params }` object as the `sql` query parameter of `GET /sql/db`, so plain HTTP works too:

```bash
curl -sG https://ponder.alchemix.fi/sql/db \
  --data-urlencode 'sql={"json":{"sql":"select chain, count(*)::int as n from \"alchemistDeposit\" group by chain order by n desc","params":[]}}'
```

```json
{ "rows": [
  { "chain": "optimism",    "n": 3129 },
  { "chain": "mainnet",     "n": 3078 },
  { "chain": "arbitrumOne", "n": 1985 },
  { "chain": "base",        "n": 95 }
], "...": "..." }
```

The endpoint accepts `SELECT` statements only and rejects anything else (for example, `DeleteStmt not supported`).

## Limits and caching

The API is public, so every request counts against these limits:

| Limit                         | Value                                  |
| ----------------------------- | -------------------------------------- |
| Rate limit                    | 100 requests per 10 seconds, per IP    |
| GraphQL page size (`limit`)   | 1,000 rows max                         |
| GraphQL aliases per query     | 10                                     |
| GraphQL tokens per query      | 1,000                                  |
| GraphQL depth                 | 25                                     |
| SQL response caching          | `GET /sql/db` responses are edge-cached for ~10 seconds |

- **Rate limit** – A client that exceeds it receives `429 Too Many Requests` with a `Retry-After` header in seconds. Back off for that long, then retry.
- **Query limits** – A GraphQL query that breaks a limit, or asks for more than 1,000 rows, returns the error `"Unexpected error."` (`INTERNAL_SERVER_ERROR`). Reduce `limit` or split the query.
- **POST for data** – Send GraphQL requests as `POST`. A `GET` on `/graphql` returns the playground page.
- **Caching** – The CDN serves identical SQL queries from cache for about 10 seconds, so a dashboard that polls the same query stays cheap. Polling faster than that returns the same cached response.

For heavy backfills or high-frequency workloads, run your own instance of the indexer. The source, with a Dockerfile and Docker Compose setup, is in the [v3-ponder-graph repository](https://github.com/alchemix-finance/v3-ponder-graph).
