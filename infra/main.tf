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
  name                = "cosmosmongo-notes-abz"
  resource_group_name = "notes-abz"
  location            = "uksouth"
  offer_type          = "Standard"
  kind                = "MongoDB"
  public_network_access_enabled = false

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
    type = "Continuous"
    tier = "Continuous30Days"
  }
}

resource "azurerm_private_dns_zone" "cosmos_mongo_dns_zone" {
  name                = "privatelink.mongo.cosmos.azure.com"
  resource_group_name = "notes-abz"
}

resource "azurerm_private_dns_zone_virtual_network_link" "cosmos_mongo_dns_zone_link" {
  name                  = "link-notes-abz"
  resource_group_name   = "notes-abz"
  private_dns_zone_name = azurerm_private_dns_zone.cosmos_mongo_dns_zone.name
  virtual_network_id    = var.vnet_id
}

resource "azurerm_private_endpoint" "cosmos_mongo_pe" {
  name                = "pe-cosmosmongo-notes-abz"
  resource_group_name = "notes-abz"
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