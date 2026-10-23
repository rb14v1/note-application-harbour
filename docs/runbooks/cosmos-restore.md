# Cosmos DB Restore Runbook

**Account:** `cosmosmongo-note-app-lmnp`  
**Resource Group:** `note-app-lmnp`  
**Region:** `uksouth`  
**Backup type:** Continuous (30-day retention, geo-redundant storage)

---

## Overview

Azure Cosmos DB Continuous backup with the `Continuous30Days` tier provides:
- Point-in-time recovery (PITR) to any second within the past 30 days.
- Geo-redundant backup storage (cross-region, separate from the primary data region).
- Automatic, always-on backups — no manual scheduling required.

---

## Prerequisites

- Azure CLI ≥ 2.40 installed and authenticated (`az login`).
- Contributor or CosmosDB Operator role on the resource group `note-app-lmnp`.
- A target resource group for the restored account (can be the same or a different group/subscription).

---

## Restore Procedure

### 1. Identify the restore timestamp

Choose a point in time **within the last 30 days** (UTC, ISO 8601 format):

```
RESTORE_TIMESTAMP="2026-10-22T14:30:00Z"
```

### 2. Retrieve the restorable account instance ID

```bash
az cosmosdb restorable-database-account list \
  --location uksouth \
  --query "[?name=='cosmosmongo-note-app-lmnp'].id" \
  --output tsv
```

Copy the returned `id` value.

### 3. Trigger the restore

```bash
az cosmosdb restore \
  --account-name           cosmosmongo-note-app-lmnp-restored \
  --resource-group         note-app-lmnp \
  --target-resource-group  note-app-lmnp \
  --restore-timestamp      "$RESTORE_TIMESTAMP" \
  --location               uksouth \
  --source-database-account-id <id-from-step-2>
```

The command returns immediately; the restore runs asynchronously.

### 4. Monitor progress

```bash
az cosmosdb show \
  --name cosmosmongo-note-app-lmnp-restored \
  --resource-group note-app-lmnp \
  --query "provisioningState" \
  --output tsv
```

Wait until the output is `Succeeded` (typically 5–30 minutes depending on data size).

### 5. Validate the restored data

1. Connect to the restored account and verify that collections and document counts match expectations for the chosen point in time.
2. Run any application smoke tests against the restored endpoint before promoting it to production.

### 6. Cut over (if replacing the primary)

1. Update the application connection string environment variable / Key Vault secret to point to the restored account.
2. Redeploy or restart the application.
3. Confirm health checks pass.
4. Delete the old account only after confirming the restored account is stable.

---

## Pre-Go-Live Restore Test

Before the application goes live, a restore drill **must** be completed and signed off:

| Step | Action | Owner | Status |
|------|--------|-------|--------|
| 1 | Select a representative restore timestamp | DBA / Lead Engineer | ☐ |
| 2 | Execute restore per steps 2–4 above | DBA / Lead Engineer | ☐ |
| 3 | Validate data integrity on restored account | QA / Lead Engineer | ☐ |
| 4 | Record time-to-restore (target < 2 hours) | DBA | ☐ |
| 5 | Document findings and sign off | Engineering Lead | ☐ |

Record the drill date and outcome in the project's incident/change log before go-live approval.

---

## References

- [Azure Cosmos DB continuous backup and PITR](https://learn.microsoft.com/azure/cosmos-db/continuous-backup-restore-introduction)
- [az cosmosdb restore CLI reference](https://learn.microsoft.com/cli/azure/cosmosdb#az-cosmosdb-restore)
