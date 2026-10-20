
output "cosmos_mongo_connection" {
  value     = azurerm_cosmosdb_account.cosmos_mongo.primary_mongodb_connection_string
  sensitive = true
}