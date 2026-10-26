# Runbook: Cosmos DB (MongoDB API) Restore Procedure

## Overview

The `cosmosmongo-notes-act` Cosmos DB account is configured with **Periodic** automated backups:

| Setting | Value |
|---|---|
| Backup type | Periodic |
| Backup interval | Every 4 hours (240 minutes) |
| Retention | 30 days (720 hours) |
| Storage redundancy | Geo-redundant (separate Azure region) |

Backups are stored automatically by Azure in a geo-redundant storage account managed by Microsoft, separate from the primary database region (`uksouth`).

---

## Restore Procedure

### Prerequisites

- Azure CLI installed and authenticated (`az login`)
- Contributor or Owner role on the resource group `notes-act`
- Target resource group and Cosmos DB account name for the restore destination

### Steps

1. **Identify the restore point**

   List available backups for the account:
   ```bash
   az cosmosdb restorable-database-account list \
     --name cosmosmongo-notes-act \
     --resource-group notes-act
   ```

   Note the `restorableLocations` and the earliest/latest restore timestamps.

2. **Choose a restore timestamp**

   Select a point-in-time within the last 30 days (ISO 8601 format), e.g.:
   ```
   RESTORE_TIMESTAMP="2026-10-20T12:00:00Z"
   ```

3. **Initiate the restore**

   Restore to a **new** Cosmos DB account (Azure does not support in-place restore for Periodic backups):
   ```bash
   az cosmosdb restore \
     --account-name cosmosmongo-notes-act-restored \
     --resource-group notes-act \
     --target-database-account-name cosmosmongo-notes-act-restored \
     --restore-timestamp "$RESTORE_TIMESTAMP" \
     --location uksouth \
     --source-database-account-name cosmosmongo-notes-act
   ```

4. **Verify the restored data**

   Connect to the restored account and validate collections and document counts match expectations.

5. **Switch application connection string**

   Update the `MONGODB_URI` secret in Azure Key Vault (`kv-note-xyzuv`) to point to the restored account's connection string, then restart the Container App to pick up the new value.

6. **Clean up**

   Once the primary account is recovered or the restored account is confirmed healthy, remove the temporary restored account if no longer needed.

---

## Pre-Go-Live Test

Before go-live, perform a restore drill:

1. Note the current document count in the `notes` collection.
2. Follow steps 1–4 above using a recent backup timestamp.
3. Confirm document count and a sample of documents match.
4. Record the test date, timestamp used, and outcome in the table below.

| Date | Backup Timestamp Used | Outcome | Performed By |
|---|---|---|---|
| _(fill in)_ | _(fill in)_ | _(fill in)_ | _(fill in)_ |

---

## References

- [Azure Cosmos DB periodic backup and restore](https://learn.microsoft.com/en-us/azure/cosmos-db/periodic-backup-restore-introduction)
- [az cosmosdb restore CLI reference](https://learn.microsoft.com/en-us/cli/azure/cosmosdb#az-cosmosdb-restore)
