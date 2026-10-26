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
  name                = "cosmosmongo-note-xyzuv"
  resource_group_name = "note-xyzuv"
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
}

resource "azurerm_private_dns_zone" "cosmos_mongo_dns_zone" {
  name                = "privatelink.mongo.cosmos.azure.com"
  resource_group_name = "note-xyzuv"
}

resource "azurerm_private_dns_zone_virtual_network_link" "cosmos_mongo_dns_zone_link" {
  name                  = "link-note-xyzuv"
  resource_group_name   = "note-xyzuv"
  private_dns_zone_name = azurerm_private_dns_zone.cosmos_mongo_dns_zone.name
  virtual_network_id    = var.vnet_id
}

resource "azurerm_private_endpoint" "cosmos_mongo_pe" {
  name                = "pe-cosmosmongo-note-xyzuv"
  resource_group_name = "note-xyzuv"
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