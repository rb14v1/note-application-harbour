# Cosmos DB Point-in-Time Restore (PITR) Procedure

## Overview

The `cosmosmongo-note-app-ab12` Azure Cosmos DB account is configured with **Continuous (30-day)** backup (`backup.type = "Continuous"`, `backup.tier = "Continuous30Days"`).  This enables point-in-time recovery (PITR) for any timestamp within the last 30 days.  A secondary geo-location (`ukwest`) stores the replica data in a separate region from the primary (`uksouth`), satisfying the cross-region backup requirement.

---

## Prerequisites

| Requirement | Detail |
|---|---|
| Azure CLI | ≥ 2.40 (`az --version`) |
| Permissions | `Contributor` or `Cosmos DB Operator` on the resource group `note-app-ab12` |
| Target resource group | Must exist before restore (create if needed) |

---

## Restore Steps

### 1. Identify the target timestamp

Choose a UTC timestamp in ISO-8601 format that falls within the 30-day retention window, e.g. `2026-10-21T14:30:00Z`.

### 2. Retrieve the current account details

```bash
az cosmosdb show \
  --name cosmosmongo-note-app-ab12 \
  --resource-group note-app-ab12 \
  --query "id" -o tsv
```

### 3. Trigger the point-in-time restore

```bash
RESTORE_TIMESTAMP="2026-10-21T14:30:00Z"   # replace with target timestamp
TARGET_ACCOUNT="cosmosmongo-note-app-ab12-restored"
TARGET_RG="note-app-ab12-restore"

# Create target resource group if it does not exist
az group create --name "$TARGET_RG" --location uksouth

# Restore the account
az cosmosdb restore \
  --target-database-account-name "$TARGET_ACCOUNT" \
  --account-name cosmosmongo-note-app-ab12 \
  --resource-group note-app-ab12 \
  --restore-timestamp "$RESTORE_TIMESTAMP" \
  --location uksouth
```

> **Note:** The restore creates a **new** Cosmos DB account.  It does not overwrite the live account.

### 4. Verify the restored account

```bash
# Wait for provisioning to complete (may take 15–60 minutes)
az cosmosdb show \
  --name "$TARGET_ACCOUNT" \
  --resource-group "$TARGET_RG" \
  --query "provisioningState" -o tsv

# List databases to confirm data integrity
az cosmosdb mongodb database list \
  --account-name "$TARGET_ACCOUNT" \
  --resource-group "$TARGET_RG" -o table
```

### 5. Redirect application traffic (if promoting to production)

1. Update the application's `COSMOS_CONNECTION_STRING` environment variable / Key Vault secret to point to the restored account's connection string.
2. Restart the backend service and confirm health checks pass.
3. When satisfied, delete the original account or keep it for forensics.

---

## Pre-Go-Live Test Record

| Date | Operator | Restore Timestamp Used | Target Account | Outcome |
|---|---|---|---|---|
| *(fill in before go-live)* | | | | |

Run the test against the staging environment and record results in the table above before promoting to production.

---

## References

- [Azure Cosmos DB continuous backup and PITR](https://learn.microsoft.com/en-us/azure/cosmos-db/continuous-backup-restore-introduction)
- [az cosmosdb restore CLI reference](https://learn.microsoft.com/en-us/cli/azure/cosmosdb#az-cosmosdb-restore)
- Terraform resource: `azurerm_cosmosdb_account.cosmos_mongo` in `infra/main.tf`
