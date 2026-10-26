# Serves components: backend-api, web
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  # Backend config supplied at init time via -backend-config flags (storage account/container/key
  # are resolved per app+environment by DEPLOY, not hardcoded here) — see lib/terraform-apply.ts.
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}


resource "azurerm_cosmosdb_account" "cosmos_mongo" {
  name                = "cosmosmongo-notes-act"
  resource_group_name = "notes-act"
  location            = "uksouth"
  offer_type          = "Standard"
  kind                = "MongoDB"
  public_network_access_enabled = false

  # Pinned, not left to Azure's default. The RU-mode Mongo API serves 3.2/3.6/4.0/4.2, and a current
  # driver against an old wire protocol fails at connect time — after terraform has already spent
  # fifteen minutes. 4.2 is the newest this API offers, so it is the widest driver compatibility
  # available without moving to vCore.
  mongo_server_version = "4.2"

  capabilities {
    name = "EnableServerless"
  }

  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = "uksouth"
    failover_priority = 0
  }

  backup {
    type                = "Periodic"
    interval_in_minutes = 240
    retention_in_hours  = 720  # 30 days
    storage_redundancy  = "Geo"
  }
}

resource "azurerm_private_dns_zone" "cosmos_mongo_dns_zone" {
  name                = "privatelink.mongo.cosmos.azure.com"
  resource_group_name = "notes-act"
}

resource "azurerm_private_dns_zone_virtual_network_link" "cosmos_mongo_dns_zone_link" {
  name                  = "link-notes-act"
  resource_group_name   = "notes-act"
  private_dns_zone_name = azurerm_private_dns_zone.cosmos_mongo_dns_zone.name
  virtual_network_id    = var.vnet_id
}

resource "azurerm_private_endpoint" "cosmos_mongo_pe" {
  name                = "pe-cosmosmongo-notes-act"
  resource_group_name = "notes-act"
  location            = "uksouth"
  subnet_id           = var.subnet_id

  private_service_connection {
    name                           = "cosmos-mongo-privateserviceconnection"
    private_connection_resource_id = azurerm_cosmosdb_account.cosmos_mongo.id
    subresource_names              = ["MongoDB"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "cosmos-mongo-dns-zone-group"
    private_dns_zone_ids = [azurerm_private_dns_zone.cosmos_mongo_dns_zone.id]
  }
}